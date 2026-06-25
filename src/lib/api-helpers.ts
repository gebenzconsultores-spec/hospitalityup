// API Helpers - Mock data fallback for Vercel serverless deployment
// When the database is not available, these helpers provide realistic mock data
// that matches the exact shape returned by each API route's database queries.

import { isDatabaseAvailable } from '@/lib/db'

export function dbReady(): boolean {
  return isDatabaseAvailable()
}

// ─── Dashboard mock data ──────────────────────────────────────
export function getMockDashboard() {
  return {
    totalEmpleados: 12,
    empleadosActivos: 8,
    empleadosOnboarding: 3,
    empleadosOffboarding: 1,
    npsPromedio: 8.3,
    totalUpselling: 37070,
    npsVentasPromedio: 8.7,
    tasaRotacion: 25,
    riesgoCritico: 1,
    riesgoAlto: 3,
    riesgoMedio: 2,
    riesgoBajo: 6,
    felicidadPromedio: 78,
    cursosCompletados: 8,
    cursosEnProgreso: 5,
    totalCapacitaciones: 8,
    totalVentas: 24,
    ventasUpselling: 18,
    montoUpsellingTotal: 11500,
    montoTotalVentas: 24340,
    alertasCriticas: 2,
    alertasAltas: 2,
    alertasPendientes: 6,
    candidatosDisponibles: 5,
    candidatosEnProceso: 2,
    puntuacionConocimientoProm: 72.5,
    puntuacionVentasProm: 68.3,
    puntuacionHospitalidadProm: 82.1,
    puntuacionTotalProm: 74.3,
    ahorroEstimado: 4800,
    topPerformers: [
      {
        id: 'emp1',
        empleadoId: 'CAP-501',
        nombre: 'Laura Hernández',
        posicion: 'Capitana',
        departamento: 'A&B',
        puntuacionTotal: 96.3,
        npsPromedio: 9.8,
        totalUpselling: 8920,
        indiceFelicidad: 95,
        foto: null,
        propiedad: { nombre: 'Hotel Playa Cancún', region: 'cancun' },
      },
      {
        id: 'emp2',
        empleadoId: 'GER-001',
        nombre: 'Carmen Delgado',
        posicion: 'Gerente A&B',
        departamento: 'Gerencia',
        puntuacionTotal: 96,
        npsPromedio: 9.5,
        totalUpselling: 12500,
        indiceFelicidad: 92,
        foto: null,
        propiedad: { nombre: 'Hotel Playa Cancún', region: 'cancun' },
      },
      {
        id: 'emp3',
        empleadoId: 'MES-401',
        nombre: 'Juan Pérez',
        posicion: 'Mesero Sr.',
        departamento: 'A&B',
        puntuacionTotal: 88.3,
        npsPromedio: 9.2,
        totalUpselling: 4580,
        indiceFelicidad: 88,
        foto: null,
        propiedad: { nombre: 'Hotel Playa Cancún', region: 'cancun' },
      },
    ],
    empleadosRiesgo: [
      {
        id: 'emp10',
        empleadoId: 'MES-701',
        nombre: 'Patricia Ruiz',
        posicion: 'Mesera',
        departamento: 'A&B',
        riesgoBaja: 92,
        nivelRiesgoBaja: 'critico',
        indiceFelicidad: 35,
        npsPromedio: 5.2,
        foto: null,
        propiedad: { nombre: 'Hotel Playa Cancún', region: 'cancun' },
      },
      {
        id: 'emp8',
        empleadoId: 'MES-402',
        nombre: 'María García',
        posicion: 'Mesera Jr.',
        departamento: 'A&B',
        riesgoBaja: 78,
        nivelRiesgoBaja: 'alto',
        indiceFelicidad: 42,
        npsPromedio: 6.1,
        foto: null,
        propiedad: { nombre: 'Hotel Playa Cancún', region: 'cancun' },
      },
      {
        id: 'emp9',
        empleadoId: 'REC-801',
        nombre: 'Diego Flores',
        posicion: 'Recepcionista Jr.',
        departamento: 'Recepción',
        riesgoBaja: 65,
        nivelRiesgoBaja: 'alto',
        indiceFelicidad: 48,
        npsPromedio: 6.8,
        foto: null,
        propiedad: { nombre: 'Gran Hotel CDMX', region: 'cdmx' },
      },
    ],
  }
}

// ─── Propiedades mock data ─────────────────────────────────────
export function getMockPropiedades() {
  return [
    { id: 'prop1', nombre: 'Hotel Playa Cancún', nombreEn: 'Cancún Beach Hotel', tipo: 'hotel', ubicacion: 'Blvd. Kukulcán KM 12.5, Cancún', region: 'cancun', plan: 'growth', moneda: 'MXN', activo: true, createdAt: '2024-01-15T10:00:00.000Z', updatedAt: '2024-06-01T10:00:00.000Z', empleadosActivos: 7, capacitacionesActivas: 3, totalVentas: 14 },
    { id: 'prop2', nombre: 'Restaurante La Terraza', nombreEn: 'La Terraza Restaurant', tipo: 'restaurante', ubicacion: 'Calle 5 de Mayo 208, Puebla', region: 'puebla', plan: 'boutique', moneda: 'MXN', activo: true, createdAt: '2024-02-01T10:00:00.000Z', updatedAt: '2024-06-01T10:00:00.000Z', empleadosActivos: 1, capacitacionesActivas: 0, totalVentas: 1 },
    { id: 'prop3', nombre: 'Gran Hotel CDMX', nombreEn: 'Grand Hotel Mexico City', tipo: 'hotel', ubicacion: 'Av. Juárez 70, CDMX', region: 'cdmx', plan: 'enterprise', moneda: 'MXN', activo: true, createdAt: '2024-03-01T10:00:00.000Z', updatedAt: '2024-06-01T10:00:00.000Z', empleadosActivos: 2, capacitacionesActivas: 0, totalVentas: 4 },
    { id: 'prop4', nombre: 'Bar Mar Azul', nombreEn: 'Blue Sea Bar', tipo: 'bar', ubicacion: 'Av. 10, Playa del Carmen', region: 'playa_carmen', plan: 'boutique', moneda: 'MXN', activo: true, createdAt: '2024-04-01T10:00:00.000Z', updatedAt: '2024-06-01T10:00:00.000Z', empleadosActivos: 1, capacitacionesActivas: 1, totalVentas: 2 },
    { id: 'prop5', nombre: 'Resort Los Cabos', nombreEn: 'Los Cabos Resort', tipo: 'hotel', ubicacion: 'Carretera Transpeninsular KM 7, Los Cabos', region: 'los_cabos', plan: 'growth', moneda: 'USD', activo: true, createdAt: '2024-05-01T10:00:00.000Z', updatedAt: '2024-06-01T10:00:00.000Z', empleadosActivos: 0, capacitacionesActivas: 0, totalVentas: 3 },
    { id: 'prop6', nombre: 'Restaurante Puerto Veracruz', nombreEn: 'Veracruz Port Restaurant', tipo: 'restaurante', ubicacion: 'Boulevard Manuel Ávila Camacho 1200', region: 'veracruz', plan: 'boutique', moneda: 'MXN', activo: true, createdAt: '2024-06-01T10:00:00.000Z', updatedAt: '2024-06-01T10:00:00.000Z', empleadosActivos: 0, capacitacionesActivas: 0, totalVentas: 0 },
  ]
}

