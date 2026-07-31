import { NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const proveedorId = searchParams.get('proveedorId')
    const categoria = searchParams.get('categoria')
    const disponible = searchParams.get('disponible')

    if (!isDatabaseAvailable()) {
      return NextResponse.json([])
    }

    const where: Record<string, unknown> = {}
    if (proveedorId) where.proveedorId = proveedorId
    if (categoria) where.categoria = categoria
    if (disponible !== null) where.disponible = disponible === 'true'

    const productos = await db!.productoProveedor.findMany({
      where,
      include: {
        proveedor: {
          select: { id: true, nombre: true, tipo: true, region: true }
        }
      },
      orderBy: { nombre: 'asc' },
    })

    return NextResponse.json(productos)
  } catch (error) {
    console.error('Productos proveedor GET error:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json({ success: true, demo: true })
    }

    const body = await request.json()
    const {
      proveedorId, nombre, nombreEn, descripcion,
      descripcionEn, categoria, unidad, precio,
      precioMayoreo, cantidadMinima, imagen, notas,
    } = body

    if (!proveedorId || !nombre || !precio) {
      return NextResponse.json(
        { error: 'proveedorId, nombre y precio son requeridos' },
        { status: 400 }
      )
    }

    const producto = await db!.productoProveedor.create({
      data: {
        proveedorId, nombre, nombreEn,
        descripcion, descripcionEn,
        categoria: categoria || 'otro',
        unidad, precio, precioMayoreo,
        cantidadMinima: cantidadMinima || 1,
        imagen, disponible: true,
      },
    })

    return NextResponse.json(producto, { status: 201 })
  } catch (error) {
    console.error('Productos proveedor POST error:', error)
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 })
  }
}