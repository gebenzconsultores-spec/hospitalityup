'use client'

import { useEffect, useState } from 'react'
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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  ShoppingCart,
  LayoutDashboard,
  Star,
  LogOut,
  Hotel,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'

function Loading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
    </div>
  )
}

const VistaTrabajador = dynamic(
  () => import('@/components/trabajador/vista-trabajador').then(m => ({ default: m.VistaTrabajador })),
  { loading: () => <Loading /> }
)

type EmpleadoView = 'pos' | 'misScores'

interface Session {
  id: string
  nombre: string
  rol: string
  propiedadId: string
  propiedadNombre: string
  empleadoId: string
  posicion: string
}

function MisScores({ session }: { session: Session }) {
  const [empleado, setEmpleado] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    fetch(`/api/empleados/${session.id}`)
      .then(r => r.json())
      .then(data => setEmpleado(data))
  }, [session])

  if (!empleado) return <Loading />

  const scores = [
    { label: 'Conocimiento', value: empleado.puntuacionConocimiento as number, color: 'bg-teal-500' },
    { label: 'Ventas', value: empleado.puntuacionVentas as number, color: 'bg-emerald-500' },
    { label: 'Hospitalidad', value: empleado.puntuacionHospitalidad as number, color: 'bg-amber-500' },
    { label: 'Total', value: empleado.puntuacionTotal as number, color: 'bg-purple-500' },
  ]

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold">Mis Scores</h1>
        <p className="text-sm text-muted-foreground">{session.posicion} · {session.propiedadNombre}</p>
      </div>

      <div className="rounded-lg border bg-card p-6 space-y-4">
        {scores.map((s, i) => (
          <div key={i}>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">{s.label}</span>
              <span className="text-sm font-bold">{(s.value || 0).toFixed(0)}/100</span>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${s.color} transition-all`}
                style={{ width: `${s.value || 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-4 text-center">
          <div className="text-2xl font-bold text-teal-600">{empleado.cursosCompletados as number}</div>
          <div className="text-xs text-muted-foreground">Cursos completados</div>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <div className="text-2xl font-bold text-amber-500">{(empleado.npsPromedio as number)?.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground">NPS Promedio</div>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">${(empleado.totalUpselling as number)?.toFixed(0)}</div>
          <div className="text-xs text-muted-foreground">Total Upselling</div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Índice de Felicidad</span>
          <span className="text-sm font-bold">{(empleado.indiceFelicidad as number)?.toFixed(0)}/100</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-rose-400 transition-all"
            style={{ width: `${empleado.indiceFelicidad as number || 0}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function EmpleadoSidebar({
  currentView, setCurrentView, session, onLogout
}: {
  currentView: EmpleadoView
  setCurrentView: (v: EmpleadoView) => void
  session: Session
  onLogout: () => void
}) {
  const navItems = [
    { key: 'pos' as EmpleadoView, icon: ShoppingCart, label: 'Tomar Pedido' },
    { key: 'misScores' as EmpleadoView, icon: Star, label: 'Mis Scores' },
  ]

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="hover:bg-sidebar-accent">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Hotel className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold">HospitalityUP</span>
                <span className="truncate text-xs opacity-70">{session.propiedadNombre}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(item => {
                const Icon = item.icon
                const isActive = currentView === item.key
                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setCurrentView(item.key)}
                      tooltip={item.label}
                      className={`transition-all duration-150 ${isActive
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground font-semibold'
                        : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      }`}
                    >
                      <Icon className="size-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarSeparator className="mx-0" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="hover:bg-sidebar-accent"
              onClick={onLogout}
              tooltip="Cerrar sesión"
            >
              <Avatar className="size-8 border border-sidebar-border">
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold">
                  {session.nombre.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">{session.nombre}</span>
                <span className="truncate text-xs opacity-60 flex items-center gap-1">
                  <LogOut className="size-3" /> Cerrar sesión
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export default function EmpleadoPage() {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [currentView, setCurrentView] = useState<EmpleadoView>('pos')
  const { setSelectedProperty } = useAppStore()

  useEffect(() => {
    const stored = localStorage.getItem('hospitalityup_session')
    if (!stored) { router.push('/login'); return }
    const parsed = JSON.parse(stored)
    if (parsed.rol !== 'empleado') { router.push('/login'); return }
    setSession(parsed)
    if (parsed.propiedadId) setSelectedProperty(parsed.propiedadId)
  }, [router, setSelectedProperty])

  const handleLogout = () => {
    localStorage.removeItem('hospitalityup_session')
    router.push('/login')
  }

  if (!session) return null

  const viewTitles: Record<EmpleadoView, string> = {
    pos: 'Tomar Pedido',
    misScores: 'Mis Scores',
  }

  return (
    <>
      <SidebarProvider>
        <EmpleadoSidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          session={session}
          onLogout={handleLogout}
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
                      {session.nombre}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-medium">
                      {viewTitles[currentView]}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            <main className="flex-1 p-4 md:p-6">
              {currentView === 'pos' && <VistaTrabajador />}
              {currentView === 'misScores' && <MisScores session={session} />}
            </main>
            <footer className="mt-auto border-t bg-background px-4 py-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{session.nombre} · {session.empleadoId}</span>
                <span>{session.propiedadNombre}</span>
              </div>
            </footer>
          </div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster richColors position="top-right" />
    </>
  )
}