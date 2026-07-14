'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Hotel,
  UtensilsCrossed,
  Wine,
  Sparkles,
  Coffee,
  MapPin,
  ShieldCheck,
  Mail,
  Phone,
  User,
  Key,
  RotateCcw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import { Switch } from '@/components/ui/switch'
import { useAppStore } from '@/lib/store'
import { translations } from '@/lib/i18n'
import { toast } from 'sonner'

interface Empresa {
  id: string
  nombre: string
  nombreEn: string | null
  tipo: string
  rfc: string | null
  contactoNombre: string | null
  contactoEmail: string | null
  contactoTelefono: string | null
  plan: string
  maxPropiedades: number
  password: string
  activo: boolean
  createdAt: string
  _count?: { propiedades: number }
  propiedades?: Propiedad[]
}

interface Propiedad {
  id: string
  nombre: string
  tipo: string
  region: string
  ubicacion: string
  activo: boolean
  _count?: { empleados: number }
}

const planInfo: Record<string, { label: string; max: number; color: string }> = {
  boutique: { label: 'Boutique', max: 1, color: 'bg-gray-100 text-gray-700' },
  growth: { label: 'Growth', max: 5, color: 'bg-blue-100 text-blue-700' },
  enterprise: { label: 'Enterprise', max: 20, color: 'bg-purple-100 text-purple-700' },
}

const tipoIcons: Record<string, React.ElementType> = {
  grupo_restaurantero: UtensilsCrossed,
  cadena_hotelera: Hotel,
  grupo_spa: Sparkles,
  grupo_cafes: Coffee,
  grupo_bares: Wine,
  otro: Building2,
}

const tipoLabels: Record<string, { es: string; en: string }> = {
  grupo_restaurantero: { es: 'Grupo Restaurantero', en: 'Restaurant Group' },
  cadena_hotelera: { es: 'Cadena Hotelera', en: 'Hotel Chain' },
  grupo_spa: { es: 'Grupo de Spa', en: 'Spa Group' },
  grupo_cafes: { es: 'Grupo de Cafés', en: 'Coffee Shops Group' },
  grupo_bares: { es: 'Grupo de Bares', en: 'Bars Group' },
  otro: { es: 'Otro', en: 'Other' },
}

