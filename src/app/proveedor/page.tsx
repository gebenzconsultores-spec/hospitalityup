'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Package, Plus, Star, MapPin, Phone,
  Mail, LogOut, Hotel, ShoppingBag,
  TrendingUp, CheckCircle, XCircle, Clock,
  Edit, Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Toaster } from 'sonner'

interface Session {
  id: string
  nombre: string
  rol: string
  email: string
}

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

interface Pedido {
  id: string
  propiedadId: string
  cantidad: number
  unidad: string | null
  precioEstimado: number | null
  totalEstimado: number | null
  notas: string | null
  estado: string
  fechaSolicitud: string
  propiedad: { nombre: string; region: string }
  producto: { nombre: string } | null
}

const CATEGORIAS = [
  { value: 'materia_prima', label: '🥩 Materia Prima' },
  { value: 'bebida', label: '🍹 Bebidas' },
  { value: 'postre', label: '🍰 Postres' },
  { value: 'capacitacion', label: '🎓 Capacitación' },
  { value: 'equipo', label: '⚙️ Equipo' },
  { value: 'limpieza', label: '🧹 Limpieza' },
  { value: 'otro', label: '📦 Otro' },
]

function getEstadoColor(estado: string) {
  switch (estado) {
    case 'confirmado': return 'bg-emerald-100 text-emerald-700'
    case 'pendiente': return 'bg-amber-100 text-amber-700'
    case 'rechazado': return 'bg-red-100 text-red-700'
    case 'entregado': return 'bg-teal-100 text-teal-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

function getEstadoIcon(estado: string) {
  switch (estado) {
    case 'confirmado': return <CheckCircle className="size-4 text-emerald-600" />
    case 'pendiente': return <Clock className="size-4 text-amber-600" />
    case 'rechazado': return <XCircle className="size-4 text-red-600" />
    default: return <Clock className="size-4 text-gray-600" />
  }
}

export default function ProveedorPage() {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [currentView, setCurrentView] = useState<'dashboard' | 'productos' | 'pedidos'>('dashboard')
  const [productos, setProductos] = useState<Producto[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [showFormProducto, setShowFormProducto] = useState(false)
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null)

  const [formProducto, setFormProducto] = useState({
    nombre: '', nombreEn: '', descripcion: '',
    categoria: 'materia_prima', unidad: '',
    precio: '', precioMayoreo: '', cantidadMinima: '1',
  })

  useEffect(() => {
    const stored = localStorage.getItem('hospitalityup_session')
    if (!stored) { router.push('/login'); return }
    const parsed = JSON.parse(stored)
    if (parsed.rol !== 'proveedor') { router.push('/login'); return }
    setSession(parsed)
    fetchData(parsed.id)
  }, [router])

  const fetchData = async (proveedorId: string) => {
    setLoading(true)
    try {
      const [prodRes, pedRes] = await Promise.all([
        fetch(`/api/proveedores/productos?proveedorId=${proveedorId}`),
        fetch(`/api/pedidos?proveedorId=${proveedorId}`),
      ])
      const prodData = await prodRes.json()
      const pedData = await pedRes.json()
      setProductos(Array.isArray(prodData) ? prodData : [])
      setPedidos(Array.isArray(pedData) ? pedData : pedData.pedidos || [])
    } catch {
      toast.error('Error cargando datos')
    } finally {
      setLoading(false)
    }
  }

  const handleGuardarProducto = async () => {
    if (!session || !formProducto.nombre || !formProducto.precio) {
      toast.error('Nombre y precio son requeridos')
      return
    }
    try {
      const method = editingProducto ? 'PATCH' : 'POST'
      const body = editingProducto
        ? { id: editingProducto.id, ...formProducto, precio: parseFloat(formProducto.precio), precioMayoreo: formProducto.precioMayoreo ? parseFloat(formProducto.precioMayoreo) : null, cantidadMinima: parseInt(formProducto.cantidadMinima) }
        : { proveedorId: session.id, ...formProducto, precio: parseFloat(formProducto.precio), precioMayoreo: formProducto.precioMayoreo ? parseFloat(formProducto.precioMayoreo) : null, cantidadMinima: parseInt(formProducto.cantidadMinima) }

      const res = await fetch('/api/proveedores/productos', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Error al guardar')
        return
      }
      if (res.ok) {
        toast.success(editingProducto ? 'Producto actualizado' : 'Producto agregado')
        setShowFormProducto(false)
        setEditingProducto(null)
        resetForm()
        fetchData(session.id)
      }
    } catch {
      toast.error('Error al guardar producto')
    }
  }

  const handleEliminarProducto = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return
    try {
      await fetch(`/api/proveedores/productos?id=${id}`, { method: 'DELETE' })
      toast.success('Producto eliminado')
      if (session) fetchData(session.id)
    } catch {
      toast.error('Error al eliminar')
    }
  }

  const handleResponderPedido = async (pedidoId: string, estado: string) => {
    try {
      const res = await fetch('/api/pedidos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pedidoId, estado, fechaRespuesta: new Date().toISOString() }),
      })
      if (res.ok) {
        toast.success(estado === 'confirmado' ? 'Pedido confirmado' : 'Pedido rechazado')
        if (session) fetchData(session.id)
      }
    } catch {
      toast.error('Error al responder')
    }
  }

  const resetForm = () => {
    setFormProducto({ nombre: '', nombreEn: '', descripcion: '', categoria: 'materia_prima', unidad: '', precio: '', precioMayoreo: '', cantidadMinima: '1' })
  }

  const handleEditarProducto = (p: Producto) => {
    setEditingProducto(p)
    setFormProducto({
      nombre: p.nombre, nombreEn: p.nombreEn || '', descripcion: p.descripcion || '',
      categoria: p.categoria, unidad: p.unidad || '',
      precio: String(p.precio), precioMayoreo: p.precioMayoreo ? String(p.precioMayoreo) : '',
      cantidadMinima: String(p.cantidadMinima),
    })
    setShowFormProducto(true)
  }

  const pedidosPendientes = pedidos.filter(p => p.estado === 'pendiente').length

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster richColors position="top-right" />

      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-teal-600">
            <Package className="size-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm">HospitalityUP</h1>
            <p className="text-xs text-gray-500">Portal Proveedor</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700 hidden sm:block">{session.nombre}</span>
          <button
            onClick={() => { localStorage.removeItem('hospitalityup_session'); router.push('/login') }}
            className="text-gray-400 hover:text-gray-600"
          >
            <LogOut className="size-5" />
          </button>
        </div>
      </header>

      {/* Nav tabs */}
      <div className="bg-white border-b px-4">
        <div className="flex gap-1 max-w-4xl mx-auto">
          {[
            { key: 'dashboard', label: '📊 Dashboard' },
            { key: 'productos', label: '📦 Mi Catálogo' },
            { key: 'pedidos', label: `🛒 Pedidos${pedidosPendientes > 0 ? ` (${pedidosPendientes})` : ''}` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setCurrentView(tab.key as 'dashboard' | 'productos' | 'pedidos')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                currentView === tab.key
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Dashboard */}
        {currentView === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold">Bienvenido, {session.nombre}</h2>
              <p className="text-sm text-gray-500">Gestiona tu catálogo y pedidos</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border p-4 text-center">
                <div className="text-3xl font-bold text-teal-600">{productos.length}</div>
                <div className="text-xs text-gray-500 mt-1">Productos en catálogo</div>
              </div>
              <div className="bg-white rounded-xl border p-4 text-center">
                <div className="text-3xl font-bold text-amber-500">{pedidosPendientes}</div>
                <div className="text-xs text-gray-500 mt-1">Pedidos pendientes</div>
              </div>
              <div className="bg-white rounded-xl border p-4 text-center">
                <div className="text-3xl font-bold text-emerald-600">{pedidos.filter(p => p.estado === 'confirmado' || p.estado === 'entregado').length}</div>
                <div className="text-xs text-gray-500 mt-1">Pedidos confirmados</div>
              </div>
            </div>

            {pedidosPendientes > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                  <Clock className="size-4" />
                  Pedidos pendientes de respuesta
                </h3>
                <div className="space-y-3">
                  {pedidos.filter(p => p.estado === 'pendiente').map(pedido => (
                    <div key={pedido.id} className="bg-white rounded-lg border p-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-medium text-sm">{pedido.producto?.nombre || 'Producto'}</div>
                        <div className="text-xs text-gray-500">
                          {pedido.propiedad?.nombre} · {pedido.cantidad} {pedido.unidad || 'unidades'}
                          {pedido.totalEstimado && ` · $${pedido.totalEstimado.toFixed(2)}`}
                        </div>
                        {pedido.notas && <div className="text-xs text-gray-400 mt-0.5">{pedido.notas}</div>}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleResponderPedido(pedido.id, 'confirmado')}
                          className="bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-emerald-700"
                        >
                          Aceptar
                        </button>
                        <button
                          onClick={() => handleResponderPedido(pedido.id, 'rechazado')}
                          className="bg-red-100 text-red-600 text-xs px-3 py-1.5 rounded-lg hover:bg-red-200"
                        >
                          Rechazar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Productos */}
        {currentView === 'productos' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Mi Catálogo</h2>
              <button
                onClick={() => { setEditingProducto(null); resetForm(); setShowFormProducto(true) }}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-medium"
              >
                <Plus className="size-4" /> Agregar Producto
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-200" />)}
              </div>
            ) : productos.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border">
                <Package className="size-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No tienes productos aún</p>
                <p className="text-sm text-gray-400 mb-4">Agrega tu primer producto al catálogo</p>
                <button
                  onClick={() => { setEditingProducto(null); resetForm(); setShowFormProducto(true) }}
                  className="bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-teal-700"
                >
                  Agregar primer producto
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {productos.map(producto => (
                  <div key={producto.id} className="bg-white rounded-xl border p-4 flex items-center gap-4">
                    <div className="size-12 rounded-lg bg-teal-50 flex items-center justify-center text-xl shrink-0">
                      {CATEGORIAS.find(c => c.value === producto.categoria)?.label.split(' ')[0] || '📦'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{producto.nombre}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${producto.disponible ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {producto.disponible ? 'Disponible' : 'No disponible'}
                        </span>
                      </div>
                      {producto.descripcion && <p className="text-xs text-gray-500 mt-0.5 truncate">{producto.descripcion}</p>}
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="font-medium text-teal-700">${producto.precio.toFixed(2)}/{producto.unidad || 'unidad'}</span>
                        {producto.precioMayoreo && <span>Mayoreo: ${producto.precioMayoreo.toFixed(2)}</span>}
                        {producto.cantidadMinima > 1 && <span>Mín: {producto.cantidadMinima}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => handleEditarProducto(producto)} className="size-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                        <Edit className="size-4 text-gray-600" />
                      </button>
                      <button onClick={() => handleEliminarProducto(producto.id)} className="size-8 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-100">
                        <Trash2 className="size-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pedidos */}
        {currentView === 'pedidos' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Pedidos de Empresas</h2>
            {pedidos.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border">
                <ShoppingBag className="size-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay pedidos aún</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pedidos.map(pedido => (
                  <div key={pedido.id} className="bg-white rounded-xl border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {getEstadoIcon(pedido.estado)}
                        <div>
                          <div className="font-semibold text-sm">{pedido.producto?.nombre || 'Producto'}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {pedido.propiedad?.nombre} · {pedido.cantidad} {pedido.unidad || 'unidades'}
                            {pedido.totalEstimado && ` · $${pedido.totalEstimado.toFixed(2)}`}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {new Date(pedido.fechaSolicitud).toLocaleDateString('es-MX')}
                          </div>
                          {pedido.notas && <div className="text-xs text-gray-500 mt-1 italic">{pedido.notas}</div>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getEstadoColor(pedido.estado)}`}>
                          {pedido.estado}
                        </span>
                        {pedido.estado === 'pendiente' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleResponderPedido(pedido.id, 'confirmado')} className="bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-emerald-700">
                              Aceptar
                            </button>
                            <button onClick={() => handleResponderPedido(pedido.id, 'rechazado')} className="bg-red-100 text-red-600 text-xs px-3 py-1.5 rounded-lg hover:bg-red-200">
                              Rechazar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal Producto */}
      {showFormProducto && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold">{editingProducto ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <button onClick={() => { setShowFormProducto(false); setEditingProducto(null) }} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Nombre (ES) *</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm" value={formProducto.nombre} onChange={e => setFormProducto(p => ({ ...p, nombre: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Nombre (EN)</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm" value={formProducto.nombreEn} onChange={e => setFormProducto(p => ({ ...p, nombreEn: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Descripción</label>
                <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} value={formProducto.descripcion} onChange={e => setFormProducto(p => ({ ...p, descripcion: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Categoría</label>
                  <select className="w-full border rounded-lg px-3 py-2 text-sm" value={formProducto.categoria} onChange={e => setFormProducto(p => ({ ...p, categoria: e.target.value }))}>
                    {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Unidad</label>
                  <input placeholder="kg, lt, pza..." className="w-full border rounded-lg px-3 py-2 text-sm" value={formProducto.unidad} onChange={e => setFormProducto(p => ({ ...p, unidad: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Precio unitario *</label>
                  <input type="number" placeholder="0.00" className="w-full border rounded-lg px-3 py-2 text-sm" value={formProducto.precio} onChange={e => setFormProducto(p => ({ ...p, precio: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Precio mayoreo</label>
                  <input type="number" placeholder="0.00" className="w-full border rounded-lg px-3 py-2 text-sm" value={formProducto.precioMayoreo} onChange={e => setFormProducto(p => ({ ...p, precioMayoreo: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Cant. mínima</label>
                  <input type="number" min="1" className="w-full border rounded-lg px-3 py-2 text-sm" value={formProducto.cantidadMinima} onChange={e => setFormProducto(p => ({ ...p, cantidadMinima: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="p-4 border-t flex gap-3">
              <button onClick={() => { setShowFormProducto(false); setEditingProducto(null) }} className="flex-1 border text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={handleGuardarProducto} className="flex-1 bg-teal-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-teal-700">
                {editingProducto ? 'Actualizar' : 'Guardar Producto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}