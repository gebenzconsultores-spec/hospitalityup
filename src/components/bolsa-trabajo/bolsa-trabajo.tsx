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
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/lib/store'
import { translations } from '@/lib/i18n'
import { toast } from 'sonner'

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

// ─── Main Component ──────────────────────────────────────────
export function BolsaTrabajo() {
  const { locale, selectedProperty } = useAppStore()
  const t = translations[locale].bolsa
  const tc = translations[locale].common

  const [candidatos, setCandidatos] = useState<Candidato[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroRegion, setFiltroRegion] = useState('todas')
  const [filtroPosicion, setFiltroPosicion] = useState('todas')
  const [filtroEstado, setFiltroEstado] = useState('todas')
  const [search, setSearch] = useState('')

  const fetchCandidatos = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedProperty !== 'all') params.set('propiedadId', selectedProperty)
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
  }, [selectedProperty, filtroRegion, filtroPosicion, filtroEstado])

  useEffect(() => {
    fetchCandidatos()
  }, [fetchCandidatos])

  const handleContratar = async (candidato: Candidato) => {
    try {
      const propId = selectedProperty !== 'all' ? selectedProperty : candidato.propiedad?.id || undefined
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

  // Derived data
  const regiones = [...new Set(candidatos.map(c => c.region))]
  const posiciones = [...new Set(candidatos.map(c => c.posicion))]
  const disponibles = candidatos.filter(c => c.estado === 'disponible')
  const contratados = candidatos.filter(c => c.estado === 'contratado')
  const reemplazos = contratados.filter(c => c.empleadoReemplazaId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
        <p className="text-sm text-muted-foreground">
          {locale === 'es' ? 'Pool de candidatos y gestión de reemplazos' : 'Candidate pool and replacement management'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
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

      <Tabs defaultValue="pool">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pool" className="gap-1.5">
            <Users className="size-4 hidden sm:inline-block" />
            {t.poolCandidatos}
          </TabsTrigger>
          <TabsTrigger value="reemplazos" className="gap-1.5">
            <Briefcase className="size-4 hidden sm:inline-block" />
            {t.reemplazos}
          </TabsTrigger>
        </TabsList>

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

                      {candidato.estado === 'disponible' && (
                        <Button
                          size="sm"
                          className="w-full mt-3 bg-teal-600 hover:bg-teal-700 text-white gap-1.5"
                          onClick={() => handleContratar(candidato)}
                        >
                          <UserPlus className="size-3.5" />
                          {t.contratar}
                        </Button>
                      )}

                      {candidato.estado === 'contratado' && (
                        <div className="mt-3 space-y-1.5">
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
                            {t.reemplazandoA}: {candidato.empleadoReemplazaId?.substring(0, 8)}...
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
      </Tabs>
    </div>
  )
}
