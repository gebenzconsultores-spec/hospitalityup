'use client'

import { useMemo, useState } from 'react'
import {
  UtensilsCrossed,
  TrendingUp,
  Map,
  BedDouble,
  Sparkles,
  ArrowUpRight,
  DollarSign,
  ShoppingBag,
  Receipt,
  Percent,
  Eye,
  Lightbulb,
  MessageCircle,
  BookOpen,
  Headphones,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
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
  mockServices,
  mockOrders,
  mockEmployees,
  monthlySalesData,
  type Service,
} from '@/lib/mock-data'
import { toast } from 'sonner'

// Category color mapping
const categoryColors: Record<string, { bg: string; text: string; badge: string; gradient: string; icon: React.ReactNode }> = {
  menu: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-400',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    gradient: 'from-amber-400 to-amber-600',
    icon: <UtensilsCrossed className="size-6" />,
  },
  upselling: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    gradient: 'from-emerald-400 to-emerald-600',
    icon: <TrendingUp className="size-6" />,
  },
  tour: {
    bg: 'bg-teal-50 dark:bg-teal-950/30',
    text: 'text-teal-700 dark:text-teal-400',
    badge: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
    gradient: 'from-teal-400 to-teal-600',
    icon: <Map className="size-6" />,
  },
  room_upgrade: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    text: 'text-purple-700 dark:text-purple-400',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    gradient: 'from-purple-400 to-purple-600',
    icon: <BedDouble className="size-6" />,
  },
  experience: {
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    text: 'text-rose-700 dark:text-rose-400',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
    gradient: 'from-rose-400 to-rose-600',
    icon: <Sparkles className="size-6" />,
  },
}

// Category label helper
function getCategoryLabel(category: Service['category'], locale: 'es' | 'en'): string {
  const t = translations[locale].menu
  const labels: Record<string, Record<'es' | 'en', string>> = {
    menu: { es: t.menu, en: t.menu },
    upselling: { es: t.upselling, en: t.upselling },
    tour: { es: t.tours, en: t.tours },
    room_upgrade: { es: t.roomUpgrade, en: t.roomUpgrade },
    experience: { es: t.experiences, en: t.experiences },
  }
  return labels[category]?.[locale] ?? category
}

// Format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

