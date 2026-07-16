import { NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'

// GET /api/empleado-capacitaciones - Listar inscripciones
// Query params: empleadoId, capacitacionId, estado
export async function GET(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json([])
    }

    const { searchParams } = new URL(request.url)
    const empleadoId = searchParams.get('empleadoId')
    const capacitacionId = searchParams.get('capacitacionId')
    const estado = searchParams.get('estado')

    const where: Record<string, unknown> = {}
    if (empleadoId) where.empleadoId = empleadoId
    if (capacitacionId) where.capacitacionId = capacitacionId
    if (estado) where.estado = estado

    const inscripciones = await db.empleadoCapacitacion.findMany({
      where,
      include: {
        capacitacion: {
          select: {
            id: true,
            titulo: true,
            tituloEn: true,
            categoria: true,
            modalidad: true,
            duracion: true,
            dificultad: true,
            puntos: true,
            descripcion: true,
          },
        },
        empleado: {
          select: {
            id: true,
            nombre: true,
            empleadoId: true,
            posicion: true,
            foto: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(inscripciones)
  } catch (error) {
    console.error('EmpleadoCapacitacion GET error:', error)
    return NextResponse.json([])
  }
}

// POST /api/empleado-capacitaciones - Inscribir empleado a curso
export async function POST(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json({ success: true, demo: true }, { status: 201 })
    }

    const body = await request.json()
    const { empleadoId, capacitacionId } = body

    if (!empleadoId || !capacitacionId) {
      return NextResponse.json(
        { error: 'empleadoId y capacitacionId son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si ya existe la inscripción
    const existing = await db.empleadoCapacitacion.findFirst({
      where: {
        empleadoId,
        capacitacionId,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'El empleado ya está inscrito en este curso', inscripcion: existing },
        { status: 409 }
      )
    }

    // Crear inscripción
    const inscripcion = await db.empleadoCapacitacion.create({
      data: {
        empleadoId,
        capacitacionId,
        estado: 'no_iniciado',
        progreso: 0,
        fechaInicio: null,
        fechaCompletado: null,
      },
      include: {
        capacitacion: {
          select: { id: true, titulo: true, tituloEn: true, categoria: true },
        },
        empleado: {
          select: { id: true, nombre: true, empleadoId: true },
        },
      },
    })

    // Crear notificación
    try {
      await db.notificacion.create({
        data: {
          tipo: 'inscripcion_curso',
          titulo: 'Nueva inscripción a curso',
          mensaje: `${inscripcion.empleado.nombre} fue inscrito a "${inscripcion.capacitacion.titulo}"`,
          leida: false,
          prioridad: 'normal',
        },
      })
    } catch {}

    return NextResponse.json(inscripcion, { status: 201 })
  } catch (error) {
    console.error('EmpleadoCapacitacion POST error:', error)
    return NextResponse.json({ error: 'Error al inscribir' }, { status: 500 })
  }
}
