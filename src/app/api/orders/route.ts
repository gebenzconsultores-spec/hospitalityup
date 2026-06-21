import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const propertyId = searchParams.get('propertyId')
    const isUpselling = searchParams.get('isUpselling')

    // If filtering by property, we need to go through employees
    const where: Record<string, unknown> = {}
    if (employeeId) where.employeeId = employeeId
    if (isUpselling !== null && isUpselling !== undefined) {
      where.isUpselling = isUpselling === 'true'
    }

    if (propertyId) {
      const employees = await db.employee.findMany({
        where: { propertyId },
        select: { id: true },
      })
      const employeeIds = employees.map((e) => e.id)
      where.employeeId = { in: employeeIds }
    }

    const orders = await db.order.findMany({
      where,
      include: {
        employee: {
          select: { name: true, employeeId: true, propertyId: true },
        },
        service: {
          select: { name: true, nameEn: true, category: true },
        },
      },
      orderBy: { orderDate: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Orders GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const order = await db.order.create({
      data: {
        employeeId: body.employeeId,
        serviceId: body.serviceId,
        quantity: body.quantity || 1,
        unitPrice: body.unitPrice,
        totalAmount: body.totalAmount,
        isUpselling: body.isUpselling || false,
        customerSatisfaction: body.customerSatisfaction,
        orderDate: body.orderDate ? new Date(body.orderDate) : new Date(),
      },
      include: {
        employee: {
          select: { name: true, employeeId: true },
        },
        service: {
          select: { name: true, nameEn: true, category: true },
        },
      },
    })

    // Update employee totalUpselling if this is an upselling order
    if (body.isUpselling) {
      await db.employee.update({
        where: { id: body.employeeId },
        data: {
          totalUpselling: { increment: body.totalAmount },
        },
      })
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Orders POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
