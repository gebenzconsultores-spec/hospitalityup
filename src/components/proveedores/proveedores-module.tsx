'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Truck,
  Plus,
  Pencil,
  Trash2,
  Package,
  ChevronDown,
  ChevronRight,
  MapPin,
  Mail,
  Phone,
  Star,
  Building2,
  Globe,
  Search,
  Filter,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { useAppStore } from '@/lib/store'
import { translations } from '@/lib/i18n'
import { toast } from 'sonner'

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
  _count?: { productos: number }
  productos?: ProductoProveedor[]
}

interface ProductoProveedor {
  id: string
  nombre: string
  nombreEn: string | null
  descripcion: string | null
  categoria: string
  unidad: string | null
  precio: number
  precioMayoreo: number | null
  cantidadMinima: number
  imagen: string | null
  disponible: boolean
}

interface SolicitudPedido {
  id: string
  propiedadId: string
  propiedad: { id: string; nombre: string; region: string }
  proveedorId: string
  proveedor: { id: string; nombre: string; tipo: string; contactoEmail: string | null; contactoTelefono: string | null }
  productoId: string | null
  producto: { id: string; nombre: string; categoria: string; unidad: string | null; precio: number } | null
  cantidad: number
  unidad: string | null
  precioEstimado: number | null
  totalEstimado: number | null
  notas: string | null
  estado: string
  fechaSolicitud: string
  fechaRespuesta: string | null
  fechaEntrega: string | null
  respuestaProveedor: string | null
  solicitadoPor: string | null
}

const tipoLabels: Record<string, { es: string; en: string; icon: string }> = {
  pasteleria: { es: 'Pastelería', en: 'Bakery', icon: '🍰' },
  repostera: { es: 'Repostería', en: 'Pastry', icon: '🧁' },
  carniceria: { es: 'Carnicería', en: 'Butcher', icon: '🥩' },
  verduleria: { es: 'Verdulería', en: 'Greengrocer', icon: '🥬' },
  bebidas: { es: 'Bebidas', en: 'Beverages', icon: '🥤' },
  limpieza: { es: 'Limpieza', en: 'Cleaning', icon: '🧽' },
  insumos: { es: 'Insumos', en: 'Supplies', icon: '📦' },
  otro: { es: 'Otro', en: 'Other', icon: '🏪' },
}

const categoriaLabels: Record<string, { es: string; en: string; icon: string }> = {
  pastel: { es: 'Pastel', en: 'Cake', icon: '🍰' },
  postre: { es: 'Postre', en: 'Dessert', icon: '🍮' },
  pan: { es: 'Pan', en: 'Bread', icon: '🍞' },
  carne: { es: 'Carne', en: 'Meat', icon: '🥩' },
  verdura: { es: 'Verdura', en: 'Vegetable', icon: '🥬' },
  fruta: { es: 'Fruta', en: 'Fruit', icon: '🍎' },
  bebida: { es: 'Bebida', en: 'Beverage', icon: '🥤' },
  insumo: { es: 'Insumo', en: 'Supply', icon: '📦' },
  limpieza: { es: 'Limpieza', en: 'Cleaning', icon: '🧽' },
  otro: { es: 'Otro', en: 'Other', icon: '📦' },
}

