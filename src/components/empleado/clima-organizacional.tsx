'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Heart,
  Send,
  CheckCircle2,
  RefreshCw,
  MessageSquare,
  History,
  TrendingUp,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/lib/store'
import { translations } from '@/lib/i18n'
import { toast } from 'sonner'

interface ClimaQuestion {
  key: string
  label: string
  description: string
  value: number
}

interface ClimaEvaluation {
  id: string
  empleadoId: string
  respuestas: Record<string, number>
  promedio: number
  comentarios: string | null
  createdAt: string
}

const scaleLabels = (t: typeof translations.es.clima) => [
  { value: 1, label: t.muyInsatisfecho, emoji: '😡', color: 'bg-red-500 text-white' },
  { value: 2, label: t.insatisfecho, emoji: '😕', color: 'bg-orange-500 text-white' },
  { value: 3, label: t.neutral, emoji: '😐', color: 'bg-amber-500 text-white' },
  { value: 4, label: t.satisfecho, emoji: '🙂', color: 'bg-teal-500 text-white' },
  { value: 5, label: t.muySatisfecho, emoji: '😄', color: 'bg-emerald-500 text-white' },
]

function getQuestions(t: typeof translations.es.clima): ClimaQuestion[] {
  return [
    { key: 'entornoTrabajo', label: t.entornoTrabajo, description: t.entornoTrabajoDesc, value: 0 },
    { key: 'apoyoSupervisor', label: t.apoyoSupervisor, description: t.apoyoSupervisorDesc, value: 0 },
    { key: 'herramientasRecursos', label: t.herramientasRecursos, description: t.herramientasRecursosDesc, value: 0 },
    { key: 'oportunidadesCrecimiento', label: t.oportunidadesCrecimiento, description: t.oportunidadesCrecimientoDesc, value: 0 },
    { key: 'balanceVida', label: t.balanceVida, description: t.balanceVidaDesc, value: 0 },
  ]
}

