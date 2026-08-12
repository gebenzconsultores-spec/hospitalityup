import { NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const proveedorId = searchParams.get('proveedorId')
    const propiedadId = searchParams.get('propiedadId')
    const estado = searchParams.get('estado')

    if (!isDatabaseAvailable()) return NextResponse.json([])

    const where: Record<string, unknown> = {}
    if (proveedorId) where.proveedorId = proveedorId
    if (propiedadId) where.propiedadId = propiedadId
    if (estado) where.estado = estado

    const pedidos = await db!.solicitudPedido.findMany({
      where,
      include: {
        propiedad: { select: { nombre: true, region: true } },
        producto: { select: { nombre: true, categoria: true } },
        proveedor: { select: { nombre: true } },
      },
      orderBy: { fechaSolicitud: 'desc' },
    })

    return NextResponse.json(pedidos)
  } catch (error) {
    console.error('Pedidos GET error:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    if (!isDatabaseAvailable()) return NextResponse.json({ success: true, demo: true })

    const body = await request.json()
    const { propiedadId, proveedorId, productoId, cantidad, unidad, precioEstimado, totalEstimado, notas } = body

    if (!propiedadId || !proveedorId) {
      return NextResponse.json({ error: 'propiedadId y proveedorId son requeridos' }, { status: 400 })
    }

    const pedido = await db!.solicitudPedido.create({
      data: {
        id: crypto.randomUUID(),
        propiedadId,
        proveedorId,
        productoId: productoId || null,
        cantidad: cantidad || 1,
        unidad: unidad || null,
        precioEstimado: precioEstimado || null,
        totalEstimado: totalEstimado || null,
        notas: notas || null,
        estado: 'pendiente',
        updatedAt: new Date(),
      },
      include: {
        propiedad: { select: { nombre: true, region: true } },
        producto: { select: { nombre: true } },
      },
    })

    return NextResponse.json(pedido, { status: 201 })
  } catch (error) {
    console.error('Pedidos POST error:', error)
    return NextResponse.json({ error: 'Error al crear pedido' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    if (!isDatabaseAvailable()) return NextResponse.json({ success: true, demo: true })

    const body = await request.json()
    const { id, estado, fechaRespuesta, respuestaProveedor, fechaEntrega } = body

    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

    const pedido = await db!.solicitudPedido.update({
      where: { id },
      data: {
        estado,
        fechaRespuesta: fechaRespuesta ? new Date(fechaRespuesta) : undefined,
        respuestaProveedor: respuestaProveedor || undefined,
        fechaEntrega: fechaEntrega ? new Date(fechaEntrega) : undefined,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(pedido)
  } catch (error) {
    console.error('Pedidos PATCH error:', error)
    return NextResponse.json({ error: 'Error al actualizar pedido' }, { status: 500 })
  }
}