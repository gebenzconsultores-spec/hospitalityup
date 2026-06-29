import { NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'
import { getMockEmpleados, getDemoModeResponse } from '@/lib/api-helpers'

export async function GET(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      // Augment mock empleados with password field
      const mocks = getMockEmpleados().map((e) => ({ ...e, password: '1234' }))
      return NextResponse.json(mocks)
    }

    const { searchParams } = new URL(request.url)
    const propiedadId = searchParams.get('propiedadId')
    const estado = searchParams.get('estado')
    const departamento = searchParams.get('departamento')
    const nivelRiesgoBaja = searchParams.get('nivelRiesgoBaja')
    const nivelCarreraMin = searchParams.get('nivelCarreraMin')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}
    if (propiedadId) where.propiedadId = propiedadId
    if (estado) where.estado = estado
    if (departamento) where.departamento = departamento
    if (nivelRiesgoBaja) where.nivelRiesgoBaja = nivelRiesgoBaja
    if (nivelCarreraMin) where.nivelCarrera = { gte: parseInt(nivelCarreraMin) }
    if (search) {
      where.OR = [
        { nombre: { contains: search } },
        { empleadoId: { contains: search } },
        { posicion: { contains: search } },
      ]
    }

    const empleados = await db.empleado.findMany({
      where,
      include: {
        propiedad: {
          select: { id: true, nombre: true, nombreEn: true, region: true },
        },
        _count: {
          select: { cursos: true, alertas: true, ventas: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(empleados)
  } catch (error) {
    console.error('Empleados GET error:', error)
    const mocks = getMockEmpleados().map((e) => ({ ...e, password: '1234' }))
    return NextResponse.json(mocks)
  }
}

export async function POST(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(getDemoModeResponse('create', 'empleado'), { status: 201 })
    }

    const body = await request.json()

    const empleado = await db.empleado.create({
      data: {
        empleadoId: body.empleadoId,
        password: body.password || '1234',
        nombre: body.nombre,
        posicion: body.posicion,
        posicionEn: body.posicionEn,
        departamento: body.departamento,
        departamentoEn: body.departamentoEn,
        foto: body.foto,
        fechaIngreso: new Date(body.fechaIngreso),
        estado: body.estado || 'onboarding',
        nivelCarrera: body.nivelCarrera || 1,
        rutaCarrera: body.rutaCarrera,
        rutaCarreraEn: body.rutaCarreraEn,
        // Horario y jornada laboral
        tipoJornada: body.tipoJornada || 'fijo',
        horarioEntrada: body.horarioEntrada || null,
        horarioSalida: body.horarioSalida || null,
        diasTrabajo: body.diasTrabajo || null,
        cubreTurnos: body.cubreTurnos || false,
        turnoPreferido: body.turnoPreferido || null,
        salario: body.salario || null,
        tipoContrato: body.tipoContrato || null,
        fechaFinContrato: body.fechaFinContrato ? new Date(body.fechaFinContrato) : null,
        // Scores
        puntuacionConocimiento: body.puntuacionConocimiento || 0,
        puntuacionVentas: body.puntuacionVentas || 0,
        puntuacionHospitalidad: body.puntuacionHospitalidad || 0,
        puntuacionTotal: body.puntuacionTotal || 0,
        totalUpselling: body.totalUpselling || 0,
        npsPromedio: body.npsPromedio || 0,
        cursosCompletados: body.cursosCompletados || 0,
        cursosEnProgreso: body.cursosEnProgreso || 0,
        indiceFelicidad: body.indiceFelicidad || 80,
        riesgoBaja: body.riesgoBaja || 0,
        nivelRiesgoBaja: body.nivelRiesgoBaja || 'bajo',
        justificacionRiesgo: body.justificacionRiesgo,
        sugerenciaCapacitacion: body.sugerenciaCapacitacion,
        propiedadId: body.propiedadId,
      },
      include: {
        propiedad: {
          select: { id: true, nombre: true, nombreEn: true, region: true },
        },
      },
    })

    return NextResponse.json(empleado, { status: 201 })
  } catch (error) {
    console.error('Empleados POST error:', error)
    return NextResponse.json(getDemoModeResponse('create', 'empleado'), { status: 201 })
  }
}
