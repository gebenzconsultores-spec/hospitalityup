import { NextResponse } from 'next/server'
import { isDatabaseAvailable } from '@/lib/db'
import { getMockOrders, getDemoModeResponse } from '@/lib/api-helpers'

export async function GET(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(getMockOrders())
    }

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const propertyId = searchParams.get('propertyId')
    const isUpselling = searchParams.get('isUpselling')

    const { db } = await import('@/lib/db')
    if (!db) return NextResponse.json(getMockOrders())

    try {
      const where: Record<string, unknown> = {}
      if (employeeId) where.empleadoId = employeeId
      if (isUpselling !== null && isUpselling !== undefined) {
        where.esUpselling = isUpselling === 'true'
      }

      if (propertyId) {
        const employees = await db.empleado.findMany({
          where: { propiedadId: propertyId },
          select: { id: true },
        })
        const employeeIds = employees.map((e: { id: string }) => e.id)
        where.empleadoId = { in: employeeIds }
      }

      const orders = await db.ventaNPS.findMany({
        where,
        include: {
          empleado: { select: { nombre: true, empleadoId: true, propiedadId: true } },
          propiedad: { select: { nombre: true, nombreEn: true } },
        },
        orderBy: { fechaVenta: 'desc' },
      })

      return NextResponse.json(orders)
    } catch {
      return NextResponse.json(getMockOrders())
    }
  } catch (error) {
    console.error('Orders GET error:', error)
    return NextResponse.json(getMockOrders())
  }
}

export async function POST(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(getDemoModeResponse('create', 'order'), { status: 201 })
    }

    const body = await request.json()
    const { db } = await import('@/lib/db')
    if (!db) return NextResponse.json(getDemoModeResponse('create', 'order'), { status: 201 })

    try {
      const order = await db.ventaNPS.create({
        data: {
          empleadoId: body.employeeId,
          propiedadId: body.propertyId || '',
          nombreServicio: body.serviceName,
          cantidad: body.quantity || 1,
          precioUnitario: body.unitPrice,
          montoTotal: body.totalAmount,
          esUpselling: body.isUpselling || false,
          calificacionNPS: body.customerSatisfaction,
          fechaVenta: body.orderDate ? new Date(body.orderDate) : new Date(),
        },
        include: {
          empleado: { select: { nombre: true, empleadoId: true } },
          propiedad: { select: { nombre: true } },
        },
      })

      // Update employee upselling total if applicable
      if (body.isUpselling) {
        await db.empleado.update({
          where: { id: body.employeeId },
          data: { totalUpselling: { increment: body.totalAmount } },
        })
      }

      return NextResponse.json(order, { status: 201 })
    } catch {
      return NextResponse.json(getDemoModeResponse('create', 'order'), { status: 201 })
    }
  } catch (error) {
    console.error('Orders POST error:', error)
    return NextResponse.json(getDemoModeResponse('create', 'order'), { status: 201 })
  }
}
