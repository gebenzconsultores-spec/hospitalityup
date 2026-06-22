import { NextResponse } from 'next/server'
import { isDatabaseAvailable } from '@/lib/db'
import { getMockEmpleadoDetail, getDemoModeResponse } from '@/lib/api-helpers'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!isDatabaseAvailable()) {
      const mockDetail = getMockEmpleadoDetail(id)
      if (!mockDetail) {
        return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
      }
      // Transform to English field names
      const transformed = {
        id: mockDetail.id,
        employeeId: mockDetail.empleadoId,
        name: mockDetail.nombre,
        position: mockDetail.posicion,
        positionEn: mockDetail.posicionEn,
        department: mockDetail.departamento,
        departmentEn: mockDetail.departamentoEn,
        photo: mockDetail.foto,
        hireDate: mockDetail.fechaIngreso,
        status: mockDetail.estado,
        careerLevel: mockDetail.nivelCarrera,
        careerPath: mockDetail.rutaCarrera,
        careerPathEn: mockDetail.rutaCarreraEn,
        knowledgeScore: mockDetail.puntuacionConocimiento,
        salesScore: mockDetail.puntuacionVentas,
        hospitalityScore: mockDetail.puntuacionHospitalidad,
        overallScore: mockDetail.puntuacionTotal,
        totalUpselling: mockDetail.totalUpselling,
        avgNPS: mockDetail.npsPromedio,
        coursesCompleted: mockDetail.cursosCompletados,
        coursesInProgress: mockDetail.cursosEnProgreso,
        happinessIndex: mockDetail.indiceFelicidad,
        turnoverRisk: mockDetail.riesgoBaja,
        propertyId: mockDetail.propiedadId,
        property: mockDetail.propiedad ? { name: mockDetail.propiedad.nombre, nameEn: mockDetail.propiedad.nombreEn, region: mockDetail.propiedad.region } : null,
      }
      return NextResponse.json(transformed)
    }

    const { db } = await import('@/lib/db')
    if (!db) {
      const mockDetail = getMockEmpleadoDetail(id)
      return NextResponse.json(mockDetail || { error: 'Employee not found' }, { status: mockDetail ? 200 : 404 })
    }

    try {
      const employee = await db.empleado.findUnique({
        where: { id },
        include: {
          propiedad: { select: { nombre: true, nombreEn: true, region: true } },
          cursos: { include: { capacitacion: { select: { titulo: true, tituloEn: true, categoria: true, modalidad: true } } } },
          ventas: { orderBy: { fechaVenta: 'desc' } },
          alertas: { orderBy: { createdAt: 'desc' } },
        },
      })

      if (!employee) {
        return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
      }

      return NextResponse.json(employee)
    } catch {
      const mockDetail = getMockEmpleadoDetail(id)
      return NextResponse.json(mockDetail || { error: 'Employee not found' }, { status: mockDetail ? 200 : 404 })
    }
  } catch (error) {
    console.error('Employee GET error:', error)
    const { id } = await params
    const mockDetail = getMockEmpleadoDetail(id)
    if (!mockDetail) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }
    return NextResponse.json(mockDetail)
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!isDatabaseAvailable()) {
      return NextResponse.json(getDemoModeResponse('update', 'employee'))
    }

    const body = await request.json()
    const { db } = await import('@/lib/db')
    if (!db) return NextResponse.json(getDemoModeResponse('update', 'employee'))

    try {
      const employee = await db.empleado.update({
        where: { id },
        data: {
          ...(body.name !== undefined && { nombre: body.name }),
          ...(body.position !== undefined && { posicion: body.position }),
          ...(body.department !== undefined && { departamento: body.department }),
          ...(body.status !== undefined && { estado: body.status }),
          ...(body.careerLevel !== undefined && { nivelCarrera: body.careerLevel }),
          ...(body.knowledgeScore !== undefined && { puntuacionConocimiento: body.knowledgeScore }),
          ...(body.salesScore !== undefined && { puntuacionVentas: body.salesScore }),
          ...(body.hospitalityScore !== undefined && { puntuacionHospitalidad: body.hospitalityScore }),
          ...(body.overallScore !== undefined && { puntuacionTotal: body.overallScore }),
          ...(body.totalUpselling !== undefined && { totalUpselling: body.totalUpselling }),
          ...(body.avgNPS !== undefined && { npsPromedio: body.avgNPS }),
          ...(body.happinessIndex !== undefined && { indiceFelicidad: body.happinessIndex }),
          ...(body.turnoverRisk !== undefined && { riesgoBaja: body.turnoverRisk }),
        },
        include: { propiedad: { select: { nombre: true, nombreEn: true } } },
      })

      return NextResponse.json(employee)
    } catch {
      return NextResponse.json(getDemoModeResponse('update', 'employee'))
    }
  } catch (error) {
    console.error('Employee PATCH error:', error)
    return NextResponse.json(getDemoModeResponse('update', 'employee'))
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!isDatabaseAvailable()) {
      return NextResponse.json(getDemoModeResponse('deactivate', 'employee'))
    }

    const { db } = await import('@/lib/db')
    if (!db) return NextResponse.json(getDemoModeResponse('deactivate', 'employee'))

    try {
      const employee = await db.empleado.update({
        where: { id },
        data: { estado: 'inactivo' },
      })
      return NextResponse.json(employee)
    } catch {
      return NextResponse.json(getDemoModeResponse('deactivate', 'employee'))
    }
  } catch (error) {
    console.error('Employee DELETE error:', error)
    return NextResponse.json(getDemoModeResponse('deactivate', 'employee'))
  }
}