export function ClimaOrganizacional() {
  const { locale, userEmpleadoId } = useAppStore()
  const t = translations[locale]
  const tc = t.clima
  const tCommon = t.common

  const [questions, setQuestions] = useState<ClimaQuestion[]>(() => getQuestions(tc))
  const [comentarios, setComentarios] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [evaluaciones, setEvaluaciones] = useState<ClimaEvaluation[]>([])
  const [showHistorial, setShowHistorial] = useState(false)

  const fetchEvaluaciones = useCallback(async () => {
    if (!userEmpleadoId) return
    try {
      const res = await fetch(`/api/clima?empleadoId=${userEmpleadoId}`)
      if (res.ok) {
        const data = await res.json()
        setEvaluaciones(data.evaluaciones || [])
      }
    } catch {
      // Will use empty array
    }
  }, [userEmpleadoId])

  useEffect(() => {
    fetchEvaluaciones()
  }, [fetchEvaluaciones])

  const handleSetAnswer = (questionKey: string, value: number) => {
    setQuestions(prev => prev.map(q => q.key === questionKey ? { ...q, value } : q))
  }

  const allAnswered = questions.every(q => q.value > 0)
  const promedio = allAnswered ? questions.reduce((sum, q) => sum + q.value, 0) / questions.length : 0

  const handleSubmit = async () => {
    if (!allAnswered) {
      toast.error(locale === 'es' ? 'Responde todas las preguntas' : 'Answer all questions')
      return
    }

    setSubmitting(true)
    try {
      const respuestas: Record<string, number> = {}
      questions.forEach(q => { respuestas[q.key] = q.value })

      const res = await fetch('/api/clima', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empleadoId: userEmpleadoId,
          respuestas,
          promedio,
          comentarios: comentarios || null,
        }),
      })

      if (res.ok) {
        setSubmitted(true)
        toast.success(tc.evaluacionExitosa)
        fetchEvaluaciones()
      } else {
        toast.error(tCommon.error)
      }
    } catch {
      toast.error(tCommon.error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleNewEvaluation = () => {
    setQuestions(getQuestions(tc))
    setComentarios('')
    setSubmitted(false)
  }

  const sLabels = scaleLabels(tc)

  if (submitted) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-12"
        >
          <div className="inline-flex items-center justify-center size-20 rounded-full bg-emerald-100 dark:bg-emerald-950/30 mb-4">
            <CheckCircle2 className="size-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">{tc.evaluacionExitosa}</h2>
          <p className="text-muted-foreground mb-2">
            {tc.promedio}: <span className="font-bold text-teal-600">{promedio.toFixed(1)}/5</span>
          </p>
          <div className="flex justify-center gap-1 mb-6">
            {sLabels.map(s => (
              <span key={s.value} className={`text-xl ${promedio >= s.value ? 'opacity-100' : 'opacity-20'}`}>
                {s.emoji}
              </span>
            ))}
          </div>
          <Button onClick={handleNewEvaluation} className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
            <RefreshCw className="size-4" />
            {tc.nuevaEvaluacion}
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{tc.title}</h1>
        <p className="text-sm text-muted-foreground">{tc.subtitle}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main evaluation form */}
        <div className="lg:col-span-2 space-y-4">
          {questions.map((question, qIdx) => (
            <motion.div
              key={question.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: qIdx * 0.05 }}
            >
              <Card className={question.value > 0 ? 'border-teal-200 dark:border-teal-800' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center size-8 rounded-lg bg-teal-50 dark:bg-teal-950/30 text-teal-600 font-bold text-sm shrink-0">
                      {qIdx + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{question.label}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{question.description}</p>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {sLabels.map(s => (
                          <motion.button
                            key={s.value}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSetAnswer(question.key, s.value)}
                            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-150 border-2 min-w-[60px] ${
                              question.value === s.value
                                ? `${s.color} border-transparent shadow-md`
                                : 'bg-muted/50 border-transparent hover:bg-muted'
                            }`}
                          >
                            <span className="text-lg">{s.emoji}</span>
                            <span className={`text-[9px] font-medium text-center leading-tight ${
                              question.value === s.value ? 'text-white' : 'text-muted-foreground'
                            }`}>
                              {s.label}
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Comments */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="size-5 text-muted-foreground" />
                {tc.comentarios}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={tc.comentariosPlaceholder}
                value={comentarios}
                onChange={e => setComentarios(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Progress & Submit */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {locale === 'es' ? 'Progreso' : 'Progress'}
                </span>
                <span className="font-medium">
                  {questions.filter(q => q.value > 0).length}/{questions.length}
                </span>
              </div>
              <Progress
                value={(questions.filter(q => q.value > 0).length / questions.length) * 100}
                className="h-2 [&>[data-slot=progress-indicator]]:bg-teal-500"
              />

              {allAnswered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-sm"
                >
                  <TrendingUp className="size-4 text-teal-600" />
                  <span>{tc.promedio}: <strong className="text-teal-600">{promedio.toFixed(1)}/5</strong></span>
                </motion.div>
              )}

              <Button
                className="w-full bg-teal-600 hover:bg-teal-700 text-white gap-2 h-12 text-base"
                onClick={handleSubmit}
                disabled={submitting || !allAnswered}
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <Send className="size-5" />
                )}
                {submitting ? tc.enviando : tc.enviarEvaluacion}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: History */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="size-5 text-amber-500" />
                  {tc.historial}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowHistorial(!showHistorial)}>
                  {showHistorial
                    ? (locale === 'es' ? 'Ocultar' : 'Hide')
                    : (locale === 'es' ? 'Ver' : 'View')
                  }
                </Button>
              </div>
            </CardHeader>
            {showHistorial && (
              <CardContent className="max-h-96 overflow-y-auto">
                {evaluaciones.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="size-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">{tc.sinEvaluaciones}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {evaluaciones.map((ev, i) => (
                      <div key={ev.id || i} className="p-3 rounded-lg bg-muted/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {new Date(ev.createdAt).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US')}
                          </span>
                          <Badge className="bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                            {ev.promedio.toFixed(1)}/5
                          </Badge>
                        </div>
                        {ev.comentarios && (
                          <p className="text-[11px] text-muted-foreground line-clamp-2">{ev.comentarios}</p>
                        )}
                        <div className="flex gap-1">
                          {Object.values(ev.respuestas).map((val: number, j: number) => (
                            <div
                              key={j}
                              className="flex-1 h-1.5 rounded-full"
                              style={{
                                backgroundColor: val >= 4 ? '#10b981' : val >= 3 ? '#f59e0b' : '#ef4444',
                                opacity: 0.7,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {/* Average across evaluations */}
          {evaluaciones.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-teal-600">
                    {(evaluaciones.reduce((sum, ev) => sum + ev.promedio, 0) / evaluaciones.length).toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground">{tc.promedio} {locale === 'es' ? 'general' : 'overall'}</div>
                  <Separator className="my-3" />
                  <div className="text-sm text-muted-foreground">
                    {evaluaciones.length} {locale === 'es' ? 'evaluaciones' : 'evaluations'}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
