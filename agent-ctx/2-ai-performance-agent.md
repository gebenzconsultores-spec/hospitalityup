# Task 2 - AI Performance Agent API Developer

## Task
Create API routes for the AI Performance Analyst Agent system in HospitalityUP.

## Work Completed

### 1. `/src/app/api/agents/performance/route.ts`
- **POST** endpoint: Core AI agent for churn prediction
- Receives `{ empleadoId, ventaId? }` payload
- Fetches employee with all related data (ventas, NPS responses, courses, alerts)
- Builds rich context message with metrics, trends, and analysis criteria
- Uses `z-ai-web-dev-sdk` with strict Spanish system prompt
- Parses JSON response with fallback extraction
- Updates employee fields: riesgoBaja, nivelRiesgoBaja, justificacionRiesgo, sugerenciaCapacitacion
- Creates AlertaRiesgo for alto/critico severity
- Updates VentaNPS.analizadoPorIA and resultadoIA when ventaId provided
- Logs all operations to LogAgenteIA (success and failure cases)

### 2. `/src/app/api/ventas/route.ts`
- **GET**: List ventas with filters (empleadoId, propiedadId, esUpselling, pagination)
- **POST**: Create VentaNPS + auto-update employee metrics + async trigger AI agent

### 3. `/src/app/api/candidatos/route.ts`
- **GET**: List candidates with filters (region, posicion, estado)
- **POST**: Add candidate to pool
- **PATCH**: Update candidate status with auto fechaContratacion

### 4. `/src/app/api/alertas/route.ts`
- **GET**: List alerts with filters + severity stats summary
- **PATCH**: Mark as read/resolved
- **POST**: Create manual alert with auto-propiedadId

## Key Decisions
- AI agent call in ventas route is fire-and-forget (no await) to avoid blocking
- AI response parsing has fallback regex extraction for non-JSON outputs
- All errors are logged to LogAgenteIA even when agent fails
- Prisma model names match updated schema (empleado, ventaNPS, alertaRiesgo, etc.)

## Verification
- `bun run lint` passes with zero errors
- Dev server running without issues
