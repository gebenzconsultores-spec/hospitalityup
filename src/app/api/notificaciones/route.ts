import { NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'

// GET /api/notificaciones - Listar notificaciones
export async function GET(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      // Mock notifications
      return NextResponse.json([
        {
          id: 'mock-1',
          tipo: 'nueva_venta',
          titulo: 'Nueva venta registrada',
          mensaje: 'Ana García registró una venta de $1,200 USD',
          leida: false,
          prioridad: 'normal',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'mock-2',
          tipo: 'alerta_ia',
          titulo: 'Alerta de riesgo detectada',
          mensaje: 'El sistema detectó riesgo alto en Luis Fernández',
          leida: false,
          prioridad: 'alta',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ])
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const soloNoLeidas = searchParams.get('soloNoLeidas') === 'true'

    const where: Record<string, unknown> = {}
    if (soloNoLeidas) where.leida = false

    const notificaciones = await db.notificacion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json(notificaciones)
  } catch (error) {
    console.error('Notificaciones GET error:', error)
    return NextResponse.json([])
  }
}

// POST /api/notificaciones - Crear notificación
export async function POST(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json({ success: true, demo: true })
    }

    const body = await request.json()

    const notificacion = await db.notificacion.create({
      data: {
        tipo: body.tipo,
        titulo: body.titulo,
        tituloEn: body.tituloEn,
        mensaje: body.mensaje,
        mensajeEn: body.mensajeEn,
        leida: false,
        accionUrl: body.accionUrl,
        propiedadId: body.propiedadId,
        prioridad: body.prioridad || 'normal',
      },
    })

    return NextResponse.json(notificacion, { status: 201 })
  } catch (error) {
    console.error('Notificaciones POST error:', error)
    return NextResponse.json({ error: 'Error al crear notificación' }, { status: 500 })
  }
}
