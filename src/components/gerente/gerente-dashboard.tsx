'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { translations } from '@/lib/i18n'
import { formatCurrency, getCurrencyLabel } from '@/lib/currency'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  LayoutDashboard,
  Users,
  Package,
  DollarSign,
  GraduationCap,
  Settings,
  LogOut,
  Globe,
  TrendingUp,
  AlertTriangle,
  Plus,
  Pencil,
  Trash2,
  Award,
  Hotel,
  ChevronDown,
  Search,
  Star,
  Heart,
  BookOpen,
  BarChart3,
  Save,
  X,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────
interface Empleado {
  id: string
  empleadoId: string
  nombre: string
  posicion: string
  posicionEn: string | null
  departamento: string
  departamentoEn: string | null
  estado: string
  puntuacionConocimiento: number
  puntuacionVentas: number
  puntuacionHospitalidad: number
  puntuacionTotal: number
  totalUpselling: number
  npsPromedio: number
  cursosCompletados: number
  cursosEnProgreso: number
  indiceFelicidad: number
  riesgoRotacion: number
  fechaIngreso: string
  propiedadId: string
}

interface Servicio {
  id: string
  nombre: string
  nombreEn: string | null
  descripcion: string | null
  descripcionEn: string | null
  categoria: string
  categoriaEn: string | null
  esUpselling: boolean
  precioNormal: number
  precioUpselling: number | null
  objetivoUpselling: string | null
  objetivoUpsellingEn: string | null
  disponible: boolean
  propiedadId: string
}

interface Venta {
  id: string
  empleadoId: string
  empleadoNombre: string
  servicioNombre: string
  cantidad: number
  montoTotal: number
  esUpselling: boolean
  calificacionNps: number | null
  fecha: string
}

interface Curso {
  id: string
  nombre: string
  nombreEn: string | null
  categoria: string
  modalidad: string
  duracion: number
  inscritos: number
  completados: number
  tasaCompletado: number
}

interface Propiedad {
  id: string
  nombre: string
  nombreEn: string | null
  tipo: string
  region: string
  moneda: string
}

interface CurrencyConfig {
  currency: string
  symbol: string
  exchangeRate: number
}

// ─── Helper Functions ─────────────────────────────────────────
function mapEmpleado(apiEmp: Record<string, unknown>): Empleado {
  return {
    id: apiEmp.id as string,
    empleadoId: apiEmp.empleadoId as string,
    nombre: apiEmp.nombre as string,
    posicion: apiEmp.posicion as string,
    posicionEn: (apiEmp.posicionEn as string | null) ?? null,
    departamento: apiEmp.departamento as string,
    departamentoEn: (apiEmp.departamentoEn as string | null) ?? null,
    estado: apiEmp.estado as string,
    puntuacionConocimiento: (apiEmp.puntuacionConocimiento as number) || 0,
    puntuacionVentas: (apiEmp.puntuacionVentas as number) || 0,
    puntuacionHospitalidad: (apiEmp.puntuacionHospitalidad as number) || 0,
    puntuacionTotal: (apiEmp.puntuacionTotal as number) || 0,
    totalUpselling: (apiEmp.totalUpselling as number) || 0,
    npsPromedio: (apiEmp.npsPromedio as number) || 0,
    cursosCompletados: (apiEmp.cursosCompletados as number) || 0,
    cursosEnProgreso: (apiEmp.cursosEnProgreso as number) || 0,
    indiceFelicidad: (apiEmp.indiceFelicidad as number) || 80,
    riesgoRotacion: (apiEmp.riesgoBaja as number) || (apiEmp.riesgoRotacion as number) || 0,
    fechaIngreso: apiEmp.fechaIngreso as string,
    propiedadId: apiEmp.propiedadId as string,
  }
}

function mapServicio(apiSrv: Record<string, unknown>): Servicio {
  return {
    id: apiSrv.id as string,
    nombre: apiSrv.nombre as string,
    nombreEn: (apiSrv.nombreEn as string | null) ?? null,
    descripcion: (apiSrv.descripcion as string | null) ?? null,
    descripcionEn: (apiSrv.descripcionEn as string | null) ?? null,
    categoria: apiSrv.categoria as string,
    categoriaEn: (apiSrv.categoriaEn as string | null) ?? null,
    esUpselling: apiSrv.esUpselling as boolean,
    precioNormal: apiSrv.precioNormal as number,
    precioUpselling: (apiSrv.precioUpselling as number | null) ?? null,
    objetivoUpselling: (apiSrv.objetivoUpselling as string | null) ?? null,
    objetivoUpsellingEn: (apiSrv.objetivoUpsellingEn as string | null) ?? null,
    disponible: apiSrv.disponible as boolean,
    propiedadId: apiSrv.propiedadId as string,
  }
}

function estadoLabel(estado: string, locale: string): string {
  const labels: Record<string, Record<string, string>> = {
    activo: { es: 'Activo', en: 'Active' },
    onboarding: { es: 'Onboarding', en: 'Onboarding' },
    offboarding: { es: 'Offboarding', en: 'Offboarding' },
    inactivo: { es: 'Inactivo', en: 'Inactive' },
    active: { es: 'Activo', en: 'Active' },
  }
  return labels[estado]?.[locale] || estado
}

function estadoBadge(estado: string): string {
  const badges: Record<string, string> = {
    activo: 'bg-emerald-100 text-emerald-700',
    active: 'bg-emerald-100 text-emerald-700',
    onboarding: 'bg-sky-100 text-sky-700',
    offboarding: 'bg-amber-100 text-amber-700',
    inactivo: 'bg-gray-100 text-gray-600',
  }
  return badges[estado] || 'bg-gray-100 text-gray-600'
}

