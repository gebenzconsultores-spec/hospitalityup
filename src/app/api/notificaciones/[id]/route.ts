import { NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'

// PATCH /api/notificaciones/[id] - Marcar como leída
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!isDatabaseAvailable()) {
      return NextResponse.json({ success: true, demo: true })
    }

    const notificacion = await db.notificacion.update({
      where: { id },
      data: {
        ...(body.leida !== undefined && { leida: body.leida }),
      },
    })

    return NextResponse.json(notificacion)
  } catch (error) {
    console.error('Notificacion PATCH error:', error)
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}
