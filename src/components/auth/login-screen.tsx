'use client'

import { useState, useEffect } from 'react'
import {
  Hotel,
  ShieldCheck,
  Building2,
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  LogIn,
  Loader2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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
import { useAppStore, type UserRole } from '@/lib/store'
import { translations } from '@/lib/i18n'
import { toast } from 'sonner'

interface PropiedadOption {
  id: string
  nombre: string
  nombreEn: string | null
  tipo: string
  region: string
  activo: boolean
}

export function LoginScreen() {
  const { locale, setLocale, login } = useAppStore()
  const t = translations[locale].login

  const [role, setRole] = useState<UserRole | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [propiedadId, setPropiedadId] = useState('')
  const [empleadoId, setEmpleadoId] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [propiedades, setPropiedades] = useState<PropiedadOption[]>([])

  useEffect(() => {
    fetch('/api/propiedades')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Only show active propiedades for login
          setPropiedades(data.filter((p: PropiedadOption) => p.activo))
        }
      })
      .catch(() => {})
  }, [])

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setPropiedadId('')
    setEmpleadoId('')
    setShowPassword(false)
  }

  const handleRoleSelect = (r: UserRole) => {
    setRole(r)
    resetForm()
  }

  const handleAdminLogin = () => {
    // Hardcoded admin
    if (email.trim().toLowerCase() === 'admin@hospitalityup.com' && password === 'admin123') {
      login({
        role: 'admin',
        nombre: 'Admin',
        email: 'admin@hospitalityup.com',
      })
      toast.success(locale === 'es' ? 'Bienvenido, Admin' : 'Welcome, Admin')
    } else {
      toast.error(t.invalidCredentials)
    }
  }

  const handleEmpresaLogin = async () => {
    if (!propiedadId) {
      toast.error(t.requiredField)
      return
    }
    if (!password) {
      toast.error(t.requiredField)
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/empresa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propiedadId, password }),
      })
      const data = await res.json()
      if (data.success) {
        const prop = data.propiedad
        login({
          role: 'empresa',
          nombre: prop.contactoNombre || prop.nombre,
          email: prop.contactoEmail || undefined,
          propiedadId: prop.id,
          propiedadNombre: prop.nombre,
        })
        toast.success(locale === 'es' ? `Bienvenido, ${prop.nombre}` : `Welcome, ${prop.nombre}`)
      } else {
        toast.error(data.error || t.invalidCredentials)
      }
    } catch {
      toast.error(t.invalidCredentials)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEmpleadoLogin = async () => {
    if (!empleadoId.trim()) {
      toast.error(t.requiredField)
      return
    }
    if (!password) {
      toast.error(t.requiredField)
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/empleado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empleadoId: empleadoId.trim(), password }),
      })
      const data = await res.json()
      if (data.success) {
        const emp = data.empleado
        login({
          role: 'empleado',
          nombre: emp.nombre,
          empleadoCodigo: emp.empleadoId,
          empleadoId: emp.id,
          propiedadId: data.propiedadId,
          propiedadNombre: data.propiedad?.nombre,
        })
        toast.success(locale === 'es' ? `Bienvenido, ${emp.nombre}` : `Welcome, ${emp.nombre}`)
      } else {
        toast.error(data.error || t.invalidCredentials)
      }
    } catch {
      toast.error(t.invalidCredentials)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (role === 'admin') handleAdminLogin()
    else if (role === 'empresa') handleEmpresaLogin()
    else if (role === 'empleado') handleEmpleadoLogin()
  }

  // ─── Render ───────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-teal-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950">
      {/* Top bar with logo & language toggle */}
      <header className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-teal-600 text-white flex items-center justify-center">
            <Hotel className="size-5" />
          </div>
          <div className="leading-tight">
            <div className="font-bold text-sm">HospitalityUP</div>
            <div className="text-[11px] text-muted-foreground">{t.subtitle}</div>
          </div>
        </div>
        <div className="flex rounded-md border overflow-hidden">
          <button
            onClick={() => setLocale('es')}
            className={`px-2.5 py-1 text-xs font-medium transition-colors ${
              locale === 'es'
                ? 'bg-teal-600 text-white'
                : 'bg-background hover:bg-muted'
            }`}
          >
            ES
          </button>
          <button
            onClick={() => setLocale('en')}
            className={`px-2.5 py-1 text-xs font-medium transition-colors ${
              locale === 'en'
                ? 'bg-teal-600 text-white'
                : 'bg-background hover:bg-muted'
            }`}
          >
            EN
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-teal-200/50">
          <CardContent className="p-6 sm:p-8">
            {/* Welcome */}
            {!role ? (
              <div className="space-y-6">
                <div className="text-center space-y-1">
                  <div className="size-12 rounded-xl bg-teal-600 text-white flex items-center justify-center mx-auto mb-3">
                    <Hotel className="size-7" />
                  </div>
                  <h1 className="text-xl font-bold">{t.welcome}</h1>
                  <p className="text-sm text-muted-foreground">{t.selectRole}</p>
                </div>
                <div className="space-y-2">
                  <RoleButton
                    icon={ShieldCheck}
                    title={t.admin}
                    desc={t.adminDesc}
                    onClick={() => handleRoleSelect('admin')}
                  />
                  <RoleButton
                    icon={Building2}
                    title={t.empresa}
                    desc={t.empresaDesc}
                    onClick={() => handleRoleSelect('empresa')}
                  />
                  <RoleButton
                    icon={UserIcon}
                    title={t.empleado}
                    desc={t.empleadoDesc}
                    onClick={() => handleRoleSelect('empleado')}
                  />
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Role header */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => { setRole(null); resetForm() }}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="size-3" />
                    {t.back}
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                      {role === 'admin' && <ShieldCheck className="size-5" />}
                      {role === 'empresa' && <Building2 className="size-5" />}
                      {role === 'empleado' && <UserIcon className="size-5" />}
                    </div>
                    <div>
                      <h2 className="font-semibold text-base">
                        {role === 'admin' ? t.admin : role === 'empresa' ? t.empresa : t.empleado}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {role === 'admin' ? t.adminDesc : role === 'empresa' ? t.empresaDesc : t.empleadoDesc}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Role-specific fields */}
                {role === 'admin' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t.email}</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder={t.emailPlaceholder}
                          className="pl-9"
                          autoComplete="email"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">{t.password}</Label>
                      <PasswordInput
                        id="password"
                        value={password}
                        onChange={setPassword}
                        placeholder={t.passwordPlaceholder}
                        show={showPassword}
                        toggle={() => setShowPassword(s => !s)}
                        t={t}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground bg-muted/50 rounded p-2">
                      {t.demoHint}
                    </p>
                  </>
                )}

                {role === 'empresa' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="propiedad">{t.propiedad}</Label>
                      <Select value={propiedadId} onValueChange={setPropiedadId}>
                        <SelectTrigger id="propiedad">
                          <SelectValue placeholder={t.selectPropiedad} />
                        </SelectTrigger>
                        <SelectContent>
                          {propiedades.length === 0 ? (
                            <SelectItem value="_none" disabled>
                              {locale === 'es' ? 'Sin propiedades disponibles' : 'No properties available'}
                            </SelectItem>
                          ) : (
                            propiedades.map(p => (
                              <SelectItem key={p.id} value={p.id}>
                                {locale === 'es' ? p.nombre : (p.nombreEn || p.nombre)}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">{t.password}</Label>
                      <PasswordInput
                        id="password"
                        value={password}
                        onChange={setPassword}
                        placeholder={t.passwordPlaceholder}
                        show={showPassword}
                        toggle={() => setShowPassword(s => !s)}
                        t={t}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground bg-muted/50 rounded p-2">
                      {t.demoHintEmpresa}
                    </p>
                  </>
                )}

                {role === 'empleado' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="empleadoId">{t.empleadoId}</Label>
                      <Input
                        id="empleadoId"
                        value={empleadoId}
                        onChange={e => setEmpleadoId(e.target.value)}
                        placeholder={t.empleadoIdPlaceholder}
                        autoComplete="username"
                        autoFocus
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">{t.password}</Label>
                      <PasswordInput
                        id="password"
                        value={password}
                        onChange={setPassword}
                        placeholder={t.passwordPlaceholder}
                        show={showPassword}
                        toggle={() => setShowPassword(s => !s)}
                        t={t}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground bg-muted/50 rounded p-2">
                      {t.demoHintEmpleado}
                    </p>
                  </>
                )}

                <Button
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white gap-2"
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <LogIn className="size-4" />
                  )}
                  {submitting ? t.signingIn : t.signIn}
                  <ArrowRight className="size-4" />
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>

      <footer className="px-4 py-3 text-center text-xs text-muted-foreground">
        © 2025 HospitalityUP · {t.subtitle}
      </footer>
    </div>
  )
}

function RoleButton({
  icon: Icon,
  title,
  desc,
  onClick,
}: {
  icon: React.ElementType
  title: string
  desc: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-lg border bg-background p-3 hover:bg-muted/50 hover:border-teal-400 transition-colors flex items-center gap-3"
    >
      <div className="size-9 rounded-lg bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-300 flex items-center justify-center shrink-0">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-medium text-sm">{title}</div>
        <div className="text-xs text-muted-foreground truncate">{desc}</div>
      </div>
      <ArrowRight className="size-4 text-muted-foreground shrink-0" />
    </button>
  )
}

function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  show,
  toggle,
  t,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  show: boolean
  toggle: () => void
  t: { showPassword: string; hidePassword: string }
}) {
  return (
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <Input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9"
        autoComplete="current-password"
      />
      <button
        type="button"
        onClick={toggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        aria-label={show ? t.hidePassword : t.showPassword}
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}
