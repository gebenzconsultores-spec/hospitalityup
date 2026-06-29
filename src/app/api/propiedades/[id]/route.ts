import { NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'
import { getDemoModeResponse } from '@/lib/api-helpers'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!isDatabaseAvailable()) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada' },
        { status: 404 }
      )
    }

    const propiedad = await db.propiedad.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            empleados: true,
            capacitaciones: true,
            ventasNps: true,
            servicios: true,
          },
        },
      },
    })

    if (!propiedad) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(propiedad)
  } catch (error) {
    console.error('Propiedad GET error:', error)
    return NextResponse.json(
      { error: 'Error al obtener propiedad' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!isDatabaseAvailable()) {
      return NextResponse.json(getDemoModeResponse('update', 'propiedad'))
    }

    const body = await request.json()

    // Build only the fields that were provided so we don't wipe optional ones.
    const data: Record<string, unknown> = {}
    if (body.nombre !== undefined) data.nombre = body.nombre
    if (body.nombreEn !== undefined) data.nombreEn = body.nombreEn
    if (body.tipo !== undefined) data.tipo = body.tipo
    if (body.ubicacion !== undefined) data.ubicacion = body.ubicacion
    if (body.region !== undefined) data.region = body.region
    if (body.logo !== undefined) data.logo = body.logo
    if (body.plan !== undefined) data.plan = body.plan
    if (body.moneda !== undefined) data.moneda = body.moneda
    if (body.activo !== undefined) data.activo = body.activo
    if (body.password !== undefined) data.password = body.password
    if (body.contactoNombre !== undefined) data.contactoNombre = body.contactoNombre
    if (body.contactoEmail !== undefined) data.contactoEmail = body.contactoEmail
    if (body.contactoTelefono !== undefined) data.contactoTelefono = body.contactoTelefono

    const propiedad = await db.propiedad.update({
      where: { id },
      data,
    })

    return NextResponse.json(propiedad)
  } catch (error) {
    console.error('Propiedades PUT error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar propiedad' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // PATCH is an alias of PUT for partial updates (toggle activo, password, etc.)
  try {
    const { id } = await params

    if (!isDatabaseAvailable()) {
      return NextResponse.json(getDemoModeResponse('update', 'propiedad'))
    }

    const body = await request.json()

    const data: Record<string, unknown> = {}
    if (body.activo !== undefined) data.activo = body.activo
    if (body.password !== undefined) data.password = body.password
    if (body.contactoNombre !== undefined) data.contactoNombre = body.contactoNombre
    if (body.contactoEmail !== undefined) data.contactoEmail = body.contactoEmail
    if (body.contactoTelefono !== undefined) data.contactoTelefono = body.contactoTelefono
    if (body.nombre !== undefined) data.nombre = body.nombre
    if (body.nombreEn !== undefined) data.nombreEn = body.nombreEn
    if (body.tipo !== undefined) data.tipo = body.tipo
    if (body.ubicacion !== undefined) data.ubicacion = body.ubicacion
    if (body.region !== undefined) data.region = body.region
    if (body.plan !== undefined) data.plan = body.plan
    if (body.moneda !== undefined) data.moneda = body.moneda

    const propiedad = await db.propiedad.update({
      where: { id },
      data,
    })

    return NextResponse.json(propiedad)
  } catch (error) {
    console.error('Propiedades PATCH error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar propiedad' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!isDatabaseAvailable()) {
      return NextResponse.json(getDemoModeResponse('delete', 'propiedad'))
    }

    await db.propiedad.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Propiedades DELETE error:', error)
    return NextResponse.json(
      { error: 'Error al eliminar propiedad' },
      { status: 500 }
    )
  }
}
