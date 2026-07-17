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
      return NextResponse.json({ success: true, demo: true }, { status: 201 })
    }

    const body = await request.json()

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

    // Crear notificación
    try {
      await db.notificacion.create({
        data: {
          tipo: 'nueva_vacante',
          titulo: 'Nueva vacante abierta',
          mensaje: `${vacante.propiedad.nombre} abrió vacante para: ${vacante.posicion}`,
          leida: false,
          propiedadId: body.propiedadId,
          prioridad: body.prioridad === 'urgente' ? 'urgente' : 'normal',
        },
      })
    } catch {}

    return NextResponse.json(vacante, { status: 201 })
  } catch (error) {
    console.error('Vacantes POST error:', error)
    return NextResponse.json({ error: 'Error al crear vacante' }, { status: 500 })
  }
}