// ─── Empleados mock data (matching Prisma shape) ──────────────
export function getMockEmpleados() {
  return [
    {
      id: 'emp1', empleadoId: 'CAP-501', nombre: 'Laura Hernández', posicion: 'Capitana', posicionEn: 'Captain', departamento: 'A&B', departamentoEn: 'F&B', foto: null,
      fechaIngreso: '2022-03-15T00:00:00.000Z', estado: 'activo', nivelCarrera: 4, rutaCarrera: 'Mesera Jr. → Mesera Sr. → Capitana → Gerente A&B', rutaCarreraEn: 'Jr. Waitress → Sr. Waitress → Captain → F&B Manager',
      tipoJornada: 'fijo', horarioEntrada: '07:00', horarioSalida: '15:00', diasTrabajo: '["lunes","martes","miercoles","jueves","viernes"]', cubreTurnos: false, turnoPreferido: 'matutino',
      salario: 18000, tipoContrato: 'indefinido', fechaFinContrato: null,
      puntuacionConocimiento: 95, puntuacionVentas: 98, puntuacionHospitalidad: 96, puntuacionTotal: 96.3,
      totalUpselling: 8920, npsPromedio: 9.8, cursosCompletados: 8, cursosEnProgreso: 1,
      indiceFelicidad: 95, riesgoBaja: 5, nivelRiesgoBaja: 'bajo',
      justificacionRiesgo: null, sugerenciaCapacitacion: null,
      ultimaActividad: '2024-06-10T14:30:00.000Z', fechaBaja: null, reemplazoTargetId: null,
      propiedadId: 'prop1',
      propiedad: { id: 'prop1', nombre: 'Hotel Playa Cancún', nombreEn: 'Cancún Beach Hotel', region: 'cancun' },
      _count: { cursos: 9, alertas: 0, ventas: 6 },
      createdAt: '2022-03-15T00:00:00.000Z', updatedAt: '2024-06-10T14:30:00.000Z',
    },
    {
      id: 'emp2', empleadoId: 'GER-001', nombre: 'Carmen Delgado', posicion: 'Gerente A&B', posicionEn: 'F&B Manager', departamento: 'Gerencia', departamentoEn: 'Management', foto: null,
      fechaIngreso: '2020-01-10T00:00:00.000Z', estado: 'activo', nivelCarrera: 5, rutaCarrera: 'Mesera → Capitana → Subgerente → Gerente A&B', rutaCarreraEn: 'Waitress → Captain → Asst. Manager → F&B Manager',
      tipoJornada: 'mixto', horarioEntrada: '08:00', horarioSalida: '18:00', diasTrabajo: '["lunes","martes","miercoles","jueves","viernes","sabado"]', cubreTurnos: true, turnoPreferido: 'mixto',
      salario: 35000, tipoContrato: 'indefinido', fechaFinContrato: null,
      puntuacionConocimiento: 92, puntuacionVentas: 99, puntuacionHospitalidad: 97, puntuacionTotal: 96,
      totalUpselling: 12500, npsPromedio: 9.5, cursosCompletados: 10, cursosEnProgreso: 0,
      indiceFelicidad: 92, riesgoBaja: 3, nivelRiesgoBaja: 'bajo',
      justificacionRiesgo: null, sugerenciaCapacitacion: null,
      ultimaActividad: '2024-06-11T09:00:00.000Z', fechaBaja: null, reemplazoTargetId: null,
      propiedadId: 'prop1',
      propiedad: { id: 'prop1', nombre: 'Hotel Playa Cancún', nombreEn: 'Cancún Beach Hotel', region: 'cancun' },
      _count: { cursos: 10, alertas: 0, ventas: 4 },
      createdAt: '2020-01-10T00:00:00.000Z', updatedAt: '2024-06-11T09:00:00.000Z',
    },
    {
      id: 'emp3', empleadoId: 'MES-401', nombre: 'Juan Pérez', posicion: 'Mesero Sr.', posicionEn: 'Sr. Waiter', departamento: 'A&B', departamentoEn: 'F&B', foto: null,
      fechaIngreso: '2023-02-20T00:00:00.000Z', estado: 'activo', nivelCarrera: 3, rutaCarrera: 'Mesero Jr. → Mesero Sr. → Capitán', rutaCarreraEn: 'Jr. Waiter → Sr. Waiter → Captain',
      tipoJornada: 'fijo', horarioEntrada: '06:00', horarioSalida: '14:00', diasTrabajo: '["martes","miercoles","jueves","viernes","sabado","domingo"]', cubreTurnos: true, turnoPreferido: 'matutino',
      salario: 14000, tipoContrato: 'indefinido', fechaFinContrato: null,
      puntuacionConocimiento: 82, puntuacionVentas: 90, puntuacionHospitalidad: 92, puntuacionTotal: 88.3,
      totalUpselling: 4580, npsPromedio: 9.2, cursosCompletados: 5, cursosEnProgreso: 2,
      indiceFelicidad: 88, riesgoBaja: 12, nivelRiesgoBaja: 'bajo',
      justificacionRiesgo: null, sugerenciaCapacitacion: null,
      ultimaActividad: '2024-06-10T16:45:00.000Z', fechaBaja: null, reemplazoTargetId: null,
      propiedadId: 'prop1',
      propiedad: { id: 'prop1', nombre: 'Hotel Playa Cancún', nombreEn: 'Cancún Beach Hotel', region: 'cancun' },
      _count: { cursos: 7, alertas: 0, ventas: 5 },
      createdAt: '2023-02-20T00:00:00.000Z', updatedAt: '2024-06-10T16:45:00.000Z',
    },
    {
      id: 'emp4', empleadoId: 'MES-301', nombre: 'Roberto Sánchez', posicion: 'Mesero', posicionEn: 'Waiter', departamento: 'A&B', departamentoEn: 'F&B', foto: null,
      fechaIngreso: '2023-06-01T00:00:00.000Z', estado: 'activo', nivelCarrera: 2, rutaCarrera: 'Mesero Jr. → Mesero → Mesero Sr.', rutaCarreraEn: 'Jr. Waiter → Waiter → Sr. Waiter',
      tipoJornada: 'fijo', horarioEntrada: '14:00', horarioSalida: '22:00', diasTrabajo: '["lunes","martes","miercoles","jueves","viernes"]', cubreTurnos: false, turnoPreferido: 'vespertino',
      salario: 12000, tipoContrato: 'indefinido', fechaFinContrato: null,
      puntuacionConocimiento: 70, puntuacionVentas: 75, puntuacionHospitalidad: 80, puntuacionTotal: 75.2,
      totalUpselling: 2350, npsPromedio: 8.5, cursosCompletados: 3, cursosEnProgreso: 1,
      indiceFelicidad: 78, riesgoBaja: 25, nivelRiesgoBaja: 'medio',
      justificacionRiesgo: 'Nivel de ventas en upselling por debajo del promedio', sugerenciaCapacitacion: 'Curso de técnicas de upselling',
      ultimaActividad: '2024-06-09T11:20:00.000Z', fechaBaja: null, reemplazoTargetId: null,
      propiedadId: 'prop1',
      propiedad: { id: 'prop1', nombre: 'Hotel Playa Cancún', nombreEn: 'Cancún Beach Hotel', region: 'cancun' },
      _count: { cursos: 4, alertas: 1, ventas: 3 },
      createdAt: '2023-06-01T00:00:00.000Z', updatedAt: '2024-06-09T11:20:00.000Z',
    },
    {
      id: 'emp5', empleadoId: 'BAR-201', nombre: 'Miguel Torres', posicion: 'Bartender', posicionEn: 'Bartender', departamento: 'A&B', departamentoEn: 'F&B', foto: null,
      fechaIngreso: '2023-08-15T00:00:00.000Z', estado: 'activo', nivelCarrera: 2, rutaCarrera: 'Barback → Bartender → Bartender Sr.', rutaCarreraEn: 'Barback → Bartender → Sr. Bartender',
      tipoJornada: 'variable', horarioEntrada: '18:00', horarioSalida: '02:00', diasTrabajo: '["miercoles","jueves","viernes","sabado"]', cubreTurnos: true, turnoPreferido: 'nocturno',
      salario: 13000, tipoContrato: 'indefinido', fechaFinContrato: null,
      puntuacionConocimiento: 78, puntuacionVentas: 85, puntuacionHospitalidad: 82, puntuacionTotal: 82,
      totalUpselling: 3200, npsPromedio: 8.8, cursosCompletados: 4, cursosEnProgreso: 1,
      indiceFelicidad: 82, riesgoBaja: 18, nivelRiesgoBaja: 'bajo',
      justificacionRiesgo: null, sugerenciaCapacitacion: null,
      ultimaActividad: '2024-06-10T20:15:00.000Z', fechaBaja: null, reemplazoTargetId: null,
      propiedadId: 'prop1',
      propiedad: { id: 'prop1', nombre: 'Hotel Playa Cancún', nombreEn: 'Cancún Beach Hotel', region: 'cancun' },
      _count: { cursos: 5, alertas: 0, ventas: 4 },
      createdAt: '2023-08-15T00:00:00.000Z', updatedAt: '2024-06-10T20:15:00.000Z',
    },
    {
      id: 'emp6', empleadoId: 'ONB-101', nombre: 'Ana Martínez', posicion: 'Mesera Jr.', posicionEn: 'Jr. Waitress', departamento: 'A&B', departamentoEn: 'F&B', foto: null,
      fechaIngreso: '2024-05-01T00:00:00.000Z', estado: 'onboarding', nivelCarrera: 1, rutaCarrera: 'Mesera Jr. → Mesera → Mesera Sr.', rutaCarreraEn: 'Jr. Waitress → Waitress → Sr. Waitress',
      tipoJornada: 'fijo', horarioEntrada: '07:00', horarioSalida: '15:00', diasTrabajo: '["lunes","martes","miercoles","jueves","viernes"]', cubreTurnos: false, turnoPreferido: 'matutino',
      salario: 9000, tipoContrato: 'temporal', fechaFinContrato: '2024-11-01T00:00:00.000Z',
      puntuacionConocimiento: 45, puntuacionVentas: 30, puntuacionHospitalidad: 60, puntuacionTotal: 44.3,
      totalUpselling: 0, npsPromedio: 0, cursosCompletados: 0, cursosEnProgreso: 2,
      indiceFelicidad: 75, riesgoBaja: 15, nivelRiesgoBaja: 'bajo',
      justificacionRiesgo: null, sugerenciaCapacitacion: 'Onboarding: curso de hospitalidad básica',
      ultimaActividad: '2024-06-11T08:00:00.000Z', fechaBaja: null, reemplazoTargetId: null,
      propiedadId: 'prop1',
      propiedad: { id: 'prop1', nombre: 'Hotel Playa Cancún', nombreEn: 'Cancún Beach Hotel', region: 'cancun' },
      _count: { cursos: 2, alertas: 0, ventas: 0 },
      createdAt: '2024-05-01T00:00:00.000Z', updatedAt: '2024-06-11T08:00:00.000Z',
    },
    {
      id: 'emp7', empleadoId: 'ONB-102', nombre: 'Carlos López', posicion: 'Recepcionista', posicionEn: 'Receptionist', departamento: 'Recepción', departamentoEn: 'Reception', foto: null,
      fechaIngreso: '2024-04-15T00:00:00.000Z', estado: 'onboarding', nivelCarrera: 1, rutaCarrera: 'Recepcionista Jr. → Recepcionista → Concierge', rutaCarreraEn: 'Jr. Receptionist → Receptionist → Concierge',
      tipoJornada: 'fijo', horarioEntrada: '07:00', horarioSalida: '15:00', diasTrabajo: '["lunes","martes","miercoles","jueves","viernes"]', cubreTurnos: false, turnoPreferido: 'matutino',
      salario: 10000, tipoContrato: 'practica', fechaFinContrato: '2024-10-15T00:00:00.000Z',
      puntuacionConocimiento: 55, puntuacionVentas: 40, puntuacionHospitalidad: 70, puntuacionTotal: 54.8,
      totalUpselling: 200, npsPromedio: 7.5, cursosCompletados: 1, cursosEnProgreso: 1,
      indiceFelicidad: 72, riesgoBaja: 20, nivelRiesgoBaja: 'medio',
      justificacionRiesgo: 'Aún en periodo de adaptación', sugerenciaCapacitacion: 'Mentoría con recepcionista senior',
      ultimaActividad: '2024-06-10T17:00:00.000Z', fechaBaja: null, reemplazoTargetId: null,
      propiedadId: 'prop3',
      propiedad: { id: 'prop3', nombre: 'Gran Hotel CDMX', nombreEn: 'Grand Hotel Mexico City', region: 'cdmx' },
      _count: { cursos: 2, alertas: 1, ventas: 1 },
      createdAt: '2024-04-15T00:00:00.000Z', updatedAt: '2024-06-10T17:00:00.000Z',
    },
    {
      id: 'emp8', empleadoId: 'MES-402', nombre: 'María García', posicion: 'Mesera Jr.', posicionEn: 'Jr. Waitress', departamento: 'A&B', departamentoEn: 'F&B', foto: null,
      fechaIngreso: '2023-11-01T00:00:00.000Z', estado: 'activo', nivelCarrera: 1, rutaCarrera: 'Mesera Jr. → Mesera', rutaCarreraEn: 'Jr. Waitress → Waitress',
      tipoJornada: 'fijo', horarioEntrada: '14:00', horarioSalida: '22:00', diasTrabajo: '["lunes","martes","miercoles","jueves","viernes"]', cubreTurnos: false, turnoPreferido: 'vespertino',
      salario: 9500, tipoContrato: 'eventual', fechaFinContrato: '2024-12-01T00:00:00.000Z',
      puntuacionConocimiento: 50, puntuacionVentas: 40, puntuacionHospitalidad: 55, puntuacionTotal: 48.3,
      totalUpselling: 450, npsPromedio: 6.1, cursosCompletados: 1, cursosEnProgreso: 0,
      indiceFelicidad: 42, riesgoBaja: 78, nivelRiesgoBaja: 'alto',
      justificacionRiesgo: 'NPS bajo consecutivo, índice de felicidad decreciente, sin actividad en capacitaciones', sugerenciaCapacitacion: 'Entrevista de retención + curso de motivación laboral',
      ultimaActividad: '2024-06-05T10:00:00.000Z', fechaBaja: null, reemplazoTargetId: null,
      propiedadId: 'prop1',
      propiedad: { id: 'prop1', nombre: 'Hotel Playa Cancún', nombreEn: 'Cancún Beach Hotel', region: 'cancun' },
      _count: { cursos: 1, alertas: 2, ventas: 2 },
      createdAt: '2023-11-01T00:00:00.000Z', updatedAt: '2024-06-05T10:00:00.000Z',
    },
    {
      id: 'emp9', empleadoId: 'REC-801', nombre: 'Diego Flores', posicion: 'Recepcionista Jr.', posicionEn: 'Jr. Receptionist', departamento: 'Recepción', departamentoEn: 'Reception', foto: null,
      fechaIngreso: '2023-09-10T00:00:00.000Z', estado: 'activo', nivelCarrera: 1, rutaCarrera: 'Recepcionista Jr. → Recepcionista', rutaCarreraEn: 'Jr. Receptionist → Receptionist',
      tipoJornada: 'mixto', horarioEntrada: '06:00', horarioSalida: '14:00', diasTrabajo: '["lunes","miercoles","viernes","sabado","domingo"]', cubreTurnos: false, turnoPreferido: 'matutino',
      salario: 11000, tipoContrato: 'indefinido', fechaFinContrato: null,
      puntuacionConocimiento: 55, puntuacionVentas: 45, puntuacionHospitalidad: 60, puntuacionTotal: 53.3,
      totalUpselling: 600, npsPromedio: 6.8, cursosCompletados: 2, cursosEnProgreso: 0,
      indiceFelicidad: 48, riesgoBaja: 65, nivelRiesgoBaja: 'alto',
      justificacionRiesgo: 'Índice de felicidad bajo, estancamiento en nivel de carrera, caída en NPS', sugerenciaCapacitacion: 'Plan de desarrollo individual + capacitación en servicio al cliente',
      ultimaActividad: '2024-06-07T14:30:00.000Z', fechaBaja: null, reemplazoTargetId: null,
      propiedadId: 'prop3',
      propiedad: { id: 'prop3', nombre: 'Gran Hotel CDMX', nombreEn: 'Grand Hotel Mexico City', region: 'cdmx' },
      _count: { cursos: 2, alertas: 2, ventas: 2 },
      createdAt: '2023-09-10T00:00:00.000Z', updatedAt: '2024-06-07T14:30:00.000Z',
    },
    {
      id: 'emp10', empleadoId: 'MES-701', nombre: 'Patricia Ruiz', posicion: 'Mesera', posicionEn: 'Waitress', departamento: 'A&B', departamentoEn: 'F&B', foto: null,
      fechaIngreso: '2022-07-01T00:00:00.000Z', estado: 'activo', nivelCarrera: 2, rutaCarrera: 'Mesera Jr. → Mesera', rutaCarreraEn: 'Jr. Waitress → Waitress',
      tipoJornada: 'variable', horarioEntrada: null, horarioSalida: null, diasTrabajo: '["lunes","martes","miercoles","jueves","viernes","sabado","domingo"]', cubreTurnos: true, turnoPreferido: 'mixto',
      salario: 10500, tipoContrato: 'eventual', fechaFinContrato: '2024-09-30T00:00:00.000Z',
      puntuacionConocimiento: 40, puntuacionVentas: 30, puntuacionHospitalidad: 35, puntuacionTotal: 34.8,
      totalUpselling: 120, npsPromedio: 5.2, cursosCompletados: 0, cursosEnProgreso: 0,
      indiceFelicidad: 35, riesgoBaja: 92, nivelRiesgoBaja: 'critico',
      justificacionRiesgo: 'Combinación de factores críticos: NPS muy bajo, felicidad en mínimo, sin participación en capacitaciones, inactividad prolongada en la app', sugerenciaCapacitacion: 'Intervención inmediata: entrevista de retención con RH, considerar cambio de área',
      ultimaActividad: '2024-05-28T09:00:00.000Z', fechaBaja: null, reemplazoTargetId: null,
      propiedadId: 'prop1',
      propiedad: { id: 'prop1', nombre: 'Hotel Playa Cancún', nombreEn: 'Cancún Beach Hotel', region: 'cancun' },
      _count: { cursos: 0, alertas: 3, ventas: 1 },
      createdAt: '2022-07-01T00:00:00.000Z', updatedAt: '2024-05-28T09:00:00.000Z',
    },
    {
      id: 'emp11', empleadoId: 'ONB-103', nombre: 'Sofía Ramírez', posicion: 'Mesera Jr.', posicionEn: 'Jr. Waitress', departamento: 'A&B', departamentoEn: 'F&B', foto: null,
      fechaIngreso: '2024-06-01T00:00:00.000Z', estado: 'onboarding', nivelCarrera: 1, rutaCarrera: 'Mesera Jr. → Mesera', rutaCarreraEn: 'Jr. Waitress → Waitress',
      tipoJornada: 'fijo', horarioEntrada: '07:00', horarioSalida: '15:00', diasTrabajo: '["lunes","martes","miercoles","jueves","viernes"]', cubreTurnos: false, turnoPreferido: 'matutino',
      salario: 9000, tipoContrato: 'temporal', fechaFinContrato: '2024-12-01T00:00:00.000Z',
      puntuacionConocimiento: 30, puntuacionVentas: 20, puntuacionHospitalidad: 50, puntuacionTotal: 33.5,
      totalUpselling: 0, npsPromedio: 0, cursosCompletados: 0, cursosEnProgreso: 3,
      indiceFelicidad: 80, riesgoBaja: 10, nivelRiesgoBaja: 'bajo',
      justificacionRiesgo: null, sugerenciaCapacitacion: null,
      ultimaActividad: '2024-06-11T10:00:00.000Z', fechaBaja: null, reemplazoTargetId: null,
      propiedadId: 'prop2',
      propiedad: { id: 'prop2', nombre: 'Restaurante La Terraza', nombreEn: 'La Terraza Restaurant', region: 'puebla' },
      _count: { cursos: 3, alertas: 0, ventas: 0 },
      createdAt: '2024-06-01T00:00:00.000Z', updatedAt: '2024-06-11T10:00:00.000Z',
    },
    {
      id: 'emp12', empleadoId: 'OFF-001', nombre: 'Fernando Morales', posicion: 'Bartender Sr.', posicionEn: 'Sr. Bartender', departamento: 'A&B', departamentoEn: 'F&B', foto: null,
      fechaIngreso: '2021-05-15T00:00:00.000Z', estado: 'offboarding', nivelCarrera: 3, rutaCarrera: 'Bartender → Bartender Sr. → Bar Manager', rutaCarreraEn: 'Bartender → Sr. Bartender → Bar Manager',
      tipoJornada: 'fijo', horarioEntrada: '18:00', horarioSalida: '02:00', diasTrabajo: '["jueves","viernes","sabado"]', cubreTurnos: false, turnoPreferido: 'nocturno',
      salario: 16000, tipoContrato: 'indefinido', fechaFinContrato: null,
      puntuacionConocimiento: 75, puntuacionVentas: 70, puntuacionHospitalidad: 72, puntuacionTotal: 72.3,
      totalUpselling: 1800, npsPromedio: 7.8, cursosCompletados: 4, cursosEnProgreso: 0,
      indiceFelicidad: 55, riesgoBaja: 85, nivelRiesgoBaja: 'alto',
      justificacionRiesgo: 'Empleado en proceso de offboarding, fecha de baja programada', sugerenciaCapacitacion: 'Reemplazo en proceso desde pool de candidatos',
      ultimaActividad: '2024-06-08T18:00:00.000Z', fechaBaja: '2024-06-30T00:00:00.000Z', reemplazoTargetId: null,
      propiedadId: 'prop4',
      propiedad: { id: 'prop4', nombre: 'Bar Mar Azul', nombreEn: 'Blue Sea Bar', region: 'playa_carmen' },
      _count: { cursos: 4, alertas: 1, ventas: 3 },
      createdAt: '2021-05-15T00:00:00.000Z', updatedAt: '2024-06-08T18:00:00.000Z',
    },
  ]
}

