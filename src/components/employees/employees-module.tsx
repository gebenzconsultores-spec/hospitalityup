'use client'

import { useState, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import { translations } from '@/lib/i18n'
import {
  mockEmployees,
  mockEmployeeCourses,
  mockOrders,
  mockNPSResponses,
} from '@/lib/mock-data'
import type { Employee } from '@/lib/mock-data'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowLeft,
  Search,
  UserPlus,
  Users,
  AlertTriangle,
  TrendingUp,
  Star,
  ChevronRight,
  Trophy,
  BookOpen,
  ClipboardList,
  MessageSquare,
} from 'lucide-react'

// ---- Helper functions ----

const departmentColors: Record<string, string> = {
  'Alimentos y Bebidas': 'bg-orange-500',
  'Food & Beverage': 'bg-orange-500',
  'Conserjería': 'bg-blue-500',
  'Concierge': 'bg-blue-500',
  'Recepción': 'bg-purple-500',
  'Front Desk': 'bg-purple-500',
  'Ama de Llaves': 'bg-teal-500',
  'Housekeeping': 'bg-teal-500',
  'Bar': 'bg-rose-500',
}

function getDepartmentColor(dept: string, deptEn: string): string {
  return departmentColors[dept] || departmentColors[deptEn] || 'bg-gray-500'
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    case 'onboarding':
      return 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400'
    case 'offboarding':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    case 'inactive':
      return 'bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

function getTurnoverRiskColor(risk: number): string {
  if (risk < 25) return 'text-emerald-600 dark:text-emerald-400'
  if (risk < 50) return 'text-amber-600 dark:text-amber-400'
  if (risk < 75) return 'text-orange-600 dark:text-orange-400'
  return 'text-red-600 dark:text-red-400'
}

function getScoreColor(score: number): string {
  if (score < 40) return 'text-red-600 dark:text-red-400'
  if (score < 70) return 'text-amber-600 dark:text-amber-400'
  return 'text-emerald-600 dark:text-emerald-400'
}

function getScoreRingColor(score: number): string {
  if (score < 40) return 'stroke-red-500'
  if (score < 70) return 'stroke-amber-500'
  return 'stroke-emerald-500'
}

function getScoreBarColor(score: number): string {
  if (score < 40) return '#ef4444'
  if (score < 70) return '#f59e0b'
  return '#10b981'
}

function getTurnoverRiskBarColor(risk: number): string {
  if (risk < 25) return '#10b981'
  if (risk < 50) return '#f59e0b'
  if (risk < 75) return '#f97316'
  return '#ef4444'
}

function ColoredProgressBar({ value, color, className = '' }: { value: number; color: string; className?: string }) {
  return (
    <div
      className={`relative h-1.5 w-full overflow-hidden rounded-full bg-primary/20 ${className}`}
    >
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: color }}
      />
    </div>
  )
}

// ---- Score Circle Component ----

