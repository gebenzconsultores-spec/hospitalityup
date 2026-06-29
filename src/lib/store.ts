import { create } from 'zustand'
import type { Locale } from './i18n'

export type ViewMode =
  | 'dashboard'
  | 'empleados'
  | 'ventas'
  | 'capacitacion'
  | 'bolsa'
  | 'configuracion'
  | 'trabajador'
  | 'servicios'
  | 'propiedades'
  | 'empresas-accesos'

export type UserRole = 'admin' | 'empresa' | 'empleado'

export interface SessionUser {
  role: UserRole
  nombre: string
  email?: string
  /** For 'empresa' role: the propiedadId they manage */
  propiedadId?: string
  /** For 'empleado' role: the empleadoId (e.g. MES-401) */
  empleadoCodigo?: string
  /** For 'empleado' role: the underlying database row id */
  empleadoId?: string
  propiedadNombre?: string
}

interface AppState {
  // Navigation
  currentView: ViewMode
  setCurrentView: (view: ViewMode) => void

  // Language
  locale: Locale
  setLocale: (locale: Locale) => void

  // Selected property filter
  selectedProperty: string
  setSelectedProperty: (propertyId: string) => void

  // Employee detail
  selectedEmployee: string | null
  setSelectedEmployee: (id: string | null) => void

  // Notifications
  showNotifications: boolean
  setShowNotifications: (show: boolean) => void
  unreadNotifications: number

  // Course detail
  selectedCourse: string | null
  setSelectedCourse: (id: string | null) => void

  // Dialogs
  showCapacitacionDialog: boolean
  setShowCapacitacionDialog: (show: boolean) => void
  showReemplazoDialog: boolean
  setShowReemplazoDialog: (show: boolean) => void
  reemplazoEmpleadoId: string | null
  setReemplazoEmpleadoId: (id: string | null) => void
  reemplazoPosicion: string | null
  setReemplazoPosicion: (pos: string | null) => void
  reemplazoRegion: string | null
  setReemplazoRegion: (region: string | null) => void

  // Auth / session
  user: SessionUser | null
  isAuthenticated: boolean
  login: (user: SessionUser) => void
  logout: () => void
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'dashboard',
  setCurrentView: (view) => set({ currentView: view, selectedEmployee: null, selectedCourse: null }),

  locale: 'es',
  setLocale: (locale) => set({ locale }),

  selectedProperty: 'all',
  setSelectedProperty: (propertyId) => set({ selectedProperty: propertyId }),

  selectedEmployee: null,
  setSelectedEmployee: (id) => set({ selectedEmployee: id }),

  showNotifications: false,
  setShowNotifications: (show) => set({ showNotifications: show }),
  unreadNotifications: 2,

  selectedCourse: null,
  setSelectedCourse: (id) => set({ selectedCourse: id }),

  showCapacitacionDialog: false,
  setShowCapacitacionDialog: (show) => set({ showCapacitacionDialog: show }),
  showReemplazoDialog: false,
  setShowReemplazoDialog: (show) => set({ showReemplazoDialog: show }),
  reemplazoEmpleadoId: null,
  setReemplazoEmpleadoId: (id) => set({ reemplazoEmpleadoId: id }),
  reemplazoPosicion: null,
  setReemplazoPosicion: (pos) => set({ reemplazoPosicion: pos }),
  reemplazoRegion: null,
  setReemplazoRegion: (region) => set({ reemplazoRegion: region }),

  // Auth
  user: null,
  isAuthenticated: false,
  login: (user) =>
    set({
      user,
      isAuthenticated: true,
      currentView: user.role === 'empleado' ? 'trabajador' : 'dashboard',
      selectedProperty:
        user.role === 'empresa' && user.propiedadId ? user.propiedadId : 'all',
    }),
  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      currentView: 'dashboard',
      selectedProperty: 'all',
    }),
}))
