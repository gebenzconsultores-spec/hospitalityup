'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { translations } from '@/lib/i18n'
import { formatCurrency } from '@/lib/currency'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import {
  ShoppingCart,
  Target,
  TrendingUp,
  Star,
  User,
  Building2,
  LogOut,
  GraduationCap,
  Award,
  DollarSign,
  Package,
  BookOpen,
  BarChart3,
  Plus,
  Minus,
} from 'lucide-react'

// ─── Interfaces ──────────────────────────────────────────────

interface Servicio {
  id: string
  nombre: string
  nombreEn: string | null
  categoria: string
  esUpselling: boolean
  precioNormal: number
  precioUpselling: number | null
  objetivoUpselling: string | null
  disponible: boolean
  propiedadId: string
}

interface VentaRegistrada {
  id: string
  servicioNombre: string
  cantidad: number
  precioUnitario: number
  montoTotal: number
  esUpselling: boolean
  calificacionNps: number | null
  hora: string
}

interface EmpleadoInfo {
  puntuacionConocimiento: number
  puntuacionVentas: number
  puntuacionHospitalidad: number
  puntuacionTotal: number
  totalUpselling: number
  npsPromedio: number
  indiceFelicidad: number
  cursos: {
    id: string
    nombre: string
    estado: string
    progreso: number
  }[]
  posicion: string
  propiedadNombre: string
}

// ─── Category Filters ────────────────────────────────────────

const categories = [
  { id: 'todos', labelEs: 'Todos', labelEn: 'All', icon: Package },
  { id: 'platillo', labelEs: 'Platillos', labelEn: 'Dishes', icon: Package },
  { id: 'bebida', labelEs: 'Bebidas', labelEn: 'Drinks', icon: Package },
  { id: 'tour', labelEs: 'Tours', labelEn: 'Tours', icon: Package },
  { id: 'masaje', labelEs: 'Masajes', labelEn: 'Massages', icon: Package },
  { id: 'habitacion', labelEs: 'Habitaciones', labelEn: 'Rooms', icon: Package },
  { id: 'experiencia', labelEs: 'Experiencias', labelEn: 'Experiences', icon: Package },
  { id: 'paquete', labelEs: 'Paquetes', labelEn: 'Packages', icon: Package },
]

// ─── Component ───────────────────────────────────────────────

