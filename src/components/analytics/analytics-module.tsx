'use client'

import { useState, useMemo } from 'react'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  GraduationCap,
  Trophy,
  Medal,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Target,
  BarChart3,
  Users,
  MapPin,
  Crown,
} from 'lucide-react'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ScatterChart,
  Scatter,
  ZAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Tabs,
  TabsContent,
  TabsTrigger,
  TabsList,
} from '@/components/ui/tabs'
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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { useAppStore } from '@/lib/store'
import { translations } from '@/lib/i18n'
import {
  mockEmployees,
  mockProperties,
  trainingCorrelationData,
  propertyComparisonData,
} from '@/lib/mock-data'

// ---- Chart Configs ----
const correlationChartConfig: ChartConfig = {
  avgUpselling: {
    label: 'Upselling Revenue',
    color: '#0d9488',
  },
  avgNPS: {
    label: 'NPS Score',
    color: '#f59e0b',
  },
}

const revenueByPropertyConfig: ChartConfig = {
  revenue: {
    label: 'Revenue',
    color: '#0d9488',
  },
}

const npsVsUpsellingConfig: ChartConfig = {
  x: {
    label: 'NPS',
    color: '#0d9488',
  },
  y: {
    label: 'Upselling',
    color: '#10b981',
  },
}

const propertyRevenueConfig: ChartConfig = {
  revenue: {
    label: 'Revenue',
    color: '#0d9488',
  },
}

const propertyNPSConfig: ChartConfig = {
  nps: {
    label: 'NPS',
    color: '#f59e0b',
  },
}

const propertyTrainingConfig: ChartConfig = {
  trainingCompletion: {
    label: 'Training Completion',
    color: '#0d9488',
  },
}

// ---- Helpers ----
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#10b981'
  if (score >= 60) return '#f59e0b'
  return '#ef4444'
}

function getScoreBgClass(score: number): string {
  if (score >= 80) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
  if (score >= 60) return 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
  return 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
}

function getStatusBadge(status: string, t: typeof translations.es.employees) {
  switch (status) {
    case 'active':
      return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-100">{t.active}</Badge>
    case 'onboarding':
      return <Badge className="bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 hover:bg-sky-100">{t.onboarding}</Badge>
    case 'offboarding':
      return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 hover:bg-amber-100">{t.offboarding}</Badge>
    default:
      return <Badge variant="secondary">{t.inactive}</Badge>
  }
}

function ColoredProgressBar({ value, color, className = '' }: { value: number; color: string; className?: string }) {
  return (
    <div className={`h-2 w-full rounded-full bg-muted ${className}`}>
      <div
        className="h-2 rounded-full transition-all duration-300"
        style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }}
      />
    </div>
  )
}

function getCellColor(value: number, type: 'nps' | 'turnover' | 'training'): string {
  if (type === 'nps') {
    if (value >= 9) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
    if (value >= 8) return 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
    if (value >= 7) return 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
    return 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
  }
  if (type === 'turnover') {
    if (value <= 10) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
    if (value <= 15) return 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
    if (value <= 20) return 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
    return 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
  }
  // training
  if (value >= 85) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
  if (value >= 70) return 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
  if (value >= 50) return 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
  return 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
}

