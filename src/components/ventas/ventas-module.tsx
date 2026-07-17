'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  DollarSign,
  TrendingUp,
  Star,
  Plus,
  ShoppingCart,
  BarChart3,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
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
import { toast } from 'sonner'

// ─── Types ───────────────────────────────────────────────────
interface Venta {
  id: string
  empleadoId: string
  propiedadId: string
  montoUpselling: number
  esUpselling: boolean
  nombreServicio: string | null
  cantidad: number
  precioUnitario: number
  montoTotal: number
  calificacionNPS: number | null
  esPromotor: boolean | null
  comentario: string | null
  fuenteNPS: string | null
  categoriaServicio: string | null
  fechaVenta: string
  analizadoPorIA: boolean
  empleado: { id: string; nombre: string; empleadoId: string; posicion: string; foto: string | null }
  propiedad: { nombre: string; tipo: string }
}

// ─── Chart configs ───────────────────────────────────────────
const ventasEmpleadoConfig: ChartConfig = {
  monto: { label: 'Monto Total', color: '#0d9488' },
  upselling: { label: 'Upselling', color: '#10b981' },
}

const npsEmpleadoConfig: ChartConfig = {
  nps: { label: 'NPS', color: '#f59e0b' },
}

// ─── Main Component ──────────────────────────────────────────
export function VentasModule() {
  const { locale, selectedProperty, userRole, userPropiedadId } = useAppStore()
  const t = translations[locale].ventas
  const tc = translations[locale].common

  const [ventas, setVentas] = useState<Venta[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [showNewVenta, setShowNewVenta] = useState(false)
  const [propiedades, setPropiedades] = useState<{ id: string; nombre: string }[]>([])
  const [empleados, setEmpleados] = useState<{ id: string; nombre: string; posicion: string }[]>([])
  const [filtroUpselling, setFiltroUpselling] = useState('todas')

  // New venta form
  const [form, setForm] = useState({
    empleadoId: '',
    propiedadId: '',
    nombreServicio: '',
    precioUnitario: '',
    cantidad: '1',
    esUpselling: false,
    montoUpselling: '',
    calificacionNPS: '',
    comentario: '',
    categoriaServicio: 'menu',
    fuenteNPS: 'qr',
  })

  const isEmpresa = userRole === 'empresa' && userPropiedadId

  const fetchVentas = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      // For empresa, always filter by their propiedad
      if (isEmpresa) {
        params.set('propiedadId', userPropiedadId!)
      } else if (selectedProperty !== 'all') {
        params.set('propiedadId', selectedProperty)
      }
      if (filtroUpselling === 'upselling') params.set('esUpselling', 'true')
      params.set('limit', '50')
      const res = await fetch(`/api/ventas?${params}`)
      const data = await res.json()
      setVentas(data.ventas || [])
      setTotal(data.total || 0)
    } catch (err) {
      console.error('Error fetching ventas:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedProperty, filtroUpselling, isEmpresa, userPropiedadId])

  useEffect(() => {
    fetchVentas()
  }, [fetchVentas])

  // Fetch propiedades y empleados for form - empresa only sees their own
  useEffect(() => {
    fetch('/api/propiedades').then(r => r.json()).then(d => {
      const props = Array.isArray(d) ? d : []
      const filtered = isEmpresa ? props.filter(p => p.id === userPropiedadId) : props
      setPropiedades(filtered.map(p => ({ id: p.id, nombre: p.nombre })))
    }).catch(() => {})
    const empUrl = isEmpresa ? `/api/empleados?propiedadId=${userPropiedadId}` : '/api/empleados'
    fetch(empUrl).then(r => r.json()).then(d => setEmpleados(Array.isArray(d) ? d.map((e: { id: string; nombre: string; posicion: string }) => ({ id: e.id, nombre: e.nombre, posicion: e.posicion })) : [])).catch(() => {})
  }, [isEmpresa, userPropiedadId])

  const handleRegistrarVenta = async () => {
    try {
      const precio = parseFloat(form.precioUnitario)
      const cantidad = parseInt(form.cantidad)
      const montoTotal = precio * cantidad

      if (!form.empleadoId || !form.propiedadId || isNaN(precio)) {
        toast.error(locale === 'es' ? 'Completa todos los campos requeridos' : 'Fill all required fields')
        return
      }

      const res = await fetch('/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empleadoId: form.empleadoId,
          propiedadId: form.propiedadId,
          nombreServicio: form.nombreServicio || null,
          precioUnitario: precio,
          cantidad,
          montoTotal,
          esUpselling: form.esUpselling,
          montoUpselling: form.esUpselling ? parseFloat(form.montoUpselling) || 0 : 0,
          calificacionNPS: form.calificacionNPS ? parseInt(form.calificacionNPS) : null,
          comentario: form.comentario || null,
          categoriaServicio: form.categoriaServicio,
          fuenteNPS: form.fuenteNPS,
        }),
      })
      if (res.ok) {
        toast.success(t.ventaExitosa)
        setShowNewVenta(false)
        setForm({
          empleadoId: '', propiedadId: '', nombreServicio: '', precioUnitario: '',
          cantidad: '1', esUpselling: false, montoUpselling: '', calificacionNPS: '',
          comentario: '', categoriaServicio: 'menu', fuenteNPS: 'qr',
        })
        fetchVentas()
      } else {
        const err = await res.json()
        toast.error(err.error || tc.error)
      }
    } catch {
      toast.error(tc.error)
    }
  }

  // ─── Derived metrics ─────────────────────────────────────
  const totalUpselling = ventas.filter(v => v.esUpselling).reduce((s, v) => s + v.montoUpselling, 0)
  const ticketPromedio = ventas.length > 0 ? ventas.reduce((s, v) => s + v.montoTotal, 0) / ventas.length : 0
  const tasaUpselling = ventas.length > 0 ? (ventas.filter(v => v.esUpselling).length / ventas.length) * 100 : 0

  // Chart data: ventas por empleado
  const ventasPorEmpleado = ventas.reduce((acc, v) => {
    const nombre = v.empleado.nombre.split(' ')[0]
    const existing = acc.find(a => a.nombre === nombre)
    if (existing) {
      existing.monto += v.montoTotal
      existing.upselling += v.montoUpselling
    } else {
      acc.push({ nombre, monto: v.montoTotal, upselling: v.montoUpselling })
    }
    return acc
  }, [] as { nombre: string; monto: number; upselling: number }[])

  // Chart data: NPS por empleado
  const npsPorEmpleado = ventas
    .filter(v => v.calificacionNPS !== null)
    .reduce((acc, v) => {
      const nombre = v.empleado.nombre.split(' ')[0]
      const existing = acc.find(a => a.nombre === nombre)
      if (existing) {
        existing.total += v.calificacionNPS!
        existing.count += 1
      } else {
        acc.push({ nombre, total: v.calificacionNPS!, count: 1 })
      }
      return acc
    }, [] as { nombre: string; total: number; count: number }[])
    .map(e => ({ nombre: e.nombre, nps: Math.round((e.total / e.count) * 10) / 10 }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-sm text-muted-foreground">
            {locale === 'es' ? 'Seguimiento de ventas, upselling y satisfacción del cliente' : 'Sales, upselling and customer satisfaction tracking'}
          </p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2" onClick={() => setShowNewVenta(true)}>
          <Plus className="size-4" />
          {t.registrarVenta}
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="py-4">
          <CardContent className="px-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30">
                <DollarSign className="size-4 text-teal-600 dark:text-teal-400" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{t.totalUpselling}</span>
            </div>
            <span className="text-xl font-bold">${totalUpselling.toFixed(2)}</span>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent className="px-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <ShoppingCart className="size-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{t.ticketPromedio}</span>
            </div>
            <span className="text-xl font-bold">${ticketPromedio.toFixed(2)}</span>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent className="px-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <TrendingUp className="size-4 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{t.tasaUpselling}</span>
            </div>
            <span className="text-xl font-bold">{tasaUpselling.toFixed(1)}%</span>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={filtroUpselling} onValueChange={setFiltroUpselling}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">{t.todas}</SelectItem>
            <SelectItem value="upselling">{t.filtroUpselling}</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{total} {locale === 'es' ? 'ventas' : 'sales'}</span>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t.ventasPorEmpleado}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={ventasEmpleadoConfig} className="h-[240px] w-full">
              <BarChart data={ventasPorEmpleado} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="nombre" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v: number) => `$${v}`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="monto" fill="var(--color-monto)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="upselling" fill="var(--color-upselling)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t.npsPorEmpleado}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={npsEmpleadoConfig} className="h-[240px] w-full">
              <BarChart data={npsPorEmpleado} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="nombre" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis domain={[0, 10]} tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="nps" fill="var(--color-nps)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Ventas Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t.ventasRecientes}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-48 animate-pulse rounded bg-muted" />
          ) : ventas.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{t.noVentas}</p>
          ) : (
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.empleado}</TableHead>
                    <TableHead>{t.servicio}</TableHead>
                    <TableHead className="text-right">{t.monto}</TableHead>
                    <TableHead>{t.upselling}</TableHead>
                    <TableHead>{t.calificacionNPS}</TableHead>
                    <TableHead>{t.fecha}</TableHead>
                    {locale === 'es' && <TableHead>IA</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ventas.map((venta) => (
                    <TableRow key={venta.id}>
                      <TableCell className="font-medium text-sm">{venta.empleado.nombre}</TableCell>
                      <TableCell className="text-sm">{venta.nombreServicio || '-'}</TableCell>
                      <TableCell className="text-right text-sm">${venta.montoTotal.toFixed(2)}</TableCell>
                      <TableCell>
                        {venta.esUpselling ? (
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px]">
                            +${venta.montoUpselling.toFixed(2)}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {venta.calificacionNPS !== null ? (
                          <Badge variant="outline" className={`text-[10px] ${venta.calificacionNPS >= 9 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : venta.calificacionNPS >= 7 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                            {venta.calificacionNPS}/10
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(venta.fechaVenta).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US')}
                      </TableCell>
                      {locale === 'es' && (
                        <TableCell>
                          {venta.analizadoPorIA ? (
                            <Badge variant="outline" className="text-[10px] bg-violet-50 text-violet-700 border-violet-200">🤖</Badge>
                          ) : '-'}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Dialog: Registrar Nueva Venta ────────────────── */}
      <Dialog open={showNewVenta} onOpenChange={setShowNewVenta}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="size-5 text-teal-600" />
              {t.registrarVenta}
            </DialogTitle>
            <DialogDescription>
              {locale === 'es' ? 'Registra una nueva venta. Si incluye upselling, se activará el Agente de IA.' : 'Register a new sale. If it includes upselling, the AI Agent will be triggered.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.empleado}</Label>
                <Select value={form.empleadoId} onValueChange={v => setForm(p => ({ ...p, empleadoId: v }))}>
                  <SelectTrigger><SelectValue placeholder={locale === 'es' ? 'Seleccionar...' : 'Select...'} /></SelectTrigger>
                  <SelectContent>
                    {empleados.map(e => (
                      <SelectItem key={e.id} value={e.id}>{e.nombre} - {e.posicion}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t.filtroPropiedad}</Label>
                <Select value={form.propiedadId || selectedProperty} onValueChange={v => setForm(p => ({ ...p, propiedadId: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {propiedades.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t.nombreServicio}</Label>
              <Input value={form.nombreServicio} onChange={e => setForm(p => ({ ...p, nombreServicio: e.target.value }))} placeholder={locale === 'es' ? 'Ej: Upgrade Suite Deluxe' : 'E.g. Deluxe Suite Upgrade'} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.precioUnitario}</Label>
                <Input type="number" value={form.precioUnitario} onChange={e => setForm(p => ({ ...p, precioUnitario: e.target.value }))} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label>{t.cantidad}</Label>
                <Input type="number" min="1" value={form.cantidad} onChange={e => setForm(p => ({ ...p, cantidad: e.target.value }))} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.esUpselling}
                  onChange={e => setForm(p => ({ ...p, esUpselling: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium">{t.esUpselling}</span>
              </label>
              {form.esUpselling && (
                <Input
                  type="number"
                  value={form.montoUpselling}
                  onChange={e => setForm(p => ({ ...p, montoUpselling: e.target.value }))}
                  placeholder={t.montoUpselling}
                  className="w-36"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.categoriaServicio}</Label>
                <Select value={form.categoriaServicio} onValueChange={v => setForm(p => ({ ...p, categoriaServicio: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="menu">Menu</SelectItem>
                    <SelectItem value="upselling">Upselling</SelectItem>
                    <SelectItem value="upgrade_habitacion">{locale === 'es' ? 'Upgrade Habitación' : 'Room Upgrade'}</SelectItem>
                    <SelectItem value="experiencia">{locale === 'es' ? 'Experiencia' : 'Experience'}</SelectItem>
                    <SelectItem value="tour">Tour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t.calificacion}</Label>
                <Select value={form.calificacionNPS} onValueChange={v => setForm(p => ({ ...p, calificacionNPS: v }))}>
                  <SelectTrigger><SelectValue placeholder={locale === 'es' ? 'Opcional' : 'Optional'} /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 11 }, (_, i) => (
                      <SelectItem key={i} value={String(i)}>{i}/10 {i >= 9 ? '⭐' : i >= 7 ? '👍' : '👎'}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t.comentario}</Label>
              <Textarea value={form.comentario} onChange={e => setForm(p => ({ ...p, comentario: e.target.value }))} placeholder={locale === 'es' ? 'Comentario del cliente...' : 'Client comment...'} rows={2} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewVenta(false)}>{locale === 'es' ? 'Cancelar' : 'Cancel'}</Button>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5" onClick={handleRegistrarVenta}>
              <DollarSign className="size-4" />
              {t.registrar}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
