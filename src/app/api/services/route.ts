import { NextResponse } from 'next/server'
import { isDatabaseAvailable } from '@/lib/db'
import { getMockServices, getDemoModeResponse } from '@/lib/api-helpers'

export async function GET(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(getMockServices())
    }

    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')
    const category = searchParams.get('category')
    const active = searchParams.get('active')

    const { db } = await import('@/lib/db')
    if (!db) return NextResponse.json(getMockServices())

    try {
      const where: Record<string, unknown> = {}
      if (propertyId) where.propiedadId = propertyId
      if (category) where.categoria = category
      if (active !== null && active !== undefined) {
        where.disponible = active === 'true'
      }

      const services = await db.servicio.findMany({
        where,
        include: { propiedad: { select: { nombre: true, nombreEn: true } } },
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json(services)
    } catch {
      return NextResponse.json(getMockServices())
    }
  } catch (error) {
    console.error('Services GET error:', error)
    return NextResponse.json(getMockServices())
  }
}

export async function POST(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(getDemoModeResponse('create', 'service'), { status: 201 })
    }

    const body = await request.json()
    const { db } = await import('@/lib/db')
    if (!db) return NextResponse.json(getDemoModeResponse('create', 'service'), { status: 201 })

    try {
      const service = await db.servicio.create({
        data: {
          nombre: body.name,
          nombreEn: body.nameEn,
          descripcion: body.description,
          descripcionEn: body.descriptionEn,
          categoria: body.category,
          categoriaEn: body.categoryEn,
          precioNormal: body.price,
          objetivoUpselling: body.upsellingTarget,
          imagen: body.image,
          disponible: body.active !== undefined ? body.active : true,
          propiedadId: body.propertyId,
        },
        include: { propiedad: { select: { nombre: true, nombreEn: true } } },
      })

      return NextResponse.json(service, { status: 201 })
    } catch {
      return NextResponse.json(getDemoModeResponse('create', 'service'), { status: 201 })
    }
  } catch (error) {
    console.error('Services POST error:', error)
    return NextResponse.json(getDemoModeResponse('create', 'service'), { status: 201 })
  }
}
