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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  DollarSign,
  TrendingUp,
  Star,
  Clock,
  ShoppingCart,
  Target,
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
  [key: string]: unknown
}

interface Propiedad {
  id: string
  nombre: string
  nombreEn: string | null
  moneda: string
}

interface Venta {
  id: string
  nombreServicio: string | null
  montoTotal: number
  montoUpselling: number
  esUpselling: boolean
  calificacionNPS: number | null
  cantidad: number
  fechaVenta: string
  empleado: { id: string; nombre: string; empleadoId: string }
}

const categoriasList = [
  { value: 'platillo', es: 'Platillo', en: 'Dish' },
  { value: 'bebida', es: 'Bebida', en: 'Drink' },
  { value: 'tour', es: 'Tour', en: 'Tour' },
  { value: 'masaje', es: 'Masaje', en: 'Massage' },
  { value: 'habitacion', es: 'Habitación', en: 'Room' },
  { value: 'experiencia', es: 'Experiencia', en: 'Experience' },
  { value: 'paquete', es: 'Paquete', en: 'Package' },
  { value: 'otro', es: 'Otro', en: 'Other' },
]

interface ServicioForm {
  nombre: string
  nombreEn: string
  descripcion: string
  descripcionEn: string
  categoria: string
  precioNormal: string
  esUpselling: boolean
  precioUpselling: string
  objetivoUpselling: string
  objetivoUpsellingEn: string
  disponible: boolean
}

const emptyForm: ServicioForm = {
  nombre: '',
  nombreEn: '',
  descripcion: '',
  descripcionEn: '',
  categoria: 'platillo',
  precioNormal: '',
  esUpselling: false,
  precioUpselling: '',
  objetivoUpselling: '',
  objetivoUpsellingEn: '',
  disponible: true,
}

