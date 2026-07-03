@echo off
chcp 65001 >nul
echo ============================================
echo   HospitalityUP - Actualizar a PostgreSQL
echo   Este script hace TODO automaticamente
echo ============================================
echo.

REM Verificar que git esta instalado
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git no esta instalado. Descargalo de https://git-scm.com
    pause
    exit /b 1
)

REM Verificar que Node.js esta instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no esta instalado. Descargalo de https://nodejs.org
    pause
    exit /b 1
)

echo [1/6] Clonando repositorio de GitHub...
if exist "hospitalityup" (
    echo Carpeta hospitalityup ya existe, actualizando...
    cd hospitalityup
    git pull origin main
) else (
    git clone https://github.com/gebenzconsultores-spec/hospitalityup.git
    cd hospitalityup
)

echo [2/6] Actualizando prisma/schema.prisma...
powershell -Command "(Get-Content 'prisma/schema.prisma') -replace 'provider = \"sqlite\"', 'provider = \"postgresql\"' | Set-Content 'prisma/schema.prisma'"

echo [3/6] Actualizando src/lib/db.ts...
(
echo import { PrismaClient } from '@prisma/client'
echo.
echo const globalForPrisma = globalThis as unknown as {
echo   prisma: PrismaClient ^| undefined
echo }
echo.
echo const dbUrl = process.env.DATABASE_URL ^|^| ''
echo const isVercel = ^!^!process.env.VERCEL
echo const isPostgres = dbUrl.startsWith^('postgresql://'^) ^|^| dbUrl.startsWith^('postgres://'^)
echo const isSQLite = dbUrl.startsWith^('file:'^)
echo.
echo let _db: PrismaClient ^| null = null
echo let _dbAvailable = false
echo.
echo if ^(isPostgres^) {
echo   try {
echo     _db = globalForPrisma.prisma ^?^? new PrismaClient^(^{
echo       log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
echo     }^)
echo     if ^(process.env.NODE_ENV !== 'production'^) globalForPrisma.prisma = _db
echo     _dbAvailable = true
echo     if ^(isVercel^) {
echo       console.log^('PostgreSQL database configured for Vercel'^)
echo     } else {
echo       console.log^('PostgreSQL database configured'^)
echo     }
echo   } catch ^(e^) {
echo     console.log^('Database init failed:', e^)
echo     _dbAvailable = false
echo   }
echo } else if ^(isSQLite^) {
echo   console.log^('SQLite detected - using mock data mode'^)
echo } else {
echo   console.log^('No DATABASE_URL found - using mock data mode'^)
echo }
echo.
echo const db = _db
echo.
echo const isDatabaseAvailable = ^(^) =^> _dbAvailable
echo.
echo export { db, isDatabaseAvailable }
) > src\lib\db.ts

echo [4/6] Actualizando .env...
echo DATABASE_URL="postgresql://postgres:@dministradoR1@db.myfnzgolubdjzofozcqo.supabase.co:5432/postgres" > .env

echo [5/6] Actualizando package.json con seed command...
powershell -Command "$pkg = Get-Content 'package.json' -Raw | ConvertFrom-Json; if (-not $pkg.scripts.'db:seed') { $pkg.scripts | Add-Member -NotePropertyName 'db:seed' -NotePropertyValue 'npx tsx prisma/seed.ts' -Force }; if (-not $pkg.prisma) { $pkg | Add-Member -NotePropertyName 'prisma' -NotePropertyValue @{'seed'='npx tsx prisma/seed.ts'} -Force }; $pkg | ConvertTo-Json -Depth 10 | Set-Content 'package.json'"

echo [6/6] Creando prisma/seed.ts...
echo Descargando seed.ts desde el repositorio...

