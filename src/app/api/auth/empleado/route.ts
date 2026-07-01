import { NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'
import { getMockEmpleados } from '@/lib/api-helpers'

/**
 * POST /api/auth/empleado
 * Body: { empleadoId: string, password: string }
 * Returns: { success: true, empleado: {...}, propiedadId } on match
 *          { success: false, error: '...' } otherwise
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { empleadoId, password } = body

    if (!empleadoId || !password) {
      return NextResponse.json(
        { success: false, error: 'empleadoId and password are required' },
        { status: 400 }
      )
    }

    // Normalize empleadoId (uppercase, trim)
    const normalizedId = String(empleadoId).trim().toUpperCase()

    if (!isDatabaseAvailable()) {
      // Mock mode
      const emp = getMockEmpleados().find(
        (e) => e.empleadoId.toUpperCase() === normalizedId
      )
      if (!emp) {
        return NextResponse.json(
          { success: false, error: 'Empleado no encontrado' },
          { status: 404 }
        )
      }
      if (emp.estado === 'inactivo') {
        return NextResponse.json(
          { success: false, error: 'Empleado inactivo. Contacta a tu gerente.' },
          { status: 403 }
        )
      }
      if (emp.password !== password) {
        return NextResponse.json(
          { success: false, error: 'Contraseña incorrecta' },
          { status: 401 }
        )
      }
      return NextResponse.json({
        success: true,
        empleado: {
          id: emp.id,
          empleadoId: emp.empleadoId,
          nombre: emp.nombre,
          posicion: emp.posicion,
          posicionEn: emp.posicionEn,
          departamento: emp.departamento,
          departamentoEn: emp.departamentoEn,
          foto: emp.foto,
          estado: emp.estado,
          nivelCarrera: emp.nivelCarrera,
        },
        propiedadId: emp.propiedadId,
        propiedad: emp.propiedad,
      })
    }

    // Database mode
    const empleado = await db.empleado.findFirst({
      where: { empleadoId: normalizedId },
      include: {
        propiedad: {
          select: {
            id: true,
            nombre: true,
            nombreEn: true,
            region: true,
            tipo: true,
            activo: true,
          },
        },
      },
    })

    if (!empleado) {
      return NextResponse.json(
        { success: false, error: 'Empleado no encontrado' },
        { status: 404 }
      )
    }

    if (!empleado.propiedad.activo) {
      return NextResponse.json(
        { success: false, error: 'La propiedad está inactiva. Contacta al administrador.' },
        { status: 403 }
      )
    }

    if (empleado.estado === 'inactivo') {
      return NextResponse.json(
        { success: false, error: 'Empleado inactivo. Contacta a tu gerente.' },
        { status: 403 }
      )
    }

    if (empleado.password !== password) {
      return NextResponse.json(
        { success: false, error: 'Contraseña incorrecta' },
        { status: 401 }
      )
    }

    // Omit password from response
    const { password: _pwd, ...empleadoSafe } = empleado
    void _pwd
    return NextResponse.json({
      success: true,
      empleado: empleadoSafe,
      propiedadId: empleado.propiedadId,
      propiedad: empleado.propiedad,
    })
  } catch (error) {
    console.error('Auth empleado POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