function categoriaLabel(cat: string, t: typeof translations.es): string {
  const map: Record<string, string> = {
    platillo: t.serviciosAdmin.platillo,
    bebida: t.serviciosAdmin.bebida,
    tour: t.serviciosAdmin.tour,
    masaje: t.serviciosAdmin.masaje,
    habitacion: t.serviciosAdmin.habitacion,
    experiencia: t.serviciosAdmin.experiencia,
    paquete: t.serviciosAdmin.paquete,
    otro: t.serviciosAdmin.otro,
  }
  return map[cat] || cat
}

const categorias = ['platillo', 'bebida', 'tour', 'masaje', 'habitacion', 'experiencia', 'paquete', 'otro']

const positionsByType: Record<string, string[]> = {
  hotel: ['Recepcionista', 'Conserje', 'Botones', 'Mesero', 'Chef', 'Ama de Llaves', 'Gerente de Turno', 'Barman', 'Bellboy', 'Room Service'],
  restaurante: ['Mesero', 'Capitán', 'Barman', 'Host', 'Chef', 'Sous Chef', 'Runner', 'Cajero'],
  bar: ['Barman', 'Barback', 'Cajero', 'Host', 'Mixólogo'],
  spa: ['Terapeuta', 'Recepcionista', 'Masajista', 'Esteticista'],
  resort: ['Animador', 'Mesero', 'Recepcionista', 'Conserje', 'Lifeguard', 'Barman', 'Chef', 'Botones'],
  cafe: ['Barista', 'Cajero', 'Pastelero', 'Runner'],
  discoteca: ['Barman', 'Cajero', 'Seguridad', 'Host', 'DJ'],
  club_playa: ['Mesero', 'Barman', 'Lifeguard', 'Animador', 'Recepcionista'],
}

