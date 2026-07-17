import { NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'

// PATCH /api/empleado-capacitaciones/[id] - Actualizar estado de inscripción
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
    if (body.estado !== undefined) {
      data.estado = body.estado
      if (body.estado === 'en_progreso' && body.fechaInicio === undefined) {
        data.fechaInicio = new Date()
      }
      if (body.estado === 'completado') {
        data.fechaCompletado = new Date()
        data.progreso = 100
      }
    }
    if (body.progreso !== undefined) data.progreso = parseFloat(body.progreso)
    if (body.puntuacion !== undefined) data.puntuacion = parseFloat(body.puntuacion)
    if (body.fechaInicio !== undefined) data.fechaInicio = body.fechaInicio ? new Date(body.fechaInicio) : null
    if (body.fechaCompletado !== undefined) data.fechaCompletado = body.fechaCompletado ? new Date(body.fechaCompletado) : null

    const inscripcion = await db.empleadoCapacitacion.update({
      where: { id },
      data,
      include: {
        capacitacion: { select: { id: true, titulo: true } },
        empleado: { select: { id: true, nombre: true } },
      },
    })

    return NextResponse.json(inscripcion)
  } catch (error) {
    console.error('EmpleadoCapacitacion PATCH error:', error)
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}

// DELETE /api/empleado-capacitaciones/[id] - Eliminar inscripción
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!isDatabaseAvailable()) {
      return NextResponse.json({ success: true, demo: true })
    }

    await db.empleadoCapacitacion.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('EmpleadoCapacitacion DELETE error:', error)
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
  }
}
