import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// ─── GET: Listar servicios con filtros opcionales ─────────────
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const propiedadId = searchParams.get('propiedadId')
    const categoria = searchParams.get('categoria')
    const esUpselling = searchParams.get('esUpselling')
    const disponible = searchParams.get('disponible')

    const where: Record<string, unknown> = {}
    if (propiedadId) where.propiedadId = propiedadId
    if (categoria) where.categoria = categoria
    if (esUpselling !== null && esUpselling !== undefined) {
      where.esUpselling = esUpselling === 'true'
    }
    if (disponible !== null && disponible !== undefined) {
      where.disponible = disponible === 'true'
    }

    const servicios = await db.servicio.findMany({
      where,
      include: {
        propiedad: {
          select: { id: true, nombre: true, nombreEn: true, moneda: true },
        },
      },
      orderBy: [{ orden: 'asc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json(servicios)
  } catch (error) {
    console.error('Servicios GET error:', error)
    return NextResponse.json(
      { error: 'Error al obtener servicios' },
      { status: 500 }
    )
  }
}

// ─── POST: Crear nuevo servicio ───────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.propiedadId) {
      return NextResponse.json(
        { error: 'propiedadId es requerido' },
        { status: 400 }
      )
    }
    if (!body.nombre) {
      return NextResponse.json(
        { error: 'nombre es requerido' },
        { status: 400 }
      )
    }
    if (body.precioNormal === undefined || body.precioNormal === null) {
      return NextResponse.json(
        { error: 'precioNormal es requerido' },
        { status: 400 }
      )
    }

    const servicio = await db.servicio.create({
      data: {
        propiedadId: body.propiedadId,
        nombre: body.nombre,
        nombreEn: body.nombreEn || null,
        descripcion: body.descripcion || null,
        descripcionEn: body.descripcionEn || null,
        categoria: body.categoria || 'otro',
        categoriaEn: body.categoriaEn || null,
        esUpselling: body.esUpselling || false,
        precioNormal: body.precioNormal,
        precioUpselling: body.precioUpselling || null,
        objetivoUpselling: body.objetivoUpselling || null,
        objetivoUpsellingEn: body.objetivoUpsellingEn || null,
        imagen: body.imagen || null,
        disponible: body.disponible !== undefined ? body.disponible : true,
        orden: body.orden || 0,
      },
      include: {
        propiedad: {
          select: { id: true, nombre: true, nombreEn: true, moneda: true },
        },
      },
    })

    return NextResponse.json(servicio, { status: 201 })
  } catch (error) {
    console.error('Servicios POST error:', error)
    return NextResponse.json(
      { error: 'Error al crear servicio' },
      { status: 500 }
    )
  }
}
