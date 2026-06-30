import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// MODO PRODUCCIÓN: Siempre usa PostgreSQL cuando hay DATABASE_URL
// El modo demo solo se usa en desarrollo local sin DATABASE_URL configurada
const dbUrl = process.env.DATABASE_URL || ''
const isPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')

let _db: PrismaClient | null = null

if (isPostgres) {
  // PRODUCCIÓN: Crear PrismaClient siempre
  try {
    _db = globalForPrisma.prisma ?? new PrismaClient({
      log: ['error'],
    })
    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = _db
  } catch (e) {
    console.error('❌ Error connecting to database:', e)
  }
} else {
  console.log('⚠️ No PostgreSQL URL - using mock data mode (development only)')
}

export const db = _db
export const isDatabaseAvailable = () => _db !== null
