import { NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'
import { getMockPropiedades } from '@/lib/api-helpers'

/**
 * POST /api/auth/empresa
 * Body: { propiedadId: string, password: string }
 * Returns: { success: true, propiedad: {...} } on match
 *          { success: false, error: '...' } otherwise
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { propiedadId, password } = body

    if (!propiedadId || !password) {
      return NextResponse.json(
        { success: false, error: 'propiedadId and password are required' },
        { status: 400 }
      )
    }

    if (!isDatabaseAvailable()) {
      // Mock mode: verify against mock data
      const prop = getMockPropiedades().find((p) => p.id === propiedadId)
      if (!prop) {
        return NextResponse.json(
          { success: false, error: 'Propiedad no encontrada' },
          { status: 404 }
        )
      }
      if (!prop.activo) {
        return NextResponse.json(
          { success: false, error: 'Propiedad inactiva. Contacta al administrador.' },
          { status: 403 }
        )
      }
      if (prop.password !== password) {
        return NextResponse.json(
          { success: false, error: 'Contraseña incorrecta' },
          { status: 401 }
        )
      }
      return NextResponse.json({
        success: true,
        propiedad: {
          id: prop.id,
          nombre: prop.nombre,
          nombreEn: prop.nombreEn,
          tipo: prop.tipo,
          region: prop.region,
          plan: prop.plan,
          moneda: prop.moneda,
          activo: prop.activo,
        },
      })
    }

    // Database mode
    const propiedad = await db.propiedad.findUnique({
      where: { id: propiedadId },
      select: {
        id: true,
        nombre: true,
        nombreEn: true,
        tipo: true,
        ubicacion: true,
        region: true,
        plan: true,
        moneda: true,
        activo: true,
        password: true,
        contactoNombre: true,
        contactoEmail: true,
        contactoTelefono: true,
      },
    })

    if (!propiedad) {
      return NextResponse.json(
        { success: false, error: 'Propiedad no encontrada' },
        { status: 404 }
      )
    }

    if (!propiedad.activo) {
      return NextResponse.json(
        { success: false, error: 'Propiedad inactiva. Contacta al administrador.' },
        { status: 403 }
      )
    }

    if (propiedad.password !== password) {
      return NextResponse.json(
        { success: false, error: 'Contraseña incorrecta' },
        { status: 401 }
      )
    }

    // Omit password from response
    const { password: _pwd, ...propiedadSafe } = propiedad
    void _pwd
    return NextResponse.json({
      success: true,
      propiedad: propiedadSafe,
    })
  } catch (error) {
    console.error('Auth empresa POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
