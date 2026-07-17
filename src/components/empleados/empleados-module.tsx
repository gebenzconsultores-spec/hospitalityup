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
  Clock,
  Calendar,
  Briefcase,
  Plus,
  UserPlus,
  Sun,
  Moon,
  Sunset,
  Shuffle,
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
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/lib/store'
import { translations } from '@/lib/i18n'
import { toast } from 'sonner'
import { EmpleadoCursos } from './empleado-cursos'

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
  // Horario y jornada laboral
  tipoJornada: string
  horarioEntrada: string | null
  horarioSalida: string | null
  diasTrabajo: string | null
  cubreTurnos: boolean
  turnoPreferido: string | null
  salario: number | null
  tipoContrato: string | null
  fechaFinContrato: string | null
  // Scores
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

interface Propiedad {
  id: string
  nombre: string
  nombreEn: string | null
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

// ─── Departamento mapping ────────────────────────────────────
const DEPARTAMENTOS = [
  { es: 'Alimentos y Bebidas', en: 'Food & Beverage', code: 'AYB' },
  { es: 'Conserjería', en: 'Concierge', code: 'CON' },
  { es: 'Recepción', en: 'Reception', code: 'REC' },
  { es: 'Cocina', en: 'Kitchen', code: 'COC' },
  { es: 'Spa y Bienestar', en: 'Spa & Wellness', code: 'SPA' },
  { es: 'Mantenimiento', en: 'Maintenance', code: 'MAN' },
  { es: 'Seguridad', en: 'Security', code: 'SEG' },
  { es: 'Administración', en: 'Administration', code: 'ADM' },
]

const DIAS_SEMANA = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']

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

function getJornadaBadge(tipo: string, t: typeof translations.es.employees): { color: string; label: string } {
  switch (tipo) {
    case 'fijo': return { color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400', label: t.fijo }
    case 'mixto': return { color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400', label: t.mixto }
    case 'variable': return { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', label: t.variable }
    default: return { color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400', label: tipo }
  }
}

function getTurnoIcon(turno: string | null) {
  switch (turno) {
    case 'matutino': return Sun
    case 'vespertino': return Sunset
    case 'nocturno': return Moon
    default: return Shuffle
  }
}

function parseDiasTrabajo(diasJson: string | null): string[] {
  if (!diasJson) return []
  try {
    return JSON.parse(diasJson)
  } catch {
    return []
  }
}

function formatDiaName(dia: string, locale: string): string {
  const diasEs: Record<string, string> = {
    lunes: 'Lun', martes: 'Mar', miercoles: 'Mié', jueves: 'Jue',
    viernes: 'Vie', sabado: 'Sáb', domingo: 'Dom',
  }
  const diasEn: Record<string, string> = {
    lunes: 'Mon', martes: 'Tue', miercoles: 'Wed', jueves: 'Thu',
    viernes: 'Fri', sabado: 'Sat', domingo: 'Sun',
  }
  return locale === 'es' ? (diasEs[dia] || dia) : (diasEn[dia] || dia)
}

// ─── Main Component ──────────────────────────────────────────
export function EmpleadosModule() {
  const { locale, selectedProperty, selectedEmployee, setSelectedEmployee, userRole, userPropiedadId } = useAppStore()
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

  // Add Employee dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [saving, setSaving] = useState(false)
  const [propiedades, setPropiedades] = useState<Propiedad[]>([])

  // Form state
  const [formNombre, setFormNombre] = useState('')
  const [formEmpleadoId, setFormEmpleadoId] = useState('')
  const [formPosicion, setFormPosicion] = useState('')
  const [formPosicionEn, setFormPosicionEn] = useState('')
  const [formDepartamento, setFormDepartamento] = useState('')
  const [formPropiedadId, setFormPropiedadId] = useState('')
  const [formFechaIngreso, setFormFechaIngreso] = useState('')
  const [formFoto, setFormFoto] = useState('')
  const [formTipoJornada, setFormTipoJornada] = useState('fijo')
  const [formHorarioEntrada, setFormHorarioEntrada] = useState('08:00')
  const [formHorarioSalida, setFormHorarioSalida] = useState('16:00')
  const [formDiasTrabajo, setFormDiasTrabajo] = useState<string[]>(['lunes', 'martes', 'miercoles', 'jueves', 'viernes'])
  const [formCubreTurnos, setFormCubreTurnos] = useState(false)
  const [formTurnoPreferido, setFormTurnoPreferido] = useState('matutino')
  const [formSalario, setFormSalario] = useState('')
  const [formTipoContrato, setFormTipoContrato] = useState('indefinido')
  const [formFechaFinContrato, setFormFechaFinContrato] = useState('')
  const [formEstado, setFormEstado] = useState('onboarding')

  const isEmpresa = userRole === 'empresa' && userPropiedadId

  const fetchEmpleados = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      // For empresa, always filter by their propiedad
      if (isEmpresa) {
        params.set('propiedadId', userPropiedadId!)
      } else if (selectedProperty !== 'all') {
        params.set('propiedadId', selectedProperty)
      }
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
  }, [selectedProperty, search, filterDepto, filterRiesgo, isEmpresa, userPropiedadId])

  const fetchPropiedades = useCallback(async () => {
    try {
      const res = await fetch('/api/propiedades')
      const data = await res.json()
      const props = Array.isArray(data) ? data : []
      // For empresa, filter to only their propiedad
      const filtered = isEmpresa ? props.filter(p => p.id === userPropiedadId) : props
      setPropiedades(filtered.map((p: { id: string; nombre: string; nombreEn: string | null }) => ({ id: p.id, nombre: p.nombre, nombreEn: p.nombreEn })))
    } catch {
      // ignore
    }
  }, [isEmpresa, userPropiedadId])

  useEffect(() => {
    fetchEmpleados()
  }, [fetchEmpleados])

  useEffect(() => {
    fetchPropiedades()
  }, [fetchPropiedades])

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

  const resetForm = () => {
    setFormNombre('')
    setFormEmpleadoId('')
    setFormPosicion('')
    setFormPosicionEn('')
    setFormDepartamento('')
    setFormPropiedadId(selectedProperty !== 'all' ? selectedProperty : '')
    setFormFechaIngreso(new Date().toISOString().split('T')[0])
    setFormFoto('')
    setFormTipoJornada('fijo')
    setFormHorarioEntrada('08:00')
    setFormHorarioSalida('16:00')
    setFormDiasTrabajo(['lunes', 'martes', 'miercoles', 'jueves', 'viernes'])
    setFormCubreTurnos(false)
    setFormTurnoPreferido('matutino')
    setFormSalario('')
    setFormTipoContrato('indefinido')
    setFormFechaFinContrato('')
    setFormEstado('onboarding')
  }

  const handleDepartamentoChange = (depto: string) => {
    setFormDepartamento(depto)
    const deptoMap = DEPARTAMENTOS.find(d => d.es === depto)
    if (deptoMap) {
      const num = Math.floor(Math.random() * 900) + 100
      setFormEmpleadoId(`${deptoMap.code}-${num}`)
    }
  }

  const handleDiaToggle = (dia: string) => {
    setFormDiasTrabajo(prev =>
      prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]
    )
  }

  const handleCreateEmpleado = async () => {
    if (!formNombre.trim()) {
      toast.error(t.nombreRequerido)
      return
    }
    if (!formEmpleadoId.trim()) {
      toast.error(t.idEmpleadoRequerido)
      return
    }
    if (!formPosicion.trim()) {
      toast.error(t.puestoRequerido)
      return
    }

    setSaving(true)
    try {
      const payload = {
        nombre: formNombre.trim(),
        empleadoId: formEmpleadoId.trim(),
        posicion: formPosicion.trim(),
        posicionEn: formPosicionEn.trim() || null,
        departamento: formDepartamento,
        departamentoEn: DEPARTAMENTOS.find(d => d.es === formDepartamento)?.en || null,
        foto: formFoto.trim() || null,
        fechaIngreso: formFechaIngreso || new Date().toISOString(),
        estado: formEstado,
        tipoJornada: formTipoJornada,
        horarioEntrada: formHorarioEntrada || null,
        horarioSalida: formHorarioSalida || null,
        diasTrabajo: formDiasTrabajo.length > 0 ? JSON.stringify(formDiasTrabajo) : null,
        cubreTurnos: formCubreTurnos,
        turnoPreferido: formTurnoPreferido,
        salario: formSalario ? parseFloat(formSalario) : null,
        tipoContrato: formTipoContrato,
        fechaFinContrato: formTipoContrato !== 'indefinido' && formFechaFinContrato ? formFechaFinContrato : null,
        propiedadId: formPropiedadId || selectedProperty !== 'all' ? (formPropiedadId || selectedProperty) : propiedades[0]?.id,
      }

      const res = await fetch('/api/empleados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success(t.empleadoCreado)
        setShowCreateDialog(false)
        resetForm()
        fetchEmpleados()
      } else {
        toast.error(t.errorCrear)
      }
    } catch {
      toast.error(t.errorCrear)
    } finally {
      setSaving(false)
    }
  }

  // Unique departments for filter
  const departamentos = [...new Set(empleados.map(e => e.departamento))]

  // Selected employee detail
  const empleadoDetalle = selectedEmployee ? empleados.find(e => e.id === selectedEmployee) : null

  // ─── Detail View ─────────────────────────────────────────
  if (empleadoDetalle) {
    const diasParsed = parseDiasTrabajo(empleadoDetalle.diasTrabajo)
    const TurnoIcon = getTurnoIcon(empleadoDetalle.turnoPreferido)

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

          {/* Scores + Career Path + Schedule + Contract */}
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

            {/* Schedule (Horario) */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="size-4 text-teal-600" />
                  {t.horario}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-muted-foreground">{t.jornada}</span>
                    <div className="mt-1">
                      <Badge className={getJornadaBadge(empleadoDetalle.tipoJornada, t).color}>
                        {getJornadaBadge(empleadoDetalle.tipoJornada, t).label}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">{t.turnoPreferido}</span>
                    <div className="mt-1 flex items-center gap-1.5">
                      <TurnoIcon className="size-4 text-teal-600" />
                      <span className="text-sm font-medium">
                        {empleadoDetalle.turnoPreferido === 'matutino' ? t.matutino
                          : empleadoDetalle.turnoPreferido === 'vespertino' ? t.vespertino
                          : empleadoDetalle.turnoPreferido === 'nocturno' ? t.nocturno
                          : t.mixto}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">{t.entrada}</span>
                    <p className="text-sm font-semibold mt-0.5">{empleadoDetalle.horarioEntrada || '—'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">{t.salida}</span>
                    <p className="text-sm font-semibold mt-0.5">{empleadoDetalle.horarioSalida || '—'}</p>
                  </div>
                </div>

                <Separator className="my-3" />

                <div>
                  <span className="text-xs text-muted-foreground">{t.dias}</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {DIAS_SEMANA.map(dia => {
                      const isActive = diasParsed.includes(dia)
                      return (
                        <span
                          key={dia}
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            isActive
                              ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {formatDiaName(dia, locale)}
                        </span>
                      )
                    })}
                  </div>
                </div>

                <Separator className="my-3" />

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                    empleadoDetalle.cubreTurnos
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {empleadoDetalle.cubreTurnos ? t.siCubre : t.noCubre}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Contract (Contrato) */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Briefcase className="size-4 text-teal-600" />
                  {t.contrato}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-muted-foreground">{t.tipoContrato}</span>
                    <p className="text-sm font-semibold mt-0.5">
                      {empleadoDetalle.tipoContrato === 'indefinido' ? t.indefinido
                        : empleadoDetalle.tipoContrato === 'temporal' ? t.temporal
                        : empleadoDetalle.tipoContrato === 'eventual' ? t.eventual
                        : empleadoDetalle.tipoContrato === 'practica' ? t.practica
                        : empleadoDetalle.tipoContrato || '—'}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">{t.salario}</span>
                    <p className="text-sm font-semibold mt-0.5">
                      {empleadoDetalle.salario ? `$${empleadoDetalle.salario.toLocaleString()}` : '—'}
                    </p>
                  </div>
                  {empleadoDetalle.tipoContrato && empleadoDetalle.tipoContrato !== 'indefinido' && (
                    <div>
                      <span className="text-xs text-muted-foreground">{t.fechaFinContrato}</span>
                      <p className="text-sm font-semibold mt-0.5">
                        {empleadoDetalle.fechaFinContrato
                          ? new Date(empleadoDetalle.fechaFinContrato).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US')
                          : '—'}
                      </p>
                    </div>
                  )}
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

        {/* Cursos y Capacitaciones */}
        <EmpleadoCursos empleadoId={empleadoDetalle.id} locale={locale} />

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-sm text-muted-foreground">
            {locale === 'es' ? 'Gestión de personal, scores y rutas de carrera' : 'Staff management, scores and career paths'}
          </p>
        </div>
        <Button
          className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5"
          onClick={() => {
            resetForm()
            setShowCreateDialog(true)
          }}
        >
          <UserPlus className="size-4" />
          {t.agregarEmpleado}
        </Button>
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

      {/* ─── Create Employee Dialog ─────────────────────────────── */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="size-5 text-teal-600" />
              {t.agregarEmpleado}
            </DialogTitle>
            <DialogDescription>
              {locale === 'es'
                ? 'Complete la información del nuevo empleado'
                : 'Fill in the new employee information'}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="personal" className="gap-1.5">
                <Users className="size-3.5" />
                {t.infoPersonal}
              </TabsTrigger>
              <TabsTrigger value="horario" className="gap-1.5">
                <Clock className="size-3.5" />
                {t.horarioContrato}
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Información Personal */}
            <TabsContent value="personal" className="space-y-4 mt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombre">{t.nombre} *</Label>
                  <Input
                    id="nombre"
                    placeholder={locale === 'es' ? 'Nombre completo' : 'Full name'}
                    value={formNombre}
                    onChange={e => setFormNombre(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="empleadoId">{t.idEmpleado} *</Label>
                  <Input
                    id="empleadoId"
                    placeholder="MES-401"
                    value={formEmpleadoId}
                    onChange={e => setFormEmpleadoId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="posicion">{t.puesto} *</Label>
                  <Input
                    id="posicion"
                    placeholder={locale === 'es' ? 'Ej: Mesero Jr.' : 'e.g. Jr. Waiter'}
                    value={formPosicion}
                    onChange={e => setFormPosicion(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="posicionEn">{t.puestoEn}</Label>
                  <Input
                    id="posicionEn"
                    placeholder="e.g. Jr. Waiter"
                    value={formPosicionEn}
                    onChange={e => setFormPosicionEn(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.departamento}</Label>
                  <Select value={formDepartamento} onValueChange={handleDepartamentoChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.seleccionar} />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTAMENTOS.map(d => (
                        <SelectItem key={d.es} value={d.es}>
                          {locale === 'es' ? d.es : d.en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t.propiedad}</Label>
                  <Select
                    value={formPropiedadId || (selectedProperty !== 'all' ? selectedProperty : '')}
                    onValueChange={setFormPropiedadId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.seleccionar} />
                    </SelectTrigger>
                    <SelectContent>
                      {propiedades.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {locale === 'es' ? p.nombre : (p.nombreEn || p.nombre)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaIngreso" className="flex items-center gap-1.5">
                    <Calendar className="size-3.5" />
                    {t.fechaIngreso}
                  </Label>
                  <Input
                    id="fechaIngreso"
                    type="date"
                    value={formFechaIngreso}
                    onChange={e => setFormFechaIngreso(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="foto" className="flex items-center gap-1.5">
                    {t.foto}
                  </Label>
                  <Input
                    id="foto"
                    placeholder="https://..."
                    value={formFoto}
                    onChange={e => setFormFoto(e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: Horario y Contrato */}
            <TabsContent value="horario" className="space-y-4 mt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Clock className="size-3.5" />
                    {t.tipoJornada}
                  </Label>
                  <Select value={formTipoJornada} onValueChange={setFormTipoJornada}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fijo">{t.fijo}</SelectItem>
                      <SelectItem value="mixto">{t.mixto}</SelectItem>
                      <SelectItem value="variable">{t.variable}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Sun className="size-3.5" />
                    {t.turnoPreferido}
                  </Label>
                  <Select value={formTurnoPreferido} onValueChange={setFormTurnoPreferido}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="matutino">{t.matutino}</SelectItem>
                      <SelectItem value="vespertino">{t.vespertino}</SelectItem>
                      <SelectItem value="nocturno">{t.nocturno}</SelectItem>
                      <SelectItem value="mixto">{t.mixto}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horarioEntrada">{t.horarioEntrada}</Label>
                  <Input
                    id="horarioEntrada"
                    type="time"
                    value={formHorarioEntrada}
                    onChange={e => setFormHorarioEntrada(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horarioSalida">{t.horarioSalida}</Label>
                  <Input
                    id="horarioSalida"
                    type="time"
                    value={formHorarioSalida}
                    onChange={e => setFormHorarioSalida(e.target.value)}
                  />
                </div>
              </div>

              {/* Días de trabajo */}
              <div className="space-y-2">
                <Label>{t.diasTrabajo}</Label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {DIAS_SEMANA.map(dia => (
                    <div key={dia} className="flex items-center gap-1.5">
                      <Checkbox
                        id={`dia-${dia}`}
                        checked={formDiasTrabajo.includes(dia)}
                        onCheckedChange={() => handleDiaToggle(dia)}
                      />
                      <Label htmlFor={`dia-${dia}`} className="text-xs cursor-pointer">
                        {formatDiaName(dia, locale)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cubre turnos */}
              <div className="flex items-center gap-3">
                <Switch
                  id="cubreTurnos"
                  checked={formCubreTurnos}
                  onCheckedChange={setFormCubreTurnos}
                />
                <Label htmlFor="cubreTurnos" className="cursor-pointer">{t.cubreTurnos}</Label>
              </div>

              <Separator />

              {/* Contrato */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Briefcase className="size-3.5" />
                    {t.tipoContrato}
                  </Label>
                  <Select value={formTipoContrato} onValueChange={setFormTipoContrato}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="indefinido">{t.indefinido}</SelectItem>
                      <SelectItem value="temporal">{t.temporal}</SelectItem>
                      <SelectItem value="eventual">{t.eventual}</SelectItem>
                      <SelectItem value="practica">{t.practica}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salario" className="flex items-center gap-1.5">
                    <DollarSign className="size-3.5" />
                    {t.salario}
                  </Label>
                  <Input
                    id="salario"
                    type="number"
                    placeholder="0.00"
                    value={formSalario}
                    onChange={e => setFormSalario(e.target.value)}
                  />
                </div>
                {formTipoContrato !== 'indefinido' && (
                  <div className="space-y-2">
                    <Label htmlFor="fechaFinContrato" className="flex items-center gap-1.5">
                      <Calendar className="size-3.5" />
                      {t.fechaFinContrato}
                    </Label>
                    <Input
                      id="fechaFinContrato"
                      type="date"
                      value={formFechaFinContrato}
                      onChange={e => setFormFechaFinContrato(e.target.value)}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>{t.estado}</Label>
                  <Select value={formEstado} onValueChange={setFormEstado}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="onboarding">{t.onboarding}</SelectItem>
                      <SelectItem value="activo">{t.activo}</SelectItem>
                      <SelectItem value="offboarding">{t.offboarding}</SelectItem>
                      <SelectItem value="inactivo">{t.inactivo}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              {tc.cancel}
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700 text-white"
              onClick={handleCreateEmpleado}
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {t.guardando}
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  {t.guardar}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
