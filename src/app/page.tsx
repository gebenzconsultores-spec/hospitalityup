'use client'

import { AppSidebar } from '@/components/app-sidebar'
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

import { DashboardGerencial } from '@/components/dashboard/dashboard-gerencial'
import { EmpleadosModule } from '@/components/empleados/empleados-module'
import { VentasModule } from '@/components/ventas/ventas-module'
import { CapacitacionModule } from '@/components/capacitacion/capacitacion-module'
import { BolsaTrabajo } from '@/components/bolsa-trabajo/bolsa-trabajo'
import { ConfiguracionModule } from '@/components/configuracion/configuracion'

const viewLabels: Record<Locale, Record<ViewMode, string>> = {
  es: {
    dashboard: 'Dashboard',
    empleados: 'Empleados',
    ventas: 'Ventas & NPS',
    capacitacion: 'Capacitación',
    bolsa: 'Bolsa de Trabajo',
    configuracion: 'Configuración',
  },
  en: {
    dashboard: 'Dashboard',
    empleados: 'Employees',
    ventas: 'Sales & NPS',
    capacitacion: 'Training',
    bolsa: 'Job Pool',
    configuracion: 'Settings',
  },
}

export default function Home() {
  const { currentView, locale } = useAppStore()
  const t = translations[locale]
  const pageTitle = viewLabels[locale][currentView]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex min-h-screen flex-col">
          {/* Header */}
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

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6">
            <ContentArea currentView={currentView} />
          </main>

          {/* Sticky Footer */}
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
    case 'dashboard':
      return <DashboardGerencial />
    case 'empleados':
      return <EmpleadosModule />
    case 'ventas':
      return <VentasModule />
    case 'capacitacion':
      return <CapacitacionModule />
    case 'bolsa':
      return <BolsaTrabajo />
    case 'configuracion':
      return <ConfiguracionModule />
    default:
      return <DashboardGerencial />
  }
}
