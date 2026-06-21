'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Search,
  Users,
  AlertTriangle,
  Bot,
  ArrowLeft,
  Star,
  BookOpen,
  DollarSign,
  ChevronRight,
  Brain,
  TrendingUp,
  MapPin,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/lib/store'
import { translations } from '@/lib/i18n'
import { toast } from 'sonner'

// ─── Types ───────────────────────────────────────────────────
interface Empleado {
  id: string
  empleadoId: string
  nombre: string
  posicion: string
  posicionEn: string | null
  departamento: string
  departamentoEn: string | null
  foto: string | null
  fechaIngreso: string
  estado: string
  nivelCarrera: number
  rutaCarrera: string | null
  puntuacionConocimiento: number
  puntuacionVentas: number
  puntuacionHospitalidad: number
  puntuacionTotal: number
  totalUpselling: number
  npsPromedio: number
  cursosCompletados: number
  cursosEnProgreso: number
  indiceFelicidad: number
  riesgoBaja: number
  nivelRiesgoBaja: string
  justificacionRiesgo: string | null
  sugerenciaCapacitacion: string | null
  propiedad: { id: string; nombre: string; nombreEn: string | null; region: string }
  _count: { cursos: number; alertas: number; ventas: number }
}

interface AIAnalysis {
  success: boolean
  analisis: {
    severidad: string
    probabilidad_abandono: number
    justificacion: string
    sugerencia_capacitacion: string
    factores_riesgo: string[]
    acciones_recomendadas: string[]
  }
}