export function ProveedoresModule() {
  const { locale } = useAppStore()
  const t = translations[locale]
  const tt = locale === 'es' ? {
    title: 'Proveedores',
    subtitle: 'Gestiona proveedores y sus productos para tus sucursales',
    agregarProveedor: 'Agregar Proveedor',
    editarProveedor: 'Editar Proveedor',
    nombre: 'Nombre',
    nombreEn: 'Nombre (Inglés)',
    tipo: 'Tipo de Proveedor',
    rfc: 'RFC',
    contactoNombre: 'Nombre del Contacto',
    contactoEmail: 'Email',
    contactoTelefono: 'Teléfono',
    direccion: 'Dirección',
    region: 'Región',
    ciudad: 'Ciudad',
    paginaWeb: 'Página Web',
    calificacion: 'Calificación',
    notas: 'Notas',
    activo: 'Activo',
    productos: 'Productos',
    agregarProducto: 'Agregar Producto',
    verProductos: 'Ver Productos',
    ocultarProductos: 'Ocultar Productos',
    guardar: 'Guardar',
    cancelar: 'Cancelar',
    eliminar: 'Eliminar',
    eliminarProveedor: 'Eliminar Proveedor',
    eliminarProducto: 'Eliminar Producto',
    confirmarEliminarProv: '¿Estás seguro de eliminar este proveedor? Se eliminarán también todos sus productos.',
    confirmarEliminarProd: '¿Estás seguro de eliminar este producto?',
    sinProveedores: 'No hay proveedores registrados',
    sinProveedoresDesc: 'Agrega tu primer proveedor para comenzar',
    buscar: 'Buscar...',
    todos: 'Todos',
    nombreProducto: 'Nombre del Producto',
    descripcion: 'Descripción',
    categoria: 'Categoría',
    unidad: 'Unidad',
    precio: 'Precio',
    precioMayoreo: 'Precio Mayoreo',
    cantidadMinima: 'Cantidad Mínima',
    disponible: 'Disponible',
    crear: 'Crear',
    creado: 'Proveedor creado',
    actualizado: 'Proveedor actualizado',
    eliminado: 'Proveedor eliminado',
    productoCreado: 'Producto agregado',
    productoActualizado: 'Producto actualizado',
    productoEliminado: 'Producto eliminado',
    error: 'Error',
    sinProductos: 'Sin productos registrados',
    filtroTipo: 'Filtrar por tipo',
  } : {
    title: 'Suppliers',
    subtitle: 'Manage suppliers and their products for your branches',
    agregarProveedor: 'Add Supplier',
    editarProveedor: 'Edit Supplier',
    nombre: 'Name',
    nombreEn: 'Name (English)',
    tipo: 'Supplier Type',
    rfc: 'Tax ID',
    contactoNombre: 'Contact Name',
    contactoEmail: 'Email',
    contactoTelefono: 'Phone',
    direccion: 'Address',
    region: 'Region',
    ciudad: 'City',
    paginaWeb: 'Website',
    calificacion: 'Rating',
    notas: 'Notes',
    activo: 'Active',
    productos: 'Products',
    agregarProducto: 'Add Product',
    verProductos: 'View Products',
    ocultarProductos: 'Hide Products',
    guardar: 'Save',
    cancelar: 'Cancel',
    eliminar: 'Delete',
    eliminarProveedor: 'Delete Supplier',
    eliminarProducto: 'Delete Product',
    confirmarEliminarProv: 'Are you sure you want to delete this supplier? All products will be deleted too.',
    confirmarEliminarProd: 'Are you sure you want to delete this product?',
    sinProveedores: 'No suppliers registered',
    sinProveedoresDesc: 'Add your first supplier to start',
    buscar: 'Search...',
    todos: 'All',
    nombreProducto: 'Product Name',
    descripcion: 'Description',
    categoria: 'Category',
    unidad: 'Unit',
    precio: 'Price',
    precioMayoreo: 'Wholesale Price',
    cantidadMinima: 'Minimum Quantity',
    disponible: 'Available',
    crear: 'Create',
    creado: 'Supplier created',
    actualizado: 'Supplier updated',
    eliminado: 'Supplier deleted',
    productoCreado: 'Product added',
    productoActualizado: 'Product updated',
    productoEliminado: 'Product deleted',
    error: 'Error',
    sinProductos: 'No products registered',
    filtroTipo: 'Filter by type',
  }

  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState('todos')
  const [showFormDialog, setShowFormDialog] = useState(false)
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Proveedor | null>(null)
  const [expandedProveedor, setExpandedProveedor] = useState<string | null>(null)

  // Producto dialog
  const [showProductoDialog, setShowProductoDialog] = useState(false)
  const [productoProveedorId, setProductoProveedorId] = useState<string | null>(null)
  const [editingProducto, setEditingProducto] = useState<ProductoProveedor | null>(null)
  const [deleteProductoTarget, setDeleteProductoTarget] = useState<{ proveedorId: string; producto: ProductoProveedor } | null>(null)

  // Solicitud de pedido state
  const [solicitudes, setSolicitudes] = useState<SolicitudPedido[]>([])
  const [showSolicitudDialog, setShowSolicitudDialog] = useState(false)
  const [solicitudProveedorId, setSolicitudProveedorId] = useState<string | null>(null)
  const [solicitudProductoId, setSolicitudProductoId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('proveedores')

  // Solicitud form
  const [solicitudForm, setSolicitudForm] = useState({
    productoId: '',
    cantidad: '1',
    notas: '',
    fechaEntrega: '',
  })

  // Get user info from store
  const { userRole, userPropiedadId, userPropiedadNombre, userName } = useAppStore()

  // Form state
  const [form, setForm] = useState({
    nombre: '',
    nombreEn: '',
    tipo: 'pasteleria',
    rfc: '',
    contactoNombre: '',
    contactoEmail: '',
    contactoTelefono: '',
    direccion: '',
    region: '',
    ciudad: '',
    paginaWeb: '',
    calificacion: 0,
    notas: '',
    activo: true,
  })

  // Producto form
  const [productoForm, setProductoForm] = useState({
    nombre: '',
    nombreEn: '',
    descripcion: '',
    categoria: 'pastel',
    unidad: 'pieza',
    precio: '',
    precioMayoreo: '',
    cantidadMinima: '1',
    disponible: true,
  })

  const fetchProveedores = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/proveedores')
      const data = await res.json()
      if (Array.isArray(data)) {
        setProveedores(data)
      }
    } catch {
      toast.error(tt.error)
    } finally {
      setLoading(false)
    }
  }, [locale])

  useEffect(() => {
    fetchProveedores()
  }, [fetchProveedores])

  const fetchProductos = async (proveedorId: string) => {
    try {
      const res = await fetch(`/api/proveedores/${proveedorId}`)
      const data = await res.json()
      if (data && data.productos) {
        setProveedores(prev => prev.map(p => 
          p.id === proveedorId ? { ...p, productos: data.productos } : p
        ))
      }
    } catch {}
  }

  // Stable form update handlers to prevent re-renders
  const updateForm = useCallback((field: string, value: string | number | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }, [])

  const updateProductoForm = useCallback((field: string, value: string | boolean) => {
    setProductoForm(prev => ({ ...prev, [field]: value }))
  }, [])

  const abrirNuevo = () => {
    setEditingProveedor(null)
    setForm({
      nombre: '',
      nombreEn: '',
      tipo: 'pasteleria',
      rfc: '',
      contactoNombre: '',
      contactoEmail: '',
      contactoTelefono: '',
      direccion: '',
      region: 'puebla',
      ciudad: '',
      paginaWeb: '',
      calificacion: 0,
      notas: '',
      activo: true,
    })
    setShowFormDialog(true)
  }

  const abrirEditar = (proveedor: Proveedor) => {
    setEditingProveedor(proveedor)
    setForm({
      nombre: proveedor.nombre,
      nombreEn: proveedor.nombreEn || '',
      tipo: proveedor.tipo,
      rfc: proveedor.rfc || '',
      contactoNombre: proveedor.contactoNombre || '',
      contactoEmail: proveedor.contactoEmail || '',
      contactoTelefono: proveedor.contactoTelefono || '',
      direccion: proveedor.direccion || '',
      region: proveedor.region || '',
      ciudad: proveedor.ciudad || '',
      paginaWeb: proveedor.paginaWeb || '',
      calificacion: proveedor.calificacion,
      notas: proveedor.notas || '',
      activo: proveedor.activo,
    })
    setShowFormDialog(true)
  }

  const guardarProveedor = async () => {
    if (!form.nombre) {
      toast.error(locale === 'es' ? 'Nombre es requerido' : 'Name is required')
      return
    }

    console.log('Guardando proveedor...', form)
    try {
      const payload = {
        nombre: form.nombre,
        nombreEn: form.nombreEn || null,
        tipo: form.tipo,
        rfc: form.rfc || null,
        contactoNombre: form.contactoNombre || null,
        contactoEmail: form.contactoEmail || null,
        contactoTelefono: form.contactoTelefono || null,
        direccion: form.direccion || null,
        region: form.region || null,
        ciudad: form.ciudad || null,
        paginaWeb: form.paginaWeb || null,
        calificacion: form.calificacion,
        notas: form.notas || null,
        activo: form.activo,
      }

      console.log('Payload:', payload)

      let res: Response
      if (editingProveedor) {
        res = await fetch(`/api/proveedores/${editingProveedor.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/proveedores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      console.log('Response status:', res.status)
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        console.error('Error response:', errData)
        throw new Error(errData.error || `Error ${res.status}`)
      }

      const saved = await res.json()
      console.log('Saved:', saved)

      toast.success(editingProveedor ? tt.actualizado : tt.creado)
      setShowFormDialog(false)
      fetchProveedores()
    } catch (error) {
      console.error('Error completo:', error)
      toast.error(String(error) || tt.error)
    }
  }

  const eliminarProveedor = async () => {
    if (!deleteTarget) return
    try {
      await fetch(`/api/proveedores/${deleteTarget.id}`, { method: 'DELETE' })
      toast.success(tt.eliminado)
      setDeleteTarget(null)
      fetchProveedores()
    } catch {
      toast.error(tt.error)
    }
  }

  // Producto functions
  const abrirNuevoProducto = (proveedorId: string) => {
    setProductoProveedorId(proveedorId)
    setEditingProducto(null)
    setProductoForm({
      nombre: '',
      nombreEn: '',
      descripcion: '',
      categoria: 'pastel',
      unidad: 'pieza',
      precio: '',
      precioMayoreo: '',
      cantidadMinima: '1',
      disponible: true,
    })
    setShowProductoDialog(true)
  }

  const abrirEditarProducto = (proveedorId: string, producto: ProductoProveedor) => {
    setProductoProveedorId(proveedorId)
    setEditingProducto(producto)
    setProductoForm({
      nombre: producto.nombre,
      nombreEn: producto.nombreEn || '',
      descripcion: producto.descripcion || '',
      categoria: producto.categoria,
      unidad: producto.unidad || 'pieza',
      precio: producto.precio.toString(),
      precioMayoreo: producto.precioMayoreo?.toString() || '',
      cantidadMinima: producto.cantidadMinima.toString(),
      disponible: producto.disponible,
    })
    setShowProductoDialog(true)
  }

  const guardarProducto = async () => {
    if (!productoProveedorId || !productoForm.nombre || !productoForm.precio) {
      toast.error(locale === 'es' ? 'Nombre y precio son requeridos' : 'Name and price are required')
      return
    }

    try {
      const payload = {
        nombre: productoForm.nombre,
        nombreEn: productoForm.nombreEn || null,
        descripcion: productoForm.descripcion || null,
        categoria: productoForm.categoria,
        unidad: productoForm.unidad,
        precio: productoForm.precio,
        precioMayoreo: productoForm.precioMayoreo || null,
        cantidadMinima: productoForm.cantidadMinima,
        disponible: productoForm.disponible,
      }

      let res: Response
      if (editingProducto) {
        res = await fetch(`/api/proveedores/${productoProveedorId}/productos/${editingProducto.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch(`/api/proveedores/${productoProveedorId}/productos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) throw new Error('Error')

      toast.success(editingProducto ? tt.productoActualizado : tt.productoCreado)
      setShowProductoDialog(false)
      fetchProductos(productoProveedorId)
      fetchProveedores()
    } catch {
      toast.error(tt.error)
    }
  }

  const eliminarProducto = async () => {
    if (!deleteProductoTarget) return
    try {
      await fetch(`/api/proveedores/${deleteProductoTarget.proveedorId}/productos/${deleteProductoTarget.producto.id}`, {
        method: 'DELETE',
      })
      toast.success(tt.productoEliminado)
      fetchProductos(deleteProductoTarget.proveedorId)
      fetchProveedores()
      setDeleteProductoTarget(null)
    } catch {
      toast.error(tt.error)
    }
  }

  const toggleExpand = (id: string) => {
    const newExpanded = expandedProveedor === id ? null : id
    setExpandedProveedor(newExpanded)
    if (newExpanded) {
      fetchProductos(id)
    }
  }

  // Solicitud de pedido functions
  const fetchSolicitudes = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (userRole === 'empresa' && userPropiedadId) {
        params.set('propiedadId', userPropiedadId)
      }
      const res = await fetch(`/api/solicitudes-pedido?${params.toString()}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setSolicitudes(data)
      }
    } catch {}
  }, [userRole, userPropiedadId])

  useEffect(() => {
    if (activeTab === 'solicitudes') {
      fetchSolicitudes()
    }
  }, [activeTab, fetchSolicitudes])

  const abrirSolicitud = (proveedorId: string, productoId?: string) => {
    if (!userPropiedadId) {
      toast.error(locale === 'es' ? 'No tienes una propiedad asignada' : 'No property assigned')
      return
    }
    setSolicitudProveedorId(proveedorId)
    setSolicitudForm({
      productoId: productoId || '',
      cantidad: '1',
      notas: '',
      fechaEntrega: '',
    })
    setShowSolicitudDialog(true)
  }

  const enviarSolicitud = async () => {
    if (!solicitudProveedorId || !userPropiedadId) {
      toast.error(locale === 'es' ? 'Error: faltan datos' : 'Error: missing data')
      return
    }
    if (!solicitudForm.cantidad || parseInt(solicitudForm.cantidad) < 1) {
      toast.error(locale === 'es' ? 'Cantidad inválida' : 'Invalid quantity')
      return
    }

    try {
      // Obtener el producto para su precio y unidad
      const proveedor = proveedores.find(p => p.id === solicitudProveedorId)
      const producto = proveedor?.productos?.find(p => p.id === solicitudForm.productoId)

      const res = await fetch('/api/solicitudes-pedido', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propiedadId: userPropiedadId,
          solicitadoPor: userName,
          proveedorId: solicitudProveedorId,
          productoId: solicitudForm.productoId || null,
          cantidad: solicitudForm.cantidad,
          unidad: producto?.unidad || 'pieza',
          precioEstimado: producto?.precio || null,
          notas: solicitudForm.notas || null,
          fechaEntrega: solicitudForm.fechaEntrega || null,
        }),
      })

      if (!res.ok) throw new Error('Error')

      toast.success(locale === 'es' ? 'Solicitud enviada correctamente' : 'Request sent successfully')
      setShowSolicitudDialog(false)
      fetchSolicitudes()
    } catch {
      toast.error(locale === 'es' ? 'Error al enviar solicitud' : 'Error sending request')
    }
  }

  const actualizarEstadoSolicitud = async (id: string, estado: string) => {
    try {
      await fetch(`/api/solicitudes-pedido/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado }),
      })
      toast.success(locale === 'es' ? `Estado actualizado a: ${estado}` : `Status updated to: ${estado}`)
      fetchSolicitudes()
    } catch {
      toast.error(locale === 'es' ? 'Error al actualizar' : 'Error updating')
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'cotizada': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'aprobada': return 'bg-green-100 text-green-700 border-green-200'
      case 'rechazada': return 'bg-red-100 text-red-700 border-red-200'
      case 'entregada': return 'bg-teal-100 text-teal-700 border-teal-200'
      case 'cancelada': return 'bg-gray-100 text-gray-700 border-gray-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'pendiente': return <Clock className="size-3" />
      case 'cotizada': return <AlertCircle className="size-3" />
      case 'aprobada': return <CheckCircle className="size-3" />
      case 'rechazada': return <XCircle className="size-3" />
      case 'entregada': return <CheckCircle className="size-3" />
      case 'cancelada': return <XCircle className="size-3" />
      default: return <Clock className="size-3" />
    }
  }

  const getEstadoLabel = (estado: string) => {
    const labels: Record<string, { es: string; en: string }> = {
      pendiente: { es: 'Pendiente', en: 'Pending' },
      cotizada: { es: 'Cotizada', en: 'Quoted' },
      aprobada: { es: 'Aprobada', en: 'Approved' },
      rechazada: { es: 'Rechazada', en: 'Rejected' },
      entregada: { es: 'Entregada', en: 'Delivered' },
      cancelada: { es: 'Cancelada', en: 'Cancelled' },
    }
    return labels[estado]?.[locale] || estado
  }

  // Filtered proveedores
  const proveedoresFiltrados = proveedores.filter(p => {
    if (tipoFiltro !== 'todos' && p.tipo !== tipoFiltro) return false
    if (search) {
      const s = search.toLowerCase()
      return p.nombre.toLowerCase().includes(s) ||
             (p.contactoNombre?.toLowerCase().includes(s) || false) ||
             (p.ciudad?.toLowerCase().includes(s) || false)
    }
    return true
  })

  const fmt = (n: number) => `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

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
            <Truck className="size-6 text-teal-600" />
            {tt.title}
          </h1>
          <p className="text-sm text-muted-foreground">{tt.subtitle}</p>
        </div>
        {userRole === 'admin' && (
          <Button
            className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5 shrink-0"
            onClick={abrirNuevo}
          >
            <Plus className="size-4" />
            {tt.agregarProveedor}
          </Button>
        )}
      </div>

      {/* Tabs: Proveedores / Mis Solicitudes */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="proveedores" className="gap-1.5">
            <Truck className="size-4" />
            {locale === 'es' ? 'Proveedores' : 'Suppliers'}
          </TabsTrigger>
          <TabsTrigger value="solicitudes" className="gap-1.5">
            <ShoppingCart className="size-4" />
            {locale === 'es' ? 'Solicitudes de Pedido' : 'Purchase Requests'}
            {solicitudes.filter(s => s.estado === 'pendiente').length > 0 && (
              <Badge variant="destructive" className="ml-1 text-[10px] px-1.5 py-0">
                {solicitudes.filter(s => s.estado === 'pendiente').length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="proveedores" className="mt-4 space-y-4">

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <Truck className="size-5 text-teal-600 mx-auto mb-1" />
            <div className="text-xl font-bold">{proveedores.length}</div>
            <div className="text-xs text-muted-foreground">{locale === 'es' ? 'Proveedores' : 'Suppliers'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <Package className="size-5 text-blue-600 mx-auto mb-1" />
            <div className="text-xl font-bold">{proveedores.reduce((sum, p) => sum + (p._count?.productos || 0), 0)}</div>
            <div className="text-xs text-muted-foreground">{locale === 'es' ? 'Productos' : 'Products'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <Building2 className="size-5 text-green-600 mx-auto mb-1" />
            <div className="text-xl font-bold">{proveedores.filter(p => p.activo).length}</div>
            <div className="text-xs text-muted-foreground">{locale === 'es' ? 'Activos' : 'Active'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <Star className="size-5 text-yellow-500 mx-auto mb-1" />
            <div className="text-xl font-bold">
              {proveedores.length > 0
                ? (proveedores.reduce((sum, p) => sum + p.calificacion, 0) / proveedores.length).toFixed(1)
                : '0.0'}
            </div>
            <div className="text-xs text-muted-foreground">{locale === 'es' ? 'Calificación' : 'Rating'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={tt.buscar}
            className="pl-9"
          />
        </div>
        <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="size-4 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">{tt.todos}</SelectItem>
            {Object.entries(tipoLabels).map(([key, val]) => (
              <SelectItem key={key} value={key}>
                {val.icon} {locale === 'es' ? val.es : val.en}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Proveedores List */}
      {proveedoresFiltrados.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Truck className="size-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="font-medium text-muted-foreground">{tt.sinProveedores}</p>
            <p className="text-sm text-muted-foreground/70 mt-1">{tt.sinProveedoresDesc}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {proveedoresFiltrados.map((proveedor) => {
            const tipoInfo = tipoLabels[proveedor.tipo] || tipoLabels.otro
            const isExpanded = expandedProveedor === proveedor.id
            const productosCount = proveedor._count?.productos || 0

            return (
              <Card key={proveedor.id} className={!proveedor.activo ? 'opacity-60' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="size-10 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center shrink-0 text-lg">
                        {tipoInfo.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-base">{proveedor.nombre}</CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {tipoInfo.icon} {locale === 'es' ? tipoInfo.es : tipoInfo.en}
                          </Badge>
                          {!proveedor.activo && (
                            <Badge variant="destructive" className="text-xs">{locale === 'es' ? 'Inactivo' : 'Inactive'}</Badge>
                          )}
                          {proveedor.calificacion > 0 && (
                            <Badge variant="secondary" className="text-xs gap-1">
                              <Star className="size-3 fill-yellow-400 text-yellow-400" />
                              {proveedor.calificacion.toFixed(1)}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {productosCount} {locale === 'es' ? 'productos' : 'products'}
                          {proveedor.ciudad && ` · ${proveedor.ciudad}`}
                          {proveedor.region && ` · ${proveedor.region}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {userRole === 'admin' && (
                        <>
                          <Button variant="ghost" size="icon" className="size-8" onClick={() => abrirEditar(proveedor)}>
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(proveedor)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Info grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    {/* Contacto */}
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">{locale === 'es' ? 'Contacto' : 'Contact'}</p>
                      {proveedor.contactoNombre && (
                        <p className="flex items-center gap-1.5"><Mail className="size-3 text-muted-foreground" />{proveedor.contactoNombre}</p>
                      )}
                      {proveedor.contactoEmail && (
                        <p className="flex items-center gap-1.5 truncate"><Mail className="size-3 text-muted-foreground" />{proveedor.contactoEmail}</p>
                      )}
                      {proveedor.contactoTelefono && (
                        <p className="flex items-center gap-1.5"><Phone className="size-3 text-muted-foreground" />{proveedor.contactoTelefono}</p>
                      )}
                      {!proveedor.contactoNombre && !proveedor.contactoEmail && !proveedor.contactoTelefono && (
                        <p className="text-xs text-muted-foreground/50">—</p>
                      )}
                    </div>

                    {/* Ubicación */}
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">{locale === 'es' ? 'Ubicación' : 'Location'}</p>
                      {proveedor.direccion && (
                        <p className="flex items-center gap-1.5"><MapPin className="size-3 text-muted-foreground" />{proveedor.direccion}</p>
                      )}
                      {proveedor.ciudad && (
                        <p className="flex items-center gap-1.5"><MapPin className="size-3 text-muted-foreground" />{proveedor.ciudad}, {proveedor.region}</p>
                      )}
                      {proveedor.paginaWeb && (
                        <p className="flex items-center gap-1.5 truncate"><Globe className="size-3 text-muted-foreground" />{proveedor.paginaWeb}</p>
                      )}
                      {!proveedor.direccion && !proveedor.ciudad && !proveedor.paginaWeb && (
                        <p className="text-xs text-muted-foreground/50">—</p>
                      )}
                    </div>

                    {/* Productos */}
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">{tt.productos}</p>
                      <Badge variant={productosCount > 0 ? 'default' : 'secondary'}>
                        {productosCount}
                      </Badge>
                      {userRole === 'admin' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 ml-2"
                          onClick={() => abrirNuevoProducto(proveedor.id)}
                        >
                          <Plus className="size-3 mr-1" />
                          {tt.agregarProducto}
                        </Button>
                      )}
                      {userRole === 'empresa' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 ml-2 bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100"
                          onClick={() => abrirSolicitud(proveedor.id)}
                        >
                          <ShoppingCart className="size-3 mr-1" />
                          {locale === 'es' ? 'Solicitar Pedido' : 'Request Order'}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Expand productos */}
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-between"
                      onClick={() => toggleExpand(proveedor.id)}
                    >
                      <span className="text-xs font-medium">
                        {isExpanded ? tt.ocultarProductos : tt.verProductos} ({productosCount})
                      </span>
                      {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                    </Button>

                    {isExpanded && (
                      <div className="mt-2 space-y-2 border-l-2 border-teal-100 pl-3">
                        {proveedor.productos && proveedor.productos.length > 0 ? (
                          proveedor.productos.map((producto) => {
                            const catInfo = categoriaLabels[producto.categoria] || categoriaLabels.otro
                            return (
                              <div key={producto.id} className="flex items-center gap-2 text-sm py-2 border-b last:border-0">
                                <span className="text-lg">{catInfo.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{producto.nombre}</span>
                                    {!producto.disponible && (
                                      <Badge variant="secondary" className="text-[10px]">{locale === 'es' ? 'No disp.' : 'Unavail.'}</Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {locale === 'es' ? catInfo.es : catInfo.en} · {producto.unidad} · {locale === 'es' ? 'Mín.' : 'Min.'} {producto.cantidadMinima}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="font-bold text-teal-700">{fmt(producto.precio)}</p>
                                  {producto.precioMayoreo && (
                                    <p className="text-[10px] text-muted-foreground">{locale === 'es' ? 'Mayoreo' : 'Wholesale'}: {fmt(producto.precioMayoreo)}</p>
                                  )}
                                </div>
                                <div className="flex gap-1 shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7"
                                    onClick={() => abrirEditarProducto(proveedor.id, producto)}
                                  >
                                    <Pencil className="size-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7 text-destructive hover:text-destructive"
                                    onClick={() => setDeleteProductoTarget({ proveedorId: proveedor.id, producto })}
                                  >
                                    <Trash2 className="size-3" />
                                  </Button>
                                </div>
                              </div>
                            )
                          })
                        ) : (
                          <p className="text-xs text-muted-foreground py-2">{tt.sinProductos}</p>
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
        </TabsContent>

        {/* Tab: Solicitudes de Pedido */}
        <TabsContent value="solicitudes" className="mt-4 space-y-4">
          {solicitudes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ShoppingCart className="size-12 mx-auto mb-3 text-muted-foreground/30" />
                <p className="font-medium text-muted-foreground">
                  {locale === 'es' ? 'No hay solicitudes de pedido' : 'No purchase requests'}
                </p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  {locale === 'es'
                    ? 'Ve a la pestaña Proveedores y solicita un producto'
                    : 'Go to Suppliers tab and request a product'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {solicitudes.map((sol) => (
                <Card key={sol.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">
                            {sol.producto?.nombre || (locale === 'es' ? 'Producto general' : 'General product')}
                          </span>
                          <Badge variant="outline" className={`text-[10px] gap-1 ${getEstadoColor(sol.estado)}`}>
                            {getEstadoIcon(sol.estado)}
                            {getEstadoLabel(sol.estado)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {locale === 'es' ? 'Proveedor:' : 'Supplier:'} <span className="font-medium">{sol.proveedor.nombre}</span>
                          {' · '}
                          {locale === 'es' ? 'Sucursal:' : 'Branch:'} <span className="font-medium">{sol.propiedad.nombre}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {locale === 'es' ? 'Cantidad:' : 'Quantity:'} <span className="font-medium">{sol.cantidad} {sol.unidad || 'piezas'}</span>
                          {sol.totalEstimado && (
                            <>
                              {' · '}
                              {locale === 'es' ? 'Total estimado:' : 'Estimated total:'} <span className="font-bold text-teal-700">${sol.totalEstimado.toLocaleString('es-MX')}</span>
                            </>
                          )}
                        </p>
                        {sol.notas && (
                          <p className="text-xs text-muted-foreground mt-1 italic">"{sol.notas}"</p>
                        )}
                        {sol.respuestaProveedor && (
                          <div className="mt-2 p-2 bg-muted rounded text-xs">
                            <span className="font-medium">{locale === 'es' ? 'Respuesta del proveedor:' : 'Supplier response:'}</span>
                            <p className="mt-0.5">{sol.respuestaProveedor}</p>
                          </div>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-2">
                          {locale === 'es' ? 'Solicitado:' : 'Requested:'} {new Date(sol.fechaSolicitud).toLocaleString(locale === 'es' ? 'es-MX' : 'en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          {sol.solicitadoPor && ` · ${sol.solicitadoPor}`}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    {sol.estado === 'pendiente' && (
                      <div className="flex gap-2 flex-wrap">
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => actualizarEstadoSolicitud(sol.id, 'cotizada')}>
                          {locale === 'es' ? 'Marcar Cotizada' : 'Mark Quoted'}
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => actualizarEstadoSolicitud(sol.id, 'aprobada')}>
                          <CheckCircle className="size-3 mr-1" />
                          {locale === 'es' ? 'Aprobar' : 'Approve'}
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs text-destructive" onClick={() => actualizarEstadoSolicitud(sol.id, 'cancelada')}>
                          <XCircle className="size-3 mr-1" />
                          {locale === 'es' ? 'Cancelar' : 'Cancel'}
                        </Button>
                      </div>
                    )}
                    {sol.estado === 'cotizada' && (
                      <div className="flex gap-2 flex-wrap">
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => actualizarEstadoSolicitud(sol.id, 'aprobada')}>
                          <CheckCircle className="size-3 mr-1" />
                          {locale === 'es' ? 'Aprobar' : 'Approve'}
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs text-destructive" onClick={() => actualizarEstadoSolicitud(sol.id, 'rechazada')}>
                          <XCircle className="size-3 mr-1" />
                          {locale === 'es' ? 'Rechazar' : 'Reject'}
                        </Button>
                      </div>
                    )}
                    {sol.estado === 'aprobada' && (
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => actualizarEstadoSolicitud(sol.id, 'entregada')}>
                        <CheckCircle className="size-3 mr-1" />
                        {locale === 'es' ? 'Marcar Entregada' : 'Mark Delivered'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog: Crear/Editar Proveedor */}
      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="size-5 text-teal-600" />
              {editingProveedor ? tt.editarProveedor : tt.agregarProveedor}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{tt.nombre} *</Label>
                <Input value={form.nombre} onChange={e => updateForm('nombre', e.target.value)} placeholder="Pastelería La Esperanza" />
              </div>
              <div className="space-y-1.5">
                <Label>{tt.nombreEn}</Label>
                <Input value={form.nombreEn} onChange={e => updateForm('nombreEn', e.target.value)} placeholder="La Esperanza Bakery" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{tt.tipo}</Label>
                <Select value={form.tipo} onValueChange={v => setForm(prev => ({ ...prev, tipo: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(tipoLabels).map(([key, val]) => (
                      <SelectItem key={key} value={key}>{val.icon} {locale === 'es' ? val.es : val.en}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{tt.rfc}</Label>
                <Input value={form.rfc} onChange={e => updateForm('rfc', e.target.value)} placeholder="PLE010101AB1" />
              </div>
            </div>

            <div className="border-t pt-3">
              <p className="text-sm font-medium mb-2">{locale === 'es' ? 'Contacto' : 'Contact'}</p>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>{tt.contactoNombre}</Label>
                  <Input value={form.contactoNombre} onChange={e => updateForm('contactoNombre', e.target.value)} placeholder="María González" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>{tt.contactoEmail}</Label>
                    <Input type="email" value={form.contactoEmail} onChange={e => updateForm('contactoEmail', e.target.value)} placeholder="maria@pasteleria.com" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{tt.contactoTelefono}</Label>
                    <Input value={form.contactoTelefono} onChange={e => updateForm('contactoTelefono', e.target.value)} placeholder="+52 222 123 4567" />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-3">
              <p className="text-sm font-medium mb-2">{locale === 'es' ? 'Ubicación' : 'Location'}</p>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>{tt.direccion}</Label>
                  <Input value={form.direccion} onChange={e => updateForm('direccion', e.target.value)} placeholder="Calle 5 #123, Col. Centro" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>{tt.ciudad}</Label>
                    <Input value={form.ciudad} onChange={e => updateForm('ciudad', e.target.value)} placeholder="Puebla" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{tt.region}</Label>
                    <Select value={form.region || 'puebla'} onValueChange={v => setForm(prev => ({ ...prev, region: v }))}>
                      <SelectTrigger><SelectValue placeholder={locale === 'es' ? 'Seleccionar...' : 'Select...'} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cdmx">CDMX</SelectItem>
                        <SelectItem value="puebla">Puebla</SelectItem>
                        <SelectItem value="cancun">Cancún</SelectItem>
                        <SelectItem value="playa_carmen">Playa del Carmen</SelectItem>
                        <SelectItem value="los_cabos">Los Cabos</SelectItem>
                        <SelectItem value="veracruz">Veracruz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>{tt.paginaWeb}</Label>
                  <Input value={form.paginaWeb} onChange={e => updateForm('paginaWeb', e.target.value)} placeholder="www.pasteleria.com" />
                </div>
              </div>
            </div>

            <div className="border-t pt-3 grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{tt.calificacion}</Label>
                <Select value={form.calificacion.toString()} onValueChange={v => setForm(prev => ({ ...prev, calificacion: parseFloat(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">—</SelectItem>
                    <SelectItem value="1">⭐ 1.0</SelectItem>
                    <SelectItem value="2">⭐⭐ 2.0</SelectItem>
                    <SelectItem value="3">⭐⭐⭐ 3.0</SelectItem>
                    <SelectItem value="4">⭐⭐⭐⭐ 4.0</SelectItem>
                    <SelectItem value="5">⭐⭐⭐⭐⭐ 5.0</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch checked={form.activo} onCheckedChange={checked => setForm(prev => ({ ...prev, activo: checked }))} />
                <Label>{tt.activo}</Label>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>{tt.notas}</Label>
              <Textarea value={form.notas} onChange={e => updateForm('notas', e.target.value)} placeholder={locale === 'es' ? 'Notas internas sobre el proveedor...' : 'Internal notes about supplier...'} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFormDialog(false)}>{tt.cancelar}</Button>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={guardarProveedor}>
              {editingProveedor ? tt.guardar : tt.crear}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Crear/Editar Producto */}
      <Dialog open={showProductoDialog} onOpenChange={setShowProductoDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="size-5 text-teal-600" />
              {editingProducto ? (locale === 'es' ? 'Editar Producto' : 'Edit Product') : tt.agregarProducto}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>{tt.nombreProducto} *</Label>
              <Input value={productoForm.nombre} onChange={e => updateProductoForm('nombre', e.target.value)} placeholder="Pastel de Chocolate" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{tt.categoria}</Label>
                <Select value={productoForm.categoria} onValueChange={v => setProductoForm(prev => ({ ...prev, categoria: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoriaLabels).map(([key, val]) => (
                      <SelectItem key={key} value={key}>{val.icon} {locale === 'es' ? val.es : val.en}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{tt.unidad}</Label>
                <Select value={productoForm.unidad} onValueChange={v => setProductoForm(prev => ({ ...prev, unidad: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pieza">{locale === 'es' ? 'Pieza' : 'Piece'}</SelectItem>
                    <SelectItem value="kg">Kg</SelectItem>
                    <SelectItem value="litro">{locale === 'es' ? 'Litro' : 'Liter'}</SelectItem>
                    <SelectItem value="caja">{locale === 'es' ? 'Caja' : 'Box'}</SelectItem>
                    <SelectItem value="paquete">{locale === 'es' ? 'Paquete' : 'Package'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{tt.precio} *</Label>
                <Input type="number" value={productoForm.precio} onChange={e => updateProductoForm('precio', e.target.value)} placeholder="150.00" />
              </div>
              <div className="space-y-1.5">
                <Label>{tt.precioMayoreo}</Label>
                <Input type="number" value={productoForm.precioMayoreo} onChange={e => updateProductoForm('precioMayoreo', e.target.value)} placeholder="120.00" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{tt.cantidadMinima}</Label>
              <Input type="number" value={productoForm.cantidadMinima} onChange={e => updateProductoForm('cantidadMinima', e.target.value)} placeholder="1" />
            </div>
            <div className="space-y-1.5">
              <Label>{tt.descripcion}</Label>
              <Textarea value={productoForm.descripcion} onChange={e => updateProductoForm('descripcion', e.target.value)} placeholder={locale === 'es' ? 'Descripción del producto...' : 'Product description...'} rows={2} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={productoForm.disponible} onCheckedChange={checked => setProductoForm(prev => ({ ...prev, disponible: checked }))} />
              <Label>{tt.disponible}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProductoDialog(false)}>{tt.cancelar}</Button>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={guardarProducto}>
              {editingProducto ? tt.guardar : tt.crear}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation: Proveedor */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tt.eliminarProveedor}</AlertDialogTitle>
            <AlertDialogDescription>
              {tt.confirmarEliminarProv}
              {deleteTarget && <span className="block mt-2 font-medium">"{deleteTarget.nombre}"</span>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tt.cancelar}</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={eliminarProveedor}>
              {tt.eliminar}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation: Producto */}
      <AlertDialog open={!!deleteProductoTarget} onOpenChange={(open) => !open && setDeleteProductoTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tt.eliminarProducto}</AlertDialogTitle>
            <AlertDialogDescription>
              {tt.confirmarEliminarProd}
              {deleteProductoTarget && <span className="block mt-2 font-medium">"{deleteProductoTarget.producto.nombre}"</span>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tt.cancelar}</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={eliminarProducto}>
              {tt.eliminar}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog: Solicitar Pedido */}
      <Dialog open={showSolicitudDialog} onOpenChange={setShowSolicitudDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="size-5 text-teal-600" />
              {locale === 'es' ? 'Solicitar Pedido' : 'Request Order'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {/* Info de la sucursal */}
            <div className="p-3 bg-teal-50 rounded-lg text-sm">
              <p className="font-medium text-teal-700">
                {locale === 'es' ? 'Sucursal:' : 'Branch:'} {userPropiedadNombre || '—'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {locale === 'es' ? 'La solicitud se enviará al proveedor' : 'Request will be sent to supplier'}
              </p>
            </div>

            {/* Producto */}
            <div className="space-y-1.5">
              <Label>{locale === 'es' ? 'Producto' : 'Product'}</Label>
              <Select
                value={solicitudForm.productoId}
                onValueChange={v => setSolicitudForm(prev => ({ ...prev, productoId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={locale === 'es' ? 'Seleccionar producto...' : 'Select product...'} />
                </SelectTrigger>
                <SelectContent>
                  {solicitudProveedorId && proveedores.find(p => p.id === solicitudProveedorId)?.productos?.map(producto => (
                    <SelectItem key={producto.id} value={producto.id}>
                      {producto.nombre} - ${producto.precio}/{producto.unidad || 'pieza'}
                    </SelectItem>
                  )) || (
                    <SelectItem value="_none" disabled>
                      {locale === 'es' ? 'Sin productos disponibles' : 'No products available'}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">
                {locale === 'es'
                  ? 'Si no seleccionas producto, será una cotización general'
                  : 'If no product selected, it will be a general quote'}
              </p>
            </div>

            {/* Cantidad */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{locale === 'es' ? 'Cantidad' : 'Quantity'} *</Label>
                <Input
                  type="number"
                  min="1"
                  value={solicitudForm.cantidad}
                  onChange={e => setSolicitudForm(prev => ({ ...prev, cantidad: e.target.value }))}
                  placeholder="10"
                />
              </div>
              <div className="space-y-1.5">
                <Label>{locale === 'es' ? 'Fecha de entrega' : 'Delivery date'}</Label>
                <Input
                  type="date"
                  value={solicitudForm.fechaEntrega}
                  onChange={e => setSolicitudForm(prev => ({ ...prev, fechaEntrega: e.target.value }))}
                />
              </div>
            </div>

            {/* Notas */}
            <div className="space-y-1.5">
              <Label>{locale === 'es' ? 'Notas / Especificaciones' : 'Notes / Specifications'}</Label>
              <Textarea
                value={solicitudForm.notas}
                onChange={e => setSolicitudForm(prev => ({ ...prev, notas: e.target.value }))}
                placeholder={locale === 'es' ? 'Ej: Pastel de chocolate para 20 personas, entrega antes de las 3pm' : 'Ej: Chocolate cake for 20 people, deliver before 3pm'}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSolicitudDialog(false)}>
              {tt.cancelar}
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={enviarSolicitud}>
              <ShoppingCart className="size-4 mr-1.5" />
              {locale === 'es' ? 'Enviar Solicitud' : 'Send Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
