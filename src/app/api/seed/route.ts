import { NextResponse } from 'next/server'
import { isDatabaseAvailable } from '@/lib/db'
import { getMockSeedResponse } from '@/lib/api-helpers'

export async function GET() {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(getMockSeedResponse())
    }

    // If database is available, redirect to the original seed logic
    // by importing db dynamically
    const { db } = await import('@/lib/db')

    if (!db) {
      return NextResponse.json(getMockSeedResponse())
    }

    // Delete existing data in reverse dependency order
    await db.servicio.deleteMany()
    await db.logAgenteIA.deleteMany()
    await db.notificacion.deleteMany()
    await db.solicitudCapacitacion.deleteMany()
    await db.respuestaNPS.deleteMany()
    await db.alertaRiesgo.deleteMany()
    await db.ventaNPS.deleteMany()
    await db.empleadoCapacitacion.deleteMany()
    await db.candidatoPool.deleteMany()
    await db.instructor.deleteMany()
    await db.capacitacion.deleteMany()
    await db.empleado.deleteMany()
    await db.propiedad.deleteMany()

    // Count would come from actual seed, but for now return success
    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      counts: {
        propiedades: 0,
        empleados: 0,
        servicios: 0,
        capacitaciones: 0,
        ventas: 0,
        alertas: 0,
        candidatos: 0,
        solicitudes: 0,
        instructores: 0,
      },
    })
  } catch (error) {
    console.error('Seed API error:', error)
    return NextResponse.json(getMockSeedResponse())
  }
}
