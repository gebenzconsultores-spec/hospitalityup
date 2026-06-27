import { NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'
import { getDemoModeResponse } from '@/lib/api-helpers'

// ─── GET: Listar evaluaciones de clima ────────────────────────
export async function GET(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      // Return mock clima evaluations
      return NextResponse.json({
        evaluaciones: [
          {
            id: 'clima-mock-1',
            empleadoId: 'emp1',
            respuestas: { entornoTrabajo: 4, apoyoSupervisor: 5, herramientasRecursos: 3, oportunidadesCrecimiento: 4, balanceVida: 3 },
            promedio: 3.8,
            comentarios: 'Buen ambiente en general',
            createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
          },
          {
            id: 'clima-mock-2',
            empleadoId: 'emp1',
            respuestas: { entornoTrabajo: 5, apoyoSupervisor: 4, herramientasRecursos: 4, oportunidadesCrecimiento: 3, balanceVida: 4 },
            promedio: 4.0,
            comentarios: null,
            createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
          },
        ],
      })
    }

    const { searchParams } = new URL(request.url)
    const empleadoId = searchParams.get('empleadoId')
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    // We use RespuestaNPS with source 'clima' to store clima evaluations
    const where: Record<string, unknown> = { fuente: 'clima' }
    if (empleadoId) where.empleadoId = empleadoId

    const respuestas = await db.respuestaNPS.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    // Parse the evaluations from RespuestaNPS format
    const evaluaciones = respuestas.map(r => {
      let respuestas: Record<string, number> = {}
      let comentarios: string | null = null
      let promedio = 0

      try {
        const parsed = r.comentario ? JSON.parse(r.comentario) : {}
        respuestas = parsed.respuestas || {}
        comentarios = parsed.comentarios || null
        promedio = parsed.promedio || 0
      } catch {
        comentarios = r.comentario
      }

      return {
        id: r.id,
        empleadoId: r.empleadoId,
        respuestas,
        promedio,
        comentarios,
        createdAt: r.createdAt.toISOString(),
      }
    })

    return NextResponse.json({ evaluaciones })
  } catch (error) {
    console.error('Clima GET error:', error)
    return NextResponse.json({ evaluaciones: [] })
  }
}

// ─── POST: Crear nueva evaluación de clima ────────────────────
export async function POST(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(getDemoModeResponse('create', 'evaluacion-clima'), { status: 201 })
    }

    const body = await request.json()

    if (!body.empleadoId) {
      return NextResponse.json(
        { error: 'empleadoId es requerido' },
        { status: 400 }
      )
    }

    if (!body.respuestas || Object.keys(body.respuestas).length === 0) {
      return NextResponse.json(
        { error: 'respuestas es requerido' },
        { status: 400 }
      )
    }

    // Store as RespuestaNPS with source 'clima'
    // We encode the full data in the comentario field as JSON
    const dataPayload = JSON.stringify({
      respuestas: body.respuestas,
      promedio: body.promedio || 0,
      comentarios: body.comentarios || null,
    })

    // Calculate an average score for the puntuacion field
    const values = Object.values(body.respuestas as Record<string, number>)
    const avgScore = values.length > 0 ? Math.round((values.reduce((a: number, b: number) => a + b, 0) / values.length) * 2) : 5

    const respuesta = await db.respuestaNPS.create({
      data: {
        empleadoId: body.empleadoId,
        puntuacion: avgScore,
        comentario: dataPayload,
        esPromotor: avgScore >= 8,
        fuente: 'clima',
      },
    })

    return NextResponse.json({
      id: respuesta.id,
      empleadoId: respuesta.empleadoId,
      respuestas: body.respuestas,
      promedio: body.promedio || 0,
      comentarios: body.comentarios || null,
      createdAt: respuesta.createdAt.toISOString(),
    }, { status: 201 })
  } catch (error) {
    console.error('Clima POST error:', error)
    return NextResponse.json(getDemoModeResponse('create', 'evaluacion-clima'), { status: 201 })
  }
}
