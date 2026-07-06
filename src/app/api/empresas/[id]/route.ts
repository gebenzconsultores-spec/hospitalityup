import { NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'

// GET /api/empresas/[id] - Detalle de empresa
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!isDatabaseAvailable()) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    }

    const empresa = await db.empresa.findUnique({
      where: { id },
      include: {
        propiedades: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
            region: true,
            ubicacion: true,
            activo: true,
            _count: { select: { empleados: true } },
          },
        },
        _count: { select: { propiedades: true } },
      },
    })

    if (!empresa) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    }

    return NextResponse.json(empresa)
  } catch (error) {
    console.error('Empresa GET error:', error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

// PATCH /api/empresas/[id] - Actualizar empresa
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

    const maxPropiedadesByPlan: Record<string, number> = {
      boutique: 1,
      growth: 5,
      enterprise: 20,
    }

    const data: Record<string, unknown> = {}
    if (body.nombre !== undefined) data.nombre = body.nombre
    if (body.nombreEn !== undefined) data.nombreEn = body.nombreEn
    if (body.tipo !== undefined) data.tipo = body.tipo
    if (body.rfc !== undefined) data.rfc = body.rfc
    if (body.contactoNombre !== undefined) data.contactoNombre = body.contactoNombre
    if (body.contactoEmail !== undefined) data.contactoEmail = body.contactoEmail
    if (body.contactoTelefono !== undefined) data.contactoTelefono = body.contactoTelefono
    if (body.plan !== undefined) {
      data.plan = body.plan
      data.maxPropiedades = maxPropiedadesByPlan[body.plan] || 1
    }
    if (body.password !== undefined) data.password = body.password
    if (body.activo !== undefined) data.activo = body.activo

    const empresa = await db.empresa.update({
      where: { id },
      data,
    })

    return NextResponse.json(empresa)
  } catch (error) {
    console.error('Empresa PATCH error:', error)
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}

// DELETE /api/empresas/[id] - Eliminar empresa
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!isDatabaseAvailable()) {
      return NextResponse.json({ success: true, demo: true })
    }

    // Verificar que existe
    const empresa = await db.empresa.findUnique({ where: { id } })
    if (!empresa) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    }

    // Desvincular propiedades de la empresa
    await db.propiedad.updateMany({
      where: { empresaId: id },
      data: { empresaId: null },
    })

    // Eliminar empresa
    await db.empresa.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Empresa DELETE error:', error)
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
  }
}
