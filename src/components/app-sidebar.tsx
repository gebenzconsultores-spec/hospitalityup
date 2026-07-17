'use client'

import { useEffect, useState, useCallback } from 'react'
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
  KeyRound,
  LogOut,
  X,
  Check,
  AlertCircle,
  Info,
  Truck,
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
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppStore } from '@/lib/store'
import { translations } from '@/lib/i18n'
import type { ViewMode, UserRole } from '@/lib/store'
import { toast } from 'sonner'

// All nav items (admin sees everything)
const allNavItems: { key: ViewMode; icon: React.ElementType; roles: UserRole[] }[] = [
  { key: 'dashboard', icon: LayoutDashboard, roles: ['admin', 'empresa'] },
  { key: 'trabajador', icon: ShoppingCart, roles: ['admin', 'empresa'] },
  { key: 'servicios', icon: Package, roles: ['admin', 'empresa', 'empleado'] },
  { key: 'propiedades', icon: Building2, roles: ['admin', 'empresa'] },
  { key: 'empresas-grupos', icon: Building2, roles: ['admin'] },
  { key: 'empresas-accesos', icon: KeyRound, roles: ['admin'] },
  { key: 'proveedores', icon: Truck, roles: ['admin', 'empresa'] },
  { key: 'empleados', icon: Users, roles: ['admin', 'empresa'] },
  { key: 'ventas', icon: DollarSign, roles: ['admin', 'empresa'] },
  { key: 'capacitacion', icon: GraduationCap, roles: ['admin', 'empresa'] },
  { key: 'bolsa', icon: Briefcase, roles: ['admin', 'empresa'] },
  { key: 'configuracion', icon: Settings, roles: ['admin'] },
  { key: 'nps-survey', icon: ShoppingCart, roles: ['empleado'] },
  { key: 'clima', icon: Users, roles: ['empleado'] },
]

interface Propiedad {
  id: string
  nombre: string
  nombreEn: string | null
  region: string
  tipo: string
}

interface Notificacion {
  id: string
  tipo: string
  titulo: string
  mensaje: string
  leida: boolean
  prioridad: string
  createdAt: string
}

