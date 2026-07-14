import { NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'

// PATCH /api/proveedores/[id]/productos/[productoId] - Actualizar producto
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; productoId: string }> }
) {
  try {
    const { productoId } = await params

    if (!isDatabaseAvailable()) {
      return NextResponse.json({ success: true, demo: true })
    }

    const body = await request.json()

    const data: Record<string, unknown> = {}
    if (body.nombre !== undefined) data.nombre = body.nombre
    if (body.nombreEn !== undefined) data.nombreEn = body.nombreEn
    if (body.descripcion !== undefined) data.descripcion = body.descripcion
    if (body.descripcionEn !== undefined) data.descripcionEn = body.descripcionEn
    if (body.categoria !== undefined) data.categoria = body.categoria
    if (body.unidad !== undefined) data.unidad = body.unidad
    if (body.precio !== undefined) data.precio = parseFloat(body.precio)
    if (body.precioMayoreo !== undefined) data.precioMayoreo = body.precioMayoreo ? parseFloat(body.precioMayoreo) : null
    if (body.cantidadMinima !== undefined) data.cantidadMinima = parseInt(body.cantidadMinima) || 1
    if (body.imagen !== undefined) data.imagen = body.imagen
    if (body.disponible !== undefined) data.disponible = body.disponible
    if (body.propiedadesIds !== undefined) data.propiedadesIds = body.propiedadesIds

    const producto = await db.productoProveedor.update({
      where: { id: productoId },
      data,
    })

    return NextResponse.json(producto)
  } catch (error) {
    console.error('Producto PATCH error:', error)
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}

// DELETE /api/proveedores/[id]/productos/[productoId] - Eliminar producto
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; productoId: string }> }
) {
  try {
    const { productoId } = await params

    if (!isDatabaseAvailable()) {
      return NextResponse.json({ success: true, demo: true })
    }

    await db.productoProveedor.delete({ where: { id: productoId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Producto DELETE error:', error)
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
  }
}
