import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const severity = searchParams.get('severity')
    const type = searchParams.get('type')
    const isRead = searchParams.get('isRead')
    const isResolved = searchParams.get('isResolved')
    const employeeId = searchParams.get('employeeId')

    const where: Record<string, unknown> = {}
    if (severity) where.severity = severity
    if (type) where.type = type
    if (isRead !== null && isRead !== undefined) where.isRead = isRead === 'true'
    if (isResolved !== null && isResolved !== undefined) where.isResolved = isResolved === 'true'
    if (employeeId) where.employeeId = employeeId

    const alerts = await db.turnoverAlert.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            employeeId: true,
            position: true,
            positionEn: true,
            photo: true,
            department: true,
            departmentEn: true,
            turnoverRisk: true,
            happinessIndex: true,
            property: {
              select: { name: true, nameEn: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Turnover GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch turnover alerts' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const alert = await db.turnoverAlert.create({
      data: {
        employeeId: body.employeeId,
        type: body.type,
        typeEn: body.typeEn,
        severity: body.severity || 'medium',
        message: body.message,
        messageEn: body.messageEn,
        probability: body.probability,
        isRead: false,
        isResolved: false,
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            employeeId: true,
            position: true,
            positionEn: true,
          },
        },
      },
    })

    return NextResponse.json(alert, { status: 201 })
  } catch (error) {
    console.error('Turnover POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create turnover alert' },
      { status: 500 }
    )
  }
}
