import { NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'
import { getMockSolicitudes, getDemoModeResponse } from '@/lib/api-helpers'

export async function GET(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(getMockSolicitudes())
    }

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
    return NextResponse.json(getMockSolicitudes())
  }
}

export async function POST(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(getDemoModeResponse('create', 'solicitud'), { status: 201 })
    }

    const body = await request.json()

    // Cuando una empresa crea la solicitud, el estado inicial es "programada"
    // El admin la verá como "pendiente" hasta que la acepte
    const estadoInicial = body.estado || 'programada'

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
        estado: estadoInicial,
        costo: body.costo || null,
        notas: body.notas || null,
        linkZoom: body.linkZoom || null,
        creadoPor: body.creadoPor || null,
      },
      include: {
        propiedad: {
          select: { id: true, nombre: true, nombreEn: true, region: true },
        },
        capacitacion: {
          select: { id: true, titulo: true, tituloEn: true, categoria: true, modalidad: true },
        },
      },
    })

    // Crear notificación para el admin
    try {
      await db.notificacion.create({
        data: {
          tipo: 'solicitud_capacitacion',
          titulo: 'Nueva solicitud de capacitación',
          mensaje: `${solicitud.propiedad.nombre} solicitó: ${solicitud.capacitacion?.titulo || solicitud.tema || 'Capacitación'}`,
          leida: false,
          propiedadId: body.propiedadId,
          prioridad: 'normal',
        },
      })
    } catch {}

    return NextResponse.json(solicitud, { status: 201 })
  } catch (error) {
    console.error('Solicitudes POST error:', error)
    return NextResponse.json(getDemoModeResponse('create', 'solicitud'), { status: 201 })
  }
}