// ─── Servicios mock data ──────────────────────────────────────
export function getMockServicios() {
  return [
    { id: 'srv1', propiedadId: 'prop1', nombre: 'Filete Mignon con Trufa', nombreEn: 'Truffle Filet Mignon', descripcion: 'Filete de res con salsa de trufa negra y vegetales asados', descripcionEn: 'Beef tenderloin with black truffle sauce and roasted vegetables', categoria: 'platillo', categoriaEn: 'dish', esUpselling: true, precioNormal: 450, precioUpselling: 680, objetivoUpselling: 'Ofrecer maridaje de vino con el filete (+$230)', objetivoUpsellingEn: 'Offer wine pairing with the filet (+$230)', imagen: null, disponible: true, orden: 1, createdAt: '2024-01-20T10:00:00.000Z', updatedAt: '2024-06-01T10:00:00.000Z', propiedad: { id: 'prop1', nombre: 'Hotel Playa Cancún', nombreEn: 'Cancún Beach Hotel', moneda: 'MXN' } },
    { id: 'srv2', propiedadId: 'prop1', nombre: 'Ceviche de Camarón Premium', nombreEn: 'Premium Shrimp Ceviche', descripcion: 'Ceviche de camarón con aguacate y chipotle', descripcionEn: 'Shrimp ceviche with avocado and chipotle', categoria: 'platillo', categoriaEn: 'dish', esUpselling: true, precioNormal: 280, precioUpselling: 420, objetivoUpselling: 'Sugerir versión premium con camarón gigante', objetivoUpsellingEn: 'Suggest premium version with jumbo shrimp', imagen: null, disponible: true, orden: 2, createdAt: '2024-01-20T10:00:00.000Z', updatedAt: '2024-06-01T10:00:00.000Z', propiedad: { id: 'prop1', nombre: 'Hotel Playa Cancún', nombreEn: 'Cancún Beach Hotel', moneda: 'MXN' } },
    { id: 'srv3', propiedadId: 'prop1', nombre: 'Margarita de Mezcal Artesanal', nombreEn: 'Artisan Mezcal Margarita', descripcion: 'Margarita con mezcal artesanal y sal de gusano', descripcionEn: 'Margarita with artisan mezcal and worm salt', categoria: 'bebida', categoriaEn: 'drink', esUpselling: true, precioNormal: 180, precioUpselling: 320, objetivoUpselling: 'Ofrecer upgrade a mezcal premium', objetivoUpsellingEn: 'Offer upgrade to premium mezcal', imagen: null, disponible: true, orden: 3, createdAt: '2024-01-20T10:00:00.000Z', updatedAt: '2024-06-01T10:00:00.000Z', propiedad: { id: 'prop1', nombre: 'Hotel Playa Cancún', nombreEn: 'Cancún Beach Hotel', moneda: 'MXN' } },
    { id: 'srv4', propiedadId: 'prop1', nombre: 'Tour Isla Mujeres Privado', nombreEn: 'Private Isla Mujeres Tour', descripcion: 'Tour privado en yate a Isla Mujeres con snorkel y comida', descripcionEn: 'Private yacht tour to Isla Mujeres with snorkeling and lunch', categoria: 'tour', categoriaEn: 'tour', esUpselling: true, precioNormal: 2500, precioUpselling: 4500, objetivoUpselling: 'Ofrecer upgrade a tour privado vs compartido', objetivoUpsellingEn: 'Offer upgrade to private vs shared tour', imagen: null, disponible: true, orden: 4, createdAt: '2024-01-20T10:00:00.000Z', updatedAt: '2024-06-01T10:00:00.000Z', propiedad: { id: 'prop1', nombre: 'Hotel Playa Cancún', nombreEn: 'Cancún Beach Hotel', moneda: 'MXN' } },
    { id: 'srv5', propiedadId: 'prop1', nombre: 'Suite Upgrade Ocean View', nombreEn: 'Ocean View Suite Upgrade', descripcion: 'Upgrade de habitación estándar a suite con vista al mar', descripcionEn: 'Upgrade from standard room to ocean view suite', categoria: 'habitacion', categoriaEn: 'room', esUpselling: true, precioNormal: 3500, precioUpselling: 6800, objetivoUpselling: 'Ofrecer upgrade al check-in', objetivoUpsellingEn: 'Offer upgrade at check-in', imagen: null, disponible: true, orden: 5, createdAt: '2024-01-20T10:00:00.000Z', updatedAt: '2024-06-01T10:00:00.000Z', propiedad: { id: 'prop1', nombre: 'Hotel Playa Cancún', nombreEn: 'Cancún Beach Hotel', moneda: 'MXN' } },
    { id: 'srv6', propiedadId: 'prop1', nombre: 'Masaje Relajante Spa', nombreEn: 'Relaxing Spa Massage', descripcion: 'Masaje relajante de 60 minutos con aceites esenciales', descripcionEn: '60-minute relaxing massage with essential oils', categoria: 'masaje', categoriaEn: 'massage', esUpselling: false, precioNormal: 1200, precioUpselling: null, objetivoUpselling: null, objetivoUpsellingEn: null, imagen: null, disponible: true, orden: 6, createdAt: '2024-01-20T10:00:00.000Z', updatedAt: '2024-06-01T10:00:00.000Z', propiedad: { id: 'prop1', nombre: 'Hotel Playa Cancún', nombreEn: 'Cancún Beach Hotel', moneda: 'MXN' } },
    { id: 'srv7', propiedadId: 'prop1', nombre: 'Cena Romántica en Playa', nombreEn: 'Romantic Beach Dinner', descripcion: 'Cena privada en la playa con menú degustación', descripcionEn: 'Private beach dinner with tasting menu', categoria: 'experiencia', categoriaEn: 'experience', esUpselling: true, precioNormal: 3800, precioUpselling: 5500, objetivoUpselling: 'Incluir propuesta con champagne y flores', objetivoUpsellingEn: 'Include proposal package with champagne and flowers', imagen: null, disponible: true, orden: 7, createdAt: '2024-01-20T10:00:00.000Z', updatedAt: '2024-06-01T10:00:00.000Z', propiedad: { id: 'prop1', nombre: 'Hotel Playa Cancún', nombreEn: 'Cancún Beach Hotel', moneda: 'MXN' } },
    { id: 'srv8', propiedadId: 'prop1', nombre: 'Tacos al Pastor', nombreEn: 'Tacos al Pastor', descripcion: 'Tacos al pastor tradicionales con piña', descripcionEn: 'Traditional al pastor tacos with pineapple', categoria: 'platillo', categoriaEn: 'dish', esUpselling: false, precioNormal: 120, precioUpselling: null, objetivoUpselling: null, objetivoUpsellingEn: null, imagen: null, disponible: true, orden: 8, createdAt: '2024-01-20T10:00:00.000Z', updatedAt: '2024-06-01T10:00:00.000Z', propiedad: { id: 'prop1', nombre: 'Hotel Playa Cancún', nombreEn: 'Cancún Beach Hotel', moneda: 'MXN' } },
    { id: 'srv9', propiedadId: 'prop2', nombre: 'Mole Poblano Tradicional', nombreEn: 'Traditional Mole Poblano', descripcion: 'Mole poblano con pollo y arroz', descripcionEn: 'Mole poblano with chicken and rice', categoria: 'platillo', categoriaEn: 'dish', esUpselling: false, precioNormal: 220, precioUpselling: null, objetivoUpselling: null, objetivoUpsellingEn: null, imagen: null, disponible: true, orden: 1, createdAt: '2024-02-10T10:00:00.000Z', updatedAt: '2024-06-01T10:00:00.000Z', propiedad: { id: 'prop2', nombre: 'Restaurante La Terraza', nombreEn: 'La Terraza Restaurant', moneda: 'MXN' } },
    { id: 'srv10', propiedadId: 'prop2', nombre: 'Chiles en Nogada', nombreEn: 'Chiles en Nogada', descripcion: 'Chiles en nogada tradicionales con granada', descripcionEn: 'Traditional chiles en nogada with pomegranate', categoria: 'platillo', categoriaEn: 'dish', esUpselling: true, precioNormal: 280, precioUpselling: 380, objetivoUpselling: 'Ofrecer versión gourmet con ingredientes premium', objetivoUpsellingEn: 'Offer gourmet version with premium ingredients', imagen: null, disponible: true, orden: 2, createdAt: '2024-02-10T10:00:00.000Z', updatedAt: '2024-06-01T10:00:00.000Z', propiedad: { id: 'prop2', nombre: 'Restaurante La Terraza', nombreEn: 'La Terraza Restaurant', moneda: 'MXN' } },
    { id: 'srv11', propiedadId: 'prop3', nombre: 'Sushi Omakase', nombreEn: 'Omakase Sushi', descripcion: 'Menú omakase de 12 piezas con chef exclusivo', descripcionEn: '12-piece omakase menu with exclusive chef', categoria: 'platillo', categoriaEn: 'dish', esUpselling: true, precioNormal: 850, precioUpselling: 1500, objetivoUpselling: 'Ofrecer maridaje de sake premium', objetivoUpsellingEn: 'Offer premium sake pairing', imagen: null, disponible: true, orden: 1, createdAt: '2024-03-15T10:00:00.000Z', updatedAt: '2024-06-01T10:00:00.000Z', propiedad: { id: 'prop3', nombre: 'Gran Hotel CDMX', nombreEn: 'Grand Hotel Mexico City', moneda: 'MXN' } },
    { id: 'srv12', propiedadId: 'prop3', nombre: 'Mezcal Tasting Experience', nombreEn: 'Mezcal Tasting Experience', descripcion: 'Degustación de 5 mezcales con maridaje', descripcionEn: 'Tasting of 5 mezcals with pairing', categoria: 'experiencia', categoriaEn: 'experience', esUpselling: true, precioNormal: 600, precioUpselling: 950, objetivoUpselling: 'Incluir botella de mezcal para llevar', objetivoUpsellingEn: 'Include mezcal bottle to go', imagen: null, disponible: true, orden: 2, createdAt: '2024-03-15T10:00:00.000Z', updatedAt: '2024-06-01T10:00:00.000Z', propiedad: { id: 'prop3', nombre: 'Gran Hotel CDMX', nombreEn: 'Grand Hotel Mexico City', moneda: 'MXN' } },
    { id: 'srv13', propiedadId: 'prop3', nombre: 'Cocktail de Bienvenida', nombreEn: 'Welcome Cocktail', descripcion: 'Cocktail de bienvenida con mezcal y frutas tropicales', descripcionEn: 'Welcome cocktail with mezcal and tropical fruits', categoria: 'bebida', categoriaEn: 'drink', esUpselling: false, precioNormal: 150, precioUpselling: null, objetivoUpselling: null, objetivoUpsellingEn: null, imagen: null, disponible: true, orden: 3, createdAt: '2024-03-15T10:00:00.000Z', updatedAt: '2024-06-01T10:00:00.000Z', propiedad: { id: 'prop3', nombre: 'Gran Hotel CDMX', nombreEn: 'Grand Hotel Mexico City', moneda: 'MXN' } },
    { id: 'srv14', propiedadId: 'prop4', nombre: 'Cocktail Tropical Sunset', nombreEn: 'Tropical Sunset Cocktail', descripcion: 'Cocktail con ron, jugo de maracuyá y granadina', descripcionEn: 'Cocktail with rum, passion fruit juice and grenadine', categoria: 'bebida', categoriaEn: 'drink', esUpselling: true, precioNormal: 150, precioUpselling: 250, objetivoUpselling: 'Ofrecer versión premium con ron añejo', objetivoUpsellingEn: 'Offer premium version with aged rum', imagen: null, disponible: true, orden: 1, createdAt: '2024-04-10T10:00:00.000Z', updatedAt: '2024-06-01T10:00:00.000Z', propiedad: { id: 'prop4', nombre: 'Bar Mar Azul', nombreEn: 'Blue Sea Bar', moneda: 'MXN' } },
    { id: 'srv15', propiedadId: 'prop4', nombre: 'Tabla de Mariscos Premium', nombreEn: 'Premium Seafood Platter', descripcion: 'Tabla de mariscos con ostras, camarones y ceviche', descripcionEn: 'Seafood platter with oysters, shrimp and ceviche', categoria: 'platillo', categoriaEn: 'dish', esUpselling: true, precioNormal: 650, precioUpselling: 980, objetivoUpselling: 'Agregar langosta a la tabla', objetivoUpsellingEn: 'Add lobster to the platter', imagen: null, disponible: true, orden: 2, createdAt: '2024-04-10T10:00:00.000Z', updatedAt: '2024-06-01T10:00:00.000Z', propiedad: { id: 'prop4', nombre: 'Bar Mar Azul', nombreEn: 'Blue Sea Bar', moneda: 'MXN' } },
    { id: 'srv16', propiedadId: 'prop5', nombre: 'Sunset Catamaran Tour', nombreEn: 'Sunset Catamaran Tour', descripcion: 'Tour en catamarán al atardecer con open bar', descripcionEn: 'Sunset catamaran tour with open bar', categoria: 'tour', categoriaEn: 'tour', esUpselling: true, precioNormal: 1800, precioUpselling: 3200, objetivoUpselling: 'Ofrecer upgrade a tour privado', objetivoUpsellingEn: 'Offer upgrade to private tour', imagen: null, disponible: true, orden: 1, createdAt: '2024-05-10T10:00:00.000Z', updatedAt: '2024-06-01T10:00:00.000Z', propiedad: { id: 'prop5', nombre: 'Resort Los Cabos', nombreEn: 'Los Cabos Resort', moneda: 'USD' } },
    { id: 'srv17', propiedadId: 'prop5', nombre: 'Suite Master Ocean Front', nombreEn: 'Master Ocean Front Suite', descripcion: 'Upgrade a suite master frente al mar', descripcionEn: 'Upgrade to master ocean front suite', categoria: 'habitacion', categoriaEn: 'room', esUpselling: true, precioNormal: 500, precioUpselling: 1200, objetivoUpselling: 'Upgrade al hacer la reservación', objetivoUpsellingEn: 'Upgrade at booking', imagen: null, disponible: true, orden: 2, createdAt: '2024-05-10T10:00:00.000Z', updatedAt: '2024-06-01T10:00:00.000Z', propiedad: { id: 'prop5', nombre: 'Resort Los Cabos', nombreEn: 'Los Cabos Resort', moneda: 'USD' } },
    { id: 'srv18', propiedadId: 'prop5', nombre: 'Spa Wellness Package', nombreEn: 'Wellness Spa Package', descripcion: 'Paquete de spa completo con temazcal', descripcionEn: 'Full spa package with temazcal', categoria: 'masaje', categoriaEn: 'massage', esUpselling: true, precioNormal: 200, precioUpselling: 380, objetivoUpselling: 'Agregar temazcal al paquete de spa', objetivoUpsellingEn: 'Add temazcal to spa package', imagen: null, disponible: true, orden: 3, createdAt: '2024-05-10T10:00:00.000Z', updatedAt: '2024-06-01T10:00:00.000Z', propiedad: { id: 'prop5', nombre: 'Resort Los Cabos', nombreEn: 'Los Cabos Resort', moneda: 'USD' } },
    { id: 'srv19', propiedadId: 'prop6', nombre: 'Camarones al Mojo de Ajo', nombreEn: 'Garlic Butter Shrimp', descripcion: 'Camarones al mojo de ajo con arroz', descripcionEn: 'Garlic butter shrimp with rice', categoria: 'platillo', categoriaEn: 'dish', esUpselling: false, precioNormal: 250, precioUpselling: null, objetivoUpselling: null, objetivoUpsellingEn: null, imagen: null, disponible: true, orden: 1, createdAt: '2024-06-05T10:00:00.000Z', updatedAt: '2024-06-05T10:00:00.000Z', propiedad: { id: 'prop6', nombre: 'Restaurante Puerto Veracruz', nombreEn: 'Veracruz Port Restaurant', moneda: 'MXN' } },
  ]
}