export function ServiciosAdmin() {
  const { locale, selectedProperty, userRole, userPropiedadId } = useAppStore()
  const t = translations[locale].serviciosAdmin
  const tc = translations[locale].common

  // State
  const [propiedades, setPropiedades] = useState<Propiedad[]>([])
  // For empresa role, lock to their propiedad
  const isEmpresa = userRole === 'empresa' && userPropiedadId
  const [propiedadSeleccionada, setPropiedadSeleccionada] = useState<string>(
    isEmpresa ? userPropiedadId : (selectedProperty !== 'all' ? selectedProperty : '')
  )
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [ventasHoy, setVentasHoy] = useState<Venta[]>([])
  const [loading, setLoading] = useState(false)
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas')
  const [activeTab, setActiveTab] = useState('catalogo')

  // Form state
  const [showFormDialog, setShowFormDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ServicioForm>(emptyForm)
  const [saving, setSaving] = useState(false)

  // Delete dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Load propiedades - empresa only sees their own
  useEffect(() => {
    fetch('/api/propiedades')
      .then(r => r.json())
      .then(data => {
        const props = Array.isArray(data) ? data : []
        // For empresa, filter to only their propiedad
        const filteredProps = isEmpresa ? props.filter(p => p.id === userPropiedadId) : props
        setPropiedades(filteredProps)
        if (!propiedadSeleccionada && filteredProps.length > 0) {
          setPropiedadSeleccionada(isEmpresa ? userPropiedadId : (selectedProperty !== 'all' ? selectedProperty : filteredProps[0].id))
        }
      })
      .catch(() => {})
  }, [selectedProperty, propiedadSeleccionada, isEmpresa, userPropiedadId])

  // Load servicios when propiedad changes
  useEffect(() => {
    if (!propiedadSeleccionada) return
    setLoading(true)
    fetch(`/api/servicios?propiedadId=${propiedadSeleccionada}`)
      .then(r => r.json())
      .then(data => {
        setServicios(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [propiedadSeleccionada])

  // Load today's sales
  useEffect(() => {
    if (!propiedadSeleccionada) return
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    fetch(`/api/ventas?propiedadId=${propiedadSeleccionada}&limit=200`)
      .then(r => r.json())
      .then(data => {
        const ventas = data?.ventas || data
        if (Array.isArray(ventas)) {
          const hoy = ventas.filter((v: Venta) => new Date(v.fechaVenta) >= today)
          setVentasHoy(hoy)
        }
      })
      .catch(() => {})
  }, [propiedadSeleccionada])

  // Filtered services
  const serviciosFiltrados = categoriaFiltro === 'todas'
    ? servicios
    : servicios.filter(s => s.categoria === categoriaFiltro)

  // Today's metrics
  const totalVentas = ventasHoy.reduce((s, v) => s + v.montoTotal, 0)
  const ventasUpselling = ventasHoy.filter(v => v.esUpselling)
  const tasaUpselling = ventasHoy.length > 0 ? (ventasUpselling.length / ventasHoy.length) * 100 : 0
  const ticketPromedio = ventasHoy.length > 0 ? totalVentas / ventasHoy.length : 0

  const fmt = (n: number) => `$${n.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

  // Open form for new service
  const abrirNuevo = () => {
    setEditingId(null)
    setForm(emptyForm)
    setActiveTab('agregar')
    toast.info(locale === 'es' ? 'Completa el formulario de abajo' : 'Fill the form below')
  }

  // Open form for editing
  const abrirEditar = (servicio: Servicio) => {
    setEditingId(servicio.id)
    setForm({
      nombre: servicio.nombre,
      nombreEn: servicio.nombreEn || '',
      descripcion: servicio.descripcion || '',
      descripcionEn: servicio.descripcionEn || '',
      categoria: servicio.categoria,
      precioNormal: servicio.precioNormal.toString(),
      esUpselling: servicio.esUpselling,
      precioUpselling: servicio.precioUpselling?.toString() || '',
      objetivoUpselling: servicio.objetivoUpselling || '',
      objetivoUpsellingEn: servicio.objetivoUpsellingEn || '',
      disponible: servicio.disponible,
    })
    setActiveTab('agregar')
    toast.info(locale === 'es' ? 'Edita el formulario de abajo' : 'Edit the form below')
  }

  // Save service (create or update)
  const guardarServicio = async () => {
    if (!propiedadSeleccionada || !form.nombre || !form.precioNormal) {
      toast.error(t.errorCrear)
      return
    }
    setSaving(true)

    try {
      const payload = {
        propiedadId: propiedadSeleccionada,
        nombre: form.nombre,
        nombreEn: form.nombreEn || null,
        descripcion: form.descripcion || null,
        descripcionEn: form.descripcionEn || null,
        categoria: form.categoria,
        esUpselling: form.esUpselling,
        precioNormal: parseFloat(form.precioNormal),
        precioUpselling: form.esUpselling && form.precioUpselling ? parseFloat(form.precioUpselling) : null,
        objetivoUpselling: form.esUpselling && form.objetivoUpselling ? form.objetivoUpselling : null,
        objetivoUpsellingEn: form.esUpselling && form.objetivoUpsellingEn ? form.objetivoUpsellingEn : null,
        disponible: form.disponible,
      }

      let res: Response
      if (editingId) {
        res = await fetch(`/api/servicios/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/servicios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error')
      }

      const saved = await res.json()

      // Update local state
      if (editingId) {
        setServicios(prev => prev.map(s => s.id === editingId ? saved : s))
        toast.success(t.actualizado)
      } else {
        setServicios(prev => [saved, ...prev])
        toast.success(t.creado)
      }

      setShowFormDialog(false)
    } catch (error) {
      toast.error(String(error?.valueOf()) || t.errorCrear)
    } finally {
      setSaving(false)
    }
  }

  // Delete service
  const eliminarServicio = async () => {
    if (!deletingId) return
    try {
      const res = await fetch(`/api/servicios/${deletingId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error')
      setServicios(prev => prev.filter(s => s.id !== deletingId))
      toast.success(t.eliminado)
    } catch {
      toast.error('Error')
    } finally {
      setShowDeleteDialog(false)
      setDeletingId(null)
    }
  }

  // Toggle disponibilidad
  const toggleDisponibilidad = async (servicio: Servicio) => {
    try {
      const res = await fetch(`/api/servicios/${servicio.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disponible: !servicio.disponible }),
      })
      if (!res.ok) throw new Error('Error')
      const updated = await res.json()
      // Handle demo mode response (no real service object returned)
      if (updated.demo) {
        setServicios(prev => prev.map(s => s.id === servicio.id ? { ...s, disponible: !s.disponible } : s))
        toast.success(!servicio.disponible ? 'Servicio activado' : 'Servicio desactivado')
      } else {
        setServicios(prev => prev.map(s => s.id === servicio.id ? { ...s, ...updated } : s))
        toast.success(!servicio.disponible ? 'Servicio activado' : 'Servicio desactivado')
      }
    } catch {
      toast.error('Error al cambiar disponibilidad')
    }
  }

  const getCategoriaLabel = (cat: string) => {
    const found = categoriasList.find(c => c.value === cat)
    return found ? (locale === 'en' ? found.en : found.es) : cat
  }

  return (
    <div className="space-y-4">
      {/* ── Property Selector ── */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Label className="text-sm font-medium">{t.propiedad}</Label>
              <Select value={propiedadSeleccionada} onValueChange={setPropiedadSeleccionada} disabled={isEmpresa as boolean}>
                <SelectTrigger className="w-[260px]">
                  <SelectValue placeholder={t.propiedad} />
                </SelectTrigger>
                <SelectContent>
                  {propiedades.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {locale === 'en' && p.nombreEn ? p.nombreEn : p.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={abrirNuevo} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="mr-1 size-4" />
              {t.agregarServicio}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Tabs ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="catalogo">{t.catalogo}</TabsTrigger>
          <TabsTrigger value="agregar">{t.agregarEditar}</TabsTrigger>
          <TabsTrigger value="ventas">{t.ventasDelDia}</TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Catálogo ── */}
        <TabsContent value="catalogo" className="mt-4 space-y-4">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={categoriaFiltro === 'todas' ? 'default' : 'outline'}
              size="sm"
              className={categoriaFiltro === 'todas' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              onClick={() => setCategoriaFiltro('todas')}
            >
              {t.todas}
            </Button>
            {categoriasList.map(cat => (
              <Button
                key={cat.value}
                variant={categoriaFiltro === cat.value ? 'default' : 'outline'}
                size="sm"
                className={categoriaFiltro === cat.value ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                onClick={() => setCategoriaFiltro(cat.value)}
              >
                {locale === 'en' ? cat.en : cat.es}
              </Button>
            ))}
          </div>

          {/* Service grid */}
          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="h-40 bg-muted" />
                </Card>
              ))}
            </div>
          ) : serviciosFiltrados.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Package className="mb-2 size-8 opacity-30" />
                <p>{tc.sinDatos}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {serviciosFiltrados.map(servicio => {
                const nombre = locale === 'en' && servicio.nombreEn ? servicio.nombreEn : servicio.nombre
                return (
                  <Card key={servicio.id} className="relative transition-all hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold leading-tight">{nombre}</h3>
                          <div className="mt-1 flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-[10px]">
                              {getCategoriaLabel(servicio.categoria)}
                            </Badge>
                            {servicio.esUpselling && (
                              <Badge className="bg-emerald-600 text-[10px] text-white hover:bg-emerald-700">
                                🎯 UPS
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            onClick={() => abrirEditar(servicio)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-destructive hover:text-destructive"
                            onClick={() => {
                              setDeletingId(servicio.id)
                              setShowDeleteDialog(true)
                            }}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="mb-2 space-y-0.5">
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-bold">{fmt(servicio.precioNormal)}</span>
                          {servicio.esUpselling && servicio.precioUpselling && (
                            <span className="text-sm text-emerald-600">↑ {fmt(servicio.precioUpselling)}</span>
                          )}
                        </div>
                      </div>

                      {/* Disponible toggle */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{t.disponible}</span>
                        <Switch
                          checked={servicio.disponible}
                          onCheckedChange={() => toggleDisponibilidad(servicio)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* ── Tab 2: Agregar/Editar ── */}
        <TabsContent value="agregar" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                {editingId ? <Pencil className="size-4" /> : <Plus className="size-4" />}
                {editingId ? t.editar : t.agregarServicio}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Nombre ES */}
                <div className="space-y-1.5">
                  <Label>{t.nombreES} *</Label>
                  <Input
                    value={form.nombre}
                    onChange={(e) => setForm(prev => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Nombre del servicio"
                  />
                </div>
                {/* Nombre EN */}
                <div className="space-y-1.5">
                  <Label>{t.nombreEN}</Label>
                  <Input
                    value={form.nombreEn}
                    onChange={(e) => setForm(prev => ({ ...prev, nombreEn: e.target.value }))}
                    placeholder="Service name"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Descripción */}
                <div className="space-y-1.5">
                  <Label>{t.descripcion}</Label>
                  <Textarea
                    value={form.descripcion}
                    onChange={(e) => setForm(prev => ({ ...prev, descripcion: e.target.value }))}
                    rows={3}
                  />
                </div>
                {/* Descripción EN */}
                <div className="space-y-1.5">
                  <Label>{t.descripcionEN}</Label>
                  <Textarea
                    value={form.descripcionEn}
                    onChange={(e) => setForm(prev => ({ ...prev, descripcionEn: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {/* Categoría */}
                <div className="space-y-1.5">
                  <Label>{t.categoria}</Label>
                  <Select value={form.categoria} onValueChange={(val) => setForm(prev => ({ ...prev, categoria: val }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriasList.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {locale === 'en' ? cat.en : cat.es}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Precio normal */}
                <div className="space-y-1.5">
                  <Label>{t.precioNormal} *</Label>
                  <Input
                    type="number"
                    value={form.precioNormal}
                    onChange={(e) => setForm(prev => ({ ...prev, precioNormal: e.target.value }))}
                    placeholder="0"
                  />
                </div>

                {/* Disponible */}
                <div className="flex items-end gap-3 pb-1">
                  <Label>{t.disponible}</Label>
                  <Switch
                    checked={form.disponible}
                    onCheckedChange={(checked) => setForm(prev => ({ ...prev, disponible: checked }))}
                  />
                </div>
              </div>

              {/* Upselling section */}
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-800 dark:bg-emerald-950/20">
                <div className="mb-3 flex items-center justify-between">
                  <Label className="flex items-center gap-2 font-medium">
                    🎯 {t.esUpselling}
                  </Label>
                  <Switch
                    checked={form.esUpselling}
                    onCheckedChange={(checked) => setForm(prev => ({
                      ...prev,
                      esUpselling: checked,
                      precioUpselling: checked ? prev.precioUpselling : '',
                      objetivoUpselling: checked ? prev.objetivoUpselling : '',
                    }))}
                  />
                </div>

                {form.esUpselling && (
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label>{t.precioUpselling}</Label>
                      <Input
                        type="number"
                        value={form.precioUpselling}
                        onChange={(e) => setForm(prev => ({ ...prev, precioUpselling: e.target.value }))}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>{t.objetivoUpselling} (ES)</Label>
                      <Input
                        value={form.objetivoUpselling}
                        onChange={(e) => setForm(prev => ({ ...prev, objetivoUpselling: e.target.value }))}
                        placeholder="Ej: Vender maridaje con este platillo"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>{t.objetivoUpselling} (EN)</Label>
                      <Input
                        value={form.objetivoUpsellingEn}
                        onChange={(e) => setForm(prev => ({ ...prev, objetivoUpsellingEn: e.target.value }))}
                        placeholder="E.g.: Sell wine pairing with this dish"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                {editingId && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingId(null)
                      setForm(emptyForm)
                      setActiveTab('catalogo')
                    }}
                  >
                    {tc.cancelar}
                  </Button>
                )}
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={guardarServicio}
                  disabled={saving || !form.nombre || !form.precioNormal}
                >
                  {saving ? '...' : editingId ? t.actualizar : t.guardar}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 3: Ventas del Día ── */}
        <TabsContent value="ventas" className="mt-4 space-y-4">
          {/* Metrics */}
          <div className="grid gap-3 sm:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                    <DollarSign className="size-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t.totalVentas}</p>
                    <p className="text-xl font-bold">{fmt(totalVentas)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                    <TrendingUp className="size-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t.tasaUpselling}</p>
                    <p className="text-xl font-bold">{tasaUpselling.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                    <Star className="size-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t.ticketPromedio}</p>
                    <p className="text-xl font-bold">{fmt(ticketPromedio)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sales table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShoppingCart className="size-4" />
                {t.ventasDelDia}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ventasHoy.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Clock className="mb-2 size-6 opacity-30" />
                  <p className="text-sm">{t.noVentas}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t.empleado}</TableHead>
                        <TableHead>{t.servicio}</TableHead>
                        <TableHead className="text-right">{t.monto}</TableHead>
                        <TableHead className="text-center">{t.upselling}</TableHead>
                        <TableHead className="text-center">{t.nps}</TableHead>
                        <TableHead className="text-right">{t.hora}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ventasHoy.map(venta => (
                        <TableRow key={venta.id}>
                          <TableCell className="font-medium">
                            {venta.empleado?.nombre || '—'}
                          </TableCell>
                          <TableCell>{venta.nombreServicio || '—'}</TableCell>
                          <TableCell className="text-right font-medium">
                            {fmt(venta.montoTotal)}
                          </TableCell>
                          <TableCell className="text-center">
                            {venta.esUpselling ? (
                              <Badge className="bg-emerald-600 text-[10px] text-white">🎯 UPS</Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px]">Normal</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {venta.calificacionNPS !== null ? (
                              <span className={`font-medium ${
                                venta.calificacionNPS >= 9 ? 'text-green-600' :
                                venta.calificacionNPS >= 7 ? 'text-amber-600' : 'text-red-600'
                              }`}>
                                {venta.calificacionNPS}
                              </span>
                            ) : '—'}
                          </TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">
                            {new Date(venta.fechaVenta).toLocaleTimeString(locale === 'es' ? 'es-MX' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Delete Dialog ── */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{tc.confirmar}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {locale === 'es' ? '¿Seguro que deseas eliminar este servicio?' : 'Are you sure you want to delete this service?'}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              {tc.cancelar}
            </Button>
            <Button variant="destructive" onClick={eliminarServicio}>
              {t.eliminar}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
