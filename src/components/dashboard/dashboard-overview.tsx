'use client'

import { useMemo } from 'react'
import {
  Users,
  Star,
  DollarSign,
  UserX,
  GraduationCap,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BookOpen,
  CalendarCheck,
  UserMinus,
  Bell,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  mockTurnoverAlerts,
  mockNotifications,
  monthlySalesData,
  npsTrendData,
} from '@/lib/mock-data'

// Chart configs
const salesChartConfig: ChartConfig = {
  sales: {
    label: 'Ventas Totales',
    color: '#0d9488',
  },
  upselling: {
    label: 'Upselling',
    color: '#10b981',
  },
}

const npsChartConfig: ChartConfig = {
  nps: {
    label: 'NPS',
    color: '#22c55e',
  },
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    case 'high':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'low':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'employee_offboard':
      return <UserMinus className="size-4 text-red-500" />
    case 'booking_request':
      return <CalendarCheck className="size-4 text-teal-500" />
    case 'alert':
      return <AlertTriangle className="size-4 text-amber-500" />
    case 'course_completed':
      return <BookOpen className="size-4 text-emerald-500" />
    default:
      return <Bell className="size-4 text-muted-foreground" />
  }
}

function formatTimeAgo(dateStr: string, locale: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) {
    return locale === 'es' ? `hace ${diffDays}d` : `${diffDays}d ago`
  }
  if (diffHours > 0) {
    return locale === 'es' ? `hace ${diffHours}h` : `${diffHours}h ago`
  }
  return locale === 'es' ? 'ahora' : 'now'
}

export function DashboardOverview() {
  const { locale } = useAppStore()
  const t = translations[locale].dashboard
  const tTurnover = translations[locale].turnover
  const tEmployees = translations[locale].employees

  // Derived data
  const activeEmployees = useMemo(
    () => mockEmployees.filter((e) => e.status === 'active').length,
    []
  )

  const topPerformers = useMemo(
    () =>
      [...mockEmployees]
        .sort((a, b) => b.overallScore - a.overallScore)
        .slice(0, 3),
    []
  )

  const unreadAlerts = useMemo(
    () => mockTurnoverAlerts.filter((a) => !a.isRead).slice(0, 3),
    []
  )

  const recentNotifications = useMemo(
    () => mockNotifications.slice(0, 4),
    []
  )

  const totalCoursesCompleted = useMemo(
    () => mockEmployees.reduce((sum, e) => sum + e.coursesCompleted, 0),
    []
  )

  // Update chart config labels based on locale
  const localizedSalesChartConfig: ChartConfig = useMemo(
    () => ({
      sales: {
        label: t.totalSales,
        color: '#0d9488',
      },
      upselling: {
        label: t.upsellingRevenue,
        color: '#10b981',
      },
    }),
    [t.totalSales, t.upsellingRevenue]
  )

  const localizedNpsChartConfig: ChartConfig = useMemo(
    () => ({
      nps: {
        label: t.npsScore,
        color: '#22c55e',
      },
    }),
    [t.npsScore]
  )

  // Metric cards data
  const metrics = [
    {
      title: t.totalEmployees,
      value: activeEmployees.toString(),
      icon: Users,
      iconBg: 'bg-teal-100 dark:bg-teal-900/30',
      iconColor: 'text-teal-600 dark:text-teal-400',
      trend: '+5%',
      trendUp: true,
    },
    {
      title: t.avgNPS,
      value: '8.7',
      icon: Star,
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      trend: '+0.4',
      trendUp: true,
    },
    {
      title: t.upsellingRevenue,
      value: '$24,340 USD',
      icon: DollarSign,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      trend: '+18%',
      trendUp: true,
    },
    {
      title: t.turnoverRate,
      value: '12%',
      icon: UserX,
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      trend: '-3%',
      trendUp: false,
    },
    {
      title: t.trainingCompletion,
      value: totalCoursesCompleted.toString(),
      icon: GraduationCap,
      iconBg: 'bg-teal-100 dark:bg-teal-900/30',
      iconColor: 'text-teal-600 dark:text-teal-400',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: t.costSavings,
      value: '$4,800 USD',
      icon: PiggyBank,
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      trend: '+22%',
      trendUp: true,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Metrics Cards Row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {metrics.map((metric) => (
          <Card key={metric.title} className="py-4">
            <CardContent className="flex flex-col gap-3 px-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${metric.iconBg}`}
                >
                  <metric.icon className={`size-4 ${metric.iconColor}`} />
                </div>
                <span className="text-xs font-medium text-muted-foreground leading-tight">
                  {metric.title}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xl font-bold tracking-tight">
                  {metric.value}
                </span>
                <span className="flex items-center gap-1 text-xs">
                  {metric.trendUp ? (
                    <TrendingUp className="size-3 text-emerald-500" />
                  ) : (
                    <TrendingDown className="size-3 text-emerald-500" />
                  )}
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    {metric.trend}
                  </span>
                  <span className="text-muted-foreground">
                    {t.fromLastMonth}
                  </span>
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Sales & Upselling Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t.salesTrend}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={localizedSalesChartConfig}
              className="h-[280px] w-full"
            >
              <AreaChart
                data={monthlySalesData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient
                    id="fillUpselling"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value: number) =>
                    `$${(value / 1000).toFixed(0)}k`
                  }
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => {
                        const num = Number(value)
                        return `$${num.toLocaleString()}`
                      }}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#0d9488"
                  strokeWidth={2}
                  fill="url(#fillSales)"
                />
                <Area
                  type="monotone"
                  dataKey="upselling"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#fillUpselling)"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* NPS Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t.npsTrend}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={localizedNpsChartConfig}
              className="h-[280px] w-full"
            >
              <LineChart
                data={npsTrendData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  domain={[6, 10]}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="nps"
                  stroke="#22c55e"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#22c55e' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Top Performers */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t.topPerformers}</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300">
                {t.viewAll}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {topPerformers.map((employee, index) => (
              <div key={employee.id} className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-teal-100 text-teal-700 text-xs font-semibold dark:bg-teal-900/40 dark:text-teal-300">
                      {getInitials(employee.name)}
                    </AvatarFallback>
                  </Avatar>
                  {index < 3 && (
                    <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-amber-900">
                      {index + 1}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium truncate">
                      {employee.name}
                    </span>
                    <Badge
                      variant="secondary"
                      className="shrink-0 bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 text-xs"
                    >
                      {employee.overallScore}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {locale === 'es'
                      ? employee.position
                      : employee.positionEn}
                  </p>
                  <Progress
                    value={employee.overallScore}
                    className="mt-1.5 h-1.5 bg-teal-100 dark:bg-teal-900/30 [&>[data-slot=progress-indicator]]:bg-teal-500"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Alerts Overview */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t.alertsOverview}</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300">
                {t.viewAllFem}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {unreadAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <Badge
                  className={`shrink-0 text-[10px] px-1.5 py-0.5 ${getSeverityColor(alert.severity)}`}
                  variant="outline"
                >
                  {tTurnover.severity[alert.severity as keyof typeof tTurnover.severity]}
                </Badge>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {alert.employeeName}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {locale === 'es' ? alert.message : alert.messageEn}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t.recentActivity}</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300">
                {t.viewAllFem}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentNotifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
              >
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {locale === 'es'
                      ? notification.title
                      : notification.titleEn}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {locale === 'es'
                      ? notification.message
                      : notification.messageEn}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {formatTimeAgo(notification.createdAt, locale)}
                  </p>
                </div>
                {!notification.isRead && (
                  <span className="mt-1 size-2 shrink-0 rounded-full bg-teal-500" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