// ─── Alertas mock data ────────────────────────────────────────
export function getMockAlertas() {
  return {
    alertas: [
      { id: 'alert1', empleadoId: 'emp10', propiedadId: 'prop1', tipo: 'baja_felicidad', tipoEn: 'low_happiness', severidad: 'critico', mensaje: 'Índice de felicidad en mínimo histórico (35/100). Sin actividad en app por 13 días. NPS promedio 5.2.', mensajeEn: 'Happiness index at historic low (35/100). No app activity for 13 days. Average NPS 5.2.', probabilidad: 92, generadoPorIA: true, leida: false, resuelta: false, createdAt: '2024-06-08T09:00:00.000Z', empleado: { id: 'emp10', nombre: 'Patricia Ruiz', empleadoId: 'MES-701', posicion: 'Mesera', foto: null, departamento: 'A&B', riesgoBaja: 92, indiceFelicidad: 35, propiedad: { nombre: 'Hotel Playa Cancún', region: 'cancun' } }, propiedad: { nombre: 'Hotel Playa Cancún', region: 'cancun' } },
      { id: 'alert2', empleadoId: 'emp10', propiedadId: 'prop1', tipo: 'nps_bajo', tipoEn: 'low_nps', severidad: 'critico', mensaje: 'NPS consecutivo por debajo de 6 en las últimas 3 evaluaciones', mensajeEn: 'Consecutive NPS below 6 in the last 3 evaluations', probabilidad: 88, generadoPorIA: true, leida: false, resuelta: false, createdAt: '2024-06-07T14:00:00.000Z', empleado: { id: 'emp10', nombre: 'Patricia Ruiz', empleadoId: 'MES-701', posicion: 'Mesera', foto: null, departamento: 'A&B', riesgoBaja: 92, indiceFelicidad: 35, propiedad: { nombre: 'Hotel Playa Cancún', region: 'cancun' } }, propiedad: { nombre: 'Hotel Playa Cancún', region: 'cancun' } },
      { id: 'alert3', empleadoId: 'emp8', propiedadId: 'prop1', tipo: 'estancamiento', tipoEn: 'stagnation', severidad: 'alto', mensaje: 'Estancamiento en nivel de carrera: Mesera Jr. por más de 7 meses sin progreso', mensajeEn: 'Career stagnation: Jr. Waitress for over 7 months with no progress', probabilidad: 78, generadoPorIA: true, leida: true, resuelta: false, createdAt: '2024-06-06T10:00:00.000Z', empleado: { id: 'emp8', nombre: 'María García', empleadoId: 'MES-402', posicion: 'Mesera Jr.', foto: null, departamento: 'A&B', riesgoBaja: 78, indiceFelicidad: 42, propiedad: { nombre: 'Hotel Playa Cancún', region: 'cancun' } }, propiedad: { nombre: 'Hotel Playa Cancún', region: 'cancun' } },
      { id: 'alert4', empleadoId: 'emp9', propiedadId: 'prop3', tipo: 'baja_felicidad', tipoEn: 'low_happiness', severidad: 'alto', mensaje: 'Índice de felicidad decreciente: de 65 a 48 en las últimas 4 semanas', mensajeEn: 'Declining happiness index: from 65 to 48 in the last 4 weeks', probabilidad: 65, generadoPorIA: true, leida: false, resuelta: false, createdAt: '2024-06-05T16:00:00.000Z', empleado: { id: 'emp9', nombre: 'Diego Flores', empleadoId: 'REC-801', posicion: 'Recepcionista Jr.', foto: null, departamento: 'Recepción', riesgoBaja: 65, indiceFelicidad: 48, propiedad: { nombre: 'Gran Hotel CDMX', region: 'cdmx' } }, propiedad: { nombre: 'Gran Hotel CDMX', region: 'cdmx' } },
      { id: 'alert5', empleadoId: 'emp8', propiedadId: 'prop1', tipo: 'inactividad', tipoEn: 'inactivity', severidad: 'medio', mensaje: 'Sin actividad en la app por 6 días consecutivos', mensajeEn: 'No app activity for 6 consecutive days', probabilidad: 45, generadoPorIA: false, leida: true, resuelta: false, createdAt: '2024-06-04T11:00:00.000Z', empleado: { id: 'emp8', nombre: 'María García', empleadoId: 'MES-402', posicion: 'Mesera Jr.', foto: null, departamento: 'A&B', riesgoBaja: 78, indiceFelicidad: 42, propiedad: { nombre: 'Hotel Playa Cancún', region: 'cancun' } }, propiedad: { nombre: 'Hotel Playa Cancún', region: 'cancun' } },
      { id: 'alert6', empleadoId: 'emp12', propiedadId: 'prop4', tipo: 'fin_contrato', tipoEn: 'contract_end', severidad: 'medio', mensaje: 'Fecha de baja programada: 30 de junio. Reemplazo pendiente de confirmación.', mensajeEn: 'Scheduled departure: June 30. Replacement pending confirmation.', probabilidad: 85, generadoPorIA: false, leida: true, resuelta: false, createdAt: '2024-06-03T08:00:00.000Z', empleado: { id: 'emp12', nombre: 'Fernando Morales', empleadoId: 'OFF-001', posicion: 'Bartender Sr.', foto: null, departamento: 'A&B', riesgoBaja: 85, indiceFelicidad: 55, propiedad: { nombre: 'Bar Mar Azul', region: 'playa_carmen' } }, propiedad: { nombre: 'Bar Mar Azul', region: 'playa_carmen' } },
      { id: 'alert7', empleadoId: 'emp4', propiedadId: 'prop1', tipo: 'estancamiento', tipoEn: 'stagnation', severidad: 'bajo', mensaje: 'Nivel de carrera 2 por más de 12 meses, sugerir plan de desarrollo', mensajeEn: 'Career level 2 for over 12 months, suggest development plan', probabilidad: 25, generadoPorIA: true, leida: true, resuelta: true, createdAt: '2024-05-28T09:00:00.000Z', empleado: { id: 'emp4', nombre: 'Roberto Sánchez', empleadoId: 'MES-301', posicion: 'Mesero', foto: null, departamento: 'A&B', riesgoBaja: 25, indiceFelicidad: 78, propiedad: { nombre: 'Hotel Playa Cancún', region: 'cancun' } }, propiedad: { nombre: 'Hotel Playa Cancún', region: 'cancun' } },
      { id: 'alert8', empleadoId: 'emp9', propiedadId: 'prop3', tipo: 'nps_bajo', tipoEn: 'low_nps', severidad: 'medio', mensaje: 'NPS por debajo de 7 en las últimas 2 evaluaciones', mensajeEn: 'NPS below 7 in the last 2 evaluations', probabilidad: 50, generadoPorIA: true, leida: false, resuelta: false, createdAt: '2024-06-01T14:00:00.000Z', empleado: { id: 'emp9', nombre: 'Diego Flores', empleadoId: 'REC-801', posicion: 'Recepcionista Jr.', foto: null, departamento: 'Recepción', riesgoBaja: 65, indiceFelicidad: 48, propiedad: { nombre: 'Gran Hotel CDMX', region: 'cdmx' } }, propiedad: { nombre: 'Gran Hotel CDMX', region: 'cdmx' } },
    ],
    total: 8,
    limit: 50,
    offset: 0,
    resumen: {
      total: 8,
      porSeveridad: { critico: 2, alto: 2, medio: 3, bajo: 1 },
    },
  }
}

