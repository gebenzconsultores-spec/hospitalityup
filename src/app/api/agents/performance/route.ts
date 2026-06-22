import { NextResponse } from 'next/server'
import { isDatabaseAvailable } from '@/lib/db'

// ─── POST: Main AI Agent Endpoint (with mock fallback) ────────
export async function POST(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      // In demo mode, return a simulated AI analysis
      const body = await request.json().catch(() => ({}))
      return NextResponse.json({
        success: true,
        demo: true,
        empleado: {
          id: body.empleadoId || 'demo',
          nombre: 'Demo Employee',
          empleadoId: 'DEMO-001',
          posicion: 'Demo Position',
        },
        analisis: {
          nivel_riesgo_baja: true,
          severidad: 'medio',
          probabilidad_abandono: 35,
          justificacion: 'Análisis en modo demo. Se requiere base de datos para análisis completo con IA.',
          sugerencia_capacitacion: 'Habilitar base de datos para recomendaciones personalizadas',
          factores_riesgo: ['Modo demo - sin datos reales'],
          acciones_recomendadas: ['Configurar base de datos para habilitar análisis con IA'],
        },
        alertaCreada: null,
        tiempoProcesamiento: '0ms (demo)',
      })
    }

    const { db } = await import('@/lib/db')
    if (!db) {
      return NextResponse.json({
        success: true,
        demo: true,
        message: 'Database not available - running in demo mode',
      })
    }

    // Dynamic import of ZAI SDK only when database is available
    let ZAI: unknown
    try {
      const zaiModule = await import('z-ai-web-dev-sdk')
      ZAI = zaiModule.default
    } catch {
      // AI SDK not available
      const body = await request.json().catch(() => ({}))
      return NextResponse.json({
        success: true,
        demo: true,
        empleado: { id: body.empleadoId || 'demo' },
        analisis: {
          nivel_riesgo_baja: false,
          severidad: 'bajo',
          probabilidad_abandono: 10,
          justificacion: 'SDK de IA no disponible en este entorno',
          sugerencia_capacitacion: 'N/A',
          factores_riesgo: [],
          acciones_recomendadas: [],
        },
        alertaCreada: null,
        tiempoProcesamiento: '0ms',
      })
    }

    const startTime = Date.now()
    let empleadoId: string | undefined
    let ventaId: string | undefined

    const body = await request.json()
    empleadoId = body.empleadoId
    ventaId = body.ventaId

    if (!empleadoId) {
      return NextResponse.json(
        { error: 'empleadoId es requerido' },
        { status: 400 }
      )
    }

    // ── 1. Fetch empleado with all metrics ──
    const empleado = await db.empleado.findUnique({
      where: { id: empleadoId },
      include: {
        propiedad: { select: { nombre: true, tipo: true, region: true } },
        ventas: { orderBy: { fechaVenta: 'desc' }, take: 20 },
        respuestasNps: { orderBy: { createdAt: 'desc' }, take: 20 },
        cursos: { include: { capacitacion: { select: { titulo: true, categoria: true } } }, orderBy: { createdAt: 'desc' }, take: 10 },
        alertas: { where: { resuelta: false }, orderBy: { createdAt: 'desc' }, take: 5 },
      },
    })

    if (!empleado) {
      return NextResponse.json(
        { error: 'Empleado no encontrado' },
        { status: 404 }
      )
    }

    // ── 2. Build context for AI ──
    const now = new Date()
    const diasSinActividad = empleado.ultimaActividad
      ? Math.floor((now.getTime() - empleado.ultimaActividad.getTime()) / (1000 * 60 * 60 * 24))
      : null

    const diasEnEmpresa = Math.floor(
      (now.getTime() - empleado.fechaIngreso.getTime()) / (1000 * 60 * 60 * 24)
    )

    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
    const respuestasRecientes = empleado.respuestasNps.filter((r) => r.createdAt >= twoWeeksAgo)
    const npsReciente = respuestasRecientes.length > 0
      ? respuestasRecientes.reduce((sum, r) => sum + r.puntuacion, 0) / respuestasRecientes.length
      : null

    const ventasUpselling = empleado.ventas.filter((v) => v.esUpselling)
    const recentUpsell = ventasUpselling.slice(0, 5)
    const previousUpsell = ventasUpselling.slice(5, 10)
    const avgRecentUpsell = recentUpsell.length > 0
      ? recentUpsell.reduce((s, v) => s + v.montoUpselling, 0) / recentUpsell.length
      : 0
    const avgPreviousUpsell = previousUpsell.length > 0
      ? previousUpsell.reduce((s, v) => s + v.montoUpselling, 0) / previousUpsell.length
      : 0
    const upsellingTrend = avgPreviousUpsell > 0
      ? ((avgRecentUpsell - avgPreviousUpsell) / avgPreviousUpsell) * 100
      : 0

    const mesesEnNivel = empleado.updatedAt
      ? (now.getTime() - empleado.updatedAt.getTime()) / (1000 * 60 * 60 * 24 * 30)
      : 0

    const cursosCompletadosRatio = empleado.cursos.length > 0
      ? empleado.cursos.filter((c) => c.estado === 'completado').length / empleado.cursos.length
      : 0

    const SYSTEM_PROMPT = `Eres el "Analista de Desempeño y Predictor de Churn" de HospitalityUP. DEBES responder ÚNICAMENTE con un JSON válido con esta estructura:
{"nivel_riesgo_baja": boolean, "severidad": "bajo"|"medio"|"alto"|"critico", "probabilidad_abandono": number, "justificacion": string, "sugerencia_capacitacion": string, "factores_riesgo": string[], "acciones_recomendadas": string[]}`

    const userMessage = `
ANÁLISIS DE DESEMPEÑO - EMPLEADO: ${empleado.nombre} (${empleado.empleadoId})
Posición: ${empleado.posicion} | Departamento: ${empleado.departamento}
Propiedad: ${empleado.propiedad.nombre} | Días en empresa: ${diasEnEmpresa}
Scores: Conocimiento ${empleado.puntuacionConocimiento}/100 | Ventas ${empleado.puntuacionVentas}/100 | Hospitalidad ${empleado.puntuacionHospitalidad}/100 | Total ${empleado.puntuacionTotal}/100
Felicidad: ${empleado.indiceFelicidad}/100 | Riesgo: ${empleado.riesgoBaja}% | NPS: ${empleado.npsPromedio}
Días sin actividad: ${diasSinActividad ?? 'Sin registro'} | Meses en nivel: ${mesesEnNivel.toFixed(1)}
Upselling tendencia: ${upsellingTrend > 0 ? '+' : ''}${upsellingTrend.toFixed(1)}%
`.trim()

    // ── 3. Invoke AI Model ──
    const zai = await (ZAI as any).create()
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      thinking: { type: 'disabled' },
    })

    const rawResponse = completion.choices[0]?.message?.content ?? ''

    // Parse AI response
    let analysis = null
    try {
      analysis = JSON.parse(rawResponse)
    } catch {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try { analysis = JSON.parse(jsonMatch[0]) } catch { /* continue */ }
      }
    }

    if (!analysis) {
      // Log failed parse
      try {
        await db.logAgenteIA.create({
          data: {
            tipo: 'prediccion_churn',
            empleadoId: empleado.id,
            ventaId: ventaId ?? null,
            inputPayload: JSON.stringify({ empleadoId, ventaId }),
            outputResultado: rawResponse,
            procesado: false,
            error: 'No se pudo parsear la respuesta JSON del modelo de IA',
          },
        })
      } catch { /* log error silently */ }

      return NextResponse.json(
        { error: 'El modelo de IA no retornó un JSON válido', rawResponse: rawResponse.substring(0, 500) },
        { status: 422 }
      )
    }

    // ── 4. Update empleado with analysis results ──
    const severidadMap: Record<string, string> = { bajo: 'bajo', medio: 'medio', alto: 'alto', critico: 'critico' }
    const nivelRiesgo = severidadMap[analysis.severidad] || 'bajo'

    await db.empleado.update({
      where: { id: empleado.id },
      data: {
        riesgoBaja: analysis.probabilidad_abandono,
        nivelRiesgoBaja: nivelRiesgo,
        justificacionRiesgo: analysis.justificacion,
        sugerenciaCapacitacion: analysis.sugerencia_capacitacion,
      },
    })

    // ── 5. Create AlertaRiesgo if risk is high or critical ──
    let alertaCreada = null
    if (['alto', 'critico'].includes(analysis.severidad)) {
      alertaCreada = await db.alertaRiesgo.create({
        data: {
          empleadoId: empleado.id,
          propiedadId: empleado.propiedadId,
          tipo: analysis.factores_riesgo.length > 0
            ? analysis.factores_riesgo[0].toLowerCase().replace(/\s+/g, '_').substring(0, 50)
            : 'riesgo_general',
          severidad: analysis.severidad,
          mensaje: `${analysis.justificacion.substring(0, 200)}... | Factores: ${analysis.factores_riesgo.join(', ')}`,
          probabilidad: analysis.probabilidad_abandono,
          generadoPorIA: true,
          leida: false,
          resuelta: false,
        },
      })
    }

    // ── 6. Update VentaNPS if ventaId provided ──
    if (ventaId) {
      await db.ventaNPS.update({
        where: { id: ventaId },
        data: { analizadoPorIA: true, resultadoIA: JSON.stringify(analysis) },
      }).catch(() => { /* Venta may not exist */ })
    }

    // ── 7. Log to LogAgenteIA ──
    const processingTime = Date.now() - startTime
    try {
      await db.logAgenteIA.create({
        data: {
          tipo: 'prediccion_churn',
          empleadoId: empleado.id,
          ventaId: ventaId ?? null,
          inputPayload: JSON.stringify({ empleadoId, ventaId }),
          outputResultado: JSON.stringify(analysis),
          nivelRiesgo,
          procesado: true,
          error: null,
        },
      })
    } catch { /* log error silently */ }

    return NextResponse.json({
      success: true,
      empleado: { id: empleado.id, nombre: empleado.nombre, empleadoId: empleado.empleadoId, posicion: empleado.posicion },
      analisis: analysis,
      alertaCreada: alertaCreada ? { id: alertaCreada.id, severidad: alertaCreada.severidad } : null,
      tiempoProcesamiento: `${processingTime}ms`,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    console.error('Performance Agent POST error:', error)
    return NextResponse.json(
      { error: 'Error al procesar el análisis del agente de IA', details: errorMessage, demo: true },
      { status: 500 }
    )
  }
}
