import { NextResponse } from 'next/server'
import { isDatabaseAvailable } from '@/lib/db'
import { getMockCourses, getDemoModeResponse } from '@/lib/api-helpers'

export async function GET(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(getMockCourses())
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const modality = searchParams.get('modality')
    const difficulty = searchParams.get('difficulty')
    const propertyId = searchParams.get('propertyId')

    const { db } = await import('@/lib/db')
    if (!db) return NextResponse.json(getMockCourses())

    try {
      const where: Record<string, unknown> = { activo: true }
      if (category) where.categoria = category
      if (modality) where.modalidad = modality
      if (difficulty) where.dificultad = difficulty
      if (propertyId) where.propiedadId = propertyId

      const courses = await db.capacitacion.findMany({
        where,
        include: {
          propiedad: { select: { nombre: true, nombreEn: true } },
          _count: { select: { inscripciones: true } },
        },
        orderBy: { createdAt: 'desc' },
      })

      const coursesWithStats = await Promise.all(
        courses.map(async (course: Record<string, unknown>) => {
          const total = (course._count as Record<string, number>).inscripciones
          const completed = await db.empleadoCapacitacion.count({
            where: { capacitacionId: course.id as string, estado: 'completado' },
          })
          return {
            ...course,
            enrollmentCount: total,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
          }
        })
      )

      return NextResponse.json(coursesWithStats)
    } catch {
      return NextResponse.json(getMockCourses())
    }
  } catch (error) {
    console.error('Courses GET error:', error)
    return NextResponse.json(getMockCourses())
  }
}

export async function POST(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(getDemoModeResponse('create', 'course'), { status: 201 })
    }

    const body = await request.json()
    const { db } = await import('@/lib/db')
    if (!db) return NextResponse.json(getDemoModeResponse('create', 'course'), { status: 201 })

    try {
      const course = await db.capacitacion.create({
        data: {
          titulo: body.title,
          tituloEn: body.titleEn,
          descripcion: body.description,
          descripcionEn: body.descriptionEn,
          categoria: body.category,
          categoriaEn: body.categoryEn,
          modalidad: body.modality,
          duracion: body.duration,
          dificultad: body.difficulty || 'principiante',
          dificultadEn: body.difficultyEn,
          urlContenido: body.contentUrl,
          miniatura: body.thumbnail,
          posicion: body.position,
          posicionEn: body.positionEn,
          puntos: body.points || 10,
          activo: body.active !== undefined ? body.active : true,
          propiedadId: body.propertyId || null,
        },
        include: { propiedad: { select: { nombre: true, nombreEn: true } } },
      })

      return NextResponse.json(course, { status: 201 })
    } catch {
      return NextResponse.json(getDemoModeResponse('create', 'course'), { status: 201 })
    }
  } catch (error) {
    console.error('Courses POST error:', error)
    return NextResponse.json(getDemoModeResponse('create', 'course'), { status: 201 })
  }
}
