import { NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'

// GET /api/empresas - Listar empresas
export async function GET(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json([
        {
          id: 'mock-emp-1',
          nombre: 'Grupo Cafe Plaza',
          tipo: 'grupo_restaurantero',
          plan: 'growth',
          maxPropiedades: 5,
          activo: true,
          contactoNombre: 'Juan Pérez',
          contactoEmail: 'juan@cafeplaza.com',
          contactoTelefono: '+52 222 123 4567',
          _count: { propiedades: 5 },
        },
      ])
    }

    const empresas = await db.empresa.findMany({
      include: {
        _count: {
          select: { propiedades: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(empresas)
  } catch (error) {
    console.error('Empresas GET error:', error)
    return NextResponse.json([])
  }
}

// POST /api/empresas - Crear empresa
export async function POST(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json({ success: true, demo: true }, { status: 201 })
    }

    const body = await request.json()

    // Calcular maxPropiedades según plan
    const maxPropiedadesByPlan: Record<string, number> = {
      boutique: 1,
      growth: 5,
      enterprise: 20,
    }
    const maxPropiedades = maxPropiedadesByPlan[body.plan] || 1

    const empresa = await db.empresa.create({
      data: {
        nombre: body.nombre,
        nombreEn: body.nombreEn,
        tipo: body.tipo || 'grupo_restaurantero',
        rfc: body.rfc,
        contactoNombre: body.contactoNombre,
        contactoEmail: body.contactoEmail,
        contactoTelefono: body.contactoTelefono,
        plan: body.plan || 'boutique',
        maxPropiedades,
        password: body.password || 'empresa123',
        activo: body.activo !== undefined ? body.activo : true,
      },
      include: {
        _count: { select: { propiedades: true } },
      },
    })

    // Crear notificación
    try {
      await db.notificacion.create({
        data: {
          tipo: 'nueva_empresa',
          titulo: 'Nueva empresa registrada',
          mensaje: `${empresa.nombre} - Plan ${empresa.plan}`,
          leida: false,
          prioridad: 'alta',
        },
      })
    } catch {}

    return NextResponse.json(empresa, { status: 201 })
  } catch (error) {
    console.error('Empresas POST error:', error)
    return NextResponse.json({ error: 'Error al crear empresa' }, { status: 500 })
  }
}
