import { NextResponse } from 'next/server'
import { isDatabaseAvailable } from '@/lib/db'
import { getMockTurnoverAlerts, getDemoModeResponse } from '@/lib/api-helpers'

export async function GET(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(getMockTurnoverAlerts())
    }

    const { searchParams } = new URL(request.url)
    const severity = searchParams.get('severity')
    const type = searchParams.get('type')
    const isRead = searchParams.get('isRead')
    const isResolved = searchParams.get('isResolved')
    const employeeId = searchParams.get('employeeId')

    const { db } = await import('@/lib/db')
    if (!db) return NextResponse.json(getMockTurnoverAlerts())

    try {
      const where: Record<string, unknown> = {}
      // Map English severity to Spanish
      if (severity) {
        const sevMap: Record<string, string> = { low: 'bajo', medium: 'medio', high: 'alto', critical: 'critico' }
        where.severidad = sevMap[severity] || severity
      }
      if (type) where.tipo = type
      if (isRead !== null && isRead !== undefined) where.leida = isRead === 'true'
      if (isResolved !== null && isResolved !== undefined) where.resuelta = isResolved === 'true'
      if (employeeId) where.empleadoId = employeeId

      const alerts = await db.alertaRiesgo.findMany({
        where,
        include: {
          empleado: {
            select: {
              id: true,
              nombre: true,
              empleadoId: true,
              posicion: true,
              posicionEn: true,
              foto: true,
              departamento: true,
              departamentoEn: true,
              riesgoBaja: true,
              indiceFelicidad: true,
              propiedad: { select: { nombre: true, nombreEn: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json(alerts)
    } catch {
      return NextResponse.json(getMockTurnoverAlerts())
    }
  } catch (error) {
    console.error('Turnover GET error:', error)
    return NextResponse.json(getMockTurnoverAlerts())
  }
}

export async function POST(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(getDemoModeResponse('create', 'turnover_alert'), { status: 201 })
    }

    const body = await request.json()
    const { db } = await import('@/lib/db')
    if (!db) return NextResponse.json(getDemoModeResponse('create', 'turnover_alert'), { status: 201 })

    try {
      // Map English severity to Spanish
      const sevMap: Record<string, string> = { low: 'bajo', medium: 'medio', high: 'alto', critical: 'critico' }
      const mappedSeverity = sevMap[body.severity] || 'medio'

      const alert = await db.alertaRiesgo.create({
        data: {
          empleadoId: body.employeeId,
          tipo: body.type,
          tipoEn: body.typeEn,
          severidad: mappedSeverity,
          mensaje: body.message,
          mensajeEn: body.messageEn,
          probabilidad: body.probability,
          leida: false,
          resuelta: false,
        },
        include: {
          empleado: {
            select: { id: true, nombre: true, empleadoId: true, posicion: true, posicionEn: true },
          },
        },
      })

      return NextResponse.json(alert, { status: 201 })
    } catch {
      return NextResponse.json(getDemoModeResponse('create', 'turnover_alert'), { status: 201 })
    }
  } catch (error) {
    console.error('Turnover POST error:', error)
    return NextResponse.json(getDemoModeResponse('create', 'turnover_alert'), { status: 201 })
  }
}