// ─── Candidatos mock data ─────────────────────────────────────
export function getMockCandidatos() {
  return {
    candidatos: [
      { id: 'cand1', nombre: 'Lucía Mendoza', email: 'lucia.mendoza@email.com', telefono: '+52 555 123 4567', posicion: 'Mesera Jr.', posicionEn: 'Jr. Waitress', region: 'cancun', experiencia: 2, habilidades: '["servicio al cliente", "POS", "trabajo en equipo"]', estado: 'disponible', puntuacionEntrevista: 85, notas: 'Excelente actitud y experiencia previa en hotel 5 estrellas', fuente: 'portal', propiedadId: null, empleadoReemplazaId: null, fechaContratacion: null, onboardingCompletado: false, nivelAlcanzado: 0, createdAt: '2024-06-01T10:00:00.000Z', updatedAt: '2024-06-01T10:00:00.000Z', propiedad: null },
      { id: 'cand2', nombre: 'Andrés Vargas', email: 'andres.vargas@email.com', telefono: '+52 555 234 5678', posicion: 'Bartender', posicionEn: 'Bartender', region: 'playa_carmen', experiencia: 4, habilidades: '["mixología", "coctelería", "atención al cliente"]', estado: 'disponible', puntuacionEntrevista: 90, notas: 'Especialista en coctelería tropical, referido por empleado actual', fuente: 'referido', propiedadId: 'prop4', empleadoReemplazaId: 'emp12', fechaContratacion: null, onboardingCompletado: false, nivelAlcanzado: 0, createdAt: '2024-06-02T10:00:00.000Z', updatedAt: '2024-06-02T10:00:00.000Z', propiedad: { nombre: 'Bar Mar Azul', region: 'playa_carmen' } },
      { id: 'cand3', nombre: 'Valentina Cruz', email: 'valentina.cruz@email.com', telefono: '+52 555 345 6789', posicion: 'Recepcionista', posicionEn: 'Receptionist', region: 'cdmx', experiencia: 3, habilidades: '["idiomas", "reservaciones", "concierge"]', estado: 'en_proceso', puntuacionEntrevista: 78, notas: 'Hablante de inglés e italiano, en proceso de segunda entrevista', fuente: 'agencia', propiedadId: 'prop3', empleadoReemplazaId: 'emp9', fechaContratacion: null, onboardingCompletado: false, nivelAlcanzado: 0, createdAt: '2024-06-03T10:00:00.000Z', updatedAt: '2024-06-03T10:00:00.000Z', propiedad: { nombre: 'Gran Hotel CDMX', region: 'cdmx' } },
      { id: 'cand4', nombre: 'Marco Reyes', email: 'marco.reyes@email.com', telefono: '+52 555 456 7890', posicion: 'Mesero Sr.', posicionEn: 'Sr. Waiter', region: 'cancun', experiencia: 5, habilidades: '["upselling", "vinos", "servicio premium"]', estado: 'disponible', puntuacionEntrevista: 88, notas: 'Experiencia en restaurantes fine dining', fuente: 'referido', propiedadId: null, empleadoReemplazaId: null, fechaContratacion: null, onboardingCompletado: false, nivelAlcanzado: 0, createdAt: '2024-06-04T10:00:00.000Z', updatedAt: '2024-06-04T10:00:00.000Z', propiedad: null },
      { id: 'cand5', nombre: 'Isabel Torres', email: 'isabel.torres@email.com', telefono: '+52 555 567 8901', posicion: 'Mesera', posicionEn: 'Waitress', region: 'cancun', experiencia: 1, habilidades: '["comunicación", "trabajo en equipo"]', estado: 'disponible', puntuacionEntrevista: 72, notas: 'Perfil para reemplazar a Patricia Ruiz si es necesario', fuente: 'portal', propiedadId: 'prop1', empleadoReemplazaId: 'emp10', fechaContratacion: null, onboardingCompletado: false, nivelAlcanzado: 0, createdAt: '2024-06-05T10:00:00.000Z', updatedAt: '2024-06-05T10:00:00.000Z', propiedad: { nombre: 'Hotel Playa Cancún', region: 'cancun' } },
      { id: 'cand6', nombre: 'Pablo Jiménez', email: 'pablo.jimenez@email.com', telefono: '+52 555 678 9012', posicion: 'Barback', posicionEn: 'Barback', region: 'playa_carmen', experiencia: 1, habilidades: '["preparación de bebidas", "limpieza", "organización"]', estado: 'disponible', puntuacionEntrevista: 65, notas: 'Candidato joven con potencial de crecimiento', fuente: 'spontaneous', propiedadId: null, empleadoReemplazaId: null, fechaContratacion: null, onboardingCompletado: false, nivelAlcanzado: 0, createdAt: '2024-06-06T10:00:00.000Z', updatedAt: '2024-06-06T10:00:00.000Z', propiedad: null },
      { id: 'cand7', nombre: 'Daniela Ríos', email: 'daniela.rios@email.com', telefono: '+52 555 789 0123', posicion: 'Capitana', posicionEn: 'Captain', region: 'cancun', experiencia: 6, habilidades: '["liderazgo", "supervisión", "capacitación", "upselling avanzado"]', estado: 'disponible', puntuacionEntrevista: 92, notas: 'Experiencia como capitana en hotel competidor', fuente: 'agencia', propiedadId: null, empleadoReemplazaId: null, fechaContratacion: null, onboardingCompletado: false, nivelAlcanzado: 0, createdAt: '2024-06-07T10:00:00.000Z', updatedAt: '2024-06-07T10:00:00.000Z', propiedad: null },
      { id: 'cand8', nombre: 'Ricardo Navarro', email: 'ricardo.navarro@email.com', telefono: '+52 555 890 1234', posicion: 'Recepcionista Jr.', posicionEn: 'Jr. Receptionist', region: 'cdmx', experiencia: 2, habilidades: '["sistemas hoteleros", "atención al cliente", "inglés"]', estado: 'en_proceso', puntuacionEntrevista: 75, notas: 'En proceso de verificación de referencias', fuente: 'portal', propiedadId: null, empleadoReemplazaId: null, fechaContratacion: null, onboardingCompletado: false, nivelAlcanzado: 0, createdAt: '2024-06-08T10:00:00.000Z', updatedAt: '2024-06-08T10:00:00.000Z', propiedad: null },
    ],
    total: 8,
    limit: 50,
    offset: 0,
  }
}

// ─── Capacitaciones mock data ─────────────────────────────────
export function getMockCapacitaciones() {
  return [
    { id: 'cap1', titulo: 'Técnicas de Upselling en Restaurante', tituloEn: 'Restaurant Upselling Techniques', descripcion: 'Aprende las mejores técnicas para incrementar ventas sugiriendo upgrades y complementos', descripcionEn: 'Learn the best techniques to increase sales by suggesting upgrades and add-ons', categoria: 'upselling', categoriaEn: 'upselling', modalidad: 'virtual', duracion: 45, dificultad: 'intermedio', dificultadEn: 'intermediate', urlContenido: null, miniatura: null, posicion: 'Mesero / Capitán', posicionEn: 'Waiter / Captain', puntos: 15, activo: true, propiedadId: 'prop1', createdAt: '2024-01-20T10:00:00.000Z', updatedAt: '2024-06-01T10:00:00.000Z', propiedad: { id: 'prop1', nombre: 'Hotel Playa Cancún', nombreEn: 'Cancún Beach Hotel' }, _count: { inscripciones: 6, solicitudes: 2 }, inscripcionesCount: 6, completadosCount: 4, enProgresoCount: 2, tasaCompletado: 67 },
    { id: 'cap2', titulo: 'Excelencia en Servicio al Cliente', tituloEn: 'Customer Service Excellence', descripcion: 'Fundamentos de hospitalidad y servicio excepcional', descripcionEn: 'Hospitality and exceptional service fundamentals', categoria: 'hospitalidad', categoriaEn: 'hospitality', modalidad: 'presencial', duracion: 60, dificultad: 'principiante', dificultadEn: 'beginner', urlContenido: null, miniatura: null, posicion: 'Todos', posicionEn: 'All', puntos: 10, activo: true, propiedadId: null, createdAt: '2024-02-10T10:00:00.000Z', updatedAt: '2024-06-01T10:00:00.000Z', propiedad: null, _count: { inscripciones: 8, solicitudes: 1 }, inscripcionesCount: 8, completadosCount: 5, enProgresoCount: 3, tasaCompletado: 63 },
    { id: 'cap3', titulo: 'Conocimiento del Menú: Platillos Estrella', tituloEn: 'Menu Knowledge: Star Dishes', descripcion: 'Conoce a profundidad los platillos estrella del menú para recomendar con confianza', descripcionEn: 'Know the star menu dishes in depth to recommend with confidence', categoria: 'conocimiento_producto', categoriaEn: 'product_knowledge', modalidad: 'virtual', duracion: 30, dificultad: 'principiante', dificultadEn: 'beginner', urlContenido: null, miniatura: null, posicion: 'Mesero', posicionEn: 'Waiter', puntos: 10, activo: true, propiedadId: 'prop1', createdAt: '2024-03-05T10:00:00.000Z', updatedAt: '2024-06-01T10:00:00.000Z', propiedad: { id: 'prop1', nombre: 'Hotel Playa Cancún', nombreEn: 'Cancún Beach Hotel' }, _count: { inscripciones: 5, solicitudes: 0 }, inscripcionesCount: 5, completadosCount: 3, enProgresoCount: 2, tasaCompletado: 60 },
    { id: 'cap4', titulo: 'Onboarding: Tu Primer Día', tituloEn: 'Onboarding: Your First Day', descripcion: 'Todo lo que necesitas saber para tu primer día de trabajo', descripcionEn: 'Everything you need to know for your first day at work', categoria: 'onboarding', categoriaEn: 'onboarding', modalidad: 'virtual', duracion: 20, dificultad: 'principiante', dificultadEn: 'beginner', urlContenido: null, miniatura: null, posicion: 'Nuevo Ingreso', posicionEn: 'New Hire', puntos: 5, activo: true, propiedadId: null, createdAt: '2024-01-15T10:00:00.000Z', updatedAt: '2024-06-01T10:00:00.000Z', propiedad: null, _count: { inscripciones: 3, solicitudes: 0 }, inscripcionesCount: 3, completadosCount: 2, enProgresoCount: 1, tasaCompletado: 67 },
    { id: 'cap5', titulo: 'Liderazgo y Gestión de Equipos', tituloEn: 'Leadership and Team Management', descripcion: 'Habilidades de liderazgo para capitanes y gerentes', descripcionEn: 'Leadership skills for captains and managers', categoria: 'liderazgo', categoriaEn: 'leadership', modalidad: 'presencial', duracion: 90, dificultad: 'avanzado', dificultadEn: 'advanced', urlContenido: null, miniatura: null, posicion: 'Capitán / Gerente', posicionEn: 'Captain / Manager', puntos: 20, activo: true, propiedadId: null, createdAt: '2024-04-01T10:00:00.000Z', updatedAt: '2024-06-01T10:00:00.000Z', propiedad: null, _count: { inscripciones: 2, solicitudes: 1 }, inscripcionesCount: 2, completadosCount: 1, enProgresoCount: 1, tasaCompletado: 50 },
    { id: 'cap6', titulo: 'Coctelería Avanzada', tituloEn: 'Advanced Cocktails', descripcion: 'Técnicas avanzadas de mixología y presentación', descripcionEn: 'Advanced mixology and presentation techniques', categoria: 'conocimiento_producto', categoriaEn: 'product_knowledge', modalidad: 'presencial', duracion: 60, dificultad: 'avanzado', dificultadEn: 'advanced', urlContenido: null, miniatura: null, posicion: 'Bartender', posicionEn: 'Bartender', puntos: 15, activo: true, propiedadId: 'prop4', createdAt: '2024-05-01T10:00:00.000Z', updatedAt: '2024-06-01T10:00:00.000Z', propiedad: { id: 'prop4', nombre: 'Bar Mar Azul', nombreEn: 'Blue Sea Bar' }, _count: { inscripciones: 1, solicitudes: 1 }, inscripcionesCount: 1, completadosCount: 0, enProgresoCount: 1, tasaCompletado: 0 },
    { id: 'cap7', titulo: 'Manejo de Quejas y Situaciones Difíciles', tituloEn: 'Handling Complaints and Difficult Situations', descripcion: 'Cómo manejar quejas de clientes y convertir experiencias negativas en positivas', descripcionEn: 'How to handle customer complaints and turn negative experiences into positive ones', categoria: 'hospitalidad', categoriaEn: 'hospitality', modalidad: 'virtual', duracion: 40, dificultad: 'intermedio', dificultadEn: 'intermediate', urlContenido: null, miniatura: null, posicion: 'Todos', posicionEn: 'All', puntos: 12, activo: true, propiedadId: null, createdAt: '2024-03-20T10:00:00.000Z', updatedAt: '2024-06-01T10:00:00.000Z', propiedad: null, _count: { inscripciones: 4, solicitudes: 0 }, inscripcionesCount: 4, completadosCount: 2, enProgresoCount: 2, tasaCompletado: 50 },
    { id: 'cap8', titulo: 'Venta de Experiencias y Tours', tituloEn: 'Selling Experiences and Tours', descripcion: 'Técnicas para vender tours, experiencias y upgrades de habitación', descripcionEn: 'Techniques for selling tours, experiences and room upgrades', categoria: 'upselling', categoriaEn: 'upselling', modalidad: 'virtual', duracion: 35, dificultad: 'intermedio', dificultadEn: 'intermediate', urlContenido: null, miniatura: null, posicion: 'Recepcionista / Concierge', posicionEn: 'Receptionist / Concierge', puntos: 12, activo: true, propiedadId: null, createdAt: '2024-04-15T10:00:00.000Z', updatedAt: '2024-06-01T10:00:00.000Z', propiedad: null, _count: { inscripciones: 3, solicitudes: 1 }, inscripcionesCount: 3, completadosCount: 1, enProgresoCount: 2, tasaCompletado: 33 },
  ]
}

