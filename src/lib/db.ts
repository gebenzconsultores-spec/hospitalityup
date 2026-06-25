import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  prismaClientVersion?: string
}

// Check if we have a valid database URL (not SQLite file that won't work on Vercel)
const dbUrl = process.env.DATABASE_URL || ''
const isSQLite = dbUrl.startsWith('file:')
const isVercel = !!process.env.VERCEL

// Only create PrismaClient if we have a real database connection
// On Vercel with SQLite, we skip it and use mock data instead
let _db: PrismaClient | null = null

try {
  if (isVercel && isSQLite) {
    console.log('⚠️ SQLite not supported on Vercel - using mock data mode')
  } else if (dbUrl) {
    // Check if the cached client has the same schema version by testing for new fields
    const currentVersion = 'v2-schedule-fields'
    const needsRecreate = globalForPrisma.prismaClientVersion !== currentVersion
    
    if (needsRecreate) {
      _db = new PrismaClient({
        log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
      })
      globalForPrisma.prisma = _db
      globalForPrisma.prismaClientVersion = currentVersion
    } else {
      _db = globalForPrisma.prisma ?? new PrismaClient({
        log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
      })
      if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = _db
    }
  }
} catch (e) {
  console.log('⚠️ Database connection failed - using mock data mode:', e)
}

export const db = _db
export const isDatabaseAvailable = () => _db !== null
