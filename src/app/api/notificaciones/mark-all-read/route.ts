import { NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'

// POST /api/notificaciones/mark-all-read - Marcar todas como leídas
export async function POST() {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json({ success: true, demo: true })
    }

    await db.notificacion.updateMany({
      where: { leida: false },
      data: { leida: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Notificaciones mark-all-read error:', error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
