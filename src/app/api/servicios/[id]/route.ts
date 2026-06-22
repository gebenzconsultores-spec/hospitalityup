import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/servicios/[id] - Detalle de un servicio
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const servicio = await db.servicio.findUnique({
      where: { id },
      include: {
        propiedad: {
          select: { id: true, nombre: true, nombreEn: true, tipo: true, moneda: true },
        },
      },
    })

    if (!servicio) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(servicio)
  } catch (error) {
    console.error('Servicio GET error:', error)
    return NextResponse.json(
      { error: 'Error al obtener servicio' },
      { status: 500 }
    )
  }
}

// PATCH /api/servicios/[id] - Actualizar servicio
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar que existe
    const existing = await db.servicio.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      )
    }

    const body = await request.json()

    // Si se actualiza categoría, validar que sea válida
    if (body.categoria) {
      const categoriasValidas = [
        'platillo',
        'bebida',
        'tour',
        'masaje',
        'habitacion',
        'experiencia',
        'paquete',
        'otro',
      ]

      if (!categoriasValidas.includes(body.categoria)) {
        return NextResponse.json(
          {
            error: `Categoría inválida. Categorías válidas: ${categoriasValidas.join(', ')}`,
          },
          { status: 400 }
        )
      }
    }

    // Si se actualiza propiedadId, verificar que existe
    if (body.propiedadId) {
      const propiedad = await db.propiedad.findUnique({
        where: { id: body.propiedadId },
      })
      if (!propiedad) {
        return NextResponse.json(
          { error: 'La propiedad especificada no existe' },
          { status: 404 }
        )
      }
    }

    // Construir objeto de actualización solo con campos proporcionados
    const updateData: Record<string, unknown> = {}
    const allowedFields = [
      'nombre',
      'nombreEn',
      'descripcion',
      'descripcionEn',
      'categoria',
      'esUpselling',
      'precioNormal',
      'precioUpselling',
      'objetivoUpselling',
      'objetivoUpsellingEn',
      'imagen',
      'disponible',
      'orden',
      'propiedadId',
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    const servicio = await db.servicio.update({
      where: { id },
      data: updateData,
      include: {
        propiedad: {
          select: { id: true, nombre: true, nombreEn: true },
        },
      },
    })

    return NextResponse.json(servicio)
  } catch (error) {
    console.error('Servicio PATCH error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar servicio' },
      { status: 500 }
    )
  }
}

// DELETE /api/servicios/[id] - Eliminar servicio (soft delete: disponible = false)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar que existe
    const existing = await db.servicio.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      )
    }

    // Soft delete: marcar como no disponible
    const servicio = await db.servicio.update({
      where: { id },
      data: { disponible: false },
      include: {
        propiedad: {
          select: { id: true, nombre: true, nombreEn: true },
        },
      },
    })

    return NextResponse.json({
      message: 'Servicio desactivado exitosamente',
      servicio,
    })
  } catch (error) {
    console.error('Servicio DELETE error:', error)
    return NextResponse.json(
      { error: 'Error al eliminar servicio' },
      { status: 500 }
    )
  }
}
