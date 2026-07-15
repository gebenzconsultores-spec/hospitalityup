import { NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'

// GET /api/solicitudes-pedido - Listar solicitudes de pedido
export async function GET(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json([])
    }

    const { searchParams } = new URL(request.url)
    const propiedadId = searchParams.get('propiedadId')
    const proveedorId = searchParams.get('proveedorId')
    const estado = searchParams.get('estado')

    const where: Record<string, unknown> = {}
    if (propiedadId) where.propiedadId = propiedadId
    if (proveedorId) where.proveedorId = proveedorId
    if (estado) where.estado = estado

    const solicitudes = await db.solicitudPedido.findMany({
      where,
      include: {
        propiedad: {
          select: { id: true, nombre: true, region: true, tipo: true },
        },
        proveedor: {
          select: { id: true, nombre: true, tipo: true, contactoEmail: true, contactoTelefono: true },
        },
        producto: {
          select: { id: true, nombre: true, categoria: true, unidad: true, precio: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(solicitudes)
  } catch (error) {
    console.error('Solicitudes GET error:', error)
    return NextResponse.json([])
  }
}

// POST /api/solicitudes-pedido - Crear solicitud de pedido
export async function POST(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json({ success: true, demo: true }, { status: 201 })
    }

    const body = await request.json()

    // Calcular total estimado
    const cantidad = parseInt(body.cantidad) || 1
    const precioEstimado = body.precioEstimado ? parseFloat(body.precioEstimado) : null
    const totalEstimado = precioEstimado ? cantidad * precioEstimado : null

    const solicitud = await db.solicitudPedido.create({
      data: {
        propiedadId: body.propiedadId,
        solicitadoPor: body.solicitadoPor || null,
        proveedorId: body.proveedorId,
        productoId: body.productoId || null,
        cantidad,
        unidad: body.unidad || null,
        precioEstimado,
        totalEstimado,
        notas: body.notas || null,
        estado: 'pendiente',
        fechaEntrega: body.fechaEntrega ? new Date(body.fechaEntrega) : null,
      },
      include: {
        propiedad: { select: { id: true, nombre: true } },
        proveedor: { select: { id: true, nombre: true } },
        producto: { select: { id: true, nombre: true } },
      },
    })

    // Crear notificación
    try {
      await db.notificacion.create({
        data: {
          tipo: 'solicitud_pedido',
          titulo: 'Nueva solicitud de pedido',
          mensaje: `${solicitud.propiedad.nombre} solicitó ${cantidad} ${solicitud.unidad || 'piezas'} a ${solicitud.proveedor.nombre}`,
          leida: false,
          propiedadId: body.propiedadId,
          prioridad: 'normal',
        },
      })
    } catch {}

    return NextResponse.json(solicitud, { status: 201 })
  } catch (error) {
    console.error('Solicitud POST error:', error)
    return NextResponse.json({ error: 'Error al crear solicitud' }, { status: 500 })
  }
}
