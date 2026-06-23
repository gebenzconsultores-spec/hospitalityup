import { NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'
import { getMockAlertas, getDemoModeResponse } from '@/lib/api-helpers'

// ─── GET: Listar alertas con filtros ─────────────────────────
export async function GET(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(getMockAlertas())
    }

    const { searchParams } = new URL(request.url)
    const severidad = searchParams.get('severidad')
    const empleadoId = searchParams.get('empleadoId')
    const propiedadId = searchParams.get('propiedadId')
    const leida = searchParams.get('leida')
    const resuelta = searchParams.get('resuelta')
    const tipo = searchParams.get('tipo')
    const generadoPorIA = searchParams.get('generadoPorIA')
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const where: Record<string, unknown> = {}
    if (severidad) where.severidad = severidad
    if (empleadoId) where.empleadoId = empleadoId
    if (propiedadId) where.propiedadId = propiedadId
    if (leida !== null && leida !== undefined) where.leida = leida === 'true'
    if (resuelta !== null && resuelta !== undefined) where.resuelta = resuelta === 'true'
    if (tipo) where.tipo = tipo
    if (generadoPorIA !== null && generadoPorIA !== undefined) where.generadoPorIA = generadoPorIA === 'true'

    const [alertas, total] = await Promise.all([
      db.alertaRiesgo.findMany({
        where,
        include: {
          empleado: {
            select: {
              id: true,
              nombre: true,
              empleadoId: true,
              posicion: true,
              foto: true,
              departamento: true,
              riesgoBaja: true,
              indiceFelicidad: true,
              propiedad: {
                select: { nombre: true, region: true },
              },
            },
          },
          propiedad: {
            select: { nombre: true, region: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.alertaRiesgo.count({ where }),
    ])

    // Summary stats
    const stats = await db.alertaRiesgo.aggregate({
      _count: true,
      where,
    })

    const porSeveridad = await db.alertaRiesgo.groupBy({
      by: ['severidad'],
      _count: true,
      where,
    })

    return NextResponse.json({
      alertas,
      total,
      limit,
      offset,
      resumen: {
        total: stats._count,
        porSeveridad: porSeveridad.reduce(
          (acc, item) => ({ ...acc, [item.severidad]: item._count }),
          {} as Record<string, number>
        ),
      },
    })
  } catch (error) {
    console.error('Alertas GET error:', error)
    return NextResponse.json(getMockAlertas())
  }
}

// ─── PATCH: Marcar alerta como leída o resuelta ──────────────
export async function PATCH(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(getDemoModeResponse('update', 'alerta'))
    }

    const body = await request.json()

    if (!body.id) {
      return NextResponse.json(
        { error: 'id es requerido' },
        { status: 400 }
      )
    }

    // Verify alerta exists
    const existing = await db.alertaRiesgo.findUnique({
      where: { id: body.id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Alerta no encontrada' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {}

    if (body.leida !== undefined) {
      updateData.leida = body.leida
    }

    if (body.resuelta !== undefined) {
      updateData.resuelta = body.resuelta
    }

    if (body.severidad !== undefined) {
      const validSeveridades = ['bajo', 'medio', 'alto', 'critico']
      if (!validSeveridades.includes(body.severidad)) {
        return NextResponse.json(
          { error: `severidad debe ser uno de: ${validSeveridades.join(', ')}` },
          { status: 400 }
        )
      }
      updateData.severidad = body.severidad
    }

    if (body.mensaje !== undefined) {
      updateData.mensaje = body.mensaje
    }

    const alerta = await db.alertaRiesgo.update({
      where: { id: body.id },
      data: updateData,
      include: {
        empleado: {
          select: {
            id: true,
            nombre: true,
            empleadoId: true,
            posicion: true,
            foto: true,
            propiedad: {
              select: { nombre: true },
            },
          },
        },
        propiedad: {
          select: { nombre: true, region: true },
        },
      },
    })

    return NextResponse.json(alerta)
  } catch (error) {
    console.error('Alertas PATCH error:', error)
    return NextResponse.json(getDemoModeResponse('update', 'alerta'))
  }
}

// ─── POST: Crear alerta manualmente ──────────────────────────
export async function POST(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(getDemoModeResponse('create', 'alerta'), { status: 201 })
    }

    const body = await request.json()

    // Validate required fields
    if (!body.empleadoId) {
      return NextResponse.json(
        { error: 'empleadoId es requerido' },
        { status: 400 }
      )
    }
    if (!body.tipo) {
      return NextResponse.json(
        { error: 'tipo es requerido' },
        { status: 400 }
      )
    }
    if (!body.mensaje) {
      return NextResponse.json(
        { error: 'mensaje es requerido' },
        { status: 400 }
      )
    }

    // Verify empleado exists and get propiedadId
    const empleado = await db.empleado.findUnique({
      where: { id: body.empleadoId },
      select: { id: true, propiedadId: true },
    })

    if (!empleado) {
      return NextResponse.json(
        { error: 'Empleado no encontrado' },
        { status: 404 }
      )
    }

    const alerta = await db.alertaRiesgo.create({
      data: {
        empleadoId: body.empleadoId,
        propiedadId: body.propiedadId || empleado.propiedadId,
        tipo: body.tipo,
        tipoEn: body.tipoEn || null,
        severidad: body.severidad || 'medio',
        mensaje: body.mensaje,
        mensajeEn: body.mensajeEn || null,
        probabilidad: body.probabilidad ?? 0,
        generadoPorIA: body.generadoPorIA || false,
        leida: false,
        resuelta: false,
      },
      include: {
        empleado: {
          select: {
            id: true,
            nombre: true,
            empleadoId: true,
            posicion: true,
            foto: true,
            propiedad: {
              select: { nombre: true },
            },
          },
        },
        propiedad: {
          select: { nombre: true, region: true },
        },
      },
    })

    return NextResponse.json(alerta, { status: 201 })
  } catch (error) {
    console.error('Alertas POST error:', error)
    return NextResponse.json(getDemoModeResponse('create', 'alerta'), { status: 201 })
  }
}
