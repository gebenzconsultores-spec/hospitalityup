'use client'

import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Users,
  DollarSign,
  GraduationCap,
  Settings,
  Hotel,
  Globe,
  Package,
  LogOut,
  Building2,
} from 'lucide-react'
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
import { useRouter } from 'next/navigation'

export type EmpresaView = 'dashboard' | 'empleados' | 'servicios' | 'ventas' | 'capacitacion' | 'sucursales' | 'proveedores'

const navItems: { key: EmpresaView; icon: React.ElementType; labelEs: string; labelEn: string }[] = [
  { key: 'dashboard', icon: LayoutDashboard, labelEs: 'Dashboard', labelEn: 'Dashboard' },
  { key: 'empleados', icon: Users, labelEs: 'Empleados', labelEn: 'Employees' },
  { key: 'servicios', icon: Package, labelEs: 'Menú & Servicios', labelEn: 'Menu & Services' },
  { key: 'ventas', icon: DollarSign, labelEs: 'Ventas & NPS', labelEn: 'Sales & NPS' },
  { key: 'capacitacion', icon: GraduationCap, labelEs: 'Capacitación', labelEn: 'Training' },
    { key: 'sucursales', icon: Building2, labelEs: 'Mis Sucursales', labelEn: 'My Branches' },
  { key: 'proveedores', icon: Package, labelEs: 'Proveedores', labelEn: 'Suppliers' },
]

interface AppSidebarEmpresaProps {
  currentView: EmpresaView
  setCurrentView: (view: EmpresaView) => void
  locale: 'es' | 'en'
  setLocale: (locale: 'es' | 'en') => void
  nombreEmpresa: string
  nombrePropiedad: string
}

export function AppSidebarEmpresa({
  currentView, setCurrentView, locale, setLocale, nombreEmpresa, nombrePropiedad
}: AppSidebarEmpresaProps) {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('hospitalityup_session')
    router.push('/login')
  }

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
                <span className="truncate text-xs opacity-70">{nombrePropiedad}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator className="mx-0" />

        <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
          <Globe className="size-4 text-sidebar-foreground/60" />
          <div className="flex rounded-md border border-sidebar-border overflow-hidden">
            <button
              onClick={() => setLocale('es')}
              className={`px-2.5 py-1 text-xs font-medium transition-colors ${locale === 'es' ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent'}`}
            >
              ES
            </button>
            <button
              onClick={() => setLocale('en')}
              className={`px-2.5 py-1 text-xs font-medium transition-colors ${locale === 'en' ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent'}`}
            >
              EN
            </button>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = currentView === item.key
                const label = locale === 'es' ? item.labelEs : item.labelEn
                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setCurrentView(item.key)}
                      tooltip={label}
                      className={`transition-all duration-150 ${isActive
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground font-semibold hover:bg-sidebar-primary hover:text-sidebar-primary-foreground'
                        : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      }`}
                    >
                      <Icon className="size-4" />
                      <span>{label}</span>
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
              onClick={handleLogout}
              tooltip="Cerrar sesión"
            >
              <Avatar className="size-8 border border-sidebar-border">
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold">
                  {nombreEmpresa.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">{nombreEmpresa}</span>
                <span className="truncate text-xs opacity-60 flex items-center gap-1">
                  <LogOut className="size-3" />
                  {locale === 'es' ? 'Cerrar sesión' : 'Sign out'}
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