import { NextResponse } from 'next/server'
import { isDatabaseAvailable } from '@/lib/db'
import { getMockEmployees, getDemoModeResponse } from '@/lib/api-helpers'

export async function GET(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(getMockEmployees())
    }

    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')
    const status = searchParams.get('status')
    const department = searchParams.get('department')

    const { db } = await import('@/lib/db')
    if (!db) return NextResponse.json(getMockEmployees())

    // Try using the Spanish model names (actual Prisma models)
    const where: Record<string, unknown> = {}
    if (propertyId) where.propiedadId = propertyId
    if (status) where.estado = status
    if (department) where.departamento = department

    try {
      const employees = await db.empleado.findMany({
        where,
        include: {
          propiedad: {
            select: { nombre: true, nombreEn: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      // Transform to English field names
      const transformed = employees.map((e: Record<string, unknown>) => ({
        id: e.id,
        employeeId: e.empleadoId,
        name: e.nombre,
        position: e.posicion,
        positionEn: e.posicionEn,
        department: e.departamento,
        departmentEn: e.departamentoEn,
        photo: e.foto,
        hireDate: e.fechaIngreso,
        status: e.estado,
        careerLevel: e.nivelCarrera,
        careerPath: e.rutaCarrera,
        careerPathEn: e.rutaCarreraEn,
        knowledgeScore: e.puntuacionConocimiento,
        salesScore: e.puntuacionVentas,
        hospitalityScore: e.puntuacionHospitalidad,
        overallScore: e.puntuacionTotal,
        totalUpselling: e.totalUpselling,
        avgNPS: e.npsPromedio,
        coursesCompleted: e.cursosCompletados,
        coursesInProgress: e.cursosEnProgreso,
        happinessIndex: e.indiceFelicidad,
        turnoverRisk: e.riesgoBaja,
        propertyId: e.propiedadId,
        property: e.propiedad ? { name: (e.propiedad as Record<string, unknown>).nombre, nameEn: (e.propiedad as Record<string, unknown>).nombreEn } : null,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      }))

      return NextResponse.json(transformed)
    } catch {
      return NextResponse.json(getMockEmployees())
    }
  } catch (error) {
    console.error('Employees GET error:', error)
    return NextResponse.json(getMockEmployees())
  }
}

export async function POST(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(getDemoModeResponse('create', 'employee'), { status: 201 })
    }

    const body = await request.json()
    const { db } = await import('@/lib/db')
    if (!db) return NextResponse.json(getDemoModeResponse('create', 'employee'), { status: 201 })

    try {
      const employee = await db.empleado.create({
        data: {
          empleadoId: body.employeeId,
          nombre: body.name,
          posicion: body.position,
          posicionEn: body.positionEn,
          departamento: body.department,
          departamentoEn: body.departmentEn,
          foto: body.photo,
          fechaIngreso: new Date(body.hireDate),
          estado: body.status || 'onboarding',
          nivelCarrera: body.careerLevel || 1,
          rutaCarrera: body.careerPath || '',
          rutaCarreraEn: body.careerPathEn,
          puntuacionConocimiento: body.knowledgeScore || 0,
          puntuacionVentas: body.salesScore || 0,
          puntuacionHospitalidad: body.hospitalityScore || 0,
          puntuacionTotal: body.overallScore || 0,
          totalUpselling: body.totalUpselling || 0,
          npsPromedio: body.avgNPS || 0,
          cursosCompletados: body.coursesCompleted || 0,
          cursosEnProgreso: body.coursesInProgress || 0,
          indiceFelicidad: body.happinessIndex || 80,
          riesgoBaja: body.turnoverRisk || 0,
          propiedadId: body.propertyId,
        },
        include: {
          propiedad: { select: { nombre: true, nombreEn: true } },
        },
      })

      return NextResponse.json(employee, { status: 201 })
    } catch {
      return NextResponse.json(getDemoModeResponse('create', 'employee'), { status: 201 })
    }
  } catch (error) {
    console.error('Employees POST error:', error)
    return NextResponse.json(getDemoModeResponse('create', 'employee'), { status: 201 })
  }
}
