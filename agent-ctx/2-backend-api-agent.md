# Task 2 - Backend API Agent Work Record

## Task
Update backend API routes so they work with real database data and are all interconnected.

## Changes Made

### 1. `/api/seed/route.ts` - Complete rewrite
- Full database seeding with 6 properties, 17 employees, 48 services, 25 ventas, 8 capacitaciones, 6 alertas, 8 candidatos
- All entities properly linked via foreign keys
- Proper score calculations: `puntuacionTotal = 0.3*conocimiento + 0.35*ventas + 0.35*hospitalidad`
- Risk level classification: bajo/medio/alto/critico based on riesgoBaja thresholds
- Employee states: mostly 'activo', two 'onboarding', one 'offboarding'
- Services categorized by property type (hotels get rooms/tours, restaurants get platillos/bebidas, etc.)
- Upselling flags and prices on relevant services

### 2. `/api/auth/route.ts` - Database integration
- Admin: hardcoded credentials check (admin@hospitalityup.com / admin123)
- Gerente: property lookup by ID, password = normalized property name (no accents/spaces/lowercase)
- Empleado: employee lookup by empleadoId, password = "1234"
- All return property metadata from database
- Fallback to mock users when database unavailable

### 3. `/api/propiedades/[id]/route.ts` - New file
- GET: single property with stats (employees, services, capacitaciones, ventas, alertas, candidatos)
- PATCH: update property fields
- DELETE: soft delete (activo = false)
- Mock fallback included

### 4. `/api/config/route.ts` - Database integration
- Fetches currency from database property's moneda field
- Falls back to mock getMockCurrencyConfig when unavailable
- Static helper data (positions, property types, service categories) unchanged

## Verification
- `bun run lint` passes with no errors
- Seed API tested: returns proper counts
- Auth admin tested: returns success with correct user data
- Propiedades list tested: returns 6 properties with stats
