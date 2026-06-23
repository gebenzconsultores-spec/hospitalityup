import { NextResponse } from 'next/server'
import { isDatabaseAvailable } from '@/lib/db'
import { getMockTraining, getDemoModeResponse } from '@/lib/api-helpers'

export async function GET(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(getMockTraining())
    }

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const courseId = searchParams.get('courseId')
    const status = searchParams.get('status')
    const propertyId = searchParams.get('propertyId')

    const { db } = await import('@/lib/db')
    if (!db) return NextResponse.json(getMockTraining())

    try {
      const where: Record<string, unknown> = {}
      if (employeeId) where.empleadoId = employeeId
      if (courseId) where.capacitacionId = courseId
      if (status) where.estado = status

      if (propertyId) {
        const employees = await db.empleado.findMany({
          where: { propiedadId: propertyId },
          select: { id: true },
        })
        const employeeIds = employees.map((e: { id: string }) => e.id)
        where.empleadoId = { in: employeeIds }
      }

      const employeeCourses = await db.empleadoCapacitacion.findMany({
        where,
        include: {
          empleado: {
            select: { id: true, nombre: true, empleadoId: true, posicion: true, posicionEn: true, foto: true, propiedadId: true },
          },
          capacitacion: {
            select: { id: true, titulo: true, tituloEn: true, categoria: true, categoriaEn: true, modalidad: true, duracion: true, dificultad: true, puntos: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json(employeeCourses)
    } catch {
      return NextResponse.json(getMockTraining())
    }
  } catch (error) {
    console.error('Training GET error:', error)
    return NextResponse.json(getMockTraining())
  }
}

export async function POST(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(getDemoModeResponse('create', 'enrollment'), { status: 201 })
    }

    const body = await request.json()
    const { db } = await import('@/lib/db')
    if (!db) return NextResponse.json(getDemoModeResponse('create', 'enrollment'), { status: 201 })

    try {
      // Check if already enrolled
      const existing = await db.empleadoCapacitacion.findFirst({
        where: { empleadoId: body.employeeId, capacitacionId: body.courseId },
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Employee already enrolled in this course' },
          { status: 409 }
        )
      }

      const employeeCourse = await db.empleadoCapacitacion.create({
        data: {
          empleadoId: body.employeeId,
          capacitacionId: body.courseId,
          estado: 'no_iniciado',
          progreso: 0,
        },
        include: {
          empleado: { select: { nombre: true, empleadoId: true, posicion: true } },
          capacitacion: { select: { titulo: true, tituloEn: true, categoria: true } },
        },
      })

      // Update employee coursesInProgress count
      await db.empleado.update({
        where: { id: body.employeeId },
        data: { cursosEnProgreso: { increment: 1 } },
      })

      return NextResponse.json(employeeCourse, { status: 201 })
    } catch {
      return NextResponse.json(getDemoModeResponse('create', 'enrollment'), { status: 201 })
    }
  } catch (error) {
    console.error('Training POST error:', error)
    return NextResponse.json(getDemoModeResponse('create', 'enrollment'), { status: 201 })
  }
}
