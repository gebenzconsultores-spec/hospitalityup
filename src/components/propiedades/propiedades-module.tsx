'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Users,
  CreditCard,
  Star,
  Search,
  Hotel,
  UtensilsCrossed,
  Wine,
  Sparkles,
  Palmtree,
  Coffee,
  Music,
  Waves,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
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
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAppStore } from '@/lib/store'
import { translations } from '@/lib/i18n'
import { toast } from 'sonner'

// ─── Types ───────────────────────────────────────────────────
interface Propiedad {
  id: string
  nombre: string
  nombreEn: string | null
  tipo: string
  ubicacion: string
  region: string
  plan: string
  moneda: string
  activo: boolean
  createdAt: string
  updatedAt: string
  empleadosActivos: number
  capacitacionesActivas: number
  totalVentas: number
}

interface FormData {
  nombre: string
  nombreEn: string
  tipo: string
  ubicacion: string
  region: string
  plan: string
  moneda: string
  activo: boolean
}

const emptyForm: FormData = {
  nombre: '',
  nombreEn: '',
  tipo: 'hotel',
  ubicacion: '',
  region: 'cancun',
  plan: 'boutique',
  moneda: 'MXN',
  activo: true,
}

const tiposPropiedad = [
  { value: 'hotel', labelEs: 'Hotel', labelEn: 'Hotel', icon: Hotel },
  { value: 'restaurante', labelEs: 'Restaurante', labelEn: 'Restaurant', icon: UtensilsCrossed },
  { value: 'bar', labelEs: 'Bar', labelEn: 'Bar', icon: Wine },
  { value: 'spa', labelEs: 'Spa', labelEn: 'Spa', icon: Sparkles },
  { value: 'resort', labelEs: 'Resort', labelEn: 'Resort', icon: Palmtree },
  { value: 'cafe', labelEs: 'Café', labelEn: 'Café', icon: Coffee },
  { value: 'discoteca', labelEs: 'Discoteca', labelEn: 'Nightclub', icon: Music },
  { value: 'club_playa', labelEs: 'Club de Playa', labelEn: 'Beach Club', icon: Waves },
]

const regiones = [
  { value: 'cancun', labelEs: 'Cancún', labelEn: 'Cancún' },
  { value: 'cdmx', labelEs: 'Ciudad de México', labelEn: 'Mexico City' },
  { value: 'puebla', labelEs: 'Puebla', labelEn: 'Puebla' },
  { value: 'playa_carmen', labelEs: 'Playa del Carmen', labelEn: 'Playa del Carmen' },
  { value: 'los_cabos', labelEs: 'Los Cabos', labelEn: 'Los Cabos' },
  { value: 'veracruz', labelEs: 'Veracruz', labelEn: 'Veracruz' },
  { value: 'otros', labelEs: 'Otros', labelEn: 'Other' },
]

const planes = [
  { value: 'boutique', labelEs: 'Boutique', labelEn: 'Boutique' },
  { value: 'growth', labelEs: 'Growth', labelEn: 'Growth' },
  { value: 'enterprise', labelEs: 'Enterprise', labelEn: 'Enterprise' },
]

