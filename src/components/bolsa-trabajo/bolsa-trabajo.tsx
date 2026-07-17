'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Briefcase,
  Search,
  MapPin,
  UserPlus,
  Users,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Plus,
  Link2,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/lib/store'
import { translations } from '@/lib/i18n'
import { toast } from 'sonner'
import { BolsaVacantes } from './bolsa-vacantes'

// ─── Types ───────────────────────────────────────────────────
interface Candidato {
  id: string
  nombre: string
  email: string | null
  telefono: string | null
  posicion: string
  posicionEn: string | null
  region: string
  experiencia: number
  habilidades: string | null
  estado: string
  puntuacionEntrevista: number | null
  notas: string | null
  fuente: string
  fechaContratacion: string | null
  onboardingCompletado: boolean
  nivelAlcanzado: number
  empleadoReemplazaId: string | null
  propiedad: { nombre: string; region: string } | null
}

interface EmpleadoRiesgo {
  id: string
  empleadoId: string
  nombre: string
  posicion: string
  riesgoBaja: number
  nivelRiesgoBaja: string
  propiedad: { nombre: string }
}

// ─── Helpers ─────────────────────────────────────────────────
function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function getEstadoColor(estado: string): string {
  switch (estado) {
    case 'disponible': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    case 'en_proceso': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    case 'contratado': return 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
    case 'rechazado': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    default: return 'bg-gray-100 text-gray-700'
  }
}

function getEstadoLabel(estado: string, t: typeof translations.es.bolsa): string {
  switch (estado) {
    case 'disponible': return t.disponible
    case 'en_proceso': return t.enProceso
    case 'contratado': return t.contratado
    case 'rechazado': return t.rechazado
    default: return estado
  }
}

function getRiesgoColor(nivel: string): string {
  switch (nivel) {
    case 'critico': return 'text-red-600 bg-red-50 dark:bg-red-950/30'
    case 'alto': return 'text-orange-600 bg-orange-50 dark:bg-orange-950/30'
    case 'medio': return 'text-amber-600 bg-amber-50 dark:bg-amber-950/30'
    default: return 'text-green-600 bg-green-50 dark:bg-green-950/30'
  }
}

