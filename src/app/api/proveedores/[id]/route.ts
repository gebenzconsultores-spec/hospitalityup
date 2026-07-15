import { NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'

// GET /api/proveedores/[id] - Detalle de proveedor con productos
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!isDatabaseAvailable()) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    }

    const proveedor = await db.proveedor.findUnique({
      where: { id },
      include: {
        productos: {
          orderBy: { createdAt: 'desc' },
        },
        empresa: {
          select: { id: true, nombre: true },
        },
        _count: { select: { productos: true } },
      },
    })

    if (!proveedor) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    }

    return NextResponse.json(proveedor)
  } catch (error) {
    console.error('Proveedor GET error:', error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

// PATCH /api/proveedores/[id] - Actualizar proveedor
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
    if (body.nombre !== undefined) data.nombre = body.nombre
    if (body.nombreEn !== undefined) data.nombreEn = body.nombreEn
    if (body.tipo !== undefined) data.tipo = body.tipo
    if (body.rfc !== undefined) data.rfc = body.rfc
    if (body.contactoNombre !== undefined) data.contactoNombre = body.contactoNombre
    if (body.contactoEmail !== undefined) data.contactoEmail = body.contactoEmail
    if (body.contactoTelefono !== undefined) data.contactoTelefono = body.contactoTelefono
    if (body.direccion !== undefined) data.direccion = body.direccion
    if (body.region !== undefined) data.region = body.region
    if (body.ciudad !== undefined) data.ciudad = body.ciudad
    if (body.paginaWeb !== undefined) data.paginaWeb = body.paginaWeb
    if (body.logo !== undefined) data.logo = body.logo
    if (body.activo !== undefined) data.activo = body.activo
    if (body.calificacion !== undefined) data.calificacion = body.calificacion
    if (body.notas !== undefined) data.notas = body.notas
    if (body.empresaId !== undefined) data.empresaId = body.empresaId || null

    const proveedor = await db.proveedor.update({
      where: { id },
      data,
    })

    return NextResponse.json(proveedor)
  } catch (error) {
    console.error('Proveedor PATCH error:', error)
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}

// DELETE /api/proveedores/[id] - Eliminar proveedor
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!isDatabaseAvailable()) {
      return NextResponse.json({ success: true, demo: true })
    }

    const proveedor = await db.proveedor.findUnique({ where: { id } })
    if (!proveedor) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    }

    // Eliminar productos del proveedor
    await db.productoProveedor.deleteMany({ where: { proveedorId: id } })
    // Eliminar proveedor
    await db.proveedor.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Proveedor DELETE error:', error)
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
  }
}
