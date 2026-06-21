import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')
    const status = searchParams.get('status')
    const department = searchParams.get('department')

    const where: Record<string, unknown> = {}
    if (propertyId) where.propertyId = propertyId
    if (status) where.status = status
    if (department) where.department = department

    const employees = await db.employee.findMany({
      where,
      include: {
        property: {
          select: { name: true, nameEn: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(employees)
  } catch (error) {
    console.error('Employees GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const employee = await db.employee.create({
      data: {
        employeeId: body.employeeId,
        name: body.name,
        position: body.position,
        positionEn: body.positionEn,
        department: body.department,
        departmentEn: body.departmentEn,
        photo: body.photo,
        hireDate: new Date(body.hireDate),
        status: body.status || 'onboarding',
        careerLevel: body.careerLevel || 1,
        careerPath: body.careerPath || '',
        careerPathEn: body.careerPathEn,
        knowledgeScore: body.knowledgeScore || 0,
        salesScore: body.salesScore || 0,
        hospitalityScore: body.hospitalityScore || 0,
        overallScore: body.overallScore || 0,
        totalUpselling: body.totalUpselling || 0,
        avgNPS: body.avgNPS || 0,
        coursesCompleted: body.coursesCompleted || 0,
        coursesInProgress: body.coursesInProgress || 0,
        happinessIndex: body.happinessIndex || 80,
        turnoverRisk: body.turnoverRisk || 0,
        propertyId: body.propertyId,
      },
      include: {
        property: {
          select: { name: true, nameEn: true },
        },
      },
    })

    return NextResponse.json(employee, { status: 201 })
  } catch (error) {
    console.error('Employees POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    )
  }
}
