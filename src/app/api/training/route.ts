import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const courseId = searchParams.get('courseId')
    const status = searchParams.get('status')
    const propertyId = searchParams.get('propertyId')

    const where: Record<string, unknown> = {}
    if (employeeId) where.employeeId = employeeId
    if (courseId) where.courseId = courseId
    if (status) where.status = status

    if (propertyId) {
      const employees = await db.employee.findMany({
        where: { propertyId },
        select: { id: true },
      })
      const employeeIds = employees.map((e) => e.id)
      where.employeeId = { in: employeeIds }
    }

    const employeeCourses = await db.employeeCourse.findMany({
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
            propertyId: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            titleEn: true,
            category: true,
            categoryEn: true,
            modality: true,
            duration: true,
            difficulty: true,
            points: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(employeeCourses)
  } catch (error) {
    console.error('Training GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch training data' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Check if already enrolled
    const existing = await db.employeeCourse.findFirst({
      where: {
        employeeId: body.employeeId,
        courseId: body.courseId,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Employee already enrolled in this course' },
        { status: 409 }
      )
    }

    const employeeCourse = await db.employeeCourse.create({
      data: {
        employeeId: body.employeeId,
        courseId: body.courseId,
        status: 'not_started',
        progress: 0,
      },
      include: {
        employee: {
          select: { name: true, employeeId: true, position: true },
        },
        course: {
          select: { title: true, titleEn: true, category: true },
        },
      },
    })

    // Update employee coursesInProgress count
    await db.employee.update({
      where: { id: body.employeeId },
      data: { coursesInProgress: { increment: 1 } },
    })

    return NextResponse.json(employeeCourse, { status: 201 })
  } catch (error) {
    console.error('Training POST error:', error)
    return NextResponse.json(
      { error: 'Failed to enroll employee in course' },
      { status: 500 }
    )
  }
}