const monedas = [
  { value: 'MXN', label: 'MXN' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
]

// ─── Helpers ─────────────────────────────────────────────────
function getTipoIcon(tipo: string) {
  const found = tiposPropiedad.find(t => t.value === tipo)
  return found ? found.icon : Building2
}

function getTipoLabel(tipo: string, locale: string) {
  const found = tiposPropiedad.find(t => t.value === tipo)
  if (!found) return tipo
  return locale === 'es' ? found.labelEs : found.labelEn
}

function getRegionLabel(region: string, locale: string) {
  const found = regiones.find(r => r.value === region)
  if (!found) return region
  return locale === 'es' ? found.labelEs : found.labelEn
}

function getPlanBadge(plan: string) {
  switch (plan) {
    case 'enterprise':
      return 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
    case 'growth':
      return 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
    default:
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
  }
}

// ─── Main Component ──────────────────────────────────────────
export function PropiedadesModule() {
  const { locale, userRole, userPropiedadId } = useAppStore()
  const t = translations[locale].propiedades
  const tc = translations[locale].common

  const [propiedades, setPropiedades] = useState<Propiedad[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRegion, setFilterRegion] = useState('all')
  const [filterTipo, setFilterTipo] = useState('all')

  // Dialog state
  const [showDialog, setShowDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>(emptyForm)
  const [saving, setSaving] = useState(false)

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<Propiedad | null>(null)

  const isEmpresa = userRole === 'empresa' && userPropiedadId

  const fetchPropiedades = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterRegion !== 'all') params.set('region', filterRegion)
      if (filterTipo !== 'all') params.set('tipo', filterTipo)
      const res = await fetch(`/api/propiedades?${params}`)
      const data = await res.json()
      let propsData = Array.isArray(data) ? data : []
      // For empresa, filter to only their propiedad
      if (isEmpresa) {
        propsData = propsData.filter(p => p.id === userPropiedadId)
      }
      setPropiedades(propsData)
    } catch (err) {
      console.error('Error fetching propiedades:', err)
    } finally {
      setLoading(false)
    }
  }, [filterRegion, filterTipo, isEmpresa, userPropiedadId])

  useEffect(() => {
    fetchPropiedades()
  }, [fetchPropiedades])

  // Filter by search on client side
  const filtered = propiedades.filter(p => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      p.nombre.toLowerCase().includes(q) ||
      (p.nombreEn && p.nombreEn.toLowerCase().includes(q)) ||
      p.ubicacion.toLowerCase().includes(q)
    )
  })

  // Stats
  const totalPropiedades = propiedades.length
  const propiedadesActivas = propiedades.filter(p => p.activo).length
  const totalEmpleados = propiedades.reduce((sum, p) => sum + (p.empleadosActivos || 0), 0)

  // ─── Dialog handlers ─────────────────────────────────────
  const openCreate = () => {
    setEditingId(null)
    setFormData(emptyForm)
    setShowDialog(true)
  }

  const openEdit = (prop: Propiedad) => {
    setEditingId(prop.id)
    setFormData({
      nombre: prop.nombre,
      nombreEn: prop.nombreEn || '',
      tipo: prop.tipo,
      ubicacion: prop.ubicacion,
      region: prop.region,
      plan: prop.plan,
      moneda: prop.moneda,
      activo: prop.activo,
    })
    setShowDialog(true)
  }

  const handleSave = async () => {
    if (!formData.nombre.trim()) {
      toast.error(locale === 'es' ? 'El nombre es obligatorio' : 'Name is required')
      return
    }
    if (!formData.ubicacion.trim()) {
      toast.error(locale === 'es' ? 'La ubicación es obligatoria' : 'Location is required')
      return
    }

    setSaving(true)
    try {
      const payload = {
        nombre: formData.nombre.trim(),
        nombreEn: formData.nombreEn.trim() || null,
        tipo: formData.tipo,
        ubicacion: formData.ubicacion.trim(),
        region: formData.region,
        plan: formData.plan,
        moneda: formData.moneda,
        activo: formData.activo,
      }

      if (editingId) {
        const res = await fetch(`/api/propiedades/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (data.error) {
          toast.error(data.error)
        } else {
          toast.success(t.actualizada)
          setShowDialog(false)
          fetchPropiedades()
        }
      } else {
        const res = await fetch('/api/propiedades', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (data.error) {
          toast.error(data.error)
        } else {
          toast.success(t.creada)
          setShowDialog(false)
          fetchPropiedades()
        }
      }
    } catch {
      toast.error(tc.error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/propiedades/${deleteTarget.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
      } else {
        toast.success(t.eliminada)
        setDeleteTarget(null)
        fetchPropiedades()
      }
    } catch {
      toast.error(tc.error)
    }
  }

  // ─── Render ───────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-sm text-muted-foreground">{t.subtitle}</p>
        </div>
        <Button
          className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5 shrink-0"
          onClick={openCreate}
        >
          <Plus className="size-4" />
          {t.agregar}
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <Building2 className="size-5 text-teal-600 mx-auto mb-1" />
            <div className="text-xl font-bold">{totalPropiedades}</div>
            <div className="text-xs text-muted-foreground">{t.totalPropiedades}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <CheckCircle2 className="size-5 text-emerald-600 mx-auto mb-1" />
            <div className="text-xl font-bold">{propiedadesActivas}</div>
            <div className="text-xs text-muted-foreground">{t.activas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <Users className="size-5 text-violet-600 mx-auto mb-1" />
            <div className="text-xl font-bold">{totalEmpleados}</div>
            <div className="text-xs text-muted-foreground">{t.totalEmpleados}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder={t.buscar}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterRegion} onValueChange={setFilterRegion}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t.region} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.todas}</SelectItem>
            {regiones.map(r => (
              <SelectItem key={r.value} value={r.value}>
                {locale === 'es' ? r.labelEs : r.labelEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterTipo} onValueChange={setFilterTipo}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t.tipo} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.todos}</SelectItem>
            {tiposPropiedad.map(tp => (
              <SelectItem key={tp.value} value={tp.value}>
                {locale === 'es' ? tp.labelEs : tp.labelEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Property Cards */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-44 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="size-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">{t.noPropiedades}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(prop => {
            const TipoIcon = getTipoIcon(prop.tipo)
            return (
              <Card
                key={prop.id}
                className="hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Color accent bar at top */}
                <div className={`h-1.5 ${
                  prop.activo
                    ? 'bg-teal-500'
                    : 'bg-gray-400'
                }`} />
                <CardContent className="p-4">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="size-10 shrink-0 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center">
                        <TipoIcon className="size-5 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm truncate">
                          {locale === 'es' ? prop.nombre : (prop.nombreEn || prop.nombre)}
                        </h3>
                        {prop.nombreEn && locale === 'es' && (
                          <p className="text-[11px] text-muted-foreground truncate">{prop.nombreEn}</p>
                        )}
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="size-3" />
                          {prop.ubicacion}
                        </p>
                      </div>
                    </div>
                    {/* Status badge */}
                    <Badge
                      variant="outline"
                      className={`shrink-0 text-[10px] px-1.5 ${
                        prop.activo
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-gray-50 text-gray-500 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}
                    >
                      {prop.activo ? (
                        <CheckCircle2 className="size-3 mr-0.5" />
                      ) : (
                        <XCircle className="size-3 mr-0.5" />
                      )}
                      {prop.activo ? t.activa : t.inactiva}
                    </Badge>
                  </div>

                  {/* Info badges */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <Badge variant="outline" className="text-[10px] px-1.5">
                      {getTipoLabel(prop.tipo, locale)}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] px-1.5">
                      {getRegionLabel(prop.region, locale)}
                    </Badge>
                    <Badge className={`text-[10px] px-1.5 ${getPlanBadge(prop.plan)}`}>
                      {prop.plan.charAt(0).toUpperCase() + prop.plan.slice(1)}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] px-1.5">
                      <CreditCard className="size-3 mr-0.5" />
                      {prop.moneda}
                    </Badge>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="size-3" />
                      {prop.empleadosActivos} {t.empleados}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="size-3" />
                      {prop.totalVentas} {t.ventas}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5 text-xs h-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        openEdit(prop)
                      }}
                    >
                      <Pencil className="size-3" />
                      {tc.editar}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5 text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteTarget(prop)
                      }}
                    >
                      <Trash2 className="size-3" />
                      {tc.eliminar}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="size-5 text-teal-600" />
              {editingId ? t.editar : t.agregar}
            </DialogTitle>
            <DialogDescription>
              {editingId ? t.editarDescripcion : t.agregarDescripcion}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre">{t.nombre} *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={e => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder={t.nombrePlaceholder}
              />
            </div>

            {/* Nombre En */}
            <div className="space-y-2">
              <Label htmlFor="nombreEn">{t.nombreEn}</Label>
              <Input
                id="nombreEn"
                value={formData.nombreEn}
                onChange={e => setFormData(prev => ({ ...prev, nombreEn: e.target.value }))}
                placeholder={t.nombreEnPlaceholder}
              />
            </div>

            {/* Tipo + Region */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.tipo}</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={value => setFormData(prev => ({ ...prev, tipo: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposPropiedad.map(tp => (
                      <SelectItem key={tp.value} value={tp.value}>
                        {locale === 'es' ? tp.labelEs : tp.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t.region}</Label>
                <Select
                  value={formData.region}
                  onValueChange={value => setFormData(prev => ({ ...prev, region: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {regiones.map(r => (
                      <SelectItem key={r.value} value={r.value}>
                        {locale === 'es' ? r.labelEs : r.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Ubicacion */}
            <div className="space-y-2">
              <Label htmlFor="ubicacion">{t.ubicacion} *</Label>
              <Input
                id="ubicacion"
                value={formData.ubicacion}
                onChange={e => setFormData(prev => ({ ...prev, ubicacion: e.target.value }))}
                placeholder={t.ubicacionPlaceholder}
              />
            </div>

            {/* Plan + Moneda */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.plan}</Label>
                <Select
                  value={formData.plan}
                  onValueChange={value => setFormData(prev => ({ ...prev, plan: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {planes.map(p => (
                      <SelectItem key={p.value} value={p.value}>
                        {locale === 'es' ? p.labelEs : p.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t.moneda}</Label>
                <Select
                  value={formData.moneda}
                  onValueChange={value => setFormData(prev => ({ ...prev, moneda: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {monedas.map(m => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Activo checkbox */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="activo"
                checked={formData.activo}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({ ...prev, activo: checked === true }))
                }
              />
              <Label htmlFor="activo" className="cursor-pointer">
                {t.activo}
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={saving}
            >
              {tc.cancelar}
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700 text-white"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : editingId ? (
                tc.actualizar
              ) : (
                tc.crear
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.confirmarEliminar}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.confirmarEliminarMensaje?.replace('{nombre}', deleteTarget?.nombre || '')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc.cancelar}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {tc.eliminar}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
