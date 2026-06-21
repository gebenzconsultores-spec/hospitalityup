import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const region = searchParams.get('region')
    const tipo = searchParams.get('tipo')
    const plan = searchParams.get('plan')
    const activo = searchParams.get('activo')

    const where: Record<string, unknown> = {}
    if (region) where.region = region
    if (tipo) where.tipo = tipo
    if (plan) where.plan = plan
    if (activo !== null && activo !== undefined) where.activo = activo === 'true'

    const propiedades = await db.propiedad.findMany({
      where,
      include: {
        _count: {
          select: {
            empleados: { where: { estado: { in: ['activo', 'onboarding'] } } },
            capacitaciones: { where: { activo: true } },
            ventasNps: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const propiedadesWithStats = propiedades.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      nombreEn: p.nombreEn,
      tipo: p.tipo,
      ubicacion: p.ubicacion,
      region: p.region,
      plan: p.plan,
      moneda: p.moneda,
      activo: p.activo,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      empleadosActivos: p._count.empleados,
      capacitacionesActivas: p._count.capacitaciones,
      totalVentas: p._count.ventasNps,
    }))

    return NextResponse.json(propiedadesWithStats)
  } catch (error) {
    console.error('Propiedades GET error:', error)
    return NextResponse.json(
      { error: 'Error al obtener propiedades' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const propiedad = await db.propiedad.create({
      data: {
        nombre: body.nombre,
        nombreEn: body.nombreEn,
        tipo: body.tipo,
        ubicacion: body.ubicacion,
        region: body.region,
        logo: body.logo,
        plan: body.plan || 'boutique',
        moneda: body.moneda || 'MXN',
        activo: body.activo !== undefined ? body.activo : true,
      },
    })

    return NextResponse.json(propiedad, { status: 201 })
  } catch (error) {
    console.error('Propiedades POST error:', error)
    return NextResponse.json(
      { error: 'Error al crear propiedad' },
      { status: 500 }
    )
  }
}
