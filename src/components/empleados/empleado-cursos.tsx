'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  BookOpen,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  PlayCircle,
  XCircle,
  GraduationCap,
  Award,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface Capacitacion {
  id: string
  titulo: string
  tituloEn: string | null
  categoria: string
  modalidad: string
  duracion: number
  dificultad: string
  puntos: number
  descripcion: string
}

interface Inscripcion {
  id: string
  estado: string
  progreso: number
  puntuacion: number | null
  fechaInicio: string | null
  fechaCompletado: string | null
  capacitacion: {
    id: string
    titulo: string
    tituloEn: string | null
    categoria: string
    modalidad: string
    duracion: number
    dificultad: string
    puntos: number
    descripcion: string
  }
}

export function EmpleadoCursos({ empleadoId, locale }: { empleadoId: string; locale: string }) {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([])
  const [capacitaciones, setCapacitaciones] = useState<Capacitacion[]>([])
  const [loading, setLoading] = useState(true)
  const [showInscribirDialog, setShowInscribirDialog] = useState(false)
  const [capacitacionSeleccionada, setCapacitacionSeleccionada] = useState('')

  const tt = locale === 'es' ? {
    title: 'Cursos y Capacitaciones',
    subtitle: 'Gestiona los cursos del empleado',
    inscribir: 'Inscribir a Curso',
    sinInscripciones: 'Sin cursos inscritos',
    sinInscripcionesDesc: 'Inscribe al empleado en un curso',
    estado: 'Estado',
    progreso: 'Progreso',
    puntuacion: 'Puntuación',
    fechaInicio: 'Fecha de inicio',
    fechaCompletado: 'Fecha de completado',
    noIniciado: 'No iniciado',
    enProgreso: 'En progreso',
    completado: 'Completado',
    iniciar: 'Iniciar',
    completar: 'Marcar completado',
    desinscribir: 'Desinscribir',
    seleccionarCurso: 'Selecciona un curso',
    cursosDisponibles: 'Cursos disponibles',
    guardar: 'Inscribir',
    cancelar: 'Cancelar',
    inscrita: 'Empleado inscrito correctamente',
    error: 'Error al procesar',
    actualizado: 'Estado actualizado',
    eliminado: 'Inscripción eliminada',
    yaInscrito: 'El empleado ya está inscrito en este curso',
    duracion: 'Duración',
    minutos: 'min',
    puntos: 'puntos',
    modalidad: 'Modalidad',
    dificultad: 'Dificultad',
  } : {
    title: 'Courses & Training',
    subtitle: 'Manage employee courses',
    inscribir: 'Enroll in Course',
    sinInscripciones: 'No enrolled courses',
    sinInscripcionesDesc: 'Enroll the employee in a course',
    estado: 'Status',
    progreso: 'Progress',
    puntuacion: 'Score',
    fechaInicio: 'Start date',
    fechaCompletado: 'Completion date',
    noIniciado: 'Not started',
    enProgreso: 'In progress',
    completado: 'Completed',
    iniciar: 'Start',
    completar: 'Mark as completed',
    desinscribir: 'Unenroll',
    seleccionarCurso: 'Select a course',
    cursosDisponibles: 'Available courses',
    guardar: 'Enroll',
    cancelar: 'Cancel',
    inscrita: 'Employee enrolled successfully',
    error: 'Error processing',
    actualizado: 'Status updated',
    eliminado: 'Enrollment removed',
    yaInscrito: 'Employee is already enrolled in this course',
    duracion: 'Duration',
    minutos: 'min',
    puntos: 'points',
    modalidad: 'Modality',
    dificultad: 'Difficulty',
  }

  const fetchInscripciones = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/empleado-capacitaciones?empleadoId=${empleadoId}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setInscripciones(data)
      }
    } catch {
      // error
    } finally {
      setLoading(false)
    }
  }, [empleadoId])

  const fetchCapacitaciones = useCallback(async () => {
    try {
      const res = await fetch('/api/capacitaciones')
      const data = await res.json()
      if (Array.isArray(data)) {
        // Filtrar cursos en los que ya está inscrito
        const inscritosIds = inscripciones.map(i => i.capacitacion.id)
        setCapacitaciones(data.filter((c: Capacitacion) => !inscritosIds.includes(c.id)))
      }
    } catch {
      // error
    }
  }, [inscripciones])

  useEffect(() => {
    fetchInscripciones()
  }, [fetchInscripciones])

  useEffect(() => {
    if (showInscribirDialog) {
      fetchCapacitaciones()
    }
  }, [showInscribirDialog, fetchCapacitaciones])

  const inscribir = async () => {
    if (!capacitacionSeleccionada) {
      toast.error(tt.seleccionarCurso)
      return
    }

    try {
      const res = await fetch('/api/empleado-capacitaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empleadoId,
          capacitacionId: capacitacionSeleccionada,
        }),
      })

      const data = await res.json()

      if (res.status === 409) {
        toast.error(tt.yaInscrito)
        return
      }

      if (!res.ok) throw new Error(data.error || 'Error')

      toast.success(tt.inscrita)
      setShowInscribirDialog(false)
      setCapacitacionSeleccionada('')
      fetchInscripciones()
    } catch (error) {
      toast.error(String(error) || tt.error)
    }
  }

  const actualizarEstado = async (id: string, estado: string) => {
    try {
      await fetch(`/api/empleado-capacitaciones/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado }),
      })
      toast.success(tt.actualizado)
      fetchInscripciones()
    } catch {
      toast.error(tt.error)
    }
  }

  const eliminarInscripcion = async (id: string) => {
    try {
      await fetch(`/api/empleado-capacitaciones/${id}`, { method: 'DELETE' })
      toast.success(tt.eliminado)
      fetchInscripciones()
    } catch {
      toast.error(tt.error)
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'completado':
        return { color: 'bg-green-100 text-green-700', icon: <CheckCircle className="size-3" />, label: tt.completado }
      case 'en_progreso':
        return { color: 'bg-blue-100 text-blue-700', icon: <Clock className="size-3" />, label: tt.enProgreso }
      default:
        return { color: 'bg-gray-100 text-gray-700', icon: <PlayCircle className="size-3" />, label: tt.noIniciado }
    }
  }

  const getCategoriaColor = (categoria: string) => {
    const colors: Record<string, string> = {
      upselling: 'bg-teal-100 text-teal-700',
      hospitalidad: 'bg-purple-100 text-purple-700',
      conocimiento_producto: 'bg-blue-100 text-blue-700',
      onboarding: 'bg-orange-100 text-orange-700',
      liderazgo: 'bg-indigo-100 text-indigo-700',
    }
    return colors[categoria] || 'bg-gray-100 text-gray-700'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <GraduationCap className="size-5 text-teal-600" />
            {tt.title}
            {inscripciones.length > 0 && (
              <Badge variant="secondary" className="ml-1">{inscripciones.length}</Badge>
            )}
          </CardTitle>
          <Button
            size="sm"
            className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5"
            onClick={() => setShowInscribirDialog(true)}
          >
            <Plus className="size-4" />
            {tt.inscribir}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {inscripciones.length === 0 ? (
          <div className="py-8 text-center">
            <BookOpen className="size-10 mx-auto mb-2 text-muted-foreground/30" />
            <p className="font-medium text-muted-foreground text-sm">{tt.sinInscripciones}</p>
            <p className="text-xs text-muted-foreground/70 mt-1">{tt.sinInscripcionesDesc}</p>
          </div>
        ) : (
          inscripciones.map((ins) => {
            const estadoBadge = getEstadoBadge(ins.estado)
            return (
              <div
                key={ins.id}
                className="rounded-lg border p-3 space-y-2 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{ins.capacitacion.titulo}</span>
                      <Badge variant="outline" className={`text-[10px] ${getCategoriaColor(ins.capacitacion.categoria)}`}>
                        {ins.capacitacion.categoria}
                      </Badge>
                      <Badge variant="outline" className={`text-[10px] gap-1 ${estadoBadge.color}`}>
                        {estadoBadge.icon}
                        {estadoBadge.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {ins.capacitacion.descripcion}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                      <span>⏱️ {ins.capacitacion.duracion} {tt.minutos}</span>
                      <span>🏆 {ins.capacitacion.puntos} {tt.puntos}</span>
                      <span>📚 {ins.capacitacion.modalidad}</span>
                      <span>📊 {ins.capacitacion.dificultad}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-destructive hover:text-destructive shrink-0"
                    onClick={() => eliminarInscripcion(ins.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>

                {/* Progress bar */}
                {ins.estado !== 'no_iniciado' && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{tt.progreso}</span>
                      <span>{ins.progreso}%</span>
                    </div>
                    <Progress value={ins.progreso} className="h-1.5" />
                  </div>
                )}

                {/* Score and dates */}
                <div className="flex items-center gap-3 flex-wrap text-[10px] text-muted-foreground">
                  {ins.puntuacion !== null && (
                    <span className="flex items-center gap-1">
                      <Award className="size-3" />
                      {tt.puntuacion}: <strong>{ins.puntuacion}</strong>
                    </span>
                  )}
                  {ins.fechaInicio && (
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {tt.fechaInicio}: {new Date(ins.fechaInicio).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US')}
                    </span>
                  )}
                  {ins.fechaCompletado && (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="size-3" />
                      {tt.fechaCompletado}: {new Date(ins.fechaCompletado).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US')}
                    </span>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 flex-wrap pt-1">
                  {ins.estado === 'no_iniciado' && (
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => actualizarEstado(ins.id, 'en_progreso')}>
                      <PlayCircle className="size-3 mr-1" />
                      {tt.iniciar}
                    </Button>
                  )}
                  {ins.estado === 'en_progreso' && (
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => actualizarEstado(ins.id, 'completado')}>
                      <CheckCircle className="size-3 mr-1" />
                      {tt.completar}
                    </Button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </CardContent>

      {/* Dialog: Inscribir a curso */}
      <Dialog open={showInscribirDialog} onOpenChange={setShowInscribirDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="size-5 text-teal-600" />
              {tt.inscribir}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {capacitaciones.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {locale === 'es' ? 'No hay cursos disponibles para inscribir' : 'No courses available to enroll'}
              </p>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">{tt.cursosDisponibles}</label>
                <Select value={capacitacionSeleccionada} onValueChange={setCapacitacionSeleccionada}>
                  <SelectTrigger>
                    <SelectValue placeholder={tt.seleccionarCurso} />
                  </SelectTrigger>
                  <SelectContent>
                    {capacitaciones.map((cap) => (
                      <SelectItem key={cap.id} value={cap.id}>
                        {cap.titulo} ({cap.duracion} {tt.minutos})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInscribirDialog(false)}>{tt.cancelar}</Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700"
              onClick={inscribir}
              disabled={!capacitacionSeleccionada || capacitaciones.length === 0}
            >
              {tt.guardar}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
