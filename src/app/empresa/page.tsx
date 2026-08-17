'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { Toaster } from 'sonner'
import { AppSidebarEmpresa } from '@/components/app-sidebar-empresa'
import type { EmpresaView } from '@/components/app-sidebar-empresa'
import { CotizadorCapacitacion } from '@/components/capacitacion/cotizador-capacitacion'

function Loading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
    </div>
  )
}

const EmpleadosModule = dynamic(() => import('@/components/empleados/empleados-module').then(m => ({ default: m.EmpleadosModule })), { loading: () => <Loading /> })
const ProveedoresModule = dynamic(() => import('@/components/proveedores/proveedores-module').then(m => ({ default: m.ProveedoresModule })), { loading: () => <Loading /> })
const ServiciosAdmin = dynamic(() => import('@/components/servicios/servicios-admin').then(m => ({ default: m.ServiciosAdmin })), { loading: () => <Loading /> })
const VentasModule = dynamic(() => import('@/components/ventas/ventas-module').then(m => ({ default: m.VentasModule })), { loading: () => <Loading /> })
const CapacitacionModule = dynamic(() => import('@/components/capacitacion/capacitacion-module').then(m => ({ default: m.CapacitacionModule })), { loading: () => <Loading /> })

interface Session {
  id: string
  nombre: string
  rol: string
  propiedadId: string
  propiedadNombre: string
}

interface Propiedad {
  id: string
  nombre: string
  tipo: string
  ubicacion: string
  region: string
  plan: string
  activo: boolean
}

