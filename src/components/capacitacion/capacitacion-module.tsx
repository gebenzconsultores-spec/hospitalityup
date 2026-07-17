'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  BookOpen,
  Search,
  GraduationCap,
  Users,
  Calendar,
  CheckCircle,
  CheckCircle2,
  PlayCircle,
  Clock,
  Monitor,
  MapPin,
  XCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/lib/store'
import { translations } from '@/lib/i18n'
import { toast } from 'sonner'

// ─── Types ───────────────────────────────────────────────────
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
  participantes: number
  estado: string
  notas: string | null
  linkZoom: string | null
  propiedad: { nombre: string; region: string }
  capacitacion: { titulo: string; categoria: string; modalidad: string } | null
  createdAt: string
}

// ─── Helpers ─────────────────────────────────────────────────
function getCategoryColor(cat: string): string {
  switch (cat) {
    case 'upselling': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
    case 'hospitalidad': return 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300'
    case 'conocimiento_producto': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
    case 'onboarding': return 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300'
    case 'liderazgo': return 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300'
  }
}

function getCategoryLabel(cat: string, t: typeof translations.es.capacitacion): string {
  switch (cat) {
    case 'upselling': return t.upselling
    case 'hospitalidad': return t.hospitalidad
    case 'conocimiento_producto': return t.producto
    case 'onboarding': return t.onboarding
    case 'liderazgo': return t.liderazgo
    default: return cat
  }
}

function getDificultadLabel(dif: string, t: typeof translations.es.capacitacion): string {
  switch (dif) {
    case 'principiante': return t.principiante
    case 'intermedio': return t.intermedio
    case 'avanzado': return t.avanzado
    default: return dif
  }
}

function getEstadoSolicitudColor(estado: string): string {
  switch (estado) {
    case 'pendiente': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    case 'confirmada': return 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
    case 'completada': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    case 'cancelada': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    default: return 'bg-gray-100 text-gray-700'
  }
}

