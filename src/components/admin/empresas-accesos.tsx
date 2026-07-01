'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Building2,
  Users,
  Eye,
  EyeOff,
  Key,
  Pencil,
  Plus,
  Search,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronRight,
  Hotel,
  UtensilsCrossed,
  Wine,
  Sparkles,
  Palmtree,
  Coffee,
  Music,
  Waves,
  ShieldCheck,
  Mail,
  Phone,
  User,
  AlertTriangle,
  UserPlus,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
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
  password: string
  contactoNombre: string | null
  contactoEmail: string | null
  contactoTelefono: string | null
  createdAt: string
  updatedAt: string
  empleadosActivos?: number
  capacitacionesActivas?: number
  totalVentas?: number
}

interface Empleado {
  id: string
  empleadoId: string
  password?: string
  nombre: string
  posicion: string
  posicionEn: string | null
  departamento: string
  departamentoEn: string | null
  foto: string | null
  estado: string
  nivelCarrera: number
  propiedadId: string
  propiedad?: { id: string; nombre: string; nombreEn: string | null; region: string }
  _count?: { cursos: number; alertas: number; ventas: number }
}

type AltaBajaTarget =
  | { kind: 'empresa'; prop: Propiedad }
  | { kind: 'empleado'; emp: Empleado }

interface PasswordEditTarget {
  kind: 'empresa' | 'empleado'
  id: string
  nombre: string
  currentPassword: string
}

interface EmpleadoEditTarget {
  emp: Empleado
}

interface EmpleadoCreateTarget {
  propiedadId: string
  propiedadNombre: string
}

// ─── Static data ─────────────────────────────────────────────
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