REM Crear el seed.ts directamente con PowerShell
powershell -Command "$content = @'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed de HospitalityUP en Supabase...')

  // Limpiar datos existentes
  console.log('Limpiando datos previos...')
  await prisma.logAgenteIA.deleteMany()
  await prisma.notificacion.deleteMany()
  await prisma.respuestaNPS.deleteMany()
  await prisma.empleadoCapacitacion.deleteMany()
  await prisma.solicitudCapacitacion.deleteMany()
  await prisma.alertaRiesgo.deleteMany()
  await prisma.ventaNPS.deleteMany()
  await prisma.candidatoPool.deleteMany()
  await prisma.servicio.deleteMany()
  await prisma.capacitacion.deleteMany()
  await prisma.empleado.deleteMany()
  await prisma.instructor.deleteMany()
  await prisma.propiedad.deleteMany()

  // =============================================
  // 1. PROPIEDADES
  // =============================================
  console.log('Creando propiedades...')
  const propiedades = await Promise.all([
    prisma.propiedad.create({ data: { nombre: 'Hotel Grand Cancun', nombreEn: 'Grand Cancun Hotel', tipo: 'hotel', ubicacion: 'Boulevard Kukulcan KM 12.5, Cancun', region: 'cancun', plan: 'growth', moneda: 'USD', activo: true } }),
    prisma.propiedad.create({ data: { nombre: 'Restaurante La Terraza', nombreEn: 'The Terrace Restaurant', tipo: 'restaurante', ubicacion: 'Av. Reforma 222, CDMX', region: 'cdmx', plan: 'boutique', moneda: 'MXN', activo: true } }),
    prisma.propiedad.create({ data: { nombre: 'Bar Mar Caribe', nombreEn: 'Caribbean Sea Bar', tipo: 'bar', ubicacion: 'Zona Hotelera, Playa del Carmen', region: 'playa_carmen', plan: 'boutique', moneda: 'USD', activo: true } }),
    prisma.propiedad.create({ data: { nombre: 'Spa Sentir', nombreEn: 'Feel Spa', tipo: 'spa', ubicacion: 'Fraccionamiento Club Alta, Los Cabos', region: 'los_cabos', plan: 'growth', moneda: 'USD', activo: true } }),
    prisma.propiedad.create({ data: { nombre: 'Resort Sol Puebla', nombreEn: 'Sun Puebla Resort', tipo: 'resort', ubicacion: 'Calle 5 de Mayo 100, Puebla', region: 'puebla', plan: 'enterprise', moneda: 'MXN', activo: true } }),
    prisma.propiedad.create({ data: { nombre: 'Cafe Origenes', nombreEn: 'Origins Coffee', tipo: 'cafe', ubicacion: 'Col. Roma Norte 45, CDMX', region: 'cdmx', plan: 'boutique', moneda: 'MXN', activo: true } }),
  ])
  const [hotelCancun, restauranteTerraza, barMarCaribe, spaSentir, resortPuebla, cafeOrigenes] = propiedades
  console.log('  ' + propiedades.length + ' propiedades creadas')

  // =============================================
  // 2. EMPLEADOS
  // =============================================
  console.log('Creando empleados...')
  const empleados = await Promise.all([
    prisma.empleado.create({ data: { empleadoId: 'BEL-101', nombre: 'Carlos Mendoza', posicion: 'Bellboy Sr.', posicionEn: 'Sr. Bellboy', departamento: 'Conserjeria', departamentoEn: 'Concierge', fechaIngreso: new Date('2021-03-15'), estado: 'activo', nivelCarrera: 3, rutaCarrera: 'Bellboy Jr. - Bellboy Sr. - Jefe de Conserjeria', puntuacionConocimiento: 78, puntuacionVentas: 65, puntuacionHospitalidad: 88, puntuacionTotal: 77, totalUpselling: 1250, npsPromedio: 9.1, cursosCompletados: 4, cursosEnProgreso: 1, indiceFelicidad: 85, riesgoBaja: 12, nivelRiesgoBaja: 'bajo', propiedadId: hotelCancun.id } }),
    prisma.empleado.create({ data: { empleadoId: 'MES-401', nombre: 'Ana Garcia Lopez', posicion: 'Mesera', posicionEn: 'Waitress', departamento: 'Alimentos y Bebidas', departamentoEn: 'Food and Beverage', fechaIngreso: new Date('2022-06-01'), estado: 'activo', nivelCarrera: 2, rutaCarrera: 'Mesera Jr. - Mesera Sr. - Capitana - Gerente A&B', puntuacionConocimiento: 85, puntuacionVentas: 92, puntuacionHospitalidad: 90, puntuacionTotal: 89, totalUpselling: 4800, npsPromedio: 9.3, cursosCompletados: 6, cursosEnProgreso: 1, indiceFelicidad: 92, riesgoBaja: 5, nivelRiesgoBaja: 'bajo', propiedadId: hotelCancun.id } }),
    prisma.empleado.create({ data: { empleadoId: 'MES-402', nombre: 'Roberto Sanchez', posicion: 'Mesero Sr.', posicionEn: 'Sr. Waiter', departamento: 'Alimentos y Bebidas', departamentoEn: 'Food and Beverage', fechaIngreso: new Date('2020-11-10'), estado: 'activo', nivelCarrera: 3, rutaCarrera: 'Mesero Jr. - Mesero Sr. - Capitan - Gerente A&B', puntuacionConocimiento: 80, puntuacionVentas: 75, puntuacionHospitalidad: 82, puntuacionTotal: 79, totalUpselling: 2100, npsPromedio: 8.5, cursosCompletados: 5, indiceFelicidad: 70, riesgoBaja: 35, nivelRiesgoBaja: 'medio', justificacionRiesgo: 'NPS ligeramente bajo en comparacion con el equipo', propiedadId: hotelCancun.id } }),
    prisma.empleado.create({ data: { empleadoId: 'CAP-501', nombre: 'Maria Elena Torres', posicion: 'Capitana', posicionEn: 'Captain', departamento: 'Alimentos y Bebidas', departamentoEn: 'Food and Beverage', fechaIngreso: new Date('2019-01-20'), estado: 'activo', nivelCarrera: 4, rutaCarrera: 'Mesera - Capitana - Gerente A&B', puntuacionConocimiento: 90, puntuacionVentas: 88, puntuacionHospitalidad: 95, puntuacionTotal: 91, totalUpselling: 6200, npsPromedio: 9.6, cursosCompletados: 8, indiceFelicidad: 94, riesgoBaja: 3, nivelRiesgoBaja: 'bajo', propiedadId: hotelCancun.id } }),
    prisma.empleado.create({ data: { empleadoId: 'REC-701', nombre: 'Luis Fernandez', posicion: 'Recepcionista', posicionEn: 'Receptionist', departamento: 'Recepcion', departamentoEn: 'Front Desk', fechaIngreso: new Date('2023-02-14'), estado: 'activo', nivelCarrera: 1, rutaCarrera: 'Recepcionista Jr. - Recepcionista Sr. - Gerente Recepcion', puntuacionConocimiento: 60, puntuacionVentas: 55, puntuacionHospitalidad: 72, puntuacionTotal: 62, totalUpselling: 400, npsPromedio: 7.8, cursosCompletados: 2, cursosEnProgreso: 2, indiceFelicidad: 60, riesgoBaja: 55, nivelRiesgoBaja: 'alto', justificacionRiesgo: 'Empleado nuevo con bajo rendimiento y felicidad decreciente', sugerenciaCapacitacion: 'Curso de hospitalidad y tecnicas de upselling para recepcionistas', propiedadId: hotelCancun.id } }),
    prisma.empleado.create({ data: { empleadoId: 'MES-403', nombre: 'Patricia Ruiz', posicion: 'Mesera', posicionEn: 'Waitress', departamento: 'Alimentos y Bebidas', departamentoEn: 'Food and Beverage', fechaIngreso: new Date('2022-09-01'), estado: 'activo', nivelCarrera: 2, rutaCarrera: 'Mesera Jr. - Mesera Sr. - Capitana', puntuacionConocimiento: 76, puntuacionVentas: 88, puntuacionHospitalidad: 85, puntuacionTotal: 83, totalUpselling: 3200, npsPromedio: 8.9, cursosCompletados: 4, indiceFelicidad: 82, riesgoBaja: 15, nivelRiesgoBaja: 'bajo', propiedadId: restauranteTerraza.id } }),
    prisma.empleado.create({ data: { empleadoId: 'BAR-601', nombre: 'Jorge Ramirez', posicion: 'Bartender', posicionEn: 'Bartender', departamento: 'Alimentos y Bebidas', departamentoEn: 'Food and Beverage', fechaIngreso: new Date('2021-05-20'), estado: 'activo', nivelCarrera: 3, rutaCarrera: 'Barback - Bartender Jr. - Bartender Sr. - Bar Manager', puntuacionConocimiento: 92, puntuacionVentas: 95, puntuacionHospitalidad: 88, puntuacionTotal: 92, totalUpselling: 5600, npsPromedio: 9.2, cursosCompletados: 7, indiceFelicidad: 90, riesgoBaja: 8, nivelRiesgoBaja: 'bajo', propiedadId: restauranteTerraza.id } }),
    prisma.empleado.create({ data: { empleadoId: 'HST-201', nombre: 'Diana Morales', posicion: 'Hostess', posicionEn: 'Hostess', departamento: 'Alimentos y Bebidas', departamentoEn: 'Food and Beverage', fechaIngreso: new Date('2023-08-15'), estado: 'onboarding', nivelCarrera: 1, rutaCarrera: 'Hostess - Capitana - Gerente A&B', puntuacionConocimiento: 45, puntuacionVentas: 30, puntuacionHospitalidad: 60, puntuacionTotal: 45, totalUpselling: 100, npsPromedio: 7.0, cursosCompletados: 1, cursosEnProgreso: 3, indiceFelicidad: 65, riesgoBaja: 40, nivelRiesgoBaja: 'medio', justificacionRiesgo: 'Empleado en onboarding con metricas bajas iniciales', sugerenciaCapacitacion: 'Programa de onboarding acelerado + curso de hospitalidad basica', propiedadId: restauranteTerraza.id } }),
    prisma.empleado.create({ data: { empleadoId: 'BAR-602', nombre: 'Miguel Angel Cruz', posicion: 'Bartender Sr.', posicionEn: 'Sr. Bartender', departamento: 'Alimentos y Bebidas', departamentoEn: 'Food and Beverage', fechaIngreso: new Date('2020-03-10'), estado: 'activo', nivelCarrera: 4, rutaCarrera: 'Bartender - Bartender Sr. - Bar Manager - Director A&B', puntuacionConocimiento: 95, puntuacionVentas: 90, puntuacionHospitalidad: 87, puntuacionTotal: 91, totalUpselling: 7200, npsPromedio: 9.4, cursosCompletados: 9, indiceFelicidad: 88, riesgoBaja: 10, nivelRiesgoBaja: 'bajo', propiedadId: barMarCaribe.id } }),
    prisma.empleado.create({ data: { empleadoId: 'MES-404', nombre: 'Laura Gutierrez', posicion: 'Mesera', posicionEn: 'Waitress', departamento: 'Alimentos y Bebidas', departamentoEn: 'Food and Beverage', fechaIngreso: new Date('2022-01-15'), estado: 'activo', nivelCarrera: 2, rutaCarrera: 'Mesera Jr. - Mesera Sr. - Capitana', puntuacionConocimiento: 70, puntuacionVentas: 72, puntuacionHospitalidad: 78, puntuacionTotal: 73, totalUpselling: 1800, npsPromedio: 8.2, cursosCompletados: 3, indiceFelicidad: 75, riesgoBaja: 25, nivelRiesgoBaja: 'bajo', propiedadId: barMarCaribe.id } }),
    prisma.empleado.create({ data: { empleadoId: 'TER-801', nombre: 'Isabella Vargas', posicion: 'Terapeuta Sr.', posicionEn: 'Sr. Therapist', departamento: 'Spa y Bienestar', departamentoEn: 'Spa and Wellness', fechaIngreso: new Date('2020-07-01'), estado: 'activo', nivelCarrera: 3, rutaCarrera: 'Terapeuta - Terapeuta Sr. - Coordinadora Spa - Directora Spa', puntuacionConocimiento: 94, puntuacionVentas: 80, puntuacionHospitalidad: 96, puntuacionTotal: 90, totalUpselling: 3800, npsPromedio: 9.7, cursosCompletados: 7, indiceFelicidad: 93, riesgoBaja: 4, nivelRiesgoBaja: 'bajo', propiedadId: spaSentir.id } }),
    prisma.empleado.create({ data: { empleadoId: 'REC-802', nombre: 'Sofia Hernandez', posicion: 'Recepcionista Spa', posicionEn: 'Spa Receptionist', departamento: 'Spa y Bienestar', departamentoEn: 'Spa and Wellness', fechaIngreso: new Date('2023-04-01'), estado: 'activo', nivelCarrera: 1, rutaCarrera: 'Recepcionista - Coordinadora Spa', puntuacionConocimiento: 55, puntuacionVentas: 62, puntuacionHospitalidad: 75, puntuacionTotal: 64, totalUpselling: 600, npsPromedio: 8.0, cursosCompletados: 2, cursosEnProgreso: 1, indiceFelicidad: 68, riesgoBaja: 45, nivelRiesgoBaja: 'medio', justificacionRiesgo: 'Rendimiento por debajo del promedio del equipo y felicidad decreciente', sugerenciaCapacitacion: 'Mentoria con Isabella Vargas + curso de ventas en spa', propiedadId: spaSentir.id } }),
    prisma.empleado.create({ data: { empleadoId: 'MES-405', nombre: 'Fernando Castillo', posicion: 'Capitan', posicionEn: 'Captain', departamento: 'Alimentos y Bebidas', departamentoEn: 'Food and Beverage', fechaIngreso: new Date('2018-10-01'), estado: 'activo', nivelCarrera: 4, rutaCarrera: 'Mesero - Capitan - Gerente A&B - Director Operaciones', puntuacionConocimiento: 88, puntuacionVentas: 85, puntuacionHospitalidad: 90, puntuacionTotal: 88, totalUpselling: 5500, npsPromedio: 9.1, cursosCompletados: 8, indiceFelicidad: 87, riesgoBaja: 7, nivelRiesgoBaja: 'bajo', propiedadId: resortPuebla.id } }),
    prisma.empleado.create({ data: { empleadoId: 'BEL-102', nombre: 'Alejandro Diaz', posicion: 'Bellboy', posicionEn: 'Bellboy', departamento: 'Conserjeria', departamentoEn: 'Concierge', fechaIngreso: new Date('2022-12-01'), estado: 'activo', nivelCarrera: 2, rutaCarrera: 'Bellboy Jr. - Bellboy Sr. - Jefe de Conserjeria', puntuacionConocimiento: 65, puntuacionVentas: 58, puntuacionHospitalidad: 72, puntuacionTotal: 65, totalUpselling: 700, npsPromedio: 8.0, cursosCompletados: 3, indiceFelicidad: 62, riesgoBaja: 50, nivelRiesgoBaja: 'alto', justificacionRiesgo: 'Bajo upselling y felicidad decreciente en los ultimos 3 meses', sugerenciaCapacitacion: 'Capacitacion en tecnicas de upselling para conserjeria', propiedadId: resortPuebla.id } }),
    prisma.empleado.create({ data: { empleadoId: 'COC-901', nombre: 'Ricardo Moreno', posicion: 'Chef de Partie', posicionEn: 'Chef de Partie', departamento: 'Cocina', departamentoEn: 'Kitchen', fechaIngreso: new Date('2019-06-15'), estado: 'activo', nivelCarrera: 3, rutaCarrera: 'Commis - Demi Chef - Chef de Partie - Sous Chef - Head Chef', puntuacionConocimiento: 91, puntuacionVentas: 60, puntuacionHospitalidad: 70, puntuacionTotal: 74, totalUpselling: 900, npsPromedio: 8.3, cursosCompletados: 6, indiceFelicidad: 78, riesgoBaja: 20, nivelRiesgoBaja: 'bajo', propiedadId: resortPuebla.id } }),
    prisma.empleado.create({ data: { empleadoId: 'BAR-603', nombre: 'Valentina Rios', posicion: 'Barista', posicionEn: 'Barista', departamento: 'Alimentos y Bebidas', departamentoEn: 'Food and Beverage', fechaIngreso: new Date('2022-04-01'), estado: 'activo', nivelCarrera: 2, rutaCarrera: 'Barista Jr. - Barista Sr. - Shift Manager - Store Manager', puntuacionConocimiento: 82, puntuacionVentas: 78, puntuacionHospitalidad: 85, puntuacionTotal: 82, totalUpselling: 1500, npsPromedio: 8.8, cursosCompletados: 4, indiceFelicidad: 80, riesgoBaja: 18, nivelRiesgoBaja: 'bajo', propiedadId: cafeOrigenes.id } }),
    prisma.empleado.create({ data: { empleadoId: 'MES-406', nombre: 'Camila Ortiz', posicion: 'Mesera', posicionEn: 'Waitress', departamento: 'Alimentos y Bebidas', departamentoEn: 'Food and Beverage', fechaIngreso: new Date('2023-09-01'), estado: 'onboarding', nivelCarrera: 1, rutaCarrera: 'Mesera Jr. - Mesera Sr. - Shift Manager', puntuacionConocimiento: 40, puntuacionVentas: 35, puntuacionHospitalidad: 55, puntuacionTotal: 43, totalUpselling: 50, npsPromedio: 7.2, cursosCompletados: 0, cursosEnProgreso: 3, indiceFelicidad: 55, riesgoBaja: 60, nivelRiesgoBaja: 'alto', justificacionRiesgo: 'Empleado nueva en onboarding con metricas muy bajas y baja felicidad', sugerenciaCapacitacion: 'Programa de onboarding intensivo + asignacion de mentor', propiedadId: cafeOrigenes.id } }),
  ])
  console.log('  ' + empleados.length + ' empleados creados')

  const empMap: Record<string, typeof empleados[0]> = {}
  for (const emp of empleados) { empMap[emp.empleadoId] = emp }

  // =============================================
  // 3. SERVICIOS
  // =============================================
  console.log('Creando servicios...')
  const serviciosData = [
    { nombre: 'Habitacion Deluxe Mar', nombreEn: 'Deluxe Ocean Room', categoria: 'habitacion', precio: 350, esUpselling: false, propiedadId: hotelCancun.id },
    { nombre: 'Upgrade Suite Presidencial', nombreEn: 'Presidential Suite Upgrade', categoria: 'habitacion', precio: 800, precioUpselling: 1200, esUpselling: true, objetivoUpselling: 'Upgrade de Deluxe a Suite Presidencial', objetivoUpsellingEn: 'Upgrade from Deluxe to Presidential Suite', propiedadId: hotelCancun.id },
    { nombre: 'Tour Isla Mujeres', nombreEn: 'Isla Mujeres Tour', categoria: 'tour', precio: 120, esUpselling: false, propiedadId: hotelCancun.id },
    { nombre: 'Tour Isla Mujeres Premium', nombreEn: 'Premium Isla Mujeres Tour', categoria: 'tour', precio: 120, precioUpselling: 220, esUpselling: true, objetivoUpselling: 'Upgrade a tour premium con lunch y open bar', objetivoUpsellingEn: 'Upgrade to premium tour with lunch and open bar', propiedadId: hotelCancun.id },
    { nombre: 'Desbuffet Internacional', nombreEn: 'International Breakfast Buffet', categoria: 'platillo', precio: 35, esUpselling: false, propiedadId: hotelCancun.id },
    { nombre: 'Maridaje Vinos Premium', nombreEn: 'Premium Wine Pairing', categoria: 'platillo', precio: 35, precioUpselling: 85, esUpselling: true, objetivoUpselling: 'Agregar maridaje de vinos premium', objetivoUpsellingEn: 'Add premium wine pairing', propiedadId: hotelCancun.id },
    { nombre: 'Cena en la Playa', nombreEn: 'Beach Dinner', categoria: 'experiencia', precio: 250, precioUpselling: 450, esUpselling: true, objetivoUpselling: 'Cena romantica privada en la playa', objetivoUpsellingEn: 'Private romantic beach dinner', propiedadId: hotelCancun.id },
    { nombre: 'Filete Mignon', nombreEn: 'Filet Mignon', categoria: 'platillo', precio: 480, esUpselling: false, propiedadId: restauranteTerraza.id },
    { nombre: 'Maridaje Vinos Reserva', nombreEn: 'Reserve Wine Pairing', categoria: 'platillo', precio: 480, precioUpselling: 780, esUpselling: true, objetivoUpselling: 'Agregar maridaje de vinos de reserva', objetivoUpsellingEn: 'Add reserve wine pairing', propiedadId: restauranteTerraza.id },
    { nombre: 'Pasta Trufa Negra', nombreEn: 'Black Truffle Pasta', categoria: 'platillo', precio: 380, esUpselling: false, propiedadId: restauranteTerraza.id },
    { nombre: 'Cocktail Artesanal', nombreEn: 'Artisan Cocktail', categoria: 'bebida', precio: 180, esUpselling: false, propiedadId: restauranteTerraza.id },
    { nombre: 'Menu Degustacion 7 Tiempos', nombreEn: '7-Course Tasting Menu', categoria: 'experiencia', precio: 1200, precioUpselling: 1800, esUpselling: true, objetivoUpselling: 'Upgrade a menu degustacion con maridaje', objetivoUpsellingEn: 'Upgrade to tasting menu with wine pairing', propiedadId: restauranteTerraza.id },
    { nombre: 'Margarita Clasica', nombreEn: 'Classic Margarita', categoria: 'bebida', precio: 12, esUpselling: false, propiedadId: barMarCaribe.id },
    { nombre: 'Margarita Premium Don Julio', nombreEn: 'Premium Don Julio Margarita', categoria: 'bebida', precio: 12, precioUpselling: 28, esUpselling: true, objetivoUpselling: 'Upgrade a tequila premium Don Julio 1942', objetivoUpsellingEn: 'Upgrade to premium Don Julio 1942', propiedadId: barMarCaribe.id },
    { nombre: 'Cerveza Artesanal', nombreEn: 'Craft Beer', categoria: 'bebida', precio: 8, esUpselling: false, propiedadId: barMarCaribe.id },
    { nombre: 'Flight de Cervezas', nombreEn: 'Beer Flight', categoria: 'bebida', precio: 8, precioUpselling: 22, esUpselling: true, objetivoUpselling: 'Ofrecer flight de 4 cervezas artesanales', objetivoUpsellingEn: 'Offer flight of 4 craft beers', propiedadId: barMarCaribe.id },
    { nombre: 'Masaje Relajante 60min', nombreEn: 'Relaxing Massage 60min', categoria: 'masaje', precio: 150, esUpselling: false, propiedadId: spaSentir.id },
    { nombre: 'Masaje Hot Stones 90min', nombreEn: 'Hot Stones Massage 90min', categoria: 'masaje', precio: 150, precioUpselling: 280, esUpselling: true, objetivoUpselling: 'Upgrade a masaje de piedras calientes 90 min', objetivoUpsellingEn: 'Upgrade to 90 min hot stones massage', propiedadId: spaSentir.id },
    { nombre: 'Facial Basico', nombreEn: 'Basic Facial', categoria: 'masaje', precio: 100, esUpselling: false, propiedadId: spaSentir.id },
    { nombre: 'Facial con Oro 24K', nombreEn: '24K Gold Facial', categoria: 'masaje', precio: 100, precioUpselling: 250, esUpselling: true, objetivoUpselling: 'Upgrade a facial premium con oro 24K', objetivoUpsellingEn: 'Upgrade to premium 24K gold facial', propiedadId: spaSentir.id },
    { nombre: 'Paquete Spa Day', nombreEn: 'Spa Day Package', categoria: 'paquete', precio: 350, precioUpselling: 550, esUpselling: true, objetivoUpselling: 'Agregar acceso a area humeda y lunch', objetivoUpsellingEn: 'Add wet area access and lunch', propiedadId: spaSentir.id },
    { nombre: 'Habitacion Estandar', nombreEn: 'Standard Room', categoria: 'habitacion', precio: 180, esUpselling: false, propiedadId: resortPuebla.id },
    { nombre: 'Upgrade Suite Junior', nombreEn: 'Junior Suite Upgrade', categoria: 'habitacion', precio: 180, precioUpselling: 320, esUpselling: true, objetivoUpselling: 'Upgrade a Junior Suite con sala y balcon', objetivoUpsellingEn: 'Upgrade to Junior Suite with balcony', propiedadId: resortPuebla.id },
    { nombre: 'Cafe Americano', nombreEn: 'Americano Coffee', categoria: 'bebida', precio: 55, esUpselling: false, propiedadId: cafeOrigenes.id },
    { nombre: 'Cafe de Especialidad V60', nombreEn: 'Specialty V60 Coffee', categoria: 'bebida', precio: 55, precioUpselling: 120, esUpselling: true, objetivoUpselling: 'Ofrecer cafe de especialidad V60', objetivoUpsellingEn: 'Offer specialty V60 coffee', propiedadId: cafeOrigenes.id },
  ]
  const servicios = await Promise.all(serviciosData.map(s => prisma.servicio.create({ data: s })))
  console.log('  ' + servicios.length + ' servicios creados')

  // =============================================
  // 4. CAPACITACIONES
  // =============================================
  console.log('Creando capacitaciones...')
  const capacitaciones = await Promise.all([
    prisma.capacitacion.create({ data: { titulo: 'Tecnicas de Upselling en Hospitalidad', tituloEn: 'Hospitality Upselling Techniques', descripcion: 'Mejores tecnicas para incrementar ventas sugiriendo upgrades y servicios premium.', descripcionEn: 'Best techniques to increase sales with upgrades and premium services.', categoria: 'upselling', modalidad: 'virtual', duracion: 45, dificultad: 'intermedio', puntos: 15, activo: true, posicion: 'Mesero / Bartender', posicionEn: 'Waiter / Bartender' } }),
    prisma.capacitacion.create({ data: { titulo: 'Hospitalidad de Clase Mundial', tituloEn: 'World-Class Hospitality', descripcion: 'Principios de servicio al cliente excepcional.', descripcionEn: 'Exceptional customer service principles.', categoria: 'hospitalidad', modalidad: 'presencial', duracion: 60, dificultad: 'principiante', puntos: 10, activo: true, posicion: 'Todos los puestos', posicionEn: 'All positions' } }),
    prisma.capacitacion.create({ data: { titulo: 'Conocimiento de Vinos y Maridaje', tituloEn: 'Wine Knowledge and Pairing', descripcion: 'Fundamentos de viticultura y tecnicas de maridaje.', descripcionEn: 'Viticulture fundamentals and pairing techniques.', categoria: 'conocimiento_producto', modalidad: 'presencial', duracion: 90, dificultad: 'avanzado', puntos: 20, activo: true, posicion: 'Mesero / Sommelier', posicionEn: 'Waiter / Sommelier' } }),
    prisma.capacitacion.create({ data: { titulo: 'Onboarding: Tu Primer Dia', tituloEn: 'Onboarding: Your First Day', descripcion: 'Guia completa para nuevos empleados.', descripcionEn: 'Complete guide for new employees.', categoria: 'onboarding', modalidad: 'virtual', duracion: 30, dificultad: 'principiante', puntos: 5, activo: true, posicion: 'Todos los puestos', posicionEn: 'All positions' } }),
    prisma.capacitacion.create({ data: { titulo: 'Liderazgo en el Piso', tituloEn: 'Floor Leadership', descripcion: 'Habilidades de liderazgo para capitanes y supervisores.', descripcionEn: 'Leadership skills for captains and supervisors.', categoria: 'liderazgo', modalidad: 'presencial', duracion: 120, dificultad: 'avanzado', puntos: 25, activo: true, posicion: 'Capitan / Supervisor', posicionEn: 'Captain / Supervisor' } }),
    prisma.capacitacion.create({ data: { titulo: 'Cocteleria Avanzada', tituloEn: 'Advanced Mixology', descripcion: 'Tecnicas avanzadas de mixologia y creacion de cocteles signature.', descripcionEn: 'Advanced mixology and signature cocktail creation.', categoria: 'conocimiento_producto', modalidad: 'presencial', duracion: 90, dificultad: 'avanzado', puntos: 20, activo: true, posicion: 'Bartender', posicionEn: 'Bartender' } }),
    prisma.capacitacion.create({ data: { titulo: 'Ventas en Spa y Bienestar', tituloEn: 'Spa and Wellness Sales', descripcion: 'Tecnicas de venta consultiva para servicios de spa.', descripcionEn: 'Consultative sales techniques for spa services.', categoria: 'upselling', modalidad: 'virtual', duracion: 45, dificultad: 'intermedio', puntos: 15, activo: true, posicion: 'Recepcionista Spa / Terapeuta', posicionEn: 'Spa Receptionist / Therapist' } }),
    prisma.capacitacion.create({ data: { titulo: 'Coffee Mastery: Del Grano a la Taza', tituloEn: 'Coffee Mastery: From Bean to Cup', descripcion: 'Conocimiento profundo del cafe: origen, tostado, metodos de extraccion.', descripcionEn: 'Deep coffee knowledge: origin, roasting, extraction methods.', categoria: 'conocimiento_producto', modalidad: 'presencial', duracion: 75, dificultad: 'intermedio', puntos: 18, activo: true, posicion: 'Barista', posicionEn: 'Barista' } }),
  ])
  console.log('  ' + capacitaciones.length + ' capacitaciones creadas')

  // =============================================
  // 5. VENTAS NPS
  // =============================================
  console.log('Creando ventas con NPS...')
  const ventasData = [
    { empleadoId: empMap['MES-401'].id, propiedadId: hotelCancun.id, montoUpselling: 400, esUpselling: true, nombreServicio: 'Upgrade Suite Presidencial', cantidad: 1, precioUnitario: 1200, montoTotal: 1200, calificacionNPS: 10, esPromotor: true, comentario: 'Increible upgrade! Ana fue muy atenta.', fuenteNPS: 'qr', categoriaServicio: 'upgrade_habitacion' },
    { empleadoId: empMap['MES-401'].id, propiedadId: hotelCancun.id, montoUpselling: 100, esUpselling: true, nombreServicio: 'Maridaje Vinos Premium', cantidad: 2, precioUnitario: 85, montoTotal: 170, calificacionNPS: 9, esPromotor: true, comentario: 'Excelente sugerencia de maridaje.', fuenteNPS: 'sms', categoriaServicio: 'upselling' },
    { empleadoId: empMap['MES-401'].id, propiedadId: hotelCancun.id, montoUpselling: 0, esUpselling: false, nombreServicio: 'Desbuffet Internacional', cantidad: 2, precioUnitario: 35, montoTotal: 70, calificacionNPS: 9, esPromotor: true, fuenteNPS: 'qr', categoriaServicio: 'menu' },
    { empleadoId: empMap['MES-401'].id, propiedadId: hotelCancun.id, montoUpselling: 200, esUpselling: true, nombreServicio: 'Cena en la Playa', cantidad: 1, precioUnitario: 450, montoTotal: 450, calificacionNPS: 10, esPromotor: true, comentario: 'La mejor cena de mi vida!', fuenteNPS: 'app', categoriaServicio: 'experiencia' },
    { empleadoId: empMap['MES-402'].id, propiedadId: hotelCancun.id, montoUpselling: 0, esUpselling: false, nombreServicio: 'Desbuffet Internacional', cantidad: 3, precioUnitario: 35, montoTotal: 105, calificacionNPS: 8, esPromotor: false, fuenteNPS: 'qr', categoriaServicio: 'menu' },
    { empleadoId: empMap['MES-402'].id, propiedadId: hotelCancun.id, montoUpselling: 85, esUpselling: true, nombreServicio: 'Maridaje Vinos Premium', cantidad: 1, precioUnitario: 85, montoTotal: 85, calificacionNPS: 7, esPromotor: false, comentario: 'Buen maridaje pero demoro un poco.', fuenteNPS: 'sms', categoriaServicio: 'upselling' },
    { empleadoId: empMap['CAP-501'].id, propiedadId: hotelCancun.id, montoUpselling: 800, esUpselling: true, nombreServicio: 'Cena en la Playa VIP', cantidad: 2, precioUnitario: 650, montoTotal: 1300, calificacionNPS: 10, esPromotor: true, comentario: 'Maria Elena hizo que nuestra luna de miel fuera inolvidable!', fuenteNPS: 'app', categoriaServicio: 'experiencia' },
    { empleadoId: empMap['CAP-501'].id, propiedadId: hotelCancun.id, montoUpselling: 400, esUpselling: true, nombreServicio: 'Upgrade Suite Presidencial', cantidad: 1, precioUnitario: 1200, montoTotal: 1200, calificacionNPS: 10, esPromotor: true, fuenteNPS: 'qr', categoriaServicio: 'upgrade_habitacion' },
    { empleadoId: empMap['BEL-101'].id, propiedadId: hotelCancun.id, montoUpselling: 100, esUpselling: true, nombreServicio: 'Tour Isla Mujeres Premium', cantidad: 1, precioUnitario: 220, montoTotal: 220, calificacionNPS: 9, esPromotor: true, comentario: 'Carlos nos recomendo el tour premium, gran decision!', fuenteNPS: 'qr', categoriaServicio: 'tour' },
    { empleadoId: empMap['REC-701'].id, propiedadId: hotelCancun.id, montoUpselling: 0, esUpselling: false, nombreServicio: 'Habitacion Deluxe Mar', cantidad: 1, precioUnitario: 350, montoTotal: 350, calificacionNPS: 7, esPromotor: false, comentario: 'El check-in fue lento.', fuenteNPS: 'email', categoriaServicio: 'menu' },
    { empleadoId: empMap['BAR-601'].id, propiedadId: restauranteTerraza.id, montoUpselling: 16, esUpselling: true, nombreServicio: 'Margarita Premium Don Julio', cantidad: 4, precioUnitario: 28, montoTotal: 112, calificacionNPS: 10, esPromotor: true, comentario: 'Los mejores margaritas! Jorge es un artista.', fuenteNPS: 'qr', categoriaServicio: 'upselling' },
    { empleadoId: empMap['BAR-601'].id, propiedadId: restauranteTerraza.id, montoUpselling: 600, esUpselling: true, nombreServicio: 'Menu Degustacion 7 Tiempos', cantidad: 2, precioUnitario: 1800, montoTotal: 3600, calificacionNPS: 9, esPromotor: true, fuenteNPS: 'app', categoriaServicio: 'experiencia' },
    { empleadoId: empMap['MES-403'].id, propiedadId: restauranteTerraza.id, montoUpselling: 300, esUpselling: true, nombreServicio: 'Maridaje Vinos Reserva', cantidad: 2, precioUnitario: 780, montoTotal: 1560, calificacionNPS: 9, esPromotor: true, comentario: 'Patricia tiene un paladar increible.', fuenteNPS: 'qr', categoriaServicio: 'upselling' },
    { empleadoId: empMap['BAR-602'].id, propiedadId: barMarCaribe.id, montoUpselling: 14, esUpselling: true, nombreServicio: 'Margarita Premium Don Julio', cantidad: 3, precioUnitario: 28, montoTotal: 84, calificacionNPS: 10, esPromotor: true, comentario: 'La mejor margarita de mi vida! Miguel es un master.', fuenteNPS: 'qr', categoriaServicio: 'upselling' },
    { empleadoId: empMap['BAR-602'].id, propiedadId: barMarCaribe.id, montoUpselling: 37, esUpselling: true, nombreServicio: 'Tabla de Mariscos Premium', cantidad: 1, precioUnitario: 55, montoTotal: 55, calificacionNPS: 9, esPromotor: true, fuenteNPS: 'app', categoriaServicio: 'upselling' },
    { empleadoId: empMap['TER-801'].id, propiedadId: spaSentir.id, montoUpselling: 130, esUpselling: true, nombreServicio: 'Masaje Hot Stones 90min', cantidad: 1, precioUnitario: 280, montoTotal: 280, calificacionNPS: 10, esPromotor: true, comentario: 'Isabella tiene manos magicas.', fuenteNPS: 'app', categoriaServicio: 'upselling' },
    { empleadoId: empMap['TER-801'].id, propiedadId: spaSentir.id, montoUpselling: 150, esUpselling: true, nombreServicio: 'Facial con Oro 24K', cantidad: 1, precioUnitario: 250, montoTotal: 250, calificacionNPS: 10, esPromotor: true, comentario: 'Mi piel se ve increible!', fuenteNPS: 'qr', categoriaServicio: 'upselling' },
    { empleadoId: empMap['BAR-603'].id, propiedadId: cafeOrigenes.id, montoUpselling: 65, esUpselling: true, nombreServicio: 'Cafe de Especialidad V60', cantidad: 2, precioUnitario: 120, montoTotal: 240, calificacionNPS: 9, esPromotor: true, comentario: 'Valentina explico todo el proceso.', fuenteNPS: 'qr', categoriaServicio: 'upselling' },
  ]
  const ventas = await Promise.all(ventasData.map(v => prisma.ventaNPS.create({ data: v })))
  console.log('  ' + ventas.length + ' ventas creadas')

  // =============================================
  // 6. ALERTAS
  // =============================================
  console.log('Creando alertas de riesgo...')
  const alertas = await Promise.all([
    prisma.alertaRiesgo.create({ data: { empleadoId: empMap['REC-701'].id, propiedadId: hotelCancun.id, tipo: 'baja_felicidad', severidad: 'alto', mensaje: 'Luis Fernandez muestra indice de felicidad de 60/100 y NPS promedio de 7.8.', probabilidad: 55, generadoPorIA: true, leida: false } }),
    prisma.alertaRiesgo.create({ data: { empleadoId: empMap['BEL-102'].id, propiedadId: resortPuebla.id, tipo: 'estancamiento', severidad: 'alto', mensaje: 'Alejandro Diaz no ha mejorado sus metricas de upselling en los ultimos 3 meses.', probabilidad: 50, generadoPorIA: true, leida: false } }),
    prisma.alertaRiesgo.create({ data: { empleadoId: empMap['MES-406'].id, propiedadId: cafeOrigenes.id, tipo: 'estancamiento', severidad: 'medio', mensaje: 'Camila Ortiz lleva 3 meses en onboarding con metricas muy bajas.', probabilidad: 60, generadoPorIA: true, leida: false } }),
    prisma.alertaRiesgo.create({ data: { empleadoId: empMap['REC-802'].id, propiedadId: spaSentir.id, tipo: 'nps_bajo', severidad: 'medio', mensaje: 'Sofia Hernandez tiene NPS promedio de 8.0, por debajo del promedio del spa.', probabilidad: 45, generadoPorIA: true, leida: true } }),
    prisma.alertaRiesgo.create({ data: { empleadoId: empMap['HST-201'].id, propiedadId: restauranteTerraza.id, tipo: 'inactividad', severidad: 'medio', mensaje: 'Diana Morales no ha registrado actividad de capacitacion en las ultimas 2 semanas.', probabilidad: 40, generadoPorIA: true, leida: false } }),
    prisma.alertaRiesgo.create({ data: { empleadoId: empMap['MES-402'].id, propiedadId: hotelCancun.id, tipo: 'nps_bajo', severidad: 'bajo', mensaje: 'Roberto Sanchez tiene NPS de 8.5, ligeramente por debajo del promedio.', probabilidad: 35, generadoPorIA: true, leida: true } }),
  ])
  console.log('  ' + alertas.length + ' alertas creadas')

  // =============================================
  // 7. CANDIDATOS
  // =============================================
  console.log('Creando candidatos...')
  const candidatos = await Promise.all([
    prisma.candidatoPool.create({ data: { nombre: 'Gabriela Mendoza', email: 'gabriela.m@email.com', telefono: '+52 55 1234 5678', posicion: 'Recepcionista', region: 'cancun', experiencia: 3, habilidades: JSON.stringify(['opera', 'salesforce', 'bilingue', 'upselling']), estado: 'disponible', fuente: 'portal', puntuacionEntrevista: 85, notas: 'Candidata para reemplazo de Luis Fernandez.' } }),
    prisma.candidatoPool.create({ data: { nombre: 'Pablo Herrera', email: 'pablo.h@email.com', telefono: '+52 55 8765 4321', posicion: 'Mesero', region: 'cdmx', experiencia: 2, habilidades: JSON.stringify(['servicio', 'bilingue', 'pos']), estado: 'en_proceso', fuente: 'referido', puntuacionEntrevista: 78, notas: 'Buen potencial, necesita capacitacion en upselling.' } }),
    prisma.candidatoPool.create({ data: { nombre: 'Lucia Castillo', email: 'lucia.c@email.com', telefono: '+52 222 1111 2222', posicion: 'Bellboy', region: 'puebla', experiencia: 1, habilidades: JSON.stringify(['cliente', 'bilingue']), estado: 'disponible', fuente: 'agencia', puntuacionEntrevista: 72, notas: 'Candidata para reemplazo de Alejandro Diaz.', propiedadId: resortPuebla.id } }),
    prisma.candidatoPool.create({ data: { nombre: 'Marco Rodriguez', email: 'marco.r@email.com', telefono: '+52 55 3333 4444', posicion: 'Barista', region: 'cdmx', experiencia: 4, habilidades: JSON.stringify(['cafe_especialidad', 'latte_art', 'v60', 'bilingue']), estado: 'disponible', fuente: 'portal', puntuacionEntrevista: 90, notas: 'Barista certificado SCA.' } }),
  ])
  console.log('  ' + candidatos.length + ' candidatos creados')

  // =============================================
  // 8. INSTRUCTORES
  // =============================================
  console.log('Creando instructores...')
  const instructores = await Promise.all([
    prisma.instructor.create({ data: { nombre: 'Sommelier Rafael Torres', especialidad: 'Vinos y Maridaje', ubicacion: 'CDMX', region: 'cdmx', calificacion: 4.9, tarifaHora: 800, disponible: true } }),
    prisma.instructor.create({ data: { nombre: 'Chef Isabelle Monet', especialidad: 'Gastronomia y Servicio Fine Dining', ubicacion: 'Cancun', region: 'cancun', calificacion: 4.8, tarifaHora: 1200, disponible: true } }),
    prisma.instructor.create({ data: { nombre: 'Mixologist Daniel Cruz', especialidad: 'Cocteleria Avanzada y Bar Management', ubicacion: 'Playa del Carmen', region: 'playa_carmen', calificacion: 4.7, tarifaHora: 600, disponible: true } }),
  ])
  console.log('  ' + instructores.length + ' instructores creados')

  console.log('Seed completado exitosamente!')
  console.log('Resumen: ' + propiedades.length + ' propiedades, ' + empleados.length + ' empleados, ' + servicios.length + ' servicios, ' + capacitaciones.length + ' capacitaciones, ' + ventas.length + ' ventas, ' + alertas.length + ' alertas, ' + candidatos.length + ' candidatos, ' + instructores.length + ' instructores')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => { console.error('Error en seed:', e); await prisma.$disconnect(); process.exit(1) })
