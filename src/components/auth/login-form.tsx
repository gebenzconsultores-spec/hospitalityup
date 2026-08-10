'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Hotel, Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type RolType = 'admin' | 'empresa' | 'empleado' | 'proveedor'

const ROLES = [
  { key: 'admin' as RolType, label: 'Administrador', labelEn: 'Administrator', activeColor: 'bg-purple-600 text-white' },
  { key: 'empresa' as RolType, label: 'Empresa / Gerente', labelEn: 'Company / Manager', activeColor: 'bg-teal-600 text-white' },
  { key: 'empleado' as RolType, label: 'Empleado', labelEn: 'Employee', activeColor: 'bg-amber-600 text-white' },
  { key: 'proveedor' as RolType, label: 'Proveedor', labelEn: 'Supplier', activeColor: 'bg-green-600 text-white' },
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
        toast.success(`Bienvenido, ${data.nombre}!`)
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
        toast.error(data.error || 'Credenciales incorrectas')
      }
    } catch {
      toast.error('Error de conexion')
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

  const labelUsuario: Record<RolType, string> = {
    admin: 'Usuario admin',
    empresa: 'Email de empresa',
    empleado: 'ID de Empleado',
    proveedor: 'Email de proveedor',
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-950 via-teal-900 to-emerald-900 p-4">
      <div className="w-full max-w-md space-y-6">
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
            <h2 className="text-white font-bold text-lg">{locale === 'es' ? 'Iniciar Sesion' : 'Sign In'}</h2>
            <p className="text-teal-300 text-sm">{locale === 'es' ? 'Selecciona tu tipo de acceso' : 'Select your access type'}</p>
          </div>

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

          <div className="space-y-1">
            <label className="text-teal-200 text-sm font-medium block">
              {labelUsuario[rol]}
            </label>
            <input
              className="w-full bg-white/10 border border-teal-700 rounded-lg px-3 py-2.5 text-white placeholder:text-teal-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder={placeholders[rol]}
              value={usuario}
              onChange={e => setUsuario(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <div className="space-y-1">
            <label className="text-teal-200 text-sm font-medium block">
              {locale === 'es' ? 'Contrasena' : 'Password'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full bg-white/10 border border-teal-700 rounded-lg px-3 py-2.5 text-white placeholder:text-teal-400 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-400 hover:text-white" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div className="rounded-lg bg-teal-950/50 p-3 space-y-1">
            <p className="text-xs text-teal-400 font-medium">{locale === 'es' ? 'Credenciales de prueba:' : 'Test credentials:'}</p>
            <p className="text-xs text-teal-300">Admin: <span className="text-white">admin / admin123</span></p>
            <p className="text-xs text-teal-300">Empresa: <span className="text-white">pepito@plaza.com / empresa123</span></p>
            <p className="text-xs text-teal-300">Empleado: <span className="text-white">MES-401 / 1234</span></p>
            <p className="text-xs text-teal-300">Proveedor: <span className="text-white">email@proveedor.com / proveedor123</span></p>
          </div>

          <button
            className="w-full bg-teal-500 hover:bg-teal-400 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <><Loader2 className="size-4 animate-spin" />{locale === 'es' ? 'Entrando...' : 'Signing in...'}</>
            ) : (
              locale === 'es' ? 'Entrar' : 'Sign In'
            )}
          </button>
        </div>

        <p className="text-center text-xs text-teal-500">2025 HospitalityUP</p>
      </div>
    </div>
  )
}