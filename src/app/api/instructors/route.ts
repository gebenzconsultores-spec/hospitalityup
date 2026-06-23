import { NextResponse } from 'next/server'
import { isDatabaseAvailable } from '@/lib/db'
import { getMockInstructors } from '@/lib/api-helpers'

export async function GET(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(getMockInstructors())
    }

    const { searchParams } = new URL(request.url)
    const region = searchParams.get('region')
    const available = searchParams.get('available')
    const specialty = searchParams.get('specialty')

    const { db } = await import('@/lib/db')
    if (!db) return NextResponse.json(getMockInstructors())

    try {
      const where: Record<string, unknown> = {}
      if (region) where.region = region
      if (available !== null && available !== undefined) {
        where.disponible = available === 'true'
      }
      if (specialty) where.especialidad = { contains: specialty }

      const instructors = await db.instructor.findMany({
        where,
        include: { _count: { select: { bookings: true } } },
        orderBy: { calificacion: 'desc' },
      })

      return NextResponse.json(instructors)
    } catch {
      return NextResponse.json(getMockInstructors())
    }
  } catch (error) {
    console.error('Instructors GET error:', error)
    return NextResponse.json(getMockInstructors())
  }
}
