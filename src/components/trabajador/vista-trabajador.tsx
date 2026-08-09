'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { translations } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import {
  ShoppingCart, Target, TrendingUp, Star,
  DollarSign, User, Building2, ChevronRight,
  Download, CheckCircle,
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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
  propiedad: { id: string; nombre: string; nombreEn: string | null; region: string }
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

interface TicketVenta {
  folio: string
  empleado: string
  propiedad: string
  servicio: string
  cantidad: number
  precioUnitario: number
  esUpselling: boolean
  montoUpselling: number
  total: number
  fecha: string
  nota: string
}

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

function generarFolio(): string {
  const now = new Date()
  return `HUP-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${Math.random().toString(36).substring(2,6).toUpperCase()}`
}

function generarTicketHTML(ticket: TicketVenta): string {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Ticket ${ticket.folio}</title>
<style>
  body { font-family: 'Courier New', monospace; max-width: 320px; margin: 0 auto; padding: 20px; }
  .center { text-align: center; }
  .bold { font-weight: bold; }
  .line { border-top: 1px dashed #000; margin: 10px 0; }
  .row { display: flex; justify-content: space-between; margin: 4px 0; }
  .title { font-size: 18px; font-weight: bold; }
  .folio { font-size: 12px; color: #666; }
  .upselling { background: #d1fae5; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
  .total { font-size: 20px; font-weight: bold; }
  .footer { font-size: 11px; color: #888; margin-top: 10px; }
</style>
</head>
<body>
<div class="center">
  <div class="title">HospitalityUP</div>
  <div class="folio">${ticket.propiedad}</div>
  <div class="folio">Folio: ${ticket.folio}</div>
  <div class="folio">${ticket.fecha}</div>
</div>
<div class="line"></div>
<div class="row"><span>Atendido por:</span><span class="bold">${ticket.empleado}</span></div>
<div class="line"></div>
<div class="row"><span class="bold">${ticket.servicio}</span></div>
<div class="row"><span>Cantidad:</span><span>${ticket.cantidad}</span></div>
<div class="row"><span>Precio unitario:</span><span>$${ticket.precioUnitario.toFixed(2)}</span></div>
${ticket.esUpselling ? `<div class="row"><span class="upselling">✓ Upselling (+$${ticket.montoUpselling.toFixed(2)})</span></div>` : ''}
<div class="line"></div>
<div class="row"><span class="bold">TOTAL</span><span class="total">$${ticket.total.toFixed(2)}</span></div>
<div class="line"></div>
${ticket.nota ? `<div class="folio">Nota: ${ticket.nota}</div>` : ''}
<div class="center footer">
  <p>Califica tu experiencia escaneando el QR</p>
  <p>¡Gracias por tu preferencia!</p>
  <p>HospitalityUP © 2025</p>
</div>
</body>
</html>`
}

export function VistaTrabajador() {
  const { locale, selectedProperty } = useAppStore()
  const t = translations[locale].trabajador
  const tc = translations[locale].common

  const [sesionEmpleadoId, setSesionEmpleadoId] = useState<string | null>(null)
  const esModoEmpleado = !!sesionEmpleadoId

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('hospitalityup_session')
      if (session) {
        const parsed = JSON.parse(session)
        if (parsed.rol === 'empleado') setSesionEmpleadoId(parsed.id)
      }
    }
  }, [])

  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<Empleado | null>(null)
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [ventasDia, setVentasDia] = useState<VentaDia[]>([])
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos')
  const [loadingServicios, setLoadingServicios] = useState(false)

  // Venta dialog
  const [showVentaDialog, setShowVentaDialog] = useState(false)
  const [servicioVenta, setServicioVenta] = useState<Servicio | null>(null)
  const [ventaCantidad, setVentaCantidad] = useState(1)
  const [ventaNota, setVentaNota] = useState('')
  const [procesandoVenta, setProcesandoVenta] = useState(false)

  // Ticket dialog
  const [showTicket, setShowTicket] = useState(false)
  const [ticketData, setTicketData] = useState<TicketVenta | null>(null)

  useEffect(() => {
    if (esModoEmpleado && sesionEmpleadoId) {
      fetch(`/api/empleados/${sesionEmpleadoId}`)
        .then(r => r.json())
        .then(data => {
          if (data?.id) { setEmpleados([data]); setEmpleadoSeleccionado(data) }
        })
        .catch(() => {})
    } else {
      fetch('/api/empleados')
        .then(r => r.json())
        .then(data => setEmpleados(Array.isArray(data) ? data : []))
        .catch(() => {})
    }
  }, [esModoEmpleado, sesionEmpleadoId])

  const propiedadId = empleadoSeleccionado?.propiedadId || (selectedProperty !== 'all' ? selectedProperty : null)

  useEffect(() => {
    if (!propiedadId) return
    setLoadingServicios(true)
    fetch(`/api/servicios?propiedadId=${propiedadId}&disponible=true`)
      .then(r => r.json())
      .then(data => { setServicios(Array.isArray(data) ? data : []); setLoadingServicios(false) })
      .catch(() => setLoadingServicios(false))
  }, [propiedadId])

  useEffect(() => {
    if (!empleadoSeleccionado) { setVentasDia([]); return }
    const today = new Date(); today.setHours(0,0,0,0)
    fetch(`/api/ventas?empleadoId=${empleadoSeleccionado.id}&limit=100`)
      .then(r => r.json())
      .then(data => {
        const ventas = data?.ventas || data
        if (Array.isArray(ventas)) setVentasDia(ventas.filter((v: VentaDia) => new Date(v.fechaVenta) >= today))
      })
      .catch(() => {})
  }, [empleadoSeleccionado])

  const ventasNormales = ventasDia.filter(v => !v.esUpselling).reduce((s, v) => s + v.montoTotal, 0)
  const ventasUpsellingTotal = ventasDia.filter(v => v.esUpselling).reduce((s, v) => s + v.montoUpselling, 0)
  const totalDia = ventasDia.reduce((s, v) => s + v.montoTotal, 0)
  const totalServiciosVendidos = ventasDia.reduce((s, v) => s + v.cantidad, 0)
  const ventasUpsellingCount = ventasDia.filter(v => v.esUpselling).length

  const serviciosFiltrados = categoriaFiltro === 'todos'
    ? servicios.filter(s => s.disponible)
    : servicios.filter(s => s.categoria === categoriaFiltro && s.disponible)

  const serviciosUpselling = servicios.filter(s => s.esUpselling && s.disponible)

  const abrirVenta = useCallback((servicio: Servicio) => {
    setServicioVenta(servicio)
    setVentaCantidad(1)
    setVentaNota('')
    setShowVentaDialog(true)
  }, [])

  const registrarVenta = async () => {
    if (!empleadoSeleccionado || !servicioVenta) return
    setProcesandoVenta(true)
    try {
      const esUpselling = servicioVenta.esUpselling
      const precioFinal = esUpselling ? (servicioVenta.precioUpselling || servicioVenta.precioNormal) : servicioVenta.precioNormal
      const montoTotal = precioFinal * ventaCantidad
      const montoUpselling = esUpselling ? (precioFinal - servicioVenta.precioNormal) * ventaCantidad : 0

      const res = await fetch('/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empleadoId: empleadoSeleccionado.id,
          propiedadId: empleadoSeleccionado.propiedadId,
          nombreServicio: locale === 'en' && servicioVenta.nombreEn ? servicioVenta.nombreEn : servicioVenta.nombre,
          cantidad: ventaCantidad,
          precioUnitario: precioFinal,
          montoTotal,
          esUpselling,
          montoUpselling: Math.max(0, montoUpselling),
          calificacionNPS: null,
          comentario: ventaNota || undefined,
          fuenteNPS: 'app',
          categoriaServicio: servicioVenta.categoria,
        }),
      })

      if (!res.ok) throw new Error((await res.json()).error || 'Error')

      const nuevaVenta = await res.json()
      setVentasDia(prev => [nuevaVenta, ...prev])

      const folio = generarFolio()
      const ticket: TicketVenta = {
        folio,
        empleado: empleadoSeleccionado.nombre,
        propiedad: empleadoSeleccionado.propiedad.nombre,
        servicio: locale === 'en' && servicioVenta.nombreEn ? servicioVenta.nombreEn : servicioVenta.nombre,
        cantidad: ventaCantidad,
        precioUnitario: precioFinal,
        esUpselling,
        montoUpselling: Math.max(0, montoUpselling),
        total: montoTotal,
        fecha: new Date().toLocaleString('es-MX'),
        nota: ventaNota,
      }

      setTicketData(ticket)
      setShowVentaDialog(false)
      setShowTicket(true)
      toast.success('¡Venta registrada!', { description: `$${montoTotal.toFixed(2)} - ${ticket.servicio}` })
    } catch (error) {
      toast.error(String(error) || 'Error')
    } finally {
      setProcesandoVenta(false)
    }
  }

  const descargarTicket = () => {
    if (!ticketData) return
    const html = generarTicketHTML(ticketData)
    const ventana = window.open('', '_blank')
    if (!ventana) return
    ventana.document.write(html)
    ventana.document.close()
    ventana.focus()
    setTimeout(() => {
      ventana.print()
      ventana.close()
    }, 500)
  }

  const compartirWhatsApp = () => {
    if (!ticketData) return
    const msg = encodeURIComponent(
      `🧾 *Ticket HospitalityUP*\n` +
      `Folio: ${ticketData.folio}\n` +
      `📍 ${ticketData.propiedad}\n` +
      `👤 Atendido por: ${ticketData.empleado}\n` +
      `━━━━━━━━━━━━━━━\n` +
      `✅ ${ticketData.servicio}\n` +
      `Cantidad: ${ticketData.cantidad}\n` +
      `Precio: $${ticketData.precioUnitario.toFixed(2)}\n` +
      (ticketData.esUpselling ? `⬆️ Upselling: +$${ticketData.montoUpselling.toFixed(2)}\n` : '') +
      `━━━━━━━━━━━━━━━\n` +
      `💰 *TOTAL: $${ticketData.total.toFixed(2)}*\n` +
      `📅 ${ticketData.fecha}\n\n` +
      `¡Gracias por su preferencia! 🙏`
    )
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  const moneda = servicios[0]?.propiedad?.moneda || 'MXN'
  const fmt = (n: number) => `$${n.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <User className="size-5 text-emerald-600" />
                {esModoEmpleado ? (
                  <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 dark:bg-background">
                    <span className="font-semibold text-sm">{empleadoSeleccionado?.nombre}</span>
                    <Badge variant="outline" className="text-xs">{empleadoSeleccionado?.empleadoId}</Badge>
                  </div>
                ) : (
                  <Select value={empleadoSeleccionado?.id || ''} onValueChange={(val) => setEmpleadoSeleccionado(empleados.find(e => e.id === val) || null)}>
                    <SelectTrigger className="w-[260px] bg-white dark:bg-background">
                      <SelectValue placeholder={t.seleccionarEmpleado} />
                    </SelectTrigger>
                    <SelectContent>
                      {empleados.map(e => <SelectItem key={e.id} value={e.id}>{e.nombre} - {e.empleadoId}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              </div>
              {empleadoSeleccionado && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="size-4" />
                  <span>{locale === 'en' && empleadoSeleccionado.propiedad.nombreEn ? empleadoSeleccionado.propiedad.nombreEn : empleadoSeleccionado.propiedad.nombre}</span>
                </div>
              )}
            </div>
            {empleadoSeleccionado && (
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-1.5 rounded-lg bg-green-100 px-3 py-1.5 dark:bg-green-900/30">
                  <DollarSign className="size-4 text-green-600" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-400">Ventas</span>
                  <span className="text-sm font-bold text-green-800 dark:text-green-300">{fmt(ventasNormales)}</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-1.5 dark:bg-emerald-900/30">
                  <TrendingUp className="size-4 text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Upselling</span>
                  <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">{fmt(ventasUpsellingTotal)} ({ventasUpsellingCount})</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-teal-100 px-3 py-1.5 dark:bg-teal-900/30">
                  <Star className="size-4 text-teal-600" />
                  <span className="text-xs font-medium text-teal-700 dark:text-teal-400">Total</span>
                  <span className="text-sm font-bold text-teal-800 dark:text-teal-300">{fmt(totalDia)}</span>
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
          <div className="space-y-4">
            {/* Category filters */}
            <div className="flex flex-wrap gap-2">
              {categorias.map(cat => (
                <Button key={cat.key} variant={categoriaFiltro === cat.key ? 'default' : 'outline'} size="sm"
                  className={categoriaFiltro === cat.key ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                  onClick={() => setCategoriaFiltro(cat.key)}>
                  {locale === 'en' ? cat.en : cat.es}
                </Button>
              ))}
            </div>

            {/* Service grid */}
            {loadingServicios ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[1,2,3,4,5,6].map(i => <Card key={i} className="animate-pulse"><CardContent className="h-36 bg-muted" /></Card>)}
              </div>
            ) : serviciosFiltrados.length === 0 ? (
              <Card><CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <ShoppingCart className="mb-2 size-8 opacity-30" />
                <p>{t.noServicios}</p>
              </CardContent></Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {serviciosFiltrados.map(servicio => {
                  const nombre = locale === 'en' && servicio.nombreEn ? servicio.nombreEn : servicio.nombre
                  const precioFinal = servicio.esUpselling ? (servicio.precioUpselling || servicio.precioNormal) : servicio.precioNormal
                  return (
                    <Card key={servicio.id} className="group relative transition-all hover:shadow-md hover:ring-1 hover:ring-emerald-300">
                      <CardContent className="p-4">
                        {servicio.esUpselling && (
                          <Badge className="absolute right-3 top-3 bg-emerald-600 text-white text-[10px]">⬆️ UPS</Badge>
                        )}
                        <h3 className="mb-1 pr-16 text-sm font-semibold leading-tight">{nombre}</h3>
                        <Badge variant="outline" className="mb-2 text-[10px]">{servicio.categoria}</Badge>
                        <div className="mb-3">
                          {servicio.esUpselling && servicio.precioUpselling ? (
                            <div>
                              <div className="flex items-baseline gap-1">
                                <span className="text-xs text-muted-foreground line-through">{fmt(servicio.precioNormal)}</span>
                                <span className="text-lg font-bold text-emerald-600">{fmt(servicio.precioUpselling)}</span>
                                <span className="text-[10px] text-muted-foreground">{moneda}</span>
                              </div>
                              <p className="text-[10px] text-emerald-600">+${(servicio.precioUpselling - servicio.precioNormal).toFixed(0)} upselling</p>
                            </div>
                          ) : (
                            <div className="flex items-baseline gap-1">
                              <span className="text-lg font-bold text-green-700">{fmt(servicio.precioNormal)}</span>
                              <span className="text-[10px] text-muted-foreground">{moneda}</span>
                            </div>
                          )}
                        </div>
                        {servicio.esUpselling && servicio.objetivoUpselling && (
                          <p className="mb-3 text-[10px] leading-snug text-amber-700 dark:text-amber-400 bg-amber-50 rounded p-1">
                            💡 {locale === 'en' && servicio.objetivoUpsellingEn ? servicio.objetivoUpsellingEn : servicio.objetivoUpselling}
                          </p>
                        )}
                        <Button className="w-full bg-green-600 text-sm font-bold hover:bg-green-700" onClick={() => abrirVenta(servicio)}>
                          <ShoppingCart className="mr-2 size-4" />{t.vender} {fmt(precioFinal)}
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {/* Upselling objectives */}
            {serviciosUpselling.length > 0 && (
              <div className="mt-4">
                <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
                  <Target className="size-5 text-amber-600" />
                  Mis Objetivos de Upselling
                  <Badge variant="outline" className="ml-auto text-emerald-700 border-emerald-300">
                    {ventasUpsellingCount} vendidos hoy
                  </Badge>
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {serviciosUpselling.map(servicio => {
                    const nombre = locale === 'en' && servicio.nombreEn ? servicio.nombreEn : servicio.nombre
                    const objetivo = locale === 'en' && servicio.objetivoUpsellingEn ? servicio.objetivoUpsellingEn : servicio.objetivoUpselling
                    const vendidosHoy = ventasDia.filter(v => v.esUpselling && v.nombreServicio === nombre).length
                    const porcentaje = Math.min(100, (vendidosHoy / 3) * 100)
                    return (
                      <Card key={servicio.id} className={`border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20 ${vendidosHoy >= 3 ? 'ring-1 ring-emerald-400' : ''}`}>
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold truncate">{nombre}</h4>
                              {objetivo && <p className="text-[10px] text-amber-700 mt-0.5">{objetivo}</p>}
                            </div>
                            <Badge variant="outline" className="border-emerald-400 text-emerald-700 shrink-0 ml-2">
                              {fmt(servicio.precioUpselling || 0)}
                            </Badge>
                          </div>
                          <div className="space-y-1 mt-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Progreso</span>
                              <span className={`font-medium ${vendidosHoy >= 3 ? 'text-emerald-600' : ''}`}>
                                {vendidosHoy}/3 {vendidosHoy >= 3 ? '✓' : ''}
                              </span>
                            </div>
                            <Progress value={porcentaje} className={`h-2 ${vendidosHoy >= 3 ? '[&>div]:bg-emerald-500' : '[&>div]:bg-amber-500'}`} />
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar resumen */}
          <div className="space-y-4">
            <Card className="sticky top-4">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="size-4 text-emerald-600" />
                  Resumen del Día
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Ventas normales</span>
                  <span className="font-semibold text-green-700">{fmt(ventasNormales)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Ventas upselling</span>
                  <span className="font-semibold text-emerald-700">{fmt(ventasUpsellingTotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Upselling realizados</span>
                  <Badge className="bg-emerald-100 text-emerald-700">{ventasUpsellingCount}</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total del día</span>
                  <span className="text-lg font-bold text-emerald-700">{fmt(totalDia)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Servicios vendidos</span>
                  <span className="font-semibold">{totalServiciosVendidos}</span>
                </div>
                {ventasDia.length > 0 && (
                  <>
                    <Separator />
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recientes</h4>
                    <ScrollArea className="max-h-48">
                      <div className="space-y-1.5">
                        {ventasDia.slice(0, 8).map(venta => (
                          <div key={venta.id} className="flex items-center justify-between rounded-md bg-muted/50 px-2 py-1.5 text-xs">
                            <div className="flex items-center gap-1.5 min-w-0">
                              {venta.esUpselling && <span className="shrink-0 text-emerald-600">⬆️</span>}
                              <span className="truncate">{venta.nombreServicio || '—'}</span>
                            </div>
                            <span className="shrink-0 font-medium">{fmt(venta.montoTotal)}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Venta Dialog */}
      <Dialog open={showVentaDialog} onOpenChange={setShowVentaDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="size-5 text-green-600" />
              {locale === 'en' && servicioVenta?.nombreEn ? servicioVenta.nombreEn : servicioVenta?.nombre}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {servicioVenta?.esUpselling && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm">
                <span className="font-semibold text-emerald-700">⬆️ Venta Upselling</span>
                <p className="text-xs text-emerald-600 mt-1">{servicioVenta.objetivoUpselling}</p>
                <div className="flex justify-between mt-2 text-xs">
                  <span>Normal: {fmt(servicioVenta.precioNormal)}</span>
                  <span className="font-bold text-emerald-700">Upselling: {fmt(servicioVenta.precioUpselling || 0)}</span>
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Cantidad</Label>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setVentaCantidad(Math.max(1, ventaCantidad - 1))}>−</Button>
                <Input type="number" min={1} value={ventaCantidad} onChange={(e) => setVentaCantidad(Math.max(1, parseInt(e.target.value) || 1))} className="w-20 text-center" />
                <Button variant="outline" size="icon" onClick={() => setVentaCantidad(ventaCantidad + 1)}>+</Button>
              </div>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <span className="text-sm text-muted-foreground">Total: </span>
              <span className="text-2xl font-bold text-emerald-700">
                {fmt((servicioVenta?.esUpselling ? (servicioVenta.precioUpselling || servicioVenta?.precioNormal || 0) : (servicioVenta?.precioNormal || 0)) * ventaCantidad)}
              </span>
              <span className="text-xs text-muted-foreground ml-1">{moneda}</span>
            </div>
            <div className="space-y-1.5">
              <Label>Nota (opcional)</Label>
              <Textarea value={ventaNota} onChange={(e) => setVentaNota(e.target.value)} placeholder="Observaciones del pedido..." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVentaDialog(false)} disabled={procesandoVenta}>{tc.cancelar}</Button>
            <Button className="bg-green-600 font-bold hover:bg-green-700" onClick={registrarVenta} disabled={procesandoVenta}>
              {procesandoVenta ? '...' : 'Confirmar Venta'}<ChevronRight className="ml-1 size-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ticket Dialog */}
      <Dialog open={showTicket} onOpenChange={setShowTicket}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="size-5 text-emerald-600" />
              ¡Venta Registrada!
            </DialogTitle>
          </DialogHeader>
          {ticketData && (
            <div className="space-y-3">
              <div className="rounded-lg border bg-muted/30 p-4 font-mono text-sm space-y-2">
                <div className="text-center font-bold text-base">HospitalityUP</div>
                <div className="text-center text-xs text-muted-foreground">{ticketData.propiedad}</div>
                <div className="text-center text-xs text-muted-foreground">Folio: {ticketData.folio}</div>
                <Separator />
                <div className="flex justify-between text-xs"><span>Atendido por:</span><span className="font-semibold">{ticketData.empleado}</span></div>
                <Separator />
                <div className="font-semibold">{ticketData.servicio}</div>
                <div className="flex justify-between text-xs"><span>Cantidad:</span><span>{ticketData.cantidad}</span></div>
                <div className="flex justify-between text-xs"><span>Precio:</span><span>${ticketData.precioUnitario.toFixed(2)}</span></div>
                {ticketData.esUpselling && (
                  <div className="text-xs text-emerald-600 font-semibold">⬆️ Upselling +${ticketData.montoUpselling.toFixed(2)}</div>
                )}
                <Separator />
                <div className="flex justify-between font-bold"><span>TOTAL</span><span className="text-emerald-700">${ticketData.total.toFixed(2)}</span></div>
                <div className="text-center text-xs text-muted-foreground mt-2">¡Gracias por su preferencia!</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="gap-2" onClick={descargarTicket}>
                  <Download className="size-4" />
                  Descargar
                </Button>
                <Button className="bg-green-600 hover:bg-green-700 text-white gap-2" onClick={compartirWhatsApp}>
                  📱 WhatsApp
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTicket(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}