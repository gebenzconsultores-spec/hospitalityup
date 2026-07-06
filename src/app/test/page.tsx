'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'

export default function TestPage() {
  const { isLoggedIn, userRole, userName, login, logout } = useAppStore()
  const [testResult, setTestResult] = useState<string>('')

  const testAdminLogin = () => {
    try {
      login({
        role: 'admin',
        nombre: 'Admin',
        email: 'admin@hospitalityup.com',
      })
      setTestResult('✅ Admin login ejecutado. isLoggedIn debería ser true ahora.')
    } catch (e) {
      setTestResult('❌ Error: ' + String(e))
    }
  }

  const testEmpresaLogin = async () => {
    try {
      setTestResult('Probando API empresa...')
      const res = await fetch('/api/auth/empresa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          propiedadId: 'cmr89iagv0000uapcyjrb28nd', 
          password: 'empresa123' 
        }),
      })
      const data = await res.json()
      setTestResult('API response: ' + JSON.stringify(data, null, 2))
      
      if (data.success) {
        login({
          role: 'empresa',
          nombre: data.propiedad.nombre,
          propiedadId: data.propiedad.id,
          propiedadNombre: data.propiedad.nombre,
        })
        setTestResult(prev => prev + '\n✅ Empresa login ejecutado.')
      }
    } catch (e) {
      setTestResult('❌ Error: ' + String(e))
    }
  }

  const testEmpleadoLogin = async () => {
    try {
      setTestResult('Probando API empleado...')
      const res = await fetch('/api/auth/empleado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          empleadoId: 'MES-401', 
          password: '1234' 
        }),
      })
      const data = await res.json()
      setTestResult('API response: ' + JSON.stringify(data, null, 2).substring(0, 500))
      
      if (data.success) {
        login({
          role: 'empleado',
          nombre: data.empleado.nombre,
          empleadoId: data.empleado.id,
          empleadoCodigo: data.empleado.empleadoId,
          propiedadId: data.propiedadId,
          propiedadNombre: data.propiedad?.nombre,
        })
        setTestResult(prev => prev + '\n✅ Empleado login ejecutado.')
      }
    } catch (e) {
      setTestResult('❌ Error: ' + String(e))
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-4">Diagnóstico de Login</h1>
          <div className="space-y-2 text-sm">
            <p><strong>isLoggedIn:</strong> {String(isLoggedIn)}</p>
            <p><strong>userRole:</strong> {String(userRole)}</p>
            <p><strong>userName:</strong> {String(userName)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="font-semibold">Probar Login</h2>
          <div className="flex gap-2 flex-wrap">
            <button 
              onClick={testAdminLogin}
              className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
            >
              Probar Admin Login
            </button>
            <button 
              onClick={testEmpresaLogin}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Probar Empresa Login
            </button>
            <button 
              onClick={testEmpleadoLogin}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Probar Empleado Login
            </button>
            <button 
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        {testResult && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="font-semibold mb-2">Resultado:</h2>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto whitespace-pre-wrap">
              {testResult}
            </pre>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="font-semibold mb-2">Estado después del login:</h2>
          <p className="text-sm">isLoggedIn: {String(isLoggedIn)}</p>
          <p className="text-sm">userRole: {String(userRole)}</p>
          <p className="text-sm">userName: {String(userName)}</p>
          {isLoggedIn && (
            <p className="text-sm text-green-600 mt-2">
              ✅ ¡Login exitoso! Ve a <a href="/" className="underline">la página principal</a>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
