'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Hotel, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

type RolType = 'admin' | 'empresa' | 'empleado'

const ROLES = [
  {
    key: 'admin' as RolType,
    label: 'Administrador',
    labelEn: 'Administrator',
    description: 'Acceso total al sistema',
    descriptionEn: 'Full system access',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    activeColor: 'bg-purple-600 text-white',
  },
  {
    key: 'empresa' as RolType,
    label: 'Empresa / Gerente',
    labelEn: 'Company / Manager',
    description: 'Gestión de tu propiedad',
    descriptionEn: 'Manage your property',
    color: 'bg-teal-100 text-teal-700 border-teal-200',
    activeColor: 'bg-teal-600 text-white',
  },
  {
    key: 'empleado' as RolType,
    label: 'Empleado',
    labelEn: 'Employee',
    description: 'Vista de trabajo y ventas',
    descriptionEn: 'Work view and sales',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    activeColor: 'bg-amber-600 text-white',
  },
]

export function LoginForm() {
  const router = useRouter()
  const [locale, setLocale] = useState<'es' | 'en'>('es')
  const [rol, setRol] = useState<RolType>('admin')
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!usuario || !password) {
      toast.error(locale === 'es' ? 'Completa todos los campos' : 'Complete all fields')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, password, rol }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        toast.success(locale === 'es' ? `¡Bienvenido, ${data.nombre}!` : `Welcome, ${data.nombre}!`)
        // Guardar sesión en localStorage
        localStorage.setItem('hospitalityup_session', JSON.stringify({
          id: data.id,
          nombre: data.nombre,
          rol: data.rol,
          propiedadId: data.propiedadId || null,
          propiedadNombre: data.propiedadNombre || null,
        }))
        // Redirigir según rol
        if (data.rol === 'admin') router.push('/admin')
        else if (data.rol === 'empresa') router.push('/empresa')
        else if (data.rol === 'empleado') router.push('/empleado')
      } else {
        toast.error(data.error || (locale === 'es' ? 'Credenciales incorrectas' : 'Invalid credentials'))
      }
    } catch {
      toast.error(locale === 'es' ? 'Error de conexión' : 'Connection error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-950 via-teal-900 to-emerald-900 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="flex size-12 items-center justify-center rounded-xl bg-teal-500">
              <Hotel className="size-7 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-white">HospitalityUP</h1>
              <p className="text-teal-300 text-sm">
                {locale === 'es' ? 'Centro de Mando Gerencial' : 'Managerial Command Center'}
              </p>
            </div>
          </div>
          {/* Language toggle */}
          <div className="flex justify-center gap-1 mt-3">
            <button
              onClick={() => setLocale('es')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${locale === 'es' ? 'bg-teal-500 text-white' : 'text-teal-300 hover:text-white'}`}
            >
              ES
            </button>
            <button
              onClick={() => setLocale('en')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${locale === 'en' ? 'bg-teal-500 text-white' : 'text-teal-300 hover:text-white'}`}
            >
              EN
            </button>
          </div>
        </div>

        <Card className="border-teal-800/50 bg-white/10 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-center">
              {locale === 'es' ? 'Iniciar Sesión' : 'Sign In'}
            </CardTitle>
            <CardDescription className="text-teal-300 text-center">
              {locale === 'es' ? 'Selecciona tu tipo de acceso' : 'Select your access type'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selector de rol */}
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map(r => (
                <button
                  key={r.key}
                  onClick={() => setRol(r.key)}
                  className={`rounded-lg border p-2 text-center transition-all ${
                    rol === r.key
                      ? r.activeColor + ' border-transparent'
                      : 'border-teal-700 text-teal-300 hover:border-teal-500'
                  }`}
                >
                  <div className="text-xs font-semibold">
                    {locale === 'es' ? r.label : r.labelEn}
                  </div>
                </button>
              ))}
            </div>

            {/* Campo usuario */}
            <div className="space-y-1">
              <Label className="text-teal-200">
                {rol === 'admin'
                  ? (locale === 'es' ? 'Usuario admin' : 'Admin user')
                  : rol === 'empresa'
                  ? (locale === 'es' ? 'Email o nombre de empresa' : 'Company email or name')
                  : (locale === 'es' ? 'ID de empleado' : 'Employee ID')}
              </Label>
              <Input
                className="bg-white/10 border-teal-700 text-white placeholder:text-teal-400"
                placeholder={rol === 'empleado' ? 'MES-401' : rol === 'empresa' ? 'empresa@email.com' : 'admin'}
                value={usuario}
                onChange={e => setUsuario(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>

            {/* Campo contraseña */}
            <div className="space-y-1">
              <Label className="text-teal-200">
                {locale === 'es' ? 'Contraseña' : 'Password'}
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  className="bg-white/10 border-teal-700 text-white placeholder:text-teal-400 pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Credenciales de prueba */}
            <div className="rounded-lg bg-teal-950/50 p-3 space-y-1">
              <p className="text-xs text-teal-400 font-medium">
                {locale === 'es' ? 'Credenciales de prueba:' : 'Test credentials:'}
              </p>
              <p className="text-xs text-teal-300">Admin: <span className="text-white">admin / admin123</span></p>
              <p className="text-xs text-teal-300">Empresa: <span className="text-white">empresa@email.com / empresa123</span></p>
              <p className="text-xs text-teal-300">Empleado: <span className="text-white">MES-401 / 1234</span></p>
            </div>

            <Button
              className="w-full bg-teal-500 hover:bg-teal-400 text-white font-semibold"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="size-4 mr-2 animate-spin" />{locale === 'es' ? 'Entrando...' : 'Signing in...'}</>
              ) : (
                locale === 'es' ? 'Entrar' : 'Sign In'
              )}
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-teal-500">
          © 2025 HospitalityUP · {locale === 'es' ? 'Todos los derechos reservados' : 'All rights reserved'}
        </p>
      </div>
    </div>
  )
}