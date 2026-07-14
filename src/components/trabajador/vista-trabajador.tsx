'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { translations } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import {
  ShoppingCart,
  Target,
  TrendingUp,
  Star,
  DollarSign,
  User,
  Building2,
  ChevronRight,
  MapPin,
  Layers,
  Filter,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────
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
  propiedad: { id: string; nombre: string; nombreEn: string | null; moneda: string }
}

interface Empleado {
  id: string
  empleadoId: string
  nombre: string
  posicion: string
  propiedadId: string
  propiedad: { id: string; nombre: string; nombreEn: string | null; region: string; tipo?: string; empresaId?: string | null; empresa?: { id: string; nombre: string } | null }
}

interface Empresa {
  id: string
  nombre: string
  nombreEn: string | null
  tipo: string
}

interface PropiedadWithEmpresa {
  id: string
  nombre: string
  nombreEn: string | null
  region: string
  tipo: string
  empresaId: string | null
  empresa: { id: string; nombre: string } | null
}

interface VentaDia {
  id: string
  nombreServicio: string | null
  montoTotal: number
  montoUpselling: number
  esUpselling: boolean
  calificacionNPS: number | null
  cantidad: number
  fechaVenta: string
}

// ─── Category definitions ─────────────────────────────────────
const categorias = [
  { key: 'todos', es: 'Todos', en: 'All' },
  { key: 'platillo', es: 'Platillos', en: 'Dishes' },
  { key: 'bebida', es: 'Bebidas', en: 'Drinks' },
  { key: 'tour', es: 'Tours', en: 'Tours' },
  { key: 'masaje', es: 'Masajes', en: 'Massages' },
  { key: 'habitacion', es: 'Habitaciones', en: 'Rooms' },
  { key: 'experiencia', es: 'Experiencias', en: 'Experiences' },
  { key: 'paquete', es: 'Paquetes', en: 'Packages' },
]

