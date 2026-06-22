import { NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'
import { getMockDashboard } from '@/lib/api-helpers'

export async function GET(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(getMockDashboard())
    }

    const { searchParams } = new URL(request.url)
    const propiedadId = searchParams.get('propiedadId')

    // Build where clause for property filter
    const empleadoWhere = propiedadId ? { propiedadId } : {}
    const ventaWhere = propiedadId ? { propiedadId } : {}
    const alertaWhere = propiedadId ? { propiedadId } : {}

    // ============================
    // MÉTRICAS GENERALES
    // ============================
    const totalEmpleados = await db.empleado.count({ where: empleadoWhere })
    const empleadosActivos = await db.empleado.count({ where: { ...empleadoWhere, estado: 'activo' } })
    const empleadosOnboarding = await db.empleado.count({ where: { ...empleadoWhere, estado: 'onboarding' } })
    const empleadosOffboarding = await db.empleado.count({ where: { ...empleadoWhere, estado: 'offboarding' } })

    // ============================
    // NPS Y UPSELLING
    // ============================
    const npsAgg = await db.empleado.aggregate({
      _avg: { npsPromedio: true },
      where: { ...empleadoWhere, estado: { in: ['activo', 'onboarding'] } },
    })

    const upsellingAgg = await db.empleado.aggregate({
      _sum: { totalUpselling: true },
      where: { ...empleadoWhere, estado: { in: ['activo', 'onboarding'] } },
    })

    // ============================
    // RIESGO DE ROTACIÓN
    // ============================
    const riesgoCritico = await db.empleado.count({ where: { ...empleadoWhere, nivelRiesgoBaja: 'critico' } })
    const riesgoAlto = await db.empleado.count({ where: { ...empleadoWhere, nivelRiesgoBaja: 'alto' } })
    const riesgoMedio = await db.empleado.count({ where: { ...empleadoWhere, nivelRiesgoBaja: 'medio' } })
    const riesgoBajo = await db.empleado.count({ where: { ...empleadoWhere, nivelRiesgoBaja: 'bajo' } })

    const tasaRotacion = totalEmpleados > 0
      ? Math.round(((riesgoCritico + riesgoAlto) / totalEmpleados) * 100)
      : 0

    // ============================
    // FELICIDAD
    // ============================
    const felicidadAgg = await db.empleado.aggregate({
      _avg: { indiceFelicidad: true },
      where: { ...empleadoWhere, estado: { in: ['activo', 'onboarding'] } },
    })

    // ============================
    // CAPACITACIÓN
    // ============================
    const cursosCompletados = await db.empleadoCapacitacion.count({
      where: { estado: 'completado', empleado: { ...empleadoWhere } },
    })
    const cursosEnProgreso = await db.empleadoCapacitacion.count({
      where: { estado: 'en_progreso', empleado: { ...empleadoWhere } },
    })
    const totalCapacitaciones = await db.capacitacion.count({
      where: { activo: true, ...(propiedadId ? { propiedadId } : {}) },
    })

    // ============================
    // VENTAS NPS
    // ============================
    const totalVentas = await db.ventaNPS.count({ where: ventaWhere })
    const ventasUpselling = await db.ventaNPS.count({
      where: { ...ventaWhere, esUpselling: true },
    })

    const ventasAgg = await db.ventaNPS.aggregate({
      _sum: { montoUpselling: true, montoTotal: true },
      where: ventaWhere,
    })

    const npsVentasAgg = await db.ventaNPS.aggregate({
      _avg: { calificacionNPS: true },
      where: { ...ventaWhere, calificacionNPS: { not: null } },
    })

    // ============================
    // ALERTAS
    // ============================
    const alertasCriticas = await db.alertaRiesgo.count({
      where: { ...alertaWhere, severidad: 'critico', resuelta: false },
    })
    const alertasAltas = await db.alertaRiesgo.count({
      where: { ...alertaWhere, severidad: 'alto', resuelta: false },
    })
    const alertasPendientes = await db.alertaRiesgo.count({
      where: { ...alertaWhere, resuelta: false },
    })

    // ============================
    // CANDIDATOS
    // ============================
    const candidatosDisponibles = await db.candidatoPool.count({
      where: { estado: 'disponible', ...(propiedadId ? { propiedadId } : {}) },
    })
    const candidatosEnProceso = await db.candidatoPool.count({
      where: { estado: 'en_proceso', ...(propiedadId ? { propiedadId } : {}) },
    })

    // ============================
    // SCORE INTEGRAL PROMEDIO
    // ============================
    const scoresAgg = await db.empleado.aggregate({
      _avg: {
        puntuacionConocimiento: true,
        puntuacionVentas: true,
        puntuacionHospitalidad: true,
        puntuacionTotal: true,
      },
      where: { ...empleadoWhere, estado: { in: ['activo', 'onboarding'] } },
    })

    // ============================
    // TOP PERFORMERS
    // ============================
    const topPerformers = await db.empleado.findMany({
      where: { ...empleadoWhere, estado: 'activo' },
      select: {
        id: true,
        empleadoId: true,
        nombre: true,
        posicion: true,
        departamento: true,
        puntuacionTotal: true,
        npsPromedio: true,
        totalUpselling: true,
        indiceFelicidad: true,
        foto: true,
        propiedad: { select: { nombre: true, region: true } },
      },
      orderBy: { puntuacionTotal: 'desc' },
      take: 5,
    })

    // ============================
    // EMPLEADOS EN RIESGO
    // ============================
    const empleadosRiesgo = await db.empleado.findMany({
      where: { ...empleadoWhere, nivelRiesgoBaja: { in: ['critico', 'alto'] } },
      select: {
        id: true,
        empleadoId: true,
        nombre: true,
        posicion: true,
        departamento: true,
        riesgoBaja: true,
        nivelRiesgoBaja: true,
        indiceFelicidad: true,
        npsPromedio: true,
        foto: true,
        propiedad: { select: { nombre: true, region: true } },
      },
      orderBy: { riesgoBaja: 'desc' },
      take: 5,
    })

    // ============================
    // AHORRO ESTIMADO
    // ============================
    const alertasResueltas = await db.alertaRiesgo.count({
      where: { ...alertaWhere, resuelta: true, severidad: { in: ['alto', 'critico'] } },
    })
    const ahorroEstimado = alertasResueltas * 15000

    return NextResponse.json({
      totalEmpleados,
      empleadosActivos,
      empleadosOnboarding,
      empleadosOffboarding,
      npsPromedio: Math.round((npsAgg._avg.npsPromedio || 0) * 10) / 10,
      totalUpselling: upsellingAgg._sum.totalUpselling || 0,
      npsVentasPromedio: Math.round((npsVentasAgg._avg.calificacionNPS || 0) * 10) / 10,
      tasaRotacion,
      riesgoCritico,
      riesgoAlto,
      riesgoMedio,
      riesgoBajo,
      felicidadPromedio: Math.round((felicidadAgg._avg.indiceFelicidad || 0) * 10) / 10,
      cursosCompletados,
      cursosEnProgreso,
      totalCapacitaciones,
      totalVentas,
      ventasUpselling,
      montoUpsellingTotal: ventasAgg._sum.montoUpselling || 0,
      montoTotalVentas: ventasAgg._sum.montoTotal || 0,
      alertasCriticas,
      alertasAltas,
      alertasPendientes,
      candidatosDisponibles,
      candidatosEnProceso,
      puntuacionConocimientoProm: Math.round((scoresAgg._avg.puntuacionConocimiento || 0) * 10) / 10,
      puntuacionVentasProm: Math.round((scoresAgg._avg.puntuacionVentas || 0) * 10) / 10,
      puntuacionHospitalidadProm: Math.round((scoresAgg._avg.puntuacionHospitalidad || 0) * 10) / 10,
      puntuacionTotalProm: Math.round((scoresAgg._avg.puntuacionTotal || 0) * 10) / 10,
      ahorroEstimado,
      topPerformers,
      empleadosRiesgo,
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    // Fallback to mock data on any error
    return NextResponse.json(getMockDashboard())
  }
}
