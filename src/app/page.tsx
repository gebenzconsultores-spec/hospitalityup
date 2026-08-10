'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const session = localStorage.getItem('hospitalityup_session')
    if (!session) {
      router.push('/login')
      return
    }
    const parsed = JSON.parse(session)
    if (parsed.rol === 'admin') router.push('/admin')
    else if (parsed.rol === 'empresa') router.push('/empresa')
    else if (parsed.rol === 'empleado') router.push('/empleado')
    else if (parsed.rol === 'proveedor') router.push('/proveedor')
    else router.push('/login')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
    </div>
  )
}