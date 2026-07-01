import { NextResponse } from 'next/server'
import { db, isDatabaseAvailable } from '@/lib/db'

export async function GET() {
  const debug = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    isVercel: !!process.env.VERCEL,
    databaseUrlPresent: !!process.env.DATABASE_URL,
    databaseUrlPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 15) + '...' : 'NOT SET',
    isDatabaseAvailable: isDatabaseAvailable(),
    dbNull: db === null,
  }

  if (!isDatabaseAvailable() || !db) {
    return NextResponse.json({
      ...debug,
      error: 'Database not available',
      message: 'DATABASE_URL not set or PrismaClient failed to initialize'
    }, { status: 500 })
  }

  try {
    // Test 1: Count propiedades
    const propiedadesCount = await db.propiedad.count()
    
    // Test 2: Check if password column exists
    let hasPasswordColumn = false
    try {
      await db.propiedad.findFirst({ select: { password: true } })
      hasPasswordColumn = true
    } catch {
      hasPasswordColumn = false
    }

    // Test 3: Get a sample propiedad
    const sampleProp = await db.propiedad.findFirst({
      select: {
        id: true,
        nombre: true,
        password: true,
        activo: true,
      }
    })

    // Test 4: Count empleados
    const empleadosCount = await db.empleado.count()

    // Test 5: Check empleado password
    let empleadoHasPassword = false
    try {
      await db.empleado.findFirst({ select: { password: true } })
      empleadoHasPassword = true
    } catch {
      empleadoHasPassword = false
    }

    return NextResponse.json({
      ...debug,
      database: 'CONNECTED',
      propiedadesCount,
      empleadosCount,
      hasPasswordColumn,
      empleadoHasPassword,
      samplePropiedad: sampleProp ? {
        id: sampleProp.id,
        nombre: sampleProp.nombre,
        hasPassword: !!sampleProp.password,
        passwordLength: sampleProp.password?.length || 0,
        activo: sampleProp.activo,
      } : null,
    })
  } catch (error) {
    return NextResponse.json({
      ...debug,
      error: 'Database query failed',
      message: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  }
}
