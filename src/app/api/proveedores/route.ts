import { NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'

// GET /api/proveedores - Listar proveedores
export async function GET(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json([])
    }

    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo')
    const region = searchParams.get('region')
    const empresaId = searchParams.get('empresaId')

    const where: Record<string, unknown> = {}
    if (tipo) where.tipo = tipo
    if (region) where.region = region
    if (empresaId) where.empresaId = empresaId

    const proveedores = await db.proveedor.findMany({
      where,
      include: {
        _count: {
          select: { productos: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(proveedores)
  } catch (error) {
    console.error('Proveedores GET error:', error)
    return NextResponse.json([])
  }
}

// POST /api/proveedores - Crear proveedor
export async function POST(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json({ success: true, demo: true }, { status: 201 })
    }

    const body = await request.json()

    const proveedor = await db.proveedor.create({
      data: {
        nombre: body.nombre,
        nombreEn: body.nombreEn,
        tipo: body.tipo || 'otro',
        rfc: body.rfc,
        contactoNombre: body.contactoNombre,
        contactoEmail: body.contactoEmail,
        contactoTelefono: body.contactoTelefono,
        direccion: body.direccion,
        region: body.region,
        ciudad: body.ciudad,
        paginaWeb: body.paginaWeb,
        logo: body.logo,
        activo: body.activo !== undefined ? body.activo : true,
        calificacion: body.calificacion || 0,
        notas: body.notas,
        empresaId: body.empresaId || null,
      },
      include: {
        _count: { select: { productos: true } },
      },
    })

    // Crear notificación
    try {
      await db.notificacion.create({
        data: {
          tipo: 'nuevo_proveedor',
          titulo: 'Nuevo proveedor registrado',
          mensaje: `${proveedor.nombre} - ${proveedor.tipo}`,
          leida: false,
          prioridad: 'normal',
        },
      })
    } catch {}

    return NextResponse.json(proveedor, { status: 201 })
  } catch (error) {
    console.error('Proveedores POST error:', error)
    return NextResponse.json({ error: 'Error al crear proveedor' }, { status: 500 })
  }
}
