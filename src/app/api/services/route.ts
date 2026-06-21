import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')
    const category = searchParams.get('category')
    const active = searchParams.get('active')

    const where: Record<string, unknown> = {}
    if (propertyId) where.propertyId = propertyId
    if (category) where.category = category
    if (active !== null && active !== undefined) {
      where.active = active === 'true'
    }

    const services = await db.service.findMany({
      where,
      include: {
        property: {
          select: { name: true, nameEn: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error('Services GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const service = await db.service.create({
      data: {
        name: body.name,
        nameEn: body.nameEn,
        description: body.description,
        descriptionEn: body.descriptionEn,
        category: body.category,
        categoryEn: body.categoryEn,
        price: body.price,
        upsellingTarget: body.upsellingTarget,
        image: body.image,
        active: body.active !== undefined ? body.active : true,
        propertyId: body.propertyId,
      },
      include: {
        property: {
          select: { name: true, nameEn: true },
        },
      },
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error('Services POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    )
  }
}
