'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Package, Plus, Search, Star, MapPin,
  Phone, Mail, Globe, Edit, ChevronRight,
  Truck, ShoppingBag, X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

interface Producto {
  id: string
  nombre: string
  nombreEn: string | null
  descripcion: string | null
  categoria: string
  unidad: string | null
  precio: number
  precioMayoreo: number | null
  cantidadMinima: number
  disponible: boolean
}

interface Proveedor {
  id: string
  nombre: string
  nombreEn: string | null
  tipo: string
  rfc: string | null
  contactoNombre: string | null
  contactoEmail: string | null
  contactoTelefono: string | null
  direccion: string | null
  region: string | null
  ciudad: string | null
  paginaWeb: string | null
  logo: string | null
  activo: boolean
  calificacion: number
  notas: string | null
  productos: Producto[]
}

const TIPOS = [
  { value: 'alimentos', label: 'Alimentos y Bebidas' },
  { value: 'capacitacion', label: 'Capacitación' },
  { value: 'limpieza', label: 'Limpieza y Mantenimiento' },
  { value: 'tecnologia', label: 'Tecnología' },
  { value: 'mobiliario', label: 'Mobiliario y Equipo' },
  { value: 'marketing', label: 'Marketing y Diseño' },
  { value: 'otro', label: 'Otro' },
]

const CATEGORIAS_PRODUCTO = [
  { value: 'materia_prima', label: 'Materia Prima' },
  { value: 'bebida', label: 'Bebidas' },
  { value: 'postre', label: 'Postres' },
  { value: 'capacitacion', label: 'Capacitación' },
  { value: 'equipo', label: 'Equipo' },
  { value: 'limpieza', label: 'Limpieza' },
  { value: 'otro', label: 'Otro' },
]

