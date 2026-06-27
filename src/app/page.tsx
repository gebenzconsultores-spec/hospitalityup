'use client'

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
import { useAppStore } from '@/lib/store'
import { translations } from '@/lib/i18n'
import type { ViewMode } from '@/lib/store'
import type { Locale } from '@/lib/i18n'
import { AppSidebar } from '@/components/app-sidebar'

// Lazy load modules - only compiles what's needed
const DashboardGerencial = dynamic(() => import('@/components/dashboard/dashboard-gerencial').then(m => ({ default: m.DashboardGerencial })), { loading: () => <Loading /> })
const VistaTrabajador = dynamic(() => import('@/components/trabajador/vista-trabajador').then(m => ({ default: m.VistaTrabajador })), { loading: () => <Loading /> })
const ServiciosAdmin = dynamic(() => import('@/components/servicios/servicios-admin').then(m => ({ default: m.ServiciosAdmin })), { loading: () => <Loading /> })
const EmpleadosModule = dynamic(() => import('@/components/empleados/empleados-module').then(m => ({ default: m.EmpleadosModule })), { loading: () => <Loading /> })
const VentasModule = dynamic(() => import('@/components/ventas/ventas-module').then(m => ({ default: m.VentasModule })), { loading: () => <Loading /> })
const CapacitacionModule = dynamic(() => import('@/components/capacitacion/capacitacion-module').then(m => ({ default: m.CapacitacionModule })), { loading: () => <Loading /> })
const BolsaTrabajo = dynamic(() => import('@/components/bolsa-trabajo/bolsa-trabajo').then(m => ({ default: m.BolsaTrabajo })), { loading: () => <Loading /> })
const ConfiguracionModule = dynamic(() => import('@/components/configuracion/configuracion').then(m => ({ default: m.ConfiguracionModule })), { loading: () => <Loading /> })
const PropiedadesModule = dynamic(() => import('@/components/propiedades/propiedades-module').then(m => ({ default: m.PropiedadesModule })), { loading: () => <Loading /> })
const LoginScreen = dynamic(() => import('@/components/auth/login-screen').then(m => ({ default: m.LoginScreen })), { loading: () => <FullPageLoading /> })
const NpsSurvey = dynamic(() => import('@/components/empleado/nps-survey').then(m => ({ default: m.NpsSurvey })), { loading: () => <Loading /> })
const ClimaOrganizacional = dynamic(() => import('@/components/empleado/clima-organizacional').then(m => ({ default: m.ClimaOrganizacional })), { loading: () => <Loading /> })

function Loading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
    </div>
  )
}

function FullPageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-900 via-emerald-900 to-teal-800">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-300"></div>
    </div>
  )
}

const viewLabels: Record<Locale, Record<ViewMode, string>> = {
  es: {
    dashboard: 'Dashboard',
    trabajador: 'Vista Trabajador',
    servicios: 'Menú & Servicios',
    propiedades: 'Propiedades',
    empleados: 'Empleados',
    ventas: 'Ventas & NPS',
    capacitacion: 'Capacitación',
    bolsa: 'Bolsa de Trabajo',
    configuracion: 'Configuración',
    'nps-survey': 'Encuesta NPS',
    clima: 'Clima Organizacional',
  },
  en: {
    dashboard: 'Dashboard',
    trabajador: 'Worker View',
    servicios: 'Menu & Services',
    propiedades: 'Properties',
    empleados: 'Employees',
    ventas: 'Sales & NPS',
    capacitacion: 'Training',
    bolsa: 'Job Pool',
    configuracion: 'Settings',
    'nps-survey': 'NPS Survey',
    clima: 'Org. Climate',
  },
}

export default function Home() {
  const { currentView, locale, isLoggedIn } = useAppStore()
  const t = translations[locale]

  // Show login screen if not logged in
  if (!isLoggedIn) {
    return <LoginScreen />
  }

  const pageTitle = viewLabels[locale][currentView]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex min-h-screen flex-col">
          <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-muted-foreground">
                    {t.appName}
                  </BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium">
                    {pageTitle}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          <main className="flex-1 p-4 md:p-6">
            <ContentArea currentView={currentView} />
          </main>

          <footer className="mt-auto border-t bg-background px-4 py-3">
            <div className="flex flex-col items-center justify-between gap-1 text-xs text-muted-foreground sm:flex-row">
              <span>© 2025 HospitalityUP · Centro de Mando de Capacitación Híbrido</span>
              <span>
                {locale === 'es' ? 'Idioma: Español' : 'Language: English'} · {locale === 'es' ? 'Región: México' : 'Region: Mexico'}
              </span>
            </div>
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function ContentArea({ currentView }: { currentView: ViewMode }) {
  switch (currentView) {
    case 'dashboard': return <DashboardGerencial />
    case 'trabajador': return <VistaTrabajador />
    case 'servicios': return <ServiciosAdmin />
    case 'propiedades': return <PropiedadesModule />
    case 'empleados': return <EmpleadosModule />
    case 'ventas': return <VentasModule />
    case 'capacitacion': return <CapacitacionModule />
    case 'bolsa': return <BolsaTrabajo />
    case 'configuracion': return <ConfiguracionModule />
    case 'nps-survey': return <NpsSurvey />
    case 'clima': return <ClimaOrganizacional />
    default: return <DashboardGerencial />
  }
}