// ─── Ventas mock data ─────────────────────────────────────────
export function getMockVentas() {
  const ventas = [
    { id: 'v1', empleadoId: 'emp1', propiedadId: 'prop1', montoUpselling: 680, esUpselling: true, nombreServicio: 'Filete Mignon con Trufa + Maridaje', cantidad: 1, precioUnitario: 680, montoTotal: 680, calificacionNPS: 10, esPromotor: true, comentario: 'Excelente recomendación de la capitana', fuenteNPS: 'qr', categoriaServicio: 'platillo', fechaVenta: '2024-06-10T14:30:00.000Z', analizadoPorIA: true, resultadoIA: null, createdAt: '2024-06-10T14:30:00.000Z', empleado: { id: 'emp1', nombre: 'Laura Hernández', empleadoId: 'CAP-501', posicion: 'Capitana', foto: null }, propiedad: { nombre: 'Hotel Playa Cancún', tipo: 'hotel' } },
    { id: 'v2', empleadoId: 'emp2', propiedadId: 'prop1', montoUpselling: 1200, esUpselling: true, nombreServicio: 'Cena Romántica en Playa', cantidad: 2, precioUnitario: 5500, montoTotal: 5500, calificacionNPS: 10, esPromotor: true, comentario: 'Una experiencia inolvidable', fuenteNPS: 'app', categoriaServicio: 'experiencia', fechaVenta: '2024-06-09T20:00:00.000Z', analizadoPorIA: true, resultadoIA: null, createdAt: '2024-06-09T20:00:00.000Z', empleado: { id: 'emp2', nombre: 'Carmen Delgado', empleadoId: 'GER-001', posicion: 'Gerente A&B', foto: null }, propiedad: { nombre: 'Hotel Playa Cancún', tipo: 'hotel' } },
    { id: 'v3', empleadoId: 'emp3', propiedadId: 'prop1', montoUpselling: 420, esUpselling: true, nombreServicio: 'Ceviche Premium', cantidad: 1, precioUnitario: 420, montoTotal: 420, calificacionNPS: 9, esPromotor: true, comentario: null, fuenteNPS: 'qr', categoriaServicio: 'platillo', fechaVenta: '2024-06-09T13:00:00.000Z', analizadoPorIA: true, resultadoIA: null, createdAt: '2024-06-09T13:00:00.000Z', empleado: { id: 'emp3', nombre: 'Juan Pérez', empleadoId: 'MES-401', posicion: 'Mesero Sr.', foto: null }, propiedad: { nombre: 'Hotel Playa Cancún', tipo: 'hotel' } },
    { id: 'v4', empleadoId: 'emp5', propiedadId: 'prop1', montoUpselling: 320, esUpselling: true, nombreServicio: 'Margarita Mezcal Premium', cantidad: 2, precioUnitario: 320, montoTotal: 640, calificacionNPS: 8, esPromotor: false, comentario: 'Buen cóctel', fuenteNPS: 'sms', categoriaServicio: 'bebida', fechaVenta: '2024-06-08T21:00:00.000Z', analizadoPorIA: true, resultadoIA: null, createdAt: '2024-06-08T21:00:00.000Z', empleado: { id: 'emp5', nombre: 'Miguel Torres', empleadoId: 'BAR-201', posicion: 'Bartender', foto: null }, propiedad: { nombre: 'Hotel Playa Cancún', tipo: 'hotel' } },
    { id: 'v5', empleadoId: 'emp1', propiedadId: 'prop1', montoUpselling: 4500, esUpselling: true, nombreServicio: 'Tour Isla Mujeres Privado', cantidad: 1, precioUnitario: 4500, montoTotal: 4500, calificacionNPS: 10, esPromotor: true, comentario: 'Increíble experiencia', fuenteNPS: 'email', categoriaServicio: 'tour', fechaVenta: '2024-06-08T09:00:00.000Z', analizadoPorIA: true, resultadoIA: null, createdAt: '2024-06-08T09:00:00.000Z', empleado: { id: 'emp1', nombre: 'Laura Hernández', empleadoId: 'CAP-501', posicion: 'Capitana', foto: null }, propiedad: { nombre: 'Hotel Playa Cancún', tipo: 'hotel' } },
    { id: 'v6', empleadoId: 'emp4', propiedadId: 'prop1', montoUpselling: 0, esUpselling: false, nombreServicio: 'Tacos al Pastor', cantidad: 3, precioUnitario: 120, montoTotal: 360, calificacionNPS: 7, esPromotor: false, comentario: null, fuenteNPS: 'qr', categoriaServicio: 'platillo', fechaVenta: '2024-06-07T14:00:00.000Z', analizadoPorIA: false, resultadoIA: null, createdAt: '2024-06-07T14:00:00.000Z', empleado: { id: 'emp4', nombre: 'Roberto Sánchez', empleadoId: 'MES-301', posicion: 'Mesero', foto: null }, propiedad: { nombre: 'Hotel Playa Cancún', tipo: 'hotel' } },
    { id: 'v7', empleadoId: 'emp3', propiedadId: 'prop1', montoUpselling: 230, esUpselling: true, nombreServicio: 'Filete Mignon + Maridaje', cantidad: 1, precioUnitario: 680, montoTotal: 680, calificacionNPS: 9, esPromotor: true, comentario: 'Juan recomendó el maridaje perfecto', fuenteNPS: 'app', categoriaServicio: 'platillo', fechaVenta: '2024-06-07T13:30:00.000Z', analizadoPorIA: true, resultadoIA: null, createdAt: '2024-06-07T13:30:00.000Z', empleado: { id: 'emp3', nombre: 'Juan Pérez', empleadoId: 'MES-401', posicion: 'Mesero Sr.', foto: null }, propiedad: { nombre: 'Hotel Playa Cancún', tipo: 'hotel' } },
    { id: 'v8', empleadoId: 'emp2', propiedadId: 'prop1', montoUpselling: 6800, esUpselling: true, nombreServicio: 'Suite Ocean View Upgrade', cantidad: 1, precioUnitario: 6800, montoTotal: 6800, calificacionNPS: 10, esPromotor: true, comentario: 'Vale cada peso', fuenteNPS: 'qr', categoriaServicio: 'habitacion', fechaVenta: '2024-06-06T15:00:00.000Z', analizadoPorIA: true, resultadoIA: null, createdAt: '2024-06-06T15:00:00.000Z', empleado: { id: 'emp2', nombre: 'Carmen Delgado', empleadoId: 'GER-001', posicion: 'Gerente A&B', foto: null }, propiedad: { nombre: 'Hotel Playa Cancún', tipo: 'hotel' } },
    { id: 'v9', empleadoId: 'emp5', propiedadId: 'prop1', montoUpselling: 320, esUpselling: true, nombreServicio: 'Margarita Mezcal Premium', cantidad: 1, precioUnitario: 320, montoTotal: 320, calificacionNPS: 9, esPromotor: true, comentario: null, fuenteNPS: 'qr', categoriaServicio: 'bebida', fechaVenta: '2024-06-06T22:00:00.000Z', analizadoPorIA: false, resultadoIA: null, createdAt: '2024-06-06T22:00:00.000Z', empleado: { id: 'emp5', nombre: 'Miguel Torres', empleadoId: 'BAR-201', posicion: 'Bartender', foto: null }, propiedad: { nombre: 'Hotel Playa Cancún', tipo: 'hotel' } },
    { id: 'v10', empleadoId: 'emp1', propiedadId: 'prop1', montoUpselling: 380, esUpselling: true, nombreServicio: 'Chiles en Nogada Gourmet', cantidad: 1, precioUnitario: 380, montoTotal: 380, calificacionNPS: 9, esPromotor: true, comentario: 'Sugerencia excelente', fuenteNPS: 'app', categoriaServicio: 'platillo', fechaVenta: '2024-06-05T14:00:00.000Z', analizadoPorIA: true, resultadoIA: null, createdAt: '2024-06-05T14:00:00.000Z', empleado: { id: 'emp1', nombre: 'Laura Hernández', empleadoId: 'CAP-501', posicion: 'Capitana', foto: null }, propiedad: { nombre: 'Hotel Playa Cancún', tipo: 'hotel' } },
    { id: 'v11', empleadoId: 'emp8', propiedadId: 'prop1', montoUpselling: 0, esUpselling: false, nombreServicio: 'Tacos al Pastor', cantidad: 2, precioUnitario: 120, montoTotal: 240, calificacionNPS: 5, esPromotor: false, comentario: 'Servicio lento', fuenteNPS: 'sms', categoriaServicio: 'platillo', fechaVenta: '2024-06-04T13:00:00.000Z', analizadoPorIA: false, resultadoIA: null, createdAt: '2024-06-04T13:00:00.000Z', empleado: { id: 'emp8', nombre: 'María García', empleadoId: 'MES-402', posicion: 'Mesera Jr.', foto: null }, propiedad: { nombre: 'Hotel Playa Cancún', tipo: 'hotel' } },
    { id: 'v12', empleadoId: 'emp10', propiedadId: 'prop1', montoUpselling: 0, esUpselling: false, nombreServicio: 'Ceviche de Camarón', cantidad: 1, precioUnitario: 280, montoTotal: 280, calificacionNPS: 4, esPromotor: false, comentario: 'No recomendó nada extra', fuenteNPS: 'qr', categoriaServicio: 'platillo', fechaVenta: '2024-06-03T14:00:00.000Z', analizadoPorIA: false, resultadoIA: null, createdAt: '2024-06-03T14:00:00.000Z', empleado: { id: 'emp10', nombre: 'Patricia Ruiz', empleadoId: 'MES-701', posicion: 'Mesera', foto: null }, propiedad: { nombre: 'Hotel Playa Cancún', tipo: 'hotel' } },
    { id: 'v13', empleadoId: 'emp7', propiedadId: 'prop3', montoUpselling: 200, esUpselling: true, nombreServicio: 'Cocktail de Bienvenida', cantidad: 1, precioUnitario: 150, montoTotal: 350, calificacionNPS: 8, esPromotor: false, comentario: null, fuenteNPS: 'qr', categoriaServicio: 'bebida', fechaVenta: '2024-06-08T18:00:00.000Z', analizadoPorIA: false, resultadoIA: null, createdAt: '2024-06-08T18:00:00.000Z', empleado: { id: 'emp7', nombre: 'Carlos López', empleadoId: 'ONB-102', posicion: 'Recepcionista', foto: null }, propiedad: { nombre: 'Gran Hotel CDMX', tipo: 'hotel' } },
    { id: 'v14', empleadoId: 'emp9', propiedadId: 'prop3', montoUpselling: 0, esUpselling: false, nombreServicio: 'Cocktail de Bienvenida', cantidad: 1, precioUnitario: 150, montoTotal: 150, calificacionNPS: 6, esPromotor: false, comentario: 'Podría ser más atento', fuenteNPS: 'sms', categoriaServicio: 'bebida', fechaVenta: '2024-06-06T19:00:00.000Z', analizadoPorIA: false, resultadoIA: null, createdAt: '2024-06-06T19:00:00.000Z', empleado: { id: 'emp9', nombre: 'Diego Flores', empleadoId: 'REC-801', posicion: 'Recepcionista Jr.', foto: null }, propiedad: { nombre: 'Gran Hotel CDMX', tipo: 'hotel' } },
    { id: 'v15', empleadoId: 'emp9', propiedadId: 'prop3', montoUpselling: 0, esUpselling: false, nombreServicio: 'Mezcal Tasting', cantidad: 2, precioUnitario: 600, montoTotal: 1200, calificacionNPS: 7, esPromotor: false, comentario: null, fuenteNPS: 'qr', categoriaServicio: 'experiencia', fechaVenta: '2024-06-04T17:00:00.000Z', analizadoPorIA: false, resultadoIA: null, createdAt: '2024-06-04T17:00:00.000Z', empleado: { id: 'emp9', nombre: 'Diego Flores', empleadoId: 'REC-801', posicion: 'Recepcionista Jr.', foto: null }, propiedad: { nombre: 'Gran Hotel CDMX', tipo: 'hotel' } },
    { id: 'v16', empleadoId: 'emp7', propiedadId: 'prop3', montoUpselling: 950, esUpselling: true, nombreServicio: 'Mezcal Tasting + Botella', cantidad: 1, precioUnitario: 950, montoTotal: 950, calificacionNPS: 9, esPromotor: true, comentario: 'Gran recomendación', fuenteNPS: 'app', categoriaServicio: 'experiencia', fechaVenta: '2024-06-02T18:00:00.000Z', analizadoPorIA: true, resultadoIA: null, createdAt: '2024-06-02T18:00:00.000Z', empleado: { id: 'emp7', nombre: 'Carlos López', empleadoId: 'ONB-102', posicion: 'Recepcionista', foto: null }, propiedad: { nombre: 'Gran Hotel CDMX', tipo: 'hotel' } },
    { id: 'v17', empleadoId: 'emp11', propiedadId: 'prop2', montoUpselling: 0, esUpselling: false, nombreServicio: 'Mole Poblano', cantidad: 1, precioUnitario: 220, montoTotal: 220, calificacionNPS: null, esPromotor: null, comentario: null, fuenteNPS: null, categoriaServicio: 'platillo', fechaVenta: '2024-06-10T13:00:00.000Z', analizadoPorIA: false, resultadoIA: null, createdAt: '2024-06-10T13:00:00.000Z', empleado: { id: 'emp11', nombre: 'Sofía Ramírez', empleadoId: 'ONB-103', posicion: 'Mesera Jr.', foto: null }, propiedad: { nombre: 'Restaurante La Terraza', tipo: 'restaurante' } },
    { id: 'v18', empleadoId: 'emp12', propiedadId: 'prop4', montoUpselling: 250, esUpselling: true, nombreServicio: 'Cocktail Tropical Premium', cantidad: 2, precioUnitario: 250, montoTotal: 500, calificacionNPS: 8, esPromotor: false, comentario: 'Buen ambiente', fuenteNPS: 'qr', categoriaServicio: 'bebida', fechaVenta: '2024-06-07T22:00:00.000Z', analizadoPorIA: false, resultadoIA: null, createdAt: '2024-06-07T22:00:00.000Z', empleado: { id: 'emp12', nombre: 'Fernando Morales', empleadoId: 'OFF-001', posicion: 'Bartender Sr.', foto: null }, propiedad: { nombre: 'Bar Mar Azul', tipo: 'bar' } },
    { id: 'v19', empleadoId: 'emp12', propiedadId: 'prop4', montoUpselling: 0, esUpselling: false, nombreServicio: 'Cocktail Tropical', cantidad: 1, precioUnitario: 150, montoTotal: 150, calificacionNPS: 7, esPromotor: false, comentario: null, fuenteNPS: 'qr', categoriaServicio: 'bebida', fechaVenta: '2024-06-05T21:00:00.000Z', analizadoPorIA: false, resultadoIA: null, createdAt: '2024-06-05T21:00:00.000Z', empleado: { id: 'emp12', nombre: 'Fernando Morales', empleadoId: 'OFF-001', posicion: 'Bartender Sr.', foto: null }, propiedad: { nombre: 'Bar Mar Azul', tipo: 'bar' } },
    { id: 'v20', empleadoId: 'emp12', propiedadId: 'prop4', montoUpselling: 980, esUpselling: true, nombreServicio: 'Tabla de Mariscos + Langosta', cantidad: 1, precioUnitario: 980, montoTotal: 980, calificacionNPS: 9, esPromotor: true, comentario: 'Increíble la tabla', fuenteNPS: 'app', categoriaServicio: 'platillo', fechaVenta: '2024-06-03T20:00:00.000Z', analizadoPorIA: true, resultadoIA: null, createdAt: '2024-06-03T20:00:00.000Z', empleado: { id: 'emp12', nombre: 'Fernando Morales', empleadoId: 'OFF-001', posicion: 'Bartender Sr.', foto: null }, propiedad: { nombre: 'Bar Mar Azul', tipo: 'bar' } },
    { id: 'v21', propiedadId: 'prop5', montoUpselling: 3200, esUpselling: true, nombreServicio: 'Sunset Catamaran Private', cantidad: 1, precioUnitario: 3200, montoTotal: 3200, calificacionNPS: 10, esPromotor: true, comentario: 'Best experience ever', fuenteNPS: 'email', categoriaServicio: 'tour', fechaVenta: '2024-06-09T16:00:00.000Z', analizadoPorIA: true, resultadoIA: null, createdAt: '2024-06-09T16:00:00.000Z', empleadoId: 'emp5', empleado: { id: 'emp5', nombre: 'Miguel Torres', empleadoId: 'BAR-201', posicion: 'Bartender', foto: null }, propiedad: { nombre: 'Resort Los Cabos', tipo: 'hotel' } },
    { id: 'v22', propiedadId: 'prop5', montoUpselling: 1200, esUpselling: true, nombreServicio: 'Suite Master Upgrade', cantidad: 1, precioUnitario: 1200, montoTotal: 1200, calificacionNPS: 9, esPromotor: true, comentario: null, fuenteNPS: 'qr', categoriaServicio: 'habitacion', fechaVenta: '2024-06-07T12:00:00.000Z', analizadoPorIA: true, resultadoIA: null, createdAt: '2024-06-07T12:00:00.000Z', empleadoId: 'emp7', empleado: { id: 'emp7', nombre: 'Carlos López', empleadoId: 'ONB-102', posicion: 'Recepcionista', foto: null }, propiedad: { nombre: 'Resort Los Cabos', tipo: 'hotel' } },
    { id: 'v23', propiedadId: 'prop5', montoUpselling: 380, esUpselling: true, nombreServicio: 'Spa + Temazcal Package', cantidad: 1, precioUnitario: 380, montoTotal: 380, calificacionNPS: 8, esPromotor: false, comentario: 'Relajante', fuenteNPS: 'sms', categoriaServicio: 'masaje', fechaVenta: '2024-06-05T11:00:00.000Z', analizadoPorIA: false, resultadoIA: null, createdAt: '2024-06-05T11:00:00.000Z', empleadoId: 'emp6', empleado: { id: 'emp6', nombre: 'Ana Martínez', empleadoId: 'ONB-101', posicion: 'Mesera Jr.', foto: null }, propiedad: { nombre: 'Resort Los Cabos', tipo: 'hotel' } },
    { id: 'v24', propiedadId: 'prop2', montoUpselling: 380, esUpselling: true, nombreServicio: 'Chiles en Nogada Gourmet', cantidad: 1, precioUnitario: 380, montoTotal: 380, calificacionNPS: 9, esPromotor: true, comentario: 'Delicioso', fuenteNPS: 'qr', categoriaServicio: 'platillo', fechaVenta: '2024-06-04T14:00:00.000Z', analizadoPorIA: false, resultadoIA: null, createdAt: '2024-06-04T14:00:00.000Z', empleadoId: 'emp11', empleado: { id: 'emp11', nombre: 'Sofía Ramírez', empleadoId: 'ONB-103', posicion: 'Mesera Jr.', foto: null }, propiedad: { nombre: 'Restaurante La Terraza', tipo: 'restaurante' } },
  ]
  return { ventas, total: ventas.length, limit: 50, offset: 0 }
}