function getTipoColor(tipo: string): string {
  switch (tipo) {
    case 'alimentos': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    case 'capacitacion': return 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
    case 'limpieza': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'tecnologia': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export function ProveedoresModule() {
  const { locale } = useAppStore()
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterTipo, setFilterTipo] = useState('todos')
  const [selectedProveedor, setSelectedProveedor] = useState<Proveedor | null>(null)
  const [showFormProveedor, setShowFormProveedor] = useState(false)
  const [showFormProducto, setShowFormProducto] = useState(false)
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null)

  const [formProveedor, setFormProveedor] = useState({
    nombre: '', nombreEn: '', tipo: 'alimentos',
    rfc: '', contactoNombre: '', contactoEmail: '',
    contactoTelefono: '', direccion: '', region: '',
    ciudad: '', paginaWeb: '', notas: '',
  })

  const [formProducto, setFormProducto] = useState({
    nombre: '', nombreEn: '', descripcion: '',
    categoria: 'materia_prima', unidad: '',
    precio: '', precioMayoreo: '', cantidadMinima: '1',
  })

  const fetchProveedores = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterTipo !== 'todos') params.set('tipo', filterTipo)
      const res = await fetch(`/api/proveedores?${params}`)
      const data = await res.json()
      setProveedores(Array.isArray(data) ? data : [])
    } catch {
      setProveedores([])
    } finally {
      setLoading(false)
    }
  }, [filterTipo])

  useEffect(() => { fetchProveedores() }, [fetchProveedores])

  const handleGuardarProveedor = async () => {
    if (!formProveedor.nombre || !formProveedor.tipo) {
      toast.error('Nombre y tipo son requeridos')
      return
    }
    try {
      const method = editingProveedor ? 'PATCH' : 'POST'
      const body = editingProveedor
        ? { id: editingProveedor.id, ...formProveedor }
        : formProveedor
      const res = await fetch('/api/proveedores', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast.success(editingProveedor ? 'Proveedor actualizado' : 'Proveedor creado exitosamente')
        setShowFormProveedor(false)
        setEditingProveedor(null)
        setFormProveedor({
          nombre: '', nombreEn: '', tipo: 'alimentos',
          rfc: '', contactoNombre: '', contactoEmail: '',
          contactoTelefono: '', direccion: '', region: '',
          ciudad: '', paginaWeb: '', notas: '',
        })
        fetchProveedores()
      }
    } catch {
      toast.error('Error al guardar proveedor')
    }
  }

  const handleGuardarProducto = async () => {
    if (!selectedProveedor || !formProducto.nombre || !formProducto.precio) {
      toast.error('Nombre y precio son requeridos')
      return
    }
    try {
      const res = await fetch('/api/proveedores/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proveedorId: selectedProveedor.id,
          ...formProducto,
          precio: parseFloat(formProducto.precio),
          precioMayoreo: formProducto.precioMayoreo ? parseFloat(formProducto.precioMayoreo) : null,
          cantidadMinima: parseInt(formProducto.cantidadMinima),
        }),
      })
      if (res.ok) {
        toast.success('Producto agregado exitosamente')
        setShowFormProducto(false)
        setFormProducto({
          nombre: '', nombreEn: '', descripcion: '',
          categoria: 'materia_prima', unidad: '',
          precio: '', precioMayoreo: '', cantidadMinima: '1',
        })
        fetchProveedores()
      }
    } catch {
      toast.error('Error al guardar producto')
    }
  }

  const handleEditarProveedor = (p: Proveedor) => {
    setEditingProveedor(p)
    setFormProveedor({
      nombre: p.nombre, nombreEn: p.nombreEn || '',
      tipo: p.tipo, rfc: p.rfc || '',
      contactoNombre: p.contactoNombre || '',
      contactoEmail: p.contactoEmail || '',
      contactoTelefono: p.contactoTelefono || '',
      direccion: p.direccion || '', region: p.region || '',
      ciudad: p.ciudad || '', paginaWeb: p.paginaWeb || '',
      notas: p.notas || '',
    })
    setShowFormProveedor(true)
  }

  const filtered = proveedores.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (p.ciudad && p.ciudad.toLowerCase().includes(search.toLowerCase()))
  )

  if (selectedProveedor) {
    const prov = proveedores.find(p => p.id === selectedProveedor.id) || selectedProveedor
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="gap-1.5" onClick={() => setSelectedProveedor(null)}>
            <X className="size-4" />
            {locale === 'es' ? 'Volver' : 'Back'}
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{prov.nombre}</h1>
            <p className="text-sm text-muted-foreground">{prov.ciudad} · {prov.region}</p>
          </div>
          <Button
            className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
            onClick={() => { setShowFormProducto(true) }}
          >
            <Plus className="size-4" />
            {locale === 'es' ? 'Agregar Producto' : 'Add Product'}
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => handleEditarProveedor(prov)}>
            <Edit className="size-4" />
            {locale === 'es' ? 'Editar' : 'Edit'}
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="size-14">
                  <AvatarFallback className="bg-teal-100 text-teal-700 text-lg font-bold">
                    {getInitials(prov.nombre)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Badge className={getTipoColor(prov.tipo)}>
                    {TIPOS.find(t => t.value === prov.tipo)?.label || prov.tipo}
                  </Badge>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`size-3 ${i < Math.round(prov.calificacion) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">{prov.calificacion.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              <Separator />
              {prov.contactoNombre && (
                <div className="text-sm">
                  <span className="text-muted-foreground">{locale === 'es' ? 'Contacto' : 'Contact'}:</span>
                  <p className="font-medium">{prov.contactoNombre}</p>
                </div>
              )}
              {prov.contactoEmail && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="size-3.5 text-muted-foreground" />
                  <span>{prov.contactoEmail}</span>
                </div>
              )}
              {prov.contactoTelefono && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="size-3.5 text-muted-foreground" />
                  <span>{prov.contactoTelefono}</span>
                </div>
              )}
              {prov.direccion && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="size-3.5 text-muted-foreground" />
                  <span>{prov.direccion}</span>
                </div>
              )}
              {prov.paginaWeb && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="size-3.5 text-muted-foreground" />
                  <a href={prov.paginaWeb} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline truncate">
                    {prov.paginaWeb}
                  </a>
                </div>
              )}
              {prov.notas && (
                <div className="text-sm">
                  <span className="text-muted-foreground">{locale === 'es' ? 'Notas' : 'Notes'}:</span>
                  <p className="mt-1 text-muted-foreground">{prov.notas}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShoppingBag className="size-4 text-teal-600" />
                  {locale === 'es' ? 'Catálogo de Productos y Servicios' : 'Product & Service Catalog'}
                  <Badge variant="outline" className="ml-auto">{prov.productos?.length || 0}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {prov.productos && prov.productos.length > 0 ? (
                  <div className="space-y-3">
                    {prov.productos.map(producto => (
                      <div key={producto.id} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{producto.nombre}</span>
                            <Badge variant="outline" className="text-[10px]">
                              {CATEGORIAS_PRODUCTO.find(c => c.value === producto.categoria)?.label || producto.categoria}
                            </Badge>
                            {!producto.disponible && (
                              <Badge variant="outline" className="text-[10px] text-red-600">
                                {locale === 'es' ? 'No disponible' : 'Unavailable'}
                              </Badge>
                            )}
                          </div>
                          {producto.descripcion && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">{producto.descripcion}</p>
                          )}
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            {producto.unidad && <span>{producto.unidad}</span>}
                            {producto.cantidadMinima > 1 && (
                              <span>{locale === 'es' ? `Mín: ${producto.cantidadMinima}` : `Min: ${producto.cantidadMinima}`}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-bold text-sm">${producto.precio.toFixed(2)}</div>
                          {producto.precioMayoreo && (
                            <div className="text-xs text-emerald-600">
                              {locale === 'es' ? 'Mayoreo' : 'Wholesale'}: ${producto.precioMayoreo.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingBag className="size-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {locale === 'es' ? 'No hay productos registrados' : 'No products registered'}
                    </p>
                    <Button
                      className="mt-3 bg-teal-600 hover:bg-teal-700 text-white"
                      size="sm"
                      onClick={() => setShowFormProducto(true)}
                    >
                      <Plus className="size-4 mr-1" />
                      {locale === 'es' ? 'Agregar primer producto' : 'Add first product'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={showFormProducto} onOpenChange={setShowFormProducto}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="size-5 text-teal-600" />
                {locale === 'es' ? 'Agregar Producto / Servicio' : 'Add Product / Service'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>{locale === 'es' ? 'Nombre (ES)' : 'Name (ES)'}</Label>
                  <Input value={formProducto.nombre} onChange={e => setFormProducto(p => ({ ...p, nombre: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>{locale === 'es' ? 'Nombre (EN)' : 'Name (EN)'}</Label>
                  <Input value={formProducto.nombreEn} onChange={e => setFormProducto(p => ({ ...p, nombreEn: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-1">
                <Label>{locale === 'es' ? 'Descripción' : 'Description'}</Label>
                <Textarea value={formProducto.descripcion} onChange={e => setFormProducto(p => ({ ...p, descripcion: e.target.value }))} rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>{locale === 'es' ? 'Categoría' : 'Category'}</Label>
                  <Select value={formProducto.categoria} onValueChange={v => setFormProducto(p => ({ ...p, categoria: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS_PRODUCTO.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>{locale === 'es' ? 'Unidad' : 'Unit'}</Label>
                  <Input placeholder="kg, lt, pza..." value={formProducto.unidad} onChange={e => setFormProducto(p => ({ ...p, unidad: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label>{locale === 'es' ? 'Precio unitario' : 'Unit price'}</Label>
                  <Input type="number" placeholder="0.00" value={formProducto.precio} onChange={e => setFormProducto(p => ({ ...p, precio: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>{locale === 'es' ? 'Precio mayoreo' : 'Wholesale'}</Label>
                  <Input type="number" placeholder="0.00" value={formProducto.precioMayoreo} onChange={e => setFormProducto(p => ({ ...p, precioMayoreo: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>{locale === 'es' ? 'Cant. mínima' : 'Min qty'}</Label>
                  <Input type="number" min="1" value={formProducto.cantidadMinima} onChange={e => setFormProducto(p => ({ ...p, cantidadMinima: e.target.value }))} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowFormProducto(false)}>{locale === 'es' ? 'Cancelar' : 'Cancel'}</Button>
              <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={handleGuardarProducto}>
                {locale === 'es' ? 'Guardar Producto' : 'Save Product'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {locale === 'es' ? 'Proveedores' : 'Suppliers'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {locale === 'es' ? 'Gestiona tus proveedores de productos y servicios' : 'Manage your product and service suppliers'}
          </p>
        </div>
        <Button
          className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
          onClick={() => { setEditingProveedor(null); setShowFormProveedor(true) }}
        >
          <Plus className="size-4" />
          {locale === 'es' ? 'Agregar Proveedor' : 'Add Supplier'}
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder={locale === 'es' ? 'Buscar proveedor...' : 'Search supplier...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterTipo} onValueChange={setFilterTipo}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={locale === 'es' ? 'Tipo' : 'Type'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">{locale === 'es' ? 'Todos los tipos' : 'All types'}</SelectItem>
            {TIPOS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4"><div className="h-32 animate-pulse rounded bg-muted" /></CardContent></Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Truck className="size-14 text-muted-foreground mx-auto mb-3" />
          <p className="text-lg font-medium">{locale === 'es' ? 'No hay proveedores' : 'No suppliers yet'}</p>
          <p className="text-sm text-muted-foreground mb-4">
            {locale === 'es' ? 'Agrega tu primer proveedor para comenzar' : 'Add your first supplier to get started'}
          </p>
          <Button
            className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
            onClick={() => { setEditingProveedor(null); setShowFormProveedor(true) }}
          >
            <Plus className="size-4" />
            {locale === 'es' ? 'Agregar Proveedor' : 'Add Supplier'}
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(proveedor => (
            <Card
              key={proveedor.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedProveedor(proveedor)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="size-12 shrink-0">
                    <AvatarFallback className="bg-teal-100 text-teal-700 font-bold">
                      {getInitials(proveedor.nombre)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm truncate">{proveedor.nombre}</span>
                      <Badge className={`text-[9px] px-1 shrink-0 ${proveedor.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {proveedor.activo ? (locale === 'es' ? 'Activo' : 'Active') : (locale === 'es' ? 'Inactivo' : 'Inactive')}
                      </Badge>
                    </div>
                    <Badge className={`text-[10px] mt-1 ${getTipoColor(proveedor.tipo)}`}>
                      {TIPOS.find(t => t.value === proveedor.tipo)?.label || proveedor.tipo}
                    </Badge>
                    {proveedor.ciudad && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <MapPin className="size-3" />{proveedor.ciudad}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`size-3 ${i < Math.round(proveedor.calificacion) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Package className="size-3" />
                    {proveedor.productos?.length || 0} {locale === 'es' ? 'productos' : 'products'}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t flex items-center justify-between">
                  {proveedor.contactoEmail && (
                    <span className="text-xs text-muted-foreground truncate flex items-center gap-1">
                      <Mail className="size-3" />{proveedor.contactoEmail}
                    </span>
                  )}
                  <ChevronRight className="size-4 text-muted-foreground ml-auto shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showFormProveedor} onOpenChange={setShowFormProveedor}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="size-5 text-teal-600" />
              {editingProveedor
                ? (locale === 'es' ? 'Editar Proveedor' : 'Edit Supplier')
                : (locale === 'es' ? 'Nuevo Proveedor' : 'New Supplier')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>{locale === 'es' ? 'Nombre (ES) *' : 'Name (ES) *'}</Label>
                <Input value={formProveedor.nombre} onChange={e => setFormProveedor(p => ({ ...p, nombre: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>{locale === 'es' ? 'Nombre (EN)' : 'Name (EN)'}</Label>
                <Input value={formProveedor.nombreEn} onChange={e => setFormProveedor(p => ({ ...p, nombreEn: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>{locale === 'es' ? 'Tipo *' : 'Type *'}</Label>
                <Select value={formProveedor.tipo} onValueChange={v => setFormProveedor(p => ({ ...p, tipo: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIPOS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>RFC</Label>
                <Input value={formProveedor.rfc} onChange={e => setFormProveedor(p => ({ ...p, rfc: e.target.value }))} />
              </div>
            </div>
            <Separator />
            <p className="text-sm font-medium text-muted-foreground">{locale === 'es' ? 'Información de Contacto' : 'Contact Information'}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>{locale === 'es' ? 'Nombre del contacto' : 'Contact name'}</Label>
                <Input value={formProveedor.contactoNombre} onChange={e => setFormProveedor(p => ({ ...p, contactoNombre: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input type="email" value={formProveedor.contactoEmail} onChange={e => setFormProveedor(p => ({ ...p, contactoEmail: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>{locale === 'es' ? 'Teléfono' : 'Phone'}</Label>
                <Input value={formProveedor.contactoTelefono} onChange={e => setFormProveedor(p => ({ ...p, contactoTelefono: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>{locale === 'es' ? 'Página web' : 'Website'}</Label>
                <Input placeholder="https://..." value={formProveedor.paginaWeb} onChange={e => setFormProveedor(p => ({ ...p, paginaWeb: e.target.value }))} />
              </div>
            </div>
            <Separator />
            <p className="text-sm font-medium text-muted-foreground">{locale === 'es' ? 'Ubicación' : 'Location'}</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>{locale === 'es' ? 'Ciudad' : 'City'}</Label>
                <Input value={formProveedor.ciudad} onChange={e => setFormProveedor(p => ({ ...p, ciudad: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>{locale === 'es' ? 'Región' : 'Region'}</Label>
                <Input placeholder="cancun, cdmx..." value={formProveedor.region} onChange={e => setFormProveedor(p => ({ ...p, region: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>{locale === 'es' ? 'Dirección' : 'Address'}</Label>
                <Input value={formProveedor.direccion} onChange={e => setFormProveedor(p => ({ ...p, direccion: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>{locale === 'es' ? 'Notas' : 'Notes'}</Label>
              <Textarea value={formProveedor.notas} onChange={e => setFormProveedor(p => ({ ...p, notas: e.target.value }))} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFormProveedor(false)}>{locale === 'es' ? 'Cancelar' : 'Cancel'}</Button>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={handleGuardarProveedor}>
              {editingProveedor ? (locale === 'es' ? 'Actualizar' : 'Update') : (locale === 'es' ? 'Crear Proveedor' : 'Create Supplier')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}