function getTipoIcon(tipo: string) {
  const found = tiposPropiedad.find(t => t.value === tipo)
  return found ? found.icon : Building2
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

function getEstadoBadge(estado: string, t: ReturnType<typeof getTranslations>) {
  switch (estado) {
    case 'activo':
      return { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', label: t.estadoActivo, Icon: CheckCircle2 }
    case 'onboarding':
      return { color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400', label: t.estadoOnboarding, Icon: Sparkles }
    case 'offboarding':
      return { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', label: t.estadoOffboarding, Icon: AlertTriangle }
    default:
      return { color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400', label: t.estadoInactivo, Icon: XCircle }
  }
}

function getTranslations(locale: 'es' | 'en') {
  return translations[locale].empresasAccesos
}

// ─── Sub-component: Password cell with show/hide & copy ───
function PasswordCell({
  password,
  onChange,
  onReset,
  t,
}: {
  password: string
  onChange?: (newPwd: string) => void
  onReset?: () => void
  t: ReturnType<typeof getTranslations>
}) {
  const [visible, setVisible] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      toast.success(t.copied)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore clipboard errors
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <code className={`font-mono text-xs px-2 py-1 rounded bg-muted ${visible ? '' : 'blur-[6px] select-none'}`}>
        {password}
      </code>
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={() => setVisible(v => !v)}
        title={visible ? t.hidePassword : t.showPassword}
        aria-label={visible ? t.hidePassword : t.showPassword}
      >
        {visible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={handleCopy}
        title={t.copy}
        aria-label={t.copy}
      >
        <Key className="size-3.5" />
      </Button>
      {onChange && (
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => {
            const newPwd = prompt(t.password, password)
            if (newPwd && newPwd.trim()) onChange(newPwd.trim())
          }}
          title={t.editarEmpresa}
          aria-label={t.password}
        >
          <Pencil className="size-3.5" />
        </Button>
      )}
      {onReset && (
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-amber-600 hover:text-amber-700"
          onClick={onReset}
          title={t.resetPassword}
          aria-label={t.resetPassword}
        >
          <RotateCcw className="size-3.5" />
        </Button>
      )}
      {copied && <span className="sr-only">{t.copied}</span>}
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────
export function EmpresasAccesos() {
  const { locale } = useAppStore()
  const t = getTranslations(locale)
  const tc = translations[locale].common

  const [propiedades, setPropiedades] = useState<Propiedad[]>([])
  const [empleadosByProp, setEmpleadosByProp] = useState<Record<string, Empleado[]>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRegion, setFilterRegion] = useState('all')
  const [filterTipo, setFilterTipo] = useState('all')
  const [expandedProp, setExpandedProp] = useState<string | null>(null)
  const [empleadoSearchByProp, setEmpleadoSearchByProp] = useState<Record<string, string>>({})

  // Dialog states
  const [altaBajaTarget, setAltaBajaTarget] = useState<AltaBajaTarget | null>(null)
  const [passwordTarget, setPasswordTarget] = useState<PasswordEditTarget | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [empresaEditTarget, setEmpresaEditTarget] = useState<Propiedad | null>(null)
  const [empleadoEditTarget, setEmpleadoEditTarget] = useState<EmpleadoEditTarget | null>(null)
  const [empleadoCreateTarget, setEmpleadoCreateTarget] = useState<EmpleadoCreateTarget | null>(null)
  const [empresaCreateOpen, setEmpresaCreateOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // Empresa edit form (password + contacto)
  const [empresaForm, setEmpresaForm] = useState({
    password: '',
    contactoNombre: '',
    contactoEmail: '',
    contactoTelefono: '',
  })

  // Empleado edit form
  const [empleadoForm, setEmpleadoForm] = useState({
    empleadoId: '',
    nombre: '',
    posicion: '',
    departamento: '',
    password: '',
  })

  // New empleado form
  const [newEmpleadoForm, setNewEmpleadoForm] = useState({
    empleadoId: '',
    nombre: '',
    posicion: '',
    departamento: '',
    password: '',
  })

  // New empresa form (reuses propiedades logic minimally)
  const [newEmpresaForm, setNewEmpresaForm] = useState({
    nombre: '',
    tipo: 'hotel',
    ubicacion: '',
    region: 'cancun',
    plan: 'boutique',
    moneda: 'MXN',
    password: 'empresa123',
    contactoNombre: '',
    contactoEmail: '',
    contactoTelefono: '',
  })

  const fetchPropiedades = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterRegion !== 'all') params.set('region', filterRegion)
      if (filterTipo !== 'all') params.set('tipo', filterTipo)
      const res = await fetch(`/api/propiedades?${params}`)
      const data = await res.json()
      setPropiedades(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching propiedades:', err)
    } finally {
      setLoading(false)
    }
  }, [filterRegion, filterTipo])

  const fetchEmpleadosForProp = useCallback(async (propiedadId: string) => {
    try {
      const res = await fetch(`/api/empleados?propiedadId=${propiedadId}`)
      const data = await res.json()
      setEmpleadosByProp(prev => ({ ...prev, [propiedadId]: Array.isArray(data) ? data : [] }))
    } catch (err) {
      console.error('Error fetching empleados:', err)
      setEmpleadosByProp(prev => ({ ...prev, [propiedadId]: [] }))
    }
  }, [])

  useEffect(() => {
    fetchPropiedades()
  }, [fetchPropiedades])

  const toggleExpand = (propId: string) => {
    if (expandedProp === propId) {
      setExpandedProp(null)
    } else {
      setExpandedProp(propId)
      if (!empleadosByProp[propId]) {
        fetchEmpleadosForProp(propId)
      }
    }
  }

  // Client-side search filter for propiedades
  const filteredPropiedades = propiedades.filter(p => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      p.nombre.toLowerCase().includes(q) ||
      (p.nombreEn && p.nombreEn.toLowerCase().includes(q)) ||
      p.ubicacion.toLowerCase().includes(q) ||
      (p.contactoNombre || '').toLowerCase().includes(q) ||
      (p.contactoEmail || '').toLowerCase().includes(q)
    )
  })

  // Stats
  const totalPropiedades = propiedades.length
  const propiedadesActivas = propiedades.filter(p => p.activo).length
  const totalEmpleadosList = Object.values(empleadosByProp).flat()
  const totalEmpleados = totalEmpleadosList.length

  // ─── Handlers ─────────────────────────────────────────────
  const handleToggleActivoPropiedad = async (prop: Propiedad) => {
    const newActivo = !prop.activo
    try {
      const res = await fetch(`/api/propiedades/${prop.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: newActivo }),
      })
      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      toast.success(newActivo ? t.successAltaEmpresa : t.successBajaEmpresa)
      setAltaBajaTarget(null)
      fetchPropiedades()
    } catch {
      toast.error(tc.error)
    }
  }

  const handleToggleEstadoEmpleado = async (emp: Empleado) => {
    const newEstado = emp.estado === 'inactivo' ? 'activo' : 'inactivo'
    try {
      const res = await fetch(`/api/empleados/${emp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: newEstado }),
      })
      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      toast.success(newEstado === 'activo' ? t.successAltaEmpleado : t.successBajaEmpleado)
      setAltaBajaTarget(null)
      // Refresh list for this propiedad
      fetchEmpleadosForProp(emp.propiedadId)
    } catch {
      toast.error(tc.error)
    }
  }

  const handleResetPasswordEmpresa = async (prop: Propiedad) => {
    try {
      const res = await fetch(`/api/propiedades/${prop.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'empresa123' }),
      })
      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      toast.success(t.resetPasswordEmpresa)
      fetchPropiedades()
    } catch {
      toast.error(tc.error)
    }
  }

  const handleResetPasswordEmpleado = async (emp: Empleado) => {
    try {
      const res = await fetch(`/api/empleados/${emp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: '1234' }),
      })
      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      toast.success(t.resetPasswordEmpleado)
      fetchEmpleadosForProp(emp.propiedadId)
    } catch {
      toast.error(tc.error)
    }
  }

  const handleSavePassword = async () => {
    if (!passwordTarget) return
    if (!newPassword.trim()) {
      toast.error(tc.error)
      return
    }
    setSaving(true)
    try {
      const url = passwordTarget.kind === 'empresa'
        ? `/api/propiedades/${passwordTarget.id}`
        : `/api/empleados/${passwordTarget.id}`
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword.trim() }),
      })
      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
      } else {
        toast.success(t.successPasswordChanged)
        setPasswordTarget(null)
        setNewPassword('')
        if (passwordTarget.kind === 'empresa') {
          fetchPropiedades()
        } else {
          // Need to know propiedadId to refresh; for empleado, refresh all expanded prop
          if (expandedProp) fetchEmpleadosForProp(expandedProp)
        }
      }
    } catch {
      toast.error(tc.error)
    } finally {
      setSaving(false)
    }
  }

  const openEmpresaEdit = (prop: Propiedad) => {
    setEmpresaEditTarget(prop)
    setEmpresaForm({
      password: prop.password || '',
      contactoNombre: prop.contactoNombre || '',
      contactoEmail: prop.contactoEmail || '',
      contactoTelefono: prop.contactoTelefono || '',
    })
  }

  const handleSaveEmpresa = async () => {
    if (!empresaEditTarget) return
    setSaving(true)
    try {
      const res = await fetch(`/api/propiedades/${empresaEditTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: empresaForm.password || undefined,
          contactoNombre: empresaForm.contactoNombre || null,
          contactoEmail: empresaForm.contactoEmail || null,
          contactoTelefono: empresaForm.contactoTelefono || null,
        }),
      })
      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
      } else {
        toast.success(t.successContactoSaved)
        setEmpresaEditTarget(null)
        fetchPropiedades()
      }
    } catch {
      toast.error(tc.error)
    } finally {
      setSaving(false)
    }
  }

  const openEmpleadoEdit = (emp: Empleado) => {
    setEmpleadoEditTarget({ emp })
    setEmpleadoForm({
      empleadoId: emp.empleadoId,
      nombre: emp.nombre,
      posicion: emp.posicion,
      departamento: emp.departamento,
      password: emp.password || '',
    })
  }

  const handleSaveEmpleado = async () => {
    if (!empleadoEditTarget) return
    if (!empleadoForm.empleadoId.trim() || !empleadoForm.nombre.trim()) {
      toast.error(tc.error)
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/empleados/${empleadoEditTarget.emp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empleadoId: empleadoForm.empleadoId.trim(),
          nombre: empleadoForm.nombre.trim(),
          posicion: empleadoForm.posicion.trim(),
          departamento: empleadoForm.departamento.trim(),
          password: empleadoForm.password || undefined,
        }),
      })
      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
      } else {
        toast.success(t.successEmpleadoSaved)
        setEmpleadoEditTarget(null)
        fetchEmpleadosForProp(empleadoEditTarget.emp.propiedadId)
      }
    } catch {
      toast.error(tc.error)
    } finally {
      setSaving(false)
    }
  }

  const handleCreateEmpleado = async () => {
    if (!empleadoCreateTarget) return
    if (!newEmpleadoForm.empleadoId.trim() || !newEmpleadoForm.nombre.trim()) {
      toast.error(tc.error)
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/empleados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empleadoId: newEmpleadoForm.empleadoId.trim(),
          nombre: newEmpleadoForm.nombre.trim(),
          posicion: newEmpleadoForm.posicion.trim() || 'Empleado',
          departamento: newEmpleadoForm.departamento.trim() || 'A&B',
          password: newEmpleadoForm.password || '1234',
          propiedadId: empleadoCreateTarget.propiedadId,
          estado: 'onboarding',
          fechaIngreso: new Date().toISOString(),
        }),
      })
      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
      } else {
        toast.success(t.successEmpleadoSaved)
        setEmpleadoCreateTarget(null)
        setNewEmpleadoForm({ empleadoId: '', nombre: '', posicion: '', departamento: '', password: '' })
        fetchEmpleadosForProp(empleadoCreateTarget.propiedadId)
      }
    } catch {
      toast.error(tc.error)
    } finally {
      setSaving(false)
    }
  }

  const handleCreateEmpresa = async () => {
    if (!newEmpresaForm.nombre.trim() || !newEmpresaForm.ubicacion.trim()) {
      toast.error(tc.error)
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/propiedades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: newEmpresaForm.nombre.trim(),
          tipo: newEmpresaForm.tipo,
          ubicacion: newEmpresaForm.ubicacion.trim(),
          region: newEmpresaForm.region,
          plan: newEmpresaForm.plan,
          moneda: newEmpresaForm.moneda,
          activo: true,
          password: newEmpresaForm.password || 'empresa123',
          contactoNombre: newEmpresaForm.contactoNombre || null,
          contactoEmail: newEmpresaForm.contactoEmail || null,
          contactoTelefono: newEmpresaForm.contactoTelefono || null,
        }),
      })
      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
      } else {
        toast.success(locale === 'es' ? 'Propiedad creada' : 'Property created')
        setEmpresaCreateOpen(false)
        setNewEmpresaForm({
          nombre: '', tipo: 'hotel', ubicacion: '', region: 'cancun',
          plan: 'boutique', moneda: 'MXN', password: 'empresa123',
          contactoNombre: '', contactoEmail: '', contactoTelefono: '',
        })
        fetchPropiedades()
      }
    } catch {
      toast.error(tc.error)
    } finally {
      setSaving(false)
    }
  }

  // ─── Render ───────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="size-6 text-teal-600" />
            {t.title}
          </h1>
          <p className="text-sm text-muted-foreground">{t.subtitle}</p>
        </div>
        <Button
          className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5 shrink-0"
          onClick={() => setEmpresaCreateOpen(true)}
        >
          <Plus className="size-4" />
          {t.agregarEmpresa}
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <Building2 className="size-5 text-teal-600 mx-auto mb-1" />
            <div className="text-xl font-bold">{totalPropiedades}</div>
            <div className="text-xs text-muted-foreground">{t.sectionEmpresas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <CheckCircle2 className="size-5 text-emerald-600 mx-auto mb-1" />
            <div className="text-xl font-bold">{propiedadesActivas}</div>
            <div className="text-xs text-muted-foreground">{t.estadoActivo}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <Users className="size-5 text-violet-600 mx-auto mb-1" />
            <div className="text-xl font-bold">{totalEmpleados}</div>
            <div className="text-xs text-muted-foreground">{t.sectionEmpleados}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder={t.searchEmpleados}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterRegion} onValueChange={setFilterRegion}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t.filterPropiedades} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.filterAll}</SelectItem>
            {regiones.map(r => (
              <SelectItem key={r.value} value={r.value}>
                {locale === 'es' ? r.labelEs : r.labelEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterTipo} onValueChange={setFilterTipo}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t.filterPropiedades} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.filterAll}</SelectItem>
            {tiposPropiedad.map(tp => (
              <SelectItem key={tp.value} value={tp.value}>
                {locale === 'es' ? tp.labelEs : tp.labelEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Empresas List (accordion) */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-16 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPropiedades.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="size-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">{t.noPropiedades}</p>
        </div>
      ) : (
        <Accordion
          type="single"
          collapsible
          value={expandedProp || ''}
          onValueChange={(v) => v ? toggleExpand(v) : setExpandedProp(null)}
          className="space-y-3"
        >
          {filteredPropiedades.map(prop => {
            const TipoIcon = getTipoIcon(prop.tipo)
            const isExpanded = expandedProp === prop.id
            const empleados = empleadosByProp[prop.id] || []
            const empSearch = empleadoSearchByProp[prop.id] || ''
            const filteredEmpleados = empSearch
              ? empleados.filter(e => {
                  const q = empSearch.toLowerCase()
                  return e.nombre.toLowerCase().includes(q) || e.empleadoId.toLowerCase().includes(q)
                })
              : empleados
            return (
              <Card key={prop.id} className={`overflow-hidden transition-shadow ${prop.activo ? '' : 'opacity-75'}`}>
                <div className={`h-1.5 ${prop.activo ? 'bg-teal-500' : 'bg-gray-400'}`} />
                <AccordionItem value={prop.id} className="border-0">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 [&[data-state=open]>div>div.chevron]:rotate-90">
                    <div className="flex items-center gap-3 w-full text-left">
                      <div className="size-10 shrink-0 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center">
                        <TipoIcon className="size-5 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm truncate">
                            {locale === 'es' ? prop.nombre : (prop.nombreEn || prop.nombre)}
                          </h3>
                          <Badge variant="outline" className="text-[10px] px-1.5">
                            {getRegionLabel(prop.region, locale)}
                          </Badge>
                          <Badge className={`text-[10px] px-1.5 ${getPlanBadge(prop.plan)}`}>
                            {prop.plan.charAt(0).toUpperCase() + prop.plan.slice(1)}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 ${
                              prop.activo
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : 'bg-gray-50 text-gray-500 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}
                          >
                            {prop.activo ? <CheckCircle2 className="size-3 mr-0.5" /> : <XCircle className="size-3 mr-0.5" />}
                            {prop.activo ? t.estadoActivo : t.estadoInactivo}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="size-3" />
                            {prop.empleadosActivos ?? 0} {t.empleadosCount}
                          </span>
                          {prop.contactoNombre && (
                            <span className="hidden sm:flex items-center gap-1 truncate">
                              <User className="size-3" />
                              {prop.contactoNombre}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="chevron transition-transform">
                        <ChevronRight className="size-4 text-muted-foreground" />
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-0">
                    {/* Credenciales + Contacto block */}
                    <div className="grid gap-3 md:grid-cols-2 mb-4">
                      {/* Credenciales */}
                      <div className="rounded-lg border bg-muted/30 p-3">
                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
                          <Key className="size-3.5" />
                          {t.credenciales}
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-muted-foreground">{t.password}</span>
                            <PasswordCell
                              password={prop.password}
                              t={t}
                              onReset={() => handleResetPasswordEmpresa(prop)}
                            />
                          </div>
                          <div className="text-[11px] text-muted-foreground">{t.passwordEmpresaDefault}</div>
                        </div>
                      </div>

                      {/* Contacto */}
                      <div className="rounded-lg border bg-muted/30 p-3">
                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
                          <User className="size-3.5" />
                          {t.contacto}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 ml-auto"
                            onClick={() => openEmpresaEdit(prop)}
                            aria-label={t.editarEmpresa}
                            title={t.editarEmpresa}
                          >
                            <Pencil className="size-3" />
                          </Button>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <User className="size-3 text-muted-foreground" />
                            <span className="truncate">{prop.contactoNombre || '—'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="size-3 text-muted-foreground" />
                            <span className="truncate">{prop.contactoEmail || '—'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="size-3 text-muted-foreground" />
                            <span>{prop.contactoTelefono || '—'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Alta/Baja + Edit empresa buttons */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Switch
                        checked={prop.activo}
                        onCheckedChange={(checked) => {
                          setAltaBajaTarget({ kind: 'empresa', prop: { ...prop, activo: checked } })
                        }}
                        aria-label={prop.activo ? t.baja : t.alta}
                      />
                      <span className="text-xs text-muted-foreground self-center">
                        {prop.activo ? t.estadoActivo : t.estadoInactivo}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto gap-1.5 text-xs h-8"
                        onClick={() => openEmpresaEdit(prop)}
                      >
                        <Pencil className="size-3" />
                        {t.editarEmpresa}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs h-8"
                        onClick={() => setEmpleadoCreateTarget({
                          propiedadId: prop.id,
                          propiedadNombre: prop.nombre,
                        })}
                      >
                        <Plus className="size-3" />
                        {t.agregarEmpleado}
                      </Button>
                    </div>

                    {/* Empleados section */}
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold flex items-center gap-1.5">
                          <Users className="size-4 text-teal-600" />
                          {t.sectionEmpleados}
                          <Badge variant="outline" className="text-[10px] px-1.5">
                            {empleados.length}
                          </Badge>
                        </h4>
                        <div className="relative w-full max-w-xs">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                          <Input
                            placeholder={t.searchEmpleados}
                            value={empSearch}
                            onChange={e => setEmpleadoSearchByProp(prev => ({ ...prev, [prop.id]: e.target.value }))}
                            className="h-8 pl-8 text-xs"
                          />
                        </div>
                      </div>

                      {isExpanded && !empleadosByProp[prop.id] ? (
                        <div className="py-4 text-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-600 mx-auto" />
                        </div>
                      ) : filteredEmpleados.length === 0 ? (
                        <div className="py-4 text-center text-xs text-muted-foreground">{t.noEmpleados}</div>
                      ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-1
                                        [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full
                                        [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30
                                        [&::-webkit-scrollbar-track]:bg-transparent">
                          {filteredEmpleados.map(emp => {
                            const badge = getEstadoBadge(emp.estado, t)
                            const EstadoIcon = badge.Icon
                            return (
                              <div
                                key={emp.id}
                                className="rounded-lg border bg-background p-3 hover:shadow-sm transition-shadow"
                              >
                                <div className="flex items-start gap-3">
                                  {/* Avatar */}
                                  <div className="size-9 shrink-0 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-xs font-bold text-teal-700 dark:text-teal-300">
                                    {emp.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-medium text-sm truncate">{emp.nombre}</span>
                                      <Badge className={`text-[10px] px-1.5 ${badge.color}`}>
                                        <EstadoIcon className="size-3 mr-0.5" />
                                        {badge.label}
                                      </Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                                      <span className="flex items-center gap-1">
                                        <Badge variant="outline" className="text-[10px] px-1.5 font-mono">
                                          {emp.empleadoId}
                                        </Badge>
                                      </span>
                                      <span>{emp.posicion}</span>
                                      <span className="text-muted-foreground/70">·</span>
                                      <span>{emp.departamento}</span>
                                    </div>

                                    {/* Credentials row */}
                                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[11px] text-muted-foreground">{t.password}:</span>
                                        <PasswordCell
                                          password={emp.password || '1234'}
                                          t={t}
                                          onReset={() => handleResetPasswordEmpleado(emp)}
                                        />
                                      </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                      <Switch
                                        checked={emp.estado !== 'inactivo'}
                                        onCheckedChange={() => {
                                          setAltaBajaTarget({ kind: 'empleado', emp })
                                        }}
                                        aria-label={emp.estado === 'inactivo' ? t.alta : t.baja}
                                      />
                                      <span className="text-[11px] text-muted-foreground">
                                        {emp.estado === 'inactivo' ? t.alta : t.baja}
                                      </span>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="ml-auto gap-1.5 text-xs h-7"
                                        onClick={() => openEmpleadoEdit(emp)}
                                      >
                                        <Pencil className="size-3" />
                                        {t.editarEmpleado}
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-1.5 text-xs h-7 text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200"
                                        onClick={() => handleResetPasswordEmpleado(emp)}
                                      >
                                        <RotateCcw className="size-3" />
                                        {t.resetPassword}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Card>
            )
          })}
        </Accordion>
      )}

      {/* Alta/Baja confirmation dialog */}
      <AlertDialog open={!!altaBajaTarget} onOpenChange={(open) => { if (!open) setAltaBajaTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.confirmBaja}</AlertDialogTitle>
            <AlertDialogDescription>
              {altaBajaTarget?.kind === 'empresa'
                ? (altaBajaTarget.prop.activo
                    ? t.confirmBajaEmpresa
                    : t.confirmAltaEmpresa
                  ).replace('{nombre}', altaBajaTarget.prop.nombre)
                : altaBajaTarget?.kind === 'empleado'
                  ? (altaBajaTarget.emp.estado === 'inactivo'
                      ? t.confirmAltaEmpleado
                      : t.confirmBajaEmpleado
                    ).replace('{nombre}', altaBajaTarget.emp.nombre)
                  : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc.cancelar}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (altaBajaTarget?.kind === 'empresa') handleToggleActivoPropiedad(altaBajaTarget.prop)
                else if (altaBajaTarget?.kind === 'empleado') handleToggleEstadoEmpleado(altaBajaTarget.emp)
              }}
              className="bg-teal-600 text-white hover:bg-teal-700"
            >
              {tc.confirmar || tc.guardar}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit password dialog */}
      <Dialog open={!!passwordTarget} onOpenChange={(open) => { if (!open) { setPasswordTarget(null); setNewPassword('') } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="size-5 text-teal-600" />
              {t.password}
            </DialogTitle>
            <DialogDescription>
              {passwordTarget?.nombre}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="new-password">{t.password}</Label>
            <Input
              id="new-password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder={t.password}
              autoFocus
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setPasswordTarget(null); setNewPassword('') }} disabled={saving}>
              {tc.cancelar}
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={handleSavePassword} disabled={saving}>
              {saving ? <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : tc.guardar}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit empresa (password + contacto) dialog */}
      <Dialog open={!!empresaEditTarget} onOpenChange={(open) => { if (!open) setEmpresaEditTarget(null) }}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="size-5 text-teal-600" />
              {t.editarEmpresa}
            </DialogTitle>
            <DialogDescription>{empresaEditTarget?.nombre}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="emp-password">{t.password}</Label>
              <Input
                id="emp-password"
                value={empresaForm.password}
                onChange={e => setEmpresaForm(prev => ({ ...prev, password: e.target.value }))}
              />
              <p className="text-[11px] text-muted-foreground">{t.passwordEmpresaDefault}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="emp-contacto-nombre">{t.contactoNombre}</Label>
              <Input
                id="emp-contacto-nombre"
                value={empresaForm.contactoNombre}
                onChange={e => setEmpresaForm(prev => ({ ...prev, contactoNombre: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emp-contacto-email">{t.contactoEmail}</Label>
              <Input
                id="emp-contacto-email"
                type="email"
                value={empresaForm.contactoEmail}
                onChange={e => setEmpresaForm(prev => ({ ...prev, contactoEmail: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emp-contacto-tel">{t.contactoTelefono}</Label>
              <Input
                id="emp-contacto-tel"
                value={empresaForm.contactoTelefono}
                onChange={e => setEmpresaForm(prev => ({ ...prev, contactoTelefono: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEmpresaEditTarget(null)} disabled={saving}>
              {tc.cancelar}
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={handleSaveEmpresa} disabled={saving}>
              {saving ? <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : tc.guardar}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit empleado dialog */}
      <Dialog open={!!empleadoEditTarget} onOpenChange={(open) => { if (!open) setEmpleadoEditTarget(null) }}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="size-5 text-teal-600" />
              {t.editarEmpleado}
            </DialogTitle>
            <DialogDescription>{empleadoEditTarget?.emp.nombre}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="emp-id">{t.empleadoId}</Label>
              <Input
                id="emp-id"
                value={empleadoForm.empleadoId}
                onChange={e => setEmpleadoForm(prev => ({ ...prev, empleadoId: e.target.value }))}
                placeholder="MES-401"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emp-nombre">{locale === 'es' ? 'Nombre' : 'Name'}</Label>
              <Input
                id="emp-nombre"
                value={empleadoForm.nombre}
                onChange={e => setEmpleadoForm(prev => ({ ...prev, nombre: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="emp-posicion">{t.posicion}</Label>
                <Input
                  id="emp-posicion"
                  value={empleadoForm.posicion}
                  onChange={e => setEmpleadoForm(prev => ({ ...prev, posicion: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emp-depto">{t.departamento}</Label>
                <Input
                  id="emp-depto"
                  value={empleadoForm.departamento}
                  onChange={e => setEmpleadoForm(prev => ({ ...prev, departamento: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="emp-pwd">{t.password}</Label>
              <Input
                id="emp-pwd"
                value={empleadoForm.password}
                onChange={e => setEmpleadoForm(prev => ({ ...prev, password: e.target.value }))}
              />
              <p className="text-[11px] text-muted-foreground">{t.passwordEmpleadoDefault}</p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEmpleadoEditTarget(null)} disabled={saving}>
              {tc.cancelar}
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={handleSaveEmpleado} disabled={saving}>
              {saving ? <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : tc.guardar}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create empleado dialog */}
      <Dialog open={!!empleadoCreateTarget} onOpenChange={(open) => { if (!open) setEmpleadoCreateTarget(null) }}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="size-5 text-teal-600" />
              {t.agregarEmpleado}
            </DialogTitle>
            <DialogDescription>{empleadoCreateTarget?.propiedadNombre}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="new-emp-id">{t.empleadoId} *</Label>
              <Input
                id="new-emp-id"
                value={newEmpleadoForm.empleadoId}
                onChange={e => setNewEmpleadoForm(prev => ({ ...prev, empleadoId: e.target.value }))}
                placeholder="MES-XXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-emp-nombre">{locale === 'es' ? 'Nombre' : 'Name'} *</Label>
              <Input
                id="new-emp-nombre"
                value={newEmpleadoForm.nombre}
                onChange={e => setNewEmpleadoForm(prev => ({ ...prev, nombre: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="new-emp-posicion">{t.posicion}</Label>
                <Input
                  id="new-emp-posicion"
                  value={newEmpleadoForm.posicion}
                  onChange={e => setNewEmpleadoForm(prev => ({ ...prev, posicion: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-emp-depto">{t.departamento}</Label>
                <Input
                  id="new-emp-depto"
                  value={newEmpleadoForm.departamento}
                  onChange={e => setNewEmpleadoForm(prev => ({ ...prev, departamento: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-emp-pwd">{t.password}</Label>
              <Input
                id="new-emp-pwd"
                value={newEmpleadoForm.password}
                onChange={e => setNewEmpleadoForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="1234"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEmpleadoCreateTarget(null)} disabled={saving}>
              {tc.cancelar}
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={handleCreateEmpleado} disabled={saving}>
              {saving ? <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : tc.crear}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create empresa dialog */}
      <Dialog open={empresaCreateOpen} onOpenChange={setEmpresaCreateOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="size-5 text-teal-600" />
              {t.agregarEmpresa}
            </DialogTitle>
            <DialogDescription>{t.subtitle}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="new-emp-nombre">{locale === 'es' ? 'Nombre' : 'Name'} *</Label>
              <Input
                id="new-emp-nombre"
                value={newEmpresaForm.nombre}
                onChange={e => setNewEmpresaForm(prev => ({ ...prev, nombre: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{locale === 'es' ? 'Tipo' : 'Type'}</Label>
                <Select
                  value={newEmpresaForm.tipo}
                  onValueChange={v => setNewEmpresaForm(prev => ({ ...prev, tipo: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                <Label>{locale === 'es' ? 'Región' : 'Region'}</Label>
                <Select
                  value={newEmpresaForm.region}
                  onValueChange={v => setNewEmpresaForm(prev => ({ ...prev, region: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
            <div className="space-y-2">
              <Label htmlFor="new-emp-ubi">{locale === 'es' ? 'Ubicación' : 'Location'} *</Label>
              <Input
                id="new-emp-ubi"
                value={newEmpresaForm.ubicacion}
                onChange={e => setNewEmpresaForm(prev => ({ ...prev, ubicacion: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{locale === 'es' ? 'Plan' : 'Plan'}</Label>
                <Select
                  value={newEmpresaForm.plan}
                  onValueChange={v => setNewEmpresaForm(prev => ({ ...prev, plan: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boutique">Boutique</SelectItem>
                    <SelectItem value="growth">Growth</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{locale === 'es' ? 'Moneda' : 'Currency'}</Label>
                <Select
                  value={newEmpresaForm.moneda}
                  onValueChange={v => setNewEmpresaForm(prev => ({ ...prev, moneda: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MXN">MXN</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-emp-pwd">{t.password}</Label>
              <Input
                id="new-emp-pwd"
                value={newEmpresaForm.password}
                onChange={e => setNewEmpresaForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="empresa123"
              />
              <p className="text-[11px] text-muted-foreground">{t.passwordEmpresaDefault}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="new-emp-cn">{t.contactoNombre}</Label>
                <Input
                  id="new-emp-cn"
                  value={newEmpresaForm.contactoNombre}
                  onChange={e => setNewEmpresaForm(prev => ({ ...prev, contactoNombre: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-emp-ce">{t.contactoEmail}</Label>
                <Input
                  id="new-emp-ce"
                  type="email"
                  value={newEmpresaForm.contactoEmail}
                  onChange={e => setNewEmpresaForm(prev => ({ ...prev, contactoEmail: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-emp-ct">{t.contactoTelefono}</Label>
                <Input
                  id="new-emp-ct"
                  value={newEmpresaForm.contactoTelefono}
                  onChange={e => setNewEmpresaForm(prev => ({ ...prev, contactoTelefono: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEmpresaCreateOpen(false)} disabled={saving}>
              {tc.cancelar}
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={handleCreateEmpresa} disabled={saving}>
              {saving ? <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : tc.crear}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
