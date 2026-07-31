import { NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'

export async function GET(request: Request) {
  try {
    if (!isDatabaseAvailable()) return NextResponse.json([])
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo')
    const region = searchParams.get('region')
    const where: Record<string, unknown> = {}
    if (tipo && tipo !== 'todos') where.tipo = tipo
    if (region) where.region = region
    const proveedores = await db!.proveedor.findMany({
      where,
      include: { ProductoProveedor: true },
      orderBy: { nombre: 'asc' },
    })
    const mapped = proveedores.map(p => ({
      ...p,
      productos: p.ProductoProveedor,
    }))
    return NextResponse.json(mapped)
  } catch (error) {
    console.error('Proveedores GET error:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    if (!isDatabaseAvailable()) return NextResponse.json({ success: true, demo: true })
    const body = await request.json()
    const { nombre, nombreEn, tipo, rfc, contactoNombre, contactoEmail,
      contactoTelefono, direccion, region, ciudad, paginaWeb, notas } = body
    if (!nombre || !tipo) {
      return NextResponse.json({ error: 'Nombre y tipo son requeridos' }, { status: 400 })
    }
    const proveedor = await db!.proveedor.create({
      data: {
        id: crypto.randomUUID(),
        nombre, nombreEn, tipo, rfc,
        contactoNombre, contactoEmail,
        contactoTelefono, direccion,
        region, ciudad, paginaWeb, notas,
        activo: true, calificacion: 0,
        updatedAt: new Date(),
      },
    })
    return NextResponse.json(proveedor, { status: 201 })
  } catch (error) {
    console.error('Proveedores POST error:', error)
    return NextResponse.json({ error: 'Error al crear proveedor' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    if (!isDatabaseAvailable()) return NextResponse.json({ success: true, demo: true })
    const body = await request.json()
    const { id, ...data } = body
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    const proveedor = await db!.proveedor.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    })
    return NextResponse.json(proveedor)
  } catch (error) {
    console.error('Proveedores PATCH error:', error)
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}