export function EmpresasGruposModule() {
  const { locale } = useAppStore()
  const t = translations[locale]
  const tt = locale === 'es' ? {
    title: 'Empresas y Grupos',
    subtitle: 'Gestiona grupos empresariales y sus sucursales',
    agregarEmpresa: 'Agregar Empresa',
    editarEmpresa: 'Editar Empresa',
    nombre: 'Nombre',
    nombreEn: 'Nombre (Inglés)',
    tipo: 'Tipo de Grupo',
    rfc: 'RFC',
    contactoNombre: 'Nombre del Contacto',
    contactoEmail: 'Email',
    contactoTelefono: 'Teléfono',
    plan: 'Plan',
    password: 'Contraseña',
    activo: 'Activo',
    sucursales: 'Sucursales',
    agregarSucursal: 'Agregar Sucursal',
    maxPropiedades: 'Máximo de Sucursales',
    propiedadesRegistradas: 'Propiedades Registradas',
    sinEmpresas: 'No hay empresas registradas',
    sinEmpresasDesc: 'Crea tu primera empresa para comenzar',
    verSucursales: 'Ver Sucursales',
    ocultarSucursales: 'Ocultar Sucursales',
    guardar: 'Guardar',
    cancelar: 'Cancelar',
    eliminar: 'Eliminar',
    eliminarEmpresa: 'Eliminar Empresa',
    confirmarEliminar: '¿Estás seguro de eliminar esta empresa? Las sucursales quedarán sin empresa asignada.',
    resetPassword: 'Resetear Contraseña',
    showPassword: 'Mostrar contraseña',
    hidePassword: 'Ocultar contraseña',
    nombrePropiedad: 'Nombre de la Sucursal',
    tipoPropiedad: 'Tipo de Propiedad',
    ubicacion: 'Ubicación',
    region: 'Región',
    limiteAlcanzado: 'Límite alcanzado',
    disponibles: 'disponibles',
    contactInfo: 'Información de Contacto',
    credenciales: 'Credenciales de Acceso',
    sucursalNombre: 'Nombre',
    sucursalTipo: 'Tipo',
    sucursalUbicacion: 'Ubicación',
    sucursalEmpleados: 'Empleados',
    sucursalEstado: 'Estado',
    crear: 'Crear',
    actualizado: 'Empresa actualizada',
    creado: 'Empresa creada',
    eliminado: 'Empresa eliminada',
    sucursalCreada: 'Sucursal agregada',
    error: 'Error',
    passwordReseteado: 'Contraseña reseteada a "empresa123"',
  } : {
    title: 'Companies & Groups',
    subtitle: 'Manage business groups and their branches',
    agregarEmpresa: 'Add Company',
    editarEmpresa: 'Edit Company',
    nombre: 'Name',
    nombreEn: 'Name (English)',
    tipo: 'Group Type',
    rfc: 'Tax ID',
    contactoNombre: 'Contact Name',
    contactoEmail: 'Email',
    contactoTelefono: 'Phone',
    plan: 'Plan',
    password: 'Password',
    activo: 'Active',
    sucursales: 'Branches',
    agregarSucursal: 'Add Branch',
    maxPropiedades: 'Max Branches',
    propiedadesRegistradas: 'Registered Properties',
    sinEmpresas: 'No companies registered',
    sinEmpresasDesc: 'Create your first company to start',
    verSucursales: 'View Branches',
    ocultarSucursales: 'Hide Branches',
    guardar: 'Save',
    cancelar: 'Cancel',
    eliminar: 'Delete',
    eliminarEmpresa: 'Delete Company',
    confirmarEliminar: 'Are you sure you want to delete this company? Branches will remain without a company assigned.',
    resetPassword: 'Reset Password',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    nombrePropiedad: 'Branch Name',
    tipoPropiedad: 'Property Type',
    ubicacion: 'Location',
    region: 'Region',
    limiteAlcanzado: 'Limit reached',
    disponibles: 'available',
    contactInfo: 'Contact Information',
    credenciales: 'Access Credentials',
    sucursalNombre: 'Name',
    sucursalTipo: 'Type',
    sucursalUbicacion: 'Location',
    sucursalEmpleados: 'Employees',
    sucursalEstado: 'Status',
    crear: 'Create',
    actualizado: 'Company updated',
    creado: 'Company created',
    eliminado: 'Company deleted',
    sucursalCreada: 'Branch added',
    error: 'Error',
    passwordReseteado: 'Password reset to "empresa123"',
  }

  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [showFormDialog, setShowFormDialog] = useState(false)
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Empresa | null>(null)
  const [expandedEmpresa, setExpandedEmpresa] = useState<string | null>(null)
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({})
  const [showAddSucursal, setShowAddSucursal] = useState<string | null>(null)

  // Form state
  const [form, setForm] = useState({
    nombre: '',
    nombreEn: '',
    tipo: 'grupo_restaurantero',
    rfc: '',
    contactoNombre: '',
    contactoEmail: '',
    contactoTelefono: '',
    plan: 'boutique',
    password: 'empresa123',
    activo: true,
  })

  // Sucursal form
  const [sucursalForm, setSucursalForm] = useState({
    nombre: '',
    tipo: 'restaurante',
    ubicacion: '',
    region: 'cdmx',
  })

  const fetchEmpresas = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/empresas')
      const data = await res.json()
      if (Array.isArray(data)) {
        setEmpresas(data)
      }
    } catch {
      toast.error(tt.error)
    } finally {
      setLoading(false)
    }
  }, [locale])

  useEffect(() => {
    fetchEmpresas()
  }, [fetchEmpresas])

  const abrirNuevo = () => {
    setEditingEmpresa(null)
    setForm({
      nombre: '',
      nombreEn: '',
      tipo: 'grupo_restaurantero',
      rfc: '',
      contactoNombre: '',
      contactoEmail: '',
      contactoTelefono: '',
      plan: 'boutique',
      password: 'empresa123',
      activo: true,
    })
    setShowFormDialog(true)
  }

  const abrirEditar = (empresa: Empresa) => {
    setEditingEmpresa(empresa)
    setForm({
      nombre: empresa.nombre,
      nombreEn: empresa.nombreEn || '',
      tipo: empresa.tipo,
      rfc: empresa.rfc || '',
      contactoNombre: empresa.contactoNombre || '',
      contactoEmail: empresa.contactoEmail || '',
      contactoTelefono: empresa.contactoTelefono || '',
      plan: empresa.plan,
      password: empresa.password,
      activo: empresa.activo,
    })
    setShowFormDialog(true)
  }

  const guardarEmpresa = async () => {
    if (!form.nombre) {
      toast.error(locale === 'es' ? 'Nombre es requerido' : 'Name is required')
      return
    }

    try {
      const payload = {
        nombre: form.nombre,
        nombreEn: form.nombreEn || null,
        tipo: form.tipo,
        rfc: form.rfc || null,
        contactoNombre: form.contactoNombre || null,
        contactoEmail: form.contactoEmail || null,
        contactoTelefono: form.contactoTelefono || null,
        plan: form.plan,
        password: form.password,
        activo: form.activo,
      }

      let res: Response
      if (editingEmpresa) {
        res = await fetch(`/api/empresas/${editingEmpresa.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/empresas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) throw new Error('Error')

      toast.success(editingEmpresa ? tt.actualizado : tt.creado)
      setShowFormDialog(false)
      fetchEmpresas()
    } catch {
      toast.error(tt.error)
    }
  }

  const eliminarEmpresa = async () => {
    if (!deleteTarget) return
    try {
      await fetch(`/api/empresas/${deleteTarget.id}`, { method: 'DELETE' })
      toast.success(tt.eliminado)
      setDeleteTarget(null)
      fetchEmpresas()
    } catch {
      toast.error(tt.error)
    }
  }

  const resetPassword = async (empresa: Empresa) => {
    try {
      await fetch(`/api/empresas/${empresa.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'empresa123' }),
      })
      toast.success(tt.passwordReseteado)
      fetchEmpresas()
    } catch {
      toast.error(tt.error)
    }
  }

  const agregarSucursal = async (empresaId: string) => {
    if (!sucursalForm.nombre || !sucursalForm.ubicacion) {
      toast.error(locale === 'es' ? 'Nombre y ubicación son requeridos' : 'Name and location are required')
      return
    }

    try {
      const res = await fetch('/api/propiedades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: sucursalForm.nombre,
          tipo: sucursalForm.tipo,
          ubicacion: sucursalForm.ubicacion,
          region: sucursalForm.region,
          plan: 'boutique',
          moneda: 'MXN',
          activo: true,
          empresaId: empresaId,
        }),
      })

      if (!res.ok) throw new Error('Error')

      toast.success(tt.sucursalCreada)
      setShowAddSucursal(null)
      setSucursalForm({ nombre: '', tipo: 'restaurante', ubicacion: '', region: 'cdmx' })
      fetchEmpresas()
    } catch {
      toast.error(tt.error)
    }
  }

  const togglePassword = (id: string) => {
    setShowPasswordMap(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleExpand = (id: string) => {
    setExpandedEmpresa(prev => prev === id ? null : id)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="size-6 text-teal-600" />
            {tt.title}
          </h1>
          <p className="text-sm text-muted-foreground">{tt.subtitle}</p>
        </div>
        <Button
          className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5 shrink-0"
          onClick={abrirNuevo}
        >
          <Plus className="size-4" />
          {tt.agregarEmpresa}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <Building2 className="size-5 text-teal-600 mx-auto mb-1" />
            <div className="text-xl font-bold">{empresas.length}</div>
            <div className="text-xs text-muted-foreground">{locale === 'es' ? 'Empresas' : 'Companies'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <ShieldCheck className="size-5 text-blue-600 mx-auto mb-1" />
            <div className="text-xl font-bold">{empresas.filter(e => e.activo).length}</div>
            <div className="text-xs text-muted-foreground">{locale === 'es' ? 'Activas' : 'Active'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <Hotel className="size-5 text-purple-600 mx-auto mb-1" />
            <div className="text-xl font-bold">{empresas.reduce((sum, e) => sum + (e._count?.propiedades || 0), 0)}</div>
            <div className="text-xs text-muted-foreground">{locale === 'es' ? 'Sucursales' : 'Branches'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <User className="size-5 text-orange-600 mx-auto mb-1" />
            <div className="text-xl font-bold">{empresas.filter(e => e.plan === 'enterprise').length}</div>
            <div className="text-xs text-muted-foreground">Enterprise</div>
          </CardContent>
        </Card>
      </div>

      {/* Empresas List */}
      {empresas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="size-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="font-medium text-muted-foreground">{tt.sinEmpresas}</p>
            <p className="text-sm text-muted-foreground/70 mt-1">{tt.sinEmpresasDesc}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {empresas.map((empresa) => {
            const TipoIcon = tipoIcons[empresa.tipo] || Building2
            const plan = planInfo[empresa.plan] || planInfo.boutique
            const propCount = empresa._count?.propiedades || 0
            const isExpanded = expandedEmpresa === empresa.id
            const showPwd = showPasswordMap[empresa.id]
            const limiteAlcanzado = propCount >= empresa.maxPropiedades

            return (
              <Card key={empresa.id} className={!empresa.activo ? 'opacity-60' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="size-10 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                        <TipoIcon className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-base">{empresa.nombre}</CardTitle>
                          <Badge className={plan.color}>{plan.label}</Badge>
                          {!empresa.activo && (
                            <Badge variant="destructive">{locale === 'es' ? 'Inactiva' : 'Inactive'}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {tipoLabels[empresa.tipo]?.[locale] || empresa.tipo}
                          {empresa.rfc && ` · RFC: ${empresa.rfc}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => abrirEditar(empresa)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(empresa)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Info grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    {/* Contacto */}
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">{tt.contactInfo}</p>
                      {empresa.contactoNombre && (
                        <p className="flex items-center gap-1.5"><User className="size-3 text-muted-foreground" />{empresa.contactoNombre}</p>
                      )}
                      {empresa.contactoEmail && (
                        <p className="flex items-center gap-1.5"><Mail className="size-3 text-muted-foreground" />{empresa.contactoEmail}</p>
                      )}
                      {empresa.contactoTelefono && (
                        <p className="flex items-center gap-1.5"><Phone className="size-3 text-muted-foreground" />{empresa.contactoTelefono}</p>
                      )}
                      {!empresa.contactoNombre && !empresa.contactoEmail && !empresa.contactoTelefono && (
                        <p className="text-xs text-muted-foreground/50">—</p>
                      )}
                    </div>

                    {/* Credenciales */}
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">{tt.credenciales}</p>
                      <div className="flex items-center gap-1.5">
                        <Key className="size-3 text-muted-foreground" />
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {showPwd ? empresa.password : '••••••••'}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6"
                          onClick={() => togglePassword(empresa.id)}
                        >
                          {showPwd ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs px-2"
                        onClick={() => resetPassword(empresa)}
                      >
                        <RotateCcw className="size-3 mr-1" />
                        {tt.resetPassword}
                      </Button>
                    </div>

                    {/* Sucursales count */}
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">{tt.sucursales}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={limiteAlcanzado ? 'destructive' : 'secondary'}>
                          {propCount} / {empresa.maxPropiedades}
                        </Badge>
                        {!limiteAlcanzado && (
                          <span className="text-xs text-muted-foreground">
                            {empresa.maxPropiedades - propCount} {tt.disponibles}
                          </span>
                        )}
                        {limiteAlcanzado && (
                          <span className="text-xs text-destructive">{tt.limiteAlcanzado}</span>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 mt-1"
                        disabled={limiteAlcanzado}
                        onClick={() => {
                          setShowAddSucursal(empresa.id)
                          setSucursalForm({ nombre: '', tipo: 'restaurante', ubicacion: '', region: 'cdmx' })
                        }}
                      >
                        <Plus className="size-3 mr-1" />
                        {tt.agregarSucursal}
                      </Button>
                    </div>
                  </div>

                  {/* Expand sucursales */}
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-between"
                      onClick={() => toggleExpand(empresa.id)}
                    >
                      <span className="text-xs font-medium">
                        {isExpanded ? tt.ocultarSucursales : tt.verSucursales} ({propCount})
                      </span>
                      {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                    </Button>

                    {isExpanded && (
                      <div className="mt-2 space-y-2 border-l-2 border-teal-100 pl-3">
                        {empresa.propiedades && empresa.propiedades.length > 0 ? (
                          empresa.propiedades.map((prop) => (
                            <div key={prop.id} className="flex items-center gap-2 text-sm py-1">
                              <div className="size-6 rounded bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                                <MapPin className="size-3" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="font-medium">{prop.nombre}</span>
                                <span className="text-xs text-muted-foreground ml-2">{prop.ubicacion}</span>
                              </div>
                              <Badge variant={prop.activo ? 'default' : 'secondary'} className="text-[10px]">
                                {prop.activo ? (locale === 'es' ? 'Activa' : 'Active') : (locale === 'es' ? 'Inactiva' : 'Inactive')}
                              </Badge>
                              {prop._count && (
                                <Badge variant="outline" className="text-[10px]">
                                  {prop._count.empleados} {locale === 'es' ? 'emp.' : 'emp.'}
                                </Badge>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground py-2">
                            {locale === 'es' ? 'Sin sucursales registradas' : 'No branches registered'}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Dialog: Crear/Editar Empresa */}
      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="size-5 text-teal-600" />
              {editingEmpresa ? tt.editarEmpresa : tt.agregarEmpresa}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{tt.nombre} *</Label>
                <Input
                  value={form.nombre}
                  onChange={e => setForm(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Grupo Cafe Plaza"
                />
              </div>
              <div className="space-y-1.5">
                <Label>{tt.nombreEn}</Label>
                <Input
                  value={form.nombreEn}
                  onChange={e => setForm(prev => ({ ...prev, nombreEn: e.target.value }))}
                  placeholder="Coffee Plaza Group"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{tt.tipo}</Label>
                <Select value={form.tipo} onValueChange={v => setForm(prev => ({ ...prev, tipo: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(tipoLabels).map(([key, val]) => (
                      <SelectItem key={key} value={key}>{locale === 'es' ? val.es : val.en}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{tt.rfc}</Label>
                <Input
                  value={form.rfc}
                  onChange={e => setForm(prev => ({ ...prev, rfc: e.target.value }))}
                  placeholder="GCP010101AB1"
                />
              </div>
            </div>

            <div className="border-t pt-3">
              <p className="text-sm font-medium mb-2">{tt.contactInfo}</p>
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1.5">
                  <Label>{tt.contactoNombre}</Label>
                  <Input
                    value={form.contactoNombre}
                    onChange={e => setForm(prev => ({ ...prev, contactoNombre: e.target.value }))}
                    placeholder="Juan Pérez"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>{tt.contactoEmail}</Label>
                    <Input
                      type="email"
                      value={form.contactoEmail}
                      onChange={e => setForm(prev => ({ ...prev, contactoEmail: e.target.value }))}
                      placeholder="juan@grupo.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{tt.contactoTelefono}</Label>
                    <Input
                      value={form.contactoTelefono}
                      onChange={e => setForm(prev => ({ ...prev, contactoTelefono: e.target.value }))}
                      placeholder="+52 55 1234 5678"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-3">
              <p className="text-sm font-medium mb-2">{tt.credenciales}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{tt.plan}</Label>
                  <Select value={form.plan} onValueChange={v => setForm(prev => ({ ...prev, plan: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="boutique">Boutique (1 {locale === 'es' ? 'sucursal' : 'branch'})</SelectItem>
                      <SelectItem value="growth">Growth (5 {locale === 'es' ? 'sucursales' : 'branches'})</SelectItem>
                      <SelectItem value="enterprise">Enterprise (20 {locale === 'es' ? 'sucursales' : 'branches'})</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">{tt.maxPropiedades}: {planInfo[form.plan]?.max}</p>
                </div>
                <div className="space-y-1.5">
                  <Label>{tt.password}</Label>
                  <Input
                    value={form.password}
                    onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="empresa123"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Switch
                  checked={form.activo}
                  onCheckedChange={checked => setForm(prev => ({ ...prev, activo: checked }))}
                />
                <Label>{tt.activo}</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFormDialog(false)}>{tt.cancelar}</Button>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={guardarEmpresa}>
              {editingEmpresa ? tt.guardar : tt.crear}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Agregar Sucursal */}
      <Dialog open={!!showAddSucursal} onOpenChange={(open) => !open && setShowAddSucursal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="size-5 text-teal-600" />
              {tt.agregarSucursal}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>{tt.nombrePropiedad} *</Label>
              <Input
                value={sucursalForm.nombre}
                onChange={e => setSucursalForm(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Cafe Plaza Huexotitlan"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{tt.tipoPropiedad}</Label>
                <Select value={sucursalForm.tipo} onValueChange={v => setSucursalForm(prev => ({ ...prev, tipo: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restaurante">Restaurante</SelectItem>
                    <SelectItem value="hotel">Hotel</SelectItem>
                    <SelectItem value="bar">Bar</SelectItem>
                    <SelectItem value="cafe">Café</SelectItem>
                    <SelectItem value="spa">Spa</SelectItem>
                    <SelectItem value="resort">Resort</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{tt.region}</Label>
                <Select value={sucursalForm.region} onValueChange={v => setSucursalForm(prev => ({ ...prev, region: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cdmx">CDMX</SelectItem>
                    <SelectItem value="puebla">Puebla</SelectItem>
                    <SelectItem value="cancun">Cancún</SelectItem>
                    <SelectItem value="playa_carmen">Playa del Carmen</SelectItem>
                    <SelectItem value="los_cabos">Los Cabos</SelectItem>
                    <SelectItem value="veracruz">Veracruz</SelectItem>
                    <SelectItem value="otros">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{tt.ubicacion} *</Label>
              <Input
                value={sucursalForm.ubicacion}
                onChange={e => setSucursalForm(prev => ({ ...prev, ubicacion: e.target.value }))}
                placeholder="Av. Reforma 123, Puebla"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSucursal(null)}>{tt.cancelar}</Button>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => showAddSucursal && agregarSucursal(showAddSucursal)}>
              {tt.agregarSucursal}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tt.eliminarEmpresa}</AlertDialogTitle>
            <AlertDialogDescription>
              {tt.confirmarEliminar}
              {deleteTarget && (
                <span className="block mt-2 font-medium">"{deleteTarget.nombre}"</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tt.cancelar}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={eliminarEmpresa}
            >
              {tt.eliminar}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
