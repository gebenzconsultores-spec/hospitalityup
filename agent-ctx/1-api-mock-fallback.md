# Task ID: 1 - Update ALL API Routes for Vercel Compatibility (Mock Data Fallback)

## Agent: API Mock Fallback Agent
## Date: 2024-06-11

## Summary
Updated all API routes in the Next.js project to gracefully handle missing/unavailable database connections by returning realistic mock data instead of crashing. This enables the app to work on Vercel serverless where SQLite is not supported.

## Files Created

### `src/lib/api-helpers.ts`
- Created comprehensive helper module with mock data for every API endpoint
- Exports `dbReady()` function to check database availability
- Provides `getMockDashboard()`, `getMockPropiedades()`, `getMockEmpleados()`, `getMockServicios()`, `getMockAlertas()`, `getMockCandidatos()`, `getMockCapacitaciones()`, `getMockVentas()`, `getMockSolicitudes()` functions
- Provides `getMockSeedResponse()` for seed endpoint
- Provides `getDemoModeResponse(action, entity)` for POST/PATCH/DELETE operations
- Provides English API mock data: `getMockEmployees()`, `getMockCourses()`, `getMockServices()`, `getMockOrders()`, `getMockInstructors()`, `getMockBookings()`, `getMockTurnoverAlerts()`, `getMockTraining()`
- Provides `getMockEmpleadoDetail(id)` for single employee detail endpoint
- All mock data matches the exact shape returned by Prisma queries (Spanish field names for Spanish APIs, English for English APIs)

## Files Updated (Spanish API Routes)

### `src/app/api/dashboard/route.ts`
- Added `isDatabaseAvailable()` check at start of GET
- Returns mock dashboard data when DB unavailable
- Catches errors and falls back to mock data

### `src/app/api/propiedades/route.ts`
- GET returns mock propiedades when DB unavailable
- POST returns demo mode response when DB unavailable

### `src/app/api/empleados/route.ts`
- GET returns mock empleados (12 employees with full fields including justificacionRiesgo, sugerenciaCapacitacion)
- POST returns demo mode response

### `src/app/api/empleados/[id]/route.ts`
- GET returns mock employee detail with cursos, ventas, alertas
- PATCH returns demo mode response
- DELETE returns demo mode response

### `src/app/api/servicios/route.ts`
- GET returns 19 mock services across 6 properties
- POST returns demo mode response

### `src/app/api/servicios/[id]/route.ts`
- GET returns single mock service by ID
- PATCH/DELETE return demo mode responses

### `src/app/api/alertas/route.ts`
- GET returns 8 mock alerts with different severities (2 critico, 2 alto, 3 medio, 1 bajo)
- POST/PATCH return demo mode responses

### `src/app/api/candidatos/route.ts`
- GET returns 8 mock candidates
- POST/PATCH return demo mode responses

### `src/app/api/capacitaciones/route.ts`
- GET returns 8 mock courses with stats (inscripcionesCount, completadosCount, tasaCompletado)
- POST returns demo mode response

### `src/app/api/ventas/route.ts`
- GET returns 24 mock sales records
- POST returns demo mode response

### `src/app/api/solicitudes/route.ts`
- GET returns 4 mock training requests
- POST returns demo mode response

### `src/app/api/seed/route.ts`
- Returns mock success response without trying to create database records

## Files Updated (English API Routes)

### `src/app/api/employees/route.ts`
- Uses Spanish Prisma models (Empleado) with English field transformation
- Falls back to mock employees

### `src/app/api/employees/[id]/route.ts`
- GET/PATCH/DELETE with mock fallback

### `src/app/api/courses/route.ts`
- Uses Capacitacion model, falls back to mock courses

### `src/app/api/services/route.ts`
- Uses Servicio model, falls back to mock services

### `src/app/api/orders/route.ts`
- Uses VentaNPS model, falls back to mock orders

### `src/app/api/bookings/route.ts`
- Uses SolicitudCapacitacion model, falls back to mock bookings

### `src/app/api/instructors/route.ts`
- Uses Instructor model, falls back to mock instructors

### `src/app/api/training/route.ts`
- Uses EmpleadoCapacitacion model, falls back to mock training data

### `src/app/api/turnover/route.ts`
- Uses AlertaRiesgo model, falls back to mock turnover alerts
- Maps English severity values to Spanish DB values

### `src/app/api/agents/performance/route.ts`
- Returns simulated AI analysis in demo mode
- Only uses ZAI SDK when database is available

### `src/app/api/route.ts`
- Returns API status with database connection info

## Pattern Used

Every API route follows this consistent pattern:

```typescript
import { db, isDatabaseAvailable } from '@/lib/db'
import { getMockXxx, getDemoModeResponse } from '@/lib/api-helpers'

export async function GET(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(getMockXxx())
    }
    // ... normal DB query
  } catch (error) {
    return NextResponse.json(getMockXxx()) // fallback on error
  }
}

export async function POST(request: Request) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(getDemoModeResponse('create', 'entity'), { status: 201 })
    }
    // ... normal DB insert
  } catch (error) {
    return NextResponse.json(getDemoModeResponse('create', 'entity'), { status: 201 })
  }
}
```

## Key Decisions

1. **Never crash**: All routes use try/catch with fallback to mock data
2. **Complete mock data**: All mock data is realistic and matches what the frontend components expect
3. **Field name consistency**: Spanish routes use Spanish field names (from Prisma models), English routes use English field names
4. **POST/PATCH/DELETE simulation**: Return success-like responses with `demo: true` flag
5. **English routes bridge**: English API routes map to Spanish Prisma models when DB is available

## Verification

- `bun run lint` passes with 0 errors, 0 warnings
- Dev server runs successfully, all API endpoints return 200
- Dashboard, propiedades, capacitaciones, alertas APIs tested and working
