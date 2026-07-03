import { NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { role, identifier, password } = body

    if (!role || !identifier || !password) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // ─── Admin Login ────────────────────────────────────
    if (role === 'admin') {
      if (identifier === 'admin@hospitalityup.com' && password === 'admin123') {
        return NextResponse.json({
          success: true,
          user: {
            id: 'admin',
            email: 'admin@hospitalityup.com',
            role: 'admin',
            name: 'Administrador',
          },
        })
      }
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    // ─── Gerente Login ──────────────────────────────────
    if (role === 'gerente') {
      if (!isDatabaseAvailable() || !db) {
        return NextResponse.json({ error: 'Base de datos no disponible' }, { status: 503 })
      }

      const propiedad = await db.propiedad.findUnique({
        where: { id: identifier },
      })

      if (propiedad) {
        // Expected password: property name normalized (lowercase, no accents, no spaces)
        const expectedPassword = propiedad.nombre
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]/g, '')

        if (password === expectedPassword) {
          return NextResponse.json({
            success: true,
            user: {
              id: propiedad.id,
              role: 'gerente',
              name: `Gerente ${propiedad.nombre}`,
              propertyId: propiedad.id,
              propertyName: propiedad.nombre,
              propertyType: propiedad.tipo,
              propertyRegion: propiedad.region,
              propertyMoneda: propiedad.moneda,
            },
          })
        }
      }

      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    // ─── Empleado Login ─────────────────────────────────
    if (role === 'empleado') {
      if (!isDatabaseAvailable() || !db) {
        return NextResponse.json({ error: 'Base de datos no disponible' }, { status: 503 })
      }

      const empleado = await db.empleado.findUnique({
        where: { empleadoId: identifier },
        include: {
          propiedad: {
            select: { id: true, nombre: true, nombreEn: true, tipo: true, region: true, moneda: true },
          },
        },
      })

      if (empleado && password === '1234') {
        return NextResponse.json({
          success: true,
          user: {
            id: empleado.id,
            employeeId: empleado.empleadoId,
            role: 'empleado',
            name: empleado.nombre,
            propertyId: empleado.propiedadId,
            propertyName: empleado.propiedad.nombre,
            propertyType: empleado.propiedad.tipo,
            propertyRegion: empleado.propiedad.region,
            propertyMoneda: empleado.propiedad.moneda,
            posicion: empleado.posicion,
            departamento: empleado.departamento,
            estado: empleado.estado,
          },
        })
      }

      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    return NextResponse.json({ error: 'Rol no válido' }, { status: 400 })
  } catch (error) {
    console.error('Auth POST error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
