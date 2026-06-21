'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  BookOpen,
  GraduationCap,
  Calendar,
  Users,
  Trophy,
  TrendingUp,
  Star,
  Clock,
  ChevronRight,
  ArrowRight,
  Zap,
  Monitor,
  MapPin,
  StickyNote,
  CheckCircle2,
  PlayCircle,
  RotateCcw,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/lib/store'
import { translations } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'
import {
  mockCourses,
  mockEmployeeCourses,
  mockCareerPaths,
  mockInstructors,
  mockProperties,
  positionMicroCourses,
} from '@/lib/mock-data'

// ---- Category Color Map ----
const categoryColors: Record<string, string> = {
  upselling: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  hospitality: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
  product_knowledge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  onboarding: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  leadership: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
}

const categoryDotColors: Record<string, string> = {
  upselling: 'bg-emerald-500',
  hospitality: 'bg-teal-500',
  product_knowledge: 'bg-purple-500',
  onboarding: 'bg-sky-500',
  leadership: 'bg-orange-500',
}

const difficultyColors: Record<string, string> = {
  beginner: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  intermediate: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  advanced: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
}

// ---- Helper: Format Duration ----
function formatDuration(minutes: number, locale: Locale): string {
  if (minutes < 60) return `${minutes} min`
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) return `${hrs} ${locale === 'es' ? 'hrs' : 'hrs'}`
  return `${hrs} ${locale === 'es' ? 'hrs' : 'hrs'} ${mins} min`
}

