import { NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { usuario, password, rol } = body

    if (!usuario || !password || !rol) {
      return NextResponse.json({ error: 'Campos requeridos' }, { status: 400 })
    }

    // Admin hardcodeado por seguridad
    if (rol === 'admin') {
      if (usuario === 'admin' && password === 'admin123') {
        return NextResponse.json({
          success: true,
          id: 'admin-001',
          nombre: 'Administrador',
          rol: 'admin',
          propiedadId: null,
          propiedadNombre: null,
        })
      }
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
    }

    if (!isDatabaseAvailable()) {
      return NextResponse.json({ error: 'Base de datos no disponible' }, { status: 503 })
    }

    // Login de empresa
    if (rol === 'empresa') {
      const propiedad = await db!.propiedad.findFirst({
        where: {
          OR: [
            { contactoEmail: usuario },
            { nombre: { contains: usuario, mode: 'insensitive' } },
          ],
          password,
          activo: true,
        },
      })

      if (!propiedad) {
        return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
      }

      return NextResponse.json({
        success: true,
        id: propiedad.id,
        nombre: propiedad.nombre,
        rol: 'empresa',
        propiedadId: propiedad.id,
        propiedadNombre: propiedad.nombre,
      })
    }

    // Login de empleado
    if (rol === 'empleado') {
      const empleado = await db!.empleado.findFirst({
        where: {
          empleadoId: usuario,
          password,
          estado: { in: ['activo', 'onboarding'] },
        },
        include: {
          propiedad: { select: { id: true, nombre: true } },
        },
      })

      if (!empleado) {
        return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
      }

      return NextResponse.json({
        success: true,
        id: empleado.id,
        nombre: empleado.nombre,
        rol: 'empleado',
        propiedadId: empleado.propiedadId,
        propiedadNombre: empleado.propiedad.nombre,
        empleadoId: empleado.empleadoId,
        posicion: empleado.posicion,
      })
    }

    return NextResponse.json({ error: 'Rol inválido' }, { status: 400 })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}