import { NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'
import { getMockEmpleadoDetail, getDemoModeResponse } from '@/lib/api-helpers'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!isDatabaseAvailable()) {
      const mockDetail = getMockEmpleadoDetail(id)
      if (!mockDetail) {
        return NextResponse.json(
          { error: 'Empleado no encontrado' },
          { status: 404 }
        )
      }
      return NextResponse.json(mockDetail)
    }

    const empleado = await db.empleado.findUnique({
      where: { id },
      include: {
        propiedad: {
          select: { id: true, nombre: true, nombreEn: true, region: true, tipo: true },
        },
        cursos: {
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
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        ventas: {
          orderBy: { fechaVenta: 'desc' },
          take: 20,
        },
        respuestasNps: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        alertas: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!empleado) {
      return NextResponse.json(
        { error: 'Empleado no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(empleado)
  } catch (error) {
    console.error('Empleado GET error:', error)
    const { id } = await params
    const mockDetail = getMockEmpleadoDetail(id)
    if (!mockDetail) {
      return NextResponse.json(
        { error: 'Empleado no encontrado' },
        { status: 404 }
      )
    }
    return NextResponse.json(mockDetail)
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!isDatabaseAvailable()) {
      return NextResponse.json(getDemoModeResponse('update', 'empleado'))
    }

    const body = await request.json()

    const empleado = await db.empleado.update({
      where: { id },
      data: {
        ...(body.nombre !== undefined && { nombre: body.nombre }),
        ...(body.posicion !== undefined && { posicion: body.posicion }),
        ...(body.posicionEn !== undefined && { posicionEn: body.posicionEn }),
        ...(body.departamento !== undefined && { departamento: body.departamento }),
        ...(body.departamentoEn !== undefined && { departamentoEn: body.departamentoEn }),
        ...(body.estado !== undefined && { estado: body.estado }),
        ...(body.nivelCarrera !== undefined && { nivelCarrera: body.nivelCarrera }),
        ...(body.rutaCarrera !== undefined && { rutaCarrera: body.rutaCarrera }),
        ...(body.rutaCarreraEn !== undefined && { rutaCarreraEn: body.rutaCarreraEn }),
        ...(body.puntuacionConocimiento !== undefined && { puntuacionConocimiento: body.puntuacionConocimiento }),
        ...(body.puntuacionVentas !== undefined && { puntuacionVentas: body.puntuacionVentas }),
        ...(body.puntuacionHospitalidad !== undefined && { puntuacionHospitalidad: body.puntuacionHospitalidad }),
        ...(body.puntuacionTotal !== undefined && { puntuacionTotal: body.puntuacionTotal }),
        ...(body.totalUpselling !== undefined && { totalUpselling: body.totalUpselling }),
        ...(body.npsPromedio !== undefined && { npsPromedio: body.npsPromedio }),
        ...(body.cursosCompletados !== undefined && { cursosCompletados: body.cursosCompletados }),
        ...(body.cursosEnProgreso !== undefined && { cursosEnProgreso: body.cursosEnProgreso }),
        ...(body.indiceFelicidad !== undefined && { indiceFelicidad: body.indiceFelicidad }),
        ...(body.riesgoBaja !== undefined && { riesgoBaja: body.riesgoBaja }),
        ...(body.nivelRiesgoBaja !== undefined && { nivelRiesgoBaja: body.nivelRiesgoBaja }),
        ...(body.justificacionRiesgo !== undefined && { justificacionRiesgo: body.justificacionRiesgo }),
        ...(body.sugerenciaCapacitacion !== undefined && { sugerenciaCapacitacion: body.sugerenciaCapacitacion }),
        ...(body.fechaBaja !== undefined && { fechaBaja: body.fechaBaja ? new Date(body.fechaBaja) : null }),
        ...(body.reemplazoTargetId !== undefined && { reemplazoTargetId: body.reemplazoTargetId }),
        ...(body.ultimaActividad !== undefined && { ultimaActividad: body.ultimaActividad ? new Date(body.ultimaActividad) : null }),
      },
      include: {
        propiedad: {
          select: { id: true, nombre: true, nombreEn: true, region: true },
        },
      },
    })

    return NextResponse.json(empleado)
  } catch (error) {
    console.error('Empleado PATCH error:', error)
    return NextResponse.json(getDemoModeResponse('update', 'empleado'))
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!isDatabaseAvailable()) {
      return NextResponse.json(getDemoModeResponse('deactivate', 'empleado'))
    }

    // Soft delete: marca como offboarding en lugar de eliminar
    const empleado = await db.empleado.update({
      where: { id },
      data: {
        estado: 'offboarding',
        fechaBaja: new Date(),
      },
    })

    return NextResponse.json(empleado)
  } catch (error) {
    console.error('Empleado DELETE error:', error)
    return NextResponse.json(getDemoModeResponse('deactivate', 'empleado'))
  }
}
