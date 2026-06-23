import { NextResponse } from 'next/server'
import { isDatabaseAvailable } from '@/lib/db'

export async function GET() {
  return NextResponse.json({
    message: 'HospitalityUP API',
    status: 'ok',
    database: isDatabaseAvailable() ? 'connected' : 'mock_mode',
    mode: isDatabaseAvailable() ? 'live' : 'demo',
  })
}
