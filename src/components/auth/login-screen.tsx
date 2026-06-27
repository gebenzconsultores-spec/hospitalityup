'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Hotel, Shield, Building2, User, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppStore } from '@/lib/store'
import { translations } from '@/lib/i18n'
import type { UserRole } from '@/lib/store'
import { toast } from 'sonner'

interface Propiedad {
  id: string
  nombre: string
  nombreEn: string | null
  region: string
  tipo: string
}

interface EmpleadoLogin {
  id: string
  empleadoId: string
  nombre: string
  posicion: string
  propiedadId: string
}

export function LoginScreen() {
  const { locale, setUserRole, setUserName, setUserPropiedadId, setUserEmpleadoId, setIsLoggedIn, setSelectedProperty } = useAppStore()
  const t = translations[locale]
  const tl = t.login

  const [selectedTab, setSelectedTab] = useState<string>('admin')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Admin form
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')

  // Empresa form
  const [empresaPropiedad, setEmpresaPropiedad] = useState('')
  const [empresaPassword, setEmpresaPassword] = useState('')

  // Empleado form
  const [empleadoId, setEmpleadoId] = useState('')
  const [empleadoPassword, setEmpleadoPassword] = useState('')

  // Data
  const [propiedades, setPropiedades] = useState<Propiedad[]>([])
  const [empleados, setEmpleados] = useState<EmpleadoLogin[]>([])

  useEffect(() => {
    fetch('/api/propiedades')
      .then(r => r.json())
      .then(data => setPropiedades(Array.isArray(data) ? data : []))
      .catch(() => {})

    fetch('/api/empleados')
      .then(r => r.json())
      .then(data => {
        const emps = Array.isArray(data) ? data : []
        setEmpleados(emps.map((e: Record<string, unknown>) => ({
          id: e.id as string,
          empleadoId: e.empleadoId as string,
          nombre: e.nombre as string,
          posicion: e.posicion as string,
          propiedadId: (e.propiedadId || (e.propiedad as Record<string, string>)?.id || '') as string,
        })))
      })
      .catch(() => {})
  }, [])

  const handleAdminLogin = async () => {
    setLoading(true)
    // Simulate a brief delay for UX
    await new Promise(r => setTimeout(r, 400))

    if (adminEmail === 'admin@hospitalityup.com' && adminPassword === 'admin123') {
      setUserRole('admin')
      setUserName('Admin')
      setUserPropiedadId(null)
      setUserEmpleadoId(null)
      setIsLoggedIn(true)
      setSelectedProperty('all')
      toast.success(`${tl.bienvenido}, Admin!`)
    } else {
      toast.error(tl.credencialesInvalidas)
    }
    setLoading(false)
  }

  const handleEmpresaLogin = async () => {
    if (!empresaPropiedad) {
      toast.error(tl.seleccionarPropiedadError)
      return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))

    // Password is the property name normalized (lowercase, no spaces)
    const prop = propiedades.find(p => p.id === empresaPropiedad)
    if (prop) {
      const normalizedPassword = prop.nombre.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
      if (empresaPassword === normalizedPassword) {
        setUserRole('empresa')
        setUserName(prop.nombre)
        setUserPropiedadId(prop.id)
        setUserEmpleadoId(null)
        setIsLoggedIn(true)
        setSelectedProperty(prop.id)
        toast.success(`${tl.bienvenido}, ${prop.nombre}!`)
      } else {
        toast.error(tl.credencialesInvalidas)
      }
    } else {
      toast.error(tl.credencialesInvalidas)
    }
    setLoading(false)
  }

  const handleEmpleadoLogin = async () => {
    if (!empleadoId) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))

    const emp = empleados.find(e => e.empleadoId.toUpperCase() === empleadoId.toUpperCase())
    if (emp && empleadoPassword === '1234') {
      setUserRole('empleado')
      setUserName(emp.nombre)
      setUserPropiedadId(emp.propiedadId)
      setUserEmpleadoId(emp.id)
      setIsLoggedIn(true)
      setSelectedProperty(emp.propiedadId)
      toast.success(`${tl.bienvenido}, ${emp.nombre}!`)
    } else {
      toast.error(tl.credencialesInvalidas)
    }
    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent, handler: () => void) => {
    if (e.key === 'Enter' && !loading) handler()
  }

  const roleCards: { key: UserRole; icon: React.ElementType; label: string; desc: string; color: string; bgColor: string }[] = [
    { key: 'admin', icon: Shield, label: tl.admin, desc: tl.adminDesc, color: 'text-teal-600', bgColor: 'bg-teal-50 dark:bg-teal-950/30' },
    { key: 'empresa', icon: Building2, label: tl.empresa, desc: tl.empresaDesc, color: 'text-emerald-600', bgColor: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { key: 'empleado', icon: User, label: tl.empleado, desc: tl.empleadoDesc, color: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-950/30' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-900 via-emerald-900 to-teal-800 p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-teal-400/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center size-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-4"
          >
            <Hotel className="size-8 text-teal-300" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-1">{tl.title}</h1>
          <p className="text-teal-200/70 text-sm">{tl.subtitle}</p>
        </div>

        {/* Login Card */}
        <Card className="border-white/10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl">
          <CardHeader className="pb-3">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-3 h-auto gap-1 bg-muted/50 p-1">
                {roleCards.map((rc) => {
                  const Icon = rc.icon
                  return (
                    <TabsTrigger
                      key={rc.key}
                      value={rc.key || ''}
                      className="flex flex-col items-center gap-1 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-800"
                    >
                      <Icon className={`size-5 ${selectedTab === rc.key ? rc.color : 'text-muted-foreground'}`} />
                      <span className="text-xs font-medium">{rc.label}</span>
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent className="pt-0">
            <AnimatePresence mode="wait">
              {/* Admin Login */}
              {selectedTab === 'admin' && (
                <motion.div
                  key="admin"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-2">
                    <div className="inline-flex items-center justify-center size-10 rounded-full bg-teal-50 dark:bg-teal-950/30 mb-2">
                      <Shield className="size-5 text-teal-600" />
                    </div>
                    <p className="text-xs text-muted-foreground">{tl.adminDesc}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-email" className="text-xs font-medium">{tl.email}</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@hospitalityup.com"
                      value={adminEmail}
                      onChange={e => setAdminEmail(e.target.value)}
                      onKeyDown={e => handleKeyDown(e, handleAdminLogin)}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password" className="text-xs font-medium">{tl.password}</Label>
                    <div className="relative">
                      <Input
                        id="admin-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={adminPassword}
                        onChange={e => setAdminPassword(e.target.value)}
                        onKeyDown={e => handleKeyDown(e, handleAdminLogin)}
                        className="h-10 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-10 w-10 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white gap-2"
                    onClick={handleAdminLogin}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
                    {loading ? tl.ingresando : tl.ingresar}
                  </Button>
                </motion.div>
              )}

              {/* Empresa Login */}
              {selectedTab === 'empresa' && (
                <motion.div
                  key="empresa"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-2">
                    <div className="inline-flex items-center justify-center size-10 rounded-full bg-emerald-50 dark:bg-emerald-950/30 mb-2">
                      <Building2 className="size-5 text-emerald-600" />
                    </div>
                    <p className="text-xs text-muted-foreground">{tl.empresaDesc}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">{tl.propiedad}</Label>
                    <Select value={empresaPropiedad} onValueChange={setEmpresaPropiedad}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder={tl.seleccionarPropiedad} />
                      </SelectTrigger>
                      <SelectContent>
                        {propiedades.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            {locale === 'es' ? p.nombre : (p.nombreEn || p.nombre)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">{tl.password}</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder={locale === 'es' ? 'Nombre de propiedad sin espacios' : 'Property name without spaces'}
                        value={empresaPassword}
                        onChange={e => setEmpresaPassword(e.target.value)}
                        onKeyDown={e => handleKeyDown(e, handleEmpresaLogin)}
                        className="h-10 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-10 w-10 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </Button>
                    </div>
                    {empresaPropiedad && (
                      <p className="text-[10px] text-muted-foreground">
                        {locale === 'es' ? 'Pista: ' : 'Hint: '}
                        {propiedades.find(p => p.id === empresaPropiedad)?.nombre.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}
                      </p>
                    )}
                  </div>
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                    onClick={handleEmpresaLogin}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
                    {loading ? tl.ingresando : tl.ingresar}
                  </Button>
                </motion.div>
              )}

              {/* Empleado Login */}
              {selectedTab === 'empleado' && (
                <motion.div
                  key="empleado"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-2">
                    <div className="inline-flex items-center justify-center size-10 rounded-full bg-amber-50 dark:bg-amber-950/30 mb-2">
                      <User className="size-5 text-amber-600" />
                    </div>
                    <p className="text-xs text-muted-foreground">{tl.empleadoDesc}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">{tl.empleadoId}</Label>
                    <Input
                      placeholder={tl.empleadoIdPlaceholder}
                      value={empleadoId}
                      onChange={e => setEmpleadoId(e.target.value.toUpperCase())}
                      onKeyDown={e => handleKeyDown(e, handleEmpleadoLogin)}
                      className="h-10 uppercase"
                    />
                    {empleadoId.length > 0 && (
                      <div className="text-[10px] text-muted-foreground">
                        {locale === 'es' ? 'IDs disponibles: ' : 'Available IDs: '}
                        {empleados.slice(0, 5).map(e => e.empleadoId).join(', ')}...
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">{tl.password}</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••"
                        value={empleadoPassword}
                        onChange={e => setEmpleadoPassword(e.target.value)}
                        onKeyDown={e => handleKeyDown(e, handleEmpleadoLogin)}
                        className="h-10 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-10 w-10 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white gap-2"
                    onClick={handleEmpleadoLogin}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
                    {loading ? tl.ingresando : tl.ingresar}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-teal-200/40 mt-6">
          © 2025 HospitalityUP · {locale === 'es' ? 'Todos los derechos reservados' : 'All rights reserved'}
        </p>
      </motion.div>
    </div>
  )
}
