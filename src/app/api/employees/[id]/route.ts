import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const employee = await db.employee.findUnique({
      where: { id },
      include: {
        property: {
          select: { name: true, nameEn: true, region: true },
        },
        courseProgress: {
          include: {
            course: {
              select: { title: true, titleEn: true, category: true, modality: true },
            },
          },
        },
        orders: {
          include: {
            service: {
              select: { name: true, nameEn: true, category: true },
            },
          },
          orderBy: { orderDate: 'desc' },
        },
        npsResponses: {
          orderBy: { createdAt: 'desc' },
        },
        alerts: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(employee)
  } catch (error) {
    console.error('Employee GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employee' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const employee = await db.employee.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.position !== undefined && { position: body.position }),
        ...(body.positionEn !== undefined && { positionEn: body.positionEn }),
        ...(body.department !== undefined && { department: body.department }),
        ...(body.departmentEn !== undefined && { departmentEn: body.departmentEn }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.careerLevel !== undefined && { careerLevel: body.careerLevel }),
        ...(body.knowledgeScore !== undefined && { knowledgeScore: body.knowledgeScore }),
        ...(body.salesScore !== undefined && { salesScore: body.salesScore }),
        ...(body.hospitalityScore !== undefined && { hospitalityScore: body.hospitalityScore }),
        ...(body.overallScore !== undefined && { overallScore: body.overallScore }),
        ...(body.totalUpselling !== undefined && { totalUpselling: body.totalUpselling }),
        ...(body.avgNPS !== undefined && { avgNPS: body.avgNPS }),
        ...(body.coursesCompleted !== undefined && { coursesCompleted: body.coursesCompleted }),
        ...(body.coursesInProgress !== undefined && { coursesInProgress: body.coursesInProgress }),
        ...(body.happinessIndex !== undefined && { happinessIndex: body.happinessIndex }),
        ...(body.turnoverRisk !== undefined && { turnoverRisk: body.turnoverRisk }),
        ...(body.offboardingDate !== undefined && { offboardingDate: body.offboardingDate ? new Date(body.offboardingDate) : null }),
      },
      include: {
        property: {
          select: { name: true, nameEn: true },
        },
      },
    })

    return NextResponse.json(employee)
  } catch (error) {
    console.error('Employee PATCH error:', error)
    return NextResponse.json(
      { error: 'Failed to update employee' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Soft delete: deactivate employee instead of removing
    const employee = await db.employee.update({
      where: { id },
      data: { status: 'inactive' },
    })

    return NextResponse.json(employee)
  } catch (error) {
    console.error('Employee DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to deactivate employee' },
      { status: 500 }
    )
  }
}
