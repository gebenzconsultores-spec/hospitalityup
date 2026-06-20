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

const viewLabels: Record<Locale, Record<ViewMode, string>> = {
  es: {
    dashboard: 'Dashboard',
    employees: 'Empleados',
    menu: 'Menú & Servicios',
    training: 'Capacitación',
    analytics: 'ROI & Analíticas',
    turnover: 'Rotación & RRHH',
    bookings: 'Reservas',
    settings: 'Configuración',
  },
  en: {
    dashboard: 'Dashboard',
    employees: 'Employees',
    menu: 'Menu & Services',
    training: 'Training',
    analytics: 'ROI & Analytics',
    turnover: 'Turnover & HR',
    bookings: 'Bookings',
    settings: 'Settings',
  },
}

import type { Locale } from '@/lib/i18n'
import { DashboardOverview } from '@/components/dashboard/dashboard-overview'
import { EmployeesModule } from '@/components/employees/employees-module'
import { TrainingModule } from '@/components/training/training-module'
import { BookingsModule } from '@/components/bookings/bookings-module'
import { SettingsModule } from '@/components/settings/settings-module'
import { TurnoverModule } from '@/components/turnover/turnover-module'
import { AnalyticsModule } from '@/components/analytics/analytics-module'
import { MenuModule } from '@/components/menu/menu-module'

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
            <ContentArea currentView={currentView} locale={locale} />
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

function ContentArea({ currentView, locale }: { currentView: ViewMode; locale: Locale }) {
  const t = translations[locale]
  const viewTitle = viewLabels[locale][currentView]

  // Dashboard has its own rich view
  if (currentView === 'dashboard') {
    return <DashboardOverview />
  }

  // Employees module
  if (currentView === 'employees') {
    return <EmployeesModule />
  }

  // Training module
  if (currentView === 'training') {
    return <TrainingModule />
  }

  // Analytics module
  if (currentView === 'analytics') {
    return <AnalyticsModule />
  }

  // Menu module
  if (currentView === 'menu') {
    return <MenuModule />
  }

  // Turnover & HR module
  if (currentView === 'turnover') {
    return <TurnoverModule />
  }

  // Bookings module
  if (currentView === 'bookings') {
    return <BookingsModule />
  }

  // Settings module
  if (currentView === 'settings') {
    return <SettingsModule />
  }

  const placeholders: Record<ViewMode, { icon: string; description: { es: string; en: string } }> = {
    dashboard: {
      icon: '📊',
      description: { es: '', en: '' },
    },
    employees: {
      icon: '👥',
      description: {
        es: 'Gestión de empleados, perfiles y rutas de carrera',
        en: 'Employee management, profiles and career paths',
      },
    },
    menu: {
      icon: '🍽️',
      description: {
        es: 'Gestión de menú, servicios y seguimiento de upselling',
        en: 'Menu management, services and upselling tracking',
      },
    },
    training: {
      icon: '🎓',
      description: {
        es: 'Cursos, rutas de carrera y programación de capacitación',
        en: 'Courses, career paths and training scheduling',
      },
    },
    analytics: {
      icon: '📈',
      description: {
        es: 'Análisis de ROI, correlación capacitación-ventas y comparación multi-propiedad',
        en: 'ROI analysis, training-sales correlation and multi-property comparison',
      },
    },
    turnover: {
      icon: '🔄',
      description: {
        es: 'Alertas de rotación, análisis de riesgo y ahorro de costos',
        en: 'Turnover alerts, risk analysis and cost savings',
      },
    },
    bookings: {
      icon: '📅',
      description: {
        es: 'Reservas de capacitación presenciales y virtuales',
        en: 'In-person and virtual training bookings',
      },
    },
    settings: {
      icon: '⚙️',
      description: {
        es: 'Configuración de propiedades, planes e integraciones',
        en: 'Properties, plans and integrations settings',
      },
    },
  }

  const current = placeholders[currentView]

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex size-20 items-center justify-center rounded-2xl bg-primary/10 text-4xl">
          {current.icon}
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">{viewTitle}</h1>
          <p className="max-w-md text-muted-foreground">
            {current.description[locale]}
          </p>
        </div>
        <div className="mt-4 rounded-lg border bg-muted/50 px-4 py-2 text-sm text-muted-foreground">
          {locale === 'es'
            ? 'Esta sección será implementada próximamente'
            : 'This section will be implemented soon'}
        </div>
      </div>
    </div>
  )
}