function DashboardEmpresa({ session, locale }: { session: Session; locale: 'es' | 'en' }) {
  const [metricas, setMetricas] = useState<Record<string, number> | null>(null)
  const [solicitudes, setSolicitudes] = useState<Record<string, unknown>[]>([])
  const [showCotizador, setShowCotizador] = useState(false)
  const [capacitaciones, setCapacitaciones] = useState<[]>([])
  const [propiedades, setPropiedades] = useState<[]>([])

  useEffect(() => {
    Promise.all([
      fetch(`/api/dashboard?propiedadId=${session.propiedadId}`).then(r => r.json()),
      fetch(`/api/solicitudes?propiedadId=${session.propiedadId}`).then(r => r.json()),
      fetch('/api/capacitaciones').then(r => r.json()),
      fetch('/api/propiedades').then(r => r.json()),
    ]).then(([dash, sol, cap, prop]) => {
      setMetricas(dash)
      setSolicitudes(Array.isArray(sol) ? sol : sol.solicitudes || [])
      setCapacitaciones(Array.isArray(cap) ? cap : [])
      setPropiedades(Array.isArray(prop) ? prop.filter((p: { id: string }) => p.id === session.propiedadId) : [])
    })
  }, [session])

  const cards = metricas ? [
    { label: locale === 'es' ? 'Empleados Activos' : 'Active Employees', value: metricas.empleadosActivos, color: 'text-teal-600' },
    { label: 'NPS Promedio', value: metricas.npsPromedio?.toFixed(1), color: 'text-amber-500' },
    { label: locale === 'es' ? 'Ventas Totales' : 'Total Sales', value: `$${metricas.montoTotalVentas?.toFixed(0)}`, color: 'text-emerald-600' },
    { label: locale === 'es' ? 'Cursos Completados' : 'Courses Completed', value: metricas.cursosCompletados, color: 'text-teal-600' },
    { label: locale === 'es' ? 'Alertas Pendientes' : 'Pending Alerts', value: metricas.alertasPendientes, color: 'text-red-500' },
    { label: locale === 'es' ? 'Empleados en Riesgo' : 'At Risk', value: (metricas.riesgoCritico || 0) + (metricas.riesgoAlto || 0), color: 'text-amber-600' },
  ] : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{locale === 'es' ? 'Dashboard' : 'Dashboard'}</h1>
          <p className="text-sm text-muted-foreground">{session.propiedadNombre}</p>
        </div>
        <button
          onClick={() => setShowCotizador(true)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {locale === 'es' ? '+ Solicitar Capacitación' : '+ Request Training'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {cards.map((card, i) => (
          <div key={i} className="rounded-lg border bg-card p-4">
            <div className={`text-2xl font-bold ${card.color}`}>{card.value ?? '...'}</div>
            <div className="text-xs text-muted-foreground mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-card">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-sm">{locale === 'es' ? 'Solicitudes de Capacitación' : 'Training Requests'}</h2>
          <span className="text-xs text-muted-foreground">{solicitudes.length} total</span>
        </div>
        <div className="p-4 space-y-3">
          {solicitudes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              {locale === 'es' ? 'No hay solicitudes' : 'No requests yet'}
            </p>
          ) : solicitudes.map((sol: Record<string, unknown>) => (
            <div key={sol.id as string} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <div className="font-medium text-sm">
                  {(sol.capacitacion as { titulo: string } | null)?.titulo || (locale === 'es' ? 'Capacitación personalizada' : 'Custom training')}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {new Date(sol.fechaSolicitada as string).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US')}
                  {' · '}
                  {sol.modalidad as string}
                  {' · '}
                  {sol.participantes as number} {locale === 'es' ? 'participantes' : 'participants'}
                  {sol.costo ? ` · $${(sol.costo as number).toFixed(0)}` : ''}
                </div>
                {(sol.linkZoom as string) && (sol.estado as string) === 'confirmada' && (
                  <a href={sol.linkZoom as string} target="_blank" rel="noreferrer" className="text-xs text-teal-600 hover:underline">
                    🔗 {locale === 'es' ? 'Unirse a Zoom' : 'Join Zoom'}
                  </a>
                )}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                sol.estado === 'confirmada' ? 'bg-emerald-100 text-emerald-700' :
                sol.estado === 'cancelada' ? 'bg-red-100 text-red-700' :
                sol.estado === 'completada' ? 'bg-teal-100 text-teal-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {sol.estado as string}
              </span>
            </div>
          ))}
        </div>
      </div>

      <CotizadorCapacitacion
        open={showCotizador}
        onClose={() => setShowCotizador(false)}
        capacitaciones={capacitaciones}
        propiedades={propiedades}
      />
    </div>
  )
}

function SucursalesEmpresa({ session, locale }: { session: Session; locale: 'es' | 'en' }) {
  const [propiedades, setPropiedades] = useState<Propiedad[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/propiedades')
      .then(r => r.json())
      .then(data => {
        setPropiedades(Array.isArray(data) ? data : [])
        setLoading(false)
      })
  }, [])

  const TIPO_EMOJI: Record<string, string> = {
    hotel: '🏨', restaurante: '🍽️', bar: '🍺',
    spa: '💆', resort: '🏖️', cafe: '☕',
    discoteca: '🎵', club_playa: '🏄',
  }

  const PLAN_COLOR: Record<string, string> = {
    boutique: 'bg-amber-100 text-amber-700',
    growth: 'bg-teal-100 text-teal-700',
    enterprise: 'bg-purple-100 text-purple-700',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{locale === 'es' ? 'Mis Sucursales' : 'My Branches'}</h1>
        <p className="text-sm text-muted-foreground">
          {locale === 'es' ? 'Propiedades registradas en tu cuenta' : 'Properties registered in your account'}
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {propiedades.map(p => (
            <div key={p.id} className={`rounded-lg border bg-card p-4 ${p.id === session.propiedadId ? 'border-teal-500 ring-1 ring-teal-500' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{TIPO_EMOJI[p.tipo] || '🏢'}</span>
                  <div>
                    <div className="font-semibold text-sm">{p.nombre}</div>
                    <div className="text-xs text-muted-foreground">{p.ubicacion}</div>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PLAN_COLOR[p.plan] || 'bg-gray-100 text-gray-700'}`}>
                  {p.plan}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${p.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {p.activo ? (locale === 'es' ? 'Activa' : 'Active') : (locale === 'es' ? 'Inactiva' : 'Inactive')}
                </span>
                {p.id === session.propiedadId && (
                  <span className="text-xs text-teal-600 font-medium">
                    ✓ {locale === 'es' ? 'Propiedad actual' : 'Current property'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const viewLabels: Record<EmpresaView, { es: string; en: string }> = {
  dashboard: { es: 'Dashboard', en: 'Dashboard' },
  empleados: { es: 'Empleados', en: 'Employees' },
  servicios: { es: 'Menú & Servicios', en: 'Menu & Services' },
  ventas: { es: 'Ventas & NPS', en: 'Sales & NPS' },
  capacitacion: { es: 'Capacitación', en: 'Training' },
    sucursales: { es: 'Mis Sucursales', en: 'My Branches' },
  proveedores: { es: 'Proveedores', en: 'Suppliers' },
}

export default function EmpresaPage() {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [currentView, setCurrentView] = useState<EmpresaView>('dashboard')
  const [locale, setLocale] = useState<'es' | 'en'>('es')

  useEffect(() => {
    const stored = localStorage.getItem('hospitalityup_session')
    if (!stored) { router.push('/login'); return }
    const parsed = JSON.parse(stored)
    if (parsed.rol !== 'empresa') { router.push('/login'); return }
    setSession(parsed)
  }, [router])

  if (!session) return null

  function ContentArea() {
    switch (currentView) {
      case 'dashboard': return <DashboardEmpresa session={session!} locale={locale} />
      case 'empleados': return <EmpleadosModule />
      case 'servicios': return <ServiciosAdmin />
      case 'ventas': return <VentasModule />
      case 'capacitacion': return <CapacitacionModule />
            case 'sucursales': return <SucursalesEmpresa session={session!} locale={locale} />
      case 'proveedores': return <ProveedoresModule />
      default: return <DashboardEmpresa session={session!} locale={locale} />
    }
  }

  const pageTitle = viewLabels[currentView][locale]

  return (
    <>
      <SidebarProvider>
        <AppSidebarEmpresa
          currentView={currentView}
          setCurrentView={setCurrentView}
          locale={locale}
          setLocale={setLocale}
          nombreEmpresa={session.nombre}
          nombrePropiedad={session.propiedadNombre}
        />
        <SidebarInset>
          <div className="flex min-h-screen flex-col">
            <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-muted-foreground">
                      {session.propiedadNombre}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-medium">{pageTitle}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            <main className="flex-1 p-4 md:p-6">
              <ContentArea />
            </main>
            <footer className="mt-auto border-t bg-background px-4 py-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>© 2025 HospitalityUP · {session.propiedadNombre}</span>
                <span>{locale === 'es' ? 'Idioma: Español' : 'Language: English'}</span>
              </div>
            </footer>
          </div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster richColors position="top-right" />
    </>
  )
}