export function VistaTrabajador() {
  const { locale, selectedProperty } = useAppStore()
  const t = translations[locale].trabajador
  const tc = translations[locale].common

  // State
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [propiedades, setPropiedades] = useState<PropiedadWithEmpresa[]>([])
  const [empresaFiltro, setEmpresaFiltro] = useState<string>('all') // all, sin_grupo, or empresa.id
  const [regionFiltro, setRegionFiltro] = useState<string>('all')
  const [propiedadFiltro, setPropiedadFiltro] = useState<string>('all')
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<Empleado | null>(null)
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [ventasDia, setVentasDia] = useState<VentaDia[]>([])
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos')
  const [loadingServicios, setLoadingServicios] = useState(false)

  // Venta dialog
  const [showVentaDialog, setShowVentaDialog] = useState(false)
  const [servicioVenta, setServicioVenta] = useState<Servicio | null>(null)
  const [ventaCantidad, setVentaCantidad] = useState(1)
  const [ventaEsUpselling, setVentaEsUpselling] = useState(false)
  const [ventaPrecioFinal, setVentaPrecioFinal] = useState(0)
  const [ventaCalificacion, setVentaCalificacion] = useState<number | null>(null)
  const [ventaComentario, setVentaComentario] = useState('')
  const [procesandoVenta, setProcesandoVenta] = useState(false)

  // Load empleados
  useEffect(() => {
    fetch('/api/empleados')
      .then(r => r.json())
      .then(data => setEmpleados(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  // Load empresas (grupos)
  useEffect(() => {
    fetch('/api/empresas')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setEmpresas(data)
      })
      .catch(() => {})
  }, [])

  // Load propiedades with empresa info
  useEffect(() => {
    fetch('/api/propiedades')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setPropiedades(data)
      })
      .catch(() => {})
  }, [])

  // Regiones disponibles (from propiedades)
  const regionesDisponibles = Array.from(new Set(propiedades.map(p => p.region).filter(Boolean))).sort()

  // Propiedades filtradas según empresa y región seleccionadas
  const propiedadesFiltradas = propiedades.filter(p => {
    // Filtro por empresa
    if (empresaFiltro === 'sin_grupo' && p.empresaId) return false
    if (empresaFiltro !== 'all' && empresaFiltro !== 'sin_grupo' && p.empresaId !== empresaFiltro) return false
    // Filtro por región
    if (regionFiltro !== 'all' && p.region !== regionFiltro) return false
    return true
  })

  // Empleados filtrados según propiedad seleccionada (o empresa/región)
  const empleadosFiltrados = empleados.filter(emp => {
    // Si hay propiedad específica seleccionada
    if (propiedadFiltro !== 'all') {
      return emp.propiedadId === propiedadFiltro
    }
    // Si no, filtrar por las propiedades filtradas
    const propIds = propiedadesFiltradas.map(p => p.id)
    return propIds.includes(emp.propiedadId)
  })

  // When employee is selected, load their property's services and today's sales
  const propiedadId = empleadoSeleccionado?.propiedadId || (selectedProperty !== 'all' ? selectedProperty : null)

  useEffect(() => {
    if (!propiedadId) return
    setLoadingServicios(true)
    fetch(`/api/servicios?propiedadId=${propiedadId}`)
      .then(r => r.json())
      .then(data => {
        setServicios(Array.isArray(data) ? data : [])
        setLoadingServicios(false)
      })
      .catch(() => setLoadingServicios(false))
  }, [propiedadId])

  useEffect(() => {
    if (!empleadoSeleccionado) {
      setVentasDia([])
      return
    }
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    fetch(`/api/ventas?empleadoId=${empleadoSeleccionado.id}&limit=100`)
      .then(r => r.json())
      .then(data => {
        const ventas = data?.ventas || data
        if (Array.isArray(ventas)) {
          const hoy = ventas.filter((v: VentaDia) => {
            const fecha = new Date(v.fechaVenta)
            return fecha >= today
          })
          setVentasDia(hoy)
        }
      })
      .catch(() => {})
  }, [empleadoSeleccionado])

  // Calculated metrics
  const ventasNormales = ventasDia.filter(v => !v.esUpselling).reduce((s, v) => s + v.montoTotal, 0)
  const ventasUpsellingTotal = ventasDia.filter(v => v.esUpselling).reduce((s, v) => s + v.montoUpselling, 0)
  const ventasConNPS = ventasDia.filter(v => v.calificacionNPS !== null)
  const npsPromedio = ventasConNPS.length > 0
    ? ventasConNPS.reduce((s, v) => s + (v.calificacionNPS ?? 0), 0) / ventasConNPS.length
    : 0
  const totalDia = ventasNormales + ventasUpsellingTotal
  const totalServiciosVendidos = ventasDia.reduce((s, v) => s + v.cantidad, 0)

  // Filtered services
  const serviciosFiltrados = categoriaFiltro === 'todos'
    ? servicios.filter(s => s.disponible)
    : servicios.filter(s => s.categoria === categoriaFiltro && s.disponible)

  // Upselling services for objectives section
  const serviciosUpselling = servicios.filter(s => s.esUpselling && s.disponible)

  // Open venta dialog
  const abrirVenta = useCallback((servicio: Servicio) => {
    setServicioVenta(servicio)
    setVentaCantidad(1)
    const esUps = servicio.esUpselling
    setVentaEsUpselling(esUps)
    setVentaPrecioFinal(esUps ? (servicio.precioUpselling || servicio.precioNormal) : servicio.precioNormal)
    setVentaCalificacion(null)
    setVentaComentario('')
    setShowVentaDialog(true)
  }, [])

  // Register sale
  const registrarVenta = async () => {
    if (!empleadoSeleccionado || !servicioVenta) return
    setProcesandoVenta(true)

    try {
      const montoTotal = ventaPrecioFinal * ventaCantidad
      const montoUpselling = ventaEsUpselling ? (ventaPrecioFinal - servicioVenta.precioNormal) * ventaCantidad : 0

      const res = await fetch('/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empleadoId: empleadoSeleccionado.id,
          propiedadId: empleadoSeleccionado.propiedadId,
          nombreServicio: locale === 'en' && servicioVenta.nombreEn ? servicioVenta.nombreEn : servicioVenta.nombre,
          cantidad: ventaCantidad,
          precioUnitario: ventaPrecioFinal,
          montoTotal,
          esUpselling: ventaEsUpselling,
          montoUpselling: Math.max(0, montoUpselling),
          calificacionNPS: ventaCalificacion,
          comentario: ventaComentario || undefined,
          fuenteNPS: 'app',
          categoriaServicio: servicioVenta.categoria,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al registrar venta')
      }

      const nuevaVenta = await res.json()

      // Add to today's sales
      setVentasDia(prev => [nuevaVenta, ...prev])

      // Show toast
      toast.success(t.ventaExitosa, {
        description: `$${montoTotal.toFixed(2)} - ${locale === 'en' && servicioVenta.nombreEn ? servicioVenta.nombreEn : servicioVenta.nombre}`,
      })

      setShowVentaDialog(false)
    } catch (error) {
      toast.error(String(error?.valueOf()) || 'Error')
    } finally {
      setProcesandoVenta(false)
    }
  }

  const moneda = servicios[0]?.propiedad?.moneda || 'MXN'
  const fmt = (n: number) => `$${n.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

  return (
    <div className="space-y-4">
      {/* ── Filtros: Empresa (Grupo) → Región → Propiedad ── */}
      <Card className="border-teal-200 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-teal-700 dark:text-teal-300">
            <Filter className="size-4" />
            {locale === 'es' ? 'Filtrar por:' : 'Filter by:'}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Filtro 1: Empresa (Grupo) */}
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1.5 text-muted-foreground">
                <Layers className="size-3" />
                {locale === 'es' ? 'Grupo / Empresa' : 'Group / Company'}
              </Label>
              <Select value={empresaFiltro} onValueChange={(v) => { setEmpresaFiltro(v); setPropiedadFiltro('all'); setEmpleadoSeleccionado(null) }}>
                <SelectTrigger className="bg-white dark:bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{locale === 'es' ? 'Todos los grupos' : 'All groups'}</SelectItem>
                  <SelectItem value="sin_grupo">{locale === 'es' ? 'Sin grupo (Independientes)' : 'No group (Independent)'}</SelectItem>
                  {empresas.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro 2: Región */}
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="size-3" />
                {locale === 'es' ? 'Región / Ciudad' : 'Region / City'}
              </Label>
              <Select value={regionFiltro} onValueChange={(v) => { setRegionFiltro(v); setPropiedadFiltro('all'); setEmpleadoSeleccionado(null) }}>
                <SelectTrigger className="bg-white dark:bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{locale === 'es' ? 'Todas las regiones' : 'All regions'}</SelectItem>
                  {regionesDisponibles.map(r => (
                    <SelectItem key={r} value={r}>
                      {r === 'cancun' ? 'Cancún' :
                       r === 'cdmx' ? 'CDMX' :
                       r === 'puebla' ? 'Puebla' :
                       r === 'playa_carmen' ? 'Playa del Carmen' :
                       r === 'los_cabos' ? 'Los Cabos' :
                       r === 'veracruz' ? 'Veracruz' :
                       r.charAt(0).toUpperCase() + r.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro 3: Propiedad (Sucursal) */}
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1.5 text-muted-foreground">
                <Building2 className="size-3" />
                {locale === 'es' ? 'Propiedad / Sucursal' : 'Property / Branch'}
              </Label>
              <Select
                value={propiedadFiltro}
                onValueChange={(v) => { setPropiedadFiltro(v); setEmpleadoSeleccionado(null) }}
                disabled={propiedadesFiltradas.length === 0}
              >
                <SelectTrigger className="bg-white dark:bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {locale === 'es' ? `Todas (${propiedadesFiltradas.length})` : `All (${propiedadesFiltradas.length})`}
                  </SelectItem>
                  {propiedadesFiltradas.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {locale === 'en' && p.nombreEn ? p.nombreEn : p.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {propiedadesFiltradas.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              {locale === 'es'
                ? 'No hay propiedades que coincidan con los filtros seleccionados'
                : 'No properties match the selected filters'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Header: Employee Selector + Property + Scores ── */}
      <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Employee selector */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <User className="size-5 text-emerald-600" />
                <Select
                  value={empleadoSeleccionado?.id || ''}
                  onValueChange={(val) => {
                    const emp = empleadosFiltrados.find(e => e.id === val) || null
                    setEmpleadoSeleccionado(emp)
                  }}
                >
                  <SelectTrigger className="w-[260px] bg-white dark:bg-background">
                    <SelectValue placeholder={empleadosFiltrados.length === 0 ? (locale === 'es' ? 'Sin empleados' : 'No employees') : t.seleccionarEmpleado} />
                  </SelectTrigger>
                  <SelectContent>
                    {empleadosFiltrados.map(e => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.nombre} - {e.empleadoId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {empleadoSeleccionado && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="size-4" />
                  <span>
                    {locale === 'en' && empleadoSeleccionado.propiedad.nombreEn
                      ? empleadoSeleccionado.propiedad.nombreEn
                      : empleadoSeleccionado.propiedad.nombre}
                  </span>
                </div>
              )}
            </div>

            {/* Empleados count badge */}
            {empleadosFiltrados.length > 0 && !empleadoSeleccionado && (
              <Badge variant="secondary" className="self-start">
                {empleadosFiltrados.length} {locale === 'es' ? 'empleados disponibles' : 'employees available'}
              </Badge>
            )}

            {/* Today's scores */}
            {empleadoSeleccionado && (
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-1.5 rounded-lg bg-green-100 px-3 py-1.5 dark:bg-green-900/30">
                  <DollarSign className="size-4 text-green-600" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-400">{t.ventasNormales}</span>
                  <span className="text-sm font-bold text-green-800 dark:text-green-300">{fmt(ventasNormales)}</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-1.5 dark:bg-emerald-900/30">
                  <TrendingUp className="size-4 text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">{t.ventasUpselling}</span>
                  <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">{fmt(ventasUpsellingTotal)}</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-amber-100 px-3 py-1.5 dark:bg-amber-900/30">
                  <Star className="size-4 text-amber-600" />
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-400">{t.nps}</span>
                  <span className="text-sm font-bold text-amber-800 dark:text-amber-300">{npsPromedio.toFixed(1)}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {!empleadoSeleccionado ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <User className="mb-4 size-12 opacity-30" />
            <p className="text-lg">{t.sinEmpleado}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          {/* ── Main: Service Menu ── */}
          <div className="space-y-4">
            {/* Category filters */}
            <div className="flex flex-wrap gap-2">
              {categorias.map(cat => (
                <Button
                  key={cat.key}
                  variant={categoriaFiltro === cat.key ? 'default' : 'outline'}
                  size="sm"
                  className={categoriaFiltro === cat.key ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                  onClick={() => setCategoriaFiltro(cat.key)}
                >
                  {locale === 'en' ? cat.en : cat.es}
                </Button>
              ))}
            </div>

            {/* Service grid */}
            {loadingServicios ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="h-36 bg-muted" />
                  </Card>
                ))}
              </div>
            ) : serviciosFiltrados.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <ShoppingCart className="mb-2 size-8 opacity-30" />
                  <p>{t.noServicios}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {serviciosFiltrados.map(servicio => {
                  const nombre = locale === 'en' && servicio.nombreEn ? servicio.nombreEn : servicio.nombre
                  return (
                    <Card
                      key={servicio.id}
                      className="group relative transition-all hover:shadow-md hover:ring-1 hover:ring-emerald-300"
                    >
                      <CardContent className="p-4">
                        {/* Upselling badge */}
                        {servicio.esUpselling && (
                          <Badge className="absolute right-3 top-3 bg-emerald-600 text-white hover:bg-emerald-700">
                            🎯 UPS
                          </Badge>
                        )}

                        {/* Service name */}
                        <h3 className="mb-1 pr-16 text-sm font-semibold leading-tight">{nombre}</h3>

                        {/* Category badge */}
                        <Badge variant="outline" className="mb-2 text-[10px]">
                          {servicio.categoria}
                        </Badge>

                        {/* Prices */}
                        <div className="mb-3 space-y-0.5">
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-green-700 dark:text-green-400">
                              {fmt(servicio.precioNormal)}
                            </span>
                            <span className="text-[10px] text-muted-foreground">{moneda}</span>
                          </div>
                          {servicio.esUpselling && servicio.precioUpselling && (
                            <div className="flex items-baseline gap-1">
                              <span className="text-sm font-semibold text-emerald-600">
                                ↑ {fmt(servicio.precioUpselling)}
                              </span>
                              <span className="text-[10px] text-emerald-500">upselling</span>
                            </div>
                          )}
                        </div>

                        {/* Upselling objective */}
                        {servicio.esUpselling && servicio.objetivoUpselling && (
                          <p className="mb-3 text-[11px] leading-snug text-amber-700 dark:text-amber-400">
                            🎯 {locale === 'en' && servicio.objetivoUpsellingEn ? servicio.objetivoUpsellingEn : servicio.objetivoUpselling}
                          </p>
                        )}

                        {/* Sell button */}
                        <Button
                          className="w-full bg-green-600 text-base font-bold hover:bg-green-700"
                          size="lg"
                          onClick={() => abrirVenta(servicio)}
                        >
                          <ShoppingCart className="mr-2 size-5" />
                          {t.vender}
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {/* ── Upselling Objectives Section ── */}
            {serviciosUpselling.length > 0 && (
              <div className="mt-6">
                <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                  <Target className="size-5 text-amber-600" />
                  {t.misObjetivos}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {serviciosUpselling.map(servicio => {
                    const nombre = locale === 'en' && servicio.nombreEn ? servicio.nombreEn : servicio.nombre
                    const objetivo = locale === 'en' && servicio.objetivoUpsellingEn ? servicio.objetivoUpsellingEn : servicio.objetivoUpselling
                    // Count upselling sales of this service today
                    const vendidosHoy = ventasDia.filter(v =>
                      v.esUpselling && v.nombreServicio === (locale === 'en' && servicio.nombreEn ? servicio.nombreEn : servicio.nombre)
                    ).length
                    const objetivoNum = 3 // Default target for progress
                    const porcentaje = Math.min(100, (vendidosHoy / objetivoNum) * 100)

                    return (
                      <Card key={servicio.id} className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
                        <CardContent className="p-4">
                          <div className="mb-2 flex items-start justify-between">
                            <div>
                              <h4 className="text-sm font-semibold">{nombre}</h4>
                              <p className="mt-0.5 text-[11px] text-amber-700 dark:text-amber-400">{objetivo}</p>
                            </div>
                            <Badge variant="outline" className="border-amber-400 text-amber-700 dark:text-amber-400">
                              {fmt(servicio.precioUpselling || 0)}
                            </Badge>
                          </div>
                          <div className="mt-2 space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">{t.progreso}</span>
                              <span className="font-medium">{vendidosHoy} {t.vendidosHoy}</span>
                            </div>
                            <Progress value={porcentaje} className="h-2 bg-amber-200 [&>div]:bg-amber-500" />
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar: Today's Summary ── */}
          <div className="space-y-4">
            <Card className="sticky top-4">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="size-4 text-emerald-600" />
                  {t.resumenDelDia}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Normal sales */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t.ventasNormales}</span>
                  <span className="font-semibold text-green-700 dark:text-green-400">{fmt(ventasNormales)}</span>
                </div>

                {/* Upselling sales */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t.ventasUpselling}</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">{fmt(ventasUpsellingTotal)}</span>
                </div>

                <Separator />

                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="font-medium">{t.total}</span>
                  <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{fmt(totalDia)}</span>
                </div>

                <Separator />

                {/* Average rating */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t.calificacionPromedio}</span>
                  <div className="flex items-center gap-1">
                    <Star className="size-4 text-amber-500" />
                    <span className="font-semibold">{npsPromedio.toFixed(1)}</span>
                  </div>
                </div>

                {/* Services sold */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t.serviciosVendidos}</span>
                  <span className="font-semibold">{totalServiciosVendidos}</span>
                </div>

                {/* Recent sales list */}
                {ventasDia.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {locale === 'en' ? 'Recent' : 'Recientes'}
                      </h4>
                      <ScrollArea className="max-h-48">
                        <div className="space-y-1.5">
                          {ventasDia.slice(0, 8).map(venta => (
                            <div key={venta.id} className="flex items-center justify-between rounded-md bg-muted/50 px-2 py-1.5 text-xs">
                              <div className="flex items-center gap-1.5 min-w-0">
                                {venta.esUpselling && (
                                  <span className="shrink-0 text-emerald-600">🎯</span>
                                )}
                                <span className="truncate">{venta.nombreServicio || '—'}</span>
                              </div>
                              <span className="shrink-0 font-medium">{fmt(venta.montoTotal)}</span>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ── Sale Dialog ── */}
      <Dialog open={showVentaDialog} onOpenChange={setShowVentaDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="size-5 text-green-600" />
              {locale === 'en' && servicioVenta?.nombreEn ? servicioVenta.nombreEn : servicioVenta?.nombre}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Quantity */}
            <div className="space-y-1.5">
              <Label>{t.cantidad}</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setVentaCantidad(Math.max(1, ventaCantidad - 1))}
                >
                  −
                </Button>
                <Input
                  type="number"
                  min={1}
                  value={ventaCantidad}
                  onChange={(e) => setVentaCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setVentaCantidad(ventaCantidad + 1)}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Is upselling? */}
            {servicioVenta?.esUpselling && (
              <div className="flex items-center justify-between rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/30">
                <Label className="flex items-center gap-2 text-sm">
                  🎯 {t.esUpselling}
                </Label>
                <Switch
                  checked={ventaEsUpselling}
                  onCheckedChange={(checked) => {
                    setVentaEsUpselling(checked)
                    setVentaPrecioFinal(
                      checked
                        ? (servicioVenta.precioUpselling || servicioVenta.precioNormal)
                        : servicioVenta.precioNormal
                    )
                  }}
                />
              </div>
            )}

            {/* Final price */}
            <div className="space-y-1.5">
              <Label>{t.precioFinal}</Label>
              <Input
                type="number"
                value={ventaPrecioFinal}
                onChange={(e) => setVentaPrecioFinal(parseFloat(e.target.value) || 0)}
                className={ventaEsUpselling ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30' : ''}
              />
            </div>

            {/* Total preview */}
            <div className="rounded-lg bg-muted p-3 text-center">
              <span className="text-sm text-muted-foreground">{t.total}: </span>
              <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                {fmt(ventaPrecioFinal * ventaCantidad)}
              </span>
              <span className="text-xs text-muted-foreground ml-1">{moneda}</span>
            </div>

            {/* Customer rating */}
            <div className="space-y-1.5">
              <Label>{t.calificacionCliente}</Label>
              <div className="flex gap-1">
                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                  <Button
                    key={n}
                    variant={ventaCalificacion === n ? 'default' : 'outline'}
                    size="sm"
                    className={`h-8 w-8 p-0 text-xs ${
                      ventaCalificacion === n
                        ? n >= 9 ? 'bg-green-600 hover:bg-green-700' : n >= 7 ? 'bg-amber-500 hover:bg-amber-600' : 'bg-red-500 hover:bg-red-600'
                        : ''
                    }`}
                    onClick={() => setVentaCalificacion(n === ventaCalificacion ? null : n)}
                  >
                    {n}
                  </Button>
                ))}
              </div>
            </div>

            {/* Customer comment */}
            <div className="space-y-1.5">
              <Label>{t.comentarioCliente}</Label>
              <Textarea
                value={ventaComentario}
                onChange={(e) => setVentaComentario(e.target.value)}
                placeholder="..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowVentaDialog(false)}
              disabled={procesandoVenta}
            >
              {tc.cancelar}
            </Button>
            <Button
              className="bg-green-600 font-bold hover:bg-green-700"
              onClick={registrarVenta}
              disabled={procesandoVenta}
            >
              {procesandoVenta ? '...' : t.confirmarVenta}
              <ChevronRight className="ml-1 size-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