// ─── Helpers ─────────────────────────────────────────────────
function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function getEstadoBadge(estado: string, t: typeof translations.es.employees): { color: string; label: string } {
  switch (estado) {
    case 'activo': return { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', label: t.activo }
    case 'onboarding': return { color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400', label: t.onboarding }
    case 'offboarding': return { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', label: t.offboarding }
    default: return { color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400', label: t.inactivo }
  }
}

function getRiskColor(level: string): string {
  switch (level) {
    case 'critico': return 'bg-red-500 text-white'
    case 'alto': return 'bg-amber-500 text-white'
    case 'medio': return 'bg-yellow-500 text-white'
    default: return 'bg-green-500 text-white'
  }
}

function getScoreColor(score: number): string {
  if (score >= 80) return '[&>[data-slot=progress-indicator]]:bg-emerald-500'
  if (score >= 60) return '[&>[data-slot=progress-indicator]]:bg-teal-500'
  if (score >= 40) return '[&>[data-slot=progress-indicator]]:bg-amber-500'
  return '[&>[data-slot=progress-indicator]]:bg-red-500'
}

// ─── Main Component ──────────────────────────────────────────
export function EmpleadosModule() {
  const { locale, selectedProperty, selectedEmployee, setSelectedEmployee } = useAppStore()
  const t = translations[locale].employees
  const tc = translations[locale].common

  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterDepto, setFilterDepto] = useState('todos')
  const [filterRiesgo, setFilterRiesgo] = useState('todos')
  const [analyzing, setAnalyzing] = useState<string | null>(null)
  const [aiResult, setAiResult] = useState<AIAnalysis | null>(null)
  const [showAIDialog, setShowAIDialog] = useState(false)

  const fetchEmpleados = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedProperty !== 'all') params.set('propiedadId', selectedProperty)
      if (search) params.set('search', search)
      if (filterDepto !== 'todos') params.set('departamento', filterDepto)
      if (filterRiesgo !== 'todos') params.set('nivelRiesgoBaja', filterRiesgo)
      const res = await fetch(`/api/empleados?${params}`)
      const data = await res.json()
      setEmpleados(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching empleados:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedProperty, search, filterDepto, filterRiesgo])

  useEffect(() => {
    fetchEmpleados()
  }, [fetchEmpleados])

  const handleAnalizarIA = async (empleadoId: string) => {
    setAnalyzing(empleadoId)
    try {
      const res = await fetch('/api/agents/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empleadoId }),
      })
      const data = await res.json()
      if (data.success) {
        setAiResult(data)
        setShowAIDialog(true)
        toast.success(t.analisisCompleto)
        fetchEmpleados()
      } else {
        toast.error(data.error || tc.error)
      }
    } catch {
      toast.error(tc.error)
    } finally {
      setAnalyzing(null)
    }
  }

  // Unique departments for filter
  const departamentos = [...new Set(empleados.map(e => e.departamento))]

  // Selected employee detail
  const empleadoDetalle = selectedEmployee ? empleados.find(e => e.id === selectedEmployee) : null

  // ─── Detail View ─────────────────────────────────────────
  if (empleadoDetalle) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" className="gap-1.5" onClick={() => setSelectedEmployee(null)}>
          <ArrowLeft className="size-4" />
          {t.volver}
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="size-20 mb-3">
                  <AvatarFallback className="bg-teal-100 text-teal-700 text-xl font-bold dark:bg-teal-900/40 dark:text-teal-300">
                    {getInitials(empleadoDetalle.nombre)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-lg font-bold">{empleadoDetalle.nombre}</h2>
                <p className="text-sm text-muted-foreground">{empleadoDetalle.posicion}</p>
                <p className="text-xs text-muted-foreground">{empleadoDetalle.empleadoId} · {empleadoDetalle.propiedad.nombre}</p>

                <div className="flex flex-wrap gap-2 mt-3 justify-center">
                  <Badge className={getEstadoBadge(empleadoDetalle.estado, t).color}>
                    {getEstadoBadge(empleadoDetalle.estado, t).label}
                  </Badge>
                  <Badge className={getRiskColor(empleadoDetalle.nivelRiesgoBaja)}>
                    {empleadoDetalle.nivelRiesgoBaja.toUpperCase()}
                  </Badge>
                </div>

                <Separator className="my-4" />

                <div className="w-full space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.fechaIngreso}</span>
                    <span>{new Date(empleadoDetalle.fechaIngreso).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.felicidad}</span>
                    <span className="font-medium">{empleadoDetalle.indiceFelicidad.toFixed(0)}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">NPS</span>
                    <span className="font-medium">{empleadoDetalle.npsPromedio.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.ventas}</span>
                    <span className="font-medium">${empleadoDetalle.totalUpselling.toFixed(0)}</span>
                  </div>
                </div>

                <Button
                  className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white gap-1.5"
                  onClick={() => handleAnalizarIA(empleadoDetalle.id)}
                  disabled={analyzing === empleadoDetalle.id}
                >
                  {analyzing === empleadoDetalle.id ? (
                    <>
                      <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      {t.analizando}
                    </>
                  ) : (
                    <>
                      <Brain className="size-4" />
                      {t.analizarIA}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Scores + Career Path */}
          <div className="lg:col-span-2 space-y-4">
            {/* Score Integral */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{locale === 'es' ? 'Score Integral' : 'Integral Score'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{t.scoreConocimiento}</span>
                      <span className="text-sm font-bold">{empleadoDetalle.puntuacionConocimiento.toFixed(0)}</span>
                    </div>
                    <Progress value={empleadoDetalle.puntuacionConocimiento} className={`h-2.5 ${getScoreColor(empleadoDetalle.puntuacionConocimiento)}`} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{t.scoreVentas}</span>
                      <span className="text-sm font-bold">{empleadoDetalle.puntuacionVentas.toFixed(0)}</span>
                    </div>
                    <Progress value={empleadoDetalle.puntuacionVentas} className={`h-2.5 ${getScoreColor(empleadoDetalle.puntuacionVentas)}`} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{t.scoreHospitalidad}</span>
                      <span className="text-sm font-bold">{empleadoDetalle.puntuacionHospitalidad.toFixed(0)}</span>
                    </div>
                    <Progress value={empleadoDetalle.puntuacionHospitalidad} className={`h-2.5 ${getScoreColor(empleadoDetalle.puntuacionHospitalidad)}`} />
                  </div>
                  <Separator />
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-bold">{locale === 'es' ? 'Puntuación Total' : 'Total Score'}</span>
                      <span className="text-lg font-bold">{empleadoDetalle.puntuacionTotal.toFixed(0)}/100</span>
                    </div>
                    <Progress value={empleadoDetalle.puntuacionTotal} className={`h-3 ${getScoreColor(empleadoDetalle.puntuacionTotal)}`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Career Path */}
            {empleadoDetalle.rutaCarrera && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="size-4 text-teal-600" />
                    {t.rutaCarrera}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 flex-wrap">
                    {empleadoDetalle.rutaCarrera.split('→').map((step, idx, arr) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Badge
                          variant={idx < empleadoDetalle.nivelCarrera ? 'default' : 'outline'}
                          className={idx < empleadoDetalle.nivelCarrera
                            ? 'bg-teal-600 text-white'
                            : idx === empleadoDetalle.nivelCarrera
                              ? 'border-teal-500 text-teal-700 dark:text-teal-400'
                              : ''}
                        >
                          {step.trim()}
                        </Badge>
                        {idx < arr.length - 1 && <ChevronRight className="size-4 text-muted-foreground" />}
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {locale === 'es' ? `Nivel actual: ${empleadoDetalle.nivelCarrera}` : `Current level: ${empleadoDetalle.nivelCarrera}`}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Justification */}
            {empleadoDetalle.justificacionRiesgo && (
              <Card className="border-amber-200 dark:border-amber-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bot className="size-4 text-violet-500" />
                    {locale === 'es' ? 'Análisis del Agente de IA' : 'AI Agent Analysis'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm font-medium">{locale === 'es' ? 'Justificación:' : 'Justification:'}</span>
                    <p className="text-sm text-muted-foreground mt-1">{empleadoDetalle.justificacionRiesgo}</p>
                  </div>
                  {empleadoDetalle.sugerenciaCapacitacion && (
                    <div>
                      <span className="text-sm font-medium">{locale === 'es' ? 'Sugerencia de capacitación:' : 'Training suggestion:'}</span>
                      <p className="text-sm text-muted-foreground mt-1">{empleadoDetalle.sugerenciaCapacitacion}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              <Card>
                <CardContent className="pt-4 pb-4 text-center">
                  <BookOpen className="size-5 text-teal-600 mx-auto mb-1" />
                  <div className="text-xl font-bold">{empleadoDetalle.cursosCompletados}</div>
                  <div className="text-xs text-muted-foreground">{t.cursos}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4 text-center">
                  <DollarSign className="size-5 text-emerald-600 mx-auto mb-1" />
                  <div className="text-xl font-bold">${empleadoDetalle.totalUpselling.toFixed(0)}</div>
                  <div className="text-xs text-muted-foreground">{t.ventas}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4 text-center">
                  <Star className="size-5 text-amber-500 mx-auto mb-1" />
                  <div className="text-xl font-bold">{empleadoDetalle.npsPromedio.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">{t.nps}</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* AI Result Dialog */}
        <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bot className="size-5 text-violet-500" />
                {locale === 'es' ? 'Resultado del Análisis de IA' : 'AI Analysis Result'}
              </DialogTitle>
              <DialogDescription>
                {aiResult?.analisis?.justificacion?.substring(0, 100)}...
              </DialogDescription>
            </DialogHeader>
            {aiResult?.analisis && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge className={getRiskColor(aiResult.analisis.severidad)}>
                    {aiResult.analisis.severidad.toUpperCase()}
                  </Badge>
                  <span className="text-sm">
                    {locale === 'es' ? 'Probabilidad de abandono' : 'Churn probability'}: <strong>{aiResult.analisis.probabilidad_abandono}%</strong>
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium">{locale === 'es' ? 'Factores de riesgo' : 'Risk factors'}:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {aiResult.analisis.factores_riesgo.map((f, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{f}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium">{locale === 'es' ? 'Acciones recomendadas' : 'Recommended actions'}:</span>
                  <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                    {aiResult.analisis.acciones_recomendadas.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="text-sm font-medium">{locale === 'es' ? 'Sugerencia de capacitación' : 'Training suggestion'}:</span>
                  <p className="text-sm text-muted-foreground mt-1">{aiResult.analisis.sugerencia_capacitacion}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // ─── List View ───────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
        <p className="text-sm text-muted-foreground">
          {locale === 'es' ? 'Gestión de personal, scores y rutas de carrera' : 'Staff management, scores and career paths'}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder={t.search}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterDepto} onValueChange={setFilterDepto}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t.departamento} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">{t.todos}</SelectItem>
            {departamentos.map(d => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterRiesgo} onValueChange={setFilterRiesgo}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder={t.riesgo} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">{t.todos}</SelectItem>
            <SelectItem value="critico">{locale === 'es' ? 'Crítico' : 'Critical'}</SelectItem>
            <SelectItem value="alto">{locale === 'es' ? 'Alto' : 'High'}</SelectItem>
            <SelectItem value="medio">{locale === 'es' ? 'Medio' : 'Medium'}</SelectItem>
            <SelectItem value="bajo">{locale === 'es' ? 'Bajo' : 'Low'}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Employee Cards */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-40 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : empleados.length === 0 ? (
        <div className="text-center py-12">
          <Users className="size-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">{t.noResultados}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {empleados.map(empleado => (
            <Card
              key={empleado.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedEmployee(empleado.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="size-12 shrink-0">
                    <AvatarFallback className="bg-teal-100 text-teal-700 text-sm font-semibold dark:bg-teal-900/40 dark:text-teal-300">
                      {getInitials(empleado.nombre)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm truncate">{empleado.nombre}</span>
                      <Badge className={`text-[9px] px-1 py-0 shrink-0 ${getRiskColor(empleado.nivelRiesgoBaja)}`}>
                        {empleado.nivelRiesgoBaja}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{empleado.posicion}</p>
                    <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                      <MapPin className="size-3" />
                      {empleado.propiedad.nombre}
                    </p>
                    <div className="flex gap-1 mt-2">
                      <Badge variant="outline" className={`text-[10px] px-1.5 ${getEstadoBadge(empleado.estado, t).color}`}>
                        {getEstadoBadge(empleado.estado, t).label}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5">
                        {empleado.empleadoId}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Score bars */}
                <div className="mt-3 space-y-2">
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span>{t.scoreConocimiento}</span>
                      <span className="font-medium">{empleado.puntuacionConocimiento.toFixed(0)}</span>
                    </div>
                    <Progress value={empleado.puntuacionConocimiento} className={`h-1.5 ${getScoreColor(empleado.puntuacionConocimiento)}`} />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span>{t.scoreVentas}</span>
                      <span className="font-medium">{empleado.puntuacionVentas.toFixed(0)}</span>
                    </div>
                    <Progress value={empleado.puntuacionVentas} className={`h-1.5 ${getScoreColor(empleado.puntuacionVentas)}`} />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span>{t.scoreHospitalidad}</span>
                      <span className="font-medium">{empleado.puntuacionHospitalidad.toFixed(0)}</span>
                    </div>
                    <Progress value={empleado.puntuacionHospitalidad} className={`h-1.5 ${getScoreColor(empleado.puntuacionHospitalidad)}`} />
                  </div>
                </div>

                {/* Footer stats */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><BookOpen className="size-3" /> {empleado.cursosCompletados} {t.cursos}</span>
                  <span className="flex items-center gap-1"><DollarSign className="size-3" /> ${empleado.totalUpselling.toFixed(0)}</span>
                  <span className="flex items-center gap-1"><Star className="size-3" /> {empleado.npsPromedio.toFixed(1)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
