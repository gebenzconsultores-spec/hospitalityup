import { NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'
import { getMockVentas, getDemoModeResponse } from '@/lib/api-helpers'

// ─── GET: Listar ventas con filtros opcionales ───────────────
export async function GET(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(getMockVentas())
    }

    const { searchParams } = new URL(request.url)
    const empleadoId = searchParams.get('empleadoId')
    const propiedadId = searchParams.get('propiedadId')
    const esUpselling = searchParams.get('esUpselling')
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const where: Record<string, unknown> = {}
    if (empleadoId) where.empleadoId = empleadoId
    if (propiedadId) where.propiedadId = propiedadId
    if (esUpselling !== null && esUpselling !== undefined) {
      where.esUpselling = esUpselling === 'true'
    }

    const [ventas, total] = await Promise.all([
      db.ventaNPS.findMany({
        where,
        include: {
          empleado: {
            select: {
              id: true,
              nombre: true,
              empleadoId: true,
              posicion: true,
              foto: true,
            },
          },
          propiedad: {
            select: { nombre: true, tipo: true },
          },
        },
        orderBy: { fechaVenta: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.ventaNPS.count({ where }),
    ])

    return NextResponse.json({ ventas, total, limit, offset })
  } catch (error) {
    console.error('Ventas GET error:', error)
    return NextResponse.json(getMockVentas())
  }
}

// ─── POST: Registrar nueva venta/NPS y disparar Agente IA ────
export async function POST(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(getDemoModeResponse('create', 'venta'), { status: 201 })
    }

    const body = await request.json()

    // Validate required fields
    if (!body.empleadoId) {
      return NextResponse.json(
        { error: 'empleadoId es requerido' },
        { status: 400 }
      )
    }
    if (!body.propiedadId) {
      return NextResponse.json(
        { error: 'propiedadId es requerido' },
        { status: 400 }
      )
    }
    if (body.precioUnitario === undefined || body.precioUnitario === null) {
      return NextResponse.json(
        { error: 'precioUnitario es requerido' },
        { status: 400 }
      )
    }
    if (body.montoTotal === undefined || body.montoTotal === null) {
      return NextResponse.json(
        { error: 'montoTotal es requerido' },
        { status: 400 }
      )
    }

    // Verify empleado exists
    const empleado = await db.empleado.findUnique({
      where: { id: body.empleadoId },
    })
    if (!empleado) {
      return NextResponse.json(
        { error: 'Empleado no encontrado' },
        { status: 404 }
      )
    }

    // ── 1. Create VentaNPS record ──
    const venta = await db.ventaNPS.create({
      data: {
        empleadoId: body.empleadoId,
        propiedadId: body.propiedadId,
        montoUpselling: body.montoUpselling || 0,
        esUpselling: body.esUpselling || false,
        nombreServicio: body.nombreServicio || null,
        cantidad: body.cantidad || 1,
        precioUnitario: body.precioUnitario,
        montoTotal: body.montoTotal,
        calificacionNPS: body.calificacionNPS ?? null,
        esPromotor: body.calificacionNPS !== undefined && body.calificacionNPS !== null
          ? body.calificacionNPS >= 9
          : null,
        comentario: body.comentario || null,
        fuenteNPS: body.fuenteNPS || null,
        categoriaServicio: body.categoriaServicio || null,
        analizadoPorIA: false,
        resultadoIA: null,
      },
      include: {
        empleado: {
          select: {
            id: true,
            nombre: true,
            empleadoId: true,
            posicion: true,
          },
        },
        propiedad: {
          select: { nombre: true },
        },
      },
    })

    // ── 2. Update empleado metrics ──
    const todasLasVentas = await db.ventaNPS.findMany({
      where: { empleadoId: body.empleadoId },
      select: { montoUpselling: true, calificacionNPS: true, esUpselling: true },
    })

    const totalUpselling = todasLasVentas
      .filter((v) => v.esUpselling)
      .reduce((sum, v) => sum + v.montoUpselling, 0)

    const ventasConNPS = todasLasVentas.filter((v) => v.calificacionNPS !== null)
    const npsPromedio = ventasConNPS.length > 0
      ? ventasConNPS.reduce((sum, v) => sum + (v.calificacionNPS ?? 0), 0) / ventasConNPS.length
      : 0

    const ventasUpselling = todasLasVentas.filter((v) => v.esUpselling)
    const puntuacionVentas = Math.min(100, ventasUpselling.length * 5 + (totalUpselling / 100))

    const puntuacionHospitalidad = npsPromedio > 0 ? (npsPromedio / 10) * 100 : empleado.puntuacionHospitalidad

    const puntuacionTotal =
      empleado.puntuacionConocimiento * 0.3 +
      puntuacionVentas * 0.35 +
      puntuacionHospitalidad * 0.35

    await db.empleado.update({
      where: { id: body.empleadoId },
      data: {
        totalUpselling,
        npsPromedio,
        puntuacionVentas,
        puntuacionHospitalidad,
        puntuacionTotal,
        ultimaActividad: new Date(),
      },
    })

    // ── 3. Trigger AI Agent Asynchronously ──
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    fetch(`${baseUrl}/api/agents/performance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        empleadoId: body.empleadoId,
        ventaId: venta.id,
      }),
    }).catch((err) => {
      console.error('Error triggering AI agent asynchronously:', err)
    })

    // ── 4. Return the created venta ──
    return NextResponse.json(venta, { status: 201 })
  } catch (error) {
    console.error('Ventas POST error:', error)
    return NextResponse.json(getDemoModeResponse('create', 'venta'), { status: 201 })
  }
}
