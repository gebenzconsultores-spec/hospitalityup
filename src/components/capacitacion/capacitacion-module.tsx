'use client'

import { useState } from 'react'
import { Monitor, MapPin, Calendar, Users } from 'lucide-react'
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
  modalidad?: string
}

interface Propiedad {
  id: string
  nombre: string
}

interface CotizadorCapacitacionProps {
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
}: CotizadorCapacitacionProps) {
  const { selectedProperty } = useAppStore()

  const [form, setForm] = useState({
    capacitacionId: '',
    propiedadId: selectedProperty !== 'all' ? selectedProperty : '',
    modalidad: 'presencial',
    participantes: 1,
    fechaEstimada: '',
    notas: '',
  })

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        toast.success('Solicitud de cotización enviada correctamente')
        onClose()
      } else {
        toast.error('Error al enviar la solicitud')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Solicitar Cotización de Capacitación</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Selección de Capacitación */}
          <div className="space-y-2">
            <Label htmlFor="capacitacion">Capacitación / Curso</Label>
            <Select
              value={form.capacitacionId}
              onValueChange={(val) => setForm((prev) => ({ ...prev, capacitacionId: val }))}
            >
              <SelectTrigger id="capacitacion">
                <SelectValue placeholder="Selecciona un curso..." />
              </SelectTrigger>
              <SelectContent>
                {capacitaciones.map((cap) => (
                  <SelectItem key={cap.id} value={cap.id}>
                    {cap.titulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selección de Propiedad */}
          {propiedades.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="propiedad">Propiedad / Sede</Label>
              <Select
                value={form.propiedadId}
                onValueChange={(val) => setForm((prev) => ({ ...prev, propiedadId: val }))}
              >
                <SelectTrigger id="propiedad">
                  <SelectValue placeholder="Selecciona la sede..." />
                </SelectTrigger>
                <SelectContent>
                  {propiedades.map((prop) => (
                    <SelectItem key={prop.id} value={prop.id}>
                      {prop.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Modalidad y Participantes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="modalidad">Modalidad</Label>
              <Select
                value={form.modalidad}
                onValueChange={(val) => setForm((prev) => ({ ...prev, modalidad: val }))}
              >
                <SelectTrigger id="modalidad">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="presencial">
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> Presencial
                    </span>
                  </SelectItem>
                  <SelectItem value="virtual">
                    <span className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" /> Virtual
                    </span>
                  </SelectItem>
                  <SelectItem value="hibrido">Híbrido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="participantes">Participantes</Label>
              <div className="relative">
                <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="participantes"
                  type="number"
                  min={1}
                  className="pl-9"
                  value={form.participantes}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, participantes: parseInt(e.target.value) || 1 }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Fecha Estimada */}
          <div className="space-y-2">
            <Label htmlFor="fechaEstimada">Fecha Estimada</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="fechaEstimada"
                type="date"
                className="pl-9"
                value={form.fechaEstimada}
                onChange={(e) => setForm((prev) => ({ ...prev, fechaEstimada: e.target.value }))}
              />
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notas">Notas / Requerimientos</Label>
            <Textarea
              id="notas"
              rows={3}
              placeholder="Detalla necesidades específicas..."
              value={form.notas}
              onChange={(e) => setForm((prev) => ({ ...prev, notas: e.target.value }))}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-700 text-white">
              {loading ? 'Enviando...' : 'Enviar Solicitud'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}