export function EmpleadoPOS() {
  const {
    userId,
    userPropertyId,
    userName,
    userEmployeeId,
    locale,
    setLocale,
    empleadoView,
    setEmpleadoView,
    logout,
  } = useAppStore()

  const t = translations[locale]

  // ─── State ───────────────────────────────────────
  const [loading, setLoading] = useState(true)
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [ventasRegistradas, setVentasRegistradas] = useState<VentaRegistrada[]>([])
  const [empleadoData, setEmpleadoData] = useState<EmpleadoInfo | null>(null)
  const [currencyConfig, setCurrencyConfig] = useState<string>('USD')
  const [categoryFilter, setCategoryFilter] = useState('todos')

  // Sale dialog state
  const [showVentaDialog, setShowVentaDialog] = useState(false)
  const [selectedService, setSelectedService] = useState<Servicio | null>(null)
  const [cantidad, setCantidad] = useState(1)
  const [esUpselling, setEsUpselling] = useState(false)
  const [calificacionNps, setCalificacionNps] = useState<number>(8)
  const [comentarioVenta, setComentarioVenta] = useState('')
  const [savingVenta, setSavingVenta] = useState(false)

  // ─── Data Fetching ───────────────────────────────

  const fetchInitialData = useCallback(async () => {
    if (!userPropertyId || !userId) return
    setLoading(true)
    try {
      // Fetch services for this property
      const servRes = await fetch(`/api/servicios?propiedadId=${userPropertyId}&disponible=true`).catch(() => ({ json: () => [] }))
      const servData = await servRes.json()
      setServicios(Array.isArray(servData) ? servData : [])

      // Fetch employee data for scores
      const empRes = await fetch(`/api/empleados/${userId}`).catch(() => ({ json: () => null }))
      const empData = await empRes.json()
      if (empData) {
        setEmpleadoData({
          puntuacionConocimiento: empData.puntuacionConocimiento || 0,
          puntuacionVentas: empData.puntuacionVentas || 0,
          puntuacionHospitalidad: empData.puntuacionHospitalidad || 0,
          puntuacionTotal: empData.puntuacionTotal || 0,
          totalUpselling: empData.totalUpselling || 0,
          npsPromedio: empData.npsPromedio || 0,
          indiceFelicidad: empData.indiceFelicidad || 80,
          cursos: (empData.cursos || []).map((c: any) => ({
            id: c.capacitacion?.id || c.id,
            nombre: c.capacitacion?.titulo || 'Curso',
            estado: c.estado,
            progreso: c.progreso || 0,
          })),
          posicion: empData.posicion || '',
          propiedadNombre: empData.propiedad?.nombre || '',
        })
      }

      // Fetch recent sales
      const ventRes = await fetch(`/api/ventas?empleadoId=${userId}&limit=50`).catch(() => ({ json: () => ({ ventas: [] }) }))
      const ventData = await ventRes.json()
      const ventasArr = Array.isArray(ventData?.ventas) ? ventData.ventas : (Array.isArray(ventData) ? ventData : [])
      setVentasRegistradas(ventasArr.map((v: any) => ({
        id: v.id,
        servicioNombre: v.nombreServicio || '',
        cantidad: v.cantidad || 1,
        precioUnitario: v.precioUnitario || 0,
        montoTotal: v.montoTotal || 0,
        esUpselling: v.esUpselling || false,
        calificacionNps: v.calificacionNPS ?? null,
        hora: new Date(v.fechaVenta || v.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      })))

      // Config
      const configRes = await fetch(`/api/config?propertyId=${userPropertyId}`).catch(() => ({ json: () => null }))
      const configData = await configRes.json()
      if (configData?.currency) setCurrencyConfig(configData.currency)
    } catch {
      // Silently handle errors
    } finally {
      setLoading(false)
    }
  }, [userPropertyId, userId])

  // Initial load
  useEffect(() => {
    fetchInitialData()
  }, [fetchInitialData])

  // ─── Helpers ─────────────────────────────────────

  const moneda = currencyConfig || 'USD'

  const filteredServicios = categoryFilter === 'todos'
    ? servicios
    : servicios.filter((s) => s.categoria === categoryFilter)

  const upsellingServices = servicios.filter((s) => s.esUpselling)

  // Computed venta metrics for today
  const totalVentasHoy = ventasRegistradas.reduce((s, v) => s + v.montoTotal, 0)
  const totalUpsellingHoy = ventasRegistradas
    .filter((v) => v.esUpselling)
    .reduce((s, v) => s + (v.montoTotal - v.precioUnitario * v.cantidad + (v.esUpselling ? v.precioUnitario : 0)), 0)
  const npsPromedioHoy = ventasRegistradas.filter((v) => v.calificacionNps !== null).length > 0
    ? ventasRegistradas.filter((v) => v.calificacionNps !== null).reduce((s, v) => s + (v.calificacionNps || 0), 0) /
      ventasRegistradas.filter((v) => v.calificacionNps !== null).length
    : 0

  // ─── Sale Dialog ─────────────────────────────────

  const openSaleDialog = (serv: Servicio) => {
    setSelectedService(serv)
    setCantidad(1)
    setEsUpselling(serv.esUpselling)
    setCalificacionNps(8)
    setComentarioVenta('')
    setShowVentaDialog(true)
  }

  const resetVentaForm = () => {
    setSelectedService(null)
    setCantidad(1)
    setEsUpselling(false)
    setCalificacionNps(8)
    setComentarioVenta('')
  }

  const precioFinal = selectedService
    ? (esUpselling && selectedService.precioUpselling ? selectedService.precioUpselling : selectedService.precioNormal) * cantidad
    : 0

  const handleConfirmVenta = async () => {
    if (!selectedService || !userId || !userPropertyId) return
    setSavingVenta(true)
    try {
      const precio = esUpselling && selectedService.precioUpselling ? selectedService.precioUpselling : selectedService.precioNormal
      const montoTotal = precio * cantidad
      const res = await fetch('/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empleadoId: userId,
          propiedadId: userPropertyId,
          nombreServicio: selectedService.nombre,
          cantidad,
          precioUnitario: precio,
          montoTotal,
          esUpselling,
          montoUpselling: esUpselling ? (precio - selectedService.precioNormal) * cantidad : 0,
          calificacionNPS: calificacionNps || null,
          esPromotor: calificacionNps !== null && calificacionNps >= 9,
          comentario: comentarioVenta || null,
          fuenteNPS: 'app',
          categoriaServicio: selectedService.categoria,
        }),
      })
      if (!res.ok) throw new Error()
      // Refresh data after sale
      fetchInitialData()
      setShowVentaDialog(false)
      resetVentaForm()
      toast.success(locale === 'es' ? '¡Venta registrada!' : 'Sale registered!')
    } catch {
      toast.error(locale === 'es' ? 'Error al registrar venta' : 'Error registering sale')
    } finally {
      setSavingVenta(false)
    }
  }

  // ─── Bottom Nav Items ────────────────────────────

  const navItems = [
    { key: 'menu' as const, icon: ShoppingCart, label: locale === 'es' ? 'Menú' : 'Menu' },
    { key: 'ventas' as const, icon: DollarSign, label: locale === 'es' ? 'Ventas' : 'Sales' },
    { key: 'objetivos' as const, icon: Target, label: locale === 'es' ? 'Objetivos' : 'Objectives' },
    { key: 'capacitacion' as const, icon: GraduationCap, label: locale === 'es' ? 'Capacitación' : 'Training' },
    { key: 'score' as const, icon: Award, label: 'Score' },
  ]

  // ─── Loading State ───────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600 mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">{t.common.cargando}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ─── Header ──────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-gray-900">
                {empleadoData?.propiedadNombre || locale === 'es' ? 'Propiedad' : 'Property'}
              </h1>
              <p className="text-[11px] text-gray-500">
                <User className="w-3 h-3 inline mr-1" />
                {userName || ''} {userEmployeeId ? `· ${userEmployeeId}` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-md overflow-hidden border">
              <button
                onClick={() => setLocale('es')}
                className={`px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                  locale === 'es' ? 'bg-amber-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                ES
              </button>
              <button
                onClick={() => setLocale('en')}
                className={`px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                  locale === 'en' ? 'bg-amber-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                EN
              </button>
            </div>
            <Button variant="ghost" size="sm" onClick={logout} className="text-gray-500 hover:text-red-600">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* ─── Main Content ────────────────────────── */}
      <main className="flex-1 p-4 pb-24 max-w-4xl mx-auto w-full">
        {/* ═══════════════ MENU VIEW ═══════════════ */}
        {empleadoView === 'menu' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-bold text-gray-900">
                {locale === 'es' ? 'Menú de Servicios' : 'Services Menu'}
              </h2>
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => {
                const Icon = cat.icon
                const isActive = categoryFilter === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {locale === 'es' ? cat.labelEs : cat.labelEn}
                  </button>
                )
              })}
            </div>

            {/* Service Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredServicios.map((serv) => (
                <Card
                  key={serv.id}
                  className="cursor-pointer hover:shadow-md transition-shadow border-gray-100"
                  onClick={() => openSaleDialog(serv)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm leading-tight">
                        {locale === 'es' ? serv.nombre : (serv.nombreEn || serv.nombre)}
                      </h3>
                      {serv.esUpselling && (
                        <Badge className="bg-amber-100 text-amber-800 text-[10px] shrink-0 ml-1">
                          <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                          Up
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-end justify-between mt-2">
                      <div>
                        <p className="text-lg font-bold text-amber-700">
                          {formatCurrency(serv.precioNormal, moneda)}
                        </p>
                        {serv.esUpselling && serv.precioUpselling && (
                          <p className="text-xs text-amber-600">
                            ↑ {formatCurrency(serv.precioUpselling, moneda)}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8 px-3"
                        onClick={(e) => {
                          e.stopPropagation()
                          openSaleDialog(serv)
                        }}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        {locale === 'es' ? 'Vender' : 'Sell'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredServicios.length === 0 && (
                <div className="col-span-2 lg:col-span-3 text-center py-12">
                  <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    {locale === 'es' ? 'No hay servicios disponibles' : 'No services available'}
                  </p>
                </div>
              )}
            </div>

            {/* Sale Dialog */}
            <Dialog open={showVentaDialog} onOpenChange={setShowVentaDialog}>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle className="text-base">
                    {locale === 'es' ? 'Registrar Venta' : 'Register Sale'}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedService
                      ? (locale === 'es' ? selectedService.nombre : (selectedService.nombreEn || selectedService.nombre))
                      : ''}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Service name display */}
                  <div className="bg-amber-50 rounded-lg p-3">
                    <p className="font-semibold text-sm text-amber-900">
                      {selectedService
                        ? (locale === 'es' ? selectedService.nombre : (selectedService.nombreEn || selectedService.nombre))
                        : ''}
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      {selectedService ? formatCurrency(selectedService.precioNormal, moneda) : ''} · {selectedService?.categoria}
                    </p>
                  </div>

                  {/* Cantidad */}
                  <div>
                    <Label className="text-xs font-medium">
                      {locale === 'es' ? 'Cantidad' : 'Quantity'}
                    </Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <Input
                        type="number"
                        min={1}
                        value={cantidad}
                        onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                        className="text-center w-20 h-8"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setCantidad(cantidad + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Es upselling toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs font-medium">
                        {locale === 'es' ? 'Es upselling' : 'Is upselling'}
                      </Label>
                      {esUpselling && (
                        <Badge className="bg-amber-100 text-amber-800 text-[10px]">
                          <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                          Up
                        </Badge>
                      )}
                    </div>
                    <Switch
                      checked={esUpselling}
                      onCheckedChange={setEsUpselling}
                    />
                  </div>

                  {/* Precio final */}
                  <div>
                    <Label className="text-xs font-medium">
                      {locale === 'es' ? 'Precio final' : 'Final price'}
                    </Label>
                    <p className="text-2xl font-bold text-amber-700 mt-1">
                      {formatCurrency(precioFinal, moneda)}
                    </p>
                    {esUpselling && selectedService?.precioUpselling && (
                      <p className="text-xs text-amber-600 mt-0.5">
                        {locale === 'es' ? 'Precio upselling:' : 'Upselling price:'} {formatCurrency(selectedService.precioUpselling, moneda)} × {cantidad}
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* Calificación NPS */}
                  <div>
                    <Label className="text-xs font-medium">
                      {locale === 'es' ? 'Calificación NPS' : 'NPS Rating'} (1-10)
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={calificacionNps}
                      onChange={(e) => {
                        const val = parseInt(e.target.value)
                        if (!isNaN(val) && val >= 1 && val <= 10) {
                          setCalificacionNps(val)
                        }
                      }}
                      className="mt-1 h-9"
                    />
                    {calificacionNps >= 9 && (
                      <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {locale === 'es' ? '¡Promotor!' : 'Promoter!'}
                      </p>
                    )}
                  </div>

                  {/* Comentario */}
                  <div>
                    <Label className="text-xs font-medium">
                      {locale === 'es' ? 'Comentario' : 'Comment'}
                    </Label>
                    <Textarea
                      value={comentarioVenta}
                      onChange={(e) => setComentarioVenta(e.target.value)}
                      rows={2}
                      placeholder={locale === 'es' ? 'Comentario opcional...' : 'Optional comment...'}
                      className="mt-1"
                    />
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setShowVentaDialog(false)}>
                    {t.common.cancelar}
                  </Button>
                  <Button
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={handleConfirmVenta}
                    disabled={savingVenta}
                  >
                    {savingVenta ? (
                      <span className="flex items-center gap-1">
                        <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></span>
                        {locale === 'es' ? 'Guardando...' : 'Saving...'}
                      </span>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        {locale === 'es' ? 'Confirmar Venta' : 'Confirm Sale'}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* ═══════════════ VENTAS VIEW ═══════════════ */}
        {empleadoView === 'ventas' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-bold text-gray-900">
                {locale === 'es' ? 'Ventas del Día' : "Today's Sales"}
              </h2>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="border-amber-100">
                <CardContent className="p-3 text-center">
                  <DollarSign className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                  <p className="text-[10px] text-gray-500 uppercase font-medium">
                    {locale === 'es' ? 'Total Hoy' : 'Total Today'}
                  </p>
                  <p className="text-lg font-bold text-amber-700">{formatCurrency(totalVentasHoy, moneda)}</p>
                </CardContent>
              </Card>
              <Card className="border-amber-100">
                <CardContent className="p-3 text-center">
                  <TrendingUp className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                  <p className="text-[10px] text-gray-500 uppercase font-medium">
                    {locale === 'es' ? 'Upselling Hoy' : 'Upselling Today'}
                  </p>
                  <p className="text-lg font-bold text-amber-700">
                    {formatCurrency(totalUpsellingHoy, moneda)}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-amber-100">
                <CardContent className="p-3 text-center">
                  <Star className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                  <p className="text-[10px] text-gray-500 uppercase font-medium">
                    {locale === 'es' ? 'NPS Promedio' : 'Avg. NPS'}
                  </p>
                  <p className="text-lg font-bold text-amber-700">
                    {npsPromedioHoy > 0 ? npsPromedioHoy.toFixed(1) : '—'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Sales Table */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  {locale === 'es' ? 'Ventas Recientes' : 'Recent Sales'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="max-h-96">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">{locale === 'es' ? 'Servicio' : 'Service'}</TableHead>
                        <TableHead className="text-xs text-center">{locale === 'es' ? 'Cant.' : 'Qty'}</TableHead>
                        <TableHead className="text-xs text-right">{locale === 'es' ? 'Monto' : 'Amount'}</TableHead>
                        <TableHead className="text-xs text-center">Up</TableHead>
                        <TableHead className="text-xs text-center">NPS</TableHead>
                        <TableHead className="text-xs text-right">{locale === 'es' ? 'Hora' : 'Time'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ventasRegistradas.length > 0 ? (
                        ventasRegistradas.map((v) => (
                          <TableRow key={v.id}>
                            <TableCell className="text-xs font-medium py-2 max-w-[120px] truncate">
                              {v.servicioNombre || '—'}
                            </TableCell>
                            <TableCell className="text-xs text-center py-2">{v.cantidad}</TableCell>
                            <TableCell className="text-xs font-semibold text-right py-2">
                              {formatCurrency(v.montoTotal, moneda)}
                            </TableCell>
                            <TableCell className="text-center py-2">
                              {v.esUpselling ? (
                                <Badge className="bg-amber-100 text-amber-800 text-[10px]">↑</Badge>
                              ) : (
                                <span className="text-gray-300 text-xs">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-xs text-center py-2">
                              {v.calificacionNps !== null ? (
                                <span className={
                                  v.calificacionNps >= 9
                                    ? 'text-emerald-600 font-semibold'
                                    : v.calificacionNps >= 7
                                    ? 'text-amber-600 font-semibold'
                                    : 'text-red-500 font-semibold'
                                }>
                                  {v.calificacionNps}
                                </span>
                              ) : '—'}
                            </TableCell>
                            <TableCell className="text-xs text-gray-500 text-right py-2">{v.hora}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                            <BarChart3 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            {locale === 'es' ? 'No hay ventas registradas' : 'No sales registered'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ═══════════════ OBJETIVOS VIEW ═══════════════ */}
        {empleadoView === 'objetivos' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-bold text-gray-900">
                {locale === 'es' ? 'Objetivos de Upselling' : 'Upselling Objectives'}
              </h2>
            </div>

            {/* Personal Metrics */}
            <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-amber-800">
                    {locale === 'es' ? 'Mi Meta de Upselling' : 'My Upselling Target'}
                  </h3>
                </div>
                <p className="text-3xl font-bold text-amber-700">
                  {formatCurrency(empleadoData?.totalUpselling || 0, moneda)}
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  {locale === 'es' ? 'Total upselling acumulado' : 'Total accumulated upselling'}
                </p>
              </CardContent>
            </Card>

            {/* Upselling Services List */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                {locale === 'es' ? 'Servicios con Objetivo' : 'Services with Objective'}
              </h3>
              {upsellingServices.length > 0 ? (
                upsellingServices.map((serv) => (
                  <Card key={serv.id} className="border-gray-100">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">
                            {locale === 'es' ? serv.nombre : (serv.nombreEn || serv.nombre)}
                          </h4>
                          {serv.objetivoUpselling && (
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              {serv.objetivoUpselling}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-[10px]">
                              {serv.categoria}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <p className="text-sm font-bold text-amber-600">
                            {formatCurrency(serv.precioUpselling || serv.precioNormal, moneda)}
                          </p>
                          <Badge className="bg-amber-100 text-amber-800 text-[10px] mt-1">
                            <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                            Upselling
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-10">
                  <Target className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    {locale === 'es' ? 'No hay objetivos de upselling' : 'No upselling objectives'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════ CAPACITACIÓN VIEW ═══════════════ */}
        {empleadoView === 'capacitacion' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-bold text-gray-900">
                {locale === 'es' ? 'Mi Capacitación' : 'My Training'}
              </h2>
            </div>

            {empleadoData?.cursos && empleadoData.cursos.length > 0 ? (
              <div className="space-y-3">
                {empleadoData.cursos.map((c) => {
                  const estadoLabel =
                    c.estado === 'completado'
                      ? (locale === 'es' ? 'Completado' : 'Completed')
                      : c.estado === 'en_progreso'
                      ? (locale === 'es' ? 'En Progreso' : 'In Progress')
                      : c.estado === 'no_iniciado'
                      ? (locale === 'es' ? 'No Iniciado' : 'Not Started')
                      : c.estado === 'pendiente'
                      ? (locale === 'es' ? 'Pendiente' : 'Pending')
                      : c.estado

                  const badgeVariant =
                    c.estado === 'completado'
                      ? 'default' as const
                      : c.estado === 'en_progreso'
                      ? 'secondary' as const
                      : 'outline' as const

                  return (
                    <Card key={c.id} className="border-gray-100">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                              <BookOpen className="w-4 h-4 text-amber-700" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm">{c.nombre}</h4>
                            </div>
                          </div>
                          <Badge variant={badgeVariant} className="text-[10px] shrink-0">
                            {estadoLabel}
                          </Badge>
                        </div>
                        <Progress value={c.progreso} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1.5">
                          {Math.round(c.progreso)}% {locale === 'es' ? 'completado' : 'completed'}
                        </p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-10">
                <GraduationCap className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">
                  {locale === 'es' ? 'No hay cursos asignados' : 'No courses assigned'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════ SCORE VIEW ═══════════════ */}
        {empleadoView === 'score' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-bold text-gray-900">
                {locale === 'es' ? 'Mi Score Integral' : 'My Integral Score'}
              </h2>
            </div>

            {/* Total Score Card */}
            <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
              <CardContent className="p-6 text-center">
                <Award className="w-14 h-14 text-amber-600 mx-auto mb-2" />
                <p className="text-5xl font-bold text-amber-700">
                  {empleadoData ? Math.round(empleadoData.puntuacionTotal) : 0}
                </p>
                <p className="text-sm text-amber-600 mt-1 font-medium">
                  {locale === 'es' ? 'Puntuación Total' : 'Total Score'}
                </p>
              </CardContent>
            </Card>

            {/* Score Breakdown Bars */}
            <div className="space-y-3">
              {[
                {
                  label: locale === 'es' ? 'Conocimiento' : 'Knowledge',
                  value: empleadoData?.puntuacionConocimiento || 0,
                  color: 'bg-emerald-500',
                  icon: BookOpen,
                },
                {
                  label: locale === 'es' ? 'Ventas' : 'Sales',
                  value: empleadoData?.puntuacionVentas || 0,
                  color: 'bg-amber-500',
                  icon: DollarSign,
                },
                {
                  label: locale === 'es' ? 'Hospitalidad' : 'Hospitality',
                  value: empleadoData?.puntuacionHospitalidad || 0,
                  color: 'bg-rose-400',
                  icon: Star,
                },
                {
                  label: locale === 'es' ? 'Total' : 'Total',
                  value: empleadoData?.puntuacionTotal || 0,
                  color: 'bg-amber-600',
                  icon: Award,
                },
              ].map((score) => {
                const Icon = score.icon
                return (
                  <Card key={score.label} className="border-gray-100">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium flex items-center gap-1.5">
                          <Icon className="w-4 h-4 text-gray-500" />
                          {score.label}
                        </span>
                        <span className="text-lg font-bold">{Math.round(score.value)}</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${score.color} transition-all duration-500`}
                          style={{ width: `${Math.min(100, score.value)}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <Separator />

            {/* Additional Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="border-gray-100">
                <CardContent className="p-3 text-center">
                  <TrendingUp className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                  <p className="text-sm font-bold text-amber-700">
                    {formatCurrency(empleadoData?.totalUpselling || 0, moneda)}
                  </p>
                  <p className="text-[10px] text-gray-500 font-medium">
                    {locale === 'es' ? 'Total Upselling' : 'Total Upselling'}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-gray-100">
                <CardContent className="p-3 text-center">
                  <Star className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                  <p className="text-sm font-bold text-amber-700">
                    {(empleadoData?.npsPromedio || 0).toFixed(1)}
                  </p>
                  <p className="text-[10px] text-gray-500 font-medium">NPS</p>
                </CardContent>
              </Card>
              <Card className="border-gray-100">
                <CardContent className="p-3 text-center">
                  <User className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                  <p className="text-sm font-bold text-emerald-700">
                    {Math.round(empleadoData?.indiceFelicidad || 0)}%
                  </p>
                  <p className="text-[10px] text-gray-500 font-medium">
                    {locale === 'es' ? 'Felicidad' : 'Happiness'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* ─── Sticky Bottom Navigation ────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-around py-1.5 px-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = empleadoView === item.key
            return (
              <button
                key={item.key}
                onClick={() => setEmpleadoView(item.key)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[56px] ${
                  isActive
                    ? 'text-emerald-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : ''}`} />
                <span className={`text-[10px] font-medium ${isActive ? 'text-emerald-600' : ''}`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-emerald-600 mt-0.5" />
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* ─── Sticky Footer ───────────────────────── */}
      <footer className="mt-auto border-t bg-white px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            {empleadoData?.propiedadNombre || (locale === 'es' ? 'Propiedad' : 'Property')}
          </p>
          <p className="text-[10px] text-gray-400">
            © 2025 HospitalityUP
          </p>
        </div>
      </footer>
    </div>
  )
}