// ---- Main Component ----
export function AnalyticsModule() {
  const { locale, selectedProperty } = useAppStore()
  const t = translations[locale]
  const ta = t.analytics
  const te = t.employees
  const tc = t.common

  const [period, setPeriod] = useState('thisMonth')
  const [propertyFilter, setPropertyFilter] = useState(selectedProperty)

  // Filter employees by property
  const filteredEmployees = useMemo(() => {
    if (propertyFilter === 'all') return mockEmployees
    return mockEmployees.filter((e) => e.propertyId === propertyFilter)
  }, [propertyFilter])

  // Sort employees by overall score
  const rankedEmployees = useMemo(() => {
    return [...filteredEmployees].sort((a, b) => b.overallScore - a.overallScore)
  }, [filteredEmployees])

  // Property-filtered comparison data
  const filteredPropertyData = useMemo(() => {
    if (propertyFilter === 'all') return propertyComparisonData
    return propertyComparisonData.filter((p) => {
      const prop = mockProperties.find((mp) => mp.region === Object.keys(mockProperties.find(() => true) || {}).join(''))
      return true // show all for comparison
    })
  }, [propertyFilter])

  // Count employees per property
  const employeesPerProperty = useMemo(() => {
    const counts: Record<string, number> = {}
    mockEmployees.forEach((e) => {
      counts[e.propertyId] = (counts[e.propertyId] || 0) + 1
    })
    return counts
  }, [])

  // Scatter plot data for NPS vs Upselling
  const scatterData = useMemo(() => {
    return filteredEmployees.map((e) => ({
      x: e.avgNPS,
      y: e.totalUpselling,
      z: e.overallScore,
      name: e.name,
    }))
  }, [filteredEmployees])

  // Property comparison bar chart data
  const propertyBarData = useMemo(() => {
    return propertyComparisonData.map((p) => ({
      ...p,
      name: locale === 'en' ? p.nameEn : p.name,
    }))
  }, [locale])

  // ROI data based on filters (simulated)
  const roiData = useMemo(() => {
    const multipliers: Record<string, number> = {
      thisMonth: 1,
      lastMonth: 0.85,
      thisQuarter: 3.2,
      thisYear: 12.5,
    }
    const m = multipliers[period] || 1
    return {
      investment: Math.round(12500 * m),
      revenue: Math.round(48200 * m),
      roi: 286,
      costPerTraining: 240,
    }
  }, [period])

  const periodOptions = [
    { value: 'thisMonth', label: ta.thisMonth },
    { value: 'lastMonth', label: ta.lastMonth },
    { value: 'thisQuarter', label: ta.thisQuarter },
    { value: 'thisYear', label: ta.thisYear },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{ta.title}</h1>
          <p className="text-sm text-muted-foreground">{ta.valueProposition}</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="size-4" />
          {ta.exportReport}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="roi" className="space-y-6">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="roi" className="gap-1.5">
            <BarChart3 className="size-4" />
            <span className="hidden sm:inline">{ta.roiDashboard}</span>
            <span className="sm:hidden">ROI</span>
          </TabsTrigger>
          <TabsTrigger value="performers" className="gap-1.5">
            <Trophy className="size-4" />
            <span className="hidden sm:inline">{ta.topPerformers}</span>
            <span className="sm:hidden">{locale === 'es' ? 'Top' : 'Top'}</span>
          </TabsTrigger>
          <TabsTrigger value="comparison" className="gap-1.5">
            <Building2 className="size-4" />
            <span className="hidden sm:inline">{ta.multiProperty}</span>
            <span className="sm:hidden">{locale === 'es' ? 'Comp.' : 'Comp.'}</span>
          </TabsTrigger>
        </TabsList>

        {/* ===== TAB 1: ROI Dashboard ===== */}
        <TabsContent value="roi" className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">{ta.filterByProperty}:</span>
              <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{ta.allProperties}</SelectItem>
                  {mockProperties.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {locale === 'en' ? p.nameEn : p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">{ta.filterByPeriod}:</span>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ROI Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Training Investment */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{ta.investmentInTraining}</p>
                    <p className="text-2xl font-bold">${roiData.investment.toLocaleString()} USD</p>
                  </div>
                  <div className="flex size-12 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950">
                    <GraduationCap className="size-6 text-teal-600 dark:text-teal-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Generated */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{ta.revenueGenerated}</p>
                    <p className="text-2xl font-bold">${roiData.revenue.toLocaleString()} USD</p>
                  </div>
                  <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950">
                    <DollarSign className="size-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ROI */}
            <Card className="border-emerald-200 dark:border-emerald-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{ta.roiPercentage}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{roiData.roi}%</p>
                      <div className="flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 dark:bg-emerald-950">
                        <ArrowUpRight className="size-3 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">+24%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950">
                    <TrendingUp className="size-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cost per Training */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{ta.costPerTraining}</p>
                    <p className="text-2xl font-bold">${roiData.costPerTraining} USD</p>
                  </div>
                  <div className="flex size-12 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950">
                    <Target className="size-6 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Correlation Chart: Training vs Sales - KEY CHART */}
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg">{ta.correlation}</CardTitle>
                  <CardDescription>{ta.showingHowTraining}</CardDescription>
                </div>
                <Badge variant="outline" className="w-fit gap-1 text-teal-600 dark:text-teal-400">
                  <TrendingUp className="size-3" />
                  {ta.valueProposition}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={correlationChartConfig} className="min-h-[350px] w-full">
                <ComposedChart data={trainingCorrelationData} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis
                    dataKey="coursesCompleted"
                    label={{ value: ta.coursesCompleted, position: 'insideBottom', offset: -10, className: 'fill-muted-foreground text-xs' }}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="left"
                    label={{ value: ta.avgUpsellingRevenue, angle: -90, position: 'insideLeft', offset: -5, className: 'fill-muted-foreground text-xs' }}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[6, 10]}
                    label={{ value: ta.avgNPSScore, angle: 90, position: 'insideRight', offset: -5, className: 'fill-muted-foreground text-xs' }}
                    tick={{ fontSize: 12 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    yAxisId="left"
                    dataKey="avgUpselling"
                    fill="var(--color-avgUpselling)"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgNPS"
                    stroke="var(--color-avgNPS)"
                    strokeWidth={3}
                    dot={{ r: 5, fill: 'var(--color-avgNPS)', strokeWidth: 2, stroke: '#fff' }}
                  />
                </ComposedChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Revenue by Property */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{ta.revenueByProperty}</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={revenueByPropertyConfig} className="min-h-[300px] w-full">
                <ComposedChart
                  data={propertyBarData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, bottom: 5, left: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" horizontal={false} />
                  <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
                  <ChartTooltip content={<ChartTooltipContent formatter={(value) => `$${Number(value).toLocaleString()}`} />} />
                  <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[0, 4, 4, 0]} barSize={24}>
                    {propertyBarData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill="#0d9488" />
                    ))}
                  </Bar>
                </ComposedChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== TAB 2: Top Performers ===== */}
        <TabsContent value="performers" className="space-y-6">
          {/* Top 3 Podium Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            {rankedEmployees.slice(0, 3).map((emp, idx) => {
              const medalColors = [
                { bg: 'bg-amber-50 dark:bg-amber-950', border: 'border-amber-200 dark:border-amber-800', icon: 'text-amber-500', label: ta.gold, iconComponent: Crown },
                { bg: 'bg-slate-50 dark:bg-slate-950', border: 'border-slate-200 dark:border-slate-700', icon: 'text-slate-400', label: ta.silver, iconComponent: Medal },
                { bg: 'bg-orange-50 dark:bg-orange-950', border: 'border-orange-200 dark:border-orange-800', icon: 'text-orange-600', label: ta.bronze, iconComponent: Medal },
              ][idx]
              const MedalIcon = medalColors.iconComponent
              return (
                <Card key={emp.id} className={`${medalColors.border} relative overflow-hidden`}>
                  <div className={`absolute inset-x-0 top-0 h-1 ${idx === 0 ? 'bg-amber-400' : idx === 1 ? 'bg-slate-400' : 'bg-orange-400'}`} />
                  <CardContent className="p-6">
                    <div className="mb-3 flex items-center justify-between">
                      <Badge className={`${medalColors.bg} ${medalColors.icon} gap-1 border-0 font-semibold`}>
                        <MedalIcon className="size-3.5" />
                        {medalColors.label}
                      </Badge>
                      <span className="text-2xl font-bold text-muted-foreground/30">#{idx + 1}</span>
                    </div>
                    <div className="mb-4 flex items-center gap-3">
                      <Avatar className="size-12 border-2" style={{ borderColor: getScoreColor(emp.overallScore) }}>
                        <AvatarFallback className="text-sm font-bold" style={{ color: getScoreColor(emp.overallScore) }}>
                          {getInitials(emp.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{emp.name}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {locale === 'en' ? emp.positionEn : emp.position}
                        </p>
                      </div>
                    </div>
                    <div className="mb-3 flex items-baseline gap-2">
                      <span className="text-3xl font-bold" style={{ color: getScoreColor(emp.overallScore) }}>
                        {emp.overallScore.toFixed(1)}
                      </span>
                      <span className="text-sm text-muted-foreground">{ta.overallScore}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{ta.knowledge}</span>
                        <span className="font-medium">{emp.knowledgeScore}</span>
                      </div>
                      <ColoredProgressBar value={emp.knowledgeScore} color={getScoreColor(emp.knowledgeScore)} />
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{ta.sales}</span>
                        <span className="font-medium">{emp.salesScore}</span>
                      </div>
                      <ColoredProgressBar value={emp.salesScore} color={getScoreColor(emp.salesScore)} />
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{ta.hospitality}</span>
                        <span className="font-medium">{emp.hospitalityScore}</span>
                      </div>
                      <ColoredProgressBar value={emp.hospitalityScore} color={getScoreColor(emp.hospitalityScore)} />
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{ta.totalUpselling}</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">${emp.totalUpselling.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{ta.avgNPS}</span>
                      <span className="font-semibold">{emp.avgNPS}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{ta.coursesCompletedShort}</span>
                      <span className="font-semibold">{emp.coursesCompleted}</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* NPS vs Upselling Scatter Plot */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{ta.npsVsUpselling}</CardTitle>
              <CardDescription>{ta.scatterPlot}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={npsVsUpsellingConfig} className="min-h-[350px] w-full">
                <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name={ta.nps}
                    domain={[6.5, 10]}
                    label={{ value: ta.avgNPS, position: 'insideBottom', offset: -10, className: 'fill-muted-foreground text-xs' }}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name={ta.totalUpselling}
                    label={{ value: ta.totalUpselling, angle: -90, position: 'insideLeft', offset: -5, className: 'fill-muted-foreground text-xs' }}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
                    tick={{ fontSize: 12 }}
                  />
                  <ZAxis type="number" dataKey="z" range={[80, 400]} />
                  <RechartsTooltip
                    formatter={(value: number, name: string) => {
                      if (name === ta.nps) return [value.toFixed(1), name]
                      return [`$${value.toLocaleString()}`, name]
                    }}
                    labelFormatter={(_, payload) => {
                      if (payload && payload[0]) {
                        const data = payload[0].payload as { name: string }
                        return data.name
                      }
                      return ''
                    }}
                  />
                  <Scatter data={scatterData} fill="#0d9488">
                    {scatterData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getScoreColor(entry.z)}
                        fillOpacity={0.7}
                      />
                    ))}
                    <LabelList dataKey="name" position="top" className="fill-muted-foreground text-[10px]" />
                  </Scatter>
                </ScatterChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Full Ranking Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{ta.topPerformers} - Ranking</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">{ta.rank}</TableHead>
                      <TableHead>{ta.name}</TableHead>
                      <TableHead className="hidden md:table-cell">{ta.position}</TableHead>
                      <TableHead className="hidden lg:table-cell">{ta.property}</TableHead>
                      <TableHead className="text-center">{ta.overallScore}</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        <div className="text-center text-xs">{ta.knowledge}</div>
                      </TableHead>
                      <TableHead className="hidden sm:table-cell">
                        <div className="text-center text-xs">{ta.sales}</div>
                      </TableHead>
                      <TableHead className="hidden sm:table-cell">
                        <div className="text-center text-xs">{ta.hospitality}</div>
                      </TableHead>
                      <TableHead className="text-right hidden md:table-cell">{ta.totalUpselling}</TableHead>
                      <TableHead className="text-right hidden lg:table-cell">{ta.avgNPS}</TableHead>
                      <TableHead className="text-center hidden lg:table-cell">{ta.coursesCompletedShort}</TableHead>
                      <TableHead className="text-center">{ta.status}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rankedEmployees.map((emp, idx) => (
                      <TableRow key={emp.id}>
                        <TableCell className="font-bold text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="size-7" style={{ borderColor: getScoreColor(emp.overallScore) }}>
                              <AvatarFallback className="text-[10px] font-bold" style={{ color: getScoreColor(emp.overallScore) }}>
                                {getInitials(emp.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{emp.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                          {locale === 'en' ? emp.positionEn : emp.position}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                          {emp.propertyName}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={getScoreBgClass(emp.overallScore)}>
                            {emp.overallScore.toFixed(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="w-16">
                            <ColoredProgressBar value={emp.knowledgeScore} color={getScoreColor(emp.knowledgeScore)} />
                            <span className="text-[10px] text-muted-foreground">{emp.knowledgeScore}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="w-16">
                            <ColoredProgressBar value={emp.salesScore} color={getScoreColor(emp.salesScore)} />
                            <span className="text-[10px] text-muted-foreground">{emp.salesScore}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="w-16">
                            <ColoredProgressBar value={emp.hospitalityScore} color={getScoreColor(emp.hospitalityScore)} />
                            <span className="text-[10px] text-muted-foreground">{emp.hospitalityScore}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right hidden md:table-cell font-medium text-emerald-600 dark:text-emerald-400">
                          ${emp.totalUpselling.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right hidden lg:table-cell font-medium">
                          {emp.avgNPS}
                        </TableCell>
                        <TableCell className="text-center hidden lg:table-cell">
                          {emp.coursesCompleted}
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(emp.status, te)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== TAB 3: Multi-Property Comparison ===== */}
        <TabsContent value="comparison" className="space-y-6">
          {/* Property Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{ta.propertyComparison}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{ta.property}</TableHead>
                      <TableHead className="text-right">{ta.revenue}</TableHead>
                      <TableHead className="text-center">{ta.nps}</TableHead>
                      <TableHead className="text-center">{ta.turnoverRate}</TableHead>
                      <TableHead className="text-center">{ta.trainingCompletion}</TableHead>
                      <TableHead className="text-center">{ta.employees}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {propertyComparisonData.map((prop, idx) => {
                      const propertyId = `prop${idx + 1}`
                      const empCount = employeesPerProperty[propertyId] || 0
                      return (
                        <TableRow key={prop.name}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="flex size-8 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950">
                                <Building2 className="size-4 text-teal-600 dark:text-teal-400" />
                              </div>
                              <span>{locale === 'en' ? prop.nameEn : prop.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            ${prop.revenue.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={getCellColor(prop.nps, 'nps')}>
                              {prop.nps}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={getCellColor(prop.turnover, 'turnover')}>
                              {prop.turnover}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={getCellColor(prop.trainingCompletion, 'training')}>
                              {prop.trainingCompletion}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center font-medium">
                            {empCount}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Comparison Bar Charts */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Revenue Comparison */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{ta.revenueComparison}</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={propertyRevenueConfig} className="min-h-[280px] w-full">
                  <ComposedChart data={propertyBarData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                    <ChartTooltip content={<ChartTooltipContent formatter={(value) => `$${Number(value).toLocaleString()}`} />} />
                    <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
                  </ComposedChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* NPS Comparison */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{ta.npsComparison}</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={propertyNPSConfig} className="min-h-[280px] w-full">
                  <ComposedChart data={propertyBarData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[7, 10]} tick={{ fontSize: 11 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="nps" fill="var(--color-nps)" radius={[4, 4, 0, 0]} />
                  </ComposedChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Training Completion Comparison */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{ta.trainingComparison}</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={propertyTrainingConfig} className="min-h-[280px] w-full">
                  <ComposedChart data={propertyBarData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                    <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${value}%`} />} />
                    <Bar dataKey="trainingCompletion" fill="var(--color-trainingCompletion)" radius={[4, 4, 0, 0]} />
                  </ComposedChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Property Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mockProperties.map((prop) => {
              const compData = propertyComparisonData.find((cd) => {
                const propRegion = prop.region
                const regions = ['cancun', 'puebla', 'cdmx', 'playa_carmen', 'los_cabos', 'veracruz']
                const regionIndex = regions.indexOf(propRegion)
                return regionIndex !== -1 && cd.name === propertyComparisonData[regionIndex]?.name
              })
              const propEmployees = mockEmployees.filter((e) => e.propertyId === prop.id)
              const avgScore = propEmployees.length > 0
                ? propEmployees.reduce((sum, e) => sum + e.overallScore, 0) / propEmployees.length
                : 0

              return (
                <Card key={prop.id} className="overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-teal-400 to-emerald-400" />
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950">
                          <Building2 className="size-5 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div>
                          <p className="font-semibold">{locale === 'en' ? prop.nameEn : prop.name}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="size-3" />
                            {prop.location}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {prop.plan}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{ta.keyMetrics}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                            {compData ? `$${(compData.revenue / 1000).toFixed(1)}k` : '-'}
                          </p>
                          <p className="text-[11px] text-muted-foreground">{ta.revenue}</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                          <p className="text-lg font-bold">{compData?.nps || '-'}</p>
                          <p className="text-[11px] text-muted-foreground">{ta.nps}</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                          <p className="text-lg font-bold">{compData ? `${compData.turnover}%` : '-'}</p>
                          <p className="text-[11px] text-muted-foreground">{ta.turnoverRate}</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                          <p className="text-lg font-bold">{compData ? `${compData.trainingCompletion}%` : '-'}</p>
                          <p className="text-[11px] text-muted-foreground">{ta.trainingCompletion}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="size-3.5 text-muted-foreground" />
                          <span className="font-medium">{propEmployees.length}</span>
                          <span className="text-muted-foreground">{ta.employees}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <span className="text-muted-foreground">{ta.overallScore}:</span>
                          <span className="font-semibold" style={{ color: getScoreColor(avgScore) }}>
                            {avgScore.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div className="pt-1">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">{ta.trainingCompletion}</span>
                          <span className="font-medium">{compData?.trainingCompletion || 0}%</span>
                        </div>
                        <Progress value={compData?.trainingCompletion || 0} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
