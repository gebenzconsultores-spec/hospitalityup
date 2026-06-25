import { NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'
import { getDemoModeResponse } from '@/lib/api-helpers'

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

    const propiedad = await db.propiedad.update({
      where: { id },
      data: {
        nombre: body.nombre,
        nombreEn: body.nombreEn,
        tipo: body.tipo,
        ubicacion: body.ubicacion,
        region: body.region,
        logo: body.logo,
        plan: body.plan,
        moneda: body.moneda,
        activo: body.activo,
      },
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
