'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  BookOpen, Search, GraduationCap, Users, Calendar,
  PlayCircle, Clock, Monitor, MapPin, Link as LinkIcon,
  DollarSign, UserCheck, ChevronDown, ChevronUp, Plus,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/lib/store'
import { CotizadorCapacitacion } from '@/components/capacitacion/cotizador-capacitacion'
import { translations } from '@/lib/i18n'
import { toast } from 'sonner'

// Interfaces
interface Capacitacion {
  id: string
  titulo: string
  tituloEn: string | null
  descripcion: string
  descripcionEn: string | null
  categoria: string
  categoriaEn: string | null
  modalidad: string
  duracion: number
  dificultad: string
  dificultadEn: string | null
  posicion: string | null
  posicionEn: string | null
  puntos: number
  activo: boolean
  propiedad: { id: string; nombre: string; nombreEn: string | null } | null
  inscripcionesCount: number
  completadosCount: number
  enProgresoCount: number
  tasaCompletado: number
}

interface Solicitud {
  id: string
  modalidad: string
  tema: string | null
  fechaSolicitada: string
  fechaConfirmada: string | null
  participantes: number
  estado: string
  notas: string | null
  linkZoom: string | null
  nombreInstructor: string | null
  costo: number | null
  propiedad: { nombre: string; region?: string }
  capacitacion: { titulo: string; categoria: string } | null
  createdAt: string
}

// Helpers de Estilos e Idioma
function getCategoryColor(cat: string): string {
  switch (cat) {
    case 'upselling': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
    case 'hospitalidad': return 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300'
    case 'conocimiento_producto': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
    case 'onboarding': return 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300'
    case 'liderazgo': return 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300'
    default: return 'bg-muted text-muted-foreground'
  }
}

function getCategoryLabel(cat: string, t: typeof translations.es.capacitacion): string {
  switch (cat) {
    case 'upselling': return t.upselling || 'Upselling'
    case 'hospitalidad': return t.hospitalidad || 'Hospitalidad'
    case 'conocimiento_producto': return t.producto || 'Producto'
    case 'onboarding': return t.onboarding || 'Onboarding'
    case 'liderazgo': return t.liderazgo || 'Liderazgo'
    default: return cat
  }
}

function getEstadoColor(estado: string): string {
  switch (estado) {
    case 'pendiente': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    case 'confirmada': return 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
    case 'completada': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    case 'cancelada': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    default: return 'bg-muted text-muted-foreground'
  }
}

