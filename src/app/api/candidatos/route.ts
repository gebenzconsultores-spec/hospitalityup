import { NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'
import { getMockCandidatos, getDemoModeResponse } from '@/lib/api-helpers'

// ─── GET: Listar candidatos del pool con filtros ─────────────
export async function GET(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(getMockCandidatos())
    }

    const { searchParams } = new URL(request.url)
    const region = searchParams.get('region')
    const posicion = searchParams.get('posicion')
    const estado = searchParams.get('estado')
    const propiedadId = searchParams.get('propiedadId')
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const where: Record<string, unknown> = {}
    if (region) where.region = region
    if (posicion) where.posicion = posicion
    if (estado) where.estado = estado
    if (propiedadId) where.propiedadId = propiedadId

    const [candidatos, total] = await Promise.all([
      db.candidatoPool.findMany({
        where,
        include: {
          propiedad: {
            select: { nombre: true, region: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.candidatoPool.count({ where }),
    ])

    return NextResponse.json({ candidatos, total, limit, offset })
  } catch (error) {
    console.error('Candidatos GET error:', error)
    return NextResponse.json(getMockCandidatos())
  }
}

// ─── POST: Agregar candidato al pool ─────────────────────────
export async function POST(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(getDemoModeResponse('create', 'candidato'), { status: 201 })
    }

    const body = await request.json()

    // Validate required fields
    if (!body.nombre) {
      return NextResponse.json(
        { error: 'nombre es requerido' },
        { status: 400 }
      )
    }
    if (!body.posicion) {
      return NextResponse.json(
        { error: 'posicion es requerido' },
        { status: 400 }
      )
    }
    if (!body.region) {
      return NextResponse.json(
        { error: 'region es requerido' },
        { status: 400 }
      )
    }

    const candidato = await db.candidatoPool.create({
      data: {
        nombre: body.nombre,
        email: body.email || null,
        telefono: body.telefono || null,
        posicion: body.posicion,
        posicionEn: body.posicionEn || null,
        region: body.region,
        experiencia: body.experiencia || 0,
        habilidades: body.habilidades ? JSON.stringify(body.habilidades) : null,
        estado: body.estado || 'disponible',
        puntuacionEntrevista: body.puntuacionEntrevista ?? null,
        notas: body.notas || null,
        fuente: body.fuente || 'referido',
        propiedadId: body.propiedadId || null,
        empleadoReemplazaId: body.empleadoReemplazaId || null,
        onboardingCompletado: false,
        nivelAlcanzado: 0,
      },
      include: {
        propiedad: {
          select: { nombre: true, region: true },
        },
      },
    })

    return NextResponse.json(candidato, { status: 201 })
  } catch (error) {
    console.error('Candidatos POST error:', error)
    return NextResponse.json(getDemoModeResponse('create', 'candidato'), { status: 201 })
  }
}

// ─── PATCH: Actualizar estado de candidato ───────────────────
export async function PATCH(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(getDemoModeResponse('update', 'candidato'))
    }

    const body = await request.json()

    if (!body.id) {
      return NextResponse.json(
        { error: 'id es requerido' },
        { status: 400 }
      )
    }

    // Verify candidato exists
    const existing = await db.candidatoPool.findUnique({
      where: { id: body.id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Candidato no encontrado' },
        { status: 404 }
      )
    }

    // Build update data
    const updateData: Record<string, unknown> = {}

    if (body.estado) {
      const validEstados = ['disponible', 'en_proceso', 'contratado', 'rechazado']
      if (!validEstados.includes(body.estado)) {
        return NextResponse.json(
          { error: `estado debe ser uno de: ${validEstados.join(', ')}` },
          { status: 400 }
        )
      }
      updateData.estado = body.estado

      // If hired, set hire date
      if (body.estado === 'contratado') {
        updateData.fechaContratacion = new Date()
      }
    }

    if (body.puntuacionEntrevista !== undefined) {
      updateData.puntuacionEntrevista = body.puntuacionEntrevista
    }

    if (body.notas !== undefined) {
      updateData.notas = body.notas
    }

    if (body.propiedadId !== undefined) {
      updateData.propiedadId = body.propiedadId
    }

    if (body.empleadoReemplazaId !== undefined) {
      updateData.empleadoReemplazaId = body.empleadoReemplazaId
    }

    if (body.onboardingCompletado !== undefined) {
      updateData.onboardingCompletado = body.onboardingCompletado
    }

    if (body.nivelAlcanzado !== undefined) {
      updateData.nivelAlcanzado = body.nivelAlcanzado
    }

    if (body.habilidades !== undefined) {
      updateData.habilidades = JSON.stringify(body.habilidades)
    }

    const candidato = await db.candidatoPool.update({
      where: { id: body.id },
      data: updateData,
      include: {
        propiedad: {
          select: { nombre: true, region: true },
        },
      },
    })

    return NextResponse.json(candidato)
  } catch (error) {
    console.error('Candidatos PATCH error:', error)
    return NextResponse.json(getDemoModeResponse('update', 'candidato'))
  }
}