// ─── Main Component ──────────────────────────────────────────
export function CapacitacionModule() {
  const { locale, selectedProperty, userRole, userPropiedadId } = useAppStore()
  const t = translations[locale].capacitacion

  const isEmpresa = userRole === 'empresa' && userPropiedadId

  const [capacitaciones, setCapacitaciones] = useState<Capacitacion[]>([])
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [filtroModalidad, setFiltroModalidad] = useState('todas')
  const [propiedades, setPropiedades] = useState<{ id: string; nombre: string }[]>([])
  const [showSolicitarDialog, setShowSolicitarDialog] = useState(false)
  const [acceptDialogSol, setAcceptDialogSol] = useState<Solicitud | null>(null)
  const [zoomLink, setZoomLink] = useState('')

  const [form, setForm] = useState({
    modalidad: 'presencial',
    capacitacionId: '',
    tema: '',
    fechaSolicitada: '',
    participantes: '1',
    propiedadId: '',
    notas: '',
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const capParams = new URLSearchParams()
      const solParams = new URLSearchParams()
      // For empresa, always filter by their propiedad
      if (isEmpresa) {
        capParams.set('propiedadId', userPropiedadId!)
        solParams.set('propiedadId', userPropiedadId!)
      } else if (selectedProperty !== 'all') {
        capParams.set('propiedadId', selectedProperty)
        solParams.set('propiedadId', selectedProperty)
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
      // For empresa, filter propiedades to only their own
      const props = Array.isArray(propData) ? propData : []
      const filteredProps = isEmpresa ? props.filter(p => p.id === userPropiedadId) : props
      setPropiedades(filteredProps.map((p: { id: string; nombre: string }) => ({ id: p.id, nombre: p.nombre })))
    } catch (err) {
      console.error('Error fetching capacitaciones:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedProperty, filtroCategoria, filtroModalidad, isEmpresa, userPropiedadId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSolicitar = async () => {
    try {
      // For empresa, use their propiedad; for admin, use selected or form
      const propId = isEmpresa ? userPropiedadId : (form.propiedadId || (selectedProperty !== 'all' ? selectedProperty : propiedades[0]?.id))
      if (!propId || !form.fechaSolicitada) {
        toast.error(locale === 'es' ? 'Completa los campos requeridos' : 'Fill required fields')
        return
      }
      const res = await fetch('/api/solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propiedadId: propId,
          capacitacionId: form.capacitacionId || null,
          modalidad: form.modalidad,
          tema: form.tema || null,
          fechaSolicitada: form.fechaSolicitada,
          participantes: parseInt(form.participantes),
          notas: form.notas || null,
          estado: 'programada', // En el portal de empresa queda como "programada"
        }),
      })
      if (res.ok) {
        toast.success(locale === 'es' ? 'Solicitud creada exitosamente' : 'Request created successfully')
        setShowSolicitarDialog(false)
        setForm({ modalidad: 'presencial', capacitacionId: '', tema: '', fechaSolicitada: '', participantes: '1', propiedadId: '', notas: '' })
        fetchData()
      }
    } catch {
      toast.error(locale === 'es' ? 'Error al crear solicitud' : 'Error creating request')
    }
  }

  const categorias = [...new Set(capacitaciones.map(c => c.categoria))]

  // Aceptar solicitud (admin)
  const aceptarSolicitud = async () => {
    if (!acceptDialogSol) return
    try {
      await fetch(`/api/solicitudes/${acceptDialogSol.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado: 'confirmada',
          linkZoom: acceptDialogSol.modalidad === 'virtual' ? zoomLink : null,
        }),
      })
      toast.success(locale === 'es' ? 'Solicitud aceptada' : 'Request accepted')
      setAcceptDialogSol(null)
      setZoomLink('')
      fetchData()
    } catch {
      toast.error(locale === 'es' ? 'Error' : 'Error')
    }
  }

  // Rechazar solicitud (admin)
  const rechazarSolicitud = async (id: string) => {
    try {
      await fetch(`/api/solicitudes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'rechazada' }),
      })
      toast.success(locale === 'es' ? 'Solicitud rechazada' : 'Request rejected')
      fetchData()
    } catch {
      toast.error(locale === 'es' ? 'Error' : 'Error')
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'programada': return 'bg-blue-100 text-blue-700'
      case 'pendiente': return 'bg-yellow-100 text-yellow-700'
      case 'confirmada': return 'bg-green-100 text-green-700'
      case 'completada': return 'bg-teal-100 text-teal-700'
      case 'rechazada': return 'bg-red-100 text-red-700'
      case 'cancelada': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getEstadoLabel = (estado: string) => {
    const labels: Record<string, string> = {
      programada: locale === 'es' ? 'Programada' : 'Scheduled',
      pendiente: locale === 'es' ? 'Pendiente' : 'Pending',
      confirmada: locale === 'es' ? 'Aceptada' : 'Accepted',
      completada: locale === 'es' ? 'Completada' : 'Completed',
      rechazada: locale === 'es' ? 'Rechazada' : 'Rejected',
      cancelada: locale === 'es' ? 'Cancelada' : 'Cancelled',
    }
    return labels[estado] || estado
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-sm text-muted-foreground">
            {locale === 'es' ? 'Cursos, progreso y solicitudes de capacitación' : 'Courses, progress and training requests'}
          </p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2" onClick={() => setShowSolicitarDialog(true)}>
          <GraduationCap className="size-4" />
          {t.solicitarHibrida}
        </Button>
      </div>

      <Tabs defaultValue="catalogo">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="catalogo" className="gap-1.5">
            <BookOpen className="size-4 hidden sm:inline-block" />
            {t.catalogo}
          </TabsTrigger>
          <TabsTrigger value="progreso" className="gap-1.5">
            <Users className="size-4 hidden sm:inline-block" />
            {t.progreso}
          </TabsTrigger>
          <TabsTrigger value="solicitudes" className="gap-1.5">
            <Calendar className="size-4 hidden sm:inline-block" />
            {t.solicitudes}
          </TabsTrigger>
        </TabsList>

        {/* ─── Catálogo ──────────────────────────────────── */}
        <TabsContent value="catalogo" className="mt-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder={t.categoria} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">{t.todas}</SelectItem>
                {categorias.map(c => (
                  <SelectItem key={c} value={c}>{getCategoryLabel(c, t)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filtroModalidad} onValueChange={setFiltroModalidad}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder={t.modalidad} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">{t.todas}</SelectItem>
                <SelectItem value="presencial">{t.presencial}</SelectItem>
                <SelectItem value="virtual">{t.virtual}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}><CardContent className="p-4"><div className="h-48 animate-pulse rounded bg-muted" /></CardContent></Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {capacitaciones.map(cap => (
                <Card key={cap.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">
                          {locale === 'en' && cap.tituloEn ? cap.tituloEn : cap.titulo}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {locale === 'en' && cap.descripcionEn ? cap.descripcionEn : cap.descripcion}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <Badge className={`text-[10px] px-1.5 ${getCategoryColor(cap.categoria)}`}>
                        {getCategoryLabel(cap.categoria, t)}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 gap-1">
                        {cap.modalidad === 'presencial' ? <MapPin className="size-3" /> : <Monitor className="size-3" />}
                        {cap.modalidad === 'presencial' ? t.presencial : t.virtual}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5">
                        {getDificultadLabel(cap.dificultad, t)}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span className="flex items-center gap-1"><Clock className="size-3" /> {cap.duracion} {t.minutos}</span>
                      <span>{cap.puntos} pts</span>
                    </div>

                    <Separator className="my-3" />

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span>{t.completados}: {cap.completadosCount}/{cap.inscripcionesCount}</span>
                        <span className="font-medium">{cap.tasaCompletado}%</span>
                      </div>
                      <Progress value={cap.tasaCompletado} className="h-1.5 [&>[data-slot=progress-indicator]]:bg-teal-500" />
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-0.5"><PlayCircle className="size-3" /> {cap.enProgresoCount} {locale === 'es' ? 'en progreso' : 'in progress'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── Progreso ──────────────────────────────────── */}
        <TabsContent value="progreso" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {capacitaciones.map(cap => (
              <Card key={cap.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm truncate">{locale === 'en' && cap.tituloEn ? cap.tituloEn : cap.titulo}</h3>
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

        {/* ─── Solicitudes ───────────────────────────────── */}
        <TabsContent value="solicitudes" className="mt-4">
          {solicitudes.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="size-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {locale === 'es' ? 'No hay solicitudes' : 'No requests'}
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {solicitudes.map(sol => (
                <Card key={sol.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-semibold text-sm">
                            {sol.capacitacion?.titulo || sol.tema || (locale === 'es' ? 'Solicitud abierta' : 'Open request')}
                          </span>
                          <Badge className={`text-[10px] ${getEstadoColor(sol.estado)}`}>
                            {getEstadoLabel(sol.estado)}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {sol.modalidad === 'virtual' ? '💻 Virtual' : '📍 Presencial'}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          {!isEmpresa && <span>{sol.propiedad.nombre}</span>}
                          <span className="flex items-center gap-1"><Users className="size-3" />{sol.participantes}</span>
                          <span className="flex items-center gap-1"><Calendar className="size-3" />{new Date(sol.fechaSolicitada).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US')}</span>
                        </div>
                        {sol.notas && <p className="text-xs text-muted-foreground mt-1">"{sol.notas}"</p>}
                        {sol.linkZoom && (
                          <a href={sol.linkZoom} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:underline">
                            💻 {locale === 'es' ? 'Link de Zoom' : 'Zoom link'}
                          </a>
                        )}
                      </div>

                      {/* Admin actions */}
                      {!isEmpresa && userRole === 'admin' && sol.estado === 'programada' && (
                        <div className="flex gap-1 shrink-0">
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => {
                              setAcceptDialogSol(sol)
                              setZoomLink('')
                            }}
                          >
                            {locale === 'es' ? 'Aceptar' : 'Accept'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs text-destructive"
                            onClick={() => rechazarSolicitud(sol.id)}
                          >
                            {locale === 'es' ? 'Rechazar' : 'Reject'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ─── Dialog: Solicitar Capacitación ──────────────── */}
      <Dialog open={showSolicitarDialog} onOpenChange={setShowSolicitarDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="size-5 text-teal-600" />
              {t.solicitarHibrida}
            </DialogTitle>
            <DialogDescription>
              {locale === 'es' ? 'Solicita una sesión de capacitación presencial o virtual' : 'Request an in-person or virtual training session'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t.modalidad}</Label>
              <div className="flex gap-2">
                <Button type="button" variant={form.modalidad === 'presencial' ? 'default' : 'outline'} className={form.modalidad === 'presencial' ? 'bg-teal-600 hover:bg-teal-700' : ''} onClick={() => setForm(p => ({ ...p, modalidad: 'presencial' }))}>
                  <MapPin className="size-4 mr-1.5" />{t.presencial}
                </Button>
                <Button type="button" variant={form.modalidad === 'virtual' ? 'default' : 'outline'} className={form.modalidad === 'virtual' ? 'bg-teal-600 hover:bg-teal-700' : ''} onClick={() => setForm(p => ({ ...p, modalidad: 'virtual' }))}>
                  <Monitor className="size-4 mr-1.5" />{t.virtual}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{locale === 'es' ? 'Tema / Capacitación' : 'Topic / Training'}</Label>
              <Select value={form.capacitacionId} onValueChange={v => setForm(p => ({ ...p, capacitacionId: v }))}>
                <SelectTrigger><SelectValue placeholder={locale === 'es' ? 'Seleccionar...' : 'Select...'} /></SelectTrigger>
                <SelectContent>
                  {capacitaciones.map(c => (
                    <SelectItem key={c.id} value={c.id}>{locale === 'en' && c.tituloEn ? c.tituloEn : c.titulo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!isEmpresa && (
            <div className="space-y-2">
              <Label>{locale === 'es' ? 'Propiedad' : 'Property'}</Label>
              <Select value={form.propiedadId || selectedProperty} onValueChange={v => setForm(p => ({ ...p, propiedadId: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {propiedades.map(p => (<SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{locale === 'es' ? 'Fecha' : 'Date'}</Label>
                <Input type="date" value={form.fechaSolicitada} onChange={e => setForm(p => ({ ...p, fechaSolicitada: e.target.value }))} min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="space-y-2">
                <Label>{t.participantes}</Label>
                <Input type="number" min="1" max="100" value={form.participantes} onChange={e => setForm(p => ({ ...p, participantes: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{locale === 'es' ? 'Notas' : 'Notes'}</Label>
              <Textarea value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSolicitarDialog(false)}>{locale === 'es' ? 'Cancelar' : 'Cancel'}</Button>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5" onClick={handleSolicitar}>
              <Calendar className="size-4" />
              {locale === 'es' ? 'Confirmar Solicitud' : 'Confirm Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Dialog: Aceptar Solicitud (Admin) ─────────────── */}
      <Dialog open={!!acceptDialogSol} onOpenChange={(open) => !open && setAcceptDialogSol(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="size-5 text-green-600" />
              {locale === 'es' ? 'Aceptar Solicitud' : 'Accept Request'}
            </DialogTitle>
            <DialogDescription>
              {acceptDialogSol?.capacitacion?.titulo || acceptDialogSol?.tema || (locale === 'es' ? 'Solicitud' : 'Request')}
              {' - '}
              {acceptDialogSol?.modalidad === 'virtual' ? (locale === 'es' ? 'Virtual' : 'Virtual') : (locale === 'es' ? 'Presencial' : 'In-person')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {acceptDialogSol?.modalidad === 'virtual' && (
              <div className="space-y-2">
                <Label>{locale === 'es' ? 'Link de Zoom / Meet' : 'Zoom / Meet Link'}</Label>
                <Input
                  value={zoomLink}
                  onChange={e => setZoomLink(e.target.value)}
                  placeholder="https://zoom.us/j/123456789"
                />
                <p className="text-xs text-muted-foreground">
                  {locale === 'es'
                    ? 'Pega el link de la reunión virtual. Se enviará a la empresa.'
                    : 'Paste the virtual meeting link. It will be sent to the company.'}
                </p>
              </div>
            )}
            {acceptDialogSol?.modalidad === 'presencial' && (
              <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                {locale === 'es'
                  ? '✅ Al aceptar, no se generará link de Zoom por ser presencial. La empresa será notificada.'
                  : '✅ No Zoom link will be generated for in-person sessions. The company will be notified.'}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAcceptDialogSol(null)}>
              {locale === 'es' ? 'Cancelar' : 'Cancel'}
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={aceptarSolicitud}>
              <CheckCircle className="size-4 mr-1.5" />
              {locale === 'es' ? 'Aceptar Solicitud' : 'Accept Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