export function CapacitacionModule({
  propiedadFija,
  esEmpresa = false,
}: {
  propiedadFija?: string
  esEmpresa?: boolean
}) {
  const { locale, selectedProperty } = useAppStore()
  const t = translations[locale]?.capacitacion || translations.es.capacitacion

  const [capacitaciones, setCapacitaciones] = useState<Capacitacion[]>([])
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [filtroModalidad, setFiltroModalidad] = useState('todas')
  const [propiedades, setPropiedades] = useState<{ id: string; nombre: string }[]>([])
  const [showCotizador, setShowCotizador] = useState(false)
  const [solicitudExpandida, setSolicitudExpandida] = useState<string | null>(null)

  // Diálogo para administración de solicitudes
  const [showResponderDialog, setShowResponderDialog] = useState(false)
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<Solicitud | null>(null)
  const [formRespuesta, setFormRespuesta] = useState({
    estado: 'confirmada',
    nombreInstructor: '',
    linkZoom: '',
    fechaConfirmada: '',
    costo: '',
    notas: '',
  })

  const propIdFiltro = propiedadFija || (selectedProperty !== 'all' ? selectedProperty : null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const capParams = new URLSearchParams()
      const solParams = new URLSearchParams()

      if (propIdFiltro) {
        capParams.set('propiedadId', propIdFiltro)
        solParams.set('propiedadId', propIdFiltro)
      }
      if (filtroCategoria !== 'todas') capParams.set('categoria', filtroCategoria)
      if (filtroModalidad !== 'todas') capParams.set('modalidad', filtroModalidad)

      const [capRes, solRes, propRes] = await Promise.all([
        fetch(`/api/capacitaciones?${capParams}`),
        fetch(`/api/solicitudes?${solParams}`),
        fetch('/api/propiedades'),
      ])

      const capData = await capRes.json()
      const solData = await solRes.json()
      const propData = await propRes.json()

      setCapacitaciones(Array.isArray(capData) ? capData : [])
      setSolicitudes(Array.isArray(solData) ? solData : [])
      setPropiedades(
        Array.isArray(propData)
          ? propData.map((p: { id: string; nombre: string }) => ({ id: p.id, nombre: p.nombre }))
          : []
      )
    } catch (error) {
      toast.error(locale === 'es' ? 'Error al cargar los datos' : 'Error loading data')
    } finally {
      setLoading(false)
    }
  }, [filtroCategoria, filtroModalidad, propIdFiltro, locale])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleResponder = async () => {
    if (!solicitudSeleccionada) return
    try {
      const res = await fetch('/api/solicitudes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: solicitudSeleccionada.id,
          estado: formRespuesta.estado,
          nombreInstructor: formRespuesta.nombreInstructor || null,
          linkZoom: formRespuesta.linkZoom || null,
          fechaConfirmada: formRespuesta.fechaConfirmada || null,
          costo: formRespuesta.costo ? parseFloat(formRespuesta.costo) : null,
          notas: formRespuesta.notas || null,
        }),
      })

      if (res.ok) {
        toast.success(
          formRespuesta.estado === 'confirmada'
            ? locale === 'es' ? 'Capacitación confirmada' : 'Training confirmed'
            : locale === 'es' ? 'Solicitud actualizada' : 'Request updated'
        )
        setShowResponderDialog(false)
        fetchData()
      } else {
        toast.error(locale === 'es' ? 'Error al responder' : 'Error responding')
      }
    } catch {
      toast.error(locale === 'es' ? 'Error de conexión' : 'Connection error')
    }
  }

  const abrirResponder = (sol: Solicitud) => {
    setSolicitudSeleccionada(sol)
    setFormRespuesta({
      estado: sol.estado === 'pendiente' ? 'confirmada' : sol.estado,
      nombreInstructor: sol.nombreInstructor || '',
      linkZoom: sol.linkZoom || '',
      fechaConfirmada: sol.fechaConfirmada ? new Date(sol.fechaConfirmada).toISOString().split('T')[0] : '',
      costo: sol.costo ? String(sol.costo) : '',
      notas: sol.notas || '',
    })
    setShowResponderDialog(true)
  }

  // Filtrado en cliente por búsqueda
  const capacitacionesFiltradas = capacitaciones.filter((cap) => {
    const titulo = (locale === 'en' && cap.tituloEn ? cap.tituloEn : cap.titulo).toLowerCase()
    return titulo.includes(busqueda.toLowerCase())
  })

  const solicitudesPendientes = solicitudes.filter((s) => s.estado === 'pendiente').length

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-sm text-muted-foreground">{t.subtitle}</p>
        </div>
        <Button
          className="bg-teal-600 hover:bg-teal-700 text-white gap-2 shadow-sm"
          onClick={() => setShowCotizador(true)}
        >
          <Plus className="size-4" />
          {locale === 'es' ? 'Solicitar Capacitación' : 'Request Training'}
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 sm:flex-initial">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder={locale === 'es' ? 'Buscar...' : 'Search...'}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-9 w-full sm:w-48"
          />
        </div>
        <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder={locale === 'es' ? 'Categoría' : 'Category'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">{locale === 'es' ? 'Todas las categorías' : 'All categories'}</SelectItem>
            <SelectItem value="upselling">{t.upselling}</SelectItem>
            <SelectItem value="hospitalidad">{t.hospitalidad}</SelectItem>
            <SelectItem value="conocimiento_producto">{t.producto}</SelectItem>
            <SelectItem value="onboarding">{t.onboarding}</SelectItem>
            <SelectItem value="liderazgo">{t.liderazgo}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filtroModalidad} onValueChange={setFiltroModalidad}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder={t.modalidad} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">{locale === 'es' ? 'Todas' : 'All'}</SelectItem>
            <SelectItem value="virtual">{t.virtual}</SelectItem>
            <SelectItem value="presencial">{t.presencial}</SelectItem>
            <SelectItem value="hibrido">{locale === 'es' ? 'Híbrido' : 'Hybrid'}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Pestañas de Vista */}
      <Tabs defaultValue="catalogo">
        <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-flex">
          <TabsTrigger value="catalogo">
            <BookOpen className="size-4 mr-1.5" />
            {locale === 'es' ? 'Catálogo' : 'Catalog'}
          </TabsTrigger>
          <TabsTrigger value="progreso">
            <PlayCircle className="size-4 mr-1.5" />
            {locale === 'es' ? 'Progreso' : 'Progress'}
          </TabsTrigger>
          <TabsTrigger value="solicitudes">
            <Calendar className="size-4 mr-1.5" />
            {locale === 'es' ? 'Programadas' : 'Scheduled'}
            {solicitudesPendientes > 0 && (
              <Badge className="ml-1.5 bg-amber-500 text-white text-[10px] px-1.5">{solicitudesPendientes}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Catálogo */}
        <TabsContent value="catalogo" className="mt-4">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="h-48 animate-pulse rounded bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : capacitacionesFiltradas.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="size-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">
                {locale === 'es' ? 'No hay capacitaciones disponibles' : 'No training available'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {capacitacionesFiltradas.map((cap) => (
                <Card key={cap.id} className="group hover:shadow-md transition-all flex flex-col justify-between">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm font-semibold leading-tight line-clamp-2">
                        {locale === 'en' && cap.tituloEn ? cap.tituloEn : cap.titulo}
                      </CardTitle>
                      <Badge className={`text-[10px] shrink-0 ${getCategoryColor(cap.categoria)}`}>
                        {getCategoryLabel(cap.categoria, t)}
                      </Badge>
                    </div>
                    {cap.propiedad && (
                      <CardDescription className="text-[11px]">{cap.propiedad.nombre}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="px-4 pb-4 space-y-3">
                    {cap.descripcion && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {locale === 'en' && cap.descripcionEn ? cap.descripcionEn : cap.descripcion}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="outline" className="text-[10px] gap-0.5">
                        {cap.modalidad === 'virtual' ? <Monitor className="size-3" /> : <MapPin className="size-3" />}
                        {cap.modalidad}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] gap-0.5">
                        <Clock className="size-3" />
                        {cap.duracion} min
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">{cap.dificultad}</Badge>
                      <Badge variant="outline" className="text-[10px]">{cap.puntos} pts</Badge>
                    </div>
                    <Separator />
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span>{t.completados}: {cap.completadosCount}/{cap.inscripcionesCount}</span>
                        <span className="font-medium">{cap.tasaCompletado}%</span>
                      </div>
                      <Progress value={cap.tasaCompletado} className="h-1.5 [&>[data-slot=progress-indicator]]:bg-teal-500" />
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-0.5">
                          <PlayCircle className="size-3" />
                          {cap.enProgresoCount} {locale === 'es' ? 'en progreso' : 'in progress'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Progreso */}
        <TabsContent value="progreso" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {capacitacionesFiltradas.map((cap) => (
              <Card key={cap.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm truncate">
                      {locale === 'en' && cap.tituloEn ? cap.tituloEn : cap.titulo}
                    </h3>
                    <Badge className={`text-[10px] ${getCategoryColor(cap.categoria)}`}>
                      {getCategoryLabel(cap.categoria, t)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center mb-2">
                    <div className="rounded-md bg-muted/50 p-2">
                      <div className="text-lg font-bold text-teal-600">{cap.inscripcionesCount}</div>
                      <div className="text-[10px] text-muted-foreground">{locale === 'es' ? 'Inscritos' : 'Enrolled'}</div>
                    </div>
                    <div className="rounded-md bg-muted/50 p-2">
                      <div className="text-lg font-bold text-emerald-600">{cap.completadosCount}</div>
                      <div className="text-[10px] text-muted-foreground">{t.completados}</div>
                    </div>
                    <div className="rounded-md bg-muted/50 p-2">
                      <div className="text-lg font-bold text-amber-600">{cap.enProgresoCount}</div>
                      <div className="text-[10px] text-muted-foreground">{locale === 'es' ? 'En progreso' : 'In progress'}</div>
                    </div>
                  </div>
                  <Progress value={cap.tasaCompletado} className="h-2 [&>[data-slot=progress-indicator]]:bg-teal-500" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab 3: Solicitudes Programadas */}
        <TabsContent value="solicitudes" className="mt-4">
          {solicitudes.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="size-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">
                {locale === 'es' ? 'No hay capacitaciones programadas' : 'No scheduled trainings'}
              </p>
              <Button className="mt-4 bg-teal-600 hover:bg-teal-700 text-white" onClick={() => setShowCotizador(true)}>
                {locale === 'es' ? 'Solicitar capacitación' : 'Request training'}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {solicitudesPendientes > 0 && !esEmpresa && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-400">
                  <span className="font-semibold">{solicitudesPendientes}</span>
                  {locale === 'es' ? ' solicitud(es) pendiente(s) de confirmación' : ' pending request(s) to confirm'}
                </div>
              )}
              {solicitudes.map((sol) => (
                <Card key={sol.id} className={sol.estado === 'pendiente' ? 'border-amber-200 dark:border-amber-800' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-semibold text-sm">
                            {sol.capacitacion?.titulo || sol.tema || (locale === 'es' ? 'Solicitud abierta' : 'Open request')}
                          </span>
                          <Badge className={`text-[10px] ${getEstadoColor(sol.estado)}`}>
                            {sol.estado}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span>{sol.propiedad.nombre}</span>
                          <span className="flex items-center gap-1">
                            {sol.modalidad === 'virtual' ? <Monitor className="size-3" /> : <MapPin className="size-3" />}
                            {sol.modalidad}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="size-3" />
                            {sol.participantes}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {new Date(sol.fechaSolicitada).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US')}
                          </span>
                          {sol.costo && <span className="text-emerald-600 font-medium">${sol.costo.toFixed(0)}</span>}
                        </div>

                        {/* Detalles Desplegables */}
                        {(sol.nombreInstructor || sol.linkZoom || sol.notas) && (
                          <button
                            className="text-xs text-teal-600 hover:underline mt-2 flex items-center gap-1 font-medium"
                            onClick={() => setSolicitudExpandida(solicitudExpandida === sol.id ? null : sol.id)}
                          >
                            {solicitudExpandida === sol.id ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                            {locale === 'es' ? 'Ver detalles' : 'View details'}
                          </button>
                        )}

                        {solicitudExpandida === sol.id && (
                          <div className="mt-2 space-y-1 text-xs bg-muted/50 rounded-lg p-3 border">
                            {sol.nombreInstructor && (
                              <div className="flex items-center gap-1.5">
                                <UserCheck className="size-3 text-teal-600" />
                                <span className="text-muted-foreground">Instructor:</span>
                                <span className="font-medium">{sol.nombreInstructor}</span>
                              </div>
                            )}
                            {sol.fechaConfirmada && (
                              <div className="flex items-center gap-1.5">
                                <Calendar className="size-3 text-teal-600" />
                                <span className="text-muted-foreground">Fecha confirmada:</span>
                                <span className="font-medium">
                                  {new Date(sol.fechaConfirmada).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US')}
                                </span>
                              </div>
                            )}
                            {sol.linkZoom && (
                              <div className="flex items-center gap-1.5">
                                <LinkIcon className="size-3 text-teal-600" />
                                <a href={sol.linkZoom} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline truncate">
                                  {locale === 'es' ? 'Unirse a Zoom' : 'Join Zoom'}
                                </a>
                              </div>
                            )}
                            {sol.notas && (
                              <div className="flex items-start gap-1.5">
                                <span className="text-muted-foreground mt-0.5">{locale === 'es' ? 'Notas:' : 'Notes:'}</span>
                                <span>{sol.notas}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Botón de Respuesta Admin */}
                      {!esEmpresa && (
                        <Button
                          size="sm"
                          variant={sol.estado === 'pendiente' ? 'default' : 'outline'}
                          className={sol.estado === 'pendiente' ? 'bg-teal-600 hover:bg-teal-700 text-white shrink-0' : 'shrink-0'}
                          onClick={() => abrirResponder(sol)}
                        >
                          {sol.estado === 'pendiente'
                            ? locale === 'es' ? 'Responder' : 'Respond'
                            : locale === 'es' ? 'Editar' : 'Edit'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Diálogo del Administrador para Responder */}
      <Dialog open={showResponderDialog} onOpenChange={setShowResponderDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="size-5 text-teal-600" />
              {locale === 'es' ? 'Responder Solicitud' : 'Respond to Request'}
            </DialogTitle>
            <DialogDescription>
              {solicitudSeleccionada?.capacitacion?.titulo || solicitudSeleccionada?.tema || 'Solicitud de capacitación'}
              {' · '}{solicitudSeleccionada?.propiedad.nombre}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>{locale === 'es' ? 'Estado' : 'Status'}</Label>
              <Select value={formRespuesta.estado} onValueChange={(v) => setFormRespuesta((p) => ({ ...p, estado: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmada">{locale === 'es' ? 'Confirmar' : 'Confirm'}</SelectItem>
                  <SelectItem value="pendiente">{locale === 'es' ? 'Dejar pendiente' : 'Keep pending'}</SelectItem>
                  <SelectItem value="cancelada">{locale === 'es' ? 'Cancelar' : 'Cancel'}</SelectItem>
                  <SelectItem value="completada">{locale === 'es' ? 'Completada' : 'Completed'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formRespuesta.estado === 'confirmada' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-1">
                      <UserCheck className="size-3.5" />
                      {locale === 'es' ? 'Instructor' : 'Instructor'}
                    </Label>
                    <Input
                      placeholder={locale === 'es' ? 'Nombre del instructor' : 'Instructor name'}
                      value={formRespuesta.nombreInstructor}
                      onChange={(e) => setFormRespuesta((p) => ({ ...p, nombreInstructor: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="flex items-center gap-1">
                      <DollarSign className="size-3.5" />
                      {locale === 'es' ? 'Costo total ($)' : 'Total cost ($)'}
                    </Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={formRespuesta.costo}
                      onChange={(e) => setFormRespuesta((p) => ({ ...p, costo: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="flex items-center gap-1">
                    <Calendar className="size-3.5" />
                    {locale === 'es' ? 'Fecha confirmada' : 'Confirmed date'}
                  </Label>
                  <Input
                    type="date"
                    value={formRespuesta.fechaConfirmada}
                    onChange={(e) => setFormRespuesta((p) => ({ ...p, fechaConfirmada: e.target.value }))}
                  />
                </div>

                {solicitudSeleccionada?.modalidad === 'virtual' && (
                  <div className="space-y-1">
                    <Label className="flex items-center gap-1">
                      <LinkIcon className="size-3.5" />
                      {locale === 'es' ? 'Link de Zoom' : 'Zoom Link'}
                    </Label>
                    <Input
                      placeholder="https://zoom.us/j/..."
                      value={formRespuesta.linkZoom}
                      onChange={(e) => setFormRespuesta((p) => ({ ...p, linkZoom: e.target.value }))}
                    />
                  </div>
                )}
              </>
            )}

            <div className="space-y-1">
              <Label>{locale === 'es' ? 'Notas para la empresa' : 'Notes for the company'}</Label>
              <Textarea
                value={formRespuesta.notas}
                onChange={(e) => setFormRespuesta((p) => ({ ...p, notas: e.target.value }))}
                placeholder={locale === 'es' ? 'Instrucciones, requisitos previos, etc.' : 'Instructions, prerequisites, etc.'}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResponderDialog(false)}>
              {locale === 'es' ? 'Cancelar' : 'Cancel'}
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={handleResponder}>
              {locale === 'es' ? 'Guardar Respuesta' : 'Save Response'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Componente Cotizador */}
      <CotizadorCapacitacion
        open={showCotizador}
        onClose={() => {
          setShowCotizador(false)
          fetchData()
        }}
        capacitaciones={capacitaciones}
        propiedades={propiedadFija ? propiedades.filter((p) => p.id === propiedadFija) : propiedades}
      />
    </div>
  )
}