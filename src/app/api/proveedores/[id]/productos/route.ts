import { NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'

// GET /api/proveedores/[id]/productos - Listar productos de un proveedor
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!isDatabaseAvailable()) {
      return NextResponse.json([])
    }

    const productos = await db.productoProveedor.findMany({
      where: { proveedorId: id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(productos)
  } catch (error) {
    console.error('Productos GET error:', error)
    return NextResponse.json([])
  }
}

// POST /api/proveedores/[id]/productos - Agregar producto a un proveedor
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!isDatabaseAvailable()) {
      return NextResponse.json({ success: true, demo: true }, { status: 201 })
    }

    const body = await request.json()

    const producto = await db.productoProveedor.create({
      data: {
        proveedorId: id,
        nombre: body.nombre,
        nombreEn: body.nombreEn,
        descripcion: body.descripcion,
        descripcionEn: body.descripcionEn,
        categoria: body.categoria || 'otro',
        categoriaEn: body.categoriaEn,
        unidad: body.unidad || 'pieza',
        precio: parseFloat(body.precio),
        precioMayoreo: body.precioMayoreo ? parseFloat(body.precioMayoreo) : null,
        cantidadMinima: parseInt(body.cantidadMinima) || 1,
        imagen: body.imagen,
        disponible: body.disponible !== undefined ? body.disponible : true,
        propiedadesIds: body.propiedadesIds || null,
      },
    })

    return NextResponse.json(producto, { status: 201 })
  } catch (error) {
    console.error('Producto POST error:', error)
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 })
  }
}
