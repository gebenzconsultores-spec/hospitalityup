import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const propertyId = searchParams.get('propertyId')
    const courseId = searchParams.get('courseId')
    const modality = searchParams.get('modality')

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (propertyId) where.propertyId = propertyId
    if (courseId) where.courseId = courseId
    if (modality) where.modality = modality

    const bookings = await db.booking.findMany({
      where,
      include: {
        course: {
          select: { title: true, titleEn: true, category: true, modality: true, duration: true },
        },
        instructor: {
          select: { name: true, specialty: true, rating: true },
        },
        property: {
          select: { name: true, nameEn: true, region: true },
        },
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Bookings GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const booking = await db.booking.create({
      data: {
        courseId: body.courseId,
        instructorId: body.instructorId || null,
        propertyId: body.propertyId,
        date: new Date(body.date),
        endTime: body.endTime ? new Date(body.endTime) : null,
        modality: body.modality,
        status: body.status || 'pending',
        participants: body.participants || 1,
        notes: body.notes || null,
        cost: body.cost || null,
      },
      include: {
        course: {
          select: { title: true, titleEn: true },
        },
        instructor: {
          select: { name: true, specialty: true },
        },
        property: {
          select: { name: true, nameEn: true },
        },
      },
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Bookings POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}
