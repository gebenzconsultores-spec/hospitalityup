'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  DollarSign,
  Star,
  UserX,
  AlertTriangle,
  GraduationCap,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  Bot,
  Users,
  ArrowRight,
  Calendar,
  MapPin,
  Monitor,
} from 'lucide-react'
import {
  Bar,
  Line,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { toast } from 'sonner'

// ─── Types ───────────────────────────────────────────────────
interface DashboardData {
  totalEmpleados: number
  empleadosActivos: number
  npsPromedio: number
  totalUpselling: number
  tasaRotacion: number
  riesgoCritico: number
  riesgoAlto: number
  cursosCompletados: number
  cursosEnProgreso: number
  ahorroEstimado: number
  alertasPendientes: number
  montoUpsellingTotal: number
  montoTotalVentas: number
  totalVentas: number
  ventasUpselling: number
  puntuacionTotalProm: number
  topPerformers: TopPerformer[]
  empleadosRiesgo: EmpleadoRiesgo[]
}

interface TopPerformer {
  id: string
  empleadoId: string
  nombre: string
  posicion: string
  departamento: string
  puntuacionTotal: number
  npsPromedio: number
  totalUpselling: number
  indiceFelicidad: number
  foto: string | null
  propiedad: { nombre: string; region: string }
}

interface EmpleadoRiesgo {
  id: string
  empleadoId: string
  nombre: string
  posicion: string
  departamento: string
  riesgoBaja: number
  nivelRiesgoBaja: string
  indiceFelicidad: number
  npsPromedio: number
  foto: string | null
  propiedad: { nombre: string; region: string }
}

interface AlertaRiesgo {
  id: string
  empleadoId: string
  tipo: string
  severidad: string
  mensaje: string
  probabilidad: number
  generadoPorIA: boolean
  leida: boolean
  resuelta: boolean
  empleado: {
    id: string
    nombre: string
    empleadoId: string
    posicion: string
    foto: string | null
    departamento: string
    riesgoBaja: number
    indiceFelicidad: number
    propiedad: { nombre: string; region: string }
  }
  propiedad: { nombre: string; region: string } | null
  createdAt: string
}

interface Candidato {
  id: string
  nombre: string
  email: string | null
  telefono: string | null
  posicion: string
  posicionEn: string | null
  region: string
  experiencia: number
  habilidades: string | null
  estado: string
  puntuacionEntrevista: number | null
  notas: string | null
  fuente: string
  propiedad: { nombre: string; region: string } | null
}

interface CapacitacionItem {
  id: string
  titulo: string
  tituloEn: string | null
  categoria: string
  modalidad: string
}

// ─── Helpers ─────────────────────────────────────────────────
function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function getNpsColor(nps: number): string {
  if (nps >= 9) return 'text-emerald-600 dark:text-emerald-400'
  if (nps >= 7) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

function getNpsBg(nps: number): string {
  if (nps >= 9) return 'bg-emerald-100 dark:bg-emerald-900/30'
  if (nps >= 7) return 'bg-amber-100 dark:bg-amber-900/30'
  return 'bg-red-100 dark:bg-red-900/30'
}

function getSeverityColor(severity: string): { bg: string; text: string; border: string } {
  switch (severity) {
    case 'critico':
      return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800' }
    case 'alto':
      return { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' }
    case 'medio':
      return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800' }
    default:
      return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', border: 'border-green-200 dark:border-green-800' }
  }
}

function getRiskBadgeColor(level: string): string {
  switch (level) {
    case 'critico': return 'bg-red-500 text-white'
    case 'alto': return 'bg-amber-500 text-white'
    case 'medio': return 'bg-yellow-500 text-white'
    default: return 'bg-green-500 text-white'
  }
}

// ─── Chart Configs ───────────────────────────────────────────
const upsellingVsTrainingConfig: ChartConfig = {
  cursos: { label: 'Cursos Completados', color: '#0d9488' },
  upselling: { label: 'Upselling ($)', color: '#10b981' },
  tendencia: { label: 'Tendencia', color: '#f59e0b' },
}

const npsTrendConfig: ChartConfig = {
  nps: { label: 'NPS', color: '#22c55e' },
}

const topPerformersChartConfig: ChartConfig = {
  score: { label: 'Score', color: '#0d9488' },
}

// ─── Main Component ──────────────────────────────────────────
export function DashboardGerencial() {
  const { locale, selectedProperty, userRole, userPropiedadId } = useAppStore()
  const t = translations[locale].dashboard
  const tc = translations[locale].common

  // For empresa role, lock to their propiedad
  const isEmpresa = userRole === 'empresa' && userPropiedadId
  const effectivePropiedadId = isEmpresa ? userPropiedadId : (selectedProperty !== 'all' ? selectedProperty : null)

  const [data, setData] = useState<DashboardData | null>(null)
  const [alertas, setAlertas] = useState<AlertaRiesgo[]>([])
  const [candidatos, setCandidatos] = useState<Candidato[]>([])
  const [capacitaciones, setCapacitaciones] = useState<CapacitacionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showCapacitacionDialog, setShowCapacitacionDialog] = useState(false)
  const [showReemplazoDialog, setShowReemplazoDialog] = useState(false)
  const [reemplazoEmpleado, setReemplazoEmpleado] = useState<AlertaRiesgo | null>(null)
  const [propiedades, setPropiedades] = useState<{ id: string; nombre: string }[]>([])

  // Capacitacion form state
  const [capForm, setCapForm] = useState({
    modalidad: 'presencial',
    capacitacionId: '',
    fechaSolicitada: '',
    participantes: '1',
    propiedadId: '',
    notas: '',
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      // For empresa, always filter by their propiedad
      const propParam = effectivePropiedadId ? `?propiedadId=${effectivePropiedadId}` : ''
      const [dashRes, alertasRes, capRes, propRes] = await Promise.all([
        fetch(`/api/dashboard${propParam}`),
        fetch(`/api/alertas${propParam ? propParam + '&' : '?'}resuelta=false&limit=10`),
        fetch(`/api/capacitaciones${propParam}`),
        fetch(`/api/propiedades`),
      ])
      const dashData = await dashRes.json()
      const alertasData = await alertasRes.json()
      const capData = await capRes.json()
      const propData = await propRes.json()

      setData(dashData)
      setAlertas(alertasData.alertas || [])
      setCapacitaciones(Array.isArray(capData) ? capData : [])
      // For empresa, filter propiedades to only their own
      const props = Array.isArray(propData) ? propData : []
      const filteredProps = isEmpresa ? props.filter(p => p.id === userPropiedadId) : props
      setPropiedades(filteredProps.map((p: { id: string; nombre: string }) => ({ id: p.id, nombre: p.nombre })))
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedProperty, isEmpresa, userPropiedadId, effectivePropiedadId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const fetchCandidatos = useCallback(async (posicion: string, region: string) => {
    try {
      const params = new URLSearchParams({ estado: 'disponible' })
      if (posicion) params.set('posicion', posicion)
      if (region) params.set('region', region)
      const res = await fetch(`/api/candidatos?${params}`)
      const data = await res.json()
      setCandidatos(data.candidatos || [])
    } catch (err) {
      console.error('Error fetching candidatos:', err)
      setCandidatos([])
    }
  }, [])

  const handleActivarReemplazo = (alerta: AlertaRiesgo) => {
    setReemplazoEmpleado(alerta)
    setShowReemplazoDialog(true)
    fetchCandidatos(alerta.empleado.posicion, alerta.empleado.propiedad?.region || '')
  }

  const handleContratarCandidato = async (candidato: Candidato) => {
    if (!reemplazoEmpleado) return
    try {
      const res = await fetch('/api/candidatos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: candidato.id,
          estado: 'contratado',
          empleadoReemplazaId: reemplazoEmpleado.empleado.id,
          propiedadId: reemplazoEmpleado.propiedad?.id || selectedProperty !== 'all' ? selectedProperty : undefined,
        }),
      })
      if (res.ok) {
        toast.success(locale === 'es' ? 'Candidato contratado exitosamente' : 'Candidate hired successfully')
        setShowReemplazoDialog(false)
        setCandidatos(prev => prev.filter(c => c.id !== candidato.id))
      }
    } catch {
      toast.error(tc.error)
    }
  }

  const handleSolicitarCapacitacion = async () => {
    try {
      // For empresa, always use their propiedad
      const propId = isEmpresa ? userPropiedadId : (capForm.propiedadId || (selectedProperty !== 'all' ? selectedProperty : propiedades[0]?.id))
      if (!propId) {
        toast.error(locale === 'es' ? 'Selecciona una propiedad' : 'Select a property')
        return
      }
      if (!capForm.fechaSolicitada) {
        toast.error(locale === 'es' ? 'Selecciona una fecha' : 'Select a date')
        return
      }

      const res = await fetch('/api/solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propiedadId: propId,
          capacitacionId: capForm.capacitacionId || null,
          modalidad: capForm.modalidad,
          fechaSolicitada: capForm.fechaSolicitada,
          participantes: parseInt(capForm.participantes),
          notas: capForm.notas || null,
          estado: 'pendiente',
        }),
      })
      if (res.ok) {
        toast.success(t.solicitudExitosa)
        setShowCapacitacionDialog(false)
        setCapForm({ modalidad: 'presencial', capacitacionId: '', fechaSolicitada: '', participantes: '1', propiedadId: '', notas: '' })
      }
    } catch {
      toast.error(tc.error)
    }
  }

  // ─── Derived chart data ───────────────────────────────────
  const upsellingVsTrainingData = [
    { name: locale === 'es' ? 'Ene' : 'Jan', cursos: 3, upselling: 2400, tendencia: 2200 },
    { name: locale === 'es' ? 'Feb' : 'Feb', cursos: 5, upselling: 3200, tendencia: 2800 },
    { name: locale === 'es' ? 'Mar' : 'Mar', cursos: 8, upselling: 4100, tendencia: 3400 },
    { name: locale === 'es' ? 'Abr' : 'Apr', cursos: 12, upselling: 5300, tendencia: 4000 },
    { name: locale === 'es' ? 'May' : 'May', cursos: 15, upselling: 6800, tendencia: 4600 },
    { name: locale === 'es' ? 'Jun' : 'Jun', cursos: data?.cursosCompletados || 18, upselling: data?.montoUpsellingTotal || 7200, tendencia: 5200 },
  ]

  const npsTrendData = [
    { name: locale === 'es' ? 'Sem 1' : 'Wk 1', nps: 7.8 },
    { name: locale === 'es' ? 'Sem 2' : 'Wk 2', nps: 8.1 },
    { name: locale === 'es' ? 'Sem 3' : 'Wk 3', nps: 7.9 },
    { name: locale === 'es' ? 'Sem 4' : 'Wk 4', nps: 8.4 },
    { name: locale === 'es' ? 'Sem 5' : 'Wk 5', nps: 8.2 },
    { name: locale === 'es' ? 'Sem 6' : 'Wk 6', nps: data?.npsPromedio || 8.7 },
  ]

  const topPerformersData = (data?.topPerformers || []).map(p => ({
    name: p.nombre.split(' ')[0],
    score: Math.round(p.puntuacionTotal),
  }))

  // ─── Loading skeleton ─────────────────────────────────────
  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="py-4">
              <CardContent className="px-4">
                <div className="h-20 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-64 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // ─── Metric cards ─────────────────────────────────────────
  const ticketPromedio = data.totalVentas > 0 ? data.montoTotalVentas / data.totalVentas : 0
  const metrics = [
    {
      title: t.ticketPromedio,
      value: `$${ticketPromedio.toFixed(0)} USD`,
      icon: DollarSign,
      iconBg: 'bg-teal-100 dark:bg-teal-900/30',
      iconColor: 'text-teal-600 dark:text-teal-400',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: t.npsPromedio,
      value: data.npsPromedio.toFixed(1),
      icon: Star,
      iconBg: getNpsBg(data.npsPromedio),
      iconColor: getNpsColor(data.npsPromedio),
      trend: '+0.4',
      trendUp: true,
      npsValue: data.npsPromedio,
    },
    {
      title: t.tasaRotacion,
      value: `${data.tasaRotacion}%`,
      icon: UserX,
      iconBg: data.tasaRotacion > 15 ? 'bg-red-100 dark:bg-red-900/30' : data.tasaRotacion > 10 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-green-100 dark:bg-green-900/30',
      iconColor: data.tasaRotacion > 15 ? 'text-red-600 dark:text-red-400' : data.tasaRotacion > 10 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400',
      trend: '-3%',
      trendUp: false,
    },
    {
      title: t.empleadosEnRiesgo,
      value: `${data.riesgoCritico + data.riesgoAlto}`,
      icon: AlertTriangle,
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      severity: `${data.riesgoCritico} ${locale === 'es' ? 'crítico' : 'critical'}`,
    },
    {
      title: t.cursosCompletados,
      value: `${data.cursosCompletados}`,
      icon: GraduationCap,
      iconBg: 'bg-teal-100 dark:bg-teal-900/30',
      iconColor: 'text-teal-600 dark:text-teal-400',
      trend: '+18%',
      trendUp: true,
    },
    {
      title: t.ahorroRetencion,
      value: `$${(data.ahorroEstimado / 100).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} USD`,
      icon: PiggyBank,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      trend: '+22%',
      trendUp: true,
    },
  ]

  return (
    <div className="space-y-6">
      {/* ─── Header with Capacitación Button ─────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-sm text-muted-foreground">
            {locale === 'es' ? 'Resumen ejecutivo de tu operación' : 'Executive summary of your operations'}
          </p>
        </div>
        <Button
          className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
          onClick={() => setShowCapacitacionDialog(true)}
        >
          <GraduationCap className="size-4" />
          {t.solicitarCapacitacion}
        </Button>
      </div>

      {/* ─── Metrics Cards Row ────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {metrics.map((metric) => (
          <Card key={metric.title} className="py-4">
            <CardContent className="flex flex-col gap-3 px-4">
              <div className="flex items-center gap-3">
                <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${metric.iconBg}`}>
                  <metric.icon className={`size-4 ${metric.iconColor}`} />
                </div>
                <span className="text-xs font-medium text-muted-foreground leading-tight">
                  {metric.title}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xl font-bold tracking-tight">{metric.value}</span>
                <span className="flex items-center gap-1 text-xs">
                  {metric.trendUp ? (
                    <TrendingUp className="size-3 text-emerald-500" />
                  ) : (
                    <TrendingDown className="size-3 text-emerald-500" />
                  )}
                  {metric.trend && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      {metric.trend}
                    </span>
                  )}
                  {metric.severity && (
                    <Badge className={`text-[9px] px-1 py-0 ${getRiskBadgeColor('critico')}`}>
                      {metric.severity}
                    </Badge>
                  )}
                  <span className="text-muted-foreground">{t.vsMesAnterior}</span>
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ─── Charts Row ───────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Capacitación vs Upselling ComposedChart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t.upsellingVsCapacitacion}</CardTitle>
            <CardDescription className="text-xs">
              {locale === 'es' ? 'Correlación entre cursos completados e ingresos por upselling' : 'Correlation between completed courses and upselling revenue'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={upsellingVsTrainingConfig} className="h-[280px] w-full">
              <ComposedChart data={upsellingVsTrainingData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis yAxisId="left" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar yAxisId="left" dataKey="cursos" fill="var(--color-cursos)" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="upselling" fill="var(--color-upselling)" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="tendencia" stroke="var(--color-tendencia)" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* NPS Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t.npsTendencia}</CardTitle>
            <CardDescription className="text-xs">
              {locale === 'es' ? 'Evolución semanal del NPS promedio' : 'Weekly NPS average evolution'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={npsTrendConfig} className="h-[280px] w-full">
              <ComposedChart data={npsTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis domain={[6, 10]} tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="nps" stroke="var(--color-nps)" strokeWidth={2.5} dot={{ r: 4, fill: 'var(--color-nps)' }} activeDot={{ r: 6 }} />
              </ComposedChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* ─── Top Performers + Alertas Row ─────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Top Performers */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t.topPerformers}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.topPerformers.length > 0 ? (
              <>
                {/* Horizontal bar chart */}
                <ChartContainer config={topPerformersChartConfig} className="h-[160px] w-full">
                  <ComposedChart data={topPerformersData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={50} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="score" fill="var(--color-score)" radius={[0, 4, 4, 0]} />
                  </ComposedChart>
                </ChartContainer>
                <Separator />
                {data.topPerformers.slice(0, 3).map((employee, index) => (
                  <div key={employee.id} className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="size-9">
                        <AvatarFallback className="bg-teal-100 text-teal-700 text-xs font-semibold dark:bg-teal-900/40 dark:text-teal-300">
                          {getInitials(employee.nombre)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-amber-900">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium truncate">{employee.nombre}</span>
                        <Badge variant="secondary" className="shrink-0 bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 text-xs">
                          {Math.round(employee.puntuacionTotal)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{employee.posicion}</p>
                      <Progress value={employee.puntuacionTotal} className="mt-1.5 h-1.5 bg-teal-100 dark:bg-teal-900/30 [&>[data-slot=progress-indicator]]:bg-teal-500" />
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">{tc.sinDatos}</p>
            )}
          </CardContent>
        </Card>

        {/* Alertas de Riesgo de Baja - CRUCIAL */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="size-4 text-amber-500" />
                {t.alertasRiesgo}
              </CardTitle>
              <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800">
                {alertas.length} {locale === 'es' ? 'alertas' : 'alerts'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {alertas.length > 0 ? (
              <div className="max-h-96 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                {alertas.map((alerta) => {
                  const sev = getSeverityColor(alerta.severidad)
                  return (
                    <div key={alerta.id} className={`rounded-lg border p-4 ${sev.border} ${sev.bg} transition-all hover:shadow-sm`}>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <Avatar className="size-10 shrink-0 mt-0.5">
                            <AvatarFallback className="text-xs font-semibold">
                              {getInitials(alerta.empleado.nombre)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">{alerta.empleado.nombre}</span>
                              <Badge className={`text-[10px] px-1.5 py-0.5 ${getRiskBadgeColor(alerta.severidad)}`}>
                                {t[alerta.severidad as keyof typeof t] || alerta.severidad}
                              </Badge>
                              {alerta.generadoPorIA && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 gap-1 bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400 border-violet-200 dark:border-violet-800">
                                  <Bot className="size-3" />
                                  {t.analizadoPorIA}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {alerta.empleado.posicion} · {alerta.empleado.propiedad?.nombre || ''}
                            </p>

                            {/* Probabilidad de abandono */}
                            <div className="mt-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[11px] font-medium text-muted-foreground">
                                  {t.probabilidadAbandono}
                                </span>
                                <span className="text-[11px] font-bold">{Math.round(alerta.probabilidad)}%</span>
                              </div>
                              <Progress
                                value={alerta.probabilidad}
                                className="h-2 [&>[data-slot=progress-indicator]]:bg-red-500"
                              />
                            </div>

                            {/* Justificación y sugerencia */}
                            <div className="mt-2 space-y-1">
                              <p className="text-xs leading-relaxed">
                                <span className="font-medium">{t.justificacion}:</span>{' '}
                                {alerta.mensaje?.substring(0, 200)}{alerta.mensaje && alerta.mensaje.length > 200 ? '...' : ''}
                              </p>
                            </div>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          className="shrink-0 gap-1.5 text-xs border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/30"
                          onClick={() => handleActivarReemplazo(alerta)}
                        >
                          <Users className="size-3.5" />
                          {t.activarReemplazo}
                          <ArrowRight className="size-3" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="size-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
                  <AlertTriangle className="size-6 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-sm text-muted-foreground">{t.noHayAlertas}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── Dialog: Solicitar Capacitación Híbrida ──────── */}
      <Dialog open={showCapacitacionDialog} onOpenChange={setShowCapacitacionDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="size-5 text-teal-600" />
              {t.capacitacionHibrida}
            </DialogTitle>
            <DialogDescription>
              {locale === 'es' ? 'Solicita una sesión de capacitación presencial o virtual' : 'Request an in-person or virtual training session'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Modalidad */}
            <div className="space-y-2">
              <Label>{t.modalidad}</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={capForm.modalidad === 'presencial' ? 'default' : 'outline'}
                  className={capForm.modalidad === 'presencial' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                  onClick={() => setCapForm(p => ({ ...p, modalidad: 'presencial' }))}
                >
                  <MapPin className="size-4 mr-1.5" />
                  {t.presencial}
                </Button>
                <Button
                  type="button"
                  variant={capForm.modalidad === 'virtual' ? 'default' : 'outline'}
                  className={capForm.modalidad === 'virtual' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                  onClick={() => setCapForm(p => ({ ...p, modalidad: 'virtual' }))}
                >
                  <Monitor className="size-4 mr-1.5" />
                  {t.virtual}
                </Button>
              </div>
            </div>

            {/* Tema/Capacitación */}
            <div className="space-y-2">
              <Label>{t.tema}</Label>
              <Select value={capForm.capacitacionId} onValueChange={v => setCapForm(p => ({ ...p, capacitacionId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder={t.seleccionar} />
                </SelectTrigger>
                <SelectContent>
                  {capacitaciones.map(cap => (
                    <SelectItem key={cap.id} value={cap.id}>
                      {locale === 'en' && cap.tituloEn ? cap.tituloEn : cap.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Propiedad - hidden for empresa */}
            {!isEmpresa && (
            <div className="space-y-2">
              <Label>{t.propiedad}</Label>
              <Select value={capForm.propiedadId || selectedProperty} onValueChange={v => setCapForm(p => ({ ...p, propiedadId: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {propiedades.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            )}

            {/* Fecha */}
            <div className="space-y-2">
              <Label>{t.fecha}</Label>
              <Input
                type="date"
                value={capForm.fechaSolicitada}
                onChange={e => setCapForm(p => ({ ...p, fechaSolicitada: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Participantes */}
            <div className="space-y-2">
              <Label>{t.participantes}</Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={capForm.participantes}
                onChange={e => setCapForm(p => ({ ...p, participantes: e.target.value }))}
              />
            </div>

            {/* Notas */}
            <div className="space-y-2">
              <Label>{locale === 'es' ? 'Notas adicionales' : 'Additional notes'}</Label>
              <Textarea
                value={capForm.notas}
                onChange={e => setCapForm(p => ({ ...p, notas: e.target.value }))}
                placeholder={locale === 'es' ? 'Notas o requisitos especiales...' : 'Special requirements or notes...'}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCapacitacionDialog(false)}>
              {t.cancelar}
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5" onClick={handleSolicitarCapacitacion}>
              <Calendar className="size-4" />
              {t.confirmar}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Dialog: Activar Reemplazo / Terna ────────────── */}
      <Dialog open={showReemplazoDialog} onOpenChange={setShowReemplazoDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="size-5 text-amber-600" />
              {t.activarReemplazo}
            </DialogTitle>
            <DialogDescription>
              {reemplazoEmpleado
                ? `${locale === 'es' ? 'Buscar reemplazo para' : 'Find replacement for'} ${reemplazoEmpleado.empleado.nombre} — ${reemplazoEmpleado.empleado.posicion}`
                : ''}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
            {candidatos.length > 0 ? (
              candidatos.map((candidato) => (
                <div key={candidato.id} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <Avatar className="size-10 shrink-0">
                    <AvatarFallback className="text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      {getInitials(candidato.nombre)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{candidato.nombre}</span>
                      {candidato.puntuacionEntrevista && (
                        <Badge variant="outline" className="text-[10px] shrink-0 bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400">
                          {candidato.puntuacionEntrevista}/100
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {candidato.posicion} · {candidato.experiencia} {locale === 'es' ? 'años exp.' : 'yrs exp.'} · {candidato.region}
                    </p>
                    {candidato.habilidades && (
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        {candidato.habilidades}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    className="bg-teal-600 hover:bg-teal-700 text-white shrink-0"
                    onClick={() => handleContratarCandidato(candidato)}
                  >
                    {locale === 'es' ? 'Contratar' : 'Hire'}
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  {locale === 'es' ? 'No hay candidatos disponibles para esta posición y región' : 'No candidates available for this position and region'}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReemplazoDialog(false)}>
              {t.cancelar}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
