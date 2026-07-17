'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Printer,
  MessageCircle,
  Utensils,
  Wine,
  Coffee,
  Cake,
  Search,
  ClipboardList,
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
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

interface Servicio {
  id: string
  nombre: string
  nombreEn: string | null
  descripcion: string | null
  categoria: string
  precioNormal: number
  disponible: boolean
}

interface ItemCarrito {
  servicio: Servicio
  cantidad: number
}

const categoriaIconos: Record<string, React.ElementType> = {
  platillo: Utensils,
  bebida: Wine,
  postre: Cake,
  otro: Coffee,
}

const categoriaLabels: Record<string, { es: string; en: string }> = {
  platillo: { es: 'Platillos', en: 'Dishes' },
  bebida: { es: 'Bebidas', en: 'Drinks' },
  postre: { es: 'Postres', en: 'Desserts' },
  tour: { es: 'Tours', en: 'Tours' },
  masaje: { es: 'Masajes', en: 'Massages' },
  habitacion: { es: 'Habitaciones', en: 'Rooms' },
  experiencia: { es: 'Experiencias', en: 'Experiences' },
  paquete: { es: 'Paquetes', en: 'Packages' },
  otro: { es: 'Otros', en: 'Others' },
}

export function EmpleadoServicios() {
  const { locale, userPropiedadId, userEmpleadoId, userName, userPropiedadNombre } = useAppStore()
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [loading, setLoading] = useState(true)
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos')
  const [search, setSearch] = useState('')
  const [carrito, setCarrito] = useState<ItemCarrito[]>([])
  const [numMesa, setNumMesa] = useState('')
  const [nombreCliente, setNombreCliente] = useState('')
  const [showComanda, setShowComanda] = useState(false)
  const [comandaGenerada, setComandaGenerada] = useState<string | null>(null)

  const fetchServicios = useCallback(async () => {
    if (!userPropiedadId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('propiedadId', userPropiedadId)
      params.set('disponible', 'true')
      const res = await fetch(`/api/servicios?${params}`)
      const data = await res.json()
      const serviciosData = Array.isArray(data) ? data : (data.servicios || [])
      setServicios(serviciosData.filter((s: Servicio) => s.disponible))
    } catch {
      setServicios([])
    } finally {
      setLoading(false)
    }
  }, [userPropiedadId])

  useEffect(() => {
    fetchServicios()
  }, [fetchServicios])

  const serviciosFiltrados = servicios.filter(s => {
    if (categoriaFiltro !== 'todos' && s.categoria !== categoriaFiltro) return false
    if (search) {
      const q = search.toLowerCase()
      return s.nombre.toLowerCase().includes(q) || (s.descripcion?.toLowerCase().includes(q) || false)
    }
    return true
  })

  const categorias = Array.from(new Set(servicios.map(s => s.categoria)))

  const agregarAlCarrito = (servicio: Servicio) => {
    setCarrito(prev => {
      const existing = prev.find(item => item.servicio.id === servicio.id)
      if (existing) {
        return prev.map(item =>
          item.servicio.id === servicio.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      }
      return [...prev, { servicio, cantidad: 1 }]
    })
  }

  const quitarDelCarrito = (servicioId: string) => {
    setCarrito(prev => prev.filter(item => item.servicio.id !== servicioId))
  }

  const cambiarCantidad = (servicioId: string, delta: number) => {
    setCarrito(prev => {
      return prev.map(item => {
        if (item.servicio.id === servicioId) {
          const nuevaCantidad = item.cantidad + delta
          if (nuevaCantidad <= 0) return item // No borrar aquí, usar botón de basura
          return { ...item, cantidad: nuevaCantidad }
        }
        return item
      }).filter(item => item.cantidad > 0)
    })
  }

  const total = carrito.reduce((sum, item) => sum + (item.servicio.precioNormal * item.cantidad), 0)
  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0)

  const registrarVenta = async () => {
    if (carrito.length === 0) {
      toast.error(locale === 'es' ? 'Agrega productos al carrito' : 'Add products to cart')
      return
    }
    if (!numMesa) {
      toast.error(locale === 'es' ? 'Ingresa el número de mesa' : 'Enter table number')
      return
    }
    if (!userEmpleadoId || !userPropiedadId) {
      toast.error(locale === 'es' ? 'Error: datos de usuario incompletos' : 'Error: incomplete user data')
      return
    }

    try {
      // Registrar cada item como una venta
      for (const item of carrito) {
        await fetch('/api/ventas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            empleadoId: userEmpleadoId,
            propiedadId: userPropiedadId,
            nombreServicio: `${item.servicio.nombre} (Mesa ${numMesa})`,
            cantidad: item.cantidad,
            precioUnitario: item.servicio.precioNormal,
            montoTotal: item.servicio.precioNormal * item.cantidad,
            esUpselling: false,
            montoUpselling: 0,
            fuenteNPS: 'app',
            categoriaServicio: item.servicio.categoria,
          }),
        })
      }

      toast.success(locale === 'es' ? `¡Venta registrada! Total: $${total}` : `Sale registered! Total: $${total}`)

      // Generar comanda
      generarComanda()

      // Limpiar carrito
      setCarrito([])
      setNumMesa('')
      setNombreCliente('')
    } catch {
      toast.error(locale === 'es' ? 'Error al registrar venta' : 'Error registering sale')
    }
  }

  const generarComanda = () => {
    const fecha = new Date().toLocaleString(locale === 'es' ? 'es-MX' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    let comanda = `🧾 *COMANDA - ${userPropiedadNombre || 'Sucursal'}*\n`
    comanda += `📅 ${fecha}\n`
    comanda += `👤 ${locale === 'es' ? 'Mesero' : 'Server'}: ${userName || ''}\n`
    comanda += `🍽️ ${locale === 'es' ? 'Mesa' : 'Table'}: ${numMesa}\n`
    if (nombreCliente) {
      comanda += `🙋 ${locale === 'es' ? 'Cliente' : 'Customer'}: ${nombreCliente}\n`
    }
    comanda += `${'─'.repeat(30)}\n\n`

    comanda += `*${locale === 'es' ? 'PEDIDO' : 'ORDER'}:*\n\n`
    carrito.forEach((item, i) => {
      comanda += `${i + 1}. ${item.cantidad}x ${item.servicio.nombre}\n`
      comanda += `   $${item.servicio.precioNormal} c/u = $${(item.servicio.precioNormal * item.cantidad).toFixed(2)}\n`
    })

    comanda += `\n${'─'.repeat(30)}\n`
    comanda += `*${locale === 'es' ? 'TOTAL' : 'TOTAL'}: $${total.toFixed(2)}*\n`
    comanda += `${'─'.repeat(30)}\n\n`
    comanda += `¡Gracias por su preferencia! 🙏`

    setComandaGenerada(comanda)
    setShowComanda(true)
  }

  const imprimirComanda = () => {
    if (!comandaGenerada) return
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Comanda - Mesa ${numMesa}</title>
            <style>
              body { font-family: monospace; padding: 20px; max-width: 400px; margin: 0 auto; }
              h1 { font-size: 18px; text-align: center; }
              .header { text-align: center; margin-bottom: 15px; }
              .items { margin: 15px 0; }
              .item { margin: 5px 0; }
              .total { font-weight: bold; font-size: 16px; text-align: right; margin-top: 15px; }
              .separator { border-top: 1px dashed #000; margin: 10px 0; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${userPropiedadNombre || 'Sucursal'}</h1>
              <p>📅 ${new Date().toLocaleString(locale === 'es' ? 'es-MX' : 'en-US')}</p>
              <p>👤 ${locale === 'es' ? 'Mesero' : 'Server'}: ${userName || ''}</p>
              <p>🍽️ ${locale === 'es' ? 'Mesa' : 'Table'}: ${numMesa}</p>
              ${nombreCliente ? `<p>🙋 ${locale === 'es' ? 'Cliente' : 'Customer'}: ${nombreCliente}</p>` : ''}
            </div>
            <div class="separator"></div>
            <div class="items">
              ${carrito.map((item, i) => `
                <div class="item">
                  <strong>${i + 1}. ${item.cantidad}x ${item.servicio.nombre}</strong><br>
                  <span>$${item.servicio.precioNormal} c/u = $${(item.servicio.precioNormal * item.cantidad).toFixed(2)}</span>
                </div>
              `).join('')}
            </div>
            <div class="separator"></div>
            <div class="total">TOTAL: $${total.toFixed(2)}</div>
            <div class="footer">¡Gracias por su preferencia! 🙏</div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const enviarWhatsApp = () => {
    if (!comandaGenerada) return
    const texto = encodeURIComponent(comandaGenerada)
    window.open(`https://wa.me/?text=${texto}`, '_blank')
  }

  if (!userPropiedadId) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <ShoppingCart className="size-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground">
            {locale === 'es' ? 'No tienes una sucursal asignada' : 'No branch assigned'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Utensils className="size-6 text-teal-600" />
          {locale === 'es' ? 'Menú y Servicios' : 'Menu and Services'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {locale === 'es' ? 'Selecciona productos y genera la venta' : 'Select products and generate the sale'}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Menú */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={locale === 'es' ? 'Buscar producto...' : 'Search product...'}
                className="pl-9"
              />
            </div>
            <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">{locale === 'es' ? 'Todas' : 'All'}</SelectItem>
                {categorias.map(c => (
                  <SelectItem key={c} value={c}>
                    {categoriaLabels[c]?.[locale] || c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Grid de productos */}
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
            </div>
          ) : serviciosFiltrados.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Utensils className="size-12 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-muted-foreground">
                  {locale === 'es' ? 'No hay productos disponibles' : 'No products available'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {serviciosFiltrados.map(servicio => {
                const Icon = categoriaIconos[servicio.categoria] || Coffee
                return (
                  <Card
                    key={servicio.id}
                    className="cursor-pointer hover:shadow-md hover:border-teal-300 transition-all"
                    onClick={() => agregarAlCarrito(servicio)}
                  >
                    <CardContent className="p-3">
                      <div className="size-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center mb-2">
                        <Icon className="size-4" />
                      </div>
                      <p className="font-medium text-sm line-clamp-2">{servicio.nombre}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{servicio.descripcion}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-teal-700">${servicio.precioNormal}</span>
                        <Plus className="size-4 text-teal-600" />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Carrito */}
        <div className="space-y-4">
          <Card className="sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2">
                  <ShoppingCart className="size-5 text-teal-600" />
                  {locale === 'es' ? 'Pedido' : 'Order'}
                </span>
                {totalItems > 0 && (
                  <Badge variant="secondary">{totalItems} {locale === 'es' ? 'items' : 'items'}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Mesa y cliente */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">{locale === 'es' ? 'Mesa' : 'Table'} *</Label>
                  <Input
                    value={numMesa}
                    onChange={e => setNumMesa(e.target.value)}
                    placeholder="5"
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">{locale === 'es' ? 'Cliente' : 'Customer'}</Label>
                  <Input
                    value={nombreCliente}
                    onChange={e => setNombreCliente(e.target.value)}
                    placeholder={locale === 'es' ? 'Opcional' : 'Optional'}
                    className="h-8"
                  />
                </div>
              </div>

              <Separator />

              {/* Items del carrito */}
              {carrito.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {locale === 'es' ? 'Selecciona productos del menú' : 'Select products from menu'}
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {carrito.map(item => (
                    <div key={item.servicio.id} className="flex items-center gap-2 text-sm">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs line-clamp-1">{item.servicio.nombre}</p>
                        <p className="text-[10px] text-muted-foreground">${item.servicio.precioNormal} c/u</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          size="icon"
                          variant="outline"
                          className="size-6"
                          onClick={() => cambiarCantidad(item.servicio.id, -1)}
                        >
                          <Minus className="size-3" />
                        </Button>
                        <span className="font-medium w-6 text-center text-xs">{item.cantidad}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="size-6"
                          onClick={() => cambiarCantidad(item.servicio.id, 1)}
                        >
                          <Plus className="size-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-6 text-destructive"
                          onClick={() => quitarDelCarrito(item.servicio.id)}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {carrito.length > 0 && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between font-bold">
                    <span>{locale === 'es' ? 'Total' : 'Total'}</span>
                    <span className="text-teal-700 text-lg">${total.toFixed(2)}</span>
                  </div>
                  <Button
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white gap-2"
                    onClick={registrarVenta}
                  >
                    <ClipboardList className="size-4" />
                    {locale === 'es' ? 'Registrar Venta' : 'Register Sale'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog: Comanda generada */}
      <Dialog open={showComanda} onOpenChange={setShowComanda}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="size-5 text-teal-600" />
              {locale === 'es' ? 'Comanda Generada' : 'Order Generated'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="bg-muted p-3 rounded-lg font-mono text-xs whitespace-pre-wrap max-h-60 overflow-y-auto">
              {comandaGenerada}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={imprimirComanda}
              >
                <Printer className="size-4" />
                {locale === 'es' ? 'Imprimir' : 'Print'}
              </Button>
              <Button
                className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white"
                onClick={enviarWhatsApp}
              >
                <MessageCircle className="size-4" />
                WhatsApp
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowComanda(false)}>
              {locale === 'es' ? 'Cerrar' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
