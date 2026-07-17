import { NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'

// GET /api/vacantes - Listar vacantes
export async function GET(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json([])
    }

    const { searchParams } = new URL(request.url)
    const propiedadId = searchParams.get('propiedadId')
    const estado = searchParams.get('estado')

    const where: Record<string, unknown> = {}
    if (propiedadId) where.propiedadId = propiedadId
    if (estado) where.estado = estado

    const vacantes = await db.vacante.findMany({
      where,
      include: {
        propiedad: {
          select: { id: true, nombre: true, region: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(vacantes)
  } catch (error) {
    console.error('Vacantes GET error:', error)
    return NextResponse.json([])
  }
}

// POST /api/vacantes - Crear vacante
export async function POST(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(
        { error: 'Base de datos no disponible' },
        { status: 500 }
      )
    }

    const body = await request.json()

    // Validar campos requeridos
    if (!body.propiedadId) {
      return NextResponse.json(
        { error: 'propiedadId es requerido' },
        { status: 400 }
      )
    }
    if (!body.posicion) {
      return NextResponse.json(
        { error: 'posicion es requerido' },
        { status: 400 }
      )
    }

    // Verificar que la propiedad existe
    const propiedad = await db.propiedad.findUnique({
      where: { id: body.propiedadId },
      select: { id: true, nombre: true },
    })

    if (!propiedad) {
      return NextResponse.json(
        { error: 'La propiedad no existe' },
        { status: 404 }
      )
    }

    const vacante = await db.vacante.create({
      data: {
        propiedadId: body.propiedadId,
        posicion: body.posicion,
        departamento: body.departamento || null,
        descripcion: body.descripcion || null,
        tipoContrato: body.tipoContrato || null,
        tipoJornada: body.tipoJornada || null,
        horario: body.horario || null,
        salario: body.salario ? parseFloat(body.salario) : null,
        region: body.region || null,
        estado: 'abierta',
        prioridad: body.prioridad || 'normal',
        esReemplazo: body.esReemplazo || false,
        empleadoReemplazaId: body.empleadoReemplazaId || null,
        notas: body.notas || null,
        creadoPor: body.creadoPor || null,
      },
      include: {
        propiedad: { select: { id: true, nombre: true } },
      },
    })

    // Crear notificación para el admin
    try {
      await db.notificacion.create({
        data: {
          tipo: 'nueva_vacante',
          titulo: 'Nueva vacante abierta',
          mensaje: `${propiedad.nombre} abrió vacante para: ${vacante.posicion}${vacante.prioridad === 'urgente' ? ' (URGENTE)' : ''}`,
          leida: false,
          propiedadId: body.propiedadId,
          prioridad: body.prioridad === 'urgente' ? 'urgente' : 'alta',
        },
      })
    } catch (notifErr) {
      console.error('Error creating notification:', notifErr)
    }

    return NextResponse.json(vacante, { status: 201 })
  } catch (error) {
    console.error('Vacantes POST error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error al crear vacante'
    return NextResponse.json(
      { error: errorMessage, details: String(error) },
      { status: 500 }
    )
  }
}