// ─── Solicitudes mock data ────────────────────────────────────
export function getMockSolicitudes() {
  return [
    { id: 'sol1', propiedadId: 'prop1', capacitacionId: 'cap1', modalidad: 'presencial', tema: null, fechaSolicitada: '2024-06-15T10:00:00.000Z', fechaConfirmada: '2024-06-18T10:00:00.000Z', participantes: 5, instructorId: null, nombreInstructor: 'Ricardo Mendoza', estado: 'confirmada', costo: 2500, notas: 'Sesión intensiva de upselling para equipo de A&B', creadoPor: 'emp2', createdAt: '2024-06-01T10:00:00.000Z', updatedAt: '2024-06-05T10:00:00.000Z', propiedad: { id: 'prop1', nombre: 'Hotel Playa Cancún', nombreEn: 'Cancún Beach Hotel', region: 'cancun' }, capacitacion: { id: 'cap1', titulo: 'Técnicas de Upselling en Restaurante', tituloEn: 'Restaurant Upselling Techniques', categoria: 'upselling', modalidad: 'virtual' } },
    { id: 'sol2', propiedadId: 'prop3', capacitacionId: 'cap7', modalidad: 'virtual', tema: null, fechaSolicitada: '2024-06-20T10:00:00.000Z', fechaConfirmada: null, participantes: 3, instructorId: null, nombreInstructor: null, estado: 'pendiente', costo: null, notas: 'Para equipo de recepción', creadoPor: 'emp9', createdAt: '2024-06-05T10:00:00.000Z', updatedAt: '2024-06-05T10:00:00.000Z', propiedad: { id: 'prop3', nombre: 'Gran Hotel CDMX', nombreEn: 'Grand Hotel Mexico City', region: 'cdmx' }, capacitacion: { id: 'cap7', titulo: 'Manejo de Quejas y Situaciones Difíciles', tituloEn: 'Handling Complaints and Difficult Situations', categoria: 'hospitalidad', modalidad: 'virtual' } },
    { id: 'sol3', propiedadId: 'prop4', capacitacionId: 'cap6', modalidad: 'presencial', tema: null, fechaSolicitada: '2024-06-22T10:00:00.000Z', fechaConfirmada: '2024-06-25T10:00:00.000Z', participantes: 1, instructorId: null, nombreInstructor: 'Chef Omar', estado: 'confirmada', costo: 1500, notas: 'Para reemplazo de bartender', creadoPor: null, createdAt: '2024-06-03T10:00:00.000Z', updatedAt: '2024-06-08T10:00:00.000Z', propiedad: { id: 'prop4', nombre: 'Bar Mar Azul', nombreEn: 'Blue Sea Bar', region: 'playa_carmen' }, capacitacion: { id: 'cap6', titulo: 'Coctelería Avanzada', tituloEn: 'Advanced Cocktails', categoria: 'conocimiento_producto', modalidad: 'presencial' } },
    { id: 'sol4', propiedadId: 'prop1', capacitacionId: null, modalidad: 'presencial', tema: 'Técnicas de Venta de Tours y Experiencias', fechaSolicitada: '2024-07-01T10:00:00.000Z', fechaConfirmada: null, participantes: 8, instructorId: null, nombreInstructor: null, estado: 'pendiente', costo: null, notas: 'Solicitud abierta - se necesita instructor especializado', creadoPor: 'emp1', createdAt: '2024-06-10T10:00:00.000Z', updatedAt: '2024-06-10T10:00:00.000Z', propiedad: { id: 'prop1', nombre: 'Hotel Playa Cancún', nombreEn: 'Cancún Beach Hotel', region: 'cancun' }, capacitacion: null },
  ]
}

