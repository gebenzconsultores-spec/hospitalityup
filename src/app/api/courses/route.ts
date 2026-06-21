import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const modality = searchParams.get('modality')
    const difficulty = searchParams.get('difficulty')
    const propertyId = searchParams.get('propertyId')

    const where: Record<string, unknown> = { active: true }
    if (category) where.category = category
    if (modality) where.modality = modality
    if (difficulty) where.difficulty = difficulty
    if (propertyId) where.propertyId = propertyId

    const courses = await db.course.findMany({
      where,
      include: {
        property: {
          select: { name: true, nameEn: true },
        },
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Compute completion rate for each course
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const total = course._count.enrollments
        const completed = await db.employeeCourse.count({
          where: { courseId: course.id, status: 'completed' },
        })
        return {
          ...course,
          enrollmentCount: total,
          completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        }
      })
    )

    return NextResponse.json(coursesWithStats)
  } catch (error) {
    console.error('Courses GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const course = await db.course.create({
      data: {
        title: body.title,
        titleEn: body.titleEn,
        description: body.description,
        descriptionEn: body.descriptionEn,
        category: body.category,
        categoryEn: body.categoryEn,
        modality: body.modality,
        duration: body.duration,
        difficulty: body.difficulty || 'beginner',
        difficultyEn: body.difficultyEn,
        contentUrl: body.contentUrl,
        thumbnail: body.thumbnail,
        position: body.position,
        positionEn: body.positionEn,
        points: body.points || 10,
        active: body.active !== undefined ? body.active : true,
        propertyId: body.propertyId || null,
      },
      include: {
        property: {
          select: { name: true, nameEn: true },
        },
      },
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error('Courses POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    )
  }
}
