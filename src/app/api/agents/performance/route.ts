import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

// ─── System Prompt ───────────────────────────────────────────
const SYSTEM_PROMPT = `Eres el "Analista de Desempeño y Predictor de Churn" de HospitalityUP, una plataforma SaaS para el sector de hospitalidad (hoteles y restaurantes).

Tu trabajo es analizar los datos de desempeño de un empleado y determinar si está en riesgo de abandonar la empresa (churn).

DEBES responder ÚNICAMENTE con un JSON válido con la siguiente estructura exacta:
{
  "nivel_riesgo_baja": boolean,
  "severidad": "bajo" | "medio" | "alto" | "critico",
  "probabilidad_abandono": number (0-100),
  "justificacion": string (explicación detallada de por qué el empleado está o no en riesgo),
  "sugerencia_capacitacion": string (curso o acción específica recomendada),
  "factores_riesgo": string[] (lista de factores detectados),
  "acciones_recomendadas": string[] (lista de acciones inmediatas)
}

Criterios de análisis:
- Estancamiento en árbol de carrera (nivelCarrera sin cambio en 3+ meses)
- NPS bajo consecutivo (promedio < 7 en últimas 2 semanas)
- Falta de interacción con la app (sin actividad 5+ días)
- Baja felicidad laboral (índiceFelicidad < 60)
- Caída en ventas de upselling
- Poca participación en capacitaciones
- Combinación de puntuaciónVentas alta con puntuaciónHospitalidad baja (upselling agresivo)

NO incluyas texto adicional fuera del JSON. Solo el JSON.`

// ─── Types ───────────────────────────────────────────────────
interface AIAnalysisResult {
  nivel_riesgo_baja: boolean
  severidad: 'bajo' | 'medio' | 'alto' | 'critico'
  probabilidad_abandono: number
  justificacion: string
  sugerencia_capacitacion: string
  factores_riesgo: string[]
  acciones_recomendadas: string[]
}

// ─── Helper: Parse AI JSON response ──────────────────────────
function parseAIResponse(raw: string): AIAnalysisResult | null {
  try {
    // Try direct parse first
    return JSON.parse(raw) as AIAnalysisResult
  } catch {
    // Try extracting JSON from markdown code blocks or surrounding text
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]) as AIAnalysisResult
      } catch {
        return null
      }
    }
    return null
  }
}

