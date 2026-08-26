'use client'

import { useState } from 'react'
import { Monitor, MapPin, Calendar, Users, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

interface Capacitacion {
  id: string
  titulo: string
  tituloEn?: string | null
  modalidad?: string
  duracion?: number
  categoria?: string
}

interface Propiedad {
  id: string
  nombre: string
}

interface CotizadorProps {
  open: boolean
  onClose: () => void
  capacitaciones?: Capacitacion[]
  propiedades?: Propiedad[]
}

export function CotizadorCapacitacion({
  open,
  onClose,
  capacitaciones = [],
  propiedades = [],
}: CotizadorProps) {
  const { locale, selectedProperty } = useAppStore()

  const [form, setForm] = useState({
    capacitacionId: '',
    propiedadId: selectedProperty !== 'all' ? selectedProperty : '',
    modalidad: 'virtual',
    fechaSolicitada: '',
    participantes: '5',
    notas: '',
  })

  const [enviando, setEnviando] = useState(false)

  const handleEnviar = async () => {
    if (!form.fechaSolicitada) {
      toast.error(locale === 'es' ? 'Selecciona una fecha' : 'Select a date')
      return
    }
    const propId = form.propiedadId || propiedades[0]?.id
    if (!propId) {
      toast.error(locale === 'es' ? 'Selecciona una propiedad' : 'Select a property')
      return
    }

    setEnviando(true)
    try {
      const res = await fetch('/api/solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propiedadId: propId,
          capacitacionId: form.capacitacionId || null,
          modalidad: form.modalidad,
          fechaSolicitada: form.fechaSolicitada,
          participantes: parseInt(form.participantes) || 1,
          notas: form.notas || null,
          estado: 'pendiente',
        }),
      })
      if (res.ok) {
        toast.success(
          locale === 'es'
            ? 'Solicitud enviada. El admin la revisará pronto.'
            : 'Request sent. Admin will review it soon.'
        )
        onClose()
        setForm({
          capacitacionId: '',
          propiedadId: '',
          modalidad: 'virtual',
          fechaSolicitada: '',
          participantes: '5',
          notas: '',
        })
      } else {
        toast.error(locale === 'es' ? 'Error al enviar solicitud' : 'Error sending request')
      }
    } catch {
      toast.error(locale === 'es' ? 'Error de conexión' : 'Connection error')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-5 text-teal-600" />
            {locale === 'es' ? 'Solicitar Capacitación' : 'Request Training'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            {locale === 'es'
              ? 'Completa la solicitud. El administrador la revisará y te confirmará los detalles.'
              : 'Complete the request. The administrator will review it and confirm the details.'}
          </p>

          {/* Curso */}
          <div className="space-y-1">
            <Label>{locale === 'es' ? 'Tema / Curso (opcional)' : 'Topic / Course (optional)'}</Label>
            <Select
              value={form.capacitacionId}
              onValueChange={(v) => setForm((p) => ({ ...p, capacitacionId: v }))}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    locale === 'es'
                      ? 'Seleccionar curso o escribir tema...'
                      : 'Select course or write topic...'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="otro">
                  {locale === 'es'
                    ? 'Otro tema (especificar en notas)'
                    : 'Other topic (specify in notes)'}
                </SelectItem>
                {capacitaciones.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {locale === 'en' && c.tituloEn ? c.tituloEn : c.titulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Propiedad */}
          {propiedades.length > 1 && (
            <div className="space-y-1">
              <Label>{locale === 'es' ? 'Propiedad' : 'Property'}</Label>
              <Select
                value={form.propiedadId}
                onValueChange={(v) => setForm((p) => ({ ...p, propiedadId: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {propiedades.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Modalidad */}
          <div className="space-y-1">
            <Label>{locale === 'es' ? 'Modalidad preferida' : 'Preferred modality'}</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={form.modalidad === 'virtual' ? 'default' : 'outline'}
                className={form.modalidad === 'virtual' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                onClick={() => setForm((p) => ({ ...p, modalidad: 'virtual' }))}
              >
                <Monitor className="size-3.5 mr-1" />
                {locale === 'es' ? 'Virtual' : 'Virtual'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={form.modalidad === 'presencial' ? 'default' : 'outline'}
                className={form.modalidad === 'presencial' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                onClick={() => setForm((p) => ({ ...p, modalidad: 'presencial' }))}
              >
                <MapPin className="size-3.5 mr-1" />
                {locale === 'es' ? 'Presencial' : 'In-person'}
              </Button>
            </div>
          </div>

          {/* Fecha y participantes */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="flex items-center gap-1">
                <Calendar className="size-3.5" />
                {locale === 'es' ? 'Fecha deseada *' : 'Desired date *'}
              </Label>
              <Input
                type="date"
                value={form.fechaSolicitada}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setForm((p) => ({ ...p, fechaSolicitada: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label className="flex items-center gap-1">
                <Users className="size-3.5" />
                {locale === 'es' ? 'Participantes' : 'Participants'}
              </Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={form.participantes}
                onChange={(e) => setForm((p) => ({ ...p, participantes: e.target.value }))}
              />
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-1">
            <Label>
              {locale === 'es'
                ? 'Notas o requisitos especiales'
                : 'Notes or special requirements'}
            </Label>
            <Textarea
              value={form.notas}
              onChange={(e) => setForm((p) => ({ ...p, notas: e.target.value }))}
              placeholder={
                locale === 'es'
                  ? 'Describe el tema si no está en el catálogo, horario preferido, requisitos especiales...'
                  : 'Describe the topic if not in catalog, preferred schedule, special requirements...'
              }
              rows={3}
            />
          </div>

          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-400">
            {locale === 'es'
              ? 'El administrador revisará tu solicitud y te enviará la confirmación con los detalles del instructor y enlace de acceso.'
              : 'The administrator will review your request and send you confirmation with instructor details and access link.'}
          </div>
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
            {locale === 'es' ? 'Enviar Solicitud' : 'Send Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}