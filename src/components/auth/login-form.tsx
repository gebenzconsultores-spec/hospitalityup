'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Hotel, Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type RolType = 'admin' | 'empresa' | 'empleado' | 'proveedor'

const ROLES = [
  {
    key: 'admin' as RolType,
    label: 'Administrador',
    labelEn: 'Administrator',
    activeColor: 'bg-purple-600 text-white',
    inactiveColor: 'border-purple-700 text-purple-300',
  },
  {
    key: 'empresa' as RolType,
    label: 'Empresa / Gerente',
    labelEn: 'Company / Manager',
    activeColor: 'bg-teal-600 text-white',
    inactiveColor: 'border-teal-700 text-teal-300',
  },
  {
    key: 'empleado' as RolType,
    label: 'Empleado',
    labelEn: 'Employee',
    activeColor: 'bg-amber-600 text-white',
    inactiveColor: 'border-amber-700 text-amber-300',
  },
  {
    key: 'proveedor' as RolType,
    label: 'Proveedor',
    labelEn: 'Supplier',
    activeColor: 'bg-green-600 text-white',
    inactiveColor: 'border-green-700 text-green-300',
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
        localStorage.setItem('hospitalityup_session', JSON.stringify({
          id: data.id,
          nombre: data.nombre,
          rol: data.rol,
          propiedadId: data.propiedadId || null,
          propiedadNombre: data.propiedadNombre || null,
          empleadoId: data.empleadoId || null,
          posicion: data.posicion || null,
          email: data.email || null,
        }))
        if (data.rol === 'admin') router.push('/admin')
        else if (data.rol === 'empresa') router.push('/empresa')
        else if (data.rol === 'empleado') router.push('/empleado')
        else if (data.rol === 'proveedor') router.push('/proveedor')
        else router.push('/login')
      } else {
        toast.error(data.error || (locale === 'es' ? 'Credenciales incorrectas' : 'Invalid credentials'))
      }
    } catch {
      toast.error(locale === 'es' ? 'Error de conexión' : 'Connection error')
    } finally {
      setLoading(false)
    }
  }

  const placeholders: Record<RolType, string> = {
    admin: 'admin',
    empresa: 'email@empresa.com',
    empleado: 'MES-401',
    proveedor: 'email@proveedor.com',
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
          <div className="flex justify-center gap-1 mt-3">
            <button onClick={() => setLocale('es')} className={`px-3 py-1 rounded text-xs font-medium transition-colors ${locale === 'es' ? 'bg-teal-500 text-white' : 'text-teal-300 hover:text-white'}`}>ES</button>
            <button onClick={() => setLocale('en')} className={`px-3 py-1 rounded text-xs font-medium transition-colors ${locale === 'en' ? 'bg-teal-500 text-white' : 'text-teal-300 hover:text-white'}`}>EN</button>
          </div>
        </div>

        <div className="rounded-2xl border border-teal-800/50 bg-white/10 backdrop-blur-sm p-6 space-y-4">
          <div className="text-center">
            <h2 className="text-white font-bold text-lg">{locale === 'es' ? 'Iniciar Sesión' : 'Sign In'}</h2>
            <p className="text-teal-300 text-sm">{locale === 'es' ? 'Selecciona tu tipo de acceso' : 'Select your access type'}</p>
          </div>

          {/* Selector de rol - 2x2 grid */}
          <div className="grid grid-cols-2 gap-2">
            {ROLES.map(r => (
              <button
                key={r.key}
                onClick={() => setRol(r.key)}
                className={`rounded-lg border p-2.5 text-center transition-all text-xs font-semibold ${
                  rol === r.key
                    ? r.activeColor + ' border-transparent'
                    : 'border-teal-700 text-teal-300 hover:border-teal-500 hover:text-white'
                }`}
              >
                {locale === 'es' ? r.label : r.labelEn}
              </button>
            ))}
          </div>

          {/* Usuario */}
          <div className="space-y-1">