// ─── Main Component ──────────────────────────────────────────
export function BolsaTrabajo() {
  const { locale, selectedProperty, userRole, userPropiedadId } = useAppStore()
  const t = translations[locale].bolsa
  const tc = translations[locale].common

  const [candidatos, setCandidatos] = useState<Candidato[]>([])
  const [empleadosRiesgo, setEmpleadosRiesgo] = useState<EmpleadoRiesgo[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroRegion, setFiltroRegion] = useState('todas')
  const [filtroPosicion, setFiltroPosicion] = useState('todas')
  const [filtroEstado, setFiltroEstado] = useState('todas')
  const [search, setSearch] = useState('')

  // Add candidate dialog
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [addForm, setAddForm] = useState({
    nombre: '', email: '', telefono: '', posicion: '', region: '',
    experiencia: '', habilidades: '', fuente: 'referido', notas: '',
  })
  const [adding, setAdding] = useState(false)

  // Link replacement dialog
  const [linkCandidato, setLinkCandidato] = useState<Candidato | null>(null)
  const [linkEmpleadoId, setLinkEmpleadoId] = useState('')
  const [linking, setLinking] = useState(false)

  const fetchCandidatos = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      const propFilter = userRole === 'empresa' ? userPropiedadId : selectedProperty
      if (propFilter && propFilter !== 'all') params.set('propiedadId', propFilter)
      if (filtroRegion !== 'todas') params.set('region', filtroRegion)
      if (filtroPosicion !== 'todas') params.set('posicion', filtroPosicion)
      if (filtroEstado !== 'todas') params.set('estado', filtroEstado)
      const res = await fetch(`/api/candidatos?${params}`)
      const data = await res.json()
      setCandidatos(data.candidatos || [])
    } catch (err) {
      console.error('Error fetching candidatos:', err)
    } finally {
      setLoading(false)
    }
  }, [userRole, userPropiedadId, selectedProperty, filtroRegion, filtroPosicion, filtroEstado])

  const fetchEmpleadosRiesgo = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      const propFilter = userRole === 'empresa' ? userPropiedadId : selectedProperty
      if (propFilter && propFilter !== 'all') params.set('propiedadId', propFilter)
      const res = await fetch(`/api/empleados?${params}`)
      const data = await res.json()
      const empleados = Array.isArray(data) ? data : []
      // Filter empleados with riesgoBaja > 30
      const atRisk = empleados
        .filter((e: Record<string, unknown>) => (e.riesgoBaja as number) > 30)
        .map((e: Record<string, unknown>) => ({
          id: e.id as string,
          empleadoId: e.empleadoId as string,
          nombre: e.nombre as string,
          posicion: e.posicion as string,
          riesgoBaja: e.riesgoBaja as number,
          nivelRiesgoBaja: e.nivelRiesgoBaja as string,
          propiedad: (e.propiedad as Record<string, string>) || { nombre: '' },
        }))
      setEmpleadosRiesgo(atRisk)
    } catch {
      setEmpleadosRiesgo([])
    }
  }, [userRole, userPropiedadId, selectedProperty])

  useEffect(() => {
    fetchCandidatos()
  }, [fetchCandidatos])

  useEffect(() => {
    fetchEmpleadosRiesgo()
  }, [fetchEmpleadosRiesgo])

  const handleContratar = async (candidato: Candidato) => {
    try {
      const propId = selectedProperty !== 'all' ? selectedProperty : candidato.propiedad?.nombre || undefined
      const res = await fetch('/api/candidatos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: candidato.id,
          estado: 'contratado',
          propiedadId: propId,
        }),
      })
      if (res.ok) {
        toast.success(t.contratacionExitosa)
        fetchCandidatos()
      } else {
        const err = await res.json()
        toast.error(err.error || tc.error)
      }
    } catch {
      toast.error(tc.error)
    }
  }

  const handleAddCandidato = async () => {
    if (!addForm.nombre || !addForm.posicion || !addForm.region) {
      toast.error(locale === 'es' ? 'Completa los campos requeridos' : 'Fill required fields')
      return
    }
    setAdding(true)
    try {
      const propFilter = userRole === 'empresa' ? userPropiedadId : (selectedProperty !== 'all' ? selectedProperty : undefined)
      const res = await fetch('/api/candidatos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: addForm.nombre,
          email: addForm.email || null,
          telefono: addForm.telefono || null,
          posicion: addForm.posicion,
          region: addForm.region,
          experiencia: parseInt(addForm.experiencia) || 0,
          habilidades: addForm.habilidades || null,
          fuente: addForm.fuente,
          notas: addForm.notas || null,
          propiedadId: propFilter,
        }),
      })
      if (res.ok) {
        toast.success(t.candidatoCreado)
        setShowAddDialog(false)
        setAddForm({ nombre: '', email: '', telefono: '', posicion: '', region: '', experiencia: '', habilidades: '', fuente: 'referido', notas: '' })
        fetchCandidatos()
      } else {
        toast.error(tc.error)
      }
    } catch {
      toast.error(tc.error)
    } finally {
      setAdding(false)
    }
  }

  const handleVincularReemplazo = async () => {
    if (!linkCandidato || !linkEmpleadoId) return
    setLinking(true)
    try {
      const res = await fetch('/api/candidatos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: linkCandidato.id,
          empleadoReemplazaId: linkEmpleadoId,
          estado: 'en_proceso',
        }),
      })
      if (res.ok) {
        toast.success(t.vinculacionExitosa)
        setLinkCandidato(null)
        setLinkEmpleadoId('')
        fetchCandidatos()
        fetchEmpleadosRiesgo()
      } else {
        toast.error(tc.error)
      }
    } catch {
      toast.error(tc.error)
    } finally {
      setLinking(false)
    }
  }

  // Derived data
  const regiones = [...new Set(candidatos.map(c => c.region))]
  const posiciones = [...new Set(candidatos.map(c => c.posicion))]
  const disponibles = candidatos.filter(c => c.estado === 'disponible')
  const contratados = candidatos.filter(c => c.estado === 'contratado')
  const reemplazos = contratados.filter(c => c.empleadoReemplazaId)

  // Group candidates by the empleado they would replace (terna)
  const ternaMap = new Map<string, Candidato[]>()
  candidatos.forEach(c => {
    if (c.empleadoReemplazaId) {
      const existing = ternaMap.get(c.empleadoReemplazaId) || []
      existing.push(c)
      ternaMap.set(c.empleadoReemplazaId, existing)
    }
  })

  // Map empleado riesgo ID to name
  const empleadoRiesgoMap = new Map(empleadosRiesgo.map(e => [e.id, e]))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-sm text-muted-foreground">
            {locale === 'es' ? 'Pool de candidatos y gestión de reemplazos' : 'Candidate pool and replacement management'}
          </p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2" onClick={() => setShowAddDialog(true)}>
          <Plus className="size-4" />
          {t.agregarCandidato}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="py-3">
          <CardContent className="px-3 text-center">
            <div className="text-2xl font-bold text-teal-600">{candidatos.length}</div>
            <div className="text-xs text-muted-foreground">{locale === 'es' ? 'Total' : 'Total'}</div>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardContent className="px-3 text-center">
            <div className="text-2xl font-bold text-emerald-600">{disponibles.length}</div>
            <div className="text-xs text-muted-foreground">{t.disponible}</div>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardContent className="px-3 text-center">
            <div className="text-2xl font-bold text-amber-600">{candidatos.filter(c => c.estado === 'en_proceso').length}</div>
            <div className="text-xs text-muted-foreground">{t.enProceso}</div>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardContent className="px-3 text-center">
            <div className="text-2xl font-bold text-teal-600">{contratados.length}</div>
            <div className="text-xs text-muted-foreground">{t.contratado}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder={locale === 'es' ? 'Buscar candidato...' : 'Search candidate...'} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filtroRegion} onValueChange={setFiltroRegion}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder={t.region} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">{t.todas}</SelectItem>
            {regiones.map(r => (<SelectItem key={r} value={r}>{r}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={filtroPosicion} onValueChange={setFiltroPosicion}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder={t.posicion} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">{t.todas}</SelectItem>
            {posiciones.map(p => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={filtroEstado} onValueChange={setFiltroEstado}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder={t.estado} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">{t.todas}</SelectItem>
            <SelectItem value="disponible">{t.disponible}</SelectItem>
            <SelectItem value="en_proceso">{t.enProceso}</SelectItem>
            <SelectItem value="contratado">{t.contratado}</SelectItem>
            <SelectItem value="rechazado">{t.rechazado}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="vacantes">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vacantes" className="gap-1.5">
            <Briefcase className="size-4 hidden sm:inline-block" />
            {locale === 'es' ? 'Vacantes' : 'Vacancies'}
          </TabsTrigger>
          <TabsTrigger value="pool" className="gap-1.5">
            <Users className="size-4 hidden sm:inline-block" />
            {t.poolCandidatos}
          </TabsTrigger>
          <TabsTrigger value="reemplazos" className="gap-1.5">
            <Briefcase className="size-4 hidden sm:inline-block" />
            {t.reemplazos}
          </TabsTrigger>
          <TabsTrigger value="terna" className="gap-1.5">
            <AlertTriangle className="size-4 hidden sm:inline-block" />
            {t.ternaReemplazos}
          </TabsTrigger>
        </TabsList>

        {/* ─── Vacantes ──────────────────────────────────── */}
        <TabsContent value="vacantes" className="mt-4">
          <BolsaVacantes userRole={userRole} userPropiedadId={userPropiedadId} selectedProperty={selectedProperty} locale={locale} candidatos={candidatos} />
        </TabsContent>

        {/* ─── Pool de Candidatos ──────────────────────────── */}
        <TabsContent value="pool" className="mt-4">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}><CardContent className="p-4"><div className="h-36 animate-pulse rounded bg-muted" /></CardContent></Card>
              ))}
            </div>
          ) : candidatos.length === 0 ? (
            <div className="text-center py-12">
              <Users className="size-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">{t.noCandidatos}</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {candidatos
                .filter(c => !search || c.nombre.toLowerCase().includes(search.toLowerCase()) || c.posicion.toLowerCase().includes(search.toLowerCase()))
                .map(candidato => (
                  <Card key={candidato.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="size-11 shrink-0">
                          <AvatarFallback className="bg-amber-100 text-amber-700 text-sm font-semibold dark:bg-amber-900/40 dark:text-amber-300">
                            {getInitials(candidato.nombre)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-sm truncate">{candidato.nombre}</span>
                            <Badge className={`text-[10px] px-1.5 shrink-0 ${getEstadoColor(candidato.estado)}`}>
                              {getEstadoLabel(candidato.estado, t)}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{candidato.posicion}</p>
                          <div className="flex flex-wrap gap-2 mt-1.5 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1"><MapPin className="size-3" />{candidato.region}</span>
                            <span>{candidato.experiencia} {t.anos}</span>
                            {candidato.puntuacionEntrevista && (
                              <span className="font-medium text-teal-600">{candidato.puntuacionEntrevista}/100</span>
                            )}
                          </div>
                          {candidato.habilidades && (
                            <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{candidato.habilidades}</p>
                          )}
                          {candidato.propiedad && (
                            <p className="text-[11px] text-muted-foreground mt-0.5">{candidato.propiedad.nombre}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3">
                        {candidato.estado === 'disponible' && (
                          <>
                            <Button
                              size="sm"
                              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white gap-1.5"
                              onClick={() => handleContratar(candidato)}
                            >
                              <UserPlus className="size-3.5" />
                              {t.contratar}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/30"
                              onClick={() => { setLinkCandidato(candidato); setLinkEmpleadoId(''); }}
                            >
                              <Link2 className="size-3.5" />
                              <span className="hidden sm:inline">{t.vincularReemplazo}</span>
                            </Button>
                          </>
                        )}

                        {candidato.estado === 'contratado' && (
                          <div className="w-full space-y-1.5">
                            <div className="flex justify-between text-[11px]">
                              <span>{t.nivelAlcanzado}</span>
                              <span className="font-medium">{candidato.nivelAlcanzado}%</span>
                            </div>
                            <Progress value={candidato.nivelAlcanzado} className="h-1.5 [&>[data-slot=progress-indicator]]:bg-teal-500" />
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              {candidato.onboardingCompletado ? (
                                <CheckCircle2 className="size-3 text-emerald-500" />
                              ) : (
                                <XCircle className="size-3 text-amber-500" />
                              )}
                              {t.onboardingCompletado}
                            </div>
                          </div>
                        )}

                        {candidato.estado === 'en_proceso' && candidato.empleadoReemplazaId && (
                          <div className="w-full">
                            <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400">
                              <Link2 className="size-3 mr-1" />
                              {t.reemplazandoA}: {empleadoRiesgoMap.get(candidato.empleadoReemplazaId)?.nombre || candidato.empleadoReemplazaId.substring(0, 8) + '...'}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── Reemplazos en Progreso ──────────────────────── */}
        <TabsContent value="reemplazos" className="mt-4">
          {reemplazos.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="size-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {locale === 'es' ? 'No hay reemplazos en progreso' : 'No replacements in progress'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {reemplazos.map(candidato => (
                <Card key={candidato.id} className="border-amber-200 dark:border-amber-800">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="size-11 shrink-0">
                        <AvatarFallback className="bg-teal-100 text-teal-700 text-sm font-semibold dark:bg-teal-900/40 dark:text-teal-300">
                          {getInitials(candidato.nombre)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm">{candidato.nombre}</h3>
                        <p className="text-xs text-muted-foreground">{candidato.posicion} · {candidato.region}</p>

                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400">
                            {t.reemplazandoA}: {empleadoRiesgoMap.get(candidato.empleadoReemplazaId || '')?.nombre || candidato.empleadoReemplazaId?.substring(0, 8) + '...'}
                          </Badge>
                          {candidato.propiedad && (
                            <Badge variant="outline" className="text-[10px]">{candidato.propiedad.nombre}</Badge>
                          )}
                        </div>

                        <Separator className="my-3" />

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px]">
                            <span>{t.nivelAlcanzado}</span>
                            <span className="font-medium">{candidato.nivelAlcanzado}%</span>
                          </div>
                          <Progress value={candidato.nivelAlcanzado} className="h-2 [&>[data-slot=progress-indicator]]:bg-teal-500" />
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            {candidato.onboardingCompletado ? (
                              <CheckCircle2 className="size-3 text-emerald-500" />
                            ) : (
                              <XCircle className="size-3 text-amber-500" />
                            )}
                            {t.onboardingCompletado}: {candidato.onboardingCompletado ? '✓' : '✗'}
                          </div>
                          {candidato.fechaContratacion && (
                            <p className="text-[11px] text-muted-foreground">
                              {locale === 'es' ? 'Contratado el' : 'Hired on'}: {new Date(candidato.fechaContratacion).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── Terna de Reemplazos ────────────────────────── */}
        <TabsContent value="terna" className="mt-4">
          {empleadosRiesgo.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="size-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">{t.noEmpleadosEnRiesgo}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {empleadosRiesgo.map(emp => {
                const terna = ternaMap.get(emp.id) || []
                return (
                  <Card key={emp.id} className="border-l-4 border-l-amber-400">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10">
                          <AvatarFallback className="bg-red-100 text-red-700 text-sm font-semibold dark:bg-red-900/40 dark:text-red-300">
                            {getInitials(emp.nombre)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-base">{t.ternaPara}: {emp.nombre}</CardTitle>
                          <CardDescription className="text-xs">
                            {emp.posicion} · {emp.propiedad?.nombre}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-[10px] ${getRiesgoColor(emp.nivelRiesgoBaja)}`}>
                            {t.riesgoBaja}: {emp.riesgoBaja.toFixed(0)}%
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {terna.length} {t.candidatosParaReemplazo}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {terna.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">{t.sinTerna}</p>
                      ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {terna.map(c => (
                            <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                              <Avatar className="size-9 shrink-0">
                                <AvatarFallback className="bg-teal-100 text-teal-700 text-xs font-semibold dark:bg-teal-900/40 dark:text-teal-300">
                                  {getInitials(c.nombre)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{c.nombre}</p>
                                <p className="text-[11px] text-muted-foreground">{c.posicion} · {c.experiencia} {t.anos}</p>
                                {c.puntuacionEntrevista && (
                                  <p className="text-[11px] text-teal-600 font-medium">{c.puntuacionEntrevista}/100</p>
                                )}
                              </div>
                              <Badge className={`text-[10px] px-1.5 shrink-0 ${getEstadoColor(c.estado)}`}>
                                {getEstadoLabel(c.estado, t)}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ─── Add Candidate Dialog ─────────────────────────── */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="size-5 text-teal-600" />
              {t.agregarCandidato}
            </DialogTitle>
            <DialogDescription>{t.agregarCandidatoDesc}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-1.5">
              <Label className="text-xs">{t.nombre} *</Label>
              <Input value={addForm.nombre} onChange={e => setAddForm(f => ({ ...f, nombre: e.target.value }))} placeholder={locale === 'es' ? 'Nombre completo' : 'Full name'} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{t.email}</Label>
                <Input type="email" value={addForm.email} onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))} placeholder="email@ejemplo.com" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t.telefono}</Label>
                <Input value={addForm.telefono} onChange={e => setAddForm(f => ({ ...f, telefono: e.target.value }))} placeholder="+52 999 000 0000" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{t.posicionAspira} *</Label>
                <Input value={addForm.posicion} onChange={e => setAddForm(f => ({ ...f, posicion: e.target.value }))} placeholder={locale === 'es' ? 'Mesero, Recepcionista...' : 'Waiter, Receptionist...'} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t.region} *</Label>
                <Input value={addForm.region} onChange={e => setAddForm(f => ({ ...f, region: e.target.value }))} placeholder={locale === 'es' ? 'Cancún, CDMX...' : 'Cancun, CDMX...'} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{t.experienciaAnos}</Label>
                <Input type="number" min="0" value={addForm.experiencia} onChange={e => setAddForm(f => ({ ...f, experiencia: e.target.value }))} placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t.fuente}</Label>
                <Select value={addForm.fuente} onValueChange={v => setAddForm(f => ({ ...f, fuente: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="referido">{t.fuenteReferido}</SelectItem>
                    <SelectItem value="portal">{t.fuentePortal}</SelectItem>
                    <SelectItem value="agencia">{t.fuenteAgencia}</SelectItem>
                    <SelectItem value="spontaneous">{t.fuenteSpontaneous}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t.habilidades}</Label>
              <Input value={addForm.habilidades} onChange={e => setAddForm(f => ({ ...f, habilidades: e.target.value }))} placeholder={t.habilidadesPlaceholder} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t.notas}</Label>
              <Textarea value={addForm.notas} onChange={e => setAddForm(f => ({ ...f, notas: e.target.value }))} rows={2} placeholder={locale === 'es' ? 'Notas adicionales...' : 'Additional notes...'} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>{tc.cancelar}</Button>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2" onClick={handleAddCandidato} disabled={adding}>
              {adding ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Plus className="size-4" />}
              {t.agregarCandidato}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Link Replacement Dialog ──────────────────────── */}
      <Dialog open={!!linkCandidato} onOpenChange={() => setLinkCandidato(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="size-5 text-amber-600" />
              {t.vincularReemplazo}
            </DialogTitle>
            <DialogDescription>{t.vincularReemplazoDesc}</DialogDescription>
          </DialogHeader>
          {linkCandidato && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Avatar className="size-9">
                  <AvatarFallback className="bg-amber-100 text-amber-700 text-xs font-semibold">
                    {getInitials(linkCandidato.nombre)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{linkCandidato.nombre}</p>
                  <p className="text-xs text-muted-foreground">{linkCandidato.posicion}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">{t.empleadosEnRiesgo}</Label>
                {empleadosRiesgo.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t.noEmpleadosEnRiesgo}</p>
                ) : (
                  <Select value={linkEmpleadoId} onValueChange={setLinkEmpleadoId}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.seleccionarEmpleado} />
                    </SelectTrigger>
                    <SelectContent>
                      {empleadosRiesgo.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>
                          <div className="flex items-center gap-2">
                            <span>{emp.nombre}</span>
                            <span className="text-xs text-muted-foreground">({emp.posicion})</span>
                            <span className={`text-[10px] font-medium ${getRiesgoColor(emp.nivelRiesgoBaja)}`}>
                              {emp.riesgoBaja.toFixed(0)}%
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkCandidato(null)}>{tc.cancelar}</Button>
            <Button
              className="bg-amber-600 hover:bg-amber-700 text-white gap-2"
              onClick={handleVincularReemplazo}
              disabled={linking || !linkEmpleadoId}
            >
              {linking ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Link2 className="size-4" />}
              {t.confirmarVinculacion}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
