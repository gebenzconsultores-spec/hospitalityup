'use client'

import { useState } from 'react'
import { Monitor, MapPin, DollarSign, Link, Users, Calendar, Calculator, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

interface Capacitacion {
  id: string
  titulo: string
  tituloEn: string | null
  modalidad: string
  duracion: number
  categoria: string
}

interface Propiedad {
  id: string
  nombre: string
}

interface CotizadorProps {
  open: boolean
  onClose: () => void
  capacitaciones: Capacitacion[]
  propiedades: Propiedad[]
}

const TARIFAS_INSTRUCTOR = {
  principiante: 500,
  intermedio: 800,
  avanzado: 1200,
}

export function CotizadorCapacitacion({ open, onClose, capacitaciones, propiedades }: CotizadorProps) {
  const { locale, selectedProperty } = useAppStore()

  const [form, setForm] = useState({
    capacitacionId: '',
    propiedadId: selectedProperty !== 'all' ? selectedProperty : '',
    modalidad: 'virtual',
    fechaSolicitada: '',
    participantes: '5',
    nombreInstructor: '',
    linkZoom: '',
    notas: '',
    // Viáticos (solo presencial)
    costoTransporte: '0',
    costoHospedaje: '0',
    costoComida: '0',
    tarifaInstructor: '800',
    horasInstructor: '4',
  })

  const [enviando, setEnviando] = useState(false)
  const [cotizacion, setCotizacion] = useState<{
    subtotal: number
    viaticos: number
    total: number
    desglose: { concepto: string; monto: number }[]
  } | null>(null)

  const capacitacionSeleccionada = capacitaciones.find(c => c.id === form.capacitacionId)

  const calcularCotizacion = () => {
    const participantes = parseInt(form.participantes) || 1
    const tarifaInstructor = parseFloat(form.tarifaInstructor) || 0
    const horasInstructor = parseFloat(form.horasInstructor) || 1
    const costoInstructor = tarifaInstructor * horasInstructor

    const desglose: { concepto: string; monto: number }[] = [
      { concepto: locale === 'es' ? 'Honorarios del instructor' : 'Instructor fees', monto: costoInstructor },
    ]

    let viaticos = 0

    if (form.modalidad === 'presencial') {
      const transporte = parseFloat(form.costoTransporte) || 0
      const hospedaje = parseFloat(form.costoHospedaje) || 0
      const comida = parseFloat(form.costoComida) || 0
      viaticos = transporte + hospedaje + comida

      if (transporte > 0) desglose.push({ concepto: locale === 'es' ? 'Transporte' : 'Transportation', monto: transporte })
      if (hospedaje > 0) desglose.push({ concepto: locale === 'es' ? 'Hospedaje' : 'Accommodation', monto: hospedaje })
      if (comida > 0) desglose.push({ concepto: locale === 'es' ? 'Alimentación' : 'Meals', monto: comida })
    }

    const subtotal = costoInstructor
    const total = subtotal + viaticos

    setCotizacion({ subtotal, viaticos, total, desglose })
  }

  const handleEnviar = async () => {
    if (!form.capacitacionId || !form.propiedadId || !form.fechaSolicitada) {
      toast.error(locale === 'es' ? 'Completa los campos requeridos' : 'Complete required fields')
      return
    }
    if (form.modalidad === 'virtual' && !form.linkZoom) {
      toast.error(locale === 'es' ? 'Agrega el link de Zoom' : 'Add the Zoom link')
      return
    }

    setEnviando(true)
    try {
      const costo = cotizacion?.total || null
      const res = await fetch('/api/solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          capacitacionId: form.capacitacionId,
          propiedadId: form.propiedadId,
          modalidad: form.modalidad,
          fechaSolicitada: form.fechaSolicitada,
          participantes: parseInt(form.participantes),
          nombreInstructor: form.nombreInstructor || null,
          linkZoom: form.modalidad === 'virtual' ? form.linkZoom : null,
          notas: form.notas || null,
          costo,
          estado: 'pendiente',
        }),
      })

      if (res.ok) {
        toast.success(locale === 'es' ? '¡Capacitación solicitada exitosamente!' : 'Training requested successfully!')
        onClose()
        setForm({
          capacitacionId: '', propiedadId: '', modalidad: 'virtual',
          fechaSolicitada: '', participantes: '5', nombreInstructor: '',
          linkZoom: '', notas: '', costoTransporte: '0', costoHospedaje: '0',
          costoComida: '0', tarifaInstructor: '800', horasInstructor: '4',
        })
        setCotizacion(null)
      } else {
        toast.error(locale === 'es' ? 'Error al solicitar' : 'Error requesting')
      }
    } catch {
      toast.error(locale === 'es' ? 'Error de conexión' : 'Connection error')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="size-5 text-teal-600" />
            {locale === 'es' ? 'Solicitar y Cotizar Capacitación' : 'Request & Quote Training'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Capacitación */}
          <div className="space-y-1">
            <Label>{locale === 'es' ? 'Capacitación *' : 'Training *'}</Label>
            <Select value={form.capacitacionId} onValueChange={v => {
              const cap = capacitaciones.find(c => c.id === v)
              setForm(p => ({
                ...p,
                capacitacionId: v,
                modalidad: cap?.modalidad || 'virtual',
                horasInstructor: cap ? String(Math.ceil(cap.duracion / 60)) : '1',
              }))
              setCotizacion(null)
            }}>
              <SelectTrigger><SelectValue placeholder={locale === 'es' ? 'Seleccionar curso...' : 'Select course...'} /></SelectTrigger>
              <SelectContent>
                {capacitaciones.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {locale === 'en' && c.tituloEn ? c.tituloEn : c.titulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {capacitacionSeleccionada && (
              <div className="flex gap-2 mt-1">
                <Badge variant="outline" className="text-xs">{capacitacionSeleccionada.categoria}</Badge>
                <Badge variant="outline" className="text-xs">{capacitacionSeleccionada.duracion} min</Badge>
              </div>
            )}
          </div>

          {/* Propiedad + Fecha */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>{locale === 'es' ? 'Propiedad *' : 'Property *'}</Label>
              <Select value={form.propiedadId} onValueChange={v => setForm(p => ({ ...p, propiedadId: v }))}>
                <SelectTrigger><SelectValue placeholder={locale === 'es' ? 'Seleccionar...' : 'Select...'} /></SelectTrigger>
                <SelectContent>
                  {propiedades.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>{locale === 'es' ? 'Fecha *' : 'Date *'}</Label>
              <Input
                type="date"
                value={form.fechaSolicitada}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setForm(p => ({ ...p, fechaSolicitada: e.target.value }))}
              />
            </div>
          </div>

          {/* Modalidad + Participantes */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>{locale === 'es' ? 'Modalidad' : 'Modality'}</Label>
              <div className="flex gap-2">
                <Button
                  type="button" size="sm"
                  variant={form.modalidad === 'virtual' ? 'default' : 'outline'}
                  className={form.modalidad === 'virtual' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                  onClick={() => setForm(p => ({ ...p, modalidad: 'virtual' }))}
                >
                  <Monitor className="size-3.5 mr-1" />
                  {locale === 'es' ? 'Virtual' : 'Virtual'}
                </Button>
                <Button
                  type="button" size="sm"
                  variant={form.modalidad === 'presencial' ? 'default' : 'outline'}
                  className={form.modalidad === 'presencial' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                  onClick={() => setForm(p => ({ ...p, modalidad: 'presencial' }))}
                >
                  <MapPin className="size-3.5 mr-1" />
                  {locale === 'es' ? 'Presencial' : 'In-person'}
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              <Label>{locale === 'es' ? 'Participantes' : 'Participants'}</Label>
              <Input
                type="number" min="1" max="100"
                value={form.participantes}
                onChange={e => setForm(p => ({ ...p, participantes: e.target.value }))}
              />
            </div>
          </div>

          {/* Link Zoom (virtual) */}
          {form.modalidad === 'virtual' && (
            <div className="space-y-1">
              <Label className="flex items-center gap-1">
                <Link className="size-3.5 text-teal-600" />
                {locale === 'es' ? 'Link de Zoom *' : 'Zoom Link *'}
              </Label>
              <Input
                placeholder="https://zoom.us/j/..."
                value={form.linkZoom}
                onChange={e => setForm(p => ({ ...p, linkZoom: e.target.value }))}
              />
            </div>
          )}

          {/* Instructor */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1 space-y-1">
              <Label>{locale === 'es' ? 'Instructor' : 'Instructor'}</Label>
              <Input
                placeholder={locale === 'es' ? 'Nombre...' : 'Name...'}
                value={form.nombreInstructor}
                onChange={e => setForm(p => ({ ...p, nombreInstructor: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>{locale === 'es' ? 'Tarifa/hora ($)' : 'Rate/hour ($)'}</Label>
              <Input
                type="number" min="0"
                value={form.tarifaInstructor}
                onChange={e => setForm(p => ({ ...p, tarifaInstructor: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>{locale === 'es' ? 'Horas' : 'Hours'}</Label>
              <Input
                type="number" min="1"
                value={form.horasInstructor}
                onChange={e => setForm(p => ({ ...p, horasInstructor: e.target.value }))}
              />
            </div>
          </div>

          {/* Viáticos (presencial) */}
          {form.modalidad === 'presencial' && (
            <Card className="border-amber-200 dark:border-amber-800">
              <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-sm flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <DollarSign className="size-4" />
                  {locale === 'es' ? 'Viáticos del Instructor' : 'Instructor Travel Expenses'}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">{locale === 'es' ? 'Transporte ($)' : 'Transport ($)'}</Label>
                    <Input
                      type="number" min="0"
                      value={form.costoTransporte}
                      onChange={e => setForm(p => ({ ...p, costoTransporte: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{locale === 'es' ? 'Hospedaje ($)' : 'Lodging ($)'}</Label>
                    <Input
                      type="number" min="0"
                      value={form.costoHospedaje}
                      onChange={e => setForm(p => ({ ...p, costoHospedaje: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{locale === 'es' ? 'Alimentación ($)' : 'Meals ($)'}</Label>
                    <Input
                      type="number" min="0"
                      value={form.costoComida}
                      onChange={e => setForm(p => ({ ...p, costoComida: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notas */}
          <div className="space-y-1">
            <Label>{locale === 'es' ? 'Notas adicionales' : 'Additional notes'}</Label>
            <Textarea
              rows={2}
              placeholder={locale === 'es' ? 'Requisitos especiales, temas específicos...' : 'Special requirements, specific topics...'}
              value={form.notas}
              onChange={e => setForm(p => ({ ...p, notas: e.target.value }))}
            />
          </div>

          {/* Botón cotizar */}
          <Button
            type="button"
            variant="outline"
            className="w-full border-teal-500 text-teal-700 hover:bg-teal-50"
            onClick={calcularCotizacion}
          >
            <Calculator className="size-4 mr-2" />
            {locale === 'es' ? 'Calcular Cotización' : 'Calculate Quote'}
          </Button>

          {/* Resultado cotización */}
          {cotizacion && (
            <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20">
              <CardContent className="pt-4 pb-3 px-4 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="size-4 text-emerald-600" />
                  <span className="font-semibold text-sm text-emerald-700 dark:text-emerald-400">
                    {locale === 'es' ? 'Cotización Estimada' : 'Estimated Quote'}
                  </span>
                </div>
                {cotizacion.desglose.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.concepto}</span>
                    <span>${item.monto.toFixed(2)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>{locale === 'es' ? 'Total Estimado' : 'Estimated Total'}</span>
                  <span className="text-emerald-700 dark:text-emerald-400">${cotizacion.total.toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {locale === 'es'
                    ? '* Los precios son estimados y pueden variar según confirmación del instructor'
                    : '* Prices are estimates and may vary upon instructor confirmation'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {locale === 'es' ? 'Cancelar' : 'Cancel'}
          </Button>
          <Button
            className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
            onClick={handleEnviar}
            disabled={enviando}
          >
            {enviando ? (
              <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Calendar className="size-4" />
            )}
            {locale === 'es' ? 'Solicitar Capacitación' : 'Request Training'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}