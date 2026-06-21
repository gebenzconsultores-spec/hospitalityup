import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const propiedadId = searchParams.get('propiedadId')
    const estado = searchParams.get('estado')
    const modalidad = searchParams.get('modalidad')

    const where: Record<string, unknown> = {}
    if (propiedadId) where.propiedadId = propiedadId
    if (estado) where.estado = estado
    if (modalidad) where.modalidad = modalidad

    const solicitudes = await db.solicitudCapacitacion.findMany({
      where,
      include: {
        propiedad: {
          select: { id: true, nombre: true, nombreEn: true, region: true },
        },
        capacitacion: {
          select: { id: true, titulo: true, tituloEn: true, categoria: true, modalidad: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(solicitudes)
  } catch (error) {
    console.error('Solicitudes GET error:', error)
    return NextResponse.json(
      { error: 'Error al obtener solicitudes de capacitación' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const solicitud = await db.solicitudCapacitacion.create({
      data: {
        propiedadId: body.propiedadId,
        capacitacionId: body.capacitacionId || null,
        modalidad: body.modalidad,
        tema: body.tema || null,
        fechaSolicitada: new Date(body.fechaSolicitada),
        fechaConfirmada: body.fechaConfirmada ? new Date(body.fechaConfirmada) : null,
        participantes: body.participantes || 1,
        instructorId: body.instructorId || null,
        nombreInstructor: body.nombreInstructor || null,
        estado: body.estado || 'pendiente',
        costo: body.costo || null,
        notas: body.notas || null,
        creadoPor: body.creadoPor || null,
      },
      include: {
        propiedad: {
          select: { id: true, nombre: true, nombreEn: true, region: true },
        },
        capacitacion: {
          select: { id: true, titulo: true, tituloEn: true, categoria: true },
        },
      },
    })

    return NextResponse.json(solicitud, { status: 201 })
  } catch (error) {
    console.error('Solicitudes POST error:', error)
    return NextResponse.json(
      { error: 'Error al crear solicitud de capacitación' },
      { status: 500 }
    )
  }
}
