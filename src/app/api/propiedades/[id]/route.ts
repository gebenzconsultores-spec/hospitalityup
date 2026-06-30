import { NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'
import { getDemoModeResponse } from '@/lib/api-helpers'

// GET /api/propiedades/[id] - Detalle de una propiedad
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!isDatabaseAvailable()) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada' },
        { status: 404 }
      )
    }

    const propiedad = await db.propiedad.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            empleados: true,
            capacitaciones: true,
            ventasNps: true,
            servicios: true,
          },
        },
      },
    })

    if (!propiedad) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(propiedad)
  } catch (error) {
    console.error('Propiedad GET error:', error)
    return NextResponse.json(
      { error: 'Error al obtener propiedad' },
      { status: 500 }
    )
  }
}

// PUT /api/propiedades/[id] - Actualizar propiedad (full update)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!isDatabaseAvailable()) {
      return NextResponse.json(getDemoModeResponse('update', 'propiedad'))
    }

    const body = await request.json()

    const data: Record<string, unknown> = {}
    if (body.nombre !== undefined) data.nombre = body.nombre
    if (body.nombreEn !== undefined) data.nombreEn = body.nombreEn
    if (body.tipo !== undefined) data.tipo = body.tipo
    if (body.ubicacion !== undefined) data.ubicacion = body.ubicacion
    if (body.region !== undefined) data.region = body.region
    if (body.logo !== undefined) data.logo = body.logo
    if (body.plan !== undefined) data.plan = body.plan
    if (body.moneda !== undefined) data.moneda = body.moneda
    if (body.activo !== undefined) data.activo = body.activo
    if (body.password !== undefined) data.password = body.password
    if (body.contactoNombre !== undefined) data.contactoNombre = body.contactoNombre
    if (body.contactoEmail !== undefined) data.contactoEmail = body.contactoEmail
    if (body.contactoTelefono !== undefined) data.contactoTelefono = body.contactoTelefono

    const propiedad = await db.propiedad.update({
      where: { id },
      data,
    })

    return NextResponse.json(propiedad)
  } catch (error) {
    console.error('Propiedades PUT error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar propiedad' },
      { status: 500 }
    )
  }
}

// PATCH /api/propiedades/[id] - Actualización parcial (toggle activo, password, etc.)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!isDatabaseAvailable()) {
      return NextResponse.json(getDemoModeResponse('update', 'propiedad'))
    }

    const body = await request.json()

    const data: Record<string, unknown> = {}
    if (body.activo !== undefined) data.activo = body.activo
    if (body.password !== undefined) data.password = body.password
    if (body.contactoNombre !== undefined) data.contactoNombre = body.contactoNombre
    if (body.contactoEmail !== undefined) data.contactoEmail = body.contactoEmail
    if (body.contactoTelefono !== undefined) data.contactoTelefono = body.contactoTelefono
    if (body.nombre !== undefined) data.nombre = body.nombre
    if (body.nombreEn !== undefined) data.nombreEn = body.nombreEn
    if (body.tipo !== undefined) data.tipo = body.tipo
    if (body.ubicacion !== undefined) data.ubicacion = body.ubicacion
    if (body.region !== undefined) data.region = body.region
    if (body.plan !== undefined) data.plan = body.plan
    if (body.moneda !== undefined) data.moneda = body.moneda

    const propiedad = await db.propiedad.update({
      where: { id },
      data,
    })

    return NextResponse.json(propiedad)
  } catch (error) {
    console.error('Propiedades PATCH error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar propiedad' },
      { status: 500 }
    )
  }
}

// DELETE /api/propiedades/[id] - Eliminar propiedad
// Primero elimina/borra en cascade los registros relacionados, luego la propiedad
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!isDatabaseAvailable()) {
      return NextResponse.json(getDemoModeResponse('delete', 'propiedad'))
    }

    // Verificar que existe
    const propiedad = await db.propiedad.findUnique({ where: { id } })
    if (!propiedad) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada' },
        { status: 404 }
      )
    }

    // Eliminar en orden de dependencias (cascade manual)
    // 1. Logs de IA relacionados con empleados de esta propiedad
    const empleadosIds = await db.empleado.findMany({
      where: { propiedadId: id },
      select: { id: true },
    })
    const empIds = empleadosIds.map(e => e.id)

    if (empIds.length > 0) {
      await db.logAgenteIA.deleteMany({ where: { empleadoId: { in: empIds } } })
      await db.respuestaNPS.deleteMany({ where: { empleadoId: { in: empIds } } })
      await db.empleadoCapacitacion.deleteMany({ where: { empleadoId: { in: empIds } } })
      await db.alertaRiesgo.deleteMany({ where: { empleadoId: { in: empIds } } })
      await db.ventaNPS.deleteMany({ where: { empleadoId: { in: empIds } } })
    }

    // 2. VentaNPS de la propiedad
    await db.ventaNPS.deleteMany({ where: { propiedadId: id } })

    // 3. Alertas de la propiedad
    await db.alertaRiesgo.deleteMany({ where: { propiedadId: id } })

    // 4. Candidatos vinculados
    await db.candidatoPool.deleteMany({ where: { propiedadId: id } })

    // 5. Solicitudes de capacitación
    await db.solicitudCapacitacion.deleteMany({ where: { propiedadId: id } })

    // 6. Capacitaciones de la propiedad
    // Primero las inscripciones a esas capacitaciones
    const capIds = await db.capacitacion.findMany({
      where: { propiedadId: id },
      select: { id: true },
    })
    if (capIds.length > 0) {
      const capacitacionIds = capIds.map(c => c.id)
      await db.empleadoCapacitacion.deleteMany({
        where: { capacitacionId: { in: capacitacionIds } },
      })
      await db.solicitudCapacitacion.deleteMany({
        where: { capacitacionId: { in: capacitacionIds } },
      })
      await db.capacitacion.deleteMany({
        where: { propiedadId: id },
      })
    }

    // 7. Servicios de la propiedad
    await db.servicio.deleteMany({ where: { propiedadId: id } })

    // 8. Notificaciones de la propiedad
    await db.notificacion.deleteMany({ where: { propiedadId: id } })

    // 9. Empleados de la propiedad
    await db.empleado.deleteMany({ where: { propiedadId: id } })

    // 10. Finalmente, eliminar la propiedad
    await db.propiedad.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Propiedad eliminada correctamente' })
  } catch (error) {
    console.error('Propiedades DELETE error:', error)
    return NextResponse.json(
      { error: 'Error al eliminar propiedad. Verifica que no tenga registros dependientes.' },
      { status: 500 }
    )
  }
}
