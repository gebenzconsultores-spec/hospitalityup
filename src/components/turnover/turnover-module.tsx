'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import { translations } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'
import {
  mockTurnoverAlerts,
  mockEmployees,
  mockNotifications,
  type TurnoverAlert,
} from '@/lib/mock-data'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChartContainer } from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import {
  AlertTriangle,
  Bell,
  BellOff,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  User,
  Search,
  DollarSign,
  ShieldAlert,
  Brain,
  Target,
  ArrowRight,
  Users,
  Heart,
  Activity,
  Zap,
  UserPlus,
  GraduationCap,
  FileText,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'

// ---- Types ----
type SeverityLevel = 'low' | 'medium' | 'high' | 'critical'

// ---- Helpers ----
function getSeverityColor(severity: SeverityLevel) {
  switch (severity) {
    case 'low': return { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-300', bar: '#10b981', hex: '#10b981' }
    case 'medium': return { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-300', bar: '#f59e0b', hex: '#f59e0b' }
    case 'high': return { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-300', bar: '#f97316', hex: '#f97316' }
    case 'critical': return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', border: 'border-red-300', bar: '#ef4444', hex: '#ef4444' }
  }
}

function getAlertTypeIcon(type: string) {
  switch (type) {
    case 'stagnation': return <TrendingUp className="size-4" />
    case 'low_nps': return <Activity className="size-4" />
    case 'inactivity': return <Clock className="size-4" />
    case 'low_happiness': return <Heart className="size-4" />
    case 'contract_end': return <FileText className="size-4" />
    default: return <AlertCircle className="size-4" />
  }
}

function getRiskGradient(risk: number) {
  if (risk <= 25) return 'from-emerald-500 to-emerald-400'
  if (risk <= 50) return 'from-amber-500 to-amber-400'
  if (risk <= 75) return 'from-orange-500 to-orange-400'
  return 'from-red-500 to-red-400'
}

function getRiskColor(risk: number) {
  if (risk <= 25) return '#10b981'
  if (risk <= 50) return '#f59e0b'
  if (risk <= 75) return '#f97316'
  return '#ef4444'
}

function getRiskLabel(risk: number, t: typeof translations.es.turnover) {
  if (risk <= 25) return t.severity.low
  if (risk <= 50) return t.severity.medium
  if (risk <= 75) return t.severity.high
  return t.severity.critical
}

function formatDate(dateStr: string, locale: Locale) {
  const d = new Date(dateStr)
  return d.toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ---- Gauge Component ----
function HappinessGauge({ value, label }: { value: number; label: string }) {
  const radius = 60
  const strokeWidth = 12
  const circumference = Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  const color = value >= 75 ? '#10b981' : value >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="160" height="90" viewBox="0 0 160 90">
        {/* Background arc */}
        <path
          d="M 20 80 A 60 60 0 0 1 140 80"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
          strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d="M 20 80 A 60 60 0 0 1 140 80"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${(value / 100) * 188} 188`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease-out' }}
        />
        <text x="80" y="68" textAnchor="middle" className="fill-foreground text-2xl font-bold" style={{ fontSize: '28px' }}>
          {value}
        </text>
        <text x="80" y="84" textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: '11px' }}>
          /100
        </text>
      </svg>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  )
}

// ---- Comparison Progress Bar ----
function ComparisonBar({ label, predecessor, replacement, icon }: {
  label: string
  predecessor: number
  replacement: number
  icon: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-8 text-[10px] text-muted-foreground">Ant.</span>
          <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-teal-500 transition-all duration-700" style={{ width: `${predecessor}%` }} />
          </div>
          <span className="w-8 text-right text-[10px] font-medium">{predecessor}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-8 text-[10px] text-muted-foreground">Nuev.</span>
          <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-amber-500 transition-all duration-700" style={{ width: `${replacement}%` }} />
          </div>
          <span className="w-8 text-right text-[10px] font-medium">{replacement}</span>
        </div>
      </div>
    </div>
  )
}

// ---- Main Component ----
export function TurnoverModule() {
  const { locale } = useAppStore()
  const t = translations[locale].turnover
  const tc = translations[locale].common

  // Alert state
  const [alerts, setAlerts] = useState<TurnoverAlert[]>(mockTurnoverAlerts)
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  // Animated savings counter
  const [displayedSavings, setDisplayedSavings] = useState(0)
  const targetSavings = 4800

  useEffect(() => {
    const duration = 1500
    const steps = 60
    const increment = targetSavings / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= targetSavings) {
        setDisplayedSavings(targetSavings)
        clearInterval(timer)
      } else {
        setDisplayedSavings(Math.round(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [])

  // Computed data
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.isResolved)
  const filteredAlerts = showUnreadOnly
    ? alerts.filter(a => !a.isRead && !a.isResolved)
    : alerts.filter(a => !a.isResolved)

  const avgHappiness = Math.round(
    mockEmployees.reduce((sum, e) => sum + e.happinessIndex, 0) / mockEmployees.length
  )

  // Happiness distribution
  const happinessDistribution = useMemo(() => [
    { range: '0-25', count: mockEmployees.filter(e => e.happinessIndex <= 25).length, color: '#ef4444' },
    { range: '26-50', count: mockEmployees.filter(e => e.happinessIndex > 25 && e.happinessIndex <= 50).length, color: '#f97316' },
    { range: '51-75', count: mockEmployees.filter(e => e.happinessIndex > 50 && e.happinessIndex <= 75).length, color: '#f59e0b' },
    { range: '76-100', count: mockEmployees.filter(e => e.happinessIndex > 75).length, color: '#10b981' },
  ], [])

  // Risk sorted employees
  const riskSortedEmployees = useMemo(() =>
    [...mockEmployees].sort((a, b) => b.turnoverRisk - a.turnoverRisk),
  [])

  // Risk trend mock data
  const riskTrendData = useMemo(() => [
    { month: locale === 'es' ? 'Ago' : 'Aug', avgRisk: 32 },
    { month: locale === 'es' ? 'Sep' : 'Sep', avgRisk: 35 },
    { month: locale === 'es' ? 'Oct' : 'Oct', avgRisk: 38 },
    { month: locale === 'es' ? 'Nov' : 'Nov', avgRisk: 36 },
    { month: locale === 'es' ? 'Dic' : 'Dec', avgRisk: 40 },
    { month: locale === 'es' ? 'Ene' : 'Jan', avgRisk: 37 },
  ], [locale])

  // Savings trend mock data
  const savingsTrendData = useMemo(() => [
    { month: locale === 'es' ? 'Ago' : 'Aug', savings: 2400 },
    { month: locale === 'es' ? 'Sep' : 'Sep', savings: 3200 },
    { month: locale === 'es' ? 'Oct' : 'Oct', savings: 2800 },
    { month: locale === 'es' ? 'Nov' : 'Nov', savings: 3600 },
    { month: locale === 'es' ? 'Dic' : 'Dec', savings: 4200 },
    { month: locale === 'es' ? 'Ene' : 'Jan', savings: 4800 },
  ], [locale])

  // Offboarding notification
  const offboardNotification = mockNotifications.find(n => n.type === 'employee_offboard')
  const offboardEmployee = mockEmployees.find(e => e.employeeId === 'MES-701')

  // Retention actions mock
  const retentionActions = useMemo(() => [
    { id: 1, employeeId: 'emp2', employeeName: 'María García', action: t.retentionBonus, status: 'suggested' as const },
    { id: 2, employeeId: 'emp2', employeeName: 'María García', action: t.levelUpgrade, status: 'in_progress' as const },
    { id: 3, employeeId: 'emp5', employeeName: 'Roberto Sánchez', action: t.scheduleReview, status: 'applied' as const },
    { id: 4, employeeId: 'emp9', employeeName: 'Diego Flores', action: t.careerCounseling, status: 'in_progress' as const },
  ], [t])

  // Handlers
  const markAsRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a))
  }

  const resolveAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isResolved: true } : a))
  }

  // Chart configs
  const happinessChartConfig = {
    count: { label: t.employees, color: '#10b981' },
  }

  const riskTrendChartConfig = {
    avgRisk: { label: t.riskLevel, color: '#f97316' },
  }

  const savingsTrendChartConfig = {
    savings: { label: t.totalSavings, color: '#10b981' },
  }

  return (
    <div className="space-y-4">
      {/* Module Header */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
          <ShieldAlert className="size-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-sm text-muted-foreground">
            {locale === 'es'
              ? 'Monitoreo de rotación, análisis de riesgo y ahorro de costos'
              : 'Turnover monitoring, risk analysis and cost savings'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="alerts" className="gap-1.5">
            <Bell className="size-3.5" />
            {t.alerts}
            {criticalAlerts.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 min-w-5 px-1 text-[10px]">
                {criticalAlerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="risk" className="gap-1.5">
            <Activity className="size-3.5" />
            {t.riskAnalysis}
          </TabsTrigger>
          <TabsTrigger value="savings" className="gap-1.5">
            <DollarSign className="size-3.5" />
            {t.costSavings}
          </TabsTrigger>
        </TabsList>

        {/* ===================== TAB 1: ALERTS ===================== */}
        <TabsContent value="alerts" className="space-y-4">
          {/* Critical Alert Banner */}
          {criticalAlerts.length > 0 && (
            <div className="relative overflow-hidden rounded-xl border-2 border-red-500 bg-red-50 dark:bg-red-950/40 p-4">
              {/* Pulse animation */}
              <div className="absolute inset-0 bg-red-500/10 animate-pulse" />
              <div className="relative flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
                  <AlertTriangle className="size-5 text-red-600 dark:text-red-400 animate-pulse" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-bold text-red-700 dark:text-red-300">
                    {t.criticalAlertBanner}
                  </h3>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {criticalAlerts.length} {t.criticalAlerts}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Filter Bar */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">{t.showFilter}:</span>
              <div className="flex rounded-lg border bg-muted/50 p-0.5">
                <button
                  onClick={() => setShowUnreadOnly(false)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    !showUnreadOnly
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.all}
                </button>
                <button
                  onClick={() => setShowUnreadOnly(true)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    showUnreadOnly
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.unread}
                </button>
              </div>
            </div>
            <Badge variant="outline" className="gap-1">
              <Bell className="size-3" />
              {filteredAlerts.length} {locale === 'es' ? 'alertas' : 'alerts'}
            </Badge>
          </div>

          {/* Alert Cards */}
          <div className="space-y-3 max-h-[calc(100vh-340px)] overflow-y-auto pr-1 custom-scrollbar">
            {filteredAlerts.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <CheckCircle2 className="size-10 text-emerald-500 mb-3" />
                  <p className="text-sm font-medium">
                    {locale === 'es' ? 'No hay alertas pendientes' : 'No pending alerts'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {locale === 'es' ? 'Todo está bajo control' : 'Everything is under control'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredAlerts.map(alert => {
                const severityStyle = getSeverityColor(alert.severity)
                return (
                  <Card
                    key={alert.id}
                    className={`transition-all hover:shadow-md ${
                      alert.isRead ? 'opacity-70' : ''
                    } ${alert.severity === 'critical' ? 'border-red-300 dark:border-red-800' : ''}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        {/* Left: Alert Info */}
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Employee name & position */}
                            <div className="flex items-center gap-2">
                              <div className={`flex size-8 items-center justify-center rounded-full ${severityStyle.bg}`}>
                                <User className={`size-4 ${severityStyle.text}`} />
                              </div>
                              <div>
                                <p className="text-sm font-semibold">{alert.employeeName}</p>
                                <p className="text-xs text-muted-foreground">{alert.employeePosition}</p>
                              </div>
                            </div>
                            {/* Alert type badge */}
                            <Badge variant="outline" className="gap-1 text-xs">
                              {getAlertTypeIcon(alert.type)}
                              {locale === 'es' ? alert.type : alert.typeEn}
                            </Badge>
                            {/* Severity badge */}
                            <Badge
                              className={`text-xs ${severityStyle.bg} ${severityStyle.text} border-0 ${
                                alert.severity === 'critical' ? 'animate-pulse' : ''
                              }`}
                            >
                              {t.severity[alert.severity as SeverityLevel]}
                            </Badge>
                            {alert.isRead && (
                              <Badge variant="secondary" className="text-xs gap-1">
                                <BellOff className="size-3" />
                                {locale === 'es' ? 'Leída' : 'Read'}
                              </Badge>
                            )}
                          </div>

                          {/* Message */}
                          <p className="text-sm text-muted-foreground">
                            {locale === 'es' ? alert.message : alert.messageEn}
                          </p>

                          {/* Probability bar */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-muted-foreground">
                                {t.probability}
                              </span>
                              <span className="text-xs font-bold" style={{ color: severityStyle.hex }}>
                                {alert.probability}%
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                  width: `${alert.probability}%`,
                                  backgroundColor: severityStyle.hex,
                                }}
                              />
                            </div>
                          </div>

                          {/* Date */}
                          <p className="text-xs text-muted-foreground">
                            {formatDate(alert.createdAt, locale)}
                          </p>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                          {!alert.isRead && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={() => markAsRead(alert.id)}
                            >
                              <BellOff className="size-3 mr-1" />
                              {t.markAsRead}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => resolveAlert(alert.id)}
                          >
                            <CheckCircle2 className="size-3 mr-1" />
                            {t.resolve}
                          </Button>
                          {alert.type === 'low_nps' || alert.type === 'low_happiness' || alert.type === 'contract_end' ? (
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-orange-600 hover:bg-orange-700 text-white"
                            >
                              <Search className="size-3 mr-1" />
                              {t.findReplacement}
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </TabsContent>

        {/* ===================== TAB 2: RISK ANALYSIS ===================== */}
        <TabsContent value="risk" className="space-y-4">
          {/* Happiness Index Overview */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Average Happiness Gauge */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Heart className="size-4 text-rose-500" />
                  {t.happinessIndex}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center pb-4">
                <HappinessGauge value={avgHappiness} label={t.averageHappiness} />
                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="size-2.5 rounded-full bg-emerald-500" />
                    {locale === 'es' ? 'Alto' : 'High'} (76-100)
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="size-2.5 rounded-full bg-amber-500" />
                    {locale === 'es' ? 'Medio' : 'Medium'} (51-75)
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="size-2.5 rounded-full bg-red-500" />
                    {locale === 'es' ? 'Bajo' : 'Low'} (0-50)
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Happiness Distribution Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t.happinessDistribution}</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={happinessChartConfig} className="h-[180px] w-full">
                  <BarChart data={happinessDistribution} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {happinessDistribution.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Predictive Insights Card */}
          <Card className="border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Brain className="size-4 text-amber-600 dark:text-amber-400" />
                {t.predictiveInsights}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg bg-background p-3 border">
                <p className="text-sm font-medium">
                  {locale === 'es'
                    ? 'El Mesero ID-402 tiene un 80% de probabilidad de abandonar en los próximos 30 días'
                    : 'Waiter ID-402 has an 80% probability of leaving in the next 30 days'}
                </p>
              </div>

              {/* Risk Factors */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">{t.riskFactors}</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { icon: <TrendingDown className="size-3" />, text: locale === 'es' ? 'Sin cursos en 30 días' : 'No courses in 30 days' },
                    { icon: <Activity className="size-3" />, text: locale === 'es' ? 'NPS bajo consecutivo' : 'Consecutive low NPS' },
                    { icon: <Heart className="size-3" />, text: locale === 'es' ? 'Felicidad laboral en declive' : 'Declining work happiness' },
                  ].map((factor, i) => (
                    <Badge key={i} variant="outline" className="gap-1 text-xs text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700">
                      {factor.icon}
                      {factor.text}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Recommended Actions */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">{t.recommendedActions}</p>
                <div className="space-y-1.5">
                  {[
                    locale === 'es' ? 'Asignar bono de permanencia inmediato' : 'Assign immediate retention bonus',
                    locale === 'es' ? 'Programar sesión de orientación de carrera' : 'Schedule career counseling session',
                    locale === 'es' ? 'Activar ruta de ascenso acelerada' : 'Activate accelerated promotion path',
                  ].map((action, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <ArrowRight className="size-3 text-amber-600 dark:text-amber-400" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Matrix */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="size-4 text-red-500" />
                {t.riskMatrix}
              </CardTitle>
              <CardDescription className="text-xs">
                {locale === 'es'
                  ? 'Empleados ordenados por riesgo de rotación (mayor a menor)'
                  : 'Employees sorted by turnover risk (highest to lowest)'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                {riskSortedEmployees.map(emp => {
                  const riskColor = getRiskColor(emp.turnoverRisk)
                  return (
                    <div
                      key={emp.id}
                      className="rounded-xl border p-3 transition-all hover:shadow-md"
                      style={{ borderLeftWidth: '4px', borderLeftColor: riskColor }}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-semibold">{emp.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {locale === 'es' ? emp.position : emp.positionEn}
                            </p>
                          </div>
                          <div
                            className="flex size-12 items-center justify-center rounded-lg font-bold text-white text-lg"
                            style={{ backgroundColor: riskColor }}
                          >
                            {emp.turnoverRisk}%
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className="size-3" style={{ color: getRiskColor(100 - emp.happinessIndex) }} />
                            {emp.happinessIndex}
                          </span>
                          <span className="flex items-center gap-1">
                            <GraduationCap className="size-3" />
                            {locale === 'es' ? 'Nivel' : 'Level'} {emp.careerLevel}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-[10px]"
                          style={{ color: riskColor, borderColor: riskColor }}
                        >
                          {getRiskLabel(emp.turnoverRisk, t)}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Risk Trend Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="size-4 text-orange-500" />
                {t.riskTrend}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={riskTrendChartConfig} className="h-[200px] w-full">
                <LineChart data={riskTrendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 60]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="avgRisk"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={{ fill: '#f97316', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===================== TAB 3: COST SAVINGS ===================== */}
        <TabsContent value="savings" className="space-y-4">
          {/* Big Savings Counter */}
          <Card className="border-emerald-300 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                  <DollarSign className="size-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-4xl font-bold text-emerald-700 dark:text-emerald-300 tracking-tight">
                    ${displayedSavings.toLocaleString()} USD
                  </p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                    {t.savedThisMonth}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0 text-sm px-3 py-1">
                    <Users className="size-3.5 mr-1.5" />
                    4 {t.employeesRetained}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t.costPerReplacement}: $1,200 USD
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Savings Breakdown + Monthly Trend */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{t.savingsBreakdown}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-2xl font-bold">4</p>
                    <p className="text-[10px] text-muted-foreground">{t.employeesRetainedCount}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-2xl font-bold">$1.2K</p>
                    <p className="text-[10px] text-muted-foreground">{t.avgReplacementCost}</p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-3 border border-emerald-200 dark:border-emerald-800">
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">$4.8K</p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400">{t.totalSavings}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {[
                    { name: 'Juan Pérez', risk: 12, saved: '$1,200' },
                    { name: 'Laura Hernández', risk: 5, saved: '$1,200' },
                    { name: 'Carlos López', risk: 8, saved: '$1,200' },
                    { name: 'Sofía Vargas', risk: 15, saved: '$1,200' },
                  ].map((emp, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-emerald-500" />
                        <span className="text-xs">{emp.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-[10px] border-emerald-300 text-emerald-700 dark:text-emerald-300 dark:border-emerald-700">
                          {locale === 'es' ? 'Retenido' : 'Retained'}
                        </Badge>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{emp.saved}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t.monthlyTrend}</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={savingsTrendChartConfig} className="h-[240px] w-full">
                  <BarChart data={savingsTrendData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value: number) => [`$${value.toLocaleString()}`, t.totalSavings]}
                    />
                    <Bar dataKey="savings" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Departure Notification Section */}
          {offboardNotification && offboardEmployee && (
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-red-700 dark:text-red-400">
                  <AlertTriangle className="size-4" />
                  {t.departureNotifications}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Notification detail */}
                <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
                      <User className="size-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-red-700 dark:text-red-300">
                        {locale === 'es' ? offboardNotification.title : offboardNotification.titleEn}
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {locale === 'es' ? offboardNotification.message : offboardNotification.messageEn}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(offboardNotification.createdAt, locale)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Replacement Tracker */}
                <div className="rounded-xl border p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <UserPlus className="size-4 text-teal-600" />
                      {t.replacementTracker}
                    </h4>
                    <Button size="sm" className="h-7 text-xs bg-teal-600 hover:bg-teal-700 text-white">
                      <GraduationCap className="size-3 mr-1" />
                      {t.trainReplacement}
                    </Button>
                  </div>

                  {/* Predecessor vs Replacement comparison */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Predecessor Metrics */}
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {t.predecessorMetrics} — Patricia Ruiz
                      </p>
                      <ComparisonBar
                        label={t.knowledge}
                        predecessor={55}
                        replacement={20}
                        icon={<GraduationCap className="size-3" />}
                      />
                      <ComparisonBar
                        label={t.upselling}
                        predecessor={42}
                        replacement={10}
                        icon={<DollarSign className="size-3" />}
                      />
                      <ComparisonBar
                        label={t.nps}
                        predecessor={72}
                        replacement={30}
                        icon={<Activity className="size-3" />}
                      />
                      <ComparisonBar
                        label={t.hospitality}
                        predecessor={60}
                        replacement={35}
                        icon={<Heart className="size-3" />}
                      />
                    </div>

                    {/* Replacement Progress Summary */}
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {t.replacementProgress}
                      </p>
                      <div className="space-y-3">
                        {[
                          { label: t.knowledge, current: 20, target: 55 },
                          { label: t.upselling, current: 10, target: 42 },
                          { label: t.nps, current: 30, target: 72 },
                          { label: t.hospitality, current: 35, target: 60 },
                        ].map((item, i) => {
                          const pct = Math.round((item.current / item.target) * 100)
                          return (
                            <div key={i} className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">{item.label}</span>
                                <span className="text-xs font-medium">{pct}%</span>
                              </div>
                              <div className="h-2 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-teal-500 transition-all duration-700"
                                  style={{ width: `${Math.min(pct, 100)}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-[10px] text-muted-foreground">
                                <span>{item.current}</span>
                                <span>→ {item.target}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Retention Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="size-4 text-amber-500" />
                {t.retentionActions}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {retentionActions.map(action => (
                  <div
                    key={action.id}
                    className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex size-8 items-center justify-center rounded-full ${
                        action.status === 'applied'
                          ? 'bg-emerald-100 dark:bg-emerald-900/30'
                          : action.status === 'in_progress'
                          ? 'bg-amber-100 dark:bg-amber-900/30'
                          : 'bg-sky-100 dark:bg-sky-900/30'
                      }`}>
                        {action.status === 'applied' ? (
                          <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                        ) : action.status === 'in_progress' ? (
                          <Clock className="size-4 text-amber-600 dark:text-amber-400" />
                        ) : (
                          <Zap className="size-4 text-sky-600 dark:text-sky-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{action.action}</p>
                        <p className="text-xs text-muted-foreground">{action.employeeName}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        action.status === 'applied'
                          ? 'border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-300'
                          : action.status === 'in_progress'
                          ? 'border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300'
                          : 'border-sky-300 text-sky-700 dark:border-sky-700 dark:text-sky-300'
                      }
                    >
                      {action.status === 'applied'
                        ? t.applied
                        : action.status === 'in_progress'
                        ? t.inProgress
                        : t.suggested}
                    </Badge>
                  </div>
                ))}
              </div>

              {/* Automated Evolution Contracts */}
              <div className="mt-4 rounded-lg border border-dashed p-4 bg-muted/20">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="size-4 text-teal-600" />
                  <p className="text-sm font-semibold">{t.automatedContracts}</p>
                </div>
                <div className="space-y-2">
                  {[
                    {
                      name: 'María García',
                      contract: locale === 'es' ? 'Evolución Mesero Jr. → Mesero Sr.' : 'Evolution Jr. Waiter → Sr. Waiter',
                      date: locale === 'es' ? '15 Feb 2025' : 'Feb 15, 2025',
                    },
                    {
                      name: 'Diego Flores',
                      contract: locale === 'es' ? 'Evolución Rec. Jr. → Recepcionista' : 'Evolution Jr. Rec. → Receptionist',
                      date: locale === 'es' ? '01 Mar 2025' : 'Mar 1, 2025',
                    },
                  ].map((contract, i) => (
                    <div key={i} className="flex items-center justify-between rounded-md bg-background px-3 py-2 border">
                      <div className="flex items-center gap-2">
                        <ChevronRight className="size-3 text-teal-600" />
                        <div>
                          <p className="text-xs font-medium">{contract.name}</p>
                          <p className="text-[10px] text-muted-foreground">{contract.contract}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{contract.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground) / 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.5);
        }
      `}</style>
    </div>
  )
}