// Format date
function formatDate(dateStr: string, locale: 'es' | 'en'): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Satisfaction color
function getSatisfactionColor(score: number): string {
  if (score >= 9) return 'text-emerald-600 dark:text-emerald-400'
  if (score >= 7) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

// Chart configs
const barChartConfig: ChartConfig = {
  revenue: {
    label: 'Upselling Revenue',
    color: '#10b981',
  },
}

const pieChartConfig: ChartConfig = {
  value: {
    label: 'Revenue',
  },
  menu: { label: 'Menu', color: '#f59e0b' },
  upselling: { label: 'Upselling', color: '#10b981' },
  tour: { label: 'Tours', color: '#14b8a6' },
  room_upgrade: { label: 'Room Upgrade', color: '#a855f7' },
  experience: { label: 'Experience', color: '#f43f5e' },
}

const trendChartConfig: ChartConfig = {
  upselling: {
    label: 'Upselling',
    color: '#10b981',
  },
}

// Category filter options
type CategoryFilter = 'all' | 'menu' | 'upselling' | 'tour' | 'room_upgrade' | 'experience'

export function MenuModule() {
  const { locale } = useAppStore()
  const t = translations[locale].menu
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all')

  // Computed stats
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    const todayOrders = mockOrders.filter((o) => o.orderDate.startsWith(today))
    const revenueToday = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0)
    const totalRevenue = mockOrders.reduce((sum, o) => sum + o.totalAmount, 0)
    const avgTicket = mockOrders.length > 0 ? totalRevenue / mockOrders.length : 0
    const upsellingCount = mockOrders.filter((o) => o.isUpselling).length
    const upsellingRate = mockOrders.length > 0 ? (upsellingCount / mockOrders.length) * 100 : 0
    const avgSatisfaction =
      mockOrders.filter((o) => o.customerSatisfaction).length > 0
        ? mockOrders
            .filter((o) => o.customerSatisfaction)
            .reduce((sum, o) => sum + (o.customerSatisfaction ?? 0), 0) /
          mockOrders.filter((o) => o.customerSatisfaction).length
        : 0

    return {
      totalServices: mockServices.length,
      revenueToday,
      avgTicket,
      upsellingRate,
      totalOrders: mockOrders.length,
      totalRevenue,
      upsellingOrders: upsellingCount,
      avgSatisfaction,
    }
  }, [])

  // Filtered services
  const filteredServices = useMemo(() => {
    if (selectedCategory === 'all') return mockServices
    return mockServices.filter((s) => s.category === selectedCategory)
  }, [selectedCategory])

  // Top performers data for bar chart
  const topPerformersData = useMemo(() => {
    const employeeMap: Record<string, { name: string; revenue: number }> = {}
    mockOrders
      .filter((o) => o.isUpselling)
      .forEach((o) => {
        if (!employeeMap[o.employeeId]) {
          employeeMap[o.employeeId] = { name: o.employeeName, revenue: 0 }
        }
        employeeMap[o.employeeId].revenue += o.totalAmount
      })
    return Object.values(employeeMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6)
      .map((e) => ({
        name: e.name.split(' ')[0],
        fullName: e.name,
        revenue: e.revenue,
      }))
  }, [])

  // Upselling by category for pie chart
  const upsellingByCategoryData = useMemo(() => {
    const categoryMap: Record<string, number> = {}
    mockOrders
      .filter((o) => o.isUpselling)
      .forEach((o) => {
        const service = mockServices.find((s) => s.id === o.serviceId)
        const cat = service?.category ?? 'other'
        categoryMap[cat] = (categoryMap[cat] ?? 0) + o.totalAmount
      })
    return Object.entries(categoryMap).map(([category, value]) => ({
      category,
      value,
      fill:
        category === 'menu'
          ? '#f59e0b'
          : category === 'upselling'
            ? '#10b981'
            : category === 'tour'
              ? '#14b8a6'
              : category === 'room_upgrade'
                ? '#a855f7'
                : '#f43f5e',
    }))
  }, [])

  // Category filter buttons
  const categoryFilters: { key: CategoryFilter; label: string; icon?: React.ReactNode }[] = [
    { key: 'all', label: t.allCategories },
    { key: 'menu', label: t.menu, icon: <UtensilsCrossed className="size-3.5" /> },
    { key: 'upselling', label: t.upselling, icon: <TrendingUp className="size-3.5" /> },
    { key: 'tour', label: t.tours, icon: <Map className="size-3.5" /> },
    { key: 'room_upgrade', label: t.roomUpgrade, icon: <BedDouble className="size-3.5" /> },
    { key: 'experience', label: t.experiences, icon: <Sparkles className="size-3.5" /> },
  ]

  // Tips data
  const tips = [
    { icon: <Headphones className="size-5 text-emerald-600 dark:text-emerald-400" />, text: t.tip1 },
    { icon: <Lightbulb className="size-5 text-amber-600 dark:text-amber-400" />, text: t.tip2 },
    { icon: <MessageCircle className="size-5 text-teal-600 dark:text-teal-400" />, text: t.tip3 },
    { icon: <BookOpen className="size-5 text-purple-600 dark:text-purple-400" />, text: t.tip4 },
  ]

  return (
    <div className="space-y-6">
      <Tabs defaultValue="catalog" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="catalog" className="gap-1.5">
            <UtensilsCrossed className="size-4" />
            <span className="hidden sm:inline">{t.serviceCatalog}</span>
            <span className="sm:hidden">{t.serviceCatalog.split(' ')[0]}</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-1.5">
            <ShoppingBag className="size-4" />
            <span className="hidden sm:inline">{t.orderManagement}</span>
            <span className="sm:hidden">{t.orders}</span>
          </TabsTrigger>
          <TabsTrigger value="tracker" className="gap-1.5">
            <TrendingUp className="size-4" />
            <span className="hidden sm:inline">{t.upsellingTracker}</span>
            <span className="sm:hidden">{t.upselling}</span>
          </TabsTrigger>
        </TabsList>

        {/* ==================== TAB 1: Service Catalog ==================== */}
        <TabsContent value="catalog" className="space-y-6">
          {/* Category Filter Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {categoryFilters.map((filter) => (
              <Button
                key={filter.key}
                variant={selectedCategory === filter.key ? 'default' : 'outline'}
                size="sm"
                className="shrink-0 gap-1.5"
                onClick={() => setSelectedCategory(filter.key)}
              >
                {filter.icon}
                {filter.label}
              </Button>
            ))}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30">
                    <UtensilsCrossed className="size-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t.totalServices}</p>
                    <p className="text-2xl font-bold">{stats.totalServices}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                    <DollarSign className="size-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t.revenueToday}</p>
                    <p className="text-2xl font-bold">{formatCurrency(stats.revenueToday)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                    <Receipt className="size-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t.avgTicket}</p>
                    <p className="text-2xl font-bold">{formatCurrency(stats.avgTicket)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/30">
                    <Percent className="size-5 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t.upsellingRate}</p>
                    <p className="text-2xl font-bold">{stats.upsellingRate.toFixed(0)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredServices.map((service) => {
              const colors = categoryColors[service.category] ?? categoryColors.upselling
              return (
                <Card
                  key={service.id}
                  className="group overflow-hidden transition-shadow hover:shadow-lg"
                >
                  {/* Image placeholder with gradient */}
                  <div
                    className={`relative flex h-32 items-center justify-center bg-gradient-to-br ${colors.gradient}`}
                  >
                    <div className="text-white/80">{colors.icon}</div>
                    {/* Category badge */}
                    <div className="absolute left-3 top-3">
                      <Badge className={`${colors.badge} border-0 text-xs font-medium`}>
                        {getCategoryLabel(service.category, locale)}
                      </Badge>
                    </div>
                    {/* Active/Inactive indicator */}
                    <div className="absolute right-3 top-3">
                      <Badge
                        className={`border-0 text-xs font-medium ${
                          service.active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300'
                        }`}
                      >
                        {service.active ? t.active : t.inactive}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    {/* Service name */}
                    <h3 className="mb-1 font-semibold leading-tight">
                      {locale === 'en' ? service.nameEn : service.name}
                    </h3>
                    {/* Description truncated */}
                    <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                      {locale === 'en' ? service.descriptionEn : service.description}
                    </p>
                    {/* Price row */}
                    <div className="flex items-end justify-between">
                      <div className="space-y-0.5">
                        <p className="text-lg font-bold text-teal-700 dark:text-teal-400">
                          {formatCurrency(service.price)}
                        </p>
                        {service.upsellingTarget && (
                          <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                            <ArrowUpRight className="size-3" />
                            <span>
                              {t.upsellingTarget}: {formatCurrency(service.upsellingTarget)}
                            </span>
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        className="gap-1"
                        onClick={() =>
                          toast.success(t.comingSoon)
                        }
                      >
                        <ShoppingBag className="size-3.5" />
                        {t.order}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Empty state */}
          {filteredServices.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <UtensilsCrossed className="mb-3 size-12 opacity-40" />
              <p>{translations[locale].common.noData}</p>
            </div>
          )}
        </TabsContent>

        {/* ==================== TAB 2: Order Management ==================== */}
        <TabsContent value="orders" className="space-y-6">
          {/* New Order Button */}
          <div className="flex justify-end">
            <Button
              className="gap-2"
              onClick={() => toast.info(t.comingSoon)}
            >
              <ShoppingBag className="size-4" />
              {t.newOrder}
            </Button>
          </div>

          {/* Orders Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.employee}</TableHead>
                      <TableHead>{t.serviceName}</TableHead>
                      <TableHead className="text-center">{t.quantity}</TableHead>
                      <TableHead className="text-right">{t.unitPrice}</TableHead>
                      <TableHead className="text-right">{t.total}</TableHead>
                      <TableHead className="text-center">{t.isUpselling}</TableHead>
                      <TableHead className="text-center">{t.satisfaction}</TableHead>
                      <TableHead>{t.date}</TableHead>
                      <TableHead className="text-center">{t.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.employeeName}</TableCell>
                        <TableCell>{order.serviceName}</TableCell>
                        <TableCell className="text-center">{order.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(order.unitPrice)}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(order.totalAmount)}
                        </TableCell>
                        <TableCell className="text-center">
                          {order.isUpselling ? (
                            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-0">
                              {t.upselling}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {order.customerSatisfaction ? (
                            <span className={`font-semibold ${getSatisfactionColor(order.customerSatisfaction)}`}>
                              {order.customerSatisfaction}/10
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(order.orderDate, locale)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1"
                            onClick={() => toast.info(t.comingSoon)}
                          >
                            <Eye className="size-3.5" />
                            <span className="hidden sm:inline">{t.viewDetails}</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow className="bg-muted/50">
                      <TableCell colSpan={2} className="font-semibold">
                        {t.totalOrders}: {stats.totalOrders}
                      </TableCell>
                      <TableCell className="text-center">—</TableCell>
                      <TableCell className="text-right">—</TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(stats.totalRevenue)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-0">
                          {stats.upsellingOrders}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        <span className={getSatisfactionColor(stats.avgSatisfaction)}>
                          {stats.avgSatisfaction.toFixed(1)}
                        </span>
                      </TableCell>
                      <TableCell colSpan={2}></TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== TAB 3: Upselling Tracker ==================== */}
        <TabsContent value="tracker" className="space-y-6">
          {/* Top Performers Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="size-5 text-emerald-600" />
                {t.topPerformers}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={barChartConfig} className="min-h-[300px] w-full">
                <BarChart
                  data={topPerformersData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
                  <YAxis type="category" dataKey="name" width={70} tickLine={false} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => formatCurrency(value as number)}
                      />
                    }
                  />
                  <Bar
                    dataKey="revenue"
                    radius={[0, 6, 6, 0]}
                    fill="var(--color-revenue)"
                  >
                    {topPerformersData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          index === 0
                            ? '#059669'
                            : index === 1
                              ? '#10b981'
                              : index === 2
                                ? '#34d399'
                                : '#6ee7b7'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Pie Chart + Trend Line Chart */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Upselling by Category Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="size-5 text-amber-600" />
                  {t.upsellingByCategory}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={pieChartConfig} className="min-h-[280px] w-full">
                  <PieChart>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => formatCurrency(value as number)}
                          nameKey="category"
                        />
                      }
                    />
                    <Pie
                      data={upsellingByCategoryData}
                      dataKey="value"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={50}
                      paddingAngle={2}
                    >
                      {upsellingByCategoryData.map((entry, index) => (
                        <Cell key={`pie-cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartLegend
                      content={
                        <ChartLegendContent
                          nameKey="category"
                        />
                      }
                    />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Upselling Trend Line Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="size-5 text-teal-600" />
                  {t.upsellingTrend}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={trendChartConfig} className="min-h-[280px] w-full">
                  <LineChart
                    data={monthlySalesData}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => formatCurrency(value as number)}
                        />
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="upselling"
                      stroke="var(--color-upselling)"
                      strokeWidth={3}
                      dot={{ r: 5, fill: 'var(--color-upselling)' }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Upselling Tips Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lightbulb className="size-5 text-amber-500" />
                {t.upsellingTips}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {tips.map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4"
                  >
                    <div className="mt-0.5 shrink-0">{tip.icon}</div>
                    <p className="text-sm leading-relaxed">{tip.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
