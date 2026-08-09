'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ShoppingCart, Star, Send, CheckCircle, Minus, Plus, Trash2, Hotel } from 'lucide-react'
import { toast } from 'sonner'
import { Toaster } from 'sonner'

interface Servicio {
  id: string
  nombre: string
  nombreEn: string | null
  descripcion: string | null
  categoria: string
  esUpselling: boolean
  precioNormal: number
  precioUpselling: number | null
  objetivoUpselling: string | null
  disponible: boolean
  imagen: string | null
}

interface Empleado {
  id: string
  empleadoId: string
  nombre: string
  posicion: string
}

interface ItemCarrito {
  servicio: Servicio
  cantidad: number
  esUpselling: boolean
  precioFinal: number
}

const categorias = [
  { key: 'todos', label: 'Todo' },
  { key: 'platillo', label: '🍽️ Platillos' },
  { key: 'bebida', label: '🍹 Bebidas' },
  { key: 'tour', label: '🗺️ Tours' },
  { key: 'masaje', label: '💆 Masajes' },
  { key: 'habitacion', label: '🛏️ Habitaciones' },
  { key: 'experiencia', label: '✨ Experiencias' },
  { key: 'paquete', label: '📦 Paquetes' },
]

export default function MenuClientePage() {
  const params = useParams()
  const propiedadId = params.propiedadId as string

  const [propiedad, setPropiedad] = useState<{ nombre: string; tipo: string } | null>(null)
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [carrito, setCarrito] = useState<ItemCarrito[]>([])
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos')
  const [loading, setLoading] = useState(true)
  const [showCarrito, setShowCarrito] = useState(false)
  const [showCalificacion, setShowCalificacion] = useState(false)
  const [pedidoEnviado, setPedidoEnviado] = useState(false)
  const [empleadoId, setEmpleadoId] = useState('')
  const [calificacion, setCalificacion] = useState(0)
  const [comentario, setComentario] = useState('')
  const [mesa, setMesa] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [nombreCliente, setNombreCliente] = useState('')

  useEffect(() => {
    Promise.all([
      fetch(`/api/propiedades`).then(r => r.json()),
      fetch(`/api/servicios?propiedadId=${propiedadId}&disponible=true`).then(r => r.json()),
      fetch(`/api/empleados?propiedadId=${propiedadId}`).then(r => r.json()),
    ]).then(([props, servs, emps]) => {
      const prop = Array.isArray(props) ? props.find((p: { id: string; nombre: string; tipo: string }) => p.id === propiedadId) : null
      setPropiedad(prop || { nombre: 'HospitalityUP', tipo: 'hotel' })
      setServicios(Array.isArray(servs) ? servs.filter((s: Servicio) => s.disponible) : [])
      setEmpleados(Array.isArray(emps) ? emps : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [propiedadId])

  const agregarAlCarrito = (servicio: Servicio) => {
    const esUpselling = servicio.esUpselling
    const precioFinal = esUpselling ? (servicio.precioUpselling || servicio.precioNormal) : servicio.precioNormal
    setCarrito(prev => {
      const existing = prev.find(i => i.servicio.id === servicio.id)
      if (existing) {
        return prev.map(i => i.servicio.id === servicio.id ? { ...i, cantidad: i.cantidad + 1 } : i)
      }
      return [...prev, { servicio, cantidad: 1, esUpselling, precioFinal }]
    })
    toast.success(`${servicio.nombre} agregado`, { duration: 1500 })
  }

  const cambiarCantidad = (servicioId: string, delta: number) => {
    setCarrito(prev => {
      const updated = prev.map(i => i.servicio.id === servicioId ? { ...i, cantidad: i.cantidad + delta } : i)
      return updated.filter(i => i.cantidad > 0)
    })
  }

  const totalCarrito = carrito.reduce((s, i) => s + i.precioFinal * i.cantidad, 0)
  const totalItems = carrito.reduce((s, i) => s + i.cantidad, 0)

  const serviciosFiltrados = categoriaFiltro === 'todos'
    ? servicios
    : servicios.filter(s => s.categoria === categoriaFiltro)

  const enviarPedido = async () => {
    if (carrito.length === 0) { toast.error('Agrega productos al carrito'); return }
    setEnviando(true)
    try {
      for (const item of carrito) {
        await fetch('/api/ventas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            empleadoId: empleadoId || empleados[0]?.id,
            propiedadId,
            nombreServicio: item.servicio.nombre,
            cantidad: item.cantidad,
            precioUnitario: item.precioFinal,
            montoTotal: item.precioFinal * item.cantidad,
            esUpselling: item.esUpselling,
            montoUpselling: item.esUpselling ? (item.precioFinal - item.servicio.precioNormal) * item.cantidad : 0,
            calificacionNPS: null,
            comentario: mesa ? `Mesa: ${mesa} | Cliente: ${nombreCliente}` : nombreCliente,
            fuenteNPS: 'qr',
            categoriaServicio: item.servicio.categoria,
          }),
        })
      }
      setShowCarrito(false)
      setShowCalificacion(true)
    } catch {
      toast.error('Error al enviar pedido')
    } finally {
      setEnviando(false)
    }
  }

  const enviarCalificacion = async () => {
    if (calificacion === 0) { toast.error('Selecciona una calificación'); return }
    try {
      const empId = empleadoId || empleados[0]?.id
      if (empId) {
        await fetch('/api/ventas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            empleadoId: empId,
            propiedadId,
            nombreServicio: 'Calificación de servicio',
            cantidad: 1,
            precioUnitario: 0,
            montoTotal: 0,
            esUpselling: false,
            montoUpselling: 0,
            calificacionNPS: calificacion,
            comentario: comentario || null,
            fuenteNPS: 'qr',
            categoriaServicio: 'servicio',
          }),
        })
      }
      setPedidoEnviado(true)
      setShowCalificacion(false)
    } catch {
      setPedidoEnviado(true)
      setShowCalificacion(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-950 to-emerald-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (pedidoEnviado) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-teal-950 to-emerald-900 p-6 text-center">
        <Toaster richColors position="top-center" />
        <CheckCircle className="size-20 text-emerald-400 mb-4" />
        <h1 className="text-3xl font-bold text-white mb-2">¡Pedido Enviado!</h1>
        <p className="text-teal-200 mb-2">Tu pedido ha sido recibido</p>
        {mesa && <p className="text-teal-300 text-sm">Mesa: {mesa}</p>}
        <p className="text-teal-300 text-sm mb-6">En breve te atenderemos</p>
        <div className="bg-white/10 rounded-xl p-4 w-full max-w-sm">
          <h3 className="text-white font-semibold mb-3">Tu pedido:</h3>
          {carrito.map(item => (
            <div key={item.servicio.id} className="flex justify-between text-teal-200 text-sm mb-1">
              <span>{item.cantidad}x {item.servicio.nombre}</span>
              <span>${(item.precioFinal * item.cantidad).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-white/20 mt-2 pt-2 flex justify-between text-white font-bold">
            <span>Total</span>
            <span>${totalCarrito.toFixed(2)}</span>
          </div>
        </div>
        <button
          onClick={() => { setCarrito([]); setPedidoEnviado(false); setCalificacion(0); setComentario('') }}
          className="mt-6 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-xl"
        >
          Hacer otro pedido
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster richColors position="top-center" />

      {/* Header */}
      <div className="bg-gradient-to-r from-teal-800 to-emerald-700 text-white px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <Hotel className="size-6" />
            <div>
              <h1 className="font-bold text-lg leading-tight">{propiedad?.nombre}</h1>
              <p className="text-teal-200 text-xs">Menú Digital</p>
            </div>
          </div>
          <button
            onClick={() => setShowCarrito(true)}
            className="relative bg-white/20 hover:bg-white/30 rounded-xl p-3 transition-colors"
          >
            <ShoppingCart className="size-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full size-5 flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Mesa y nombre */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Número de mesa (opcional)</label>
            <input
              type="text"
              placeholder="Ej: Mesa 5"
              value={mesa}
              onChange={e => setMesa(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Tu nombre (opcional)</label>
            <input
              type="text"
              placeholder="Ej: Juan"
              value={nombreCliente}
              onChange={e => setNombreCliente(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Categorías */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categorias.map(cat => (
            <button
              key={cat.key}
              onClick={() => setCategoriaFiltro(cat.key)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                categoriaFiltro === cat.key
                  ? 'bg-teal-600 text-white'
                  : 'bg-white text-gray-600 border hover:bg-gray-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Servicios */}
        <div className="space-y-3">
          {serviciosFiltrados.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <ShoppingCart className="size-10 mx-auto mb-2 opacity-30" />
              <p>No hay productos disponibles</p>
            </div>
          ) : serviciosFiltrados.map(servicio => {
            const precioFinal = servicio.esUpselling ? (servicio.precioUpselling || servicio.precioNormal) : servicio.precioNormal
            const enCarrito = carrito.find(i => i.servicio.id === servicio.id)
            return (
              <div key={servicio.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-4 flex gap-3">
                  {/* Imagen placeholder */}
                  <div className="size-20 rounded-lg bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center shrink-0 text-2xl">
                    {servicio.categoria === 'platillo' ? '🍽️' :
                     servicio.categoria === 'bebida' ? '🍹' :
                     servicio.categoria === 'tour' ? '🗺️' :
                     servicio.categoria === 'masaje' ? '💆' :
                     servicio.categoria === 'habitacion' ? '🛏️' :
                     servicio.categoria === 'experiencia' ? '✨' :
                     servicio.categoria === 'paquete' ? '📦' : '🛍️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-sm">{servicio.nombre}</h3>
                        {servicio.descripcion && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{servicio.descripcion}</p>
                        )}
                      </div>
                      {servicio.esUpselling && (
                        <span className="shrink-0 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-medium">⭐ Premium</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div>
                        {servicio.esUpselling && servicio.precioUpselling ? (
                          <div>
                            <span className="text-xs text-gray-400 line-through">${servicio.precioNormal.toFixed(2)}</span>
                            <span className="text-base font-bold text-emerald-600 ml-1">${servicio.precioUpselling.toFixed(2)}</span>
                          </div>
                        ) : (
                          <span className="text-base font-bold text-gray-800">${servicio.precioNormal.toFixed(2)}</span>
                        )}
                      </div>
                      {enCarrito ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => cambiarCantidad(servicio.id, -1)} className="size-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                            <Minus className="size-4" />
                          </button>
                          <span className="font-bold text-sm w-4 text-center">{enCarrito.cantidad}</span>
                          <button onClick={() => cambiarCantidad(servicio.id, 1)} className="size-8 rounded-full bg-teal-600 text-white flex items-center justify-center hover:bg-teal-700">
                            <Plus className="size-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => agregarAlCarrito(servicio)}
                          className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                        >
                          Agregar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Botón flotante carrito */}
      {carrito.length > 0 && !showCarrito && (
        <div className="fixed bottom-6 left-0 right-0 px-4 z-20">
          <button
            onClick={() => setShowCarrito(true)}
            className="w-full max-w-2xl mx-auto flex items-center justify-between bg-teal-700 hover:bg-teal-600 text-white font-semibold px-5 py-4 rounded-2xl shadow-xl transition-colors"
          >
            <span className="bg-white/20 rounded-lg px-2 py-0.5 text-sm">{totalItems} items</span>
            <span>Ver pedido</span>
            <span className="font-bold">${totalCarrito.toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* Modal Carrito */}
      {showCarrito && (
        <div className="fixed inset-0 bg-black/50 z-30 flex items-end">
          <div className="bg-white w-full max-w-2xl mx-auto rounded-t-2xl max-h-[85vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
              <h2 className="font-bold text-lg">Tu Pedido</h2>
              <button onClick={() => setShowCarrito(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="p-4 space-y-3">
              {carrito.map(item => (
                <div key={item.servicio.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.servicio.nombre}</div>
                    <div className="text-xs text-gray-500">${item.precioFinal.toFixed(2)} c/u</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => cambiarCantidad(item.servicio.id, -1)} className="size-7 rounded-full bg-gray-100 flex items-center justify-center">
                      <Minus className="size-3" />
                    </button>
                    <span className="font-bold text-sm w-4 text-center">{item.cantidad}</span>
                    <button onClick={() => cambiarCantidad(item.servicio.id, 1)} className="size-7 rounded-full bg-teal-600 text-white flex items-center justify-center">
                      <Plus className="size-3" />
                    </button>
                    <button onClick={() => setCarrito(prev => prev.filter(i => i.servicio.id !== item.servicio.id))} className="size-7 rounded-full bg-red-100 text-red-500 flex items-center justify-center ml-1">
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                  <div className="font-bold text-sm w-16 text-right">${(item.precioFinal * item.cantidad).toFixed(2)}</div>
                </div>
              ))}

              {/* Seleccionar empleado */}
              {empleados.length > 0 && (
                <div className="pt-3 border-t">
                  <label className="text-xs font-medium text-gray-500 mb-1 block">¿Quién te está atendiendo? (opcional)</label>
                  <select
                    value={empleadoId}
                    onChange={e => setEmpleadoId(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Seleccionar empleado...</option>
                    {empleados.map(e => (
                      <option key={e.id} value={e.id}>{e.nombre} - {e.posicion}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-teal-700">${totalCarrito.toFixed(2)}</span>
              </div>

              <button
                onClick={enviarPedido}
                disabled={enviando}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                {enviando ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <><Send className="size-5" /> Enviar Pedido</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Calificación */}
      {showCalificacion && (
        <div className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4">
            <div className="text-center">
              <CheckCircle className="size-12 text-emerald-500 mx-auto mb-2" />
              <h2 className="font-bold text-xl">¡Pedido enviado!</h2>
              <p className="text-gray-500 text-sm">¿Cómo calificarías el servicio?</p>
            </div>

            <div className="flex justify-center gap-2">
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <button
                  key={n}
                  onClick={() => setCalificacion(n)}
                  className={`size-8 rounded-full text-sm font-bold transition-colors ${
                    calificacion === n
                      ? n >= 9 ? 'bg-emerald-500 text-white' : n >= 7 ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            {calificacion > 0 && (
              <div className="text-center text-sm font-medium">
                {calificacion >= 9 ? '😊 ¡Excelente!' : calificacion >= 7 ? '🙂 Bueno' : '😟 Puede mejorar'}
              </div>
            )}

            <textarea
              placeholder="Comentario opcional..."
              value={comentario}
              onChange={e => setComentario(e.target.value)}
              className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              rows={2}
            />

            <div className="flex gap-2">
              <button
                onClick={() => { setPedidoEnviado(true); setShowCalificacion(false) }}
                className="flex-1 border text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50"
              >
                Omitir
              </button>
              <button
                onClick={enviarCalificacion}
                className="flex-1 bg-teal-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-teal-700 flex items-center justify-center gap-1"
              >
                <Star className="size-4" /> Calificar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}