'@; $content | Out-File -FilePath 'prisma/seed.ts' -Encoding utf8 -NoNewline"

echo.
echo ============================================
echo  Archivos actualizados correctamente!
echo ============================================
echo.
echo Ahora subiendo a GitHub...
git add -A
git commit -m "Migrate to PostgreSQL/Supabase - production ready"
git branch -M main
git push -u origin main --force

echo.
echo ============================================
echo  Codigo subido a GitHub exitosamente!
echo ============================================
echo.
echo SIGUIENTE PASO: Configurar DATABASE_URL en Vercel
echo.
echo 1. Ve a https://vercel.com/dashboard
echo 2. Entra a tu proyecto HospitalityUP
echo 3. Settings ^> Environment Variables
echo 4. Agrega:
echo    Nombre:  DATABASE_URL
echo    Valor:   postgresql://postgres:@dministradoR1@db.myfnzgolubdjzofozcqo.supabase.co:5432/postgres
echo 5. Save
echo.
echo DESPUES: Crear tablas y poblar Supabase
echo.
echo Ejecuta en esta misma terminal:
echo    set DATABASE_URL=postgresql://postgres:@dministradoR1@db.myfnzgolubdjzofozcqo.supabase.co:5432/postgres
echo    npm install
echo    npx prisma generate
echo    npx prisma db push
echo    npx tsx prisma/seed.ts
echo.
pause
