import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoria = searchParams.get('categoria')
    const modalidad = searchParams.get('modalidad')
    const dificultad = searchParams.get('dificultad')
    const propiedadId = searchParams.get('propiedadId')
    const activo = searchParams.get('activo')

    const where: Record<string, unknown> = {}
    if (categoria) where.categoria = categoria
    if (modalidad) where.modalidad = modalidad
    if (dificultad) where.dificultad = dificultad
    if (propiedadId) where.propiedadId = propiedadId
    if (activo !== null && activo !== undefined) where.activo = activo === 'true'

    const capacitaciones = await db.capacitacion.findMany({
      where,
      include: {
        propiedad: {
          select: { id: true, nombre: true, nombreEn: true },
        },
        _count: {
          select: { inscripciones: true, solicitudes: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Compute completion rate for each capacitación
    const capacitacionesWithStats = await Promise.all(
      capacitaciones.map(async (cap) => {
        const total = cap._count.inscripciones
        const completed = await db.empleadoCapacitacion.count({
          where: { capacitacionId: cap.id, estado: 'completado' },
        })
        const enProgreso = await db.empleadoCapacitacion.count({
          where: { capacitacionId: cap.id, estado: 'en_progreso' },
        })
        return {
          ...cap,
          inscripcionesCount: total,
          completadosCount: completed,
          enProgresoCount: enProgreso,
          tasaCompletado: total > 0 ? Math.round((completed / total) * 100) : 0,
        }
      })
    )

    return NextResponse.json(capacitacionesWithStats)
  } catch (error) {
    console.error('Capacitaciones GET error:', error)
    return NextResponse.json(
      { error: 'Error al obtener capacitaciones' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const capacitacion = await db.capacitacion.create({
      data: {
        titulo: body.titulo,
        tituloEn: body.tituloEn,
        descripcion: body.descripcion,
        descripcionEn: body.descripcionEn,
        categoria: body.categoria,
        categoriaEn: body.categoriaEn,
        modalidad: body.modalidad,
        duracion: body.duracion,
        dificultad: body.dificultad || 'principiante',
        dificultadEn: body.dificultadEn,
        urlContenido: body.urlContenido,
        miniatura: body.miniatura,
        posicion: body.posicion,
        posicionEn: body.posicionEn,
        puntos: body.puntos || 10,
        activo: body.activo !== undefined ? body.activo : true,
        propiedadId: body.propiedadId || null,
      },
      include: {
        propiedad: {
          select: { id: true, nombre: true, nombreEn: true },
        },
      },
    })

    return NextResponse.json(capacitacion, { status: 201 })
  } catch (error) {
    console.error('Capacitaciones POST error:', error)
    return NextResponse.json(
      { error: 'Error al crear capacitación' },
      { status: 500 }
    )
  }
}
