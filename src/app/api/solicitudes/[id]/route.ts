import { NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'

// PATCH /api/solicitudes/[id] - Actualizar estado de solicitud
// Admin puede: aceptar (confirmada), rechazar, completar, cancelar
// Al aceptar, puede agregar linkZoom (si es virtual)
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
    if (body.estado !== undefined) data.estado = body.estado
    if (body.linkZoom !== undefined) data.linkZoom = body.linkZoom || null
    if (body.notas !== undefined) data.notas = body.notas
    if (body.fechaConfirmada !== undefined) data.fechaConfirmada = body.fechaConfirmada ? new Date(body.fechaConfirmada) : null
    if (body.instructorId !== undefined) data.instructorId = body.instructorId || null
    if (body.nombreInstructor !== undefined) data.nombreInstructor = body.nombreInstructor || null
    if (body.costo !== undefined) data.costo = body.costo ? parseFloat(body.costo) : null

    // Si el admin acepta (confirma), registrar fecha
    if (body.estado === 'confirmada' && !body.fechaConfirmada) {
      data.fechaConfirmada = new Date()
    }

    const solicitud = await db.solicitudCapacitacion.update({
      where: { id },
      data,
      include: {
        propiedad: {
          select: { id: true, nombre: true },
        },
        capacitacion: {
          select: { id: true, titulo: true, modalidad: true },
        },
      },
    })

    // Crear notificación para la empresa
    try {
      const mensajeNotif = body.estado === 'confirmada'
        ? `Tu solicitud de "${solicitud.capacitacion?.titulo || solicitud.tema || 'Capacitación'}" fue ACEPTADA${solicitud.linkZoom ? `. Link: ${solicitud.linkZoom}` : ''}`
        : body.estado === 'rechazada'
        ? `Tu solicitud de "${solicitud.capacitacion?.titulo || solicitud.tema || 'Capacitación'}" fue RECHAZADA`
        : `Tu solicitud de capacitación cambió a: ${body.estado}`

      await db.notificacion.create({
        data: {
          tipo: 'solicitud_capacitacion',
          titulo: `Solicitud ${body.estado}`,
          mensaje: mensajeNotif,
          leida: false,
          propiedadId: solicitud.propiedadId,
          prioridad: body.estado === 'confirmada' ? 'alta' : 'normal',
        },
      })
    } catch {}

    return NextResponse.json(solicitud)
  } catch (error) {
    console.error('Solicitud PATCH error:', error)
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}

// DELETE /api/solicitudes/[id] - Eliminar solicitud
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!isDatabaseAvailable()) {
      return NextResponse.json({ success: true, demo: true })
    }

    await db.solicitudCapacitacion.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Solicitud DELETE error:', error)
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
  }
}
