import { NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const proveedorId = searchParams.get('proveedorId')
    const categoria = searchParams.get('categoria')
    const disponible = searchParams.get('disponible')

    if (!isDatabaseAvailable()) return NextResponse.json([])

    const where: Record<string, unknown> = {}
    if (proveedorId) where.proveedorId = proveedorId
    if (categoria) where.categoria = categoria
    if (disponible !== null && disponible !== undefined) where.disponible = disponible === 'true'

    const productos = await db!.productoProveedor.findMany({
      where,
      include: {
        Proveedor: { select: { id: true, nombre: true, tipo: true, region: true } }
      },
      orderBy: { nombre: 'asc' },
    })

    return NextResponse.json(productos)
  } catch (error) {
    console.error('Productos GET error:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    if (!isDatabaseAvailable()) return NextResponse.json({ success: true, demo: true })

    const body = await request.json()
    const { proveedorId, nombre, nombreEn, descripcion, descripcionEn, categoria, unidad, precio, precioMayoreo, cantidadMinima } = body

    if (!nombre || !precio) {
      return NextResponse.json({ error: 'nombre y precio son requeridos' }, { status: 400 })
    }
    if (!proveedorId) {
      return NextResponse.json({ error: 'proveedorId es requerido' }, { status: 400 })
    }

    const producto = await db!.productoProveedor.create({
      data: {
        id: crypto.randomUUID(),
        proveedorId,
        nombre,
        nombreEn: nombreEn || null,
        descripcion: descripcion || null,
        descripcionEn: descripcionEn || null,
        categoria: categoria || 'otro',
        unidad: unidad || null,
        precio: parseFloat(String(precio)),
        precioMayoreo: precioMayoreo ? parseFloat(String(precioMayoreo)) : null,
        cantidadMinima: cantidadMinima ? parseInt(String(cantidadMinima)) : 1,
        disponible: true,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(producto, { status: 201 })
  } catch (error) {
    console.error('Productos POST error:', error)
    return NextResponse.json({ error: `Error al crear producto: ${error}` }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    if (!isDatabaseAvailable()) return NextResponse.json({ success: true, demo: true })

    const body = await request.json()
    const { id, ...data } = body

    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

    const producto = await db!.productoProveedor.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    })

    return NextResponse.json(producto)
  } catch (error) {
    console.error('Productos PATCH error:', error)
    return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    if (!isDatabaseAvailable()) return NextResponse.json({ success: true, demo: true })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

    await db!.productoProveedor.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Productos DELETE error:', error)
    return NextResponse.json({ error: 'Error al eliminar producto' }, { status: 500 })
  }
}