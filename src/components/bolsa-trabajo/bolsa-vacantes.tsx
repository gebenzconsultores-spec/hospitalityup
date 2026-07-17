'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Briefcase,
  Trash2,
  Pencil,
  CheckCircle,
  XCircle,
  Users,
  MapPin,
  Clock,
  DollarSign,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'

interface Candidato {
  id: string
  nombre: string
  posicion: string
  region: string
  experiencia: number
  estado: string
  puntuacionEntrevista: number | null
  habilidades: string | null
  fuente: string
  telefono?: string | null
  email?: string | null
}

interface Vacante {
  id: string
  posicion: string
  departamento: string | null
  descripcion: string | null
  tipoContrato: string | null
  tipoJornada: string | null
  horario: string | null
  salario: number | null
  region: string | null
  estado: string
  prioridad: string
  esReemplazo: boolean
  empleadoReemplazaId: string | null
  candidatosAsignados: string | null
  notas: string | null
  creadoPor: string | null
  fechaApertura: string
  propiedad: { id: string; nombre: string; region: string }
}

interface BolsaVacantesProps {
  userRole: string | null
  userPropiedadId: string | null
  selectedProperty: string
  locale: string
  candidatos: Candidato[]
}

export function BolsaVacantes({ userRole, userPropiedadId, selectedProperty, locale, candidatos }: BolsaVacantesProps) {
  const [vacantes, setVacantes] = useState<Vacante[]>([])
  const [loading, setLoading] = useState(true)
  const [showFormDialog, setShowFormDialog] = useState(false)
  const [editingVacante, setEditingVacante] = useState<Vacante | null>(null)
  const [asignarCandidatosVacante, setAsignarCandidatosVacante] = useState<Vacante | null>(null)

  const [form, setForm] = useState({
    posicion: '',
    departamento: '',
    descripcion: '',
    tipoContrato: 'indefinido',
    tipoJornada: 'fijo',
    horario: '',
    salario: '',
    region: '',
    prioridad: 'normal',
    esReemplazo: false,
    notas: '',
  })

  const isEmpresa = userRole === 'empresa' && userPropiedadId

  const fetchVacantes = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (isEmpresa) {
        params.set('propiedadId', userPropiedadId!)
      } else if (selectedProperty !== 'all') {
        params.set('propiedadId', selectedProperty)
      }
      const res = await fetch(`/api/vacantes?${params}`)
      const data = await res.json()
      setVacantes(Array.isArray(data) ? data : [])
    } catch {
      // error
    } finally {
      setLoading(false)
    }
  }, [isEmpresa, userPropiedadId, selectedProperty])

  useEffect(() => {
    fetchVacantes()
  }, [fetchVacantes])

  const abrirNuevo = () => {
    setEditingVacante(null)
    setForm({
      posicion: '',
      departamento: '',
      descripcion: '',
      tipoContrato: 'indefinido',
      tipoJornada: 'fijo',
      horario: '',
      salario: '',
      region: '',
      prioridad: 'normal',
      esReemplazo: false,
      notas: '',
    })
    setShowFormDialog(true)
  }

  const abrirEditar = (vacante: Vacante) => {
    setEditingVacante(vacante)
    setForm({
      posicion: vacante.posicion,
      departamento: vacante.departamento || '',
      descripcion: vacante.descripcion || '',
      tipoContrato: vacante.tipoContrato || 'indefinido',
      tipoJornada: vacante.tipoJornada || 'fijo',
      horario: vacante.horario || '',
      salario: vacante.salario?.toString() || '',
      region: vacante.region || '',
      prioridad: vacante.prioridad,
      esReemplazo: vacante.esReemplazo,
      notas: vacante.notas || '',
    })
    setShowFormDialog(true)
  }

  const guardarVacante = async () => {
    if (!form.posicion) {
      toast.error(locale === 'es' ? 'Posición es requerida' : 'Position is required')
      return
    }

    const propId = isEmpresa ? userPropiedadId : (selectedProperty !== 'all' ? selectedProperty : null)
    if (!propId) {
      toast.error(locale === 'es' ? 'Selecciona una propiedad' : 'Select a property')
      return
    }

    try {
      const payload = {
        propiedadId: propId,
        posicion: form.posicion,
        departamento: form.departamento || null,
        descripcion: form.descripcion || null,
        tipoContrato: form.tipoContrato,
        tipoJornada: form.tipoJornada,
        horario: form.horario || null,
        salario: form.salario || null,
        region: form.region || null,
        prioridad: form.prioridad,
        esReemplazo: form.esReemplazo,
        notas: form.notas || null,
      }

      let res: Response
      if (editingVacante) {
        res = await fetch(`/api/vacantes/${editingVacante.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/vacantes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) throw new Error('Error')

      toast.success(editingVacante
        ? (locale === 'es' ? 'Vacante actualizada' : 'Vacancy updated')
        : (locale === 'es' ? 'Vacante creada' : 'Vacancy created'))
      setShowFormDialog(false)
      fetchVacantes()
    } catch {
      toast.error(locale === 'es' ? 'Error al guardar' : 'Error saving')
    }
  }

  const cambiarEstado = async (id: string, estado: string) => {
    try {
      await fetch(`/api/vacantes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado }),
      })
      toast.success(locale === 'es' ? `Vacante ${estado}` : `Vacancy ${estado}`)
      fetchVacantes()
    } catch {
      toast.error(locale === 'es' ? 'Error' : 'Error')
    }
  }

  const eliminarVacante = async (id: string) => {
    try {
      await fetch(`/api/vacantes/${id}`, { method: 'DELETE' })
      toast.success(locale === 'es' ? 'Vacante eliminada' : 'Vacancy deleted')
      fetchVacantes()
    } catch {
      toast.error(locale === 'es' ? 'Error' : 'Error')
    }
  }

  // Candidatos asignados a una vacante
  const getCandidatosAsignados = (vacante: Vacante): Candidato[] => {
    if (!vacante.candidatosAsignados) return []
    try {
      const ids = JSON.parse(vacante.candidatosAsignados) as string[]
      return candidatos.filter(c => ids.includes(c.id))
    } catch {
      return []
    }
  }

  // Asignar candidato a vacante
  const asignarCandidato = async (vacante: Vacante, candidatoId: string) => {
    const actuales = getCandidatosAsignados(vacante)
    if (actuales.find(c => c.id === candidatoId)) {
      toast.error(locale === 'es' ? 'Ya está asignado' : 'Already assigned')
      return
    }
    const nuevosIds = [...actuales.map(c => c.id), candidatoId]
    try {
      await fetch(`/api/vacantes/${vacante.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidatosAsignados: JSON.stringify(nuevosIds) }),
      })
      toast.success(locale === 'es' ? 'Candidato asignado' : 'Candidate assigned')
      fetchVacantes()
    } catch {
      toast.error(locale === 'es' ? 'Error' : 'Error')
    }
  }

  // Contratar candidato (cambia vacante a cubierta y candidato a contratado)
  const contratarCandidato = async (vacante: Vacante, candidato: Candidato) => {
    try {
      // Cambiar vacante a cubierta
      await fetch(`/api/vacantes/${vacante.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'cubierta' }),
      })
      toast.success(locale === 'es' ? `¡${candidato.nombre} contratado!` : `${candidato.nombre} hired!`)
      fetchVacantes()
    } catch {
      toast.error(locale === 'es' ? 'Error' : 'Error')
    }
  }

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente': return 'bg-red-100 text-red-700'
      case 'alta': return 'bg-orange-100 text-orange-700'
      case 'normal': return 'bg-blue-100 text-blue-700'
      case 'baja': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'abierta': return 'bg-green-100 text-green-700'
      case 'cubierta': return 'bg-teal-100 text-teal-700'
      case 'cancelada': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Briefcase className="size-5 text-teal-600" />
            {locale === 'es' ? 'Vacantes Disponibles' : 'Open Vacancies'}
            {vacantes.filter(v => v.estado === 'abierta').length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {vacantes.filter(v => v.estado === 'abierta').length} {locale === 'es' ? 'abiertas' : 'open'}
              </Badge>
            )}
          </h2>
          <p className="text-xs text-muted-foreground">
            {locale === 'es'
              ? 'Habilita vacantes para buscar candidatos o solicita reemplazos'
              : 'Enable vacancies to find candidates or request replacements'}
          </p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5 shrink-0" onClick={abrirNuevo}>
          <Plus className="size-4" />
          {locale === 'es' ? 'Habilitar Vacante' : 'Enable Vacancy'}
        </Button>
      </div>

      {/* Vacantes List */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
        </div>
      ) : vacantes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="size-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="font-medium text-muted-foreground">
              {locale === 'es' ? 'No hay vacantes' : 'No vacancies'}
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {locale === 'es' ? 'Habilita una vacante para buscar candidatos' : 'Enable a vacancy to find candidates'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {vacantes.map(vacante => {
            const asignados = getCandidatosAsignados(vacante)
            return (
              <Card key={vacante.id} className={!vacante.estado || vacante.estado !== 'abierta' ? 'opacity-70' : ''}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-sm">{vacante.posicion}</span>
                        <Badge className={`text-[10px] ${getEstadoColor(vacante.estado)}`}>
                          {vacante.estado}
                        </Badge>
                        <Badge className={`text-[10px] ${getPrioridadColor(vacante.prioridad)}`}>
                          {vacante.prioridad}
                        </Badge>
                        {vacante.esReemplazo && (
                          <Badge variant="outline" className="text-[10px] text-amber-700 border-amber-200 bg-amber-50">
                            {locale === 'es' ? '🔄 Reemplazo' : '🔄 Replacement'}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {!isEmpresa && <span>{vacante.propiedad.nombre}</span>}
                        {vacante.departamento && <span>📍 {vacante.departamento}</span>}
                        {vacante.tipoContrato && <span>📄 {vacante.tipoContrato}</span>}
                        {vacante.tipoJornada && <span>⏰ {vacante.tipoJornada}</span>}
                        {vacante.horario && <span>🕒 {vacante.horario}</span>}
                        {vacante.salario && <span>💰 ${vacante.salario}</span>}
                        {vacante.region && <span><MapPin className="size-3 inline" /> {vacante.region}</span>}
                      </div>
                      {vacante.descripcion && (
                        <p className="text-xs text-muted-foreground mt-1">{vacante.descripcion}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {locale === 'es' ? 'Abierta:' : 'Opened:'} {new Date(vacante.fechaApertura).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {vacante.estado === 'abierta' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setAsignarCandidatosVacante(vacante)}
                        >
                          <Users className="size-3 mr-1" />
                          {locale === 'es' ? 'Asignar' : 'Assign'}
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="size-7" onClick={() => abrirEditar(vacante)}>
                        <Pencil className="size-3.5" />
                      </Button>
                      {vacante.estado === 'abierta' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive"
                          onClick={() => cambiarEstado(vacante.id, 'cancelada')}
                          title={locale === 'es' ? 'Cancelar' : 'Cancel'}
                        >
                          <XCircle className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Candidatos asignados */}
                  {asignados.length > 0 && (
                    <div className="border-t pt-2 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        {locale === 'es' ? 'Candidatos asignados:' : 'Assigned candidates:'} ({asignados.length})
                      </p>
                      <div className="space-y-2">
                        {asignados.map(cand => (
                          <div key={cand.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm">
                            <Avatar className="size-7">
                              <AvatarFallback className="bg-teal-100 text-teal-700 text-xs">
                                {cand.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-xs">{cand.nombre}</span>
                              <span className="text-[10px] text-muted-foreground ml-1">· {cand.experiencia} {locale === 'es' ? 'años exp.' : 'yrs exp.'}</span>
                            </div>
                            {cand.puntuacionEntrevista && (
                              <Badge variant="outline" className="text-[10px]">{cand.puntuacionEntrevista}/100</Badge>
                            )}
                            {vacante.estado === 'abierta' && (
                              <Button
                                size="sm"
                                className="h-6 text-[10px] bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => contratarCandidato(vacante, cand)}
                              >
                                <CheckCircle className="size-3 mr-1" />
                                {locale === 'es' ? 'Contratar' : 'Hire'}
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Dialog: Crear/Editar Vacante */}
      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="size-5 text-teal-600" />
              {editingVacante ? (locale === 'es' ? 'Editar Vacante' : 'Edit Vacancy') : (locale === 'es' ? 'Habilitar Vacante' : 'Enable Vacancy')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{locale === 'es' ? 'Posición *' : 'Position *'}</Label>
                <Input value={form.posicion} onChange={e => setForm(prev => ({ ...prev, posicion: e.target.value }))} placeholder="Mesero, Bartender..." />
              </div>
              <div className="space-y-1.5">
                <Label>{locale === 'es' ? 'Departamento' : 'Department'}</Label>
                <Input value={form.departamento} onChange={e => setForm(prev => ({ ...prev, departamento: e.target.value }))} placeholder="A&B, Recepción..." />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{locale === 'es' ? 'Tipo de Contrato' : 'Contract Type'}</Label>
                <Select value={form.tipoContrato} onValueChange={v => setForm(prev => ({ ...prev, tipoContrato: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="indefinido">{locale === 'es' ? 'Indefinido' : 'Permanent'}</SelectItem>
                    <SelectItem value="temporal">{locale === 'es' ? 'Temporal' : 'Temporary'}</SelectItem>
                    <SelectItem value="eventual">{locale === 'es' ? 'Eventual' : 'Eventual'}</SelectItem>
                    <SelectItem value="practica">{locale === 'es' ? 'Práctica' : 'Internship'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{locale === 'es' ? 'Tipo de Jornada' : 'Schedule Type'}</Label>
                <Select value={form.tipoJornada} onValueChange={v => setForm(prev => ({ ...prev, tipoJornada: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fijo">{locale === 'es' ? 'Fijo' : 'Fixed'}</SelectItem>
                    <SelectItem value="mixto">{locale === 'es' ? 'Mixto' : 'Mixed'}</SelectItem>
                    <SelectItem value="variable">{locale === 'es' ? 'Variable' : 'Variable'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{locale === 'es' ? 'Horario' : 'Schedule'}</Label>
                <Input value={form.horario} onChange={e => setForm(prev => ({ ...prev, horario: e.target.value }))} placeholder="08:00-16:00" />
              </div>
              <div className="space-y-1.5">
                <Label>{locale === 'es' ? 'Salario' : 'Salary'}</Label>
                <Input type="number" value={form.salario} onChange={e => setForm(prev => ({ ...prev, salario: e.target.value }))} placeholder="5000" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{locale === 'es' ? 'Región' : 'Region'}</Label>
                <Select value={form.region} onValueChange={v => setForm(prev => ({ ...prev, region: v }))}>
                  <SelectTrigger><SelectValue placeholder={locale === 'es' ? 'Seleccionar...' : 'Select...'} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cdmx">CDMX</SelectItem>
                    <SelectItem value="puebla">Puebla</SelectItem>
                    <SelectItem value="cancun">Cancún</SelectItem>
                    <SelectItem value="playa_carmen">Playa del Carmen</SelectItem>
                    <SelectItem value="los_cabos">Los Cabos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{locale === 'es' ? 'Prioridad' : 'Priority'}</Label>
                <Select value={form.prioridad} onValueChange={v => setForm(prev => ({ ...prev, prioridad: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baja">{locale === 'es' ? 'Baja' : 'Low'}</SelectItem>
                    <SelectItem value="normal">{locale === 'es' ? 'Normal' : 'Normal'}</SelectItem>
                    <SelectItem value="alta">{locale === 'es' ? 'Alta' : 'High'}</SelectItem>
                    <SelectItem value="urgente">{locale === 'es' ? 'Urgente' : 'Urgent'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>{locale === 'es' ? 'Descripción' : 'Description'}</Label>
              <Textarea value={form.descripcion} onChange={e => setForm(prev => ({ ...prev, descripcion: e.target.value }))} placeholder={locale === 'es' ? 'Descripción del puesto...' : 'Job description...'} rows={2} />
            </div>

            <div className="space-y-1.5">
              <Label>{locale === 'es' ? 'Notas' : 'Notes'}</Label>
              <Textarea value={form.notas} onChange={e => setForm(prev => ({ ...prev, notas: e.target.value }))} placeholder={locale === 'es' ? 'Notas internas...' : 'Internal notes...'} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFormDialog(false)}>{locale === 'es' ? 'Cancelar' : 'Cancel'}</Button>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={guardarVacante}>
              {editingVacante ? (locale === 'es' ? 'Guardar' : 'Save') : (locale === 'es' ? 'Crear Vacante' : 'Create Vacancy')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Asignar Candidatos */}
      <Dialog open={!!asignarCandidatosVacante} onOpenChange={(open) => !open && setAsignarCandidatosVacante(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="size-5 text-teal-600" />
              {locale === 'es' ? 'Asignar Candidatos' : 'Assign Candidates'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <p className="text-sm text-muted-foreground">
              {locale === 'es' ? 'Selecciona candidatos del pool para esta vacante' : 'Select candidates from the pool for this vacancy'}
            </p>
            {candidatos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {locale === 'es' ? 'No hay candidatos disponibles' : 'No candidates available'}
              </p>
            ) : (
              <div className="space-y-2">
                {candidatos.map(cand => {
                  const yaAsignado = asignarCandidatosVacante && getCandidatosAsignados(asignarCandidatosVacante).find(c => c.id === cand.id)
                  return (
                    <div key={cand.id} className="flex items-center gap-2 p-2 border rounded text-sm">
                      <Avatar className="size-8">
                        <AvatarFallback className="bg-teal-100 text-teal-700 text-xs">
                          {cand.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs">{cand.nombre}</p>
                        <p className="text-[10px] text-muted-foreground">{cand.posicion} · {cand.experiencia} {locale === 'es' ? 'años' : 'yrs'}</p>
                      </div>
                      {yaAsignado ? (
                        <Badge variant="secondary" className="text-[10px]">✓</Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => asignarCandidatosVacante && asignarCandidato(asignarCandidatosVacante, cand.id)}
                        >
                          <Plus className="size-3 mr-1" />
                          {locale === 'es' ? 'Asignar' : 'Assign'}
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAsignarCandidatosVacante(null)}>
              {locale === 'es' ? 'Cerrar' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