// ─── Component ────────────────────────────────────────────────
export function GerenteDashboard() {
  const { userPropertyId, userName, locale, setLocale, gerenteView, setGerenteView, logout } = useAppStore()
  const t = translations[locale]
  const [loading, setLoading] = useState(true)

  // Data state
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [ventas, setVentas] = useState<Venta[]>([])
  const [propiedad, setPropiedad] = useState<Propiedad | null>(null)
  const [cursos, setCursos] = useState<Curso[]>([])
  const [currencyConfig, setCurrencyConfig] = useState<CurrencyConfig | null>(null)

  // Dialog state
  const [showAddEmpleado, setShowAddEmpleado] = useState(false)
  const [showAddServicio, setShowAddServicio] = useState(false)
  const [editServicio, setEditServicio] = useState<Servicio | null>(null)
  const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(null)

  // Form state - Empleado
  const [newEmp, setNewEmp] = useState({ nombre: '', empleadoId: '', posicion: '', departamento: '' })

  // Form state - Servicio
  const emptyServ = {
    nombre: '', nombreEn: '', categoria: 'platillo', precioNormal: 0,
    esUpselling: false, precioUpselling: 0, objetivoUpselling: '', descripcion: '', descripcionEn: '',
  }
  const [servForm, setServForm] = useState(emptyServ)

  // Form state - Config
  const [configNombre, setConfigNombre] = useState('')
  const [configTipo, setConfigTipo] = useState('')
  const [configRegion, setConfigRegion] = useState('')
  const [configMoneda, setConfigMoneda] = useState('MXN')
  const [configSimbolo, setConfigSimbolo] = useState('')
  const [configTasa, setConfigTasa] = useState(1)

  // Search state
  const [searchEmpleado, setSearchEmpleado] = useState('')

  // ─── Data Fetching ──────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!userPropertyId) return
    setLoading(true)
    try {
      const [empRes, servRes, ventRes, propRes, configRes, capRes] = await Promise.all([
        fetch(`/api/empleados?propiedadId=${userPropertyId}`).catch(() => ({ json: () => [] })),
        fetch(`/api/servicios?propiedadId=${userPropertyId}`).catch(() => ({ json: () => [] })),
        fetch(`/api/ventas?propiedadId=${userPropertyId}`).catch(() => ({ json: () => ({ ventas: [] }) })),
        fetch(`/api/propiedades`).catch(() => ({ json: () => [] })),
        fetch(`/api/config?propertyId=${userPropertyId}`).catch(() => ({ json: () => null })),
        fetch(`/api/capacitaciones?propiedadId=${userPropertyId}`).catch(() => ({ json: () => [] })),
      ])
      const [empData, servData, ventData, propData, configData, capData] = await Promise.all([
        empRes.json(), servRes.json(), ventRes.json(), propRes.json(), configRes.json(), capRes.json(),
      ])

      setEmpleados(Array.isArray(empData) ? empData.map((e: Record<string, unknown>) => mapEmpleado(e)) : [])
      setServicios(Array.isArray(servData) ? servData.map((s: Record<string, unknown>) => mapServicio(s)) : [])

      const ventasArr = Array.isArray((ventData as Record<string, unknown>)?.ventas)
        ? (ventData as Record<string, unknown>).ventas as Record<string, unknown>[]
        : Array.isArray(ventData)
          ? ventData as Record<string, unknown>[]
          : []
      setVentas(ventasArr.map((v: Record<string, unknown>) => ({
        id: v.id as string,
        empleadoId: v.empleadoId as string,
        empleadoNombre: ((v.empleado as Record<string, unknown>)?.nombre as string) || '',
        servicioNombre: (v.nombreServicio as string) || '',
        cantidad: (v.cantidad as number) || 1,
        montoTotal: (v.montoTotal as number) || 0,
        esUpselling: (v.esUpselling as boolean) || false,
        calificacionNps: (v.calificacionNPS as number) ?? null,
        fecha: (v.fechaVenta as string) || (v.createdAt as string) || '',
      })))

      if (Array.isArray(propData)) {
        const prop = propData.find((p: Record<string, unknown>) => p.id === userPropertyId) as Record<string, unknown> | undefined
        if (prop) {
          setPropiedad({
            id: prop.id as string,
            nombre: prop.nombre as string,
            nombreEn: (prop.nombreEn as string | null) ?? null,
            tipo: prop.tipo as string,
            region: prop.region as string,
            moneda: (prop.moneda as string) || 'MXN',
          })
          setConfigNombre(prop.nombre as string)
          setConfigTipo(prop.tipo as string)
          setConfigRegion(prop.region as string)
          setConfigMoneda((prop.moneda as string) || 'MXN')
        }
      }

      if (configData && typeof configData === 'object' && 'currency' in (configData as Record<string, unknown>)) {
        const cc = (configData as Record<string, unknown>).currency as Record<string, unknown>
        setCurrencyConfig({
          currency: cc.currency as string,
          symbol: cc.symbol as string,
          exchangeRate: cc.exchangeRate as number,
        })
        setConfigMoneda(cc.currency as string)
        setConfigSimbolo(cc.symbol as string)
        setConfigTasa(cc.exchangeRate as number)
      }

      const capArr = Array.isArray(capData) ? capData : []
      setCursos(capArr.map((c: Record<string, unknown>) => ({
        id: c.id as string,
        nombre: (c.titulo as string) || '',
        nombreEn: (c.tituloEn as string | null) ?? null,
        categoria: c.categoria as string,
        modalidad: c.modalidad as string,
        duracion: (c.duracion as number) || 0,
        inscritos: (c.inscripcionesCount as number) || 0,
        completados: (c.completadosCount as number) || 0,
        tasaCompletado: (c.tasaCompletado as number) || 0,
      })))
    } catch {
      // silently handle fetch errors
    } finally {
      setLoading(false)
    }
  }, [userPropertyId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ─── Computed Values ────────────────────────────────
  const moneda = propiedad?.moneda || 'USD'
  const empleadosActivos = empleados.filter((e) => e.estado === 'activo')
  const totalUpselling = empleadosActivos.reduce((sum, e) => sum + e.totalUpselling, 0)
  const npsPromedio = empleadosActivos.length > 0
    ? Math.round((empleadosActivos.reduce((sum, e) => sum + e.npsPromedio, 0) / empleadosActivos.length) * 10) / 10
    : 0
  const riesgoAlto = empleados.filter((e) => e.riesgoRotacion >= 70)
  const topPerformers = [...empleadosActivos].sort((a, b) => b.puntuacionTotal - a.puntuacionTotal).slice(0, 5)

  const ventasUpselling = ventas.filter((v) => v.esUpselling)
  const montoTotalVentas = ventas.reduce((s, v) => s + v.montoTotal, 0)

  // Services by category
  const serviciosByCategory = categorias.reduce((acc, cat) => {
    const items = servicios.filter((s) => s.categoria === cat)
    if (items.length > 0) acc[cat] = items
    return acc
  }, {} as Record<string, Servicio[]>)

  // Filtered employees
  const filteredEmpleados = searchEmpleado
    ? empleados.filter((e) =>
        e.nombre.toLowerCase().includes(searchEmpleado.toLowerCase()) ||
        e.empleadoId.toLowerCase().includes(searchEmpleado.toLowerCase()) ||
        e.posicion.toLowerCase().includes(searchEmpleado.toLowerCase())
      )
    : empleados

  // ─── CRUD Handlers ──────────────────────────────────

  const handleAddEmpleado = async () => {
    try {
      const res = await fetch('/api/empleados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newEmp,
          propiedadId: userPropertyId,
          fechaIngreso: new Date().toISOString(),
          estado: 'onboarding',
        }),
      })
      if (res.ok) {
        const created = await res.json()
        setEmpleados((prev) => [...prev, mapEmpleado(created)])
        toast.success(locale === 'es' ? 'Empleado agregado exitosamente' : 'Employee added successfully')
        setShowAddEmpleado(false)
        setNewEmp({ nombre: '', empleadoId: '', posicion: '', departamento: '' })
      } else {
        toast.error(t.common.error)
      }
    } catch {
      toast.error(t.common.error)
    }
  }

  const handleAddServicio = async () => {
    try {
      const body = {
        nombre: servForm.nombre,
        nombreEn: servForm.nombreEn || null,
        categoria: servForm.categoria,
        precioNormal: servForm.precioNormal,
        esUpselling: servForm.esUpselling,
        precioUpselling: servForm.esUpselling ? servForm.precioUpselling : null,
        objetivoUpselling: servForm.esUpselling ? servForm.objetivoUpselling : null,
        descripcion: servForm.descripcion || null,
        descripcionEn: servForm.descripcionEn || null,
        disponible: true,
        propiedadId: userPropertyId,
      }
      const res = await fetch('/api/servicios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const created = await res.json()
        setServicios((prev) => [...prev, mapServicio(created)])
        toast.success(t.serviciosAdmin.creado)
        setShowAddServicio(false)
        setServForm(emptyServ)
      } else {
        toast.error(t.serviciosAdmin.errorCrear)
      }
    } catch {
      toast.error(t.common.error)
    }
  }

  const handleUpdateServicio = async () => {
    if (!editServicio) return
    try {
      const body = {
        nombre: servForm.nombre,
        nombreEn: servForm.nombreEn || null,
        categoria: servForm.categoria,
        precioNormal: servForm.precioNormal,
        esUpselling: servForm.esUpselling,
        precioUpselling: servForm.esUpselling ? servForm.precioUpselling : null,
        objetivoUpselling: servForm.esUpselling ? servForm.objetivoUpselling : null,
        descripcion: servForm.descripcion || null,
        descripcionEn: servForm.descripcionEn || null,
      }
      const res = await fetch(`/api/servicios/${editServicio.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const updated = await res.json()
        setServicios((prev) => prev.map((s) => s.id === editServicio.id ? mapServicio(updated) : s))
        toast.success(t.serviciosAdmin.actualizado)
        setShowAddServicio(false)
        setEditServicio(null)
        setServForm(emptyServ)
      } else {
        toast.error(t.common.error)
      }
    } catch {
      toast.error(t.common.error)
    }
  }

  const handleDeleteServicio = async (id: string) => {
    try {
      const res = await fetch(`/api/servicios/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setServicios((prev) => prev.filter((s) => s.id !== id))
        toast.success(t.serviciosAdmin.eliminado)
      } else {
        toast.error(t.common.error)
      }
    } catch {
      toast.error(t.common.error)
    }
  }

  const handleSaveConfig = async () => {
    try {
      const res = await fetch(`/api/propiedades/${userPropertyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: configNombre,
          tipo: configTipo,
          region: configRegion,
          moneda: configMoneda,
        }),
      })
      if (res.ok) {
        setPropiedad((prev) => prev ? { ...prev, nombre: configNombre, tipo: configTipo, region: configRegion, moneda: configMoneda } : prev)
        toast.success(locale === 'es' ? 'Configuración guardada' : 'Settings saved')
      } else {
        toast.error(t.common.error)
      }
    } catch {
      toast.error(t.common.error)
    }
  }

  const openEditServicio = (s: Servicio) => {
    setEditServicio(s)
    setServForm({
      nombre: s.nombre,
      nombreEn: s.nombreEn || '',
      categoria: s.categoria,
      precioNormal: s.precioNormal,
      esUpselling: s.esUpselling,
      precioUpselling: s.precioUpselling || 0,
      objetivoUpselling: s.objetivoUpselling || '',
      descripcion: s.descripcion || '',
      descripcionEn: s.descripcionEn || '',
    })
    setShowAddServicio(true)
  }

  // ─── Loading State ──────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">{t.common.cargando}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ─── Sticky Header ────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Hotel className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-gray-900">
                {propiedad ? (locale === 'en' && propiedad.nombreEn ? propiedad.nombreEn : propiedad.nombre) : userName}
              </h1>
              <p className="text-[10px] text-gray-500">{propiedad?.tipo} · {propiedad?.region}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-[10px]">{getCurrencyLabel(moneda)}</Badge>
            <div className="flex rounded-md overflow-hidden border">
              <button
                onClick={() => setLocale('es')}
                className={`px-2 py-1 text-[10px] font-semibold transition-colors ${locale === 'es' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                ES
              </button>
              <button
                onClick={() => setLocale('en')}
                className={`px-2 py-1 text-[10px] font-semibold transition-colors ${locale === 'en' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                EN
              </button>
            </div>
            <Button variant="ghost" size="sm" onClick={logout} className="text-gray-500 hover:text-gray-700">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* ─── Main Content with Tabs ───────────────────── */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        <Tabs value={gerenteView} onValueChange={(v) => setGerenteView(v as typeof gerenteView)} className="space-y-4">
          <TabsList className="bg-white border shadow-sm h-auto p-1 flex-wrap gap-1">
            <TabsTrigger value="dashboard" className="text-xs gap-1 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.nav.dashboard}</span>
            </TabsTrigger>
            <TabsTrigger value="empleados" className="text-xs gap-1 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              <Users className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.nav.empleados}</span>
            </TabsTrigger>
            <TabsTrigger value="servicios" className="text-xs gap-1 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              <Package className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.nav.servicios}</span>
            </TabsTrigger>
            <TabsTrigger value="ventas" className="text-xs gap-1 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              <DollarSign className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.nav.ventas}</span>
            </TabsTrigger>
            <TabsTrigger value="capacitacion" className="text-xs gap-1 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              <GraduationCap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.nav.capacitacion}</span>
            </TabsTrigger>
            <TabsTrigger value="configuracion" className="text-xs gap-1 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.nav.configuracion}</span>
            </TabsTrigger>
          </TabsList>

          {/* ═══════════════ DASHBOARD TAB ═══════════════ */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span className="text-[10px] text-gray-500 uppercase">{t.dashboard.totalEmpleados}</span>
                  </div>
                  <p className="text-2xl font-bold">{empleadosActivos.length}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{locale === 'es' ? `de ${empleados.length} totales` : `of ${empleados.length} total`}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span className="text-[10px] text-gray-500 uppercase">{t.dashboard.npsPromedio}</span>
                  </div>
                  <p className="text-2xl font-bold">{npsPromedio}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{t.dashboard.nps}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-amber-600" />
                    <span className="text-[10px] text-gray-500 uppercase">{t.dashboard.ingresosUpselling}</span>
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(totalUpselling, moneda)}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{t.dashboard.upselling}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-[10px] text-gray-500 uppercase">{t.dashboard.empleadosEnRiesgo}</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">{riesgoAlto.length}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{locale === 'es' ? 'riesgo ≥ 70%' : 'risk ≥ 70%'}</p>
                </CardContent>
              </Card>
            </div>

            {/* Sales Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  {locale === 'es' ? 'Resumen de Ventas' : 'Sales Summary'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {locale === 'es' ? 'Vista general de las ventas registradas' : 'Overview of registered sales'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">{t.ventas.montoTotal}</p>
                    <p className="font-bold text-lg">{formatCurrency(montoTotalVentas, moneda)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">{t.ventas.totalUpselling}</p>
                    <p className="font-bold text-lg">{formatCurrency(ventasUpselling.reduce((s, v) => s + v.montoTotal, 0), moneda)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">{t.ventas.tasaUpselling}</p>
                    <p className="font-bold text-lg">
                      {ventas.length > 0 ? Math.round((ventasUpselling.length / ventas.length) * 100) : 0}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">{t.ventas.ventasRecientes}</p>
                    <p className="font-bold text-lg">{ventas.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t.dashboard.topPerformers}</CardTitle>
                <CardDescription className="text-xs">
                  {locale === 'es' ? 'Empleados con mayor puntuación total' : 'Employees with highest total score'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topPerformers.map((emp, i) => (
                    <div key={emp.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700">
                        {i + 1}
                      </div>
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs bg-emerald-50 text-emerald-700">
                          {emp.nombre.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{emp.nombre}</p>
                        <p className="text-[10px] text-gray-500">{emp.posicion}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-700">{Math.round(emp.puntuacionTotal)}</p>
                        <p className="text-[10px] text-gray-500">Score</p>
                      </div>
                    </div>
                  ))}
                  {topPerformers.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">{t.common.sinDatos}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════ EMPLEADOS TAB ═══════════════ */}
          <TabsContent value="empleados" className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h2 className="text-lg font-bold">{t.employees.title}</h2>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    className="pl-8 h-8 text-xs w-full sm:w-48"
                    placeholder={t.employees.search}
                    value={searchEmpleado}
                    onChange={(e) => setSearchEmpleado(e.target.value)}
                  />
                </div>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowAddEmpleado(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  {t.employees.agregar}
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <ScrollArea className="max-h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-xs">{locale === 'es' ? 'Empleado' : 'Employee'}</TableHead>
                        <TableHead className="text-xs">ID</TableHead>
                        <TableHead className="text-xs">{t.employees.posicion}</TableHead>
                        <TableHead className="text-xs">{t.employees.departamento}</TableHead>
                        <TableHead className="text-xs">{t.employees.estado}</TableHead>
                        <TableHead className="text-xs">{t.employees.score}</TableHead>
                        <TableHead className="text-xs">{t.employees.riesgo}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmpleados.map((emp) => (
                        <TableRow
                          key={emp.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => setSelectedEmpleado(emp)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="w-7 h-7">
                                <AvatarFallback className="text-[10px] bg-emerald-50 text-emerald-700">
                                  {emp.nombre.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-sm">{emp.nombre}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-500 text-xs">{emp.empleadoId}</TableCell>
                          <TableCell className="text-xs">{locale === 'en' && emp.posicionEn ? emp.posicionEn : emp.posicion}</TableCell>
                          <TableCell className="text-xs">{locale === 'en' && emp.departamentoEn ? emp.departamentoEn : emp.departamento}</TableCell>
                          <TableCell>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${estadoBadge(emp.estado)}`}>
                              {estadoLabel(emp.estado, locale)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`font-semibold text-xs ${emp.puntuacionTotal >= 70 ? 'text-emerald-600' : emp.puntuacionTotal >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                              {Math.round(emp.puntuacionTotal)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              emp.riesgoRotacion >= 70 ? 'bg-red-100 text-red-700' :
                              emp.riesgoRotacion >= 40 ? 'bg-amber-100 text-amber-700' :
                              'bg-emerald-100 text-emerald-700'
                            }`}>
                              {emp.riesgoRotacion}%
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredEmpleados.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="p-6 text-center text-gray-400 text-sm">
                            {t.employees.noResultados}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Add Employee Dialog */}
            <Dialog open={showAddEmpleado} onOpenChange={setShowAddEmpleado}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{t.employees.agregar}</DialogTitle>
                  <DialogDescription>
                    {locale === 'es' ? 'Ingresa los datos del nuevo empleado' : 'Enter the new employee details'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">{locale === 'es' ? 'Nombre completo' : 'Full name'}</Label>
                    <Input value={newEmp.nombre} onChange={(e) => setNewEmp({ ...newEmp, nombre: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs">ID {locale === 'es' ? 'Empleado' : 'Employee'}</Label>
                    <Input placeholder="MES-501" value={newEmp.empleadoId} onChange={(e) => setNewEmp({ ...newEmp, empleadoId: e.target.value.toUpperCase() })} />
                  </div>
                  <div>
                    <Label className="text-xs">{t.employees.posicion}</Label>
                    <Select value={newEmp.posicion} onValueChange={(v) => setNewEmp({ ...newEmp, posicion: v })}>
                      <SelectTrigger><SelectValue placeholder={t.employees.posicion} /></SelectTrigger>
                      <SelectContent>
                        {(positionsByType[propiedad?.tipo || 'hotel'] || positionsByType.hotel).map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">{t.employees.departamento}</Label>
                    <Input value={newEmp.departamento} onChange={(e) => setNewEmp({ ...newEmp, departamento: e.target.value })} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddEmpleado(false)}>{t.common.cancelar}</Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleAddEmpleado} disabled={!newEmp.nombre || !newEmp.empleadoId}>
                    {t.common.crear}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Employee Detail Dialog */}
            <Dialog open={!!selectedEmpleado} onOpenChange={() => setSelectedEmpleado(null)}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{t.employees.detalle}</DialogTitle>
                  <DialogDescription>
                    {locale === 'es' ? 'Información detallada del empleado' : 'Detailed employee information'}
                  </DialogDescription>
                </DialogHeader>
                {selectedEmpleado && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-emerald-50 text-emerald-700">
                          {selectedEmpleado.nombre.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold">{selectedEmpleado.nombre}</p>
                        <p className="text-xs text-gray-500">{selectedEmpleado.empleadoId} · {locale === 'en' && selectedEmpleado.posicionEn ? selectedEmpleado.posicionEn : selectedEmpleado.posicion}</p>
                        <div className="flex gap-2 mt-1">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${estadoBadge(selectedEmpleado.estado)}`}>
                            {estadoLabel(selectedEmpleado.estado, locale)}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            selectedEmpleado.riesgoRotacion >= 70 ? 'bg-red-100 text-red-700' :
                            selectedEmpleado.riesgoRotacion >= 40 ? 'bg-amber-100 text-amber-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {locale === 'es' ? 'Riesgo' : 'Risk'} {selectedEmpleado.riesgoRotacion}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <Separator />
                    {/* Scores */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase">{t.employees.score}</p>
                      {[
                        { label: t.employees.scoreConocimiento, value: selectedEmpleado.puntuacionConocimiento, color: 'bg-emerald-500', icon: BookOpen },
                        { label: t.employees.scoreVentas, value: selectedEmpleado.puntuacionVentas, color: 'bg-amber-500', icon: DollarSign },
                        { label: t.employees.scoreHospitalidad, value: selectedEmpleado.puntuacionHospitalidad, color: 'bg-rose-400', icon: Heart },
                      ].map((s) => (
                        <div key={s.label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="flex items-center gap-1">
                              <s.icon className="w-3 h-3 text-gray-400" />
                              {s.label}
                            </span>
                            <span className="font-semibold">{Math.round(s.value)}</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${s.color} transition-all`} style={{ width: `${Math.min(100, s.value)}%` }} />
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between text-xs pt-1 border-t">
                        <span className="font-semibold">{locale === 'es' ? 'Puntuación Total' : 'Total Score'}</span>
                        <span className="font-bold text-emerald-700">{Math.round(selectedEmpleado.puntuacionTotal)}</span>
                      </div>
                    </div>
                    <Separator />
                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500 text-xs">{t.ventas.totalUpselling}:</span>
                        <p className="font-semibold">{formatCurrency(selectedEmpleado.totalUpselling, moneda)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs">NPS:</span>
                        <p className="font-semibold">{selectedEmpleado.npsPromedio.toFixed(1)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs">{t.employees.felicidad}:</span>
                        <p className="font-semibold">{Math.round(selectedEmpleado.indiceFelicidad)}%</p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs">{t.employees.cursos}:</span>
                        <p className="font-semibold">{selectedEmpleado.cursosCompletados}/{selectedEmpleado.cursosCompletados + selectedEmpleado.cursosEnProgreso}</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
                      <div>
                        <span>{t.employees.fechaIngreso}:</span>
                        <p className="font-medium text-gray-700">
                          {selectedEmpleado.fechaIngreso ? new Date(selectedEmpleado.fechaIngreso).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US') : '—'}
                        </p>
                      </div>
                      <div>
                        <span>{t.employees.departamento}:</span>
                        <p className="font-medium text-gray-700">
                          {locale === 'en' && selectedEmpleado.departamentoEn ? selectedEmpleado.departamentoEn : selectedEmpleado.departamento}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* ═══════════════ SERVICIOS TAB ═══════════════ */}
          <TabsContent value="servicios" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{t.serviciosAdmin.catalogo}</h2>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => { setEditServicio(null); setServForm(emptyServ); setShowAddServicio(true) }}>
                <Plus className="w-4 h-4 mr-1" />
                {t.serviciosAdmin.agregarServicio}
              </Button>
            </div>

            {/* Services by category */}
            {Object.entries(serviciosByCategory).map(([cat, items]) => (
              <div key={cat}>
                <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                  <Package className="w-3.5 h-3.5 text-emerald-600" />
                  {categoriaLabel(cat, t)} ({items.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((s) => (
                    <Card key={s.id} className={`relative transition-shadow hover:shadow-md ${!s.disponible ? 'opacity-50' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-sm">{s.nombre}</p>
                            {s.nombreEn && <p className="text-[10px] text-gray-400">{s.nombreEn}</p>}
                          </div>
                          {s.esUpselling && (
                            <Badge className="bg-amber-100 text-amber-800 text-[10px]">Upselling</Badge>
                          )}
                        </div>
                        {s.descripcion && (
                          <p className="text-xs text-gray-500 mb-2 line-clamp-2">{s.descripcion}</p>
                        )}
                        <p className="text-lg font-bold text-emerald-700">{formatCurrency(s.precioNormal, moneda)}</p>
                        {s.esUpselling && s.precioUpselling && (
                          <p className="text-xs text-amber-600">↑ {formatCurrency(s.precioUpselling, moneda)}</p>
                        )}
                        {s.objetivoUpselling && (
                          <p className="text-[10px] text-gray-400 mt-1">{s.objetivoUpselling}</p>
                        )}
                        <div className="flex gap-1 mt-3">
                          <Button variant="outline" size="sm" className="h-7 text-xs flex-1" onClick={() => openEditServicio(s)}>
                            <Pencil className="w-3 h-3 mr-1" /> {t.serviciosAdmin.editar}
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 text-xs text-red-600 hover:bg-red-50" onClick={() => handleDeleteServicio(s.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
            {Object.keys(serviciosByCategory).length === 0 && (
              <p className="text-center text-gray-400 py-8">{t.common.sinDatos}</p>
            )}

            {/* Add/Edit Service Dialog */}
            <Dialog open={showAddServicio} onOpenChange={(open) => { setShowAddServicio(open); if (!open) { setEditServicio(null); setServForm(emptyServ) } }}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editServicio ? t.serviciosAdmin.actualizar : t.serviciosAdmin.agregarServicio}</DialogTitle>
                  <DialogDescription>
                    {editServicio
                      ? (locale === 'es' ? 'Modifica los datos del servicio' : 'Modify the service details')
                      : (locale === 'es' ? 'Ingresa los datos del nuevo servicio' : 'Enter the new service details')
                    }
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                  <div>
                    <Label className="text-xs">{t.serviciosAdmin.nombreES}</Label>
                    <Input value={servForm.nombre} onChange={(e) => setServForm({ ...servForm, nombre: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs">{t.serviciosAdmin.nombreEN}</Label>
                    <Input value={servForm.nombreEn} onChange={(e) => setServForm({ ...servForm, nombreEn: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs">{t.serviciosAdmin.categoria}</Label>
                    <Select value={servForm.categoria} onValueChange={(v) => setServForm({ ...servForm, categoria: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {categorias.map((c) => (
                          <SelectItem key={c} value={c}>{categoriaLabel(c, t)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">{t.serviciosAdmin.precioNormal}</Label>
                    <Input type="number" value={servForm.precioNormal} onChange={(e) => setServForm({ ...servForm, precioNormal: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={servForm.esUpselling} onCheckedChange={(v) => setServForm({ ...servForm, esUpselling: v })} />
                    <Label className="text-xs">{t.serviciosAdmin.esUpselling}</Label>
                  </div>
                  {servForm.esUpselling && (
                    <>
                      <div>
                        <Label className="text-xs">{t.serviciosAdmin.precioUpselling}</Label>
                        <Input type="number" value={servForm.precioUpselling} onChange={(e) => setServForm({ ...servForm, precioUpselling: parseFloat(e.target.value) || 0 })} />
                      </div>
                      <div>
                        <Label className="text-xs">{t.serviciosAdmin.objetivoUpselling}</Label>
                        <Input value={servForm.objetivoUpselling} onChange={(e) => setServForm({ ...servForm, objetivoUpselling: e.target.value })} />
                      </div>
                    </>
                  )}
                  <div>
                    <Label className="text-xs">{t.serviciosAdmin.descripcion}</Label>
                    <Textarea value={servForm.descripcion} onChange={(e) => setServForm({ ...servForm, descripcion: e.target.value })} rows={2} />
                  </div>
                  <div>
                    <Label className="text-xs">{t.serviciosAdmin.descripcionEN || (locale === 'es' ? 'Descripción (EN)' : 'Description (EN)')}</Label>
                    <Textarea value={servForm.descripcionEn} onChange={(e) => setServForm({ ...servForm, descripcionEn: e.target.value })} rows={2} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setShowAddServicio(false); setEditServicio(null); setServForm(emptyServ) }}>{t.common.cancelar}</Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={editServicio ? handleUpdateServicio : handleAddServicio} disabled={!servForm.nombre}>
                    {editServicio ? t.common.actualizar : t.common.crear}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* ═══════════════ VENTAS TAB ═══════════════ */}
          <TabsContent value="ventas" className="space-y-4">
            <h2 className="text-lg font-bold">{t.ventas.title}</h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <DollarSign className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <p className="text-[10px] text-gray-500 uppercase">{t.ventas.montoTotal}</p>
                  <p className="text-xl font-bold">{formatCurrency(montoTotalVentas, moneda)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                  <p className="text-[10px] text-gray-500 uppercase">{t.ventas.totalUpselling}</p>
                  <p className="text-xl font-bold">{formatCurrency(ventasUpselling.reduce((s, v) => s + v.montoTotal, 0), moneda)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <BarChart3 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <p className="text-[10px] text-gray-500 uppercase">{t.ventas.tasaUpselling}</p>
                  <p className="text-xl font-bold">
                    {ventas.length > 0 ? Math.round((ventasUpselling.length / ventas.length) * 100) : 0}%
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Star className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                  <p className="text-[10px] text-gray-500 uppercase">{locale === 'es' ? 'NPS Promedio' : 'Avg. NPS'}</p>
                  <p className="text-xl font-bold">
                    {ventas.filter((v) => v.calificacionNps !== null).length > 0
                      ? (ventas.filter((v) => v.calificacionNps !== null).reduce((s, v) => s + (v.calificacionNps || 0), 0) / ventas.filter((v) => v.calificacionNps !== null).length).toFixed(1)
                      : '—'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Sales Table */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t.ventas.ventasRecientes}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="max-h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-xs">{t.ventas.empleado}</TableHead>
                        <TableHead className="text-xs">{t.ventas.servicio}</TableHead>
                        <TableHead className="text-xs">{t.ventas.cantidad}</TableHead>
                        <TableHead className="text-xs">{t.ventas.monto}</TableHead>
                        <TableHead className="text-xs">{t.ventas.upselling}</TableHead>
                        <TableHead className="text-xs">NPS</TableHead>
                        <TableHead className="text-xs">{t.ventas.fecha}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ventas.slice(0, 30).map((v) => (
                        <TableRow key={v.id}>
                          <TableCell className="text-sm">{v.empleadoNombre || '—'}</TableCell>
                          <TableCell className="text-sm text-gray-600">{v.servicioNombre || '—'}</TableCell>
                          <TableCell className="text-sm">{v.cantidad}</TableCell>
                          <TableCell className="text-sm font-semibold">{formatCurrency(v.montoTotal, moneda)}</TableCell>
                          <TableCell>
                            {v.esUpselling ? (
                              <Badge className="bg-amber-100 text-amber-800 text-[10px]">↑ Upselling</Badge>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {v.calificacionNps !== null ? (
                              <span className={`font-semibold ${v.calificacionNps >= 9 ? 'text-emerald-600' : v.calificacionNps >= 7 ? 'text-amber-600' : 'text-red-600'}`}>
                                {v.calificacionNps}
                              </span>
                            ) : '—'}
                          </TableCell>
                          <TableCell className="text-xs text-gray-500">
                            {v.fecha ? new Date(v.fecha).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US', { month: 'short', day: 'numeric' }) : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                      {ventas.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="p-6 text-center text-gray-400 text-sm">{t.ventas.noVentas}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════ CAPACITACIÓN TAB ═══════════════ */}
          <TabsContent value="capacitacion" className="space-y-4">
            <h2 className="text-lg font-bold">{t.capacitacion.title}</h2>

            {/* Course Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cursos.map((curso) => (
                <Card key={curso.id} className="transition-shadow hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{curso.nombre}</h3>
                        {curso.nombreEn && <p className="text-[10px] text-gray-400 truncate">{curso.nombreEn}</p>}
                      </div>
                      <Badge variant="outline" className="text-[10px] ml-2 shrink-0">
                        {curso.modalidad === 'virtual' ? t.capacitacion.virtual : t.capacitacion.presencial}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="text-[10px]">{curso.categoria}</Badge>
                      <span className="text-[10px] text-gray-400">{curso.duracion} {t.capacitacion.minutos}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs mb-2">
                      <div>
                        <p className="font-bold text-gray-700">{curso.inscritos}</p>
                        <p className="text-[10px] text-gray-400">{t.capacitacion.inscritos}</p>
                      </div>
                      <div>
                        <p className="font-bold text-emerald-600">{curso.completados}</p>
                        <p className="text-[10px] text-gray-400">{t.capacitacion.completados}</p>
                      </div>
                      <div>
                        <p className="font-bold">{curso.tasaCompletado}%</p>
                        <p className="text-[10px] text-gray-400">{t.capacitacion.tasaCompletado}</p>
                      </div>
                    </div>
                    <Progress value={curso.tasaCompletado} className="h-1.5" />
                  </CardContent>
                </Card>
              ))}
              {cursos.length === 0 && (
                <p className="text-center text-gray-400 py-8 col-span-3">{t.capacitacion.noCursos}</p>
              )}
            </div>

            {/* Employee Progress Table */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t.capacitacion.progreso}</CardTitle>
                <CardDescription className="text-xs">
                  {locale === 'es' ? 'Progreso de capacitación por empleado' : 'Training progress by employee'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="max-h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-xs">{locale === 'es' ? 'Empleado' : 'Employee'}</TableHead>
                        <TableHead className="text-xs">{t.capacitacion.completados}</TableHead>
                        <TableHead className="text-xs">{locale === 'es' ? 'En Progreso' : 'In Progress'}</TableHead>
                        <TableHead className="text-xs">{t.employees.score}</TableHead>
                        <TableHead className="text-xs">{t.employees.felicidad}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {empleadosActivos.slice(0, 15).map((emp) => (
                        <TableRow key={emp.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-[9px] bg-emerald-50 text-emerald-700">
                                  {emp.nombre.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">{emp.nombre}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            <span className="font-semibold text-emerald-600">{emp.cursosCompletados}</span>
                          </TableCell>
                          <TableCell className="text-sm">
                            <span className="font-semibold text-amber-600">{emp.cursosEnProgreso}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={emp.puntuacionConocimiento} className="h-1.5 w-16" />
                              <span className="text-xs font-semibold">{Math.round(emp.puntuacionConocimiento)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Heart className={`w-3 h-3 ${emp.indiceFelicidad >= 70 ? 'text-emerald-500' : emp.indiceFelicidad >= 50 ? 'text-amber-500' : 'text-red-500'}`} />
                              <span className="text-xs">{Math.round(emp.indiceFelicidad)}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {empleadosActivos.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="p-6 text-center text-gray-400 text-sm">{t.common.sinDatos}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════ CONFIGURACIÓN TAB ═══════════════ */}
          <TabsContent value="configuracion" className="space-y-4">
            <h2 className="text-lg font-bold">{t.settings.title}</h2>

            {/* Property Info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Hotel className="w-4 h-4 text-emerald-600" />
                  {t.settings.propiedad}
                </CardTitle>
                <CardDescription className="text-xs">
                  {locale === 'es' ? 'Información general de la propiedad' : 'General property information'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">{locale === 'es' ? 'Nombre' : 'Name'}</Label>
                    <Input value={configNombre} onChange={(e) => setConfigNombre(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">{locale === 'es' ? 'Tipo' : 'Type'}</Label>
                    <Select value={configTipo} onValueChange={setConfigTipo}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hotel">Hotel</SelectItem>
                        <SelectItem value="restaurante">Restaurante</SelectItem>
                        <SelectItem value="bar">Bar</SelectItem>
                        <SelectItem value="spa">Spa</SelectItem>
                        <SelectItem value="resort">Resort</SelectItem>
                        <SelectItem value="cafe">Café</SelectItem>
                        <SelectItem value="discoteca">Discoteca</SelectItem>
                        <SelectItem value="club_playa">Club de Playa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">{t.settings.region}</Label>
                    <Input value={configRegion} onChange={(e) => setConfigRegion(e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Currency Config */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  {locale === 'es' ? 'Configuración de Moneda' : 'Currency Configuration'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {locale === 'es' ? 'Moneda y tasa de cambio' : 'Currency and exchange rate'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">{locale === 'es' ? 'Moneda' : 'Currency'}</Label>
                    <Select value={configMoneda} onValueChange={setConfigMoneda}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="MXN">MXN</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="COP">COP</SelectItem>
                        <SelectItem value="ARS">ARS</SelectItem>
                        <SelectItem value="BRL">BRL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">{locale === 'es' ? 'Símbolo' : 'Symbol'}</Label>
                    <Input value={configSimbolo || getCurrencyLabel(configMoneda)} disabled />
                  </div>
                  <div>
                    <Label className="text-xs">{locale === 'es' ? 'Tasa de Cambio' : 'Exchange Rate'}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={configTasa}
                      onChange={(e) => setConfigTasa(parseFloat(e.target.value) || 1)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Positions List */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  {locale === 'es' ? 'Posiciones' : 'Positions'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {locale === 'es' ? 'Posiciones disponibles para este tipo de propiedad' : 'Available positions for this property type'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(positionsByType[configTipo || propiedad?.tipo || 'hotel'] || positionsByType.hotel).map((pos) => (
                    <Badge key={pos} variant="outline" className="text-xs py-1 px-2">{pos}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button className="bg-emerald-600 hover:bg-emerald-700 min-w-[160px]" onClick={handleSaveConfig}>
                <Save className="w-4 h-4 mr-2" />
                {t.common.guardar}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* ─── Sticky Footer ────────────────────────────── */}
      <footer className="mt-auto border-t bg-white px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-emerald-600 flex items-center justify-center">
              <Hotel className="w-3 h-3 text-white" />
            </div>
            <p className="text-xs text-gray-500">
              {propiedad ? (locale === 'en' && propiedad.nombreEn ? propiedad.nombreEn : propiedad.nombre) : 'HospitalityUP'}
              {propiedad?.region && <span> · {propiedad.region}</span>}
            </p>
          </div>
          <p className="text-[10px] text-gray-400">
            © 2025 HospitalityUP
          </p>
        </div>
      </footer>
    </div>
  )
}
