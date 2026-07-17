import { NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'

// PATCH /api/vacantes/[id] - Actualizar vacante
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
      if (body.estado === 'cubierta' || body.estado === 'cancelada') {
        data.fechaCierre = new Date()
      }
    }
    if (body.posicion !== undefined) data.posicion = body.posicion
    if (body.departamento !== undefined) data.departamento = body.departamento
    if (body.descripcion !== undefined) data.descripcion = body.descripcion
    if (body.tipoContrato !== undefined) data.tipoContrato = body.tipoContrato
    if (body.tipoJornada !== undefined) data.tipoJornada = body.tipoJornada
    if (body.horario !== undefined) data.horario = body.horario
    if (body.salario !== undefined) data.salario = body.salario ? parseFloat(body.salario) : null
    if (body.prioridad !== undefined) data.prioridad = body.prioridad
    if (body.notas !== undefined) data.notas = body.notas
    if (body.candidatosAsignados !== undefined) data.candidatosAsignados = body.candidatosAsignados

    const vacante = await db.vacante.update({
      where: { id },
      data,
      include: { propiedad: { select: { id: true, nombre: true } } },
    })

    return NextResponse.json(vacante)
  } catch (error) {
    console.error('Vacante PATCH error:', error)
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}

// DELETE /api/vacantes/[id] - Eliminar vacante
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!isDatabaseAvailable()) {
      return NextResponse.json({ success: true, demo: true })
    }

    await db.vacante.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Vacante DELETE error:', error)
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
  }
}
