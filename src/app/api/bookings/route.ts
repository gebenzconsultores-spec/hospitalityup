import { NextResponse } from 'next/server'
import { isDatabaseAvailable } from '@/lib/db'
import { getMockBookings, getDemoModeResponse } from '@/lib/api-helpers'

export async function GET(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(getMockBookings())
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const propertyId = searchParams.get('propertyId')
    const courseId = searchParams.get('courseId')
    const modality = searchParams.get('modality')

    const { db } = await import('@/lib/db')
    if (!db) return NextResponse.json(getMockBookings())

    try {
      const where: Record<string, unknown> = {}
      if (status) where.estado = status
      if (propertyId) where.propiedadId = propertyId
      if (courseId) where.capacitacionId = courseId
      if (modality) where.modalidad = modality

      const bookings = await db.solicitudCapacitacion.findMany({
        where,
        include: {
          capacitacion: {
            select: { titulo: true, tituloEn: true, categoria: true, modalidad: true, duracion: true },
          },
          propiedad: {
            select: { nombre: true, nombreEn: true, region: true },
          },
        },
        orderBy: { fechaSolicitada: 'desc' },
      })

      return NextResponse.json(bookings)
    } catch {
      return NextResponse.json(getMockBookings())
    }
  } catch (error) {
    console.error('Bookings GET error:', error)
    return NextResponse.json(getMockBookings())
  }
}

export async function POST(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(getDemoModeResponse('create', 'booking'), { status: 201 })
    }

    const body = await request.json()
    const { db } = await import('@/lib/db')
    if (!db) return NextResponse.json(getDemoModeResponse('create', 'booking'), { status: 201 })

    try {
      const booking = await db.solicitudCapacitacion.create({
        data: {
          propiedadId: body.propertyId,
          capacitacionId: body.courseId || null,
          modalidad: body.modality,
          fechaSolicitada: new Date(body.date),
          fechaConfirmada: body.endTime ? new Date(body.endTime) : null,
          participantes: body.participants || 1,
          nombreInstructor: body.instructorName || null,
          estado: body.status || 'pendiente',
          costo: body.cost || null,
          notas: body.notes || null,
        },
        include: {
          capacitacion: { select: { titulo: true, tituloEn: true } },
          propiedad: { select: { nombre: true, nombreEn: true } },
        },
      })

      return NextResponse.json(booking, { status: 201 })
    } catch {
      return NextResponse.json(getDemoModeResponse('create', 'booking'), { status: 201 })
    }
  } catch (error) {
    console.error('Bookings POST error:', error)
    return NextResponse.json(getDemoModeResponse('create', 'booking'), { status: 201 })
  }
}