// ─── Seed mock response ───────────────────────────────────────
export function getMockSeedResponse() {
  return {
    success: true,
    message: 'Mock mode - no database needed. Data is served from static mock data.',
    counts: {
      propiedades: 6,
      empleados: 12,
      servicios: 19,
      capacitaciones: 8,
      ventas: 24,
      alertas: 8,
      candidatos: 8,
      solicitudes: 4,
      instructores: 0,
    },
  }
}

// ─── Demo mode response for POST/PATCH/DELETE ────────────────
export function getDemoModeResponse(action: string, entity: string) {
  return {
    success: true,
    message: `Demo mode - ${action} on ${entity} saved locally`,
    demo: true,
  }
}

// ─── English API mock data ────────────────────────────────────

export function getMockEmployees() {
  return getMockEmpleados().map((e) => ({
    id: e.id,
    employeeId: e.empleadoId,
    name: e.nombre,
    position: e.posicion,
    positionEn: e.posicionEn,
    department: e.departamento,
    departmentEn: e.departamentoEn,
    photo: e.foto,
    hireDate: e.fechaIngreso,
    status: e.estado,
    careerLevel: e.nivelCarrera,
    careerPath: e.rutaCarrera,
    careerPathEn: e.rutaCarreraEn,
    knowledgeScore: e.puntuacionConocimiento,
    salesScore: e.puntuacionVentas,
    hospitalityScore: e.puntuacionHospitalidad,
    overallScore: e.puntuacionTotal,
    totalUpselling: e.totalUpselling,
    avgNPS: e.npsPromedio,
    coursesCompleted: e.cursosCompletados,
    coursesInProgress: e.cursosEnProgreso,
    happinessIndex: e.indiceFelicidad,
    turnoverRisk: e.riesgoBaja,
    propertyId: e.propiedadId,
    property: e.propiedad ? { name: e.propiedad.nombre, nameEn: e.propiedad.nombreEn } : null,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  }))
}

export function getMockCourses() {
  return getMockCapacitaciones().map((c) => ({
    id: c.id,
    title: c.titulo,
    titleEn: c.tituloEn,
    description: c.descripcion,
    descriptionEn: c.descripcionEn,
    category: c.categoria,
    categoryEn: c.categoriaEn,
    modality: c.modalidad,
    duration: c.duracion,
    difficulty: c.dificultad,
    difficultyEn: c.dificultadEn,
    contentUrl: c.urlContenido,
    thumbnail: c.miniatura,
    position: c.posicion,
    positionEn: c.posicionEn,
    points: c.puntos,
    active: c.activo,
    propertyId: c.propiedadId,
    property: c.propiedad ? { name: c.propiedad.nombre, nameEn: c.propiedad.nombreEn } : null,
    _count: { enrollments: c.inscripcionesCount },
    enrollmentCount: c.inscripcionesCount,
    completionRate: c.tasaCompletado,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }))
}

export function getMockServices() {
  return getMockServicios().map((s) => ({
    id: s.id,
    propertyId: s.propiedadId,
    name: s.nombre,
    nameEn: s.nombreEn,
    description: s.descripcion,
    descriptionEn: s.descripcionEn,
    category: s.categoria,
    categoryEn: s.categoriaEn,
    price: s.precioNormal,
    upsellingTarget: s.precioUpselling,
    image: s.imagen,
    active: s.disponible,
    property: s.propiedad ? { name: s.propiedad.nombre, nameEn: s.propiedad.nombreEn } : null,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  }))
}

export function getMockOrders() {
  return getMockVentas().ventas.map((v) => ({
    id: v.id,
    employeeId: v.empleadoId,
    serviceId: v.nombreServicio,
    quantity: v.cantidad,
    unitPrice: v.precioUnitario,
    totalAmount: v.montoTotal,
    isUpselling: v.esUpselling,
    customerSatisfaction: v.calificacionNPS,
    orderDate: v.fechaVenta,
    employee: { name: v.empleado.nombre, employeeId: v.empleado.empleadoId, propertyId: v.propiedadId },
    service: { name: v.nombreServicio || 'Service', nameEn: v.nombreServicio || 'Service', category: v.categoriaServicio || 'other' },
  }))
}

export function getMockInstructors() {
  return [
    { id: 'inst1', nombre: 'Ricardo Mendoza', especialidad: 'Upselling y Ventas', ubicacion: 'Cancún', region: 'cancun', calificacion: 4.8, tarifaHora: 500, disponible: true, createdAt: '2024-01-01T10:00:00.000Z', updatedAt: '2024-06-01T10:00:00.000Z', _count: { bookings: 3 } },
    { id: 'inst2', nombre: 'Chef Omar', especialidad: 'Coctelería y Gastronomía', ubicacion: 'Playa del Carmen', region: 'playa_carmen', calificacion: 4.9, tarifaHora: 600, disponible: true, createdAt: '2024-02-01T10:00:00.000Z', updatedAt: '2024-06-01T10:00:00.000Z', _count: { bookings: 2 } },
    { id: 'inst3', nombre: 'Patricia Luna', especialidad: 'Hospitalidad y Servicio', ubicacion: 'CDMX', region: 'cdmx', calificacion: 4.7, tarifaHora: 450, disponible: true, createdAt: '2024-03-01T10:00:00.000Z', updatedAt: '2024-06-01T10:00:00.000Z', _count: { bookings: 1 } },
  ]
}

export function getMockBookings() {
  return [
    { id: 'book1', courseId: 'cap1', instructorId: 'inst1', propertyId: 'prop1', date: '2024-06-18T10:00:00.000Z', endTime: '2024-06-18T12:00:00.000Z', modality: 'in_person', status: 'confirmed', participants: 5, notes: 'Sesión intensiva de upselling', cost: 2500, createdAt: '2024-06-01T10:00:00.000Z', updatedAt: '2024-06-05T10:00:00.000Z', course: { title: 'Técnicas de Upselling en Restaurante', titleEn: 'Restaurant Upselling Techniques', category: 'upselling', modality: 'virtual', duration: 45 }, instructor: { name: 'Ricardo Mendoza', specialty: 'Upselling y Ventas', rating: 4.8 }, property: { name: 'Hotel Playa Cancún', nameEn: 'Cancún Beach Hotel', region: 'cancun' } },
    { id: 'book2', courseId: 'cap6', instructorId: 'inst2', propertyId: 'prop4', date: '2024-06-25T14:00:00.000Z', endTime: '2024-06-25T16:00:00.000Z', modality: 'in_person', status: 'confirmed', participants: 1, notes: 'Para reemplazo de bartender', cost: 1500, createdAt: '2024-06-03T10:00:00.000Z', updatedAt: '2024-06-08T10:00:00.000Z', course: { title: 'Coctelería Avanzada', titleEn: 'Advanced Cocktails', category: 'conocimiento_producto', modality: 'presencial', duration: 60 }, instructor: { name: 'Chef Omar', specialty: 'Coctelería y Gastronomía', rating: 4.9 }, property: { name: 'Bar Mar Azul', nameEn: 'Blue Sea Bar', region: 'playa_carmen' } },
    { id: 'book3', courseId: 'cap2', instructorId: 'inst3', propertyId: 'prop3', date: '2024-07-02T10:00:00.000Z', endTime: null, modality: 'virtual', status: 'pending', participants: 3, notes: 'Para equipo de recepción', cost: null, createdAt: '2024-06-05T10:00:00.000Z', updatedAt: '2024-06-05T10:00:00.000Z', course: { title: 'Excelencia en Servicio al Cliente', titleEn: 'Customer Service Excellence', category: 'hospitalidad', modality: 'presencial', duration: 60 }, instructor: { name: 'Patricia Luna', specialty: 'Hospitalidad y Servicio', rating: 4.7 }, property: { name: 'Gran Hotel CDMX', nameEn: 'Grand Hotel Mexico City', region: 'cdmx' } },
  ]
}

export function getMockTurnoverAlerts() {
  return getMockAlertas().alertas.map((a) => ({
    id: a.id,
    employeeId: a.empleadoId,
    type: a.tipo,
    typeEn: a.tipoEn,
    severity: a.severidad === 'critico' ? 'critical' : a.severidad === 'alto' ? 'high' : a.severidad === 'medio' ? 'medium' : 'low',
    message: a.mensaje,
    messageEn: a.mensajeEn,
    probability: a.probabilidad,
    isRead: a.leida,
    isResolved: a.resuelta,
    createdAt: a.createdAt,
    employee: {
      id: a.empleado.id,
      name: a.empleado.nombre,
      employeeId: a.empleado.empleadoId,
      position: a.empleado.posicion,
      positionEn: a.empleado.posicion,
      photo: a.empleado.foto,
      department: a.empleado.departamento,
      departmentEn: a.empleado.departamento,
      turnoverRisk: a.empleado.riesgoBaja,
      happinessIndex: a.empleado.indiceFelicidad,
      property: a.empleado.propiedad ? { name: a.empleado.propiedad.nombre, nameEn: a.empleado.propiedad.nombre } : null,
    },
  }))
}

export function getMockTraining() {
  const employees = getMockEmpleados()
  const courses = getMockCapacitaciones()
  const enrollments: unknown[] = []
  let id = 1
  employees.forEach((emp) => {
    const numCourses = emp.cursosCompletados + emp.cursosEnProgreso
    courses.slice(0, numCourses || 2).forEach((course, idx) => {
      const completed = idx < emp.cursosCompletados
      enrollments.push({
        id: `ec${id++}`,
        employeeId: emp.id,
        courseId: course.id,
        status: completed ? 'completed' : 'in_progress',
        progress: completed ? 100 : Math.floor(Math.random() * 80) + 10,
        score: completed ? Math.floor(Math.random() * 20) + 80 : null,
        startedAt: completed ? '2024-05-01T10:00:00.000Z' : '2024-06-01T10:00:00.000Z',
        completedAt: completed ? '2024-06-01T10:00:00.000Z' : null,
        createdAt: '2024-05-01T10:00:00.000Z',
        updatedAt: '2024-06-01T10:00:00.000Z',
        employee: {
          id: emp.id,
          name: emp.nombre,
          employeeId: emp.empleadoId,
          position: emp.posicion,
          positionEn: emp.posicionEn,
          photo: emp.foto,
          propertyId: emp.propiedadId,
        },
        course: {
          id: course.id,
          title: course.titulo,
          titleEn: course.tituloEn,
          category: course.categoria,
          categoryEn: course.categoriaEn,
          modality: course.modalidad,
          duration: course.duracion,
          difficulty: course.dificultad,
          points: course.puntos,
        },
      })
    })
  })
  return enrollments
}

// ─── Single employee detail mock ──────────────────────────────
export function getMockEmpleadoDetail(id: string) {
  const emp = getMockEmpleados().find((e) => e.id === id)
  if (!emp) return null

  const courses = getMockCapacitaciones()
  const employeeCourses = courses.slice(0, emp.cursosCompletados + emp.cursosEnProgreso || 2).map((c, idx) => ({
    id: `ec_${emp.id}_${c.id}`,
    empleadoId: emp.id,
    capacitacionId: c.id,
    estado: idx < emp.cursosCompletados ? 'completado' : 'en_progreso',
    progreso: idx < emp.cursosCompletados ? 100 : Math.floor(Math.random() * 80) + 10,
    puntuacion: idx < emp.cursosCompletados ? Math.floor(Math.random() * 20) + 80 : null,
    fechaInicio: idx < emp.cursosCompletados ? '2024-04-01T10:00:00.000Z' : '2024-06-01T10:00:00.000Z',
    fechaCompletado: idx < emp.cursosCompletados ? '2024-05-01T10:00:00.000Z' : null,
    createdAt: '2024-04-01T10:00:00.000Z',
    updatedAt: '2024-06-01T10:00:00.000Z',
    capacitacion: {
      id: c.id,
      titulo: c.titulo,
      tituloEn: c.tituloEn,
      categoria: c.categoria,
      modalidad: c.modalidad,
      duracion: c.duracion,
      dificultad: c.dificultad,
      puntos: c.puntos,
    },
  }))

  const ventasMock = getMockVentas().ventas.filter((v) => v.empleadoId === emp.id)

  const alertasMock = getMockAlertas().alertas.filter((a) => a.empleadoId === emp.id).map((a) => ({
    ...a,
    id: a.id,
    empleadoId: a.empleadoId,
    propiedadId: a.propiedadId,
    tipo: a.tipo,
    tipoEn: a.tipoEn,
    severidad: a.severidad,
    mensaje: a.mensaje,
    mensajeEn: a.mensajeEn,
    probabilidad: a.probabilidad,
    generadoPorIA: a.generadoPorIA,
    leida: a.leida,
    resuelta: a.resuelta,
    createdAt: a.createdAt,
  }))

  return {
    ...emp,
    cursos: employeeCourses,
    ventas: ventasMock,
    alertas: alertasMock,
    respuestasNps: [],
  }
}
