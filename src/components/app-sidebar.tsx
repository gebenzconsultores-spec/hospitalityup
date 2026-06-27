'use client'

import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Users,
  DollarSign,
  GraduationCap,
  Briefcase,
  Settings,
  Bell,
  Hotel,
  Globe,
  ShoppingCart,
  Package,
  Building2,
  Star,
  Heart,
  LogOut,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { translations } from '@/lib/i18n'
import type { ViewMode, UserRole } from '@/lib/store'

const allNavItems: { key: ViewMode; icon: React.ElementType; roles: UserRole[] }[] = [
  { key: 'dashboard', icon: LayoutDashboard, roles: ['admin', 'empresa'] },
  { key: 'trabajador', icon: ShoppingCart, roles: ['admin'] },
  { key: 'servicios', icon: Package, roles: ['admin', 'empresa', 'empleado'] },
  { key: 'propiedades', icon: Building2, roles: ['admin'] },
  { key: 'empleados', icon: Users, roles: ['admin', 'empresa'] },
  { key: 'ventas', icon: DollarSign, roles: ['admin', 'empresa'] },
  { key: 'capacitacion', icon: GraduationCap, roles: ['admin', 'empresa'] },
  { key: 'bolsa', icon: Briefcase, roles: ['admin', 'empresa'] },
  { key: 'configuracion', icon: Settings, roles: ['admin'] },
  { key: 'nps-survey', icon: Star, roles: ['empleado'] },
  { key: 'clima', icon: Heart, roles: ['empleado'] },
]

interface Propiedad {
  id: string
  nombre: string
  nombreEn: string | null
  region: string
  tipo: string
}

export function AppSidebar() {
  const {
    currentView, setCurrentView, locale, setLocale,
    selectedProperty, setSelectedProperty,
    unreadNotifications, setShowNotifications,
    userRole, userName, logout,
  } = useAppStore()
  const t = translations[locale]
  const [propiedades, setPropiedades] = useState<Propiedad[]>([])

  useEffect(() => {
    fetch('/api/propiedades')
      .then(r => r.json())
      .then(data => setPropiedades(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  // Filter nav items by role
  const navItems = allNavItems.filter(item => userRole && item.roles.includes(userRole))

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  // Role display name
  const getRoleName = (role: UserRole) => {
    if (!role) return ''
    const tl = t.login
    switch (role) {
      case 'admin': return tl.admin
      case 'empresa': return tl.empresa
      case 'empleado': return tl.empleado
      default: return role
    }
  }

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      {/* Header: Logo, Language Toggle, Property Selector */}
      <SidebarHeader className="p-3">
        {/* Logo & Brand */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="hover:bg-sidebar-accent">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Hotel className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold">{t.appName}</span>
                <span className="truncate text-xs opacity-70">{t.appTagline}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator className="mx-0" />

        {/* Language Toggle & Property Selector */}
        <div className="flex flex-col gap-2 group-data-[collapsible=icon]:hidden">
          {/* Language Toggle */}
          <div className="flex items-center gap-2">
            <Globe className="size-4 text-sidebar-foreground/60" />
            <div className="flex rounded-md border border-sidebar-border overflow-hidden">
              <button
                onClick={() => setLocale('es')}
                className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                  locale === 'es'
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                ES
              </button>
              <button
                onClick={() => setLocale('en')}
                className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                  locale === 'en'
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                EN
              </button>
            </div>
          </div>

          {/* Property Selector - only for admin and empresa */}
          {(userRole === 'admin' || userRole === 'empresa') && (
            <Select value={selectedProperty} onValueChange={setSelectedProperty} disabled={userRole === 'empresa'}>
              <SelectTrigger className="h-8 w-full border-sidebar-border bg-sidebar-accent/50 text-sidebar-foreground text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {userRole === 'admin' && (
                  <SelectItem value="all">
                    {locale === 'es' ? 'Todas las Propiedades' : 'All Properties'}
                  </SelectItem>
                )}
                {propiedades.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {locale === 'es' ? property.nombre : (property.nombreEn || property.nombre)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = currentView === item.key
                const label = t.nav[item.key as keyof typeof t.nav] || item.key
                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setCurrentView(item.key)}
                      tooltip={label}
                      className={`transition-all duration-150 ${
                        isActive
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

      {/* Footer: Notifications + User */}
      <SidebarFooter className="p-3">
        <SidebarSeparator className="mx-0" />

        {/* Notification Bell - only for admin/empresa */}
        {(userRole === 'admin' || userRole === 'empresa') && (
          <>
            <div className="group-data-[collapsible=icon]:hidden">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                onClick={() => setShowNotifications(true)}
              >
                <div className="relative">
                  <Bell className="size-4" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex size-3.5 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
                      {unreadNotifications}
                    </span>
                  )}
                </div>
                <span className="text-xs">
                  {locale === 'es' ? 'Notificaciones' : 'Notifications'}
                </span>
                {unreadNotifications > 0 && (
                  <span className="ml-auto rounded-full bg-destructive/15 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
                    {unreadNotifications}
                  </span>
                )}
              </Button>
            </div>

            {/* Collapsed notification icon */}
            <div className="hidden group-data-[collapsible=icon]:flex justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                onClick={() => setShowNotifications(true)}
              >
                <Bell className="size-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex size-3.5 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
                    {unreadNotifications}
                  </span>
                )}
              </Button>
            </div>
          </>
        )}

        {/* User Avatar & Logout */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="hover:bg-sidebar-accent"
              tooltip={userName || 'User'}
            >
              <Avatar className="size-8 border border-sidebar-border">
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold">
                  {userName ? getInitials(userName) : '??'}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">{userName || 'User'}</span>
                <span className="truncate text-xs opacity-60">
                  {getRoleName(userRole)}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Logout button */}
        <div className="group-data-[collapsible=icon]:hidden">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-sidebar-foreground/60 hover:bg-red-500/10 hover:text-red-500"
            onClick={logout}
          >
            <LogOut className="size-4" />
            <span className="text-xs">{t.login.cerrarSesion}</span>
          </Button>
        </div>

        {/* Collapsed logout */}
        <div className="hidden group-data-[collapsible=icon]:flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground/60 hover:bg-red-500/10 hover:text-red-500"
            onClick={logout}
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
