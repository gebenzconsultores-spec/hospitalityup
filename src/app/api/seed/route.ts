import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
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

    // ============================
    // PROPIEDADES (6)
    // ============================
    const propiedades = await Promise.all([
      db.propiedad.create({
        data: {
          nombre: 'Hotel Playa Cancún',
          nombreEn: 'Cancún Beach Hotel',
          tipo: 'hotel',
          ubicacion: 'Blvd. Kukulcán KM 12.5, Cancún, Q. Roo',
          region: 'cancun',
          plan: 'growth',
          moneda: 'MXN',
          activo: true,
        },
      }),
      db.propiedad.create({
        data: {
          nombre: 'Restaurante La Terraza',
          nombreEn: 'La Terraza Restaurant',
          tipo: 'restaurante',
          ubicacion: 'Calle 5 de Mayo 208, Puebla, Pue.',
          region: 'puebla',
          plan: 'boutique',
          moneda: 'MXN',
          activo: true,
        },
      }),
      db.propiedad.create({
        data: {
          nombre: 'Gran Hotel CDMX',
          nombreEn: 'Grand Hotel Mexico City',
          tipo: 'hotel',
          ubicacion: 'Av. Juárez 70, Col. Centro, CDMX',
          region: 'cdmx',
          plan: 'enterprise',
          moneda: 'MXN',
          activo: true,
        },
      }),
      db.propiedad.create({
        data: {
          nombre: 'Bar Mar Azul',
          nombreEn: 'Blue Sea Bar',
          tipo: 'bar',
          ubicacion: 'Av. 10 entre Calle 1 y 5, Playa del Carmen',
          region: 'playa_carmen',
          plan: 'boutique',
          moneda: 'MXN',
          activo: true,
        },
      }),
      db.propiedad.create({
        data: {
          nombre: 'Resort Los Cabos',
          nombreEn: 'Los Cabos Resort',
          tipo: 'hotel',
          ubicacion: 'Carretera Transpeninsular KM 7, Los Cabos, BCS',
          region: 'los_cabos',
          plan: 'growth',
          moneda: 'USD',
          activo: true,
        },
      }),
      db.propiedad.create({
        data: {
          nombre: 'Restaurante Puerto Veracruz',
          nombreEn: 'Veracruz Port Restaurant',
          tipo: 'restaurante',
          ubicacion: 'Boulevard Manuel Ávila Camacho 1200, Veracruz',
          region: 'veracruz',
          plan: 'boutique',
          moneda: 'MXN',
          activo: true,
        },
      }),
    ])

    const [cancun, puebla, cdmx, playaCarmen, losCabos, veracruz] = propiedades

    // ============================
    // EMPLEADOS (12)
    // ============================
    const empleados = await Promise.all([
      // 1. Juan Pérez - Top performer, Mesero Sr.
      db.empleado.create({
        data: {
          empleadoId: 'MES-401',
          nombre: 'Juan Pérez',
          posicion: 'Mesero Sr.',
          posicionEn: 'Senior Waiter',
          departamento: 'A&B',
          departamentoEn: 'Food & Beverage',
          fechaIngreso: new Date('2021-03-15'),
          estado: 'activo',
          nivelCarrera: 3,
          rutaCarrera: 'Mesero Jr. → Mesero Sr. → Capitán → Gerente A&B',
          rutaCarreraEn: 'Jr. Waiter → Sr. Waiter → Captain → F&B Manager',
          puntuacionConocimiento: 85,
          puntuacionVentas: 92,
          puntuacionHospitalidad: 88,
          puntuacionTotal: 88.3,
          totalUpselling: 4580,
          npsPromedio: 9.2,
          cursosCompletados: 5,
          cursosEnProgreso: 1,
          indiceFelicidad: 85,
          riesgoBaja: 12,
          nivelRiesgoBaja: 'bajo',
          justificacionRiesgo: 'Empleado estable con alto desempeño y satisfacción. Bajo riesgo de rotación.',
          sugerenciaCapacitacion: 'Candidato para curso de Liderazgo en Piso - siguiente paso en su ruta de carrera.',
          ultimaActividad: new Date('2025-01-20'),
          propiedadId: cancun.id,
        },
      }),
      // 2. María García - Onboarding, alto riesgo
      db.empleado.create({
        data: {
          empleadoId: 'MES-402',
          nombre: 'María García',
          posicion: 'Mesera Jr.',
          posicionEn: 'Jr. Waitress',
          departamento: 'A&B',
          departamentoEn: 'Food & Beverage',
          fechaIngreso: new Date('2024-12-01'),
          estado: 'onboarding',
          nivelCarrera: 1,
          rutaCarrera: 'Mesera Jr. → Mesera Sr. → Capitana → Gerente A&B',
          rutaCarreraEn: 'Jr. Waitress → Sr. Waitress → Captain → F&B Manager',
          puntuacionConocimiento: 45,
          puntuacionVentas: 38,
          puntuacionHospitalidad: 52,
          puntuacionTotal: 45.0,
          totalUpselling: 320,
          npsPromedio: 7.1,
          cursosCompletados: 1,
          cursosEnProgreso: 2,
          indiceFelicidad: 68,
          riesgoBaja: 78,
          nivelRiesgoBaja: 'alto',
          justificacionRiesgo: 'Empleado en onboarding con scores bajos y felicidad decreciente. Señales de desmotivación y posible abandono durante período de prueba.',
          sugerenciaCapacitacion: 'Asignar mentoría con Laura Hernández (CAP-501). Refuerzo en Onboarding y Técnicas de Upselling Básico.',
          ultimaActividad: new Date('2025-01-15'),
          propiedadId: cancun.id,
        },
      }),
      // 3. Carlos López - Bellboy Sr., bajo riesgo
      db.empleado.create({
        data: {
          empleadoId: 'BEL-101',
          nombre: 'Carlos López',
          posicion: 'Bellboy Sr.',
          posicionEn: 'Sr. Bellboy',
          departamento: 'Conserjería',
          departamentoEn: 'Concierge',
          fechaIngreso: new Date('2020-06-20'),
          estado: 'activo',
          nivelCarrera: 3,
          rutaCarrera: 'Bellboy Jr. → Bellboy Sr. → Jefe de Conserjería → Gerente de Operaciones',
          rutaCarreraEn: 'Jr. Bellboy → Sr. Bellboy → Head Concierge → Operations Manager',
          puntuacionConocimiento: 78,
          puntuacionVentas: 65,
          puntuacionHospitalidad: 90,
          puntuacionTotal: 77.7,
          totalUpselling: 1820,
          npsPromedio: 9.0,
          cursosCompletados: 4,
          cursosEnProgreso: 0,
          indiceFelicidad: 92,
          riesgoBaja: 8,
          nivelRiesgoBaja: 'bajo',
          justificacionRiesgo: 'Empleado con antigüedad sólida, alta hospitalidad y felicidad. Muy bajo riesgo.',
          sugerenciaCapacitacion: 'Candidato para Liderazgo en Piso para transición a Jefe de Conserjería.',
          ultimaActividad: new Date('2025-01-19'),
          propiedadId: cancun.id,
        },
      }),
      // 4. Ana Martínez - Recepcionista, riesgo medio
      db.empleado.create({
        data: {
          empleadoId: 'REC-201',
          nombre: 'Ana Martínez',
          posicion: 'Recepcionista',
          posicionEn: 'Receptionist',
          departamento: 'Recepción',
          departamentoEn: 'Front Desk',
          fechaIngreso: new Date('2022-09-10'),
          estado: 'activo',
          nivelCarrera: 2,
          rutaCarrera: 'Recepcionista Jr. → Recepcionista Sr. → Supervisora de Recepción → Gerente Front Office',
          rutaCarreraEn: 'Jr. Receptionist → Sr. Receptionist → Front Desk Supervisor → Front Office Manager',
          puntuacionConocimiento: 72,
          puntuacionVentas: 60,
          puntuacionHospitalidad: 80,
          puntuacionTotal: 70.7,
          totalUpselling: 2100,
          npsPromedio: 8.3,
          cursosCompletados: 3,
          cursosEnProgreso: 1,
          indiceFelicidad: 72,
          riesgoBaja: 35,
          nivelRiesgoBaja: 'medio',
          justificacionRiesgo: 'Riesgo moderado. Felicidad en tendencia descendente en los últimos 2 meses. Solicitó cambio de turno sin éxito.',
          sugerenciaCapacitacion: 'Revisar satisfacción laboral. Asignar Venta Consultiva de Tours para mejorar scores de ventas.',
          ultimaActividad: new Date('2025-01-17'),
          propiedadId: cdmx.id,
        },
      }),
      // 5. Roberto Sánchez - Camarista, riesgo medio-alto
      db.empleado.create({
        data: {
          empleadoId: 'CAM-301',
          nombre: 'Roberto Sánchez',
          posicion: 'Camarista',
          posicionEn: 'Housekeeper',
          departamento: 'Ama de Llaves',
          departamentoEn: 'Housekeeping',
          fechaIngreso: new Date('2023-02-14'),
          estado: 'activo',
          nivelCarrera: 2,
          rutaCarrera: 'Camarista → Camarista Sr. → Supervisora de Piso → Ama de Llaves',
          rutaCarreraEn: 'Housekeeper → Sr. Housekeeper → Floor Supervisor → Head Housekeeper',
          puntuacionConocimiento: 60,
          puntuacionVentas: 30,
          puntuacionHospitalidad: 70,
          puntuacionTotal: 53.3,
          totalUpselling: 0,
          npsPromedio: 7.8,
          cursosCompletados: 1,
          cursosEnProgreso: 1,
          indiceFelicidad: 58,
          riesgoBaja: 45,
          nivelRiesgoBaja: 'medio',
          justificacionRiesgo: 'Felicidad decreciente. Inasistencias incrementadas en el último mes. Comentarios negativos sobre carga de trabajo.',
          sugerenciaCapacitacion: 'Evaluar carga de trabajo. Asignar Servicio al Cliente Premium para mejorar engagement.',
          ultimaActividad: new Date('2025-01-12'),
          propiedadId: puebla.id,
        },
      }),
      // 6. Laura Hernández - Capitana, top performer, muy bajo riesgo
      db.empleado.create({
        data: {
          empleadoId: 'CAP-501',
          nombre: 'Laura Hernández',
          posicion: 'Capitana',
          posicionEn: 'Captain',
          departamento: 'A&B',
          departamentoEn: 'Food & Beverage',
          fechaIngreso: new Date('2019-05-01'),
          estado: 'activo',
          nivelCarrera: 4,
          rutaCarrera: 'Mesera Jr. → Mesera Sr. → Capitana → Gerente A&B → Directora A&B',
          rutaCarreraEn: 'Jr. Waitress → Sr. Waitress → Captain → F&B Manager → F&B Director',
          puntuacionConocimiento: 95,
          puntuacionVentas: 98,
          puntuacionHospitalidad: 96,
          puntuacionTotal: 96.3,
          totalUpselling: 8920,
          npsPromedio: 9.8,
          cursosCompletados: 8,
          cursosEnProgreso: 0,
          indiceFelicidad: 95,
          riesgoBaja: 5,
          nivelRiesgoBaja: 'bajo',
          justificacionRiesgo: 'Top performer excepcional. Comprometida, líder natural. Sin riesgo de rotación.',
          sugerenciaCapacitacion: 'Promover a Gerente A&B. Asignar Liderazgo en Piso como preparación.',
          ultimaActividad: new Date('2025-01-20'),
          propiedadId: cancun.id,
        },
      }),
      // 7. Miguel Torres - Bartender, riesgo bajo-medio
      db.empleado.create({
        data: {
          empleadoId: 'BAR-601',
          nombre: 'Miguel Torres',
          posicion: 'Bartender',
          posicionEn: 'Bartender',
          departamento: 'Bar',
          departamentoEn: 'Bar',
          fechaIngreso: new Date('2023-07-01'),
          estado: 'activo',
          nivelCarrera: 2,
          rutaCarrera: 'Barback → Bartender Jr. → Bartender Sr. → Bar Manager',
          rutaCarreraEn: 'Barback → Jr. Bartender → Sr. Bartender → Bar Manager',
          puntuacionConocimiento: 70,
          puntuacionVentas: 75,
          puntuacionHospitalidad: 72,
          puntuacionTotal: 72.3,
          totalUpselling: 2650,
          npsPromedio: 8.0,
          cursosCompletados: 2,
          cursosEnProgreso: 1,
          indiceFelicidad: 76,
          riesgoBaja: 22,
          nivelRiesgoBaja: 'bajo',
          justificacionRiesgo: 'Desempeño estable. Riesgo bajo aunque podría mejorar en hospitalidad.',
          sugerenciaCapacitacion: 'Cocktails y Mixología para certificación avanzada.',
          ultimaActividad: new Date('2025-01-18'),
          propiedadId: playaCarmen.id,
        },
      }),
      // 8. Patricia Ruiz - Offboarding, riesgo CRÍTICO
      db.empleado.create({
        data: {
          empleadoId: 'MES-701',
          nombre: 'Patricia Ruiz',
          posicion: 'Mesera',
          posicionEn: 'Waitress',
          departamento: 'A&B',
          departamentoEn: 'Food & Beverage',
          fechaIngreso: new Date('2022-01-15'),
          estado: 'offboarding',
          nivelCarrera: 2,
          rutaCarrera: 'Mesera Jr. → Mesera → Mesera Sr. → Capitana',
          rutaCarreraEn: 'Jr. Waitress → Waitress → Sr. Waitress → Captain',
          puntuacionConocimiento: 55,
          puntuacionVentas: 40,
          puntuacionHospitalidad: 35,
          puntuacionTotal: 43.3,
          totalUpselling: 580,
          npsPromedio: 5.8,
          cursosCompletados: 1,
          cursosEnProgreso: 0,
          indiceFelicidad: 35,
          riesgoBaja: 92,
          nivelRiesgoBaja: 'critico',
          justificacionRiesgo: 'ALERTA CRÍTICA: Empleada en proceso de baja. NPS muy bajo (5.8), quejas recurrentes de clientes. Felicidad en nivel crítico (35%). Se recomienda acelerar transición y preparar reemplazo.',
          sugerenciaCapacitacion: 'Priorizar selección de reemplazo del pool de candidatos. Asegurar handover documentado.',
          ultimaActividad: new Date('2025-01-10'),
          fechaBaja: new Date('2025-01-22'),
          propiedadId: losCabos.id,
        },
      }),
      // 9. Diego Flores - Recepcionista Jr., onboarding, riesgo alto
      db.empleado.create({
        data: {
          empleadoId: 'REC-801',
          nombre: 'Diego Flores',
          posicion: 'Recepcionista Jr.',
          posicionEn: 'Jr. Receptionist',
          departamento: 'Recepción',
          departamentoEn: 'Front Desk',
          fechaIngreso: new Date('2024-11-15'),
          estado: 'onboarding',
          nivelCarrera: 1,
          rutaCarrera: 'Recepcionista Jr. → Recepcionista → Recepcionista Sr. → Supervisora',
          rutaCarreraEn: 'Jr. Receptionist → Receptionist → Sr. Receptionist → Supervisor',
          puntuacionConocimiento: 42,
          puntuacionVentas: 35,
          puntuacionHospitalidad: 55,
          puntuacionTotal: 44.0,
          totalUpselling: 150,
          npsPromedio: 7.0,
          cursosCompletados: 0,
          cursosEnProgreso: 2,
          indiceFelicidad: 65,
          riesgoBaja: 65,
          nivelRiesgoBaja: 'alto',
          justificacionRiesgo: 'Empleado en onboarding con adaptación lenta. Scores bajos en todas las áreas. Necesita soporte adicional.',
          sugerenciaCapacitacion: 'Asignar Onboarding: Tu Primer Día y mentoría con recepcionista senior.',
          ultimaActividad: new Date('2025-01-16'),
          propiedadId: cdmx.id,
        },
      }),
      // 10. Sofía Vargas - Mesera Sr., bajo riesgo
      db.empleado.create({
        data: {
          empleadoId: 'MES-901',
          nombre: 'Sofía Vargas',
          posicion: 'Mesera Sr.',
          posicionEn: 'Sr. Waitress',
          departamento: 'A&B',
          departamentoEn: 'Food & Beverage',
          fechaIngreso: new Date('2021-08-20'),
          estado: 'activo',
          nivelCarrera: 3,
          rutaCarrera: 'Mesera Jr. → Mesera Sr. → Capitana → Gerente A&B',
          rutaCarreraEn: 'Jr. Waitress → Sr. Waitress → Captain → F&B Manager',
          puntuacionConocimiento: 82,
          puntuacionVentas: 88,
          puntuacionHospitalidad: 85,
          puntuacionTotal: 85.0,
          totalUpselling: 3950,
          npsPromedio: 9.0,
          cursosCompletados: 4,
          cursosEnProgreso: 1,
          indiceFelicidad: 88,
          riesgoBaja: 15,
          nivelRiesgoBaja: 'bajo',
          justificacionRiesgo: 'Buena performer con trayectoria ascendente. Riesgo bajo.',
          sugerenciaCapacitacion: 'Técnicas de Upselling Avanzado para consolidar habilidades de venta.',
          ultimaActividad: new Date('2025-01-19'),
          propiedadId: cancun.id,
        },
      }),
      // 11. Fernando Morales - Bellboy Jr., onboarding, riesgo alto
      db.empleado.create({
        data: {
          empleadoId: 'BEL-102',
          nombre: 'Fernando Morales',
          posicion: 'Bellboy Jr.',
          posicionEn: 'Jr. Bellboy',
          departamento: 'Conserjería',
          departamentoEn: 'Concierge',
          fechaIngreso: new Date('2024-12-10'),
          estado: 'onboarding',
          nivelCarrera: 1,
          rutaCarrera: 'Bellboy Jr. → Bellboy → Bellboy Sr. → Jefe de Conserjería',
          rutaCarreraEn: 'Jr. Bellboy → Bellboy → Sr. Bellboy → Head Concierge',
          puntuacionConocimiento: 40,
          puntuacionVentas: 30,
          puntuacionHospitalidad: 50,
          puntuacionTotal: 40.0,
          totalUpselling: 80,
          npsPromedio: 6.8,
          cursosCompletados: 0,
          cursosEnProgreso: 1,
          indiceFelicidad: 62,
          riesgoBaja: 55,
          nivelRiesgoBaja: 'alto',
          justificacionRiesgo: 'Onboarding lento con scores bajos. Potencial desmotivación en primer mes.',
          sugerenciaCapacitacion: 'Asignar Onboarding: Tu Primer Día y mentoría con Carlos López (BEL-101).',
          ultimaActividad: new Date('2025-01-14'),
          propiedadId: cancun.id,
        },
      }),
      // 12. Carmen Delgado - Gerente A&B, riesgo mínimo
      db.empleado.create({
        data: {
          empleadoId: 'GER-001',
          nombre: 'Carmen Delgado',
          posicion: 'Gerente A&B',
          posicionEn: 'F&B Manager',
          departamento: 'Gerencia',
          departamentoEn: 'Management',
          fechaIngreso: new Date('2018-01-10'),
          estado: 'activo',
          nivelCarrera: 5,
          rutaCarrera: 'Mesera → Capitana → Subgerente A&B → Gerente A&B → Directora Operaciones',
          rutaCarreraEn: 'Waitress → Captain → Asst. F&B Manager → F&B Manager → Operations Director',
          puntuacionConocimiento: 96,
          puntuacionVentas: 94,
          puntuacionHospitalidad: 98,
          puntuacionTotal: 96.0,
          totalUpselling: 12500,
          npsPromedio: 9.5,
          cursosCompletados: 10,
          cursosEnProgreso: 0,
          indiceFelicidad: 98,
          riesgoBaja: 3,
          nivelRiesgoBaja: 'bajo',
          justificacionRiesgo: 'Gerente con más de 7 años de antigüedad. Máximo compromiso. Sin riesgo.',
          sugerenciaCapacitacion: 'Desarrollo ejecutivo para transición a Dirección de Operaciones.',
          ultimaActividad: new Date('2025-01-20'),
          propiedadId: cancun.id,
        },
      }),
    ])

    const [
      juanPerez, mariaGarcia, carlosLopez, anaMartinez,
      robertoSanchez, lauraHernandez, miguelTorres, patriciaRuiz,
      diegoFlores, sofiaVargas, fernandoMorales, carmenDelgado,
    ] = empleados

    // ============================
    // CAPACITACIONES (8)
    // ============================
    const capacitaciones = await Promise.all([
      db.capacitacion.create({
        data: {
          titulo: 'Técnicas de Upselling Avanzado',
          tituloEn: 'Advanced Upselling Techniques',
          descripcion: 'Aprende estrategias avanzadas para incrementar el ticket promedio a través de sugerencias de venta inteligentes y personalizadas.',
          descripcionEn: 'Learn advanced strategies to increase average ticket through smart and personalized selling suggestions.',
          categoria: 'upselling',
          categoriaEn: 'upselling',
          modalidad: 'virtual',
          duracion: 45,
          dificultad: 'intermedio',
          dificultadEn: 'intermediate',
          urlContenido: '/cursos/upselling-avanzado',
          posicion: 'Mesero Sr.',
          posicionEn: 'Sr. Waiter',
          puntos: 20,
          activo: true,
          propiedadId: cancun.id,
        },
      }),
      db.capacitacion.create({
        data: {
          titulo: 'Maridaje de Vinos Premium',
          tituloEn: 'Premium Wine Pairing',
          descripcion: 'Domina el arte del maridaje de vinos con platillos para ofrecer experiencias gastronómicas excepcionales a los comensales.',
          descripcionEn: 'Master the art of wine pairing with dishes to offer exceptional gastronomic experiences to diners.',
          categoria: 'conocimiento_producto',
          categoriaEn: 'product_knowledge',
          modalidad: 'virtual',
          duracion: 30,
          dificultad: 'avanzado',
          dificultadEn: 'advanced',
          urlContenido: '/cursos/maridaje-vinos',
          posicion: 'Mesero Sr.',
          posicionEn: 'Sr. Waiter',
          puntos: 25,
          activo: true,
          propiedadId: cancun.id,
        },
      }),
      db.capacitacion.create({
        data: {
          titulo: 'Venta Consultiva de Tours',
          tituloEn: 'Consultative Tour Selling',
          descripcion: 'Aprende a identificar las necesidades del huésped y recomendar tours y experiencias que superen sus expectativas.',
          descripcionEn: 'Learn to identify guest needs and recommend tours and experiences that exceed their expectations.',
          categoria: 'upselling',
          categoriaEn: 'upselling',
          modalidad: 'virtual',
          duracion: 35,
          dificultad: 'principiante',
          dificultadEn: 'beginner',
          urlContenido: '/cursos/venta-tours',
          posicion: 'Recepcionista',
          posicionEn: 'Receptionist',
          puntos: 15,
          activo: true,
        },
      }),
      db.capacitacion.create({
        data: {
          titulo: 'Servicio al Cliente Premium',
          tituloEn: 'Premium Customer Service',
          descripcion: 'Desarrolla habilidades de servicio al cliente de clase mundial, incluyendo manejo de situaciones difíciles y creación de momentos memorables.',
          descripcionEn: 'Develop world-class customer service skills, including handling difficult situations and creating memorable moments.',
          categoria: 'hospitalidad',
          categoriaEn: 'hospitality',
          modalidad: 'presencial',
          duracion: 480,
          dificultad: 'intermedio',
          dificultadEn: 'intermediate',
          urlContenido: '/cursos/servicio-premium',
          posicion: 'Todos',
          posicionEn: 'All',
          puntos: 30,
          activo: true,
        },
      }),
      db.capacitacion.create({
        data: {
          titulo: 'Onboarding: Tu Primer Día',
          tituloEn: 'Onboarding: Your First Day',
          descripcion: 'Guía completa para nuevos empleados sobre procesos, cultura organizacional y herramientas del primer día de trabajo.',
          descripcionEn: 'Complete guide for new employees about processes, organizational culture and tools for their first day.',
          categoria: 'onboarding',
          categoriaEn: 'onboarding',
          modalidad: 'virtual',
          duracion: 20,
          dificultad: 'principiante',
          dificultadEn: 'beginner',
          urlContenido: '/cursos/onboarding-primer-dia',
          posicion: 'Todos',
          posicionEn: 'All',
          puntos: 5,
          activo: true,
        },
      }),
      db.capacitacion.create({
        data: {
          titulo: 'Liderazgo en Piso',
          tituloEn: 'Floor Leadership',
          descripcion: 'Prepárate para roles de liderazgo operativo: gestión de equipos, resolución de conflictos en piso y toma de decisiones bajo presión.',
          descripcionEn: 'Prepare for operational leadership roles: team management, floor conflict resolution and decision making under pressure.',
          categoria: 'liderazgo',
          categoriaEn: 'leadership',
          modalidad: 'presencial',
          duracion: 600,
          dificultad: 'avanzado',
          dificultadEn: 'advanced',
          urlContenido: '/cursos/liderazgo-piso',
          posicion: 'Capitán',
          posicionEn: 'Captain',
          puntos: 40,
          activo: true,
          propiedadId: cancun.id,
        },
      }),
      db.capacitacion.create({
        data: {
          titulo: 'Cocktails y Mixología',
          tituloEn: 'Cocktails & Mixology',
          descripcion: 'Fundamentos de mixología, técnicas de preparación de cócteles clásicos y contemporáneos, y presentación de bebidas.',
          descripcionEn: 'Mixology fundamentals, classic and contemporary cocktail preparation techniques, and beverage presentation.',
          categoria: 'conocimiento_producto',
          categoriaEn: 'product_knowledge',
          modalidad: 'virtual',
          duracion: 40,
          dificultad: 'principiante',
          dificultadEn: 'beginner',
          urlContenido: '/cursos/cocktails-mixologia',
          posicion: 'Bartender',
          posicionEn: 'Bartender',
          puntos: 15,
          activo: true,
          propiedadId: playaCarmen.id,
        },
      }),
      db.capacitacion.create({
        data: {
          titulo: 'Manejo de Quejas y Conflictos',
          tituloEn: 'Complaint & Conflict Handling',
          descripcion: 'Estrategias efectivas para manejar quejas de clientes, desescalar situaciones tensas y convertir experiencias negativas en oportunidades.',
          descripcionEn: 'Effective strategies for handling customer complaints, de-escalating tense situations and turning negative experiences into opportunities.',
          categoria: 'hospitalidad',
          categoriaEn: 'hospitality',
          modalidad: 'virtual',
          duracion: 25,
          dificultad: 'intermedio',
          dificultadEn: 'intermediate',
          urlContenido: '/cursos/manejo-quejas',
          posicion: 'Todos',
          posicionEn: 'All',
          puntos: 15,
          activo: true,
        },
      }),
    ])

    const [upsellingAvanzado, maridajeVinos, ventaTours, servicioPremium, onboarding, liderazgoPiso, cocktails, manejoQuejas] = capacitaciones

    // ============================
    // EMPLEADO_CAPACITACION (17)
    // ============================
    const empleadoCapacitaciones = await Promise.all([
      // Juan Pérez - completó upselling y maridaje, en progreso de liderazgo
      db.empleadoCapacitacion.create({
        data: {
          empleadoId: juanPerez.id,
          capacitacionId: upsellingAvanzado.id,
          estado: 'completado',
          progreso: 100,
          puntuacion: 92,
          fechaInicio: new Date('2024-06-01'),
          fechaCompletado: new Date('2024-06-15'),
        },
      }),
      db.empleadoCapacitacion.create({
        data: {
          empleadoId: juanPerez.id,
          capacitacionId: maridajeVinos.id,
          estado: 'completado',
          progreso: 100,
          puntuacion: 88,
          fechaInicio: new Date('2024-08-01'),
          fechaCompletado: new Date('2024-08-12'),
        },
      }),
      db.empleadoCapacitacion.create({
        data: {
          empleadoId: juanPerez.id,
          capacitacionId: liderazgoPiso.id,
          estado: 'en_progreso',
          progreso: 35,
          fechaInicio: new Date('2025-01-05'),
        },
      }),
      // María García - en progreso de onboarding y upselling básico
      db.empleadoCapacitacion.create({
        data: {
          empleadoId: mariaGarcia.id,
          capacitacionId: onboarding.id,
          estado: 'completado',
          progreso: 100,
          puntuacion: 65,
          fechaInicio: new Date('2024-12-01'),
          fechaCompletado: new Date('2024-12-02'),
        },
      }),
      db.empleadoCapacitacion.create({
        data: {
          empleadoId: mariaGarcia.id,
          capacitacionId: ventaTours.id,
          estado: 'en_progreso',
          progreso: 40,
          fechaInicio: new Date('2025-01-06'),
        },
      }),
      db.empleadoCapacitacion.create({
        data: {
          empleadoId: mariaGarcia.id,
          capacitacionId: manejoQuejas.id,
          estado: 'no_iniciado',
          progreso: 0,
        },
      }),
      // Laura Hernández - completó todos sus cursos, top performer
      db.empleadoCapacitacion.create({
        data: {
          empleadoId: lauraHernandez.id,
          capacitacionId: upsellingAvanzado.id,
          estado: 'completado',
          progreso: 100,
          puntuacion: 98,
          fechaInicio: new Date('2022-03-01'),
          fechaCompletado: new Date('2022-03-15'),
        },
      }),
      db.empleadoCapacitacion.create({
        data: {
          empleadoId: lauraHernandez.id,
          capacitacionId: maridajeVinos.id,
          estado: 'completado',
          progreso: 100,
          puntuacion: 95,
          fechaInicio: new Date('2022-05-01'),
          fechaCompletado: new Date('2022-05-10'),
        },
      }),
      db.empleadoCapacitacion.create({
        data: {
          empleadoId: lauraHernandez.id,
          capacitacionId: liderazgoPiso.id,
          estado: 'completado',
          progreso: 100,
          puntuacion: 97,
          fechaInicio: new Date('2023-01-10'),
          fechaCompletado: new Date('2023-02-28'),
        },
      }),
      // Ana Martínez - completó servicio premium, en progreso de venta tours
      db.empleadoCapacitacion.create({
        data: {
          empleadoId: anaMartinez.id,
          capacitacionId: servicioPremium.id,
          estado: 'completado',
          progreso: 100,
          puntuacion: 82,
          fechaInicio: new Date('2023-10-01'),
          fechaCompletado: new Date('2023-10-15'),
        },
      }),
      db.empleadoCapacitacion.create({
        data: {
          empleadoId: anaMartinez.id,
          capacitacionId: ventaTours.id,
          estado: 'en_progreso',
          progreso: 60,
          fechaInicio: new Date('2025-01-08'),
        },
      }),
      // Miguel Torres - en progreso de cocktails
      db.empleadoCapacitacion.create({
        data: {
          empleadoId: miguelTorres.id,
          capacitacionId: cocktails.id,
          estado: 'en_progreso',
          progreso: 55,
          fechaInicio: new Date('2025-01-10'),
        },
      }),
      // Sofía Vargas - completó upselling, en progreso de maridaje
      db.empleadoCapacitacion.create({
        data: {
          empleadoId: sofiaVargas.id,
          capacitacionId: upsellingAvanzado.id,
          estado: 'completado',
          progreso: 100,
          puntuacion: 90,
          fechaInicio: new Date('2023-04-01'),
          fechaCompletado: new Date('2023-04-14'),
        },
      }),
      db.empleadoCapacitacion.create({
        data: {
          empleadoId: sofiaVargas.id,
          capacitacionId: maridajeVinos.id,
          estado: 'en_progreso',
          progreso: 70,
          fechaInicio: new Date('2025-01-03'),
        },
      }),
      // Diego Flores - onboarding y venta tours
      db.empleadoCapacitacion.create({
        data: {
          empleadoId: diegoFlores.id,
          capacitacionId: onboarding.id,
          estado: 'en_progreso',
          progreso: 80,
          fechaInicio: new Date('2024-11-15'),
        },
      }),
      db.empleadoCapacitacion.create({
        data: {
          empleadoId: diegoFlores.id,
          capacitacionId: ventaTours.id,
          estado: 'no_iniciado',
          progreso: 0,
        },
      }),
      // Fernando Morales - onboarding en progreso
      db.empleadoCapacitacion.create({
        data: {
          empleadoId: fernandoMorales.id,
          capacitacionId: onboarding.id,
          estado: 'en_progreso',
          progreso: 50,
          fechaInicio: new Date('2024-12-10'),
        },
      }),
      // Roberto Sánchez - servicio premium en progreso
      db.empleadoCapacitacion.create({
        data: {
          empleadoId: robertoSanchez.id,
          capacitacionId: servicioPremium.id,
          estado: 'en_progreso',
          progreso: 25,
          fechaInicio: new Date('2025-01-12'),
        },
      }),
    ])

    // ============================
    // VENTA NPS (24)
    // ============================
    const ventas = await Promise.all([
      // Juan Pérez - Top performer, upselling alto, NPS alto
      db.ventaNPS.create({
        data: {
          empleadoId: juanPerez.id, propiedadId: cancun.id,
          montoUpselling: 850, esUpselling: true, nombreServicio: 'Upgrade a Suite Ocean View',
          cantidad: 1, precioUnitario: 850, montoTotal: 850,
          calificacionNPS: 10, esPromotor: true, comentario: 'Juan nos recomendó la suite con vista al mar, ¡increíble experiencia!',
          fuenteNPS: 'qr', categoriaServicio: 'upgrade_habitacion', fechaVenta: new Date('2025-01-18'),
        },
      }),
      db.ventaNPS.create({
        data: {
          empleadoId: juanPerez.id, propiedadId: cancun.id,
          montoUpselling: 480, esUpselling: true, nombreServicio: 'Tour Isla Mujeres Premium',
          cantidad: 2, precioUnitario: 240, montoTotal: 480,
          calificacionNPS: 9, esPromotor: true, comentario: 'Muy buena recomendación del tour',
          fuenteNPS: 'sms', categoriaServicio: 'tour', fechaVenta: new Date('2025-01-15'),
        },
      }),
      db.ventaNPS.create({
        data: {
          empleadoId: juanPerez.id, propiedadId: cancun.id,
          montoUpselling: 320, esUpselling: true, nombreServicio: 'Maridaje de Vinos Reserva',
          cantidad: 2, precioUnitario: 160, montoTotal: 320,
          calificacionNPS: 10, esPromotor: true, comentario: 'El maridaje fue espectacular, gracias Juan',
          fuenteNPS: 'app', categoriaServicio: 'upselling', fechaVenta: new Date('2025-01-12'),
        },
      }),
      // Laura Hernández - Top performer, upselling alto
      db.ventaNPS.create({
        data: {
          empleadoId: lauraHernandez.id, propiedadId: cancun.id,
          montoUpselling: 1200, esUpselling: true, nombreServicio: 'Cena Romántica en Terraza VIP',
          cantidad: 1, precioUnitario: 1200, montoTotal: 1200,
          calificacionNPS: 10, esPromotor: true, comentario: 'Laura organizó una cena perfecta para nuestro aniversario',
          fuenteNPS: 'email', categoriaServicio: 'experiencia', fechaVenta: new Date('2025-01-19'),
        },
      }),
      db.ventaNPS.create({
        data: {
          empleadoId: lauraHernandez.id, propiedadId: cancun.id,
          montoUpselling: 680, esUpselling: true, nombreServicio: 'Paquete Spa + Cena',
          cantidad: 1, precioUnitario: 680, montoTotal: 680,
          calificacionNPS: 10, esPromotor: true, comentario: 'Increíble atención de Laura, lo mejor del hotel',
          fuenteNPS: 'qr', categoriaServicio: 'experiencia', fechaVenta: new Date('2025-01-17'),
        },
      }),
      // María García - Upselling bajo, NPS medio
      db.ventaNPS.create({
        data: {
          empleadoId: mariaGarcia.id, propiedadId: cancun.id,
          montoUpselling: 0, esUpselling: false, nombreServicio: 'Cena Standard',
          cantidad: 2, precioUnitario: 350, montoTotal: 700,
          calificacionNPS: 7, esPromotor: false, comentario: 'Servicio correcto pero nada especial',
          fuenteNPS: 'qr', categoriaServicio: 'menu', fechaVenta: new Date('2025-01-14'),
        },
      }),
      db.ventaNPS.create({
        data: {
          empleadoId: mariaGarcia.id, propiedadId: cancun.id,
          montoUpselling: 120, esUpselling: true, nombreServicio: 'Postre Especial',
          cantidad: 2, precioUnitario: 60, montoTotal: 120,
          calificacionNPS: 6, esPromotor: false, comentario: 'Se veía nerviosa, tardó mucho en traer la cuenta',
          fuenteNPS: 'sms', categoriaServicio: 'menu', fechaVenta: new Date('2025-01-10'),
        },
      }),
      // Patricia Ruiz - NPS BAJO, upselling agresivo
      db.ventaNPS.create({
        data: {
          empleadoId: patriciaRuiz.id, propiedadId: losCabos.id,
          montoUpselling: 580, esUpselling: true, nombreServicio: 'Upgrade Habitación Premium',
          cantidad: 1, precioUnitario: 580, montoTotal: 580,
          calificacionNPS: 5, esPromotor: false, comentario: 'Nos presionó demasiado para cambiar de habitación, muy incómodo',
          fuenteNPS: 'qr', categoriaServicio: 'upgrade_habitacion', fechaVenta: new Date('2025-01-08'),
          analizadoPorIA: true, resultadoIA: JSON.stringify({ tipo: 'upselling_agresivo', detalle: 'Cliente reportó presión excesiva durante venta de upgrade' }),
        },
      }),
      db.ventaNPS.create({
        data: {
          empleadoId: patriciaRuiz.id, propiedadId: losCabos.id,
          montoUpselling: 340, esUpselling: true, nombreServicio: 'Tour Snorkel Premium',
          cantidad: 2, precioUnitario: 170, montoTotal: 340,
          calificacionNPS: 4, esPromotor: false, comentario: 'No paraba de intentar vendernos cosas. Queríamos disfrutar la comida en paz.',
          fuenteNPS: 'app', categoriaServicio: 'tour', fechaVenta: new Date('2025-01-06'),
          analizadoPorIA: true, resultadoIA: JSON.stringify({ tipo: 'upselling_agresivo', detalle: 'NPS 4 con upselling - patrón de venta forzada detectado' }),
        },
      }),
      db.ventaNPS.create({
        data: {
          empleadoId: patriciaRuiz.id, propiedadId: losCabos.id,
          montoUpselling: 0, esUpselling: false, nombreServicio: 'Desayuno Buffet',
          cantidad: 2, precioUnitario: 280, montoTotal: 560,
          calificacionNPS: 3, esPromotor: false, comentario: 'Actitud grosera, tiró el plato sobre la mesa. Pésimo servicio.',
          fuenteNPS: 'qr', categoriaServicio: 'menu', fechaVenta: new Date('2025-01-04'),
        },
      }),
      // Ana Martínez - NPS medio, upselling moderado
      db.ventaNPS.create({
        data: {
          empleadoId: anaMartinez.id, propiedadId: cdmx.id,
          montoUpselling: 380, esUpselling: true, nombreServicio: 'Tour Ciudad de México Premium',
          cantidad: 2, precioUnitario: 190, montoTotal: 380,
          calificacionNPS: 8, esPromotor: false, comentario: 'Buena recomendación del tour',
          fuenteNPS: 'email', categoriaServicio: 'tour', fechaVenta: new Date('2025-01-16'),
        },
      }),
      db.ventaNPS.create({
        data: {
          empleadoId: anaMartinez.id, propiedadId: cdmx.id,
          montoUpselling: 220, esUpselling: true, nombreServicio: 'Upgrade Suite Ejecutiva',
          cantidad: 1, precioUnitario: 220, montoTotal: 220,
          calificacionNPS: 9, esPromotor: true, comentario: 'Ana fue muy amable al sugerirnos la suite',
          fuenteNPS: 'qr', categoriaServicio: 'upgrade_habitacion', fechaVenta: new Date('2025-01-13'),
        },
      }),
      // Carlos López - Hospitalidad alta, upselling moderado
      db.ventaNPS.create({
        data: {
          empleadoId: carlosLopez.id, propiedadId: cancun.id,
          montoUpselling: 450, esUpselling: true, nombreServicio: 'Transporte VIP Aeropuerto',
          cantidad: 1, precioUnitario: 450, montoTotal: 450,
          calificacionNPS: 10, esPromotor: true, comentario: 'Carlos hizo que nuestra llegada fuera perfecta',
          fuenteNPS: 'email', categoriaServicio: 'experiencia', fechaVenta: new Date('2025-01-18'),
        },
      }),
      db.ventaNPS.create({
        data: {
          empleadoId: carlosLopez.id, propiedadId: cancun.id,
          montoUpselling: 280, esUpselling: true, nombreServicio: 'Tour Chichén Itzá Privado',
          cantidad: 1, precioUnitario: 280, montoTotal: 280,
          calificacionNPS: 9, esPromotor: true, comentario: 'Excelente recomendación',
          fuenteNPS: 'sms', categoriaServicio: 'tour', fechaVenta: new Date('2025-01-15'),
        },
      }),
      // Sofía Vargas - Buena performer
      db.ventaNPS.create({
        data: {
          empleadoId: sofiaVargas.id, propiedadId: cancun.id,
          montoUpselling: 520, esUpselling: true, nombreServicio: 'Cena Show con Mariachi',
          cantidad: 2, precioUnitario: 260, montoTotal: 520,
          calificacionNPS: 9, esPromotor: true, comentario: 'Sofía nos consiguió los mejores asientos',
          fuenteNPS: 'qr', categoriaServicio: 'experiencia', fechaVenta: new Date('2025-01-17'),
        },
      }),
      db.ventaNPS.create({
        data: {
          empleadoId: sofiaVargas.id, propiedadId: cancun.id,
          montoUpselling: 350, esUpselling: true, nombreServicio: 'Maridaje de Vinos',
          cantidad: 2, precioUnitario: 175, montoTotal: 350,
          calificacionNPS: 10, esPromotor: true, comentario: 'Súper recomendación la del maridaje',
          fuenteNPS: 'app', categoriaServicio: 'upselling', fechaVenta: new Date('2025-01-14'),
        },
      }),
      // Miguel Torres - Bartender
      db.ventaNPS.create({
        data: {
          empleadoId: miguelTorres.id, propiedadId: playaCarmen.id,
          montoUpselling: 180, esUpselling: true, nombreServicio: 'Cócteles Premium Tasting',
          cantidad: 2, precioUnitario: 90, montoTotal: 180,
          calificacionNPS: 8, esPromotor: false, comentario: 'Buenos cócteles, presentación agradable',
          fuenteNPS: 'qr', categoriaServicio: 'menu', fechaVenta: new Date('2025-01-17'),
        },
      }),
      db.ventaNPS.create({
        data: {
          empleadoId: miguelTorres.id, propiedadId: playaCarmen.id,
          montoUpselling: 250, esUpselling: true, nombreServicio: 'Experiencia Mixología Privada',
          cantidad: 1, precioUnitario: 250, montoTotal: 250,
          calificacionNPS: 9, esPromotor: true, comentario: 'Miguel es un gran bartender, súper creativo',
          fuenteNPS: 'sms', categoriaServicio: 'experiencia', fechaVenta: new Date('2025-01-12'),
        },
      }),
      // Roberto Sánchez - Camarista, sin upselling
      db.ventaNPS.create({
        data: {
          empleadoId: robertoSanchez.id, propiedadId: puebla.id,
          montoUpselling: 0, esUpselling: false, nombreServicio: 'Limpieza de Habitación',
          cantidad: 1, precioUnitario: 0, montoTotal: 0,
          calificacionNPS: 7, esPromotor: false, comentario: 'La habitación estaba bien pero tardó mucho',
          fuenteNPS: 'qr', categoriaServicio: 'menu', fechaVenta: new Date('2025-01-11'),
        },
      }),
      // Diego Flores - Onboarding, NPS bajo
      db.ventaNPS.create({
        data: {
          empleadoId: diegoFlores.id, propiedadId: cdmx.id,
          montoUpselling: 0, esUpselling: false, nombreServicio: 'Check-in Standard',
          cantidad: 1, precioUnitario: 0, montoTotal: 0,
          calificacionNPS: 6, esPromotor: false, comentario: 'El check-in fue lento y no nos explicó los servicios',
          fuenteNPS: 'qr', categoriaServicio: 'menu', fechaVenta: new Date('2025-01-14'),
        },
      }),
      db.ventaNPS.create({
        data: {
          empleadoId: diegoFlores.id, propiedadId: cdmx.id,
          montoUpselling: 0, esUpselling: false, nombreServicio: 'Check-in Standard',
          cantidad: 1, precioUnitario: 0, montoTotal: 0,
          calificacionNPS: 5, esPromotor: false, comentario: 'No sabía cómo operar el sistema, tuve que esperar 20 min',
          fuenteNPS: 'app', categoriaServicio: 'menu', fechaVenta: new Date('2025-01-09'),
        },
      }),
      // Carmen Delgado - Gerente, ventas de alto valor
      db.ventaNPS.create({
        data: {
          empleadoId: carmenDelgado.id, propiedadId: cancun.id,
          montoUpselling: 2800, esUpselling: true, nombreServicio: 'Evento Corporativo Banquete',
          cantidad: 1, precioUnitario: 2800, montoTotal: 2800,
          calificacionNPS: 10, esPromotor: true, comentario: 'Carmen organizó un evento impecable para nuestra empresa',
          fuenteNPS: 'email', categoriaServicio: 'experiencia', fechaVenta: new Date('2025-01-19'),
        },
      }),
      db.ventaNPS.create({
        data: {
          empleadoId: carmenDelgado.id, propiedadId: cancun.id,
          montoUpselling: 1500, esUpselling: true, nombreServicio: 'Paquete Todo Incluido Premium',
          cantidad: 1, precioUnitario: 1500, montoTotal: 1500,
          calificacionNPS: 10, esPromotor: true, comentario: 'La mejor decisión fue seguir la recomendación de Carmen',
          fuenteNPS: 'qr', categoriaServicio: 'upselling', fechaVenta: new Date('2025-01-16'),
        },
      }),
      // Fernando Morales - NPS bajo, onboarding
      db.ventaNPS.create({
        data: {
          empleadoId: fernandoMorales.id, propiedadId: cancun.id,
          montoUpselling: 0, esUpselling: false, nombreServicio: 'Servicio de Equipaje',
          cantidad: 1, precioUnitario: 0, montoTotal: 0,
          calificacionNPS: 6, esPromotor: false, comentario: 'Parecía nuevo, no sabía dónde quedaba la habitación',
          fuenteNPS: 'qr', categoriaServicio: 'menu', fechaVenta: new Date('2025-01-13'),
        },
      }),
    ])

    // ============================
    // RESPUESTAS NPS (6)
    // ============================
    const respuestasNps = await Promise.all([
      db.respuestaNPS.create({
        data: {
          empleadoId: juanPerez.id,
          puntuacion: 10,
          comentario: 'Juan siempre nos da una atención excepcional',
          esPromotor: true,
          fuente: 'qr',
        },
      }),
      db.respuestaNPS.create({
        data: {
          empleadoId: patriciaRuiz.id,
          puntuacion: 3,
          comentario: 'Actitud muy mala, no queremos que nos atienda otra vez',
          esPromotor: false,
          fuente: 'app',
        },
      }),
      db.respuestaNPS.create({
        data: {
          empleadoId: lauraHernandez.id,
          puntuacion: 10,
          comentario: 'Laura es la mejor capitana que hemos tenido',
          esPromotor: true,
          fuente: 'email',
        },
      }),
      db.respuestaNPS.create({
        data: {
          empleadoId: mariaGarcia.id,
          puntuacion: 6,
          comentario: 'Se veía perdida, tardó mucho con el pedido',
          esPromotor: false,
          fuente: 'qr',
        },
      }),
      db.respuestaNPS.create({
        data: {
          empleadoId: carlosLopez.id,
          puntuacion: 9,
          comentario: 'Carlos es muy atento y conocedor del hotel',
          esPromotor: true,
          fuente: 'sms',
        },
      }),
      db.respuestaNPS.create({
        data: {
          empleadoId: anaMartinez.id,
          puntuacion: 8,
          comentario: 'Buena atención pero podría mejorar el check-in',
          esPromotor: false,
          fuente: 'qr',
        },
      }),
    ])

    // ============================
    // ALERTAS RIESGO (8)
    // ============================
    const alertas = await Promise.all([
      // CRÍTICA 1 - María García
      db.alertaRiesgo.create({
        data: {
          empleadoId: mariaGarcia.id,
          propiedadId: cancun.id,
          tipo: 'baja_felicidad',
          tipoEn: 'low_happiness',
          severidad: 'critico',
          mensaje: 'ALERTA CRÍTICA: María García muestra señales de abandono durante onboarding. Índice de felicidad en 68% y descendiendo. Scores de desempeño bajos (45/100). Se recomienda intervención inmediata con mentoría asignada.',
          mensajeEn: 'CRITICAL ALERT: María García shows abandonment signs during onboarding. Happiness index at 68% and declining. Low performance scores (45/100). Immediate intervention with assigned mentoring recommended.',
          probabilidad: 78,
          generadoPorIA: true,
          leida: true,
          resuelta: false,
        },
      }),
      // CRÍTICA 2 - Patricia Ruiz
      db.alertaRiesgo.create({
        data: {
          empleadoId: patriciaRuiz.id,
          propiedadId: losCabos.id,
          tipo: 'nps_bajo',
          tipoEn: 'low_nps',
          severidad: 'critico',
          mensaje: 'ALERTA CRÍTICA: Patricia Ruiz tiene NPS promedio de 5.8 con múltiples quejas de upselling agresivo. En proceso de offboarding. Se requiere acelerar transición y preparar reemplazo inmediato.',
          mensajeEn: 'CRITICAL ALERT: Patricia Ruiz has average NPS of 5.8 with multiple aggressive upselling complaints. In offboarding process. Accelerate transition and prepare immediate replacement.',
          probabilidad: 92,
          generadoPorIA: true,
          leida: true,
          resuelta: false,
        },
      }),
      // ALTA 1 - Diego Flores
      db.alertaRiesgo.create({
        data: {
          empleadoId: diegoFlores.id,
          propiedadId: cdmx.id,
          tipo: 'estancamiento',
          tipoEn: 'stagnation',
          severidad: 'alto',
          mensaje: 'Diego Flores presenta estancamiento en onboarding con scores de 44/100. Adaptación lenta con riesgo de desmotivación. Se sugiere asignar mentor y reforzar capacitación.',
          mensajeEn: 'Diego Flores shows onboarding stagnation with scores of 44/100. Slow adaptation with demotivation risk. Assign mentor and reinforce training.',
          probabilidad: 65,
          generadoPorIA: false,
          leida: false,
          resuelta: false,
        },
      }),
      // ALTA 2 - Fernando Morales
      db.alertaRiesgo.create({
        data: {
          empleadoId: fernandoMorales.id,
          propiedadId: cancun.id,
          tipo: 'estancamiento',
          tipoEn: 'stagnation',
          severidad: 'alto',
          mensaje: 'Fernando Morales muestra progreso lento en onboarding. NPS de 6.8 en sus primeras interacciones. Felicidad en 62%. Requiere acompañamiento adicional.',
          mensajeEn: 'Fernando Morales shows slow onboarding progress. NPS of 6.8 in first interactions. Happiness at 62%. Requires additional support.',
          probabilidad: 55,
          generadoPorIA: false,
          leida: false,
          resuelta: false,
        },
      }),
      // MEDIA 1 - Ana Martínez
      db.alertaRiesgo.create({
        data: {
          empleadoId: anaMartinez.id,
          propiedadId: cdmx.id,
          tipo: 'baja_felicidad',
          tipoEn: 'low_happiness',
          severidad: 'medio',
          mensaje: 'Ana Martínez muestra tendencia descendente en felicidad (72%). Solicitó cambio de turno sin éxito. Riesgo moderado de rotación si no se atiende.',
          mensajeEn: 'Ana Martínez shows declining happiness trend (72%). Requested shift change unsuccessfully. Moderate turnover risk if unaddressed.',
          probabilidad: 35,
          generadoPorIA: false,
          leida: true,
          resuelta: false,
        },
      }),
      // MEDIA 2 - Roberto Sánchez
      db.alertaRiesgo.create({
        data: {
          empleadoId: robertoSanchez.id,
          propiedadId: puebla.id,
          tipo: 'inactividad',
          tipoEn: 'inactivity',
          severidad: 'medio',
          mensaje: 'Roberto Sánchez incrementó inasistencias en el último mes. Comentarios negativos sobre carga de trabajo. Felicidad en 58%.',
          mensajeEn: 'Roberto Sánchez increased absences in the last month. Negative comments about workload. Happiness at 58%.',
          probabilidad: 45,
          generadoPorIA: false,
          leida: false,
          resuelta: false,
        },
      }),
      // BAJA 1 - Miguel Torres
      db.alertaRiesgo.create({
        data: {
          empleadoId: miguelTorres.id,
          propiedadId: playaCarmen.id,
          tipo: 'estancamiento',
          tipoEn: 'stagnation',
          severidad: 'bajo',
          mensaje: 'Miguel Torres podría beneficiarse de certificación avanzada en mixología para mejorar scores de hospitalidad (72/100).',
          mensajeEn: 'Miguel Torres could benefit from advanced mixology certification to improve hospitality scores (72/100).',
          probabilidad: 22,
          generadoPorIA: true,
          leida: true,
          resuelta: true,
        },
      }),
      // BAJA 2 - Juan Pérez (informativa)
      db.alertaRiesgo.create({
        data: {
          empleadoId: juanPerez.id,
          propiedadId: cancun.id,
          tipo: 'fin_contrato',
          tipoEn: 'contract_end',
          severidad: 'bajo',
          mensaje: 'Juan Pérez es candidato para promoción a Capitán. Se recomienda acelerar su formación en Liderazgo en Piso.',
          mensajeEn: 'Juan Pérez is a candidate for promotion to Captain. Recommend accelerating Floor Leadership training.',
          probabilidad: 12,
          generadoPorIA: true,
          leida: true,
          resuelta: true,
        },
      }),
    ])

    // ============================
    // INSTRUCTORES (5)
    // ============================
    const instructores = await Promise.all([
      db.instructor.create({
        data: {
          nombre: 'Ricardo Mendoza',
          especialidad: 'Upselling y Ventas',
          ubicacion: 'Cancún, Q. Roo',
          region: 'cancun',
          calificacion: 4.9,
          tarifaHora: 850,
          disponible: true,
        },
      }),
      db.instructor.create({
        data: {
          nombre: 'Isabel Navarro',
          especialidad: 'Hospitalidad Premium',
          ubicacion: 'Ciudad de México',
          region: 'cdmx',
          calificacion: 4.8,
          tarifaHora: 920,
          disponible: true,
        },
      }),
      db.instructor.create({
        data: {
          nombre: 'Fernando Delgado',
          especialidad: 'Liderazgo',
          ubicacion: 'Puebla, Pue.',
          region: 'puebla',
          calificacion: 4.7,
          tarifaHora: 1100,
          disponible: true,
        },
      }),
      db.instructor.create({
        data: {
          nombre: 'Carmen Salinas',
          especialidad: 'Servicio al Cliente',
          ubicacion: 'Los Cabos, BCS',
          region: 'los_cabos',
          calificacion: 4.6,
          tarifaHora: 780,
          disponible: false,
        },
      }),
      db.instructor.create({
        data: {
          nombre: 'Alejandro Vega',
          especialidad: 'Mixología',
          ubicacion: 'Playa del Carmen, Q. Roo',
          region: 'playa_carmen',
          calificacion: 4.9,
          tarifaHora: 750,
          disponible: true,
        },
      }),
    ])

    const [ricardoMendoza, isabelNavarro, fernandoDelgado, carmenSalinas, alejandroVega] = instructores

    // ============================
    // CANDIDATOS POOL (8)
    // ============================
    const candidatos = await Promise.all([
      // 3 en Cancún
      db.candidatoPool.create({
        data: {
          nombre: 'Andrea Jiménez',
          email: 'andrea.jimenez@email.com',
          telefono: '+52 998 1234 567',
          posicion: 'Mesera',
          posicionEn: 'Waitress',
          region: 'cancun',
          experiencia: 3,
          habilidades: JSON.stringify(['servicio al cliente', 'pos POS', 'vinos básicos', 'trabajo en equipo']),
          estado: 'disponible',
          puntuacionEntrevista: 82,
          notas: 'Excelente actitud. Experiencia en hotel 4 estrellas.',
          fuente: 'portal',
          propiedadId: cancun.id,
        },
      }),
      db.candidatoPool.create({
        data: {
          nombre: 'Luis Ramírez',
          email: 'luis.ramirez@email.com',
          telefono: '+52 998 9876 543',
          posicion: 'Bellboy',
          posicionEn: 'Bellboy',
          region: 'cancun',
          experiencia: 1,
          habilidades: JSON.stringify(['atención al huésped', 'equipaje', 'conocimiento local']),
          estado: 'en_proceso',
          puntuacionEntrevista: 68,
          notas: 'En proceso de segunda entrevista. Buena disposición.',
          fuente: 'referido',
          propiedadId: cancun.id,
        },
      }),
      db.candidatoPool.create({
        data: {
          nombre: 'Gabriela Ortíz',
          email: 'gabriela.ortiz@email.com',
          telefono: '+52 998 5555 123',
          posicion: 'Mesera',
          posicionEn: 'Waitress',
          region: 'cancun',
          experiencia: 5,
          habilidades: JSON.stringify(['servicio premium', 'upselling', 'maridaje de vinos', 'POS Micros']),
          estado: 'contratado',
          puntuacionEntrevista: 91,
          notas: 'Contratada como reemplazo de Patricia Ruiz (MES-701). Excelente perfil. Inicia onboarding el 25/01.',
          fuente: 'agencia',
          propiedadId: losCabos.id,
          empleadoReemplazaId: patriciaRuiz.id,
          fechaContratacion: new Date('2025-01-20'),
          onboardingCompletado: false,
          nivelAlcanzado: 0,
        },
      }),
      // 2 en CDMX
      db.candidatoPool.create({
        data: {
          nombre: 'Roberto Medina',
          email: 'roberto.medina@email.com',
          telefono: '+52 55 3333 4444',
          posicion: 'Recepcionista',
          posicionEn: 'Receptionist',
          region: 'cdmx',
          experiencia: 2,
          habilidades: JSON.stringify(['Opera PMS', 'idioma inglés', 'atención telefónica']),
          estado: 'disponible',
          puntuacionEntrevista: 75,
          notas: 'Buen nivel de inglés. Experiencia en hotel boutique.',
          fuente: 'portal',
          propiedadId: cdmx.id,
        },
      }),
      db.candidatoPool.create({
        data: {
          nombre: 'Patricia Wong',
          email: 'patricia.wong@email.com',
          telefono: '+52 55 7777 8888',
          posicion: 'Recepcionista',
          posicionEn: 'Receptionist',
          region: 'cdmx',
          experiencia: 4,
          habilidades: JSON.stringify(['multiidioma', 'Opera PMS', 'resolución de problemas', 'concierge']),
          estado: 'disponible',
          puntuacionEntrevista: 88,
          notas: 'Candidata fuerte. Habla 3 idiomas. Disponible inmediato.',
          fuente: 'spontaneous',
        },
      }),
      // 1 en Puebla
      db.candidatoPool.create({
        data: {
          nombre: 'Marco Antonio Díaz',
          email: 'marco.diaz@email.com',
          telefono: '+52 222 1111 2222',
          posicion: 'Mesero',
          posicionEn: 'Waiter',
          region: 'puebla',
          experiencia: 2,
          habilidades: JSON.stringify(['servicio en restaurante', 'carta de vinos', 'POS']),
          estado: 'en_proceso',
          puntuacionEntrevista: 70,
          notas: 'En espera de verificación de referencias.',
          fuente: 'referido',
          propiedadId: puebla.id,
        },
      }),
      // 1 en Los Cabos
      db.candidatoPool.create({
        data: {
          nombre: 'Carolina Vega',
          email: 'carolina.vega@email.com',
          telefono: '+52 624 9999 0000',
          posicion: 'Bartender',
          posicionEn: 'Bartender',
          region: 'los_cabos',
          experiencia: 6,
          habilidades: JSON.stringify(['mixología avanzada', 'coctelería creativa', 'bar management', 'TIPS certificado']),
          estado: 'disponible',
          puntuacionEntrevista: 90,
          notas: 'Perfil senior. Podría ser bar manager. Muy buen candidato.',
          fuente: 'agencia',
          propiedadId: losCabos.id,
        },
      }),
      // 1 en Veracruz
      db.candidatoPool.create({
        data: {
          nombre: 'José Luis Fernández',
          email: 'jose.fernandez@email.com',
          telefono: '+52 229 4444 5555',
          posicion: 'Mesero',
          posicionEn: 'Waiter',
          region: 'veracruz',
          experiencia: 3,
          habilidades: JSON.stringify(['servicio en restaurante', 'mariscos', 'vinos', 'POS']),
          estado: 'disponible',
          puntuacionEntrevista: 76,
          notas: 'Experiencia en restaurantes de mariscos. Buen referente.',
          fuente: 'portal',
          propiedadId: veracruz.id,
        },
      }),
    ])

    // ============================
    // NOTIFICACIONES (6)
    // ============================
    const notificaciones = await Promise.all([
      // Empleado dado de baja
      db.notificacion.create({
        data: {
          tipo: 'empleado_baja',
          titulo: 'Empleado en proceso de baja',
          tituloEn: 'Employee in offboarding process',
          mensaje: 'Patricia Ruiz (MES-701) ha sido dada de baja en Resort Los Cabos. NPS promedio: 5.8. Se requiere reemplazo urgente.',
          mensajeEn: 'Patricia Ruiz (MES-701) has been offboarded at Los Cabos Resort. Average NPS: 5.8. Urgent replacement required.',
          leida: false,
          propiedadId: losCabos.id,
          prioridad: 'urgente',
          accionUrl: '/empleados/' + patriciaRuiz.id,
        },
      }),
      // Alerta de rotación crítica
      db.notificacion.create({
        data: {
          tipo: 'alerta_ia',
          titulo: 'Alerta de rotación crítica detectada',
          tituloEn: 'Critical turnover alert detected',
          mensaje: 'El Agente de IA detectó 2 empleados con riesgo crítico de abandono: María García (MES-402) y Patricia Ruiz (MES-701). Intervención inmediata recomendada.',
          mensajeEn: 'AI Agent detected 2 employees with critical turnover risk: María García (MES-402) and Patricia Ruiz (MES-701). Immediate intervention recommended.',
          leida: true,
          propiedadId: cancun.id,
          prioridad: 'urgente',
        },
      }),
      // Solicitud de capacitación
      db.notificacion.create({
        data: {
          tipo: 'solicitud_capacitacion',
          titulo: 'Nueva solicitud de capacitación',
          tituloEn: 'New training request',
          mensaje: 'Carmen Delgado solicitó capacitación de "Liderazgo en Piso" para 3 empleados del Hotel Playa Cancún.',
          mensajeEn: 'Carmen Delgado requested "Floor Leadership" training for 3 employees at Cancún Beach Hotel.',
          leida: false,
          propiedadId: cancun.id,
          prioridad: 'normal',
          accionUrl: '/capacitaciones',
        },
      }),
      // Curso completado
      db.notificacion.create({
        data: {
          tipo: 'curso_completado',
          titulo: 'Curso completado exitosamente',
          tituloEn: 'Course completed successfully',
          mensaje: 'Sofía Vargas completó "Técnicas de Upselling Avanzado" con puntuación de 90/100. +20 puntos de carrera.',
          mensajeEn: 'Sofía Vargas completed "Advanced Upselling Techniques" with a score of 90/100. +20 career points.',
          leida: true,
          propiedadId: cancun.id,
          prioridad: 'normal',
        },
      }),
      // Reemplazo necesario
      db.notificacion.create({
        data: {
          tipo: 'reemplazo_necesario',
          titulo: 'Reemplazo necesario - Mesera en Los Cabos',
          tituloEn: 'Replacement needed - Waitress in Los Cabos',
          mensaje: 'Se requiere reemplazo para Patricia Ruiz (MES-701) en Resort Los Cabos. Candidata asignada: Gabriela Ortíz. Inicia onboarding 25/01.',
          mensajeEn: 'Replacement needed for Patricia Ruiz (MES-701) at Los Cabos Resort. Assigned candidate: Gabriela Ortíz. Starts onboarding 01/25.',
          leida: false,
          propiedadId: losCabos.id,
          prioridad: 'alta',
          accionUrl: '/empleados',
        },
      }),
      // NPS bajo detectado
      db.notificacion.create({
        data: {
          tipo: 'alerta_ia',
          titulo: 'Patrón de upselling agresivo detectado',
          tituloEn: 'Aggressive upselling pattern detected',
          mensaje: 'El Agente de IA detectó patrón de upselling agresivo en Patricia Ruiz (MES-701): ventas altas pero NPS de 4-5. Se recomienda intervención inmediata.',
          mensajeEn: 'AI Agent detected aggressive upselling pattern in Patricia Ruiz (MES-701): high sales but NPS of 4-5. Immediate intervention recommended.',
          leida: true,
          propiedadId: losCabos.id,
          prioridad: 'alta',
        },
      }),
    ])

    // ============================
    // SOLICITUD CAPACITACION (4)
    // ============================
    const solicitudes = await Promise.all([
      db.solicitudCapacitacion.create({
        data: {
          propiedadId: cancun.id,
          capacitacionId: liderazgoPiso.id,
          modalidad: 'presencial',
          fechaSolicitada: new Date('2025-02-10'),
          participantes: 3,
          instructorId: fernandoDelgado.id,
          nombreInstructor: 'Fernando Delgado',
          estado: 'pendiente',
          costo: 6600,
          notas: 'Para Juan Pérez, Sofía Vargas y un mesero más. Solicitado por Carmen Delgado.',
          creadoPor: carmenDelgado.id,
        },
      }),
      db.solicitudCapacitacion.create({
        data: {
          propiedadId: cdmx.id,
          capacitacionId: ventaTours.id,
          modalidad: 'virtual',
          fechaSolicitada: new Date('2025-02-05'),
          participantes: 4,
          instructorId: ricardoMendoza.id,
          nombreInstructor: 'Ricardo Mendoza',
          estado: 'confirmada',
          fechaConfirmada: new Date('2025-01-18'),
          costo: 1200,
          notas: 'Para recepcionistas del Gran Hotel CDMX. Incluye a Ana Martínez y Diego Flores.',
          creadoPor: carmenDelgado.id,
        },
      }),
      db.solicitudCapacitacion.create({
        data: {
          propiedadId: playaCarmen.id,
          capacitacionId: cocktails.id,
          modalidad: 'virtual',
          fechaSolicitada: new Date('2025-02-15'),
          participantes: 2,
          instructorId: alejandroVega.id,
          nombreInstructor: 'Alejandro Vega',
          estado: 'confirmada',
          fechaConfirmada: new Date('2025-01-19'),
          costo: 900,
          notas: 'Para Miguel Torres y nuevo bartender.',
          creadoPor: carmenDelgado.id,
        },
      }),
      db.solicitudCapacitacion.create({
        data: {
          propiedadId: puebla.id,
          tema: 'Manejo de Estrés y Carga de Trabajo',
          modalidad: 'presencial',
          fechaSolicitada: new Date('2025-02-20'),
          participantes: 8,
          estado: 'pendiente',
          costo: 5000,
          notas: 'Solicitado por departamento de Ama de Llaves. Personal reporta sobrecarga de trabajo.',
          creadoPor: carmenDelgado.id,
        },
      }),
    ])

    // ============================
    // SERVICIOS (35)
    // ============================
    const servicios = await Promise.all([
      // ---- Hotel Playa Cancún ----
      // Platillos
      db.servicio.create({
        data: {
          nombre: 'Filete de Res a la Parrilla',
          nombreEn: 'Grilled Beef Fillet',
          descripcion: 'Corte premium de res a la parrilla con guarnición de vegetales asados y puré de papa trufado.',
          descripcionEn: 'Premium grilled beef cut with roasted vegetables and truffle mashed potatoes.',
          categoria: 'platillo', esUpselling: true, precioNormal: 380, precioUpselling: 520,
          objetivoUpselling: 'Vender maridaje de vino con este platillo para aumentar ticket promedio',
          objetivoUpsellingEn: 'Sell wine pairing with this dish to increase average ticket',
          propiedadId: cancun.id, orden: 1,
        },
      }),
      db.servicio.create({
        data: {
          nombre: 'Camarones al Mojo de Ajo',
          nombreEn: 'Garlic Butter Shrimp',
          descripcion: 'Camarones frescos salteados al mojo de ajo con arroz blanco y ensalada tropical.',
          descripcionEn: 'Fresh shrimp sautéed in garlic butter with white rice and tropical salad.',
          categoria: 'platillo', esUpselling: false, precioNormal: 290,
          propiedadId: cancun.id, orden: 2,
        },
      }),
      db.servicio.create({
        data: {
          nombre: 'Ensalada César',
          nombreEn: 'Caesar Salad',
          descripcion: 'Ensalada César clásica con crutones, parmesano y aderezo casero.',
          descripcionEn: 'Classic Caesar salad with croutons, parmesan and house dressing.',
          categoria: 'platillo', esUpselling: true, precioNormal: 180, precioUpselling: 260,
          objetivoUpselling: 'Ofrecer upgrade con salmón fresco para incrementar valor del platillo',
          objetivoUpsellingEn: 'Offer upgrade with fresh salmon to increase dish value',
          propiedadId: cancun.id, orden: 3,
        },
      }),
      // Bebidas
      db.servicio.create({
        data: {
          nombre: 'Margarita Premium',
          nombreEn: 'Premium Margarita',
          descripcion: 'Margarita preparada con tequila 100% agave, licor de naranja y limón fresco.',
          descripcionEn: 'Margarita made with 100% agave tequila, orange liqueur and fresh lime.',
          categoria: 'bebida', esUpselling: true, precioNormal: 160, precioUpselling: 220,
          objetivoUpselling: 'Sugerir versión con tequila reposado premium para experiencia superior',
          objetivoUpsellingEn: 'Suggest version with premium reposado tequila for superior experience',
          propiedadId: cancun.id, orden: 10,
        },
      }),
      db.servicio.create({
        data: {
          nombre: 'Mojito Cubano',
          nombreEn: 'Cuban Mojito',
          descripcion: 'Mojito clásico con ron blanco, menta fresca, limón y soda.',
          descripcionEn: 'Classic mojito with white rum, fresh mint, lime and soda.',
          categoria: 'bebida', esUpselling: false, precioNormal: 140,
          propiedadId: cancun.id, orden: 11,
        },
      }),
      db.servicio.create({
        data: {
          nombre: 'Vino Tinto Copa',
          nombreEn: 'Red Wine by the Glass',
          descripcion: 'Selección de vinos tintos mexicanos e internacionales por copa.',
          descripcionEn: 'Selection of Mexican and international red wines by the glass.',
          categoria: 'bebida', esUpselling: true, precioNormal: 120, precioUpselling: 280,
          objetivoUpselling: 'Vender botella completa en lugar de copa para mayor margen',
          objetivoUpsellingEn: 'Sell full bottle instead of glass for higher margin',
          propiedadId: cancun.id, orden: 12,
        },
      }),
      // Tours
      db.servicio.create({
        data: {
          nombre: 'Tour Isla Mujeres',
          nombreEn: 'Isla Mujeres Tour',
          descripcion: 'Excursión en catamarán a Isla Mujeres con snorkel, comida y open bar incluidos.',
          descripcionEn: 'Catamaran excursion to Isla Mujeres with snorkel, lunch and open bar included.',
          categoria: 'tour', esUpselling: true, precioNormal: 1200, precioUpselling: 1800,
          objetivoUpselling: 'Ofrecer upgrade a tour privado para grupos y parejas',
          objetivoUpsellingEn: 'Offer upgrade to private tour for groups and couples',
          propiedadId: cancun.id, orden: 20,
        },
      }),
      db.servicio.create({
        data: {
          nombre: 'Tour Chichén Itzá VIP',
          nombreEn: 'Chichén Itzá VIP Tour',
          descripcion: 'Tour VIP a Chichén Itzá con guía privado, acceso exclusivo y comida gourmet.',
          descripcionEn: 'VIP tour to Chichén Itzá with private guide, exclusive access and gourmet lunch.',
          categoria: 'tour', esUpselling: false, precioNormal: 2500,
          propiedadId: cancun.id, orden: 21,
        },
      }),
      db.servicio.create({
        data: {
          nombre: 'Snorkel Arrecife',
          nombreEn: 'Reef Snorkeling',
          descripcion: 'Experiencia de snorkel en el segundo arrecife más grande del mundo con equipo incluido.',
          descripcionEn: "Snorkeling experience on the world's second largest reef with equipment included.",
          categoria: 'tour', esUpselling: false, precioNormal: 800,
          propiedadId: cancun.id, orden: 22,
        },
      }),
      // Masajes
      db.servicio.create({
        data: {
          nombre: 'Masaje Relajante 60min',
          nombreEn: 'Relaxation Massage 60min',
          descripcion: 'Masaje relajante de cuerpo completo con aceites esenciales y técnica sueca.',
          descripcionEn: 'Full body relaxation massage with essential oils and Swedish technique.',
          categoria: 'masaje', esUpselling: true, precioNormal: 900, precioUpselling: 1300,
          objetivoUpselling: 'Ofrecer upgrade a 90min con aromaterapia para mayor relajación',
          objetivoUpsellingEn: 'Offer upgrade to 90min with aromatherapy for deeper relaxation',
          propiedadId: cancun.id, orden: 30,
        },
      }),
      db.servicio.create({
        data: {
          nombre: 'Masaje Pareja',
          nombreEn: 'Couples Massage',
          descripcion: 'Masaje simultáneo para parejas en suite privada con velas y champagne.',
          descripcionEn: 'Simultaneous couples massage in private suite with candles and champagne.',
          categoria: 'masaje', esUpselling: false, precioNormal: 1600,
          propiedadId: cancun.id, orden: 31,
        },
      }),
      // Habitaciones
      db.servicio.create({
        data: {
          nombre: 'Upgrade Suite Ocean View',
          nombreEn: 'Ocean View Suite Upgrade',
          descripcion: 'Upgrade a suite con vista al mar Caribe, balcón privado y minibar premium.',
          descripcionEn: 'Upgrade to suite with Caribbean Sea view, private balcony and premium minibar.',
          categoria: 'habitacion', esUpselling: true, precioNormal: 890, precioUpselling: 890,
          objetivoUpselling: 'Ofrecer upgrade al check-in cuando hay disponibilidad',
          objetivoUpsellingEn: 'Offer upgrade at check-in when availability exists',
          propiedadId: cancun.id, orden: 40,
        },
      }),
      db.servicio.create({
        data: {
          nombre: 'Upgrade Suite Presidencial',
          nombreEn: 'Presidential Suite Upgrade',
          descripcion: 'Upgrade a suite presidencial con terraza panorámica, jacuzzi privado y servicio de mayordomo.',
          descripcionEn: 'Upgrade to presidential suite with panoramic terrace, private jacuzzi and butler service.',
          categoria: 'habitacion', esUpselling: false, precioNormal: 2200,
          propiedadId: cancun.id, orden: 41,
        },
      }),

      // ---- Restaurante La Terraza ----
      // Platillos
      db.servicio.create({
        data: {
          nombre: 'Pasta Trufa',
          nombreEn: 'Truffle Pasta',
          descripcion: 'Pasta fresca con salsa de trufa negra, parmesano 24 meses y mantequilla clarificada.',
          descripcionEn: 'Fresh pasta with black truffle sauce, 24-month parmesan and clarified butter.',
          categoria: 'platillo', esUpselling: true, precioNormal: 280, precioUpselling: 380,
          objetivoUpselling: 'Sugerir versión con trufa fresca rallada en mesa para experiencia premium',
          objetivoUpsellingEn: 'Suggest version with fresh truffle shaved tableside for premium experience',
          propiedadId: puebla.id, orden: 1,
        },
      }),
      db.servicio.create({
        data: {
          nombre: 'Risotto Hongos',
          nombreEn: 'Mushroom Risotto',
          descripcion: 'Risotto cremoso con mezcla de hongos silvestres y parmesano.',
          descripcionEn: 'Creamy risotto with wild mushroom medley and parmesan.',
          categoria: 'platillo', esUpselling: false, precioNormal: 240,
          propiedadId: puebla.id, orden: 2,
        },
      }),
      db.servicio.create({
        data: {
          nombre: 'Postre del Chef',
          nombreEn: "Chef's Dessert",
          descripcion: 'Creación dulce del chef con ingredientes de temporada y presentación artística.',
          descripcionEn: "Chef's sweet creation with seasonal ingredients and artistic presentation.",
          categoria: 'platillo', esUpselling: true, precioNormal: 180, precioUpselling: 280,
          objetivoUpselling: 'Ofrecer maridaje con vino dulce o digestivo para completar la experiencia',
          objetivoUpsellingEn: 'Offer pairing with dessert wine or digestif to complete the experience',
          propiedadId: puebla.id, orden: 3,
        },
      }),
      // Bebidas
      db.servicio.create({
        data: {
          nombre: 'Cóctel de la Casa',
          nombreEn: 'House Cocktail',
          descripcion: 'Cóctel exclusivo de La Terraza con mezcal, frutas de temporada y hierbas aromáticas.',
          descripcionEn: 'La Terraza exclusive cocktail with mezcal, seasonal fruits and aromatic herbs.',
          categoria: 'bebida', esUpselling: true, precioNormal: 150, precioUpselling: 220,
          objetivoUpselling: 'Ofrecer versión premium con licor artesanal de alta gama',
          objetivoUpsellingEn: 'Offer premium version with high-end artisanal liquor',
          propiedadId: puebla.id, orden: 10,
        },
      }),
      db.servicio.create({
        data: {
          nombre: 'Cerveza Artesanal',
          nombreEn: 'Craft Beer',
          descripcion: 'Selección de cervezas artesanales locales: IPA, Stout y Blonde Ale.',
          descripcionEn: 'Selection of local craft beers: IPA, Stout and Blonde Ale.',
          categoria: 'bebida', esUpselling: false, precioNormal: 90,
          propiedadId: puebla.id, orden: 11,
        },
      }),
      db.servicio.create({
        data: {
          nombre: 'Mezcal Reposado',
          nombreEn: 'Reposado Mezcal',
          descripcion: 'Mezcal reposado artesanal con notas de madera y agave cocido. Servido con naranja y sal de gusano.',
          descripcionEn: 'Artisanal reposado mezcal with wood and cooked agave notes. Served with orange and worm salt.',
          categoria: 'bebida', esUpselling: false, precioNormal: 180,
          propiedadId: puebla.id, orden: 12,
        },
      }),

      // ---- Gran Hotel CDMX ----
      // Platillos
      db.servicio.create({
        data: {
          nombre: 'Chilaquiles Divorciados',
          nombreEn: 'Divorced Chilaquiles',
          descripcion: 'Chilaquiles con salsa roja y verde, coronados con dos huevos estrellados y crema.',
          descripcionEn: 'Chilaquiles with red and green salsa, topped with two fried eggs and cream.',
          categoria: 'platillo', esUpselling: true, precioNormal: 190, precioUpselling: 280,
          objetivoUpselling: 'Sugerir agregar arrachera para convertir en plato fuerte completo',
          objetivoUpsellingEn: 'Suggest adding arrachera to upgrade to a complete main course',
          propiedadId: cdmx.id, orden: 1,
        },
      }),
      db.servicio.create({
        data: {
          nombre: 'Huevos Benedictinos',
          nombreEn: 'Eggs Benedict',
          descripcion: 'Huevos pochados sobre muffin inglés con jamón y salsa holandesa casera.',
          descripcionEn: 'Poached eggs on English muffin with ham and homemade hollandaise sauce.',
          categoria: 'platillo', esUpselling: false, precioNormal: 220,
          propiedadId: cdmx.id, orden: 2,
        },
      }),
      // Bebidas
      db.servicio.create({
        data: {
          nombre: 'Café de Olla',
          nombreEn: 'Mexican Pot Coffee',
          descripcion: 'Café de olla tradicional preparado con piloncillo, canela y clavo.',
          descripcionEn: 'Traditional Mexican pot coffee brewed with piloncillo, cinnamon and clove.',
          categoria: 'bebida', esUpselling: true, precioNormal: 70, precioUpselling: 120,
          objetivoUpselling: 'Ofrecer acompañamiento de pan dulce artesanal para experiencia completa',
          objetivoUpsellingEn: 'Offer artisanal sweet bread pairing for complete experience',
          propiedadId: cdmx.id, orden: 10,
        },
      }),
      db.servicio.create({
        data: {
          nombre: 'Chocolate Abuelita',
          nombreEn: 'Mexican Hot Chocolate',
          descripcion: 'Chocolate caliente tradicional con canela, preparado con tabletas Abuelita.',
          descripcionEn: 'Traditional hot chocolate with cinnamon, made with Abuelita tablets.',
          categoria: 'bebida', esUpselling: false, precioNormal: 80,
          propiedadId: cdmx.id, orden: 11,
        },
      }),
      // Tours
      db.servicio.create({
        data: {
          nombre: 'Tour Centro Histórico',
          nombreEn: 'Historic Center Tour',
          descripcion: 'Recorrido guiado por el Centro Histórico de la CDMX, Patrimonio de la Humanidad UNESCO.',
          descripcionEn: 'Guided tour of Mexico City Historic Center, UNESCO World Heritage Site.',
          categoria: 'tour', esUpselling: true, precioNormal: 650, precioUpselling: 950,
          objetivoUpselling: 'Ofrecer upgrade a tour privado con guía exclusivo y transporte de lujo',
          objetivoUpsellingEn: 'Offer upgrade to private tour with exclusive guide and luxury transport',
          propiedadId: cdmx.id, orden: 20,
        },
      }),
      db.servicio.create({
        data: {
          nombre: 'Tour Museos',
          nombreEn: 'Museum Tour',
          descripcion: 'Visita a los principales museos de la CDMX incluyendo Museo de Antropología y Museo de Arte Moderno.',
          descripcionEn: 'Visit to the main museums of Mexico City including Anthropology Museum and Modern Art Museum.',
          categoria: 'tour', esUpselling: false, precioNormal: 500,
          propiedadId: cdmx.id, orden: 21,
        },
      }),
      // Masajes
      db.servicio.create({
        data: {
          nombre: 'Masaje Deportivo 45min',
          nombreEn: 'Sports Massage 45min',
          descripcion: 'Masaje deportivo enfocado en recuperación muscular y liberación de tensión profunda.',
          descripcionEn: 'Sports massage focused on muscle recovery and deep tension release.',
          categoria: 'masaje', esUpselling: true, precioNormal: 700, precioUpselling: 1000,
          objetivoUpselling: 'Sugerir upgrade a 75min para trabajo más profundo y estiramiento asistido',
          objetivoUpsellingEn: 'Suggest upgrade to 75min for deeper work and assisted stretching',
          propiedadId: cdmx.id, orden: 30,
        },
      }),
      // Habitaciones
      db.servicio.create({
        data: {
          nombre: 'Upgrade Executive Floor',
          nombreEn: 'Executive Floor Upgrade',
          descripcion: 'Upgrade a piso ejecutivo con acceso a Executive Lounge, desayuno y WiFi premium.',
          descripcionEn: 'Upgrade to executive floor with Executive Lounge access, breakfast and premium WiFi.',
          categoria: 'habitacion', esUpselling: false, precioNormal: 450,
          propiedadId: cdmx.id, orden: 40,
        },
      }),
      db.servicio.create({
        data: {
          nombre: 'Upgrade Suite Terraza',
          nombreEn: 'Terrace Suite Upgrade',
          descripcion: 'Upgrade a suite con terraza privada y vista a la Alameda Central.',
          descripcionEn: 'Upgrade to suite with private terrace and view of Alameda Central.',
          categoria: 'habitacion', esUpselling: false, precioNormal: 780,
          propiedadId: cdmx.id, orden: 41,
        },
      }),

      // ---- Bar Mar Azul ----
      // Bebidas
      db.servicio.create({
        data: {
          nombre: 'Mezcal Margarita',
          nombreEn: 'Mezcal Margarita',
          descripcion: 'Margarita con mezcal joven, licor de naranja y sal de chapulín.',
          descripcionEn: 'Margarita with young mezcal, orange liqueur and grasshopper salt.',
          categoria: 'bebida', esUpselling: true, precioNormal: 180, precioUpselling: 280,
          objetivoUpselling: 'Ofrecer versión con mezcal artesanal de alta gama para experiencia premium',
          objetivoUpsellingEn: 'Offer version with high-end artisanal mezcal for premium experience',
          propiedadId: playaCarmen.id, orden: 10,
        },
      }),
      db.servicio.create({
        data: {
          nombre: 'Cerveza Premium',
          nombreEn: 'Premium Beer',
          descripcion: 'Selección de cervezas premium internacionales: Stella Artois, Heineken y Corona Familiar.',
          descripcionEn: 'Selection of premium international beers: Stella Artois, Heineken and Corona Familiar.',
          categoria: 'bebida', esUpselling: true, precioNormal: 100, precioUpselling: 160,
          objetivoUpselling: 'Ofrecer botana de cortesía con upgrade a presentación premium',
          objetivoUpsellingEn: 'Offer complimentary snack with upgrade to premium presentation',
          propiedadId: playaCarmen.id, orden: 11,
        },
      }),
      db.servicio.create({
        data: {
          nombre: 'Cuba Libre',
          nombreEn: 'Cuba Libre',
          descripcion: 'Ron con Coca-Cola y limón fresco. El clásico que nunca falla.',
          descripcionEn: 'Rum with Coca-Cola and fresh lime. The classic that never fails.',
          categoria: 'bebida', esUpselling: false, precioNormal: 120,
          propiedadId: playaCarmen.id, orden: 12,
        },
      }),
      // Experiencias
      db.servicio.create({
        data: {
          nombre: 'Noche de Catálogo de Mezcal',
          nombreEn: 'Mezcal Tasting Night',
          descripcion: 'Experiencia de cata de 5 mezcales artesanales con guía especializado y maridaje de botanas oaxaqueñas.',
          descripcionEn: 'Tasting experience of 5 artisanal mezcals with expert guide and Oaxacan snack pairing.',
          categoria: 'experiencia', esUpselling: true, precioNormal: 450, precioUpselling: 750,
          objetivoUpselling: 'Ofrecer upgrade con maridaje completo de platillos oaxaqueños',
          objetivoUpsellingEn: 'Offer upgrade with full Oaxacan dish pairing',
          propiedadId: playaCarmen.id, orden: 20,
        },
      }),

      // ---- Resort Los Cabos ----
      // Platillos
      db.servicio.create({
        data: {
          nombre: 'Tacos de Pescado Gourmet',
          nombreEn: 'Gourmet Fish Tacos',
          descripcion: 'Tacos de pescado empapelado con repollo morado, pico de gallo y salsa chipotle aioli.',
          descripcionEn: 'Battered fish tacos with purple cabbage, pico de gallo and chipotle aioli sauce.',
          categoria: 'platillo', esUpselling: true, precioNormal: 240, precioUpselling: 380,
          objetivoUpselling: 'Sugerir mariscada completa para compartir con ceviche y aguachile',
          objetivoUpsellingEn: 'Suggest complete seafood platter to share with ceviche and aguachile',
          propiedadId: losCabos.id, orden: 1,
        },
      }),
      db.servicio.create({
        data: {
          nombre: 'Ceviche Premium',
          nombreEn: 'Premium Ceviche',
          descripcion: 'Ceviche de pescado y camarón con aguacate, mango y chile habanero.',
          descripcionEn: 'Fish and shrimp ceviche with avocado, mango and habanero pepper.',
          categoria: 'platillo', esUpselling: false, precioNormal: 280,
          propiedadId: losCabos.id, orden: 2,
        },
      }),
      // Tours
      db.servicio.create({
        data: {
          nombre: 'Sunset Sailing',
          nombreEn: 'Sunset Sailing',
          descripcion: 'Travesía en velero al atardecer con open bar, botanas y música en vivo.',
          descripcionEn: 'Sunset sailing cruise with open bar, appetizers and live music.',
          categoria: 'tour', esUpselling: true, precioNormal: 1800, precioUpselling: 2500,
          objetivoUpselling: 'Ofrecer upgrade a velero privado para experiencia exclusiva',
          objetivoUpsellingEn: 'Offer upgrade to private sailboat for exclusive experience',
          propiedadId: losCabos.id, orden: 20,
        },
      }),
      db.servicio.create({
        data: {
          nombre: 'Tour El Arco',
          nombreEn: 'The Arch Tour',
          descripcion: 'Tour en lancha al famoso Arco de Los Cabos con parada en Playa del Amor.',
          descripcionEn: "Boat tour to the famous Cabos Arch with stop at Lover's Beach.",
          categoria: 'tour', esUpselling: true, precioNormal: 900, precioUpselling: 1300,
          objetivoUpselling: 'Ofrecer upgrade con lunch incluido en restaurante frente al mar',
          objetivoUpsellingEn: 'Offer upgrade with lunch included at oceanfront restaurant',
          propiedadId: losCabos.id, orden: 21,
        },
      }),
      // Masajes
      db.servicio.create({
        data: {
          nombre: 'Masaje Hot Stone 90min',
          nombreEn: 'Hot Stone Massage 90min',
          descripcion: 'Masaje con piedras volcánicas calientes para liberación profunda de tensión muscular.',
          descripcionEn: 'Massage with hot volcanic stones for deep muscle tension release.',
          categoria: 'masaje', esUpselling: true, precioNormal: 1200, precioUpselling: 1800,
          objetivoUpselling: 'Sugerir combo con facial anti-edad para experiencia spa completa',
          objetivoUpsellingEn: 'Suggest combo with anti-aging facial for complete spa experience',
          propiedadId: losCabos.id, orden: 30,
        },
      }),
      db.servicio.create({
        data: {
          nombre: 'Spa Day Package',
          nombreEn: 'Spa Day Package',
          descripcion: 'Paquete completo de spa: masaje 60min, facial, manicure y acceso a instalaciones.',
          descripcionEn: 'Complete spa package: 60min massage, facial, manicure and facility access.',
          categoria: 'paquete', esUpselling: false, precioNormal: 2500,
          propiedadId: losCabos.id, orden: 31,
        },
      }),
      // Habitaciones
      db.servicio.create({
        data: {
          nombre: 'Upgrade Villa Privada',
          nombreEn: 'Private Villa Upgrade',
          descripcion: 'Upgrade a villa privada con alberca, cocina gourmet y servicio de chef personal.',
          descripcionEn: 'Upgrade to private villa with pool, gourmet kitchen and personal chef service.',
          categoria: 'habitacion', esUpselling: false, precioNormal: 3500,
          propiedadId: losCabos.id, orden: 40,
        },
      }),

      // ---- Restaurante Puerto Veracruz ----
      // Platillos
      db.servicio.create({
        data: {
          nombre: 'Huachinango a la Veracruzana',
          nombreEn: 'Veracruz-Style Red Snapper',
          descripcion: 'Huachinango entero al horno con salsa de tomate, aceitunas, alcaparras y chile güero.',
          descripcionEn: 'Whole baked red snapper with tomato sauce, olives, capers and yellow pepper.',
          categoria: 'platillo', esUpselling: true, precioNormal: 320, precioUpselling: 450,
          objetivoUpselling: 'Sugerir maridaje con vino blanco para realzar los sabores veracruzanos',
          objetivoUpsellingEn: 'Suggest white wine pairing to enhance the Veracruz flavors',
          propiedadId: veracruz.id, orden: 1,
        },
      }),
      db.servicio.create({
        data: {
          nombre: 'Arroz a la Tumbada',
          nombreEn: 'Veracruz Seafood Rice',
          descripcion: 'Arroz con mariscos veracruzano: camarón, cangrejo, ostión y caldo de pescado.',
          descripcionEn: 'Veracruz-style seafood rice: shrimp, crab, oyster and fish broth.',
          categoria: 'platillo', esUpselling: false, precioNormal: 280,
          propiedadId: veracruz.id, orden: 2,
        },
      }),
      // Bebidas
      db.servicio.create({
        data: {
          nombre: 'Torito de Cacahuete',
          nombreEn: 'Peanut Torito',
          descripcion: 'Bebida tradicional veracruzana de cacahuete con leche condensada y aguardiente.',
          descripcionEn: 'Traditional Veracruz peanut drink with condensed milk and aguardiente.',
          categoria: 'bebida', esUpselling: true, precioNormal: 110, precioUpselling: 180,
          objetivoUpselling: 'Ofrecer versión con ron premium añejo para experiencia superior',
          objetivoUpsellingEn: 'Offer version with premium aged rum for superior experience',
          propiedadId: veracruz.id, orden: 10,
        },
      }),
      db.servicio.create({
        data: {
          nombre: 'Agua de Horchata',
          nombreEn: 'Horchata Water',
          descripcion: 'Agua fresca de horchata con arroz, canela y almendra. Refrescante y tradicional.',
          descripcionEn: 'Fresh horchata water with rice, cinnamon and almond. Refreshing and traditional.',
          categoria: 'bebida', esUpselling: false, precioNormal: 50,
          propiedadId: veracruz.id, orden: 11,
        },
      }),
    ])

    // ============================
    // LOG AGENTE IA (4)
    // ============================
    const logsAgenteIA = await Promise.all([
      db.logAgenteIA.create({
        data: {
          tipo: 'prediccion_churn',
          empleadoId: mariaGarcia.id,
          inputPayload: JSON.stringify({ empleadoId: 'MES-402', analisisCompleto: true }),
          outputResultado: JSON.stringify({
            riesgoBaja: 78,
            nivelRiesgo: 'alto',
            justificacion: 'Empleado en onboarding con scores bajos y felicidad decreciente. Señales de desmotivación.',
            sugerencias: ['Mentoría con Laura Hernández', 'Refuerzo en Upselling Básico'],
          }),
          nivelRiesgo: 'alto',
          procesado: true,
        },
      }),
      db.logAgenteIA.create({
        data: {
          tipo: 'prediccion_churn',
          empleadoId: patriciaRuiz.id,
          inputPayload: JSON.stringify({ empleadoId: 'MES-701', analisisCompleto: true }),
          outputResultado: JSON.stringify({
            riesgoBaja: 92,
            nivelRiesgo: 'critico',
            justificacion: 'NPS muy bajo, quejas recurrentes, upselling agresivo. Felicidad en nivel crítico.',
            sugerencias: ['Acelerar transición', 'Preparar reemplazo del pool de candidatos'],
          }),
          nivelRiesgo: 'critico',
          procesado: true,
        },
      }),
      db.logAgenteIA.create({
        data: {
          tipo: 'analisis_venta',
          ventaId: ventas[7].id, // Patricia Ruiz upselling agresivo
          inputPayload: JSON.stringify({ ventaId: ventas[7].id, analizarNPS: true }),
          outputResultado: JSON.stringify({
            tipo: 'upselling_agresivo',
            detalle: 'Cliente reportó presión excesiva durante venta de upgrade. NPS 5 con upselling de $580.',
            recomendacion: 'Intervenir con empleado. Patrón recurrente detectado.',
          }),
          procesado: true,
        },
      }),
      db.logAgenteIA.create({
        data: {
          tipo: 'sugerencia_capacitacion',
          empleadoId: juanPerez.id,
          inputPayload: JSON.stringify({ empleadoId: 'MES-401', evaluarRutaCarrera: true }),
          outputResultado: JSON.stringify({
            capacitacionSugerida: 'Liderazgo en Piso',
            razon: 'Empleado con alto desempeño listo para promoción a Capitán',
            prioridad: 'alta',
          }),
          procesado: true,
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      message: 'Base de datos sembrada exitosamente con datos realistas de HospitalityUP',
      counts: {
        propiedades: propiedades.length,
        empleados: empleados.length,
        capacitaciones: capacitaciones.length,
        empleadoCapacitaciones: empleadoCapacitaciones.length,
        ventasNPS: ventas.length,
        respuestasNPS: respuestasNps.length,
        alertasRiesgo: alertas.length,
        instructores: instructores.length,
        candidatosPool: candidatos.length,
        notificaciones: notificaciones.length,
        solicitudesCapacitacion: solicitudes.length,
        logsAgenteIA: logsAgenteIA.length,
        servicios: servicios.length,
      },
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
