import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const dbUrl = process.env.DATABASE_URL || ''
const isVercel = !!process.env.VERCEL
const isPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')
const isSQLite = dbUrl.startsWith('file:')

let _db: PrismaClient | null = null
let _dbAvailable = false

if (isPostgres) {
  try {
    _db = globalForPrisma.prisma ?? new PrismaClient({
      log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
    })
    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = _db
    _dbAvailable = true
    if (isVercel) {
      console.log('PostgreSQL database configured for Vercel')
    } else {
      console.log('PostgreSQL database configured')
    }
  } catch (e) {
    console.log('Database init failed:', e)
    _dbAvailable = false
  }
} else if (isSQLite) {
  console.log('SQLite detected - using mock data mode')
} else {
  console.log('No DATABASE_URL found - using mock data mode')
}

const db = _db

const isDatabaseAvailable = () => _dbAvailable

export { db, isDatabaseAvailable }