// ---- Stat Card Component ----
function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  color: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${color}`}>
              <Icon className="size-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground truncate">{label}</p>
              <p className="text-2xl font-bold tracking-tight">{value}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ---- Course Card Component ----
function CourseCard({
  course,
  enrollmentStatus,
  locale,
  t,
}: {
  course: (typeof mockCourses)[0]
  enrollmentStatus: 'not_started' | 'in_progress' | 'completed' | null
  locale: Locale
  t: (typeof translations)['es']
}) {
  const title = locale === 'en' ? course.titleEn : course.title
  const description = locale === 'en' ? course.descriptionEn : course.description
  const category = locale === 'en' ? course.categoryEn : course.category
  const difficulty = locale === 'en' ? course.difficultyEn : course.difficulty

  const categoryKey = course.category as keyof typeof t.categories
  const difficultyKey = course.difficulty as keyof typeof t.difficultyLevels

  const actionButton = enrollmentStatus ? (
    enrollmentStatus === 'completed' ? (
      <Button size="sm" variant="outline" className="gap-1.5 text-xs" disabled>
        <CheckCircle2 className="size-3.5" />
        {t.completed}
      </Button>
    ) : enrollmentStatus === 'in_progress' ? (
      <Button size="sm" variant="default" className="gap-1.5 text-xs">
        <RotateCcw className="size-3.5" />
        {t.continueCourse}
      </Button>
    ) : (
      <Button size="sm" variant="default" className="gap-1.5 text-xs">
        <PlayCircle className="size-3.5" />
        {t.startCourse}
      </Button>
    )
  ) : (
    <Button size="sm" variant="default" className="gap-1.5 text-xs">
      <Zap className="size-3.5" />
      {t.enroll}
    </Button>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
      transition={{ duration: 0.25 }}
    >
      <Card className="flex h-full flex-col overflow-hidden">
        <CardContent className="flex flex-1 flex-col gap-3 p-4">
          {/* Category badge + Modality */}
          <div className="flex items-center justify-between gap-2">
            <Badge variant="secondary" className={`text-xs ${categoryColors[course.category] || ''}`}>
              <span className={`mr-1.5 inline-block size-1.5 rounded-full ${categoryDotColors[course.category] || 'bg-gray-400'}`} />
              {t.categories[categoryKey] || category}
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs ${
                course.modality === 'virtual'
                  ? 'border-sky-300 text-sky-700 dark:border-sky-700 dark:text-sky-400'
                  : 'border-orange-300 text-orange-700 dark:border-orange-700 dark:text-orange-400'
              }`}
            >
              {course.modality === 'virtual' ? (
                <Monitor className="mr-1 size-3" />
              ) : (
                <MapPin className="mr-1 size-3" />
              )}
              {course.modality === 'virtual' ? t.virtual : t.inPerson}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold leading-snug line-clamp-2">{title}</h3>

          {/* Description */}
          <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>

          {/* Meta row */}
          <div className="mt-auto flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {formatDuration(course.duration, locale)}
            </span>
            <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${difficultyColors[course.difficulty] || ''}`}>
              {t.difficultyLevels[difficultyKey] || difficulty}
            </Badge>
            <span className="flex items-center gap-1">
              <Trophy className="size-3 text-amber-500" />
              {course.points} {t.points}
            </span>
          </div>

          {/* Enrollment + Completion */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {course.enrollmentCount} {t.enrollments}
              </span>
              <span className="font-medium">{course.completionRate}%</span>
            </div>
            <Progress value={course.completionRate} className="h-1.5" />
          </div>

          {/* Action */}
          <div className="pt-1">{actionButton}</div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ---- Career Path Node ----
function CareerNode({
  levelData,
  isCurrent,
  isLast,
  locale,
  t,
}: {
  levelData: (typeof mockCareerPaths)[0]['levels'][0]
  isCurrent: boolean
  isLast: boolean
  locale: Locale
  t: (typeof translations)['es']
}) {
  const title = locale === 'en' ? levelData.titleEn : levelData.title
  const skillAvg = Math.round(
    (levelData.knowledgeTarget + levelData.salesTarget + levelData.hospitalityTarget) / 3
  )

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: levelData.level * 0.1 }}
        className={`relative rounded-xl border-2 p-4 w-full max-w-[220px] transition-shadow ${
          isCurrent
            ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20'
            : 'border-border bg-card'
        }`}
      >
        {isCurrent && (
          <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] px-2">
            {t.currentLevel}
          </Badge>
        )}
        <div className="space-y-2.5 text-center">
          <div className="flex items-center justify-center gap-1.5">
            <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {levelData.level}
            </span>
            <h4 className="text-sm font-semibold">{title}</h4>
          </div>

          {/* Requirements */}
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>{t.requiredCourses}</span>
              <span className="font-medium text-foreground">{levelData.requiredCourses}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{t.minScore}</span>
              <span className="font-medium text-foreground">{levelData.minScore}%</span>
            </div>
          </div>

          {/* Skill bars */}
          <div className="space-y-1.5">
            <SkillBar label={t.knowledge} value={levelData.knowledgeTarget} color="bg-teal-500" />
            <SkillBar label={t.sales} value={levelData.salesTarget} color="bg-amber-500" />
            <SkillBar label={t.hospitality} value={levelData.hospitalityTarget} color="bg-rose-500" />
          </div>

          <div className="flex items-center justify-center gap-1 text-xs font-medium text-primary">
            <TrendingUp className="size-3" />
            {skillAvg}%
          </div>
        </div>
      </motion.div>

      {/* Connector */}
      {!isLast && (
        <div className="flex flex-col items-center py-1">
          <div className="h-6 w-0.5 bg-primary/30" />
          <ArrowRight className="size-4 -rotate-90 text-primary/50" />
        </div>
      )}
    </div>
  )
}

function SkillBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-2 text-[10px] text-muted-foreground truncate">{label.charAt(0)}</span>
      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[10px] text-muted-foreground w-6 text-right">{value}</span>
    </div>
  )
}

// ---- Radial Skill Chart (CSS-based) ----
function RadialChart({
  knowledge,
  sales,
  hospitality,
  size = 80,
}: {
  knowledge: number
  sales: number
  hospitality: number
  size?: number
}) {
  const r = (size - 12) / 2
  const c = Math.PI * 2 * r
  const offset = (pct: number) => c - (c * pct) / 100

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      {/* Background circles */}
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/30" />
      {/* Knowledge */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="currentColor" strokeWidth="3"
        strokeDasharray={c} strokeDashoffset={offset(knowledge)}
        strokeLinecap="round"
        className="text-teal-500"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  )
}

// ---- Tab 1: Courses ----
function CoursesTab({ locale }: { locale: Locale }) {
  const t = translations[locale].training
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [modalityFilter, setModalityFilter] = useState('all')

  // Compute stats
  const stats = useMemo(() => {
    const totalCourses = mockCourses.length
    const avgCompletion = Math.round(
      mockCourses.reduce((sum, c) => sum + c.completionRate, 0) / totalCourses
    )
    const activeEnrollments = mockEmployeeCourses.filter(
      (ec) => ec.status === 'in_progress'
    ).length
    const totalPoints = mockEmployeeCourses
      .filter((ec) => ec.status === 'completed')
      .reduce((sum, _ec) => {
        const course = mockCourses.find((c) => c.id === _ec.courseId)
        return sum + (course?.points || 0)
      }, 0)
    return { totalCourses, avgCompletion, activeEnrollments, totalPoints }
  }, [])

  // Filter courses
  const filteredCourses = useMemo(() => {
    return mockCourses.filter((course) => {
      const matchesSearch =
        !search ||
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.titleEn.toLowerCase().includes(search.toLowerCase()) ||
        course.description.toLowerCase().includes(search.toLowerCase())
      const matchesCategory =
        categoryFilter === 'all' || course.category === categoryFilter
      const matchesModality =
        modalityFilter === 'all' || course.modality === modalityFilter
      return matchesSearch && matchesCategory && matchesModality
    })
  }, [search, categoryFilter, modalityFilter])

  // Build enrollment lookup
  const enrollmentMap = useMemo(() => {
    const map: Record<string, 'not_started' | 'in_progress' | 'completed'> = {}
    mockEmployeeCourses.forEach((ec) => {
      map[ec.courseId] = ec.status
    })
    return map
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold">{t.courses}</h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t.searchCourses}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-8 w-full sm:w-56"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-9 w-full sm:w-40">
              <SelectValue placeholder={t.allCategories} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.allCategories}</SelectItem>
              <SelectItem value="upselling">{t.categories.upselling}</SelectItem>
              <SelectItem value="hospitality">{t.categories.hospitality}</SelectItem>
              <SelectItem value="product_knowledge">{t.categories.product_knowledge}</SelectItem>
              <SelectItem value="onboarding">{t.categories.onboarding}</SelectItem>
              <SelectItem value="leadership">{t.categories.leadership}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={modalityFilter} onValueChange={setModalityFilter}>
            <SelectTrigger className="h-9 w-full sm:w-36">
              <SelectValue placeholder={t.allModalities} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.allModalities}</SelectItem>
              <SelectItem value="virtual">{t.virtual}</SelectItem>
              <SelectItem value="in_person">{t.inPerson}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={BookOpen}
          label={t.totalCourses}
          value={stats.totalCourses}
          color="bg-teal-600"
        />
        <StatCard
          icon={TrendingUp}
          label={t.completionRate}
          value={`${stats.avgCompletion}%`}
          color="bg-emerald-600"
        />
        <StatCard
          icon={Users}
          label={t.activeEnrollments}
          value={stats.activeEnrollments}
          color="bg-amber-600"
        />
        <StatCard
          icon={Trophy}
          label={t.pointsAwarded}
          value={stats.totalPoints}
          color="bg-purple-600"
        />
      </div>

      {/* Course Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              enrollmentStatus={enrollmentMap[course.id] || null}
              locale={locale}
              t={translations[locale].training}
            />
          ))}
        </AnimatePresence>
      </div>
      {filteredCourses.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          {locale === 'es' ? 'No se encontraron cursos' : 'No courses found'}
        </div>
      )}
    </div>
  )
}

// ---- Tab 2: Career Path ----
function CareerPathTab({ locale }: { locale: Locale }) {
  const t = translations[locale].training
  const [selectedPath, setSelectedPath] = useState(mockCareerPaths[0].id)

  const currentPath = mockCareerPaths.find((p) => p.id === selectedPath)!
  const currentLevel = 2 // simulate employee at level 2

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold">{t.careerProgression}</h2>
        <Select value={selectedPath} onValueChange={setSelectedPath}>
          <SelectTrigger className="h-9 w-full sm:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {mockCareerPaths.map((path) => (
              <SelectItem key={path.id} value={path.id}>
                <span className="mr-1.5">{path.icon}</span>
                {locale === 'en' ? path.departmentEn : path.department}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Career path visualization */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="text-xl">{currentPath.icon}</span>
            {locale === 'en' ? currentPath.departmentEn : currentPath.department}
            <Badge variant="secondary" className="ml-2 text-xs">
              {t.level} {currentLevel}/{currentPath.levels.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-0 py-4">
            {currentPath.levels.map((level, idx) => (
              <CareerNode
                key={level.level}
                levelData={level}
                isCurrent={level.level === currentLevel}
                isLast={idx === currentPath.levels.length - 1}
                locale={locale}
                t={t}
              />
            ))}
          </div>

          {/* Radial skill summary */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-6 border-t pt-4">
            {currentPath.levels.map((level) => {
              const title = locale === 'en' ? level.titleEn : level.title
              const isCurrent = level.level === currentLevel
              return (
                <div
                  key={level.level}
                  className={`flex flex-col items-center gap-1 rounded-lg p-3 transition-colors ${
                    isCurrent ? 'bg-primary/5 ring-1 ring-primary/20' : ''
                  }`}
                >
                  <RadialChart
                    knowledge={level.knowledgeTarget}
                    sales={level.salesTarget}
                    hospitality={level.hospitalityTarget}
                    size={64}
                  />
                  <span className="text-[11px] font-medium text-center">{title}</span>
                  <div className="flex gap-2 text-[10px]">
                    <span className="text-teal-600">{level.knowledgeTarget}</span>
                    <span className="text-amber-600">{level.salesTarget}</span>
                    <span className="text-rose-600">{level.hospitalityTarget}</span>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-teal-500" /> {t.knowledge}</span>
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-amber-500" /> {t.sales}</span>
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-rose-500" /> {t.hospitality}</span>
          </div>
        </CardContent>
      </Card>

      {/* All paths overview */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {mockCareerPaths.map((path) => {
          const deptName = locale === 'en' ? path.departmentEn : path.department
          return (
            <motion.div
              key={path.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`cursor-pointer transition-shadow ${
                  selectedPath === path.id ? 'ring-2 ring-primary shadow-md' : ''
                }`}
                onClick={() => setSelectedPath(path.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{path.icon}</span>
                    <h4 className="text-sm font-semibold">{deptName}</h4>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {path.levels.map((level, idx) => {
                      const lt = locale === 'en' ? level.titleEn : level.title
                      return (
                        <span key={level.level} className="flex items-center text-xs text-muted-foreground">
                          {idx > 0 && <ChevronRight className="size-3 mx-0.5" />}
                          <span className={level.level === 2 ? 'font-semibold text-primary' : ''}>
                            {lt}
                          </span>
                        </span>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ---- Tab 3: Schedule Training ----
function ScheduleTrainingTab({ locale }: { locale: Locale }) {
  const t = translations[locale].training
  const [selectedPosition, setSelectedPosition] = useState('')
  const [topic, setTopic] = useState('')
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [participants, setParticipants] = useState('')
  const [selectedProperty, setSelectedProperty] = useState('')
  const [notes, setNotes] = useState('')

  // Position options
  const positions = [
    { id: 'mesero', label: locale === 'en' ? 'Waiter' : 'Mesero' },
    { id: 'bellboy', label: locale === 'en' ? 'Bellboy' : 'Bellboy' },
    { id: 'recepcionista', label: locale === 'en' ? 'Receptionist' : 'Recepcionista' },
    { id: 'camarista', label: locale === 'en' ? 'Housekeeper' : 'Camarista' },
    { id: 'bartender', label: locale === 'en' ? 'Bartender' : 'Bartender' },
  ]

  // Get micro-courses for selected position
  const microCourses = useMemo(() => {
    if (!selectedPosition) return []
    const mapping = positionMicroCourses[selectedPosition] || []
    return mapping
      .map((m) => {
        const course = mockCourses.find((c) => c.id === m.courseId)
        return course ? { ...course, order: m.order } : null
      })
      .filter(Boolean) as (typeof mockCourses[0] & { order: number })[]
  }, [selectedPosition])

  // Filter instructors by property region
  const filteredInstructors = useMemo(() => {
    if (!selectedProperty) return mockInstructors
    const prop = mockProperties.find((p) => p.id === selectedProperty)
    if (!prop) return mockInstructors
    return mockInstructors.filter((ins) => ins.region === prop.region)
  }, [selectedProperty])

  return (
    <div className="space-y-6">
      {/* Virtual Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Monitor className="size-5 text-sky-600" />
            {t.virtual}{' '}
            <Badge variant="secondary" className="text-xs font-normal">
              {t.saasAutomated}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm mb-1.5 block">{t.selectPosition}</Label>
            <Select value={selectedPosition} onValueChange={setSelectedPosition}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder={t.selectPosition} />
              </SelectTrigger>
              <SelectContent>
                {positions.map((pos) => (
                  <SelectItem key={pos.id} value={pos.id}>
                    {pos.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPosition && microCourses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                <GraduationCap className="size-4 text-primary" />
                {t.skillTree}
              </div>

              <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
                {microCourses.map((course, idx) => {
                  const title = locale === 'en' ? course.titleEn : course.title
                  const catKey = course.category as keyof typeof t.categories
                  return (
                    <div
                      key={course.id}
                      className="flex items-center gap-3 rounded-md bg-background px-3 py-2"
                    >
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {course.order}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatDuration(course.duration, locale)}</span>
                          <span>·</span>
                          <span>{t.categories[catKey]}</span>
                          <span>·</span>
                          <span>{course.points} {t.points}</span>
                        </div>
                      </div>
                      {idx < microCourses.length - 1 && (
                        <ArrowRight className="size-3 text-muted-foreground hidden sm:block" />
                      )}
                    </div>
                  )
                })}
              </div>

              <Button className="gap-2">
                <Zap className="size-4" />
                {t.activatePath}
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* In-Person Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="size-5 text-orange-600" />
            {t.inPerson}{' '}
            <Badge variant="secondary" className="text-xs font-normal">
              {t.onDemand}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Topic */}
            <div className="space-y-1.5">
              <Label className="text-sm">{t.selectTopic}</Label>
              <Select value={topic} onValueChange={setTopic}>
                <SelectTrigger>
                  <SelectValue placeholder={t.selectTopic} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upselling">{t.categories.upselling}</SelectItem>
                  <SelectItem value="hospitality">{t.categories.hospitality}</SelectItem>
                  <SelectItem value="product_knowledge">{t.categories.product_knowledge}</SelectItem>
                  <SelectItem value="onboarding">{t.categories.onboarding}</SelectItem>
                  <SelectItem value="leadership">{t.categories.leadership}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <Label className="text-sm">{t.selectDate}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 size-4" />
                    {date ? date.toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US') : t.selectDate}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={{ before: new Date() }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Participants */}
            <div className="space-y-1.5">
              <Label className="text-sm">{t.participants}</Label>
              <Input
                type="number"
                min={1}
                max={50}
                placeholder="10"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
              />
            </div>

            {/* Property */}
            <div className="space-y-1.5">
              <Label className="text-sm">{t.property}</Label>
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger>
                  <SelectValue placeholder={t.property} />
                </SelectTrigger>
                <SelectContent>
                  {mockProperties.map((prop) => (
                    <SelectItem key={prop.id} value={prop.id}>
                      {locale === 'en' ? prop.nameEn : prop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-sm">{t.notes}</Label>
            <Textarea
              placeholder={t.notesPlaceholder}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Instructors */}
          <div>
            <h4 className="mb-3 text-sm font-medium flex items-center gap-2">
              <Users className="size-4" />
              {t.availableInstructors}
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {filteredInstructors.map((instructor) => (
                <motion.div
                  key={instructor.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className={`overflow-hidden ${!instructor.available ? 'opacity-60' : ''}`}>
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {instructor.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h5 className="text-sm font-semibold truncate">{instructor.name}</h5>
                            {instructor.available ? (
                              <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 shrink-0">
                                {t.available}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[10px] bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 shrink-0">
                                {t.unavailable}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{instructor.specialty}</p>
                          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Star className="size-3 fill-amber-400 text-amber-400" />
                              {instructor.rating}
                            </span>
                            <span className="flex items-center gap-1">
                              <StickyNote className="size-3" />
                              ${instructor.hourlyRate}/{locale === 'es' ? 'hr' : 'hr'}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="size-3" />
                              {instructor.location}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            {filteredInstructors.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {locale === 'es'
                  ? 'No hay instructores disponibles para esta región'
                  : 'No instructors available for this region'}
              </p>
            )}
          </div>

          {/* Confirm button */}
          <Button className="gap-2 w-full sm:w-auto" disabled={!topic || !date || !selectedProperty}>
            <CheckCircle2 className="size-4" />
            {t.confirmBooking}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// ---- Main Training Module ----
export function TrainingModule() {
  const { locale } = useAppStore()
  const t = translations[locale].training

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {locale === 'es'
            ? 'Gestiona cursos, rutas de carrera y programa capacitaciones'
            : 'Manage courses, career paths and schedule trainings'}
        </p>
      </div>

      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="courses" className="gap-1.5">
            <BookOpen className="size-4" />
            <span className="hidden sm:inline">{t.courses}</span>
            <span className="sm:hidden">{t.courses}</span>
          </TabsTrigger>
          <TabsTrigger value="career" className="gap-1.5">
            <GraduationCap className="size-4" />
            <span className="hidden sm:inline">{t.careerPaths}</span>
            <span className="sm:hidden">{t.careerPaths}</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="gap-1.5">
            <Calendar className="size-4" />
            <span className="hidden sm:inline">{t.schedule}</span>
            <span className="sm:hidden">{t.schedule}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses">
          <CoursesTab locale={locale} />
        </TabsContent>

        <TabsContent value="career">
          <CareerPathTab locale={locale} />
        </TabsContent>

        <TabsContent value="schedule">
          <ScheduleTrainingTab locale={locale} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