function ScoreCircle({
  score,
  size = 80,
  strokeWidth = 6,
  label,
}: {
  score: number
  size?: number
  strokeWidth?: number
  label?: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="-rotate-90"
          viewBox={`0 0 ${size} ${size}`}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            className="stroke-muted"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            className={getScoreRingColor(score)}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-lg font-bold ${getScoreColor(score)}`}>
            {score.toFixed(score % 1 === 0 ? 0 : 1)}
          </span>
        </div>
      </div>
      {label && (
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
      )}
    </div>
  )
}

// ---- Employee List View ----

function EmployeeListView() {
  const { locale, selectedProperty, setSelectedEmployee, setShowAddEmployee } =
    useAppStore()
  const t = translations[locale].employees
  const tc = translations[locale].common

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')

  // Filter employees by property
  const propertyFilteredEmployees = useMemo(() => {
    if (selectedProperty === 'all') return mockEmployees
    return mockEmployees.filter((e) => e.propertyId === selectedProperty)
  }, [selectedProperty])

  // Get unique departments
  const departments = useMemo(() => {
    const depts = new Set(
      propertyFilteredEmployees.map((e) =>
        locale === 'es' ? e.department : e.departmentEn
      )
    )
    return Array.from(depts).sort()
  }, [propertyFilteredEmployees, locale])

  // Apply all filters
  const filteredEmployees = useMemo(() => {
    return propertyFilteredEmployees.filter((e) => {
      const matchesSearch =
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.positionEn.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus =
        statusFilter === 'all' || e.status === statusFilter
      const matchesDepartment =
        departmentFilter === 'all' ||
        (locale === 'es' ? e.department : e.departmentEn) ===
          departmentFilter
      return matchesSearch && matchesStatus && matchesDepartment
    })
  }, [propertyFilteredEmployees, searchQuery, statusFilter, departmentFilter, locale])

  // Stats
  const stats = useMemo(() => {
    const active = propertyFilteredEmployees.filter(
      (e) => e.status === 'active'
    ).length
    const onboarding = propertyFilteredEmployees.filter(
      (e) => e.status === 'onboarding'
    ).length
    const atRisk = propertyFilteredEmployees.filter(
      (e) => e.turnoverRisk > 50
    ).length
    const avgScore =
      propertyFilteredEmployees.length > 0
        ? propertyFilteredEmployees.reduce(
            (sum, e) => sum + e.overallScore,
            0
          ) / propertyFilteredEmployees.length
        : 0
    return { active, onboarding, atRisk, avgScore }
  }, [propertyFilteredEmployees])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{t.title}</h2>
        <Button onClick={() => setShowAddEmployee(true)} className="gap-2">
          <UserPlus className="size-4" />
          {t.addEmployee}
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={t.filterByStatus} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.allStatuses}</SelectItem>
            <SelectItem value="active">{t.active}</SelectItem>
            <SelectItem value="onboarding">{t.onboarding}</SelectItem>
            <SelectItem value="offboarding">{t.offboarding}</SelectItem>
            <SelectItem value="inactive">{t.inactive}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder={t.filterByDepartment} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.allDepartments}</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="py-4">
          <CardContent className="flex items-center gap-3 px-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <Users className="size-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-xs text-muted-foreground">{t.totalActive}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent className="flex items-center gap-3 px-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/30">
              <TrendingUp className="size-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.onboarding}</p>
              <p className="text-xs text-muted-foreground">{t.onboarding}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent className="flex items-center gap-3 px-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="size-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.atRisk}</p>
              <p className="text-xs text-muted-foreground">{t.atRisk}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent className="flex items-center gap-3 px-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Star className="size-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {stats.avgScore.toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground">{t.avgScore}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredEmployees.map((employee) => (
          <EmployeeCard
            key={employee.id}
            employee={employee}
            locale={locale}
            onSelect={() => setSelectedEmployee(employee.id)}
          />
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="size-12 text-muted-foreground/50" />
          <p className="mt-3 text-lg font-medium text-muted-foreground">
            {tc.noData}
          </p>
        </div>
      )}
    </div>
  )
}

// ---- Employee Card ----

function EmployeeCard({
  employee,
  locale,
  onSelect,
}: {
  employee: Employee
  locale: 'es' | 'en'
  onSelect: () => void
}) {
  const t = translations[locale].employees

  const statusLabel =
    locale === 'es'
      ? t[employee.status as keyof typeof t]
      : t[employee.status as keyof typeof t]

  return (
    <Card className="group transition-shadow hover:shadow-md py-4">
      <CardHeader className="pb-0 pt-0">
        <div className="flex items-start gap-3">
          <Avatar className="size-12 shrink-0">
            <AvatarFallback
              className={`${getDepartmentColor(employee.department, employee.departmentEn)} text-white text-sm font-semibold`}
            >
              {getInitials(employee.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm font-semibold">
                {employee.name}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              {employee.employeeId}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {locale === 'es' ? employee.position : employee.positionEn}
            </p>
            <p className="text-xs text-muted-foreground">
              {locale === 'es' ? employee.department : employee.departmentEn}
            </p>
          </div>
          <Badge
            variant="secondary"
            className={`shrink-0 text-[10px] ${getStatusColor(employee.status)}`}
          >
            {String(statusLabel)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-3">
        {/* Overall Score */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            {t.overallScore}
          </span>
          <div className="flex items-center gap-2">
            <span
              className={`text-lg font-bold ${getScoreColor(employee.overallScore)}`}
            >
              {employee.overallScore.toFixed(1)}
            </span>
            <div
              className="size-3 rounded-full"
              style={{ backgroundColor: getScoreBarColor(employee.overallScore) }}
            />
          </div>
        </div>

        {/* Mini Progress Bars */}
        <div className="space-y-2">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {t.knowledge}
              </span>
              <span className="text-xs font-medium">
                {employee.knowledgeScore}
              </span>
            </div>
            <ColoredProgressBar
              value={employee.knowledgeScore}
              color={getScoreBarColor(employee.knowledgeScore)}
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {t.sales}
              </span>
              <span className="text-xs font-medium">
                {employee.salesScore}
              </span>
            </div>
            <ColoredProgressBar
              value={employee.salesScore}
              color={getScoreBarColor(employee.salesScore)}
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {t.hospitality}
              </span>
              <span className="text-xs font-medium">
                {employee.hospitalityScore}
              </span>
            </div>
            <ColoredProgressBar
              value={employee.hospitalityScore}
              color={getScoreBarColor(employee.hospitalityScore)}
            />
          </div>
        </div>

        {/* Turnover Risk */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            {t.turnoverRisk}
          </span>
          <div className="flex items-center gap-1.5">
            <div
              className="size-2 rounded-full"
              style={{ backgroundColor: getTurnoverRiskBarColor(employee.turnoverRisk) }}
            />
            <span
              className={`text-xs font-semibold ${getTurnoverRiskColor(employee.turnoverRisk)}`}
            >
              {employee.turnoverRisk}%
            </span>
          </div>
        </div>

        {/* View Profile Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-1"
          onClick={onSelect}
        >
          {t.viewProfile}
          <ChevronRight className="size-3" />
        </Button>
      </CardContent>
    </Card>
  )
}

// ---- Employee Detail View ----

function EmployeeDetailView({ employeeId }: { employeeId: string }) {
  const { locale, setSelectedEmployee, selectedProperty } = useAppStore()
  const t = translations[locale].employees
  const tc = translations[locale].common

  const employee = useMemo(
    () => mockEmployees.find((e) => e.id === employeeId),
    [employeeId]
  )

  const employeeCourses = useMemo(
    () => mockEmployeeCourses.filter((ec) => ec.employeeId === employeeId),
    [employeeId]
  )

  const employeeOrders = useMemo(
    () => mockOrders.filter((o) => o.employeeId === employeeId),
    [employeeId]
  )

  const employeeNPS = useMemo(
    () => mockNPSResponses.filter((nps) => nps.employeeId === employeeId),
    [employeeId]
  )

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">{tc.noData}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => setSelectedEmployee(null)}
        >
          {tc.back}
        </Button>
      </div>
    )
  }

  const careerPathSteps =
    locale === 'es'
      ? employee.careerPath.split(' → ')
      : employee.careerPathEn.split(' → ')

  const currentLevelIndex = Math.min(
    employee.careerLevel - 1,
    careerPathSteps.length - 1
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 self-start"
          onClick={() => setSelectedEmployee(null)}
        >
          <ArrowLeft className="size-4" />
          {tc.back}
        </Button>
        <div className="flex flex-1 items-center gap-3">
          <Avatar className="size-12">
            <AvatarFallback
              className={`${getDepartmentColor(employee.department, employee.departmentEn)} text-white font-semibold`}
            >
              {getInitials(employee.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{employee.name}</h2>
              <Badge
                variant="secondary"
                className={`text-[10px] ${getStatusColor(employee.status)}`}
              >
                {String(
                  t[
                    employee.status as keyof typeof t
                  ]
                )}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {employee.employeeId} ·{' '}
              {locale === 'es' ? employee.position : employee.positionEn}
            </p>
          </div>
        </div>
      </div>

      {/* Top Section: Employee Info Card */}
      <Card className="py-4">
        <CardContent className="px-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                {t.property}
              </p>
              <p className="text-sm font-medium">{employee.propertyName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{t.hireDate}</p>
              <p className="text-sm font-medium">{employee.hireDate}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                {t.department}
              </p>
              <p className="text-sm font-medium">
                {locale === 'es' ? employee.department : employee.departmentEn}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                {t.careerLevel}
              </p>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-4 ${
                      i < employee.careerLevel
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-muted text-muted'
                    }`}
                  />
                ))}
                <span className="ml-1 text-sm font-medium">
                  {employee.careerLevel}/5
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Dashboard */}
      <Card className="py-4">
        <CardHeader className="pb-2 pt-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="size-4 text-amber-500" />
            {t.overallScore}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
            <ScoreCircle
              score={employee.knowledgeScore}
              size={90}
              label={t.knowledge}
            />
            <ScoreCircle
              score={employee.salesScore}
              size={90}
              label={t.sales}
            />
            <ScoreCircle
              score={employee.hospitalityScore}
              size={90}
              label={t.hospitality}
            />
            <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4">
              <ScoreCircle
                score={employee.overallScore}
                size={110}
                strokeWidth={8}
              />
              <span className="text-xs font-bold text-primary">
                {t.overallScore}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Career Path */}
      <Card className="py-4">
        <CardHeader className="pb-2 pt-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="size-4 text-primary" />
            {t.careerPath}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-0">
            {careerPathSteps.map((step, i) => (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                      i === currentLevelIndex
                        ? 'bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/30'
                        : i < currentLevelIndex
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step}
                  </div>
                  {i === currentLevelIndex && (
                    <span className="mt-1 text-[10px] font-medium text-primary">
                      {t.currentLevel}
                    </span>
                  )}
                </div>
                {i < careerPathSteps.length - 1 && (
                  <ChevronRight className="mx-1 size-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
          {currentLevelIndex < careerPathSteps.length - 1 && (
            <div className="mt-4 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3">
              <p className="text-xs font-medium text-primary">
                {t.nextLevel}:{' '}
                <span className="font-bold">
                  {careerPathSteps[currentLevelIndex + 1]}
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t.requiredToAdvance}: {locale === 'es' ? 'Completar cursos asignados y mejorar puntuación general' : 'Complete assigned courses and improve overall score'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Training Progress */}
      <Card className="py-4">
        <CardHeader className="pb-2 pt-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="size-4 text-sky-500" />
            {t.trainingProgress}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {employeeCourses.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.noCourses}</p>
          ) : (
            <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
              {employeeCourses.map((ec) => (
                <div
                  key={ec.id}
                  className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-sm font-medium truncate">
                      {locale === 'es'
                        ? ec.courseTitle
                        : ec.courseTitleEn}
                    </p>
                    <div className="flex items-center gap-2">
                      <ColoredProgressBar
                        value={ec.progress}
                        color={
                          ec.status === 'completed'
                            ? '#10b981'
                            : ec.status === 'in_progress'
                              ? '#3b82f6'
                              : '#9ca3af'
                        }
                        className="h-1.5 w-20"
                      />
                      <span className="text-xs text-muted-foreground">
                        {ec.progress}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {ec.score !== undefined && (
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {ec.score}
                      </span>
                    )}
                    <Badge
                      variant="secondary"
                      className={`text-[10px] ${
                        ec.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : ec.status === 'in_progress'
                            ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400'
                      }`}
                    >
                      {ec.status === 'completed'
                        ? translations[locale].training.completed
                        : ec.status === 'in_progress'
                          ? translations[locale].training.inProgress
                          : translations[locale].training.notStarted}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card className="py-4">
        <CardHeader className="pb-2 pt-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="size-4 text-orange-500" />
            {t.recentOrders}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {employeeOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.noOrders}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.service}</TableHead>
                    <TableHead className="text-right">{t.quantity}</TableHead>
                    <TableHead className="text-right">{t.amount}</TableHead>
                    <TableHead className="text-center">
                      {t.upselling}
                    </TableHead>
                    <TableHead className="text-center">
                      {t.satisfaction}
                    </TableHead>
                    <TableHead>{t.date}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.serviceName}
                      </TableCell>
                      <TableCell className="text-right">
                        {order.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        ${order.totalAmount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        {order.isUpselling ? (
                          <Badge
                            variant="secondary"
                            className="bg-amber-100 text-amber-700 text-[10px] dark:bg-amber-900/30 dark:text-amber-400"
                          >
                            {t.upselling}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {order.customerSatisfaction ? (
                          <span className="text-xs font-medium">
                            {order.customerSatisfaction}/10
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(order.orderDate).toLocaleDateString(
                          locale === 'es' ? 'es-MX' : 'en-US'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* NPS History */}
      <Card className="py-4">
        <CardHeader className="pb-2 pt-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="size-4 text-violet-500" />
            {t.npsHistory}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {employeeNPS.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.noNPS}</p>
          ) : (
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {employeeNPS.map((nps) => (
                <div
                  key={nps.id}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <div
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      nps.promoter
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : nps.score >= 7
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                  >
                    {nps.score}
                  </div>
                  <div className="min-w-0 flex-1">
                    {nps.comment && (
                      <p className="text-sm text-foreground">
                        &ldquo;{nps.comment}&rdquo;
                      </p>
                    )}
                    <div className="mt-1 flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-[10px]"
                      >
                        {nps.source}
                      </Badge>
                      {nps.promoter && (
                        <Badge
                          variant="secondary"
                          className="bg-emerald-100 text-emerald-700 text-[10px] dark:bg-emerald-900/30 dark:text-emerald-400"
                        >
                          {t.promoter}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(nps.createdAt).toLocaleDateString(
                          locale === 'es' ? 'es-MX' : 'en-US',
                          {
                            day: 'numeric',
                            month: 'short',
                          }
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ---- Main Module Component ----

export function EmployeesModule() {
  const { selectedEmployee } = useAppStore()

  if (selectedEmployee) {
    return <EmployeeDetailView employeeId={selectedEmployee} />
  }

  return <EmployeeListView />
}
