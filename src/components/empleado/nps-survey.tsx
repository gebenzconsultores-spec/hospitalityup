'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Star,
  Send,
  CheckCircle2,
  RefreshCw,
  MessageSquare,
  ThumbsUp,
  Minus,
  ThumbsDown,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/lib/store'
import { translations } from '@/lib/i18n'
import { toast } from 'sonner'

interface Servicio {
  id: string
  nombre: string
  nombreEn: string | null
  precioNormal: number
  categoria: string
  propiedadId: string
}

interface EncuestaHistorial {
  id: string
  nombreServicio: string
  calificacionNPS: number
  comentario: string | null
  esPromotor: boolean | null
  fechaVenta: string
  createdAt: string
}

function getRatingEmoji(score: number): string {
  if (score >= 9) return '😄'
  if (score >= 7) return '🙂'
  if (score >= 5) return '😐'
  if (score >= 3) return '😕'
  return '😡'
}

function getRatingColor(score: number): string {
  if (score >= 9) return 'bg-emerald-500 text-white'
  if (score >= 7) return 'bg-teal-500 text-white'
  if (score >= 5) return 'bg-amber-500 text-white'
  if (score >= 3) return 'bg-orange-500 text-white'
  return 'bg-red-500 text-white'
}

function getNPSCategory(score: number, t: typeof translations.es.npsSurvey) {
  if (score >= 9) return { label: t.promotores, icon: ThumbsUp, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' }
  if (score >= 7) return { label: t.pasivos, icon: Minus, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30' }
  return { label: t.detractores, icon: ThumbsDown, color: 'text-red-600 bg-red-50 dark:bg-red-950/30' }
}

export function NpsSurvey() {
  const { locale, userPropiedadId, userEmpleadoId } = useAppStore()
  const t = translations[locale]
  const tn = t.npsSurvey
  const tc = t.common

  const [servicios, setServicios] = useState<Servicio[]>([])
  const [selectedServicio, setSelectedServicio] = useState('')
  const [calificacion, setCalificacion] = useState<number | null>(null)
  const [comentario, setComentario] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [historial, setHistorial] = useState<EncuestaHistorial[]>([])
  const [showHistorial, setShowHistorial] = useState(false)

  const fetchServicios = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (userPropiedadId) params.set('propiedadId', userPropiedadId)
      params.set('disponible', 'true')
      const res = await fetch(`/api/servicios?${params}`)
      const data = await res.json()
      setServicios(Array.isArray(data) ? data : (data.servicios || []))
    } catch {
      setServicios([])
    }
  }, [userPropiedadId])

  const fetchHistorial = useCallback(async () => {
    if (!userEmpleadoId) return
    try {
      const params = new URLSearchParams()
      params.set('empleadoId', userEmpleadoId)
      params.set('limit', '20')
      const res = await fetch(`/api/ventas?${params}`)
      const data = await res.json()
      const ventas = data.ventas || data || []
      setHistorial(ventas.filter((v: Record<string, unknown>) => v.calificacionNPS !== null && v.calificacionNPS !== undefined))
    } catch {
      setHistorial([])
    }
  }, [userEmpleadoId])

  useEffect(() => {
    fetchServicios()
    fetchHistorial()
  }, [fetchServicios, fetchHistorial])

  const handleSubmit = async () => {
    if (!selectedServicio || calificacion === null) {
      toast.error(locale === 'es' ? 'Selecciona un servicio y calificación' : 'Select a service and rating')
      return
    }

    setSubmitting(true)
    try {
      const servicio = servicios.find(s => s.id === selectedServicio)
      const body = {
        empleadoId: userEmpleadoId,
        propiedadId: userPropiedadId,
        nombreServicio: servicio?.nombre || '',
        servicioId: selectedServicio,
        cantidad: 1,
        precioUnitario: servicio?.precioNormal || 0,
        montoTotal: servicio?.precioNormal || 0,
        esUpselling: false,
        montoUpselling: 0,
        calificacionNPS: calificacion,
        comentario: comentario || null,
        fuenteNPS: 'app',
        categoriaServicio: servicio?.categoria || null,
      }

      const res = await fetch('/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setSubmitted(true)
        toast.success(tn.encuestaExitosa)
        fetchHistorial()
      } else {
        toast.error(tc.error)
      }
    } catch {
      toast.error(tc.error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleNewSurvey = () => {
    setSelectedServicio('')
    setCalificacion(null)
    setComentario('')
    setSubmitted(false)
  }

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
          <h2 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">{tn.encuestaExitosa}</h2>
          <p className="text-muted-foreground mb-6">
            {locale === 'es' ? `Calificación: ${calificacion}/10` : `Rating: ${calificacion}/10`} {getRatingEmoji(calificacion || 0)}
          </p>
          <Button onClick={handleNewSurvey} className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
            <RefreshCw className="size-4" />
            {tn.nuevaEncuesta}
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{tn.title}</h1>
        <p className="text-sm text-muted-foreground">{tn.subtitle}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main survey form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Service selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{tn.servicio}</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedServicio} onValueChange={setSelectedServicio}>
                <SelectTrigger>
                  <SelectValue placeholder={tn.seleccionarServicio} />
                </SelectTrigger>
                <SelectContent>
                  {servicios.length === 0 ? (
                    <SelectItem value="_none" disabled>{tn.noServicios}</SelectItem>
                  ) : (
                    servicios.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        {locale === 'es' ? s.nombre : (s.nombreEn || s.nombre)} - ${s.precioNormal}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Rating */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{tn.calificacion}</CardTitle>
              <CardDescription className="text-xs">{tn.calificacionDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Visual rating scale */}
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {Array.from({ length: 11 }, (_, i) => i).map(score => (
                  <motion.button
                    key={score}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCalificacion(score)}
                    className={`size-11 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-150 ${
                      calificacion === score
                        ? getRatingColor(score) + ' shadow-lg ring-2 ring-offset-2 ring-teal-400'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {score}
                  </motion.button>
                ))}
              </div>

              {/* Emoji and category display */}
              {calificacion !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <span className="text-3xl">{getRatingEmoji(calificacion)}</span>
                  <div className="mt-2">
                    {(() => {
                      const cat = getNPSCategory(calificacion, tn)
                      const Icon = cat.icon
                      return (
                        <Badge className={`${cat.color} gap-1`}>
                          <Icon className="size-3" />
                          {cat.label}
                        </Badge>
                      )
                    })()}
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Comment */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="size-5 text-muted-foreground" />
                {tn.comentario}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={tn.comentarioPlaceholder}
                value={comentario}
                onChange={e => setComentario(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Submit */}
          <Button
            className="w-full bg-teal-600 hover:bg-teal-700 text-white gap-2 h-12 text-base"
            onClick={handleSubmit}
            disabled={submitting || !selectedServicio || calificacion === null}
          >
            {submitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <Send className="size-5" />
            )}
            {submitting ? tn.enviando : tn.enviarEncuesta}
          </Button>
        </div>

        {/* Sidebar: History */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="size-5 text-amber-500" />
                  {tn.historial}
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
                {historial.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {locale === 'es' ? 'Sin encuestas previas' : 'No previous surveys'}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {historial.map((h, i) => (
                      <div key={h.id || i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                        <span className="text-lg">{getRatingEmoji(h.calificacionNPS)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{h.nombreServicio}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(h.fechaVenta || h.createdAt).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US')}
                          </p>
                        </div>
                        <Badge className={`text-[10px] ${getRatingColor(h.calificacionNPS)}`}>
                          {h.calificacionNPS}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {/* Quick Stats */}
          {historial.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{locale === 'es' ? 'Promedio' : 'Average'}</span>
                    <span className="font-bold text-teal-600">
                      {(historial.reduce((sum, h) => sum + h.calificacionNPS, 0) / historial.length).toFixed(1)}
                    </span>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-sm font-bold text-emerald-600">
                        {historial.filter(h => h.calificacionNPS >= 9).length}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{tn.promotores}</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-amber-600">
                        {historial.filter(h => h.calificacionNPS >= 7 && h.calificacionNPS < 9).length}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{tn.pasivos}</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-red-600">
                        {historial.filter(h => h.calificacionNPS < 7).length}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{tn.detractores}</div>
                    </div>
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
