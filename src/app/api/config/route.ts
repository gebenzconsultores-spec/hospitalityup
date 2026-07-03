import { NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'

// GET /api/config?propertyId=xxx
export async function GET(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(null)
    }

    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')

    if (!propertyId) {
      return NextResponse.json(null)
    }

    const propiedad = await db.propiedad.findUnique({
      where: { id: propertyId },
      include: {
        _count: {
          select: { empleados: true, servicios: true, capacitaciones: true },
        },
      },
    })

    if (!propiedad) {
      return NextResponse.json(null)
    }

    // Get positions by counting distinct posiciones from employees
    const positions = await db.empleado.findMany({
      where: { propiedadId: propertyId },
      select: { posicion: true, departamento: true },
      distinct: ['posicion'],
    })

    return NextResponse.json({
      propiedad: {
        id: propiedad.id,
        nombre: propiedad.nombre,
        nombreEn: propiedad.nombreEn,
        tipo: propiedad.tipo,
        ubicacion: propiedad.ubicacion,
        region: propiedad.region,
        moneda: propiedad.moneda,
        plan: propiedad.plan,
        activo: propiedad.activo,
      },
      counts: {
        empleados: propiedad._count.empleados,
        servicios: propiedad._count.servicios,
        capacitaciones: propiedad._count.capacitaciones,
      },
      positions: positions.map((p) => ({
        posicion: p.posicion,
        departamento: p.departamento,
      })),
    })
  } catch (error) {
    console.error('Config GET error:', error)
    return NextResponse.json(null)
  }
}
