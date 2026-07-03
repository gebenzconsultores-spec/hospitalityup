import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de HospitalityUP en Supabase...')

  // Limpiar datos existentes (en orden de dependencias)
  console.log('🧹 Limpiando datos previos...')
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
  // 1. PROPIEDADES (6 propiedades en zonas turísticas)
  // =============================================
  console.log('🏨 Creando propiedades...')
  const propiedades = await Promise.all([
    prisma.propiedad.create({
      data: {
        nombre: 'Hotel Grand Cancún',
        nombreEn: 'Grand Cancún Hotel',
        tipo: 'hotel',
        ubicacion: 'Boulevard Kukulcán KM 12.5, Cancún',
        region: 'cancun',
        plan: 'growth',
        moneda: 'USD',
        activo: true,
      }
    }),
    prisma.propiedad.create({
      data: {
        nombre: 'Restaurante La Terraza',
        nombreEn: 'The Terrace Restaurant',
        tipo: 'restaurante',
        ubicacion: 'Av. Reforma 222, CDMX',
        region: 'cdmx',
        plan: 'boutique',
        moneda: 'MXN',
        activo: true,
      }
    }),
    prisma.propiedad.create({
      data: {
        nombre: 'Bar Mar Caribe',
        nombreEn: 'Caribbean Sea Bar',
        tipo: 'bar',
        ubicacion: 'Zona Hotelera, Playa del Carmen',
        region: 'playa_carmen',
        plan: 'boutique',
        moneda: 'USD',
        activo: true,
      }
    }),
    prisma.propiedad.create({
      data: {
        nombre: 'Spa Sentir',
        nombreEn: 'Feel Spa',
        tipo: 'spa',
        ubicacion: 'Fraccionamiento Club Alta, Los Cabos',
        region: 'los_cabos',
        plan: 'growth',
        moneda: 'USD',
        activo: true,
      }
    }),
    prisma.propiedad.create({
      data: {
        nombre: 'Resort Sol Puebla',
        nombreEn: 'Sun Puebla Resort',
        tipo: 'resort',
        ubicacion: 'Calle 5 de Mayo 100, Puebla',
        region: 'puebla',
        plan: 'enterprise',
        moneda: 'MXN',
        activo: true,
      }
    }),
    prisma.propiedad.create({
      data: {
        nombre: 'Café Orígenes',
        nombreEn: 'Origins Coffee',
        tipo: 'cafe',
        ubicacion: 'Col. Roma Norte 45, CDMX',
        region: 'cdmx',
        plan: 'boutique',
        moneda: 'MXN',
        activo: true,
      }
    }),
  ])

  const [hotelCancun, restauranteTerraza, barMarCaribe, spaSentir, resortPuebla, cafeOrigenes] = propiedades
  console.log(`  ✅ ${propiedades.length} propiedades creadas`)

  // =============================================
  // 2. EMPLEADOS (17 empleados con IDs internos)
  // =============================================
  console.log('👥 Creando empleados...')
  const empleados = await Promise.all([
    // Hotel Grand Cancún - 5 empleados
    prisma.empleado.create({
      data: {
        empleadoId: 'BEL-101',
        nombre: 'Carlos Mendoza',
        posicion: 'Bellboy Sr.',
        posicionEn: 'Sr. Bellboy',
        departamento: 'Conserjería',
        departamentoEn: 'Concierge',
        fechaIngreso: new Date('2021-03-15'),
        estado: 'activo',
        nivelCarrera: 3,
        rutaCarrera: 'Bellboy Jr. → Bellboy Sr. → Jefe de Conserjería',
        puntuacionConocimiento: 78,
        puntuacionVentas: 65,
        puntuacionHospitalidad: 88,
        puntuacionTotal: 77,
        totalUpselling: 1250,
        npsPromedio: 9.1,
        cursosCompletados: 4,
        cursosEnProgreso: 1,
        indiceFelicidad: 85,
        riesgoBaja: 12,
        nivelRiesgoBaja: 'bajo',
        propiedadId: hotelCancun.id,
      }
    }),
    prisma.empleado.create({
      data: {
        empleadoId: 'MES-401',
        nombre: 'Ana García López',
        posicion: 'Mesera',
        posicionEn: 'Waitress',
        departamento: 'Alimentos y Bebidas',
        departamentoEn: 'Food & Beverage',
        fechaIngreso: new Date('2022-06-01'),
        estado: 'activo',
        nivelCarrera: 2,
        rutaCarrera: 'Mesera Jr. → Mesera Sr. → Capitana → Gerente A&B',
        puntuacionConocimiento: 85,
        puntuacionVentas: 92,
        puntuacionHospitalidad: 90,
        puntuacionTotal: 89,
        totalUpselling: 4800,
        npsPromedio: 9.3,
        cursosCompletados: 6,
        cursosEnProgreso: 1,
        indiceFelicidad: 92,
        riesgoBaja: 5,
        nivelRiesgoBaja: 'bajo',
        propiedadId: hotelCancun.id,
      }
    }),
    prisma.empleado.create({
      data: {
        empleadoId: 'MES-402',
        nombre: 'Roberto Sánchez',
        posicion: 'Mesero Sr.',
        posicionEn: 'Sr. Waiter',
        departamento: 'Alimentos y Bebidas',
        departamentoEn: 'Food & Beverage',
        fechaIngreso: new Date('2020-11-10'),
        estado: 'activo',
        nivelCarrera: 3,
        rutaCarrera: 'Mesero Jr. → Mesero Sr. → Capitán → Gerente A&B',
        puntuacionConocimiento: 80,
        puntuacionVentas: 75,
        puntuacionHospitalidad: 82,
        puntuacionTotal: 79,
        totalUpselling: 2100,
        npsPromedio: 8.5,
        cursosCompletados: 5,
        indiceFelicidad: 70,
        riesgoBaja: 35,
        nivelRiesgoBaja: 'medio',
        justificacionRiesgo: 'NPS ligeramente bajo en comparación con el equipo',
        propiedadId: hotelCancun.id,
      }
    }),
    prisma.empleado.create({
      data: {
        empleadoId: 'CAP-501',
        nombre: 'María Elena Torres',
        posicion: 'Capitana',
        posicionEn: 'Captain',
        departamento: 'Alimentos y Bebidas',
        departamentoEn: 'Food & Beverage',
        fechaIngreso: new Date('2019-01-20'),
        estado: 'activo',
        nivelCarrera: 4,
        rutaCarrera: 'Mesera → Capitana → Gerente A&B',
        puntuacionConocimiento: 90,
        puntuacionVentas: 88,
        puntuacionHospitalidad: 95,
        puntuacionTotal: 91,
        totalUpselling: 6200,
        npsPromedio: 9.6,
        cursosCompletados: 8,
        indiceFelicidad: 94,
        riesgoBaja: 3,
        nivelRiesgoBaja: 'bajo',
        propiedadId: hotelCancun.id,
      }
    }),
    prisma.empleado.create({
      data: {
        empleadoId: 'REC-701',
        nombre: 'Luis Fernández',
        posicion: 'Recepcionista',
        posicionEn: 'Receptionist',
        departamento: 'Recepción',
        departamentoEn: 'Front Desk',
        fechaIngreso: new Date('2023-02-14'),
        estado: 'activo',
        nivelCarrera: 1,
        rutaCarrera: 'Recepcionista Jr. → Recepcionista Sr. → Gerente Recepción',
        puntuacionConocimiento: 60,
        puntuacionVentas: 55,
        puntuacionHospitalidad: 72,
        puntuacionTotal: 62,
        totalUpselling: 400,
        npsPromedio: 7.8,
        cursosCompletados: 2,
        cursosEnProgreso: 2,
        indiceFelicidad: 60,
        riesgoBaja: 55,
        nivelRiesgoBaja: 'alto',
        justificacionRiesgo: 'Empleado nuevo con bajo rendimiento y felicidad decreciente',
        sugerenciaCapacitacion: 'Curso de hospitalidad y técnicas de upselling para recepcionistas',
        propiedadId: hotelCancun.id,
      }
    }),

    // Restaurante La Terraza - 3 empleados
    prisma.empleado.create({
      data: {
        empleadoId: 'MES-403',
        nombre: 'Patricia Ruiz',
        posicion: 'Mesera',
        posicionEn: 'Waitress',
        departamento: 'Alimentos y Bebidas',
        departamentoEn: 'Food & Beverage',
        fechaIngreso: new Date('2022-09-01'),
        estado: 'activo',
        nivelCarrera: 2,
        rutaCarrera: 'Mesera Jr. → Mesera Sr. → Capitana',
        puntuacionConocimiento: 76,
        puntuacionVentas: 88,
        puntuacionHospitalidad: 85,
        puntuacionTotal: 83,
        totalUpselling: 3200,
        npsPromedio: 8.9,
        cursosCompletados: 4,
        indiceFelicidad: 82,
        riesgoBaja: 15,
        nivelRiesgoBaja: 'bajo',
        propiedadId: restauranteTerraza.id,
      }
    }),
    prisma.empleado.create({
      data: {
        empleadoId: 'BAR-601',
        nombre: 'Jorge Ramírez',
        posicion: 'Bartender',
        posicionEn: 'Bartender',
        departamento: 'Alimentos y Bebidas',
        departamentoEn: 'Food & Beverage',
        fechaIngreso: new Date('2021-05-20'),
        estado: 'activo',
        nivelCarrera: 3,
        rutaCarrera: 'Barback → Bartender Jr. → Bartender Sr. → Bar Manager',
        puntuacionConocimiento: 92,
        puntuacionVentas: 95,
        puntuacionHospitalidad: 88,
        puntuacionTotal: 92,
        totalUpselling: 5600,
        npsPromedio: 9.2,
        cursosCompletados: 7,
        indiceFelicidad: 90,
        riesgoBaja: 8,
        nivelRiesgoBaja: 'bajo',
        propiedadId: restauranteTerraza.id,
      }
    }),
    prisma.empleado.create({
      data: {
        empleadoId: 'HST-201',
        nombre: 'Diana Morales',
        posicion: 'Hostess',
        posicionEn: 'Hostess',
        departamento: 'Alimentos y Bebidas',
        departamentoEn: 'Food & Beverage',
        fechaIngreso: new Date('2023-08-15'),
        estado: 'onboarding',
        nivelCarrera: 1,
        rutaCarrera: 'Hostess → Capitana → Gerente A&B',
        puntuacionConocimiento: 45,
        puntuacionVentas: 30,
        puntuacionHospitalidad: 60,
        puntuacionTotal: 45,
        totalUpselling: 100,
        npsPromedio: 7.0,
        cursosCompletados: 1,
        cursosEnProgreso: 3,
        indiceFelicidad: 65,
        riesgoBaja: 40,
        nivelRiesgoBaja: 'medio',
        justificacionRiesgo: 'Empleado en onboarding con métricas bajas iniciales',
        sugerenciaCapacitacion: 'Programa de onboarding acelerado + curso de hospitalidad básica',
        propiedadId: restauranteTerraza.id,
      }
    }),

    // Bar Mar Caribe - 2 empleados
    prisma.empleado.create({
      data: {
        empleadoId: 'BAR-602',
        nombre: 'Miguel Ángel Cruz',
        posicion: 'Bartender Sr.',
        posicionEn: 'Sr. Bartender',
        departamento: 'Alimentos y Bebidas',
        departamentoEn: 'Food & Beverage',
        fechaIngreso: new Date('2020-03-10'),
        estado: 'activo',
        nivelCarrera: 4,
        rutaCarrera: 'Bartender → Bartender Sr. → Bar Manager → Director A&B',
        puntuacionConocimiento: 95,
        puntuacionVentas: 90,
        puntuacionHospitalidad: 87,
        puntuacionTotal: 91,
        totalUpselling: 7200,
        npsPromedio: 9.4,
        cursosCompletados: 9,
        indiceFelicidad: 88,
        riesgoBaja: 10,
        nivelRiesgoBaja: 'bajo',
        propiedadId: barMarCaribe.id,
      }
    }),
    prisma.empleado.create({
      data: {
        empleadoId: 'MES-404',
        nombre: 'Laura Gutiérrez',
        posicion: 'Mesera',
        posicionEn: 'Waitress',
        departamento: 'Alimentos y Bebidas',
        departamentoEn: 'Food & Beverage',
        fechaIngreso: new Date('2022-01-15'),
        estado: 'activo',
        nivelCarrera: 2,
        rutaCarrera: 'Mesera Jr. → Mesera Sr. → Capitana',
        puntuacionConocimiento: 70,
        puntuacionVentas: 72,
        puntuacionHospitalidad: 78,
        puntuacionTotal: 73,
        totalUpselling: 1800,
        npsPromedio: 8.2,
        cursosCompletados: 3,
        indiceFelicidad: 75,
        riesgoBaja: 25,
        nivelRiesgoBaja: 'bajo',
        propiedadId: barMarCaribe.id,
      }
    }),

    // Spa Sentir - 2 empleados
    prisma.empleado.create({
      data: {
        empleadoId: 'TER-801',
        nombre: 'Isabella Vargas',
        posicion: 'Terapeuta Sr.',
        posicionEn: 'Sr. Therapist',
        departamento: 'Spa y Bienestar',
        departamentoEn: 'Spa & Wellness',
        fechaIngreso: new Date('2020-07-01'),
        estado: 'activo',
        nivelCarrera: 3,
        rutaCarrera: 'Terapeuta → Terapeuta Sr. → Coordinadora Spa → Directora Spa',
        puntuacionConocimiento: 94,
        puntuacionVentas: 80,
        puntuacionHospitalidad: 96,
        puntuacionTotal: 90,
        totalUpselling: 3800,
        npsPromedio: 9.7,
        cursosCompletados: 7,
        indiceFelicidad: 93,
        riesgoBaja: 4,
        nivelRiesgoBaja: 'bajo',
        propiedadId: spaSentir.id,
      }
    }),
    prisma.empleado.create({
      data: {
        empleadoId: 'REC-802',
        nombre: 'Sofía Hernández',
        posicion: 'Recepcionista Spa',
        posicionEn: 'Spa Receptionist',
        departamento: 'Spa y Bienestar',
        departamentoEn: 'Spa & Wellness',
        fechaIngreso: new Date('2023-04-01'),
        estado: 'activo',
        nivelCarrera: 1,
        rutaCarrera: 'Recepcionista → Coordinadora Spa',
        puntuacionConocimiento: 55,
        puntuacionVentas: 62,
        puntuacionHospitalidad: 75,
        puntuacionTotal: 64,
        totalUpselling: 600,
        npsPromedio: 8.0,
        cursosCompletados: 2,
        cursosEnProgreso: 1,
        indiceFelicidad: 68,
        riesgoBaja: 45,
        nivelRiesgoBaja: 'medio',
        justificacionRiesgo: 'Rendimiento por debajo del promedio del equipo y felicidad decreciente',
        sugerenciaCapacitacion: 'Mentoría con Isabella Vargas + curso de ventas en spa',
        propiedadId: spaSentir.id,
      }
    }),

    // Resort Sol Puebla - 3 empleados
    prisma.empleado.create({
      data: {
        empleadoId: 'MES-405',
        nombre: 'Fernando Castillo',
        posicion: 'Capitán',
        posicionEn: 'Captain',
        departamento: 'Alimentos y Bebidas',
        departamentoEn: 'Food & Beverage',
        fechaIngreso: new Date('2018-10-01'),
        estado: 'activo',
        nivelCarrera: 4,
        rutaCarrera: 'Mesero → Capitán → Gerente A&B → Director Operaciones',
        puntuacionConocimiento: 88,
        puntuacionVentas: 85,
        puntuacionHospitalidad: 90,
        puntuacionTotal: 88,
        totalUpselling: 5500,
        npsPromedio: 9.1,
        cursosCompletados: 8,
        indiceFelicidad: 87,
        riesgoBaja: 7,
        nivelRiesgoBaja: 'bajo',
        propiedadId: resortPuebla.id,
      }
    }),
    prisma.empleado.create({
      data: {
        empleadoId: 'BEL-102',
        nombre: 'Alejandro Díaz',
        posicion: 'Bellboy',
        posicionEn: 'Bellboy',
        departamento: 'Conserjería',
        departamentoEn: 'Concierge',
        fechaIngreso: new Date('2022-12-01'),
        estado: 'activo',
        nivelCarrera: 2,
        rutaCarrera: 'Bellboy Jr. → Bellboy Sr. → Jefe de Conserjería',
        puntuacionConocimiento: 65,
        puntuacionVentas: 58,
        puntuacionHospitalidad: 72,
        puntuacionTotal: 65,
        totalUpselling: 700,
        npsPromedio: 8.0,
        cursosCompletados: 3,
        indiceFelicidad: 62,
        riesgoBaja: 50,
        nivelRiesgoBaja: 'alto',
        justificacionRiesgo: 'Bajo upselling y felicidad decreciente en los últimos 3 meses',
        sugerenciaCapacitacion: 'Capacitación en técnicas de upselling para conserjería',
        propiedadId: resortPuebla.id,
      }
    }),
    prisma.empleado.create({
      data: {
        empleadoId: 'COC-901',
        nombre: 'Ricardo Moreno',
        posicion: 'Chef de Partie',
        posicionEn: 'Chef de Partie',
        departamento: 'Cocina',
        departamentoEn: 'Kitchen',
        fechaIngreso: new Date('2019-06-15'),
        estado: 'activo',
        nivelCarrera: 3,
        rutaCarrera: 'Commis → Demi Chef → Chef de Partie → Sous Chef → Head Chef',
        puntuacionConocimiento: 91,
        puntuacionVentas: 60,
        puntuacionHospitalidad: 70,
        puntuacionTotal: 74,
        totalUpselling: 900,
        npsPromedio: 8.3,
        cursosCompletados: 6,
        indiceFelicidad: 78,
        riesgoBaja: 20,
        nivelRiesgoBaja: 'bajo',
        propiedadId: resortPuebla.id,
      }
    }),

    // Café Orígenes - 2 empleados
    prisma.empleado.create({
      data: {
        empleadoId: 'BAR-603',
        nombre: 'Valentina Ríos',
        posicion: 'Barista',
        posicionEn: 'Barista',
        departamento: 'Alimentos y Bebidas',
        departamentoEn: 'Food & Beverage',
        fechaIngreso: new Date('2022-04-01'),
        estado: 'activo',
        nivelCarrera: 2,
        rutaCarrera: 'Barista Jr. → Barista Sr. → Shift Manager → Store Manager',
        puntuacionConocimiento: 82,
        puntuacionVentas: 78,
        puntuacionHospitalidad: 85,
        puntuacionTotal: 82,
        totalUpselling: 1500,
        npsPromedio: 8.8,
        cursosCompletados: 4,
        indiceFelicidad: 80,
        riesgoBaja: 18,
        nivelRiesgoBaja: 'bajo',
        propiedadId: cafeOrigenes.id,
      }
    }),
    prisma.empleado.create({
      data: {
        empleadoId: 'MES-406',
        nombre: 'Camila Ortiz',
        posicion: 'Mesera',
        posicionEn: 'Waitress',
        departamento: 'Alimentos y Bebidas',
        departamentoEn: 'Food & Beverage',
        fechaIngreso: new Date('2023-09-01'),
        estado: 'onboarding',
        nivelCarrera: 1,
        rutaCarrera: 'Mesera Jr. → Mesera Sr. → Shift Manager',
        puntuacionConocimiento: 40,
        puntuacionVentas: 35,
        puntuacionHospitalidad: 55,
        puntuacionTotal: 43,
        totalUpselling: 50,
        npsPromedio: 7.2,
        cursosCompletados: 0,
        cursosEnProgreso: 3,
        indiceFelicidad: 55,
        riesgoBaja: 60,
        nivelRiesgoBaja: 'alto',
        justificacionRiesgo: 'Empleado nueva en onboarding con métricas muy bajas y baja felicidad',
        sugerenciaCapacitacion: 'Programa de onboarding intensivo + asignación de mentor',
        propiedadId: cafeOrigenes.id,
      }
    }),
  ])

  console.log(`  ✅ ${empleados.length} empleados creados`)

  // Encontrar empleados por ID para referencias
  const empMap: Record<string, typeof empleados[0]> = {}
  for (const emp of empleados) {
    empMap[emp.empleadoId] = emp
  }

  // =============================================
  // 3. SERVICIOS (36 servicios con categorías y upselling)
  // =============================================
  console.log('📋 Creando servicios...')
  const serviciosData = [
    // Hotel Grand Cancún
    { nombre: 'Habitación Deluxe Mar', nombreEn: 'Deluxe Ocean Room', categoria: 'habitacion', precio: 350, esUpselling: false, propiedadId: hotelCancun.id },
    { nombre: 'Upgrade Suite Presidencial', nombreEn: 'Presidential Suite Upgrade', categoria: 'habitacion', precio: 800, precioUpselling: 1200, esUpselling: true, objetivoUpselling: 'Upgrade de Deluxe a Suite Presidencial con vista panorámica', objetivoUpsellingEn: 'Upgrade from Deluxe to Presidential Suite with panoramic view', propiedadId: hotelCancun.id },
    { nombre: 'Tour Isla Mujeres', nombreEn: 'Isla Mujeres Tour', categoria: 'tour', precio: 120, esUpselling: false, propiedadId: hotelCancun.id },
    { nombre: 'Tour Isla Mujeres Premium', nombreEn: 'Premium Isla Mujeres Tour', categoria: 'tour', precio: 120, precioUpselling: 220, esUpselling: true, objetivoUpselling: 'Upgrade a tour premium con lunch y open bar', objetivoUpsellingEn: 'Upgrade to premium tour with lunch and open bar', propiedadId: hotelCancun.id },
    { nombre: 'Desbuffet Internacional', nombreEn: 'International Breakfast Buffet', categoria: 'platillo', precio: 35, esUpselling: false, propiedadId: hotelCancun.id },
    { nombre: 'Maridaje Vinos Premium', nombreEn: 'Premium Wine Pairing', categoria: 'platillo', precio: 35, precioUpselling: 85, esUpselling: true, objetivoUpselling: 'Agregar maridaje de vinos premium al desayuno', objetivoUpsellingEn: 'Add premium wine pairing to breakfast', propiedadId: hotelCancun.id },
    { nombre: 'Cena en la Playa', nombreEn: 'Beach Dinner', categoria: 'experiencia', precio: 250, precioUpselling: 450, esUpselling: true, objetivoUpselling: 'Cena romántica privada en la playa con chef personal', objetivoUpsellingEn: 'Private romantic beach dinner with personal chef', propiedadId: hotelCancun.id },

    // Restaurante La Terraza
    { nombre: 'Filete Mignon', nombreEn: 'Filet Mignon', categoria: 'platillo', precio: 480, esUpselling: false, propiedadId: restauranteTerraza.id },
    { nombre: 'Maridaje Vinos Reserva', nombreEn: 'Reserve Wine Pairing', categoria: 'platillo', precio: 480, precioUpselling: 780, esUpselling: true, objetivoUpselling: 'Agregar maridaje de vinos de reserva al filete', objetivoUpsellingEn: 'Add reserve wine pairing to the filet', propiedadId: restauranteTerraza.id },
    { nombre: 'Pasta Trufa Negra', nombreEn: 'Black Truffle Pasta', categoria: 'platillo', precio: 380, esUpselling: false, propiedadId: restauranteTerraza.id },
    { nombre: 'Cocktail Artesanal', nombreEn: 'Artisan Cocktail', categoria: 'bebida', precio: 180, esUpselling: false, propiedadId: restauranteTerraza.id },
    { nombre: 'Menú Degustación 7 Tiempos', nombreEn: '7-Course Tasting Menu', categoria: 'experiencia', precio: 1200, precioUpselling: 1800, esUpselling: true, objetivoUpselling: 'Upgrade a menú degustación con maridaje de vinos', objetivoUpsellingEn: 'Upgrade to tasting menu with wine pairing', propiedadId: restauranteTerraza.id },
    { nombre: 'Postre del Chef', nombreEn: "Chef's Dessert", categoria: 'platillo', precio: 150, precioUpselling: 250, esUpselling: true, objetivoUpselling: 'Agregar postre especial del chef con licor', objetivoUpsellingEn: 'Add special chef dessert with liqueur', propiedadId: restauranteTerraza.id },

    // Bar Mar Caribe
    { nombre: 'Margarita Clásica', nombreEn: 'Classic Margarita', categoria: 'bebida', precio: 12, esUpselling: false, propiedadId: barMarCaribe.id },
    { nombre: 'Margarita Premium Don Julio', nombreEn: 'Premium Don Julio Margarita', categoria: 'bebida', precio: 12, precioUpselling: 28, esUpselling: true, objetivoUpselling: 'Upgrade a tequila premium Don Julio 1942', objetivoUpsellingEn: 'Upgrade to premium Don Julio 1942 tequila', propiedadId: barMarCaribe.id },
    { nombre: 'Cerveza Artesanal', nombreEn: 'Craft Beer', categoria: 'bebida', precio: 8, esUpselling: false, propiedadId: barMarCaribe.id },
    { nombre: 'Flight de Cervezas', nombreEn: 'Beer Flight', categoria: 'bebida', precio: 8, precioUpselling: 22, esUpselling: true, objetivoUpselling: 'Ofrecer flight de 4 cervezas artesanales en lugar de una', objetivoUpsellingEn: 'Offer flight of 4 craft beers instead of one', propiedadId: barMarCaribe.id },
    { nombre: 'Tapas del Mar', nombreEn: 'Sea Tapas', categoria: 'platillo', precio: 18, esUpselling: false, propiedadId: barMarCaribe.id },
    { nombre: 'Tabla de Mariscos Premium', nombreEn: 'Premium Seafood Platter', categoria: 'platillo', precio: 18, precioUpselling: 55, esUpselling: true, objetivoUpselling: 'Upgrade a tabla premium con ostras y caviar', objetivoUpsellingEn: 'Upgrade to premium platter with oysters and caviar', propiedadId: barMarCaribe.id },

    // Spa Sentir
    { nombre: 'Masaje Relajante 60min', nombreEn: 'Relaxing Massage 60min', categoria: 'masaje', precio: 150, esUpselling: false, propiedadId: spaSentir.id },
    { nombre: 'Masaje Hot Stones 90min', nombreEn: 'Hot Stones Massage 90min', categoria: 'masaje', precio: 150, precioUpselling: 280, esUpselling: true, objetivoUpselling: 'Upgrade a masaje de piedras calientes de 90 min', objetivoUpsellingEn: 'Upgrade to 90 min hot stones massage', propiedadId: spaSentir.id },
    { nombre: 'Facial Básico', nombreEn: 'Basic Facial', categoria: 'masaje', precio: 100, esUpselling: false, propiedadId: spaSentir.id },
    { nombre: 'Facial con Oro 24K', nombreEn: '24K Gold Facial', categoria: 'masaje', precio: 100, precioUpselling: 250, esUpselling: true, objetivoUpselling: 'Upgrade a facial premium con oro de 24 quilates', objetivoUpsellingEn: 'Upgrade to premium 24K gold facial', propiedadId: spaSentir.id },
    { nombre: 'Paquete Spa Day', nombreEn: 'Spa Day Package', categoria: 'paquete', precio: 350, precioUpselling: 550, esUpselling: true, objetivoUpselling: 'Agregar acceso a area húmeda y lunch al paquete', objetivoUpsellingEn: 'Add wet area access and lunch to the package', propiedadId: spaSentir.id },
    { nombre: 'Aromaterapia', nombreEn: 'Aromatherapy', categoria: 'experiencia', precio: 50, precioUpselling: 90, esUpselling: true, objetivoUpselling: 'Agregar aromaterapia premium a cualquier tratamiento', objetivoUpsellingEn: 'Add premium aromatherapy to any treatment', propiedadId: spaSentir.id },

    // Resort Sol Puebla
    { nombre: 'Habitación Estándar', nombreEn: 'Standard Room', categoria: 'habitacion', precio: 180, esUpselling: false, propiedadId: resortPuebla.id },
    { nombre: 'Upgrade Suite Junior', nombreEn: 'Junior Suite Upgrade', categoria: 'habitacion', precio: 180, precioUpselling: 320, esUpselling: true, objetivoUpselling: 'Upgrade a Junior Suite con sala y balcón', objetivoUpsellingEn: 'Upgrade to Junior Suite with living room and balcony', propiedadId: resortPuebla.id },
    { nombre: 'Tour Cholula y Cantares', nombreEn: 'Cholula & Cantares Tour', categoria: 'tour', precio: 85, esUpselling: false, propiedadId: resortPuebla.id },
    { nombre: 'Experiencia Gastronómica Poblana', nombreEn: 'Pueblan Gastronomic Experience', categoria: 'experiencia', precio: 85, precioUpselling: 180, esUpselling: true, objetivoUpselling: 'Agregar experiencia gastronómica completa con clase de cocina', objetivoUpsellingEn: 'Add full gastronomic experience with cooking class', propiedadId: resortPuebla.id },
    { nombre: 'Brunch Dominical', nombreEn: 'Sunday Brunch', categoria: 'platillo', precio: 45, esUpselling: false, propiedadId: resortPuebla.id },
    { nombre: 'Brunch con Champagne', nombreEn: 'Champagne Brunch', categoria: 'platillo', precio: 45, precioUpselling: 95, esUpselling: true, objetivoUpselling: 'Upgrade a brunch con champagne ilimitado', objetivoUpsellingEn: 'Upgrade to brunch with unlimited champagne', propiedadId: resortPuebla.id },

    // Café Orígenes
    { nombre: 'Café Americano', nombreEn: 'Americano Coffee', categoria: 'bebida', precio: 55, esUpselling: false, propiedadId: cafeOrigenes.id },
    { nombre: 'Café de Especialidad V60', nombreEn: 'Specialty V60 Coffee', categoria: 'bebida', precio: 55, precioUpselling: 120, esUpselling: true, objetivoUpselling: 'Ofrecer café de especialidad preparado en V60', objetivoUpsellingEn: 'Offer specialty coffee prepared with V60 method', propiedadId: cafeOrigenes.id },
    { nombre: 'Pastel del Día', nombreEn: 'Cake of the Day', categoria: 'platillo', precio: 75, esUpselling: false, propiedadId: cafeOrigenes.id },
    { nombre: 'Repostería Artesanal 3 piezas', nombreEn: 'Artisan Pastry 3-piece', categoria: 'platillo', precio: 75, precioUpselling: 160, esUpselling: true, objetivoUpselling: 'Ofrecer selección de 3 reposterías artesanales', objetivoUpsellingEn: 'Offer selection of 3 artisan pastries', propiedadId: cafeOrigenes.id },
  ]

  const servicios = await Promise.all(
    serviciosData.map(s => prisma.servicio.create({ data: s }))
  )
  console.log(`  ✅ ${servicios.length} servicios creados`)

  // =============================================
  // 4. CAPACITACIONES (8 cursos)
  // =============================================
  console.log('📚 Creando capacitaciones...')
  const capacitaciones = await Promise.all([
    prisma.capacitacion.create({
      data: {
        titulo: 'Técnicas de Upselling en Hospitalidad',
        tituloEn: 'Hospitality Upselling Techniques',
        descripcion: 'Aprende las mejores técnicas para incrementar ventas sugiriendo upgrades y servicios premium a los huéspedes.',
        descripcionEn: 'Learn the best techniques to increase sales by suggesting upgrades and premium services to guests.',
        categoria: 'upselling',
        categoriaEn: 'upselling',
        modalidad: 'virtual',
        duracion: 45,
        dificultad: 'intermedio',
        dificultadEn: 'intermediate',
        puntos: 15,
        activo: true,
        posicion: 'Mesero / Bartender',
        posicionEn: 'Waiter / Bartender',
      }
    }),
    prisma.capacitacion.create({
      data: {
        titulo: 'Hospitalidad de Clase Mundial',
        tituloEn: 'World-Class Hospitality',
        descripcion: 'Principios de servicio al cliente excepcional aplicados a la industria hotelera y restaurantera.',
        descripcionEn: 'Exceptional customer service principles applied to the hotel and restaurant industry.',
        categoria: 'hospitalidad',
        categoriaEn: 'hospitality',
        modalidad: 'presencial',
        duracion: 60,
        dificultad: 'principiante',
        dificultadEn: 'beginner',
        puntos: 10,
        activo: true,
        posicion: 'Todos los puestos',
        posicionEn: 'All positions',
      }
    }),
    prisma.capacitacion.create({
      data: {
        titulo: 'Conocimiento de Vinos y Maridaje',
        tituloEn: 'Wine Knowledge & Pairing',
        descripcion: 'Fundamentos de viticultura, variedades de uva, y técnicas de maridaje con alimentos.',
        descripcionEn: 'Fundamentals of viticulture, grape varieties, and food pairing techniques.',
        categoria: 'conocimiento_producto',
        categoriaEn: 'product_knowledge',
        modalidad: 'presencial',
        duracion: 90,
        dificultad: 'avanzado',
        dificultadEn: 'advanced',
        puntos: 20,
        activo: true,
        posicion: 'Mesero / Sommelier',
        posicionEn: 'Waiter / Sommelier',
      }
    }),
    prisma.capacitacion.create({
      data: {
        titulo: 'Onboarding: Tu Primer Día',
        tituloEn: 'Onboarding: Your First Day',
        descripcion: 'Guía completa para nuevos empleados. Cultura organizacional, políticas, y primeros pasos en tu rol.',
        descripcionEn: 'Complete guide for new employees. Organizational culture, policies, and first steps in your role.',
        categoria: 'onboarding',
        categoriaEn: 'onboarding',
        modalidad: 'virtual',
        duracion: 30,
        dificultad: 'principiante',
        dificultadEn: 'beginner',
        puntos: 5,
        activo: true,
        posicion: 'Todos los puestos',
        posicionEn: 'All positions',
      }
    }),
    prisma.capacitacion.create({
      data: {
        titulo: 'Liderazgo en el Piso',
        tituloEn: 'Floor Leadership',
        descripcion: 'Habilidades de liderazgo para capitanes y supervisores. Manejo de equipo, resolución de conflictos y estándares de servicio.',
        descripcionEn: 'Leadership skills for captains and supervisors. Team management, conflict resolution and service standards.',
        categoria: 'liderazgo',
        categoriaEn: 'leadership',
        modalidad: 'presencial',
        duracion: 120,
        dificultad: 'avanzado',
        dificultadEn: 'advanced',
        puntos: 25,
        activo: true,
        posicion: 'Capitán / Supervisor',
        posicionEn: 'Captain / Supervisor',
      }
    }),
    prisma.capacitacion.create({
      data: {
        titulo: 'Coctelería Avanzada',
        tituloEn: 'Advanced Mixology',
        descripcion: 'Técnicas avanzadas de mixología, creación de cócteles signature y presentación.',
        descripcionEn: 'Advanced mixology techniques, signature cocktail creation and presentation.',
        categoria: 'conocimiento_producto',
        categoriaEn: 'product_knowledge',
        modalidad: 'presencial',
        duracion: 90,
        dificultad: 'avanzado',
        dificultadEn: 'advanced',
        puntos: 20,
        activo: true,
        posicion: 'Bartender',
        posicionEn: 'Bartender',
      }
    }),
    prisma.capacitacion.create({
      data: {
        titulo: 'Ventas en Spa y Bienestar',
        tituloEn: 'Spa & Wellness Sales',
        descripcion: 'Técnicas de venta consultiva para servicios de spa, upselling de tratamientos y paquetes.',
        descripcionEn: 'Consultative sales techniques for spa services, treatment and package upselling.',
        categoria: 'upselling',
        categoriaEn: 'upselling',
        modalidad: 'virtual',
        duracion: 45,
        dificultad: 'intermedio',
        dificultadEn: 'intermediate',
        puntos: 15,
        activo: true,
        posicion: 'Recepcionista Spa / Terapeuta',
        posicionEn: 'Spa Receptionist / Therapist',
      }
    }),
    prisma.capacitacion.create({
      data: {
        titulo: 'Coffee Mastery: Del Grano a la Taza',
        tituloEn: 'Coffee Mastery: From Bean to Cup',
        descripcion: 'Conocimiento profundo del café: origen, tostado, métodos de extracción y latte art.',
        descripcionEn: 'Deep coffee knowledge: origin, roasting, extraction methods and latte art.',
        categoria: 'conocimiento_producto',
        categoriaEn: 'product_knowledge',
        modalidad: 'presencial',
        duracion: 75,
        dificultad: 'intermedio',
        dificultadEn: 'intermediate',
        puntos: 18,
        activo: true,
        posicion: 'Barista',
        posicionEn: 'Barista',
      }
    }),
  ])

  console.log(`  ✅ ${capacitaciones.length} capacitaciones creadas`)

  // =============================================
  // 5. EMPLEADO-CAPACITACIÓN (inscripciones)
  // =============================================
  console.log('📖 Creando inscripciones a capacitaciones...')
  const [capUpselling, capHospitalidad, capVinos, capOnboarding, capLiderazgo, capCocteleria, capSpaSales, capCoffee] = capacitaciones

  const inscripcionesData = [
    // Ana García - estrella del equipo
    { empleadoId: empMap['MES-401'].id, capacitacionId: capUpselling.id, estado: 'completado', progreso: 100, puntuacion: 95, fechaInicio: new Date('2022-08-01'), fechaCompletado: new Date('2022-08-15') },
    { empleadoId: empMap['MES-401'].id, capacitacionId: capVinos.id, estado: 'completado', progreso: 100, puntuacion: 92, fechaInicio: new Date('2023-01-10'), fechaCompletado: new Date('2023-02-01') },
    { empleadoId: empMap['MES-401'].id, capacitacionId: capHospitalidad.id, estado: 'completado', progreso: 100, puntuacion: 98, fechaInicio: new Date('2022-06-15'), fechaCompletado: new Date('2022-06-30') },
    { empleadoId: empMap['MES-401'].id, capacitacionId: capLiderazgo.id, estado: 'en_progreso', progreso: 45, fechaInicio: new Date('2024-01-15') },

    // María Elena Torres - capitana
    { empleadoId: empMap['CAP-501'].id, capacitacionId: capLiderazgo.id, estado: 'completado', progreso: 100, puntuacion: 97, fechaInicio: new Date('2020-03-01'), fechaCompletado: new Date('2020-04-01') },
    { empleadoId: empMap['CAP-501'].id, capacitacionId: capVinos.id, estado: 'completado', progreso: 100, puntuacion: 94, fechaInicio: new Date('2021-01-10'), fechaCompletado: new Date('2021-02-15') },
    { empleadoId: empMap['CAP-501'].id, capacitacionId: capUpselling.id, estado: 'completado', progreso: 100, puntuacion: 91, fechaInicio: new Date('2020-06-01'), fechaCompletado: new Date('2020-06-20') },

    // Jorge Ramírez - bartender
    { empleadoId: empMap['BAR-601'].id, capacitacionId: capCocteleria.id, estado: 'completado', progreso: 100, puntuacion: 96, fechaInicio: new Date('2021-06-01'), fechaCompletado: new Date('2021-07-15') },
    { empleadoId: empMap['BAR-601'].id, capacitacionId: capUpselling.id, estado: 'completado', progreso: 100, puntuacion: 93, fechaInicio: new Date('2022-03-01'), fechaCompletado: new Date('2022-03-20') },
    { empleadoId: empMap['BAR-601'].id, capacitacionId: capVinos.id, estado: 'completado', progreso: 100, puntuacion: 88, fechaInicio: new Date('2022-09-01'), fechaCompletado: new Date('2022-10-01') },

    // Luis Fernández - recepcionista en riesgo
    { empleadoId: empMap['REC-701'].id, capacitacionId: capOnboarding.id, estado: 'completado', progreso: 100, puntuacion: 70, fechaInicio: new Date('2023-02-14'), fechaCompletado: new Date('2023-02-20') },
    { empleadoId: empMap['REC-701'].id, capacitacionId: capHospitalidad.id, estado: 'en_progreso', progreso: 35, fechaInicio: new Date('2024-02-01') },
    { empleadoId: empMap['REC-701'].id, capacitacionId: capUpselling.id, estado: 'no_iniciado', progreso: 0 },

    // Diana Morales - hostess en onboarding
    { empleadoId: empMap['HST-201'].id, capacitacionId: capOnboarding.id, estado: 'en_progreso', progreso: 60, fechaInicio: new Date('2023-08-15') },
    { empleadoId: empMap['HST-201'].id, capacitacionId: capHospitalidad.id, estado: 'en_progreso', progreso: 20, fechaInicio: new Date('2023-09-01') },
    { empleadoId: empMap['HST-201'].id, capacitacionId: capUpselling.id, estado: 'no_iniciado', progreso: 0 },

    // Isabella Vargas - terapeuta estrella
    { empleadoId: empMap['TER-801'].id, capacitacionId: capSpaSales.id, estado: 'completado', progreso: 100, puntuacion: 98, fechaInicio: new Date('2021-01-01'), fechaCompletado: new Date('2021-01-20') },
    { empleadoId: empMap['TER-801'].id, capacitacionId: capHospitalidad.id, estado: 'completado', progreso: 100, puntuacion: 99, fechaInicio: new Date('2020-07-15'), fechaCompletado: new Date('2020-08-01') },
    { empleadoId: empMap['TER-801'].id, capacitacionId: capUpselling.id, estado: 'completado', progreso: 100, puntuacion: 90, fechaInicio: new Date('2022-05-01'), fechaCompletado: new Date('2022-05-20') },

    // Sofía Hernández - recepcionista spa en riesgo
    { empleadoId: empMap['REC-802'].id, capacitacionId: capOnboarding.id, estado: 'completado', progreso: 100, puntuacion: 72, fechaInicio: new Date('2023-04-01'), fechaCompletado: new Date('2023-04-10') },
    { empleadoId: empMap['REC-802'].id, capacitacionId: capSpaSales.id, estado: 'en_progreso', progreso: 40, fechaInicio: new Date('2024-01-15') },

    // Miguel Ángel Cruz - bartender sr
    { empleadoId: empMap['BAR-602'].id, capacitacionId: capCocteleria.id, estado: 'completado', progreso: 100, puntuacion: 99, fechaInicio: new Date('2020-04-01'), fechaCompletado: new Date('2020-05-15') },
    { empleadoId: empMap['BAR-602'].id, capacitacionId: capLiderazgo.id, estado: 'completado', progreso: 100, puntuacion: 90, fechaInicio: new Date('2022-01-10'), fechaCompletado: new Date('2022-03-01') },
    { empleadoId: empMap['BAR-602'].id, capacitacionId: capVinos.id, estado: 'completado', progreso: 100, puntuacion: 85, fechaInicio: new Date('2021-06-01'), fechaCompletado: new Date('2021-07-01') },

    // Valentina Ríos - barista
    { empleadoId: empMap['BAR-603'].id, capacitacionId: capCoffee.id, estado: 'completado', progreso: 100, puntuacion: 92, fechaInicio: new Date('2022-04-15'), fechaCompletado: new Date('2022-06-01') },
    { empleadoId: empMap['BAR-603'].id, capacitacionId: capUpselling.id, estado: 'completado', progreso: 100, puntuacion: 85, fechaInicio: new Date('2023-03-01'), fechaCompletado: new Date('2023-03-20') },

    // Camila Ortiz - nueva en onboarding
    { empleadoId: empMap['MES-406'].id, capacitacionId: capOnboarding.id, estado: 'en_progreso', progreso: 30, fechaInicio: new Date('2023-09-01') },
    { empleadoId: empMap['MES-406'].id, capacitacionId: capHospitalidad.id, estado: 'en_progreso', progreso: 10, fechaInicio: new Date('2023-09-15') },
    { empleadoId: empMap['MES-406'].id, capacitacionId: capCoffee.id, estado: 'no_iniciado', progreso: 0 },

    // Fernando Castillo - capitán resort
    { empleadoId: empMap['MES-405'].id, capacitacionId: capLiderazgo.id, estado: 'completado', progreso: 100, puntuacion: 93, fechaInicio: new Date('2019-03-01'), fechaCompletado: new Date('2019-04-15') },
    { empleadoId: empMap['MES-405'].id, capacitacionId: capVinos.id, estado: 'completado', progreso: 100, puntuacion: 90, fechaInicio: new Date('2020-01-10'), fechaCompletado: new Date('2020-02-15') },

    // Roberto Sánchez
    { empleadoId: empMap['MES-402'].id, capacitacionId: capHospitalidad.id, estado: 'completado', progreso: 100, puntuacion: 82, fechaInicio: new Date('2021-01-15'), fechaCompletado: new Date('2021-02-01') },
    { empleadoId: empMap['MES-402'].id, capacitacionId: capUpselling.id, estado: 'completado', progreso: 100, puntuacion: 78, fechaInicio: new Date('2021-06-01'), fechaCompletado: new Date('2021-06-20') },
    { empleadoId: empMap['MES-402'].id, capacitacionId: capVinos.id, estado: 'en_progreso', progreso: 55, fechaInicio: new Date('2024-01-10') },

    // Carlos Mendoza - bellboy
    { empleadoId: empMap['BEL-101'].id, capacitacionId: capHospitalidad.id, estado: 'completado', progreso: 100, puntuacion: 90, fechaInicio: new Date('2021-04-01'), fechaCompletado: new Date('2021-04-20') },
    { empleadoId: empMap['BEL-101'].id, capacitacionId: capUpselling.id, estado: 'completado', progreso: 100, puntuacion: 75, fechaInicio: new Date('2022-02-01'), fechaCompletado: new Date('2022-02-20') },
    { empleadoId: empMap['BEL-101'].id, capacitacionId: capLiderazgo.id, estado: 'en_progreso', progreso: 20, fechaInicio: new Date('2024-02-01') },

    // Patricia Ruiz
    { empleadoId: empMap['MES-403'].id, capacitacionId: capHospitalidad.id, estado: 'completado', progreso: 100, puntuacion: 88, fechaInicio: new Date('2022-10-01'), fechaCompletado: new Date('2022-10-20') },
    { empleadoId: empMap['MES-403'].id, capacitacionId: capUpselling.id, estado: 'completado', progreso: 100, puntuacion: 90, fechaInicio: new Date('2023-01-15'), fechaCompletado: new Date('2023-02-01') },

    // Alejandro Díaz - bellboy en riesgo
    { empleadoId: empMap['BEL-102'].id, capacitacionId: capOnboarding.id, estado: 'completado', progreso: 100, puntuacion: 68, fechaInicio: new Date('2022-12-01'), fechaCompletado: new Date('2022-12-10') },
    { empleadoId: empMap['BEL-102'].id, capacitacionId: capHospitalidad.id, estado: 'completado', progreso: 100, puntuacion: 72, fechaInicio: new Date('2023-03-01'), fechaCompletado: new Date('2023-03-20') },
    { empleadoId: empMap['BEL-102'].id, capacitacionId: capUpselling.id, estado: 'en_progreso', progreso: 50, fechaInicio: new Date('2024-01-20') },
  ]

  const inscripciones = await Promise.all(
    inscripcionesData.map(i => prisma.empleadoCapacitacion.create({ data: i }))
  )
  console.log(`  ✅ ${inscripciones.length} inscripciones a capacitaciones creadas`)

  // =============================================
  // 6. VENTAS NPS (25 ventas con calificaciones)
  // =============================================
  console.log('💰 Creando ventas con NPS...')
  const ventasData = [
    // Hotel Grand Cancún - Ana García (MES-401) - estrella
    { empleadoId: empMap['MES-401'].id, propiedadId: hotelCancun.id, montoUpselling: 400, esUpselling: true, nombreServicio: 'Upgrade Suite Presidencial', cantidad: 1, precioUnitario: 1200, montoTotal: 1200, calificacionNPS: 10, esPromotor: true, comentario: '¡Increíble upgrade! Ana fue muy atenta.', fuenteNPS: 'qr', categoriaServicio: 'upgrade_habitacion' },
    { empleadoId: empMap['MES-401'].id, propiedadId: hotelCancun.id, montoUpselling: 100, esUpselling: true, nombreServicio: 'Maridaje Vinos Premium', cantidad: 2, precioUnitario: 85, montoTotal: 170, calificacionNPS: 9, esPromotor: true, comentario: 'Excelente sugerencia de maridaje.', fuenteNPS: 'sms', categoriaServicio: 'upselling' },
    { empleadoId: empMap['MES-401'].id, propiedadId: hotelCancun.id, montoUpselling: 0, esUpselling: false, nombreServicio: 'Desbuffet Internacional', cantidad: 2, precioUnitario: 35, montoTotal: 70, calificacionNPS: 9, esPromotor: true, fuenteNPS: 'qr', categoriaServicio: 'menu' },
    { empleadoId: empMap['MES-401'].id, propiedadId: hotelCancun.id, montoUpselling: 200, esUpselling: true, nombreServicio: 'Cena en la Playa', cantidad: 1, precioUnitario: 450, montoTotal: 450, calificacionNPS: 10, esPromotor: true, comentario: 'La mejor cena de mi vida. ¡Gracias Ana!', fuenteNPS: 'app', categoriaServicio: 'experiencia' },
    { empleadoId: empMap['MES-401'].id, propiedadId: hotelCancun.id, montoUpselling: 100, esUpselling: true, nombreServicio: 'Tour Isla Mujeres Premium', cantidad: 2, precioUnitario: 220, montoTotal: 440, calificacionNPS: 8, esPromotor: false, fuenteNPS: 'email', categoriaServicio: 'tour' },

    // Hotel Grand Cancún - Roberto Sánchez (MES-402)
    { empleadoId: empMap['MES-402'].id, propiedadId: hotelCancun.id, montoUpselling: 0, esUpselling: false, nombreServicio: 'Desbuffet Internacional', cantidad: 3, precioUnitario: 35, montoTotal: 105, calificacionNPS: 8, esPromotor: false, fuenteNPS: 'qr', categoriaServicio: 'menu' },
    { empleadoId: empMap['MES-402'].id, propiedadId: hotelCancun.id, montoUpselling: 85, esUpselling: true, nombreServicio: 'Maridaje Vinos Premium', cantidad: 1, precioUnitario: 85, montoTotal: 85, calificacionNPS: 7, esPromotor: false, comentario: 'Buen maridaje pero demoró un poco.', fuenteNPS: 'sms', categoriaServicio: 'upselling' },
    { empleadoId: empMap['MES-402'].id, propiedadId: hotelCancun.id, montoUpselling: 0, esUpselling: false, nombreServicio: 'Tour Isla Mujeres', cantidad: 2, precioUnitario: 120, montoTotal: 240, calificacionNPS: 9, esPromotor: true, fuenteNPS: 'app', categoriaServicio: 'tour' },

    // Hotel Grand Cancún - María Elena Torres (CAP-501)
    { empleadoId: empMap['CAP-501'].id, propiedadId: hotelCancun.id, montoUpselling: 800, esUpselling: true, nombreServicio: 'Cena en la Playa VIP', cantidad: 2, precioUnitario: 650, montoTotal: 1300, calificacionNPS: 10, esPromotor: true, comentario: '¡María Elena hizo que nuestra luna de miel fuera inolvidable!', fuenteNPS: 'app', categoriaServicio: 'experiencia' },
    { empleadoId: empMap['CAP-501'].id, propiedadId: hotelCancun.id, montoUpselling: 400, esUpselling: true, nombreServicio: 'Upgrade Suite Presidencial', cantidad: 1, precioUnitario: 1200, montoTotal: 1200, calificacionNPS: 10, esPromotor: true, fuenteNPS: 'qr', categoriaServicio: 'upgrade_habitacion' },

    // Hotel Grand Cancún - Carlos Mendoza (BEL-101)
    { empleadoId: empMap['BEL-101'].id, propiedadId: hotelCancun.id, montoUpselling: 100, esUpselling: true, nombreServicio: 'Tour Isla Mujeres Premium', cantidad: 1, precioUnitario: 220, montoTotal: 220, calificacionNPS: 9, esPromotor: true, comentario: 'Carlos nos recomendó el tour premium, ¡gran decisión!', fuenteNPS: 'qr', categoriaServicio: 'tour' },
    { empleadoId: empMap['BEL-101'].id, propiedadId: hotelCancun.id, montoUpselling: 0, esUpselling: false, nombreServicio: 'Tour Isla Mujeres', cantidad: 1, precioUnitario: 120, montoTotal: 120, calificacionNPS: 8, esPromotor: false, fuenteNPS: 'sms', categoriaServicio: 'tour' },

    // Hotel Grand Cancún - Luis Fernández (REC-701) - en riesgo
    { empleadoId: empMap['REC-701'].id, propiedadId: hotelCancun.id, montoUpselling: 0, esUpselling: false, nombreServicio: 'Habitación Deluxe Mar', cantidad: 1, precioUnitario: 350, montoTotal: 350, calificacionNPS: 7, esPromotor: false, comentario: 'El check-in fue lento.', fuenteNPS: 'email', categoriaServicio: 'menu' },
    { empleadoId: empMap['REC-701'].id, propiedadId: hotelCancun.id, montoUpselling: 0, esUpselling: false, nombreServicio: 'Habitación Deluxe Mar', cantidad: 1, precioUnitario: 350, montoTotal: 350, calificacionNPS: 6, esPromotor: false, comentario: 'No me ofrecieron opciones de upgrade.', fuenteNPS: 'qr', categoriaServicio: 'menu' },

    // Restaurante La Terraza - Jorge Ramírez (BAR-601)
    { empleadoId: empMap['BAR-601'].id, propiedadId: restauranteTerraza.id, montoUpselling: 16, esUpselling: true, nombreServicio: 'Margarita Premium Don Julio', cantidad: 4, precioUnitario: 28, montoTotal: 112, calificacionNPS: 10, esPromotor: true, comentario: '¡Los mejores margaritas! Jorge es un artista.', fuenteNPS: 'qr', categoriaServicio: 'upselling' },
    { empleadoId: empMap['BAR-601'].id, propiedadId: restauranteTerraza.id, montoUpselling: 600, esUpselling: true, nombreServicio: 'Menú Degustación 7 Tiempos', cantidad: 2, precioUnitario: 1800, montoTotal: 3600, calificacionNPS: 9, esPromotor: true, fuenteNPS: 'app', categoriaServicio: 'experiencia' },

    // Restaurante La Terraza - Patricia Ruiz (MES-403)
    { empleadoId: empMap['MES-403'].id, propiedadId: restauranteTerraza.id, montoUpselling: 300, esUpselling: true, nombreServicio: 'Maridaje Vinos Reserva', cantidad: 2, precioUnitario: 780, montoTotal: 1560, calificacionNPS: 9, esPromotor: true, comentario: 'Patricia tiene un paladar increíble para recomendar vinos.', fuenteNPS: 'qr', categoriaServicio: 'upselling' },
    { empleadoId: empMap['MES-403'].id, propiedadId: restauranteTerraza.id, montoUpselling: 0, esUpselling: false, nombreServicio: 'Filete Mignon', cantidad: 2, precioUnitario: 480, montoTotal: 960, calificacionNPS: 8, esPromotor: false, fuenteNPS: 'sms', categoriaServicio: 'menu' },

    // Bar Mar Caribe - Miguel Ángel Cruz (BAR-602)
    { empleadoId: empMap['BAR-602'].id, propiedadId: barMarCaribe.id, montoUpselling: 14, esUpselling: true, nombreServicio: 'Margarita Premium Don Julio', cantidad: 3, precioUnitario: 28, montoTotal: 84, calificacionNPS: 10, esPromotor: true, comentario: '¡La mejor margarita de mi vida! Miguel es un master.', fuenteNPS: 'qr', categoriaServicio: 'upselling' },
    { empleadoId: empMap['BAR-602'].id, propiedadId: barMarCaribe.id, montoUpselling: 37, esUpselling: true, nombreServicio: 'Tabla de Mariscos Premium', cantidad: 1, precioUnitario: 55, montoTotal: 55, calificacionNPS: 9, esPromotor: true, fuenteNPS: 'app', categoriaServicio: 'upselling' },

    // Spa Sentir - Isabella Vargas (TER-801)
    { empleadoId: empMap['TER-801'].id, propiedadId: spaSentir.id, montoUpselling: 130, esUpselling: true, nombreServicio: 'Masaje Hot Stones 90min', cantidad: 1, precioUnitario: 280, montoTotal: 280, calificacionNPS: 10, esPromotor: true, comentario: 'Isabella tiene manos mágicas. El mejor masaje de mi vida.', fuenteNPS: 'app', categoriaServicio: 'upselling' },
    { empleadoId: empMap['TER-801'].id, propiedadId: spaSentir.id, montoUpselling: 150, esUpselling: true, nombreServicio: 'Facial con Oro 24K', cantidad: 1, precioUnitario: 250, montoTotal: 250, calificacionNPS: 10, esPromotor: true, comentario: 'Mi piel se ve increíble. ¡Volveré por seguro!', fuenteNPS: 'qr', categoriaServicio: 'upselling' },
    { empleadoId: empMap['TER-801'].id, propiedadId: spaSentir.id, montoUpselling: 200, esUpselling: true, nombreServicio: 'Paquete Spa Day', cantidad: 1, precioUnitario: 550, montoTotal: 550, calificacionNPS: 9, esPromotor: true, fuenteNPS: 'email', categoriaServicio: 'experiencia' },

    // Café Orígenes - Valentina Ríos (BAR-603)
    { empleadoId: empMap['BAR-603'].id, propiedadId: cafeOrigenes.id, montoUpselling: 65, esUpselling: true, nombreServicio: 'Café de Especialidad V60', cantidad: 2, precioUnitario: 120, montoTotal: 240, calificacionNPS: 9, esPromotor: true, comentario: 'Valentina explicó todo el proceso, fue una experiencia.', fuenteNPS: 'qr', categoriaServicio: 'upselling' },
    { empleadoId: empMap['BAR-603'].id, propiedadId: cafeOrigenes.id, montoUpselling: 85, esUpselling: true, nombreServicio: 'Repostería Artesanal 3 piezas', cantidad: 1, precioUnitario: 160, montoTotal: 160, calificacionNPS: 8, esPromotor: false, fuenteNPS: 'sms', categoriaServicio: 'upselling' },
  ]

  const ventas = await Promise.all(
    ventasData.map(v => prisma.ventaNPS.create({ data: v }))
  )
  console.log(`  ✅ ${ventas.length} ventas creadas`)

  // =============================================
  // 7. ALERTAS DE RIESGO
  // =============================================
  console.log('🚨 Creando alertas de riesgo...')
  const alertas = await Promise.all([
    prisma.alertaRiesgo.create({
      data: {
        empleadoId: empMap['REC-701'].id,
        propiedadId: hotelCancun.id,
        tipo: 'baja_felicidad',
        tipoEn: 'low_happiness',
        severidad: 'alto',
        mensaje: 'Luis Fernández muestra índice de felicidad de 60/100 y NPS promedio de 7.8. Riesgo significativo de abandono.',
        mensajeEn: 'Luis Fernández shows happiness index of 60/100 and average NPS of 7.8. Significant risk of abandonment.',
        probabilidad: 55,
        generadoPorIA: true,
        leida: false,
      }
    }),
    prisma.alertaRiesgo.create({
      data: {
        empleadoId: empMap['BEL-102'].id,
        propiedadId: resortPuebla.id,
        tipo: 'estancamiento',
        tipoEn: 'stagnation',
        severidad: 'alto',
        mensaje: 'Alejandro Díaz no ha mejorado sus métricas de upselling en los últimos 3 meses y su felicidad ha bajado a 62.',
        mensajeEn: 'Alejandro Díaz has not improved his upselling metrics in the last 3 months and his happiness dropped to 62.',
        probabilidad: 50,
        generadoPorIA: true,
        leida: false,
      }
    }),
    prisma.alertaRiesgo.create({
      data: {
        empleadoId: empMap['MES-406'].id,
        propiedadId: cafeOrigenes.id,
        tipo: 'estancamiento',
        tipoEn: 'stagnation',
        severidad: 'medio',
        mensaje: 'Camila Ortiz lleva 3 meses en onboarding con métricas muy bajas. Se sugiere mentoría inmediata.',
        mensajeEn: 'Camila Ortiz has been in onboarding for 3 months with very low metrics. Immediate mentoring suggested.',
        probabilidad: 60,
        generadoPorIA: true,
        leida: false,
      }
    }),
    prisma.alertaRiesgo.create({
      data: {
        empleadoId: empMap['REC-802'].id,
        propiedadId: spaSentir.id,
        tipo: 'nps_bajo',
        tipoEn: 'low_nps',
        severidad: 'medio',
        mensaje: 'Sofía Hernández tiene NPS promedio de 8.0, por debajo del promedio del spa (9.2). Se recomienda capacitación en ventas.',
        mensajeEn: 'Sofía Hernández has average NPS of 8.0, below the spa average (9.2). Sales training recommended.',
        probabilidad: 45,
        generadoPorIA: true,
        leida: true,
      }
    }),
    prisma.alertaRiesgo.create({
      data: {
        empleadoId: empMap['HST-201'].id,
        propiedadId: restauranteTerraza.id,
        tipo: 'inactividad',
        tipoEn: 'inactivity',
        severidad: 'medio',
        mensaje: 'Diana Morales no ha registrado actividad de capacitación en las últimas 2 semanas.',
        mensajeEn: 'Diana Morales has not registered training activity in the last 2 weeks.',
        probabilidad: 40,
        generadoPorIA: true,
        leida: false,
      }
    }),
    prisma.alertaRiesgo.create({
      data: {
        empleadoId: empMap['MES-402'].id,
        propiedadId: hotelCancun.id,
        tipo: 'nps_bajo',
        tipoEn: 'low_nps',
        severidad: 'bajo',
        mensaje: 'Roberto Sánchez tiene NPS de 8.5, ligeramente por debajo del promedio del equipo A&B (9.0).',
        mensajeEn: 'Roberto Sánchez has NPS of 8.5, slightly below the F&B team average (9.0).',
        probabilidad: 35,
        generadoPorIA: true,
        leida: true,
      }
    }),
    prisma.alertaRiesgo.create({
      data: {
        empleadoId: empMap['MES-402'].id,
        propiedadId: hotelCancun.id,
        tipo: 'baja_felicidad',
        tipoEn: 'low_happiness',
        severidad: 'medio',
        mensaje: 'Roberto Sánchez muestra índice de felicidad de 70/100, tendencia decreciente en el último trimestre.',
        mensajeEn: 'Roberto Sánchez shows happiness index of 70/100, decreasing trend in the last quarter.',
        probabilidad: 35,
        generadoPorIA: true,
        leida: false,
      }
    }),
    prisma.alertaRiesgo.create({
      data: {
        empleadoId: empMap['BEL-102'].id,
        propiedadId: resortPuebla.id,
        tipo: 'fin_contrato',
        tipoEn: 'contract_end',
        severidad: 'critico',
        mensaje: 'Alejandro Díáz tiene contrato vencimiento próximo. Combinado con bajo rendimiento, se recomienda preparación de reemplazo.',
        mensajeEn: 'Alejandro Díaz has upcoming contract expiration. Combined with low performance, replacement preparation recommended.',
        probabilidad: 70,
        generadoPorIA: true,
        leida: false,
      }
    }),
  ])

  console.log(`  ✅ ${alertas.length} alertas creadas`)

  // =============================================
  // 8. CANDIDATOS
  // =============================================
  console.log('🤝 Creando candidatos...')
  const candidatos = await Promise.all([
    prisma.candidatoPool.create({
      data: {
        nombre: 'Gabriela Mendoza',
        email: 'gabriela.m@email.com',
        telefono: '+52 55 1234 5678',
        posicion: 'Recepcionista',
        posicionEn: 'Receptionist',
        region: 'cancun',
        experiencia: 3,
        habilidades: JSON.stringify(['opera', 'salesforce', 'bilingue', 'upselling']),
        estado: 'disponible',
        fuente: 'portal',
        puntuacionEntrevista: 85,
        notas: 'Excelente actitud, experiencia en hoteles 5 estrellas. Candidata para reemplazo de Luis Fernández.',
      }
    }),
    prisma.candidatoPool.create({
      data: {
        nombre: 'Pablo Herrera',
        email: 'pablo.h@email.com',
        telefono: '+52 55 8765 4321',
        posicion: 'Mesero',
        posicionEn: 'Waiter',
        region: 'cdmx',
        experiencia: 2,
        habilidades: JSON.stringify(['servicio', 'bilingue', 'pos']),
        estado: 'en_proceso',
        fuente: 'referido',
        puntuacionEntrevista: 78,
        notas: 'Buen potencial, necesita capacitación en upselling. Referido por María Elena Torres.',
      }
    }),
    prisma.candidatoPool.create({
      data: {
        nombre: 'Lucía Castillo',
        email: 'lucia.c@email.com',
        telefono: '+52 222 1111 2222',
        posicion: 'Bellboy',
        posicionEn: 'Bellboy',
        region: 'puebla',
        experiencia: 1,
        habilidades: JSON.stringify(['cliente', 'bilingue']),
        estado: 'disponible',
        fuente: 'agencia',
        puntuacionEntrevista: 72,
        notas: 'Poca experiencia pero actitud excelente. Candidata para reemplazo de Alejandro Díaz.',
        propiedadId: resortPuebla.id,
      }
    }),
    prisma.candidatoPool.create({
      data: {
        nombre: 'Marco Rodríguez',
        email: 'marco.r@email.com',
        telefono: '+52 55 3333 4444',
        posicion: 'Barista',
        posicionEn: 'Barista',
        region: 'cdmx',
        experiencia: 4,
        habilidades: JSON.stringify(['cafe_especialidad', 'latte_art', 'v60', 'bilingue']),
        estado: 'disponible',
        fuente: 'portal',
        puntuacionEntrevista: 90,
        notas: 'Barista certificado SCA. Excelente para Café Orígenes.',
      }
    }),
    prisma.candidatoPool.create({
      data: {
        nombre: 'Andrea Jiménez',
        email: 'andrea.j@email.com',
        telefono: '+52 624 5555 6666',
        posicion: 'Terapeuta Spa',
        posicionEn: 'Spa Therapist',
        region: 'los_cabos',
        experiencia: 5,
        habilidades: JSON.stringify(['masaje', 'faciales', 'aromaterapia', 'ventas']),
        estado: 'contratado',
        fuente: 'referido',
        puntuacionEntrevista: 92,
        notas: 'Contratada para reforzar el equipo del Spa Sentir. Inicia el próximo mes.',
        propiedadId: spaSentir.id,
        fechaContratacion: new Date('2024-03-01'),
      }
    }),
  ])

  console.log(`  ✅ ${candidatos.length} candidatos creados`)

  // =============================================
  // 9. INSTRUCTORES
  // =============================================
  console.log('👨‍🏫 Creando instructores...')
  const instructores = await Promise.all([
    prisma.instructor.create({
      data: {
        nombre: 'Sommelier Rafael Torres',
        especialidad: 'Vinos y Maridaje',
        ubicacion: 'CDMX',
        region: 'cdmx',
        calificacion: 4.9,
        tarifaHora: 800,
        disponible: true,
      }
    }),
    prisma.instructor.create({
      data: {
        nombre: 'Chef Isabelle Monet',
        especialidad: 'Gastronomía y Servicio Fine Dining',
        ubicacion: 'Cancún',
        region: 'cancun',
        calificacion: 4.8,
        tarifaHora: 1200,
        disponible: true,
      }
    }),
    prisma.instructor.create({
      data: {
        nombre: 'Mixologist Daniel Cruz',
        especialidad: 'Coctelería Avanzada y Bar Management',
        ubicacion: 'Playa del Carmen',
        region: 'playa_carmen',
        calificacion: 4.7,
        tarifaHora: 600,
        disponible: true,
      }
    }),
  ])

  console.log(`  ✅ ${instructores.length} instructores creados`)

  // =============================================
  // 10. SOLICITUDES DE CAPACITACIÓN
  // =============================================
  console.log('📝 Creando solicitudes de capacitación...')
  const solicitudes = await Promise.all([
    prisma.solicitudCapacitacion.create({
      data: {
        propiedadId: hotelCancun.id,
        capacitacionId: capVinos.id,
        modalidad: 'presencial',
        fechaSolicitada: new Date('2024-03-15'),
        participantes: 8,
        instructorId: instructores[0].id,
        nombreInstructor: 'Sommelier Rafael Torres',
        estado: 'confirmada',
        costo: 6400,
        creadoPor: 'gerente',
      }
    }),
    prisma.solicitudCapacitacion.create({
      data: {
        propiedadId: barMarCaribe.id,
        capacitacionId: capCocteleria.id,
        modalidad: 'presencial',
        fechaSolicitada: new Date('2024-04-01'),
        participantes: 4,
        instructorId: instructores[2].id,
        nombreInstructor: 'Mixologist Daniel Cruz',
        estado: 'pendiente',
        costo: 2400,
        creadoPor: 'gerente',
      }
    }),
    prisma.solicitudCapacitacion.create({
      data: {
        propiedadId: spaSentir.id,
        modalidad: 'virtual',
        tema: 'Técnicas avanzadas de venta consultiva para spa',
        fechaSolicitada: new Date('2024-03-20'),
        participantes: 3,
        estado: 'pendiente',
        costo: 1500,
        creadoPor: 'gerente',
      }
    }),
  ])

  console.log(`  ✅ ${solicitudes.length} solicitudes de capacitación creadas`)

  // =============================================
  // 11. NOTIFICACIONES
  // =============================================
  console.log('🔔 Creando notificaciones...')
  const notificaciones = await Promise.all([
    prisma.notificacion.create({
      data: {
        tipo: 'alerta_ia',
        titulo: 'Riesgo de abandono detectado',
        tituloEn: 'Abandon risk detected',
        mensaje: 'El agente de IA detectó riesgo alto en Luis Fernández (REC-701). Se recomienda acción inmediata.',
        mensajeEn: 'AI agent detected high risk in Luis Fernández (REC-701). Immediate action recommended.',
        leida: false,
        propiedadId: hotelCancun.id,
        prioridad: 'urgente',
      }
    }),
    prisma.notificacion.create({
      data: {
        tipo: 'solicitud_capacitacion',
        titulo: 'Nueva solicitud de capacitación',
        tituloEn: 'New training request',
        mensaje: 'Bar Mar Caribe solicitó capacitación de Coctelería Avanzada para 4 participantes.',
        mensajeEn: 'Bar Mar Caribe requested Advanced Mixology training for 4 participants.',
        leida: false,
        propiedadId: barMarCaribe.id,
        prioridad: 'normal',
      }
    }),
    prisma.notificacion.create({
      data: {
        tipo: 'reemplazo_necesario',
        titulo: 'Preparar reemplazo',
        tituloEn: 'Prepare replacement',
        mensaje: 'Se recomienda preparar reemplazo para Alejandro Díaz (BEL-102) debido a fin de contrato y bajo rendimiento.',
        mensajeEn: 'Replacement preparation recommended for Alejandro Díaz (BEL-102) due to contract end and low performance.',
        leida: false,
        propiedadId: resortPuebla.id,
        prioridad: 'alta',
      }
    }),
  ])

  console.log(`  ✅ ${notificaciones.length} notificaciones creadas`)

  console.log(`
  🎉 ¡Seed completado exitosamente!
  ========================================
  📊 Resumen:
  - ${propiedades.length} propiedades
  - ${empleados.length} empleados
  - ${servicios.length} servicios
  - ${capacitaciones.length} capacitaciones
  - ${inscripciones.length} inscripciones a cursos
  - ${ventas.length} ventas con NPS
  - ${alertas.length} alertas de riesgo
  - ${candidatos.length} candidatos
  - ${instructores.length} instructores
  - ${solicitudes.length} solicitudes de capacitación
  - ${notificaciones.length} notificaciones
  `)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error en seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
