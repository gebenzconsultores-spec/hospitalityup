import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const region = searchParams.get('region')
    const available = searchParams.get('available')
    const specialty = searchParams.get('specialty')

    const where: Record<string, unknown> = {}
    if (region) where.region = region
    if (available !== null && available !== undefined) {
      where.available = available === 'true'
    }
    if (specialty) where.specialty = { contains: specialty }

    const instructors = await db.instructor.findMany({
      where,
      include: {
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: { rating: 'desc' },
    })

    return NextResponse.json(instructors)
  } catch (error) {
    console.error('Instructors GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch instructors' },
      { status: 500 }
    )
  }
}