export function AppSidebar() {
  const {
    currentView,
    setCurrentView,
    locale,
    setLocale,
    selectedProperty,
    setSelectedProperty,
    showNotifications,
    setShowNotifications,
    userRole,
    userName,
    userPropiedadId,
    userPropiedadNombre,
    isLoggedIn,
    logout,
  } = useAppStore()
  const t = translations[locale]
  const [propiedades, setPropiedades] = useState<Propiedad[]>([])
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch propiedades for selector (admin sees all, empresa sees their own)
  const fetchPropiedades = useCallback(() => {
    fetch('/api/propiedades')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          // For empresa, filter to only their propiedades
          if (userRole === 'empresa' && userPropiedadId) {
            setPropiedades(data.filter(p => p.id === userPropiedadId))
          } else {
            setPropiedades(data)
          }
        }
      })
      .catch(() => {})
  }, [userRole, userPropiedadId])

  // Fetch real notifications from DB
  const fetchNotificaciones = useCallback(() => {
    fetch('/api/notificaciones')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setNotificaciones(data)
          setUnreadCount(data.filter(n => !n.leida).length)
        } else if (data && typeof data === 'object' && Array.isArray(data.notificaciones)) {
          setNotificaciones(data.notificaciones)
          setUnreadCount(data.notificaciones.filter((n: Notificacion) => !n.leida).length)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (isLoggedIn) {
      fetchPropiedades()
      fetchNotificaciones()
      // Refresh notifications every 30 seconds
      const interval = setInterval(fetchNotificaciones, 30000)
      return () => clearInterval(interval)
    }
  }, [isLoggedIn, fetchPropiedades, fetchNotificaciones])

  // Filter nav items by role
  const role: UserRole = userRole || 'admin'
  const visibleNavItems = allNavItems.filter(item => item.roles.includes(role))

  // For empresa role, lock property selector to their propiedad
  const isEmpresa = role === 'empresa' && userPropiedadId
  const effectiveSelectedProperty = isEmpresa ? userPropiedadId! : selectedProperty

  const handleSetSelectedProperty = (id: string) => {
    if (isEmpresa) return // Locked
    setSelectedProperty(id)
  }

  // Build user display
  const userInitials = userName
    ? userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AD'
  const userRoleLabel = role === 'admin'
    ? (locale === 'es' ? 'Administrador' : 'Administrator')
    : role === 'empresa'
      ? (locale === 'es' ? 'Empresa' : 'Company')
      : (locale === 'es' ? 'Empleado' : 'Employee')

  const handleLogout = () => {
    logout()
    toast.success(locale === 'es' ? 'Sesión cerrada' : 'Session closed')
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`/api/notificaciones/${id}`, { method: 'PATCH', body: JSON.stringify({ leida: true }), headers: { 'Content-Type': 'application/json' } })
      setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch {}
  }

  const handleMarkAllAsRead = async () => {
    try {
      await fetch('/api/notificaciones/mark-all-read', { method: 'POST' })
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })))
      setUnreadCount(0)
    } catch {}
  }

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente': return 'bg-red-100 text-red-700 border-red-200'
      case 'alta': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'normal': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'baja': return 'bg-gray-100 text-gray-700 border-gray-200'
      default: return 'bg-blue-100 text-blue-700 border-blue-200'
    }
  }

  const getNotificacionIcon = (tipo: string) => {
    switch (tipo) {
      case 'empleado_baja': return <AlertCircle className="size-4 text-red-500" />
      case 'solicitud_capacitacion': return <GraduationCap className="size-4 text-blue-500" />
      case 'alerta_ia': return <AlertCircle className="size-4 text-orange-500" />
      case 'curso_completado': return <Check className="size-4 text-green-500" />
      case 'reemplazo_necesario': return <Users className="size-4 text-purple-500" />
      case 'nueva_venta': return <DollarSign className="size-4 text-green-500" />
      case 'nuevo_empleado': return <Users className="size-4 text-teal-500" />
      case 'cambio_propiedad': return <Building2 className="size-4 text-indigo-500" />
      default: return <Info className="size-4 text-blue-500" />
    }
  }

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      {/* Header: Logo, Language Toggle, Property Selector */}
      <SidebarHeader className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="hover:bg-sidebar-accent">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Hotel className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold">{t.appName}</span>
                <span className="truncate text-xs opacity-70">
                  {userPropiedadNombre && role === 'empresa' ? userPropiedadNombre : t.appTagline}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator className="mx-0" />

        {/* Language Toggle & Property Selector */}
        <div className="flex flex-col gap-2 group-data-[collapsible=icon]:hidden">
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

          {/* Property Selector - hidden for empleado role */}
          {role !== 'empleado' && (
            <Select
              value={effectiveSelectedProperty || 'all'}
              onValueChange={handleSetSelectedProperty}
              disabled={isEmpresa as boolean}
            >
              <SelectTrigger className="h-8 w-full border-sidebar-border bg-sidebar-accent/50 text-sidebar-foreground text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {!isEmpresa && (
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
              {visibleNavItems.map((item) => {
                const Icon = item.icon
                const isActive = currentView === item.key
                const label = t.nav[item.key] || item.key
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
        {role !== 'empleado' && (
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
                  {unreadCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex size-3.5 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <span className="text-xs">
                  {locale === 'es' ? 'Notificaciones' : 'Notifications'}
                </span>
                {unreadCount > 0 && (
                  <span className="ml-auto rounded-full bg-destructive/15 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
                    {unreadCount}
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
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex size-3.5 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </div>
          </>
        )}

        {/* User Avatar + Logout */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="hover:bg-sidebar-accent"
              tooltip={userName || 'Admin'}
            >
              <Avatar className="size-8 border border-sidebar-border">
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden min-w-0">
                <span className="truncate font-medium">{userName || 'Admin'}</span>
                <span className="truncate text-xs opacity-60">{userRoleLabel}</span>
              </div>
              {isLoggedIn && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 group-data-[collapsible=icon]:hidden"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleLogout()
                  }}
                  aria-label={locale === 'es' ? 'Cerrar sesión' : 'Logout'}
                  title={locale === 'es' ? 'Cerrar sesión' : 'Logout'}
                >
                  <LogOut className="size-3.5" />
                </Button>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />

      {/* Notifications Dialog */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="max-w-md max-h-[80vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Bell className="size-5" />
                {locale === 'es' ? 'Notificaciones' : 'Notifications'}
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-1">{unreadCount}</Badge>
                )}
              </DialogTitle>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="text-xs">
                  {locale === 'es' ? 'Marcar todas como leídas' : 'Mark all as read'}
                </Button>
              )}
            </div>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] -mx-6 px-6">
            {notificaciones.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Bell className="size-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">{locale === 'es' ? 'No hay notificaciones' : 'No notifications'}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notificaciones.map((notif) => (
                  <div
                    key={notif.id}
                    className={`rounded-lg border p-3 transition-colors cursor-pointer hover:bg-muted/50 ${
                      !notif.leida ? 'bg-teal-50/50 border-teal-200' : 'bg-background'
                    }`}
                    onClick={() => !notif.leida && handleMarkAsRead(notif.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {getNotificacionIcon(notif.tipo)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm truncate">{notif.titulo}</p>
                          {!notif.leida && (
                            <span className="size-2 rounded-full bg-teal-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{notif.mensaje}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className={`text-[10px] ${getPrioridadColor(notif.prioridad)}`}>
                            {notif.prioridad}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(notif.createdAt).toLocaleString(locale === 'es' ? 'es-MX' : 'en-US', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </Sidebar>
  )
}
