import { create } from 'zustand'
import type { Locale } from './i18n'

export type ViewMode = 'dashboard' | 'employees' | 'menu' | 'training' | 'analytics' | 'turnover' | 'bookings' | 'settings'

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
  showNewBooking: boolean
  setShowNewBooking: (show: boolean) => void
  showNewOrder: boolean
  setShowNewOrder: (show: boolean) => void
  showAddEmployee: boolean
  setShowAddEmployee: (show: boolean) => void
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
  
  showNewBooking: false,
  setShowNewBooking: (show) => set({ showNewBooking: show }),
  showNewOrder: false,
  setShowNewOrder: (show) => set({ showNewOrder: show }),
  showAddEmployee: false,
  setShowAddEmployee: (show) => set({ showAddEmployee: show }),
}))