// ─── POST: Main AI Agent Endpoint ────────────────────────────
export async function POST(request: Request) {
  const startTime = Date.now()
  let empleadoId: string | undefined
  let ventaId: string | undefined

  try {
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
        ventas: {
          orderBy: { fechaVenta: 'desc' },
          take: 20,
        },
        respuestasNps: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        cursos: {
          include: { capacitacion: { select: { titulo: true, categoria: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        alertas: {
          where: { resuelta: false },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
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

    // Calculate recent NPS (last 2 weeks)
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
    const respuestasRecientes = empleado.respuestasNps.filter(
      (r) => r.createdAt >= twoWeeksAgo
    )
    const npsReciente =
      respuestasRecientes.length > 0
        ? respuestasRecientes.reduce((sum, r) => sum + r.puntuacion, 0) / respuestasRecientes.length
        : null

    // Upselling trend (last 5 vs previous 5)
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

    // Career stagnation check
    const mesesEnNivel = empleado.updatedAt
      ? (now.getTime() - empleado.updatedAt.getTime()) / (1000 * 60 * 60 * 24 * 30)
      : 0

    // Completed courses ratio
    const cursosCompletadosRatio = empleado.cursos.length > 0
      ? empleado.cursos.filter((c) => c.estado === 'completado').length / empleado.cursos.length
      : 0

    const userMessage = `
ANÁLISIS DE DESEMPEÑO - EMPLEADO: ${empleado.nombre} (${empleado.empleadoId})
================================================================================

DATOS BÁSICOS:
- Posición: ${empleado.posicion}
- Departamento: ${empleado.departamento}
- Propiedad: ${empleado.propiedad.nombre} (${empleado.propiedad.tipo})
- Región: ${empleado.propiedad.region}
- Días en la empresa: ${diasEnEmpresa}
- Estado actual: ${empleado.estado}
- Nivel de carrera: ${empleado.nivelCarrera}
- Ruta de carrera: ${empleado.rutaCarrera || 'No definida'}

SCORES INTEGRALES:
- Puntuación de Conocimiento: ${empleado.puntuacionConocimiento}/100
- Puntuación de Ventas: ${empleado.puntuacionVentas}/100
- Puntuación de Hospitalidad: ${empleado.puntuacionHospitalidad}/100
- Puntuación Total: ${empleado.puntuacionTotal}/100

MÉTRICAS CLAVE:
- Índice de Felicidad: ${empleado.indiceFelicidad}/100
- Riesgo de Baja actual: ${empleado.riesgoBaja}% (${empleado.nivelRiesgoBaja})
- Total Upselling acumulado: $${empleado.totalUpselling.toFixed(2)}
- NPS Promedio: ${empleado.npsPromedio.toFixed(1)}
- NPS reciente (últimas 2 semanas): ${npsReciente !== null ? npsReciente.toFixed(1) : 'Sin datos'}
- Cursos completados: ${empleado.cursosCompletados} / En progreso: ${empleado.cursosEnProgreso}
- Ratio de cursos completados: ${(cursosCompletadosRatio * 100).toFixed(0)}%
- Días sin actividad en app: ${diasSinActividad ?? 'Sin registro'}
- Meses en nivel actual: ${mesesEnNivel.toFixed(1)}

TENDENCIA DE UPSELLING:
- Promedio upselling reciente (últimas 5 ventas): $${avgRecentUpsell.toFixed(2)}
- Promedio upselling anterior (5 ventas previas): $${avgPreviousUpsell.toFixed(2)}
- Tendencia: ${upsellingTrend > 0 ? '+' : ''}${upsellingTrend.toFixed(1)}%

ÚLTIMAS VENTAS (${empleado.ventas.length} registros):
${empleado.ventas.slice(0, 5).map((v) =>
  `- ${v.fechaVenta.toLocaleDateString('es-MX')}: ${v.nombreServicio || 'Servicio'} | Upselling: $${v.montoUpselling} | NPS: ${v.calificacionNPS ?? 'N/A'} | Total: $${v.montoTotal}`
).join('\n')}

ÚLTIMAS RESPUESTAS NPS (${empleado.respuestasNps.length} registros):
${empleado.respuestasNps.slice(0, 5).map((r) =>
  `- ${r.createdAt.toLocaleDateString('es-MX')}: Puntuación ${r.puntuacion}/10 ${r.esPromotor ? '(Promotor)' : r.puntuacion <= 6 ? '(Detractor)' : '(Pasivo)'} ${r.comentario ? `- "${r.comentario}"` : ''}`
).join('\n')}

CAPACITACIONES (${empleado.cursos.length} registros):
${empleado.cursos.map((c) =>
  `- ${c.capacitacion.titulo} [${c.capacitacion.categoria}]: ${c.estado} (${c.progreso}% progreso)${c.puntuacion ? ` - Puntuación: ${c.puntuacion}` : ''}`
).join('\n')}

ALERTAS ACTIVAS (${empleado.alertas.length}):
${empleado.alertas.length > 0
  ? empleado.alertas.map((a) => `- [${a.severidad}] ${a.tipo}: ${a.mensaje}`).join('\n')
  : 'Sin alertas activas'}

VENTA/TRIGGER ESPECÍFICO: ${ventaId ? `Venta ID: ${ventaId}` : 'Análisis periódico'}
`.trim()

    // ── 3. Invoke AI Model ──
    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      thinking: { type: 'disabled' },
    })

    const rawResponse = completion.choices[0]?.message?.content ?? ''
    const analysis = parseAIResponse(rawResponse)

    if (!analysis) {
      // Log failed parse
      await db.logAgenteIA.create({
        data: {
          tipo: 'prediccion_churn',
          empleadoId: empleado.id,
          ventaId: ventaId ?? null,
          inputPayload: JSON.stringify({ empleadoId, ventaId }),
          outputResultado: rawResponse,
          nivelRiesgo: null,
          procesado: false,
          error: 'No se pudo parsear la respuesta JSON del modelo de IA',
        },
      })

      console.error('AI response could not be parsed:', rawResponse.substring(0, 500))

      return NextResponse.json(
        {
          error: 'El modelo de IA no retornó un JSON válido',
          rawResponse: rawResponse.substring(0, 1000),
        },
        { status: 422 }
      )
    }

    // ── 4. Update empleado with analysis results ──
    const severidadMap: Record<string, string> = {
      bajo: 'bajo',
      medio: 'medio',
      alto: 'alto',
      critico: 'critico',
    }
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
        data: {
          analizadoPorIA: true,
          resultadoIA: JSON.stringify(analysis),
        },
      }).catch(() => {
        // Venta may not exist, continue silently
      })
    }

    // ── 7. Log everything to LogAgenteIA ──
    const processingTime = Date.now() - startTime
    await db.logAgenteIA.create({
      data: {
        tipo: 'prediccion_churn',
        empleadoId: empleado.id,
        ventaId: ventaId ?? null,
        inputPayload: JSON.stringify({
          empleadoId,
          ventaId,
          metricasResumen: {
            indiceFelicidad: empleado.indiceFelicidad,
            riesgoBajaPrevio: empleado.riesgoBaja,
            npsPromedio: empleado.npsPromedio,
            diasSinActividad,
          },
        }),
        outputResultado: JSON.stringify(analysis),
        nivelRiesgo: nivelRiesgo,
        procesado: true,
        error: null,
      },
    })

    // ── 8. Return the analysis ──
    return NextResponse.json({
      success: true,
      empleado: {
        id: empleado.id,
        nombre: empleado.nombre,
        empleadoId: empleado.empleadoId,
        posicion: empleado.posicion,
      },
      analisis: analysis,
      alertaCreada: alertaCreada
        ? { id: alertaCreada.id, severidad: alertaCreada.severidad }
        : null,
      tiempoProcesamiento: `${processingTime}ms`,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    console.error('Performance Agent POST error:', error)

    // Try to log the error
    try {
      await db.logAgenteIA.create({
        data: {
          tipo: 'prediccion_churn',
          empleadoId: empleadoId ?? null,
          ventaId: ventaId ?? null,
          inputPayload: JSON.stringify({ empleadoId, ventaId }),
          outputResultado: null,
          nivelRiesgo: null,
          procesado: false,
          error: errorMessage,
        },
      })
    } catch (logError) {
      console.error('Failed to log agent error:', logError)
    }

    return NextResponse.json(
      { error: 'Error al procesar el análisis del agente de IA', details: errorMessage },
      { status: 500 }
    )
  }
}
