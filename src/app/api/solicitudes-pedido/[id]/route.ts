import { NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'

// PATCH /api/solicitudes-pedido/[id] - Actualizar estado de solicitud
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!isDatabaseAvailable()) {
      return NextResponse.json({ success: true, demo: true })
    }

    const body = await request.json()

    const data: Record<string, unknown> = {}
    if (body.estado !== undefined) {
      data.estado = body.estado
      if (body.estado === 'cotizada' || body.estado === 'rechazada') {
        data.fechaRespuesta = new Date()
      }
      if (body.estado === 'entregada') {
        data.fechaEntrega = new Date()
      }
    }
    if (body.respuestaProveedor !== undefined) data.respuestaProveedor = body.respuestaProveedor
    if (body.precioEstimado !== undefined) {
      data.precioEstimado = parseFloat(body.precioEstimado)
      // Recalcular total
      const solicitud = await db.solicitudPedido.findUnique({ where: { id } })
      if (solicitud) {
        data.totalEstimado = solicitud.cantidad * parseFloat(body.precioEstimado)
      }
    }
    if (body.notas !== undefined) data.notas = body.notas
    if (body.fechaEntrega !== undefined) data.fechaEntrega = body.fechaEntrega ? new Date(body.fechaEntrega) : null

    const solicitud = await db.solicitudPedido.update({
      where: { id },
      data,
      include: {
        propiedad: { select: { id: true, nombre: true } },
        proveedor: { select: { id: true, nombre: true } },
        producto: { select: { id: true, nombre: true } },
      },
    })

    return NextResponse.json(solicitud)
  } catch (error) {
    console.error('Solicitud PATCH error:', error)
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}

// DELETE /api/solicitudes-pedido/[id] - Eliminar/cancelar solicitud
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!isDatabaseAvailable()) {
      return NextResponse.json({ success: true, demo: true })
    }

    await db.solicitudPedido.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Solicitud DELETE error:', error)
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
  }
}
