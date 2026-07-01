const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed de HospitalityUP...')

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

  // 1. PROPIEDADES
  console.log('Creando propiedades...')
  const p1 = await prisma.propiedad.create({ data: { nombre: 'Hotel Grand Cancun', nombreEn: 'Grand Cancun Hotel', tipo: 'hotel', ubicacion: 'Boulevard Kukulcan KM 12.5, Cancun', region: 'cancun', plan: 'growth', moneda: 'USD', activo: true, password: 'empresa123', contactoNombre: 'Carlos Perez', contactoEmail: 'carlos@grandcancun.com', contactoTelefono: '+52 998 123 4567' } })
  const p2 = await prisma.propiedad.create({ data: { nombre: 'Restaurante La Terraza', nombreEn: 'The Terrace Restaurant', tipo: 'restaurante', ubicacion: 'Av. Reforma 222, CDMX', region: 'cdmx', plan: 'boutique', moneda: 'MXN', activo: true, password: 'empresa123', contactoNombre: 'Maria Lopez', contactoEmail: 'maria@laterraza.com', contactoTelefono: '+52 55 1234 5678' } })
  const p3 = await prisma.propiedad.create({ data: { nombre: 'Bar Mar Caribe', nombreEn: 'Caribbean Sea Bar', tipo: 'bar', ubicacion: 'Zona Hotelera, Playa del Carmen', region: 'playa_carmen', plan: 'boutique', moneda: 'USD', activo: true, password: 'empresa123', contactoNombre: 'Juan Martinez', contactoEmail: 'juan@marcaribe.com', contactoTelefono: '+52 984 123 4567' } })
  const p4 = await prisma.propiedad.create({ data: { nombre: 'Spa Sentir', nombreEn: 'Feel Spa', tipo: 'spa', ubicacion: 'Los Cabos', region: 'los_cabos', plan: 'growth', moneda: 'USD', activo: true, password: 'empresa123', contactoNombre: 'Isabel Cruz', contactoEmail: 'isabel@spasentir.com', contactoTelefono: '+52 624 123 4567' } })
  const p5 = await prisma.propiedad.create({ data: { nombre: 'Resort Sol Puebla', nombreEn: 'Sun Puebla Resort', tipo: 'resort', ubicacion: 'Calle 5 de Mayo 100, Puebla', region: 'puebla', plan: 'enterprise', moneda: 'MXN', activo: true, password: 'empresa123', contactoNombre: 'Fernando Ruiz', contactoEmail: 'fernando@solpuebla.com', contactoTelefono: '+52 222 123 4567' } })
  const p6 = await prisma.propiedad.create({ data: { nombre: 'Cafe Origenes', nombreEn: 'Origins Coffee', tipo: 'cafe', ubicacion: 'Col. Roma Norte 45, CDMX', region: 'cdmx', plan: 'boutique', moneda: 'MXN', activo: true, password: 'empresa123', contactoNombre: 'Valentina Diaz', contactoEmail: 'valentina@origenes.com', contactoTelefono: '+52 55 8765 4321' } })
  console.log('6 propiedades creadas')

  // 2. EMPLEADOS
  console.log('Creando empleados...')
  const e1 = await prisma.empleado.create({ data: { empleadoId: 'BEL-101', password: '1234', nombre: 'Carlos Mendoza', posicion: 'Bellboy Sr.', posicionEn: 'Sr. Bellboy', departamento: 'Conserjeria', departamentoEn: 'Concierge', fechaIngreso: new Date('2021-03-15'), estado: 'activo', nivelCarrera: 3, rutaCarrera: 'Bellboy Jr. - Bellboy Sr. - Jefe Conserjeria', puntuacionConocimiento: 78, puntuacionVentas: 65, puntuacionHospitalidad: 88, puntuacionTotal: 77, totalUpselling: 1250, npsPromedio: 9.1, cursosCompletados: 4, cursosEnProgreso: 1, indiceFelicidad: 85, riesgoBaja: 12, nivelRiesgoBaja: 'bajo', propiedadId: p1.id } })
  const e2 = await prisma.empleado.create({ data: { empleadoId: 'MES-401', password: '1234', nombre: 'Ana Garcia Lopez', posicion: 'Mesera', posicionEn: 'Waitress', departamento: 'Alimentos y Bebidas', departamentoEn: 'Food and Beverage', fechaIngreso: new Date('2022-06-01'), estado: 'activo', nivelCarrera: 2, rutaCarrera: 'Mesera Jr. - Mesera Sr. - Capitana', puntuacionConocimiento: 85, puntuacionVentas: 92, puntuacionHospitalidad: 90, puntuacionTotal: 89, totalUpselling: 4800, npsPromedio: 9.3, cursosCompletados: 6, cursosEnProgreso: 1, indiceFelicidad: 92, riesgoBaja: 5, nivelRiesgoBaja: 'bajo', propiedadId: p1.id } })
  const e3 = await prisma.empleado.create({ data: { empleadoId: 'MES-402', password: '1234', nombre: 'Roberto Sanchez', posicion: 'Mesero Sr.', posicionEn: 'Sr. Waiter', departamento: 'Alimentos y Bebidas', departamentoEn: 'Food and Beverage', fechaIngreso: new Date('2020-11-10'), estado: 'activo', nivelCarrera: 3, rutaCarrera: 'Mesero Jr. - Mesero Sr. - Capitan', puntuacionConocimiento: 80, puntuacionVentas: 75, puntuacionHospitalidad: 82, puntuacionTotal: 79, totalUpselling: 2100, npsPromedio: 8.5, cursosCompletados: 5, indiceFelicidad: 70, riesgoBaja: 35, nivelRiesgoBaja: 'medio', propiedadId: p1.id } })
  const e4 = await prisma.empleado.create({ data: { empleadoId: 'CAP-501', password: '1234', nombre: 'Maria Elena Torres', posicion: 'Capitana', posicionEn: 'Captain', departamento: 'Alimentos y Bebidas', departamentoEn: 'Food and Beverage', fechaIngreso: new Date('2019-01-20'), estado: 'activo', nivelCarrera: 4, rutaCarrera: 'Mesera - Capitana - Gerente', puntuacionConocimiento: 90, puntuacionVentas: 88, puntuacionHospitalidad: 95, puntuacionTotal: 91, totalUpselling: 6200, npsPromedio: 9.6, cursosCompletados: 8, indiceFelicidad: 94, riesgoBaja: 3, nivelRiesgoBaja: 'bajo', propiedadId: p1.id } })
  const e5 = await prisma.empleado.create({ data: { empleadoId: 'REC-701', password: '1234', nombre: 'Luis Fernandez', posicion: 'Recepcionista', posicionEn: 'Receptionist', departamento: 'Recepcion', departamentoEn: 'Front Desk', fechaIngreso: new Date('2023-02-14'), estado: 'activo', nivelCarrera: 1, rutaCarrera: 'Recepcionista Jr. - Recepcionista Sr.', puntuacionConocimiento: 60, puntuacionVentas: 55, puntuacionHospitalidad: 72, puntuacionTotal: 62, totalUpselling: 400, npsPromedio: 7.8, cursosCompletados: 2, cursosEnProgreso: 2, indiceFelicidad: 60, riesgoBaja: 55, nivelRiesgoBaja: 'alto', justificacionRiesgo: 'Bajo rendimiento y felicidad decreciente', sugerenciaCapacitacion: 'Curso de hospitalidad y upselling', propiedadId: p1.id } })
  const e6 = await prisma.empleado.create({ data: { empleadoId: 'MES-403', password: '1234', nombre: 'Patricia Ruiz', posicion: 'Mesera', posicionEn: 'Waitress', departamento: 'Alimentos y Bebidas', departamentoEn: 'Food and Beverage', fechaIngreso: new Date('2022-09-01'), estado: 'activo', nivelCarrera: 2, rutaCarrera: 'Mesera Jr. - Mesera Sr. - Capitana', puntuacionConocimiento: 76, puntuacionVentas: 88, puntuacionHospitalidad: 85, puntuacionTotal: 83, totalUpselling: 3200, npsPromedio: 8.9, cursosCompletados: 4, indiceFelicidad: 82, riesgoBaja: 15, nivelRiesgoBaja: 'bajo', propiedadId: p2.id } })
  const e7 = await prisma.empleado.create({ data: { empleadoId: 'BAR-601', password: '1234', nombre: 'Jorge Ramirez', posicion: 'Bartender', posicionEn: 'Bartender', departamento: 'Alimentos y Bebidas', departamentoEn: 'Food and Beverage', fechaIngreso: new Date('2021-05-20'), estado: 'activo', nivelCarrera: 3, rutaCarrera: 'Barback - Bartender Jr. - Bartender Sr.', puntuacionConocimiento: 92, puntuacionVentas: 95, puntuacionHospitalidad: 88, puntuacionTotal: 92, totalUpselling: 5600, npsPromedio: 9.2, cursosCompletados: 7, indiceFelicidad: 90, riesgoBaja: 8, nivelRiesgoBaja: 'bajo', propiedadId: p2.id } })
  const e8 = await prisma.empleado.create({ data: { empleadoId: 'HST-201', password: '1234', nombre: 'Diana Morales', posicion: 'Hostess', posicionEn: 'Hostess', departamento: 'Alimentos y Bebidas', departamentoEn: 'Food and Beverage', fechaIngreso: new Date('2023-08-15'), estado: 'onboarding', nivelCarrera: 1, rutaCarrera: 'Hostess - Capitana', puntuacionConocimiento: 45, puntuacionVentas: 30, puntuacionHospitalidad: 60, puntuacionTotal: 45, totalUpselling: 100, npsPromedio: 7.0, cursosCompletados: 1, cursosEnProgreso: 3, indiceFelicidad: 65, riesgoBaja: 40, nivelRiesgoBaja: 'medio', propiedadId: p2.id } })
  const e9 = await prisma.empleado.create({ data: { empleadoId: 'BAR-602', password: '1234', nombre: 'Miguel Angel Cruz', posicion: 'Bartender Sr.', posicionEn: 'Sr. Bartender', departamento: 'Alimentos y Bebidas', departamentoEn: 'Food and Beverage', fechaIngreso: new Date('2020-03-10'), estado: 'activo', nivelCarrera: 4, rutaCarrera: 'Bartender - Bartender Sr. - Bar Manager', puntuacionConocimiento: 95, puntuacionVentas: 90, puntuacionHospitalidad: 87, puntuacionTotal: 91, totalUpselling: 7200, npsPromedio: 9.4, cursosCompletados: 9, indiceFelicidad: 88, riesgoBaja: 10, nivelRiesgoBaja: 'bajo', propiedadId: p3.id } })
  const e10 = await prisma.empleado.create({ data: { empleadoId: 'MES-404', password: '1234', nombre: 'Laura Gutierrez', posicion: 'Mesera', posicionEn: 'Waitress', departamento: 'Alimentos y Bebidas', departamentoEn: 'Food and Beverage', fechaIngreso: new Date('2022-01-15'), estado: 'activo', nivelCarrera: 2, rutaCarrera: 'Mesera Jr. - Mesera Sr.', puntuacionConocimiento: 70, puntuacionVentas: 72, puntuacionHospitalidad: 78, puntuacionTotal: 73, totalUpselling: 1800, npsPromedio: 8.2, cursosCompletados: 3, indiceFelicidad: 75, riesgoBaja: 25, nivelRiesgoBaja: 'bajo', propiedadId: p3.id } })
  const e11 = await prisma.empleado.create({ data: { empleadoId: 'TER-801', password: '1234', nombre: 'Isabella Vargas', posicion: 'Terapeuta Sr.', posicionEn: 'Sr. Therapist', departamento: 'Spa y Bienestar', departamentoEn: 'Spa and Wellness', fechaIngreso: new Date('2020-07-01'), estado: 'activo', nivelCarrera: 3, rutaCarrera: 'Terapeuta - Terapeuta Sr. - Directora Spa', puntuacionConocimiento: 94, puntuacionVentas: 80, puntuacionHospitalidad: 96, puntuacionTotal: 90, totalUpselling: 3800, npsPromedio: 9.7, cursosCompletados: 7, indiceFelicidad: 93, riesgoBaja: 4, nivelRiesgoBaja: 'bajo', propiedadId: p4.id } })
  const e12 = await prisma.empleado.create({ data: { empleadoId: 'REC-802', password: '1234', nombre: 'Sofia Hernandez', posicion: 'Recepcionista Spa', posicionEn: 'Spa Receptionist', departamento: 'Spa y Bienestar', departamentoEn: 'Spa and Wellness', fechaIngreso: new Date('2023-04-01'), estado: 'activo', nivelCarrera: 1, rutaCarrera: 'Recepcionista - Coordinadora Spa', puntuacionConocimiento: 55, puntuacionVentas: 62, puntuacionHospitalidad: 75, puntuacionTotal: 64, totalUpselling: 600, npsPromedio: 8.0, cursosCompletados: 2, cursosEnProgreso: 1, indiceFelicidad: 68, riesgoBaja: 45, nivelRiesgoBaja: 'medio', propiedadId: p4.id } })
  const e13 = await prisma.empleado.create({ data: { empleadoId: 'MES-405', password: '1234', nombre: 'Fernando Castillo', posicion: 'Capitan', posicionEn: 'Captain', departamento: 'Alimentos y Bebidas', departamentoEn: 'Food and Beverage', fechaIngreso: new Date('2018-10-01'), estado: 'activo', nivelCarrera: 4, rutaCarrera: 'Mesero - Capitan - Gerente', puntuacionConocimiento: 88, puntuacionVentas: 85, puntuacionHospitalidad: 90, puntuacionTotal: 88, totalUpselling: 5500, npsPromedio: 9.1, cursosCompletados: 8, indiceFelicidad: 87, riesgoBaja: 7, nivelRiesgoBaja: 'bajo', propiedadId: p5.id } })
  const e14 = await prisma.empleado.create({ data: { empleadoId: 'BEL-102', password: '1234', nombre: 'Alejandro Diaz', posicion: 'Bellboy', posicionEn: 'Bellboy', departamento: 'Conserjeria', departamentoEn: 'Concierge', fechaIngreso: new Date('2022-12-01'), estado: 'activo', nivelCarrera: 2, rutaCarrera: 'Bellboy Jr. - Bellboy Sr.', puntuacionConocimiento: 65, puntuacionVentas: 58, puntuacionHospitalidad: 72, puntuacionTotal: 65, totalUpselling: 700, npsPromedio: 8.0, cursosCompletados: 3, indiceFelicidad: 62, riesgoBaja: 50, nivelRiesgoBaja: 'alto', justificacionRiesgo: 'Bajo upselling y felicidad decreciente', sugerenciaCapacitacion: 'Capacitacion en upselling', propiedadId: p5.id } })
  const e15 = await prisma.empleado.create({ data: { empleadoId: 'COC-901', password: '1234', nombre: 'Ricardo Moreno', posicion: 'Chef de Partie', posicionEn: 'Chef de Partie', departamento: 'Cocina', departamentoEn: 'Kitchen', fechaIngreso: new Date('2019-06-15'), estado: 'activo', nivelCarrera: 3, rutaCarrera: 'Commis - Chef de Partie - Sous Chef', puntuacionConocimiento: 91, puntuacionVentas: 60, puntuacionHospitalidad: 70, puntuacionTotal: 74, totalUpselling: 900, npsPromedio: 8.3, cursosCompletados: 6, indiceFelicidad: 78, riesgoBaja: 20, nivelRiesgoBaja: 'bajo', propiedadId: p5.id } })
  const e16 = await prisma.empleado.create({ data: { empleadoId: 'BAR-603', password: '1234', nombre: 'Valentina Rios', posicion: 'Barista', posicionEn: 'Barista', departamento: 'Alimentos y Bebidas', departamentoEn: 'Food and Beverage', fechaIngreso: new Date('2022-04-01'), estado: 'activo', nivelCarrera: 2, rutaCarrera: 'Barista Jr. - Barista Sr. - Store Manager', puntuacionConocimiento: 82, puntuacionVentas: 78, puntuacionHospitalidad: 85, puntuacionTotal: 82, totalUpselling: 1500, npsPromedio: 8.8, cursosCompletados: 4, indiceFelicidad: 80, riesgoBaja: 18, nivelRiesgoBaja: 'bajo', propiedadId: p6.id } })
  const e17 = await prisma.empleado.create({ data: { empleadoId: 'MES-406', password: '1234', nombre: 'Camila Ortiz', posicion: 'Mesera', posicionEn: 'Waitress', departamento: 'Alimentos y Bebidas', departamentoEn: 'Food and Beverage', fechaIngreso: new Date('2023-09-01'), estado: 'onboarding', nivelCarrera: 1, rutaCarrera: 'Mesera Jr. - Mesera Sr.', puntuacionConocimiento: 40, puntuacionVentas: 35, puntuacionHospitalidad: 55, puntuacionTotal: 43, totalUpselling: 50, npsPromedio: 7.2, cursosCompletados: 0, cursosEnProgreso: 3, indiceFelicidad: 55, riesgoBaja: 60, nivelRiesgoBaja: 'alto', justificacionRiesgo: 'Metricas muy bajas en onboarding', sugerenciaCapacitacion: 'Onboarding intensivo + mentor', propiedadId: p6.id } })
  console.log('17 empleados creados')

  // 3. SERVICIOS
  console.log('Creando servicios...')
  const servicios = [
    { nombre: 'Habitacion Deluxe Mar', nombreEn: 'Deluxe Ocean Room', categoria: 'habitacion', precioNormal: 350, esUpselling: false, disponible: true, propiedadId: p1.id },
    { nombre: 'Upgrade Suite Presidencial', nombreEn: 'Presidential Suite Upgrade', categoria: 'habitacion', precioNormal: 800, precioUpselling: 1200, esUpselling: true, objetivoUpselling: 'Upgrade a Suite Presidencial', propiedadId: p1.id },
    { nombre: 'Tour Isla Mujeres', nombreEn: 'Isla Mujeres Tour', categoria: 'tour', precioNormal: 120, esUpselling: false, disponible: true, propiedadId: p1.id },
    { nombre: 'Tour Premium', nombreEn: 'Premium Tour', categoria: 'tour', precioNormal: 120, precioUpselling: 220, esUpselling: true, objetivoUpselling: 'Upgrade a tour premium con lunch', propiedadId: p1.id },
    { nombre: 'Desbuffet Internacional', nombreEn: 'International Breakfast Buffet', categoria: 'platillo', precioNormal: 35, esUpselling: false, disponible: true, propiedadId: p1.id },
    { nombre: 'Maridaje Vinos Premium', nombreEn: 'Premium Wine Pairing', categoria: 'platillo', precioNormal: 35, precioUpselling: 85, esUpselling: true, objetivoUpselling: 'Agregar maridaje de vinos premium', propiedadId: p1.id },
    { nombre: 'Cena en la Playa', nombreEn: 'Beach Dinner', categoria: 'experiencia', precioNormal: 250, precioUpselling: 450, esUpselling: true, objetivoUpselling: 'Cena romantica en la playa', propiedadId: p1.id },
    { nombre: 'Filete Mignon', nombreEn: 'Filet Mignon', categoria: 'platillo', precioNormal: 480, esUpselling: false, disponible: true, propiedadId: p2.id },
    { nombre: 'Maridaje Vinos Reserva', nombreEn: 'Reserve Wine Pairing', categoria: 'platillo', precioNormal: 480, precioUpselling: 780, esUpselling: true, objetivoUpselling: 'Maridaje de vinos de reserva', propiedadId: p2.id },
    { nombre: 'Menu Degustacion 7 Tiempos', nombreEn: '7-Course Tasting Menu', categoria: 'experiencia', precioNormal: 1200, precioUpselling: 1800, esUpselling: true, objetivoUpselling: 'Menu degustacion con maridaje', propiedadId: p2.id },
    { nombre: 'Margarita Clasica', nombreEn: 'Classic Margarita', categoria: 'bebida', precioNormal: 12, esUpselling: false, disponible: true, propiedadId: p3.id },
    { nombre: 'Margarita Premium Don Julio', nombreEn: 'Premium Don Julio Margarita', categoria: 'bebida', precioNormal: 12, precioUpselling: 28, esUpselling: true, objetivoUpselling: 'Upgrade a tequila premium', propiedadId: p3.id },
    { nombre: 'Cerveza Artesanal', nombreEn: 'Craft Beer', categoria: 'bebida', precioNormal: 8, esUpselling: false, disponible: true, propiedadId: p3.id },
    { nombre: 'Flight de Cervezas', nombreEn: 'Beer Flight', categoria: 'bebida', precioNormal: 8, precioUpselling: 22, esUpselling: true, objetivoUpselling: 'Flight de 4 cervezas artesanales', propiedadId: p3.id },
    { nombre: 'Masaje Relajante 60min', nombreEn: 'Relaxing Massage 60min', categoria: 'masaje', precioNormal: 150, esUpselling: false, disponible: true, propiedadId: p4.id },
    { nombre: 'Masaje Hot Stones 90min', nombreEn: 'Hot Stones Massage 90min', categoria: 'masaje', precioNormal: 150, precioUpselling: 280, esUpselling: true, objetivoUpselling: 'Upgrade a masaje piedras calientes 90min', propiedadId: p4.id },
    { nombre: 'Facial Basico', nombreEn: 'Basic Facial', categoria: 'masaje', precioNormal: 100, esUpselling: false, disponible: true, propiedadId: p4.id },
    { nombre: 'Facial Oro 24K', nombreEn: '24K Gold Facial', categoria: 'masaje', precioNormal: 100, precioUpselling: 250, esUpselling: true, objetivoUpselling: 'Upgrade a facial premium con oro 24K', propiedadId: p4.id },
    { nombre: 'Habitacion Estandar', nombreEn: 'Standard Room', categoria: 'habitacion', precioNormal: 180, esUpselling: false, disponible: true, propiedadId: p5.id },
    { nombre: 'Upgrade Suite Junior', nombreEn: 'Junior Suite Upgrade', categoria: 'habitacion', precioNormal: 180, precioUpselling: 320, esUpselling: true, objetivoUpselling: 'Upgrade a Junior Suite', propiedadId: p5.id },
    { nombre: 'Cafe Americano', nombreEn: 'Americano Coffee', categoria: 'bebida', precioNormal: 55, esUpselling: false, disponible: true, propiedadId: p6.id },
    { nombre: 'Cafe Especialidad V60', nombreEn: 'Specialty V60 Coffee', categoria: 'bebida', precioNormal: 55, precioUpselling: 120, esUpselling: true, objetivoUpselling: 'Cafe de especialidad V60', propiedadId: p6.id },
  ]
  for (const s of servicios) { await prisma.servicio.create({ data: s }) }
  console.log(servicios.length + ' servicios creados')

  // 4. CAPACITACIONES
  console.log('Creando capacitaciones...')
  const c1 = await prisma.capacitacion.create({ data: { titulo: 'Tecnicas de Upselling en Hospitalidad', tituloEn: 'Hospitality Upselling Techniques', descripcion: 'Mejores tecnicas de upselling', descripcionEn: 'Best upselling techniques', categoria: 'upselling', modalidad: 'virtual', duracion: 45, dificultad: 'intermedio', puntos: 15, activo: true, posicion: 'Mesero / Bartender', posicionEn: 'Waiter / Bartender' } })
  const c2 = await prisma.capacitacion.create({ data: { titulo: 'Hospitalidad de Clase Mundial', tituloEn: 'World-Class Hospitality', descripcion: 'Principios de servicio excepcional', descripcionEn: 'Exceptional service principles', categoria: 'hospitalidad', modalidad: 'presencial', duracion: 60, dificultad: 'principiante', puntos: 10, activo: true, posicion: 'Todos los puestos', posicionEn: 'All positions' } })
  const c3 = await prisma.capacitacion.create({ data: { titulo: 'Conocimiento de Vinos y Maridaje', tituloEn: 'Wine Knowledge and Pairing', descripcion: 'Fundamentos de viticultura y maridaje', descripcionEn: 'Viticulture and pairing fundamentals', categoria: 'conocimiento_producto', modalidad: 'presencial', duracion: 90, dificultad: 'avanzado', puntos: 20, activo: true, posicion: 'Mesero / Sommelier', posicionEn: 'Waiter / Sommelier' } })
  const c4 = await prisma.capacitacion.create({ data: { titulo: 'Onboarding: Tu Primer Dia', tituloEn: 'Onboarding: Your First Day', descripcion: 'Guia para nuevos empleados', descripcionEn: 'Guide for new employees', categoria: 'onboarding', modalidad: 'virtual', duracion: 30, dificultad: 'principiante', puntos: 5, activo: true, posicion: 'Todos los puestos', posicionEn: 'All positions' } })
  const c5 = await prisma.capacitacion.create({ data: { titulo: 'Liderazgo en el Piso', tituloEn: 'Floor Leadership', descripcion: 'Liderazgo para capitanes y supervisores', descripcionEn: 'Leadership for captains and supervisors', categoria: 'liderazgo', modalidad: 'presencial', duracion: 120, dificultad: 'avanzado', puntos: 25, activo: true, posicion: 'Capitan / Supervisor', posicionEn: 'Captain / Supervisor' } })
  const c6 = await prisma.capacitacion.create({ data: { titulo: 'Cocteleria Avanzada', tituloEn: 'Advanced Mixology', descripcion: 'Tecnicas avanzadas de mixologia', descripcionEn: 'Advanced mixology techniques', categoria: 'conocimiento_producto', modalidad: 'presencial', duracion: 90, dificultad: 'avanzado', puntos: 20, activo: true, posicion: 'Bartender', posicionEn: 'Bartender' } })
  const c7 = await prisma.capacitacion.create({ data: { titulo: 'Ventas en Spa y Bienestar', tituloEn: 'Spa and Wellness Sales', descripcion: 'Venta consultiva para spa', descripcionEn: 'Consultative sales for spa', categoria: 'upselling', modalidad: 'virtual', duracion: 45, dificultad: 'intermedio', puntos: 15, activo: true, posicion: 'Recepcionista Spa / Terapeuta', posicionEn: 'Spa Receptionist / Therapist' } })
  const c8 = await prisma.capacitacion.create({ data: { titulo: 'Coffee Mastery', tituloEn: 'Coffee Mastery', descripcion: 'Conocimiento profundo del cafe', descripcionEn: 'Deep coffee knowledge', categoria: 'conocimiento_producto', modalidad: 'presencial', duracion: 75, dificultad: 'intermedio', puntos: 18, activo: true, posicion: 'Barista', posicionEn: 'Barista' } })
  console.log('8 capacitaciones creadas')

  // 5. VENTAS NPS
  console.log('Creando ventas con NPS...')
  const ventas = [
    { empleadoId: e2.id, propiedadId: p1.id, montoUpselling: 400, esUpselling: true, nombreServicio: 'Upgrade Suite Presidencial', cantidad: 1, precioUnitario: 1200, montoTotal: 1200, calificacionNPS: 10, esPromotor: true, comentario: 'Increible upgrade!', fuenteNPS: 'qr', categoriaServicio: 'upgrade_habitacion' },
    { empleadoId: e2.id, propiedadId: p1.id, montoUpselling: 100, esUpselling: true, nombreServicio: 'Maridaje Vinos Premium', cantidad: 2, precioUnitario: 85, montoTotal: 170, calificacionNPS: 9, esPromotor: true, comentario: 'Excelente sugerencia', fuenteNPS: 'sms', categoriaServicio: 'upselling' },
    { empleadoId: e2.id, propiedadId: p1.id, montoUpselling: 0, esUpselling: false, nombreServicio: 'Desbuffet Internacional', cantidad: 2, precioUnitario: 35, montoTotal: 70, calificacionNPS: 9, esPromotor: true, fuenteNPS: 'qr', categoriaServicio: 'menu' },
    { empleadoId: e2.id, propiedadId: p1.id, montoUpselling: 200, esUpselling: true, nombreServicio: 'Cena en la Playa', cantidad: 1, precioUnitario: 450, montoTotal: 450, calificacionNPS: 10, esPromotor: true, comentario: 'La mejor cena!', fuenteNPS: 'app', categoriaServicio: 'experiencia' },
    { empleadoId: e3.id, propiedadId: p1.id, montoUpselling: 0, esUpselling: false, nombreServicio: 'Desbuffet Internacional', cantidad: 3, precioUnitario: 35, montoTotal: 105, calificacionNPS: 8, esPromotor: false, fuenteNPS: 'qr', categoriaServicio: 'menu' },
    { empleadoId: e3.id, propiedadId: p1.id, montoUpselling: 85, esUpselling: true, nombreServicio: 'Maridaje Vinos', cantidad: 1, precioUnitario: 85, montoTotal: 85, calificacionNPS: 7, esPromotor: false, fuenteNPS: 'sms', categoriaServicio: 'upselling' },
    { empleadoId: e4.id, propiedadId: p1.id, montoUpselling: 800, esUpselling: true, nombreServicio: 'Cena VIP Playa', cantidad: 2, precioUnitario: 650, montoTotal: 1300, calificacionNPS: 10, esPromotor: true, comentario: 'Luna de miel inolvidable!', fuenteNPS: 'app', categoriaServicio: 'experiencia' },
    { empleadoId: e4.id, propiedadId: p1.id, montoUpselling: 400, esUpselling: true, nombreServicio: 'Upgrade Suite', cantidad: 1, precioUnitario: 1200, montoTotal: 1200, calificacionNPS: 10, esPromotor: true, fuenteNPS: 'qr', categoriaServicio: 'upgrade_habitacion' },
    { empleadoId: e1.id, propiedadId: p1.id, montoUpselling: 100, esUpselling: true, nombreServicio: 'Tour Premium', cantidad: 1, precioUnitario: 220, montoTotal: 220, calificacionNPS: 9, esPromotor: true, comentario: 'Gran recomendacion!', fuenteNPS: 'qr', categoriaServicio: 'tour' },
    { empleadoId: e5.id, propiedadId: p1.id, montoUpselling: 0, esUpselling: false, nombreServicio: 'Habitacion Deluxe', cantidad: 1, precioUnitario: 350, montoTotal: 350, calificacionNPS: 7, esPromotor: false, comentario: 'Check-in lento', fuenteNPS: 'email', categoriaServicio: 'menu' },
    { empleadoId: e7.id, propiedadId: p2.id, montoUpselling: 16, esUpselling: true, nombreServicio: 'Margarita Premium', cantidad: 4, precioUnitario: 28, montoTotal: 112, calificacionNPS: 10, esPromotor: true, comentario: 'Los mejores margaritas!', fuenteNPS: 'qr', categoriaServicio: 'upselling' },
    { empleadoId: e7.id, propiedadId: p2.id, montoUpselling: 600, esUpselling: true, nombreServicio: 'Menu Degustacion', cantidad: 2, precioUnitario: 1800, montoTotal: 3600, calificacionNPS: 9, esPromotor: true, fuenteNPS: 'app', categoriaServicio: 'experiencia' },
    { empleadoId: e6.id, propiedadId: p2.id, montoUpselling: 300, esUpselling: true, nombreServicio: 'Maridaje Vinos Reserva', cantidad: 2, precioUnitario: 780, montoTotal: 1560, calificacionNPS: 9, esPromotor: true, comentario: 'Paladar increible', fuenteNPS: 'qr', categoriaServicio: 'upselling' },
    { empleadoId: e9.id, propiedadId: p3.id, montoUpselling: 14, esUpselling: true, nombreServicio: 'Margarita Premium Don Julio', cantidad: 3, precioUnitario: 28, montoTotal: 84, calificacionNPS: 10, esPromotor: true, comentario: 'Miguel es un master!', fuenteNPS: 'qr', categoriaServicio: 'upselling' },
    { empleadoId: e11.id, propiedadId: p4.id, montoUpselling: 130, esUpselling: true, nombreServicio: 'Masaje Hot Stones 90min', cantidad: 1, precioUnitario: 280, montoTotal: 280, calificacionNPS: 10, esPromotor: true, comentario: 'Manos magicas!', fuenteNPS: 'app', categoriaServicio: 'upselling' },
    { empleadoId: e11.id, propiedadId: p4.id, montoUpselling: 150, esUpselling: true, nombreServicio: 'Facial Oro 24K', cantidad: 1, precioUnitario: 250, montoTotal: 250, calificacionNPS: 10, esPromotor: true, comentario: 'Mi piel se ve increible!', fuenteNPS: 'qr', categoriaServicio: 'upselling' },
    { empleadoId: e16.id, propiedadId: p6.id, montoUpselling: 65, esUpselling: true, nombreServicio: 'Cafe Especialidad V60', cantidad: 2, precioUnitario: 120, montoTotal: 240, calificacionNPS: 9, esPromotor: true, comentario: 'Valentina explico todo!', fuenteNPS: 'qr', categoriaServicio: 'upselling' },
  ]
  for (const v of ventas) { await prisma.ventaNPS.create({ data: v }) }
  console.log(ventas.length + ' ventas creadas')

  // 6. ALERTAS
  console.log('Creando alertas de riesgo...')
  const alertas = [
    { empleadoId: e5.id, propiedadId: p1.id, tipo: 'baja_felicidad', severidad: 'alto', mensaje: 'Luis Fernandez felicidad 60/100, NPS 7.8', probabilidad: 55, generadoPorIA: true, leida: false },
    { empleadoId: e14.id, propiedadId: p5.id, tipo: 'estancamiento', severidad: 'alto', mensaje: 'Alejandro Diaz no mejora upselling, felicidad 62', probabilidad: 50, generadoPorIA: true, leida: false },
    { empleadoId: e17.id, propiedadId: p6.id, tipo: 'estancamiento', severidad: 'medio', mensaje: 'Camila Ortiz 3 meses en onboarding con metricas bajas', probabilidad: 60, generadoPorIA: true, leida: false },
    { empleadoId: e12.id, propiedadId: p4.id, tipo: 'nps_bajo', severidad: 'medio', mensaje: 'Sofia Hernandez NPS 8.0, bajo del promedio del spa', probabilidad: 45, generadoPorIA: true, leida: true },
    { empleadoId: e8.id, propiedadId: p2.id, tipo: 'inactividad', severidad: 'medio', mensaje: 'Diana Morales sin actividad de capacitacion 2 semanas', probabilidad: 40, generadoPorIA: true, leida: false },
    { empleadoId: e3.id, propiedadId: p1.id, tipo: 'nps_bajo', severidad: 'bajo', mensaje: 'Roberto Sanchez NPS 8.5, bajo del promedio del equipo', probabilidad: 35, generadoPorIA: true, leida: true },
  ]
  for (const a of alertas) { await prisma.alertaRiesgo.create({ data: a }) }
  console.log(alertas.length + ' alertas creadas')

  // 7. CANDIDATOS
  console.log('Creando candidatos...')
  const candidatos = [
    { nombre: 'Gabriela Mendoza', email: 'gabriela.m@email.com', telefono: '+52 55 1234 5678', posicion: 'Recepcionista', region: 'cancun', experiencia: 3, habilidades: JSON.stringify(['opera', 'bilingue', 'upselling']), estado: 'disponible', fuente: 'portal', puntuacionEntrevista: 85, notas: 'Para reemplazo de Luis Fernandez' },
    { nombre: 'Pablo Herrera', email: 'pablo.h@email.com', posicion: 'Mesero', region: 'cdmx', experiencia: 2, habilidades: JSON.stringify(['servicio', 'bilingue']), estado: 'en_proceso', fuente: 'referido', puntuacionEntrevista: 78 },
    { nombre: 'Lucia Castillo', email: 'lucia.c@email.com', posicion: 'Bellboy', region: 'puebla', experiencia: 1, habilidades: JSON.stringify(['cliente', 'bilingue']), estado: 'disponible', fuente: 'agencia', puntuacionEntrevista: 72, propiedadId: p5.id },
    { nombre: 'Marco Rodriguez', email: 'marco.r@email.com', posicion: 'Barista', region: 'cdmx', experiencia: 4, habilidades: JSON.stringify(['cafe_especialidad', 'latte_art']), estado: 'disponible', fuente: 'portal', puntuacionEntrevista: 90 },
  ]
  for (const c of candidatos) { await prisma.candidatoPool.create({ data: c }) }
  console.log(candidatos.length + ' candidatos creados')

  // 8. INSTRUCTORES
  console.log('Creando instructores...')
  const instructores = [
    { nombre: 'Sommelier Rafael Torres', especialidad: 'Vinos y Maridaje', ubicacion: 'CDMX', region: 'cdmx', calificacion: 4.9, tarifaHora: 800, disponible: true },
    { nombre: 'Chef Isabelle Monet', especialidad: 'Gastronomia Fine Dining', ubicacion: 'Cancun', region: 'cancun', calificacion: 4.8, tarifaHora: 1200, disponible: true },
    { nombre: 'Mixologist Daniel Cruz', especialidad: 'Cocteleria Avanzada', ubicacion: 'Playa del Carmen', region: 'playa_carmen', calificacion: 4.7, tarifaHora: 600, disponible: true },
  ]
  for (const i of instructores) { await prisma.instructor.create({ data: i }) }
  console.log(instructores.length + ' instructores creados')

  console.log('\n========================================')
  console.log('SEED COMPLETADO EXITOSAMENTE!')
  console.log('========================================')
  console.log('6 propiedades')
  console.log('17 empleados')
  console.log(servicios.length + ' servicios')
  console.log('8 capacitaciones')
  console.log(ventas.length + ' ventas')
  console.log(alertas.length + ' alertas')
  console.log(candidatos.length + ' candidatos')
  console.log(instructores.length + ' instructores')
  console.log('========================================')
  console.log('\nCredenciales de acceso:')
  console.log('Admin: admin@hospitalityup.com / admin123')
  console.log('Empresa: selecciona propiedad / empresa123')
  console.log('Empleado: MES-401 / 1234 (o cualquier ID de empleado)')
}

main()
  .then(async () => { await prisma.$disconnect(); process.exit(0) })
  .catch(async (e) => { console.error('Error en seed:', e); await prisma.$disconnect(); process.exit(1) })
