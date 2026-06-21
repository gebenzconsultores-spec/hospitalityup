// Mock data for HospitalityUP SaaS Platform

export interface Property {
  id: string
  name: string
  nameEn: string
  type: 'hotel' | 'restaurant' | 'bar'
  location: string
  region: string
  logo?: string
  plan: 'boutique' | 'growth' | 'enterprise'
  active: boolean
}

export interface Employee {
  id: string
  employeeId: string
  name: string
  position: string
  positionEn: string
  department: string
  departmentEn: string
  photo?: string
  hireDate: string
  status: 'active' | 'onboarding' | 'offboarding' | 'inactive'
  careerLevel: number
  careerPath: string
  careerPathEn: string
  knowledgeScore: number
  salesScore: number
  hospitalityScore: number
  overallScore: number
  totalUpselling: number
  avgNPS: number
  coursesCompleted: number
  coursesInProgress: number
  happinessIndex: number
  turnoverRisk: number
  lastActive?: string
  offboardingDate?: string
  propertyId: string
  propertyName: string
}

export interface Service {
  id: string
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  category: 'menu' | 'tour' | 'upselling' | 'room_upgrade' | 'experience'
  categoryEn: string
  price: number
  upsellingTarget?: number
  image?: string
  active: boolean
  propertyId: string
}

export interface Order {
  id: string
  employeeId: string
  employeeName: string
  serviceId: string
  serviceName: string
  quantity: number
  unitPrice: number
  totalAmount: number
  isUpselling: boolean
  customerSatisfaction?: number
  orderDate: string
}

export interface Course {
  id: string
  title: string
  titleEn: string
  description: string
  descriptionEn: string
  category: string
  categoryEn: string
  modality: 'virtual' | 'in_person'
  duration: number
  difficulty: string
  difficultyEn: string
  contentUrl?: string
  thumbnail?: string
  position?: string
  positionEn?: string
  points: number
  active: boolean
  propertyId?: string
  enrollmentCount: number
  completionRate: number
}

export interface EmployeeCourse {
  id: string
  employeeId: string
  employeeName: string
  courseId: string
  courseTitle: string
  courseTitleEn: string
  status: 'not_started' | 'in_progress' | 'completed'
  progress: number
  score?: number
  startedAt?: string
  completedAt?: string
}

export interface NPSResponse {
  id: string
  employeeId: string
  employeeName: string
  score: number
  comment?: string
  promoter: boolean
  source: string
  createdAt: string
}

export interface TurnoverAlert {
  id: string
  employeeId: string
  employeeName: string
  employeePosition: string
  type: string
  typeEn: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  messageEn: string
  probability: number
  isRead: boolean
  isResolved: boolean
  createdAt: string
}

export interface Instructor {
  id: string
  name: string
  specialty: string
  location: string
  region: string
  rating: number
  hourlyRate: number
  available: boolean
}

export interface Booking {
  id: string
  courseId: string
  courseTitle: string
  courseTitleEn: string
  instructorId?: string
  instructorName?: string
  propertyId: string
  propertyName: string
  date: string
  endTime?: string
  modality: 'virtual' | 'in_person'
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  participants: number
  notes?: string
  cost?: number
}

export interface Notification {
  id: string
  type: string
  title: string
  titleEn: string
  message: string
  messageEn: string
  isRead: boolean
  propertyId?: string
  createdAt: string
}

// ---- MOCK DATA ----

export const mockProperties: Property[] = [
  { id: 'prop1', name: 'Hotel Playa Cancún', nameEn: 'Cancún Beach Hotel', type: 'hotel', location: 'Cancún, Quintana Roo', region: 'cancun', plan: 'growth', active: true },
  { id: 'prop2', name: 'Restaurante La Terraza', nameEn: 'La Terraza Restaurant', type: 'restaurant', location: 'Puebla, Puebla', region: 'puebla', plan: 'boutique', active: true },
  { id: 'prop3', name: 'Gran Hotel CDMX', nameEn: 'Grand Hotel CDMX', type: 'hotel', location: 'Ciudad de México', region: 'cdmx', plan: 'enterprise', active: true },
  { id: 'prop4', name: 'Bar Mar Azul', nameEn: 'Blue Sea Bar', type: 'bar', location: 'Playa del Carmen, Q. Roo', region: 'playa_carmen', plan: 'boutique', active: true },
  { id: 'prop5', name: 'Resort Los Cabos', nameEn: 'Los Cabos Resort', type: 'hotel', location: 'Los Cabos, BCS', region: 'los_cabos', plan: 'growth', active: true },
  { id: 'prop6', name: 'Restaurante Puerto Veracruz', nameEn: 'Veracruz Port Restaurant', type: 'restaurant', location: 'Veracruz, Veracruz', region: 'veracruz', plan: 'boutique', active: true },
]

export const mockEmployees: Employee[] = [
  { id: 'emp1', employeeId: 'MES-401', name: 'Juan Pérez', position: 'Mesero Sr.', positionEn: 'Senior Waiter', department: 'Alimentos y Bebidas', departmentEn: 'Food & Beverage', hireDate: '2023-03-15', status: 'active', careerLevel: 3, careerPath: 'Mesero Jr. → Mesero Sr. → Capitán → Gerente A&B', careerPathEn: 'Jr. Waiter → Sr. Waiter → Captain → F&B Manager', knowledgeScore: 85, salesScore: 92, hospitalityScore: 88, overallScore: 88.3, totalUpselling: 4580, avgNPS: 9.2, coursesCompleted: 8, coursesInProgress: 2, happinessIndex: 85, turnoverRisk: 12, lastActive: '2025-01-24', propertyId: 'prop1', propertyName: 'Hotel Playa Cancún' },
  { id: 'emp2', employeeId: 'MES-402', name: 'María García', position: 'Mesera Jr.', positionEn: 'Jr. Waitress', department: 'Alimentos y Bebidas', departmentEn: 'Food & Beverage', hireDate: '2024-06-01', status: 'onboarding', careerLevel: 1, careerPath: 'Mesero Jr. → Mesero Sr. → Capitán → Gerente A&B', careerPathEn: 'Jr. Waiter → Sr. Waiter → Captain → F&B Manager', knowledgeScore: 45, salesScore: 38, hospitalityScore: 72, overallScore: 51.7, totalUpselling: 820, avgNPS: 7.8, coursesCompleted: 2, coursesInProgress: 3, happinessIndex: 68, turnoverRisk: 78, lastActive: '2025-01-23', propertyId: 'prop1', propertyName: 'Hotel Playa Cancún' },
  { id: 'emp3', employeeId: 'BEL-101', name: 'Carlos López', position: 'Bellboy Sr.', positionEn: 'Sr. Bellboy', department: 'Conserjería', departmentEn: 'Concierge', hireDate: '2022-11-20', status: 'active', careerLevel: 3, careerPath: 'Bellboy Jr. → Bellboy Sr. → Jefe de Conserjería', careerPathEn: 'Jr. Bellboy → Sr. Bellboy → Head Concierge', knowledgeScore: 90, salesScore: 78, hospitalityScore: 95, overallScore: 87.7, totalUpselling: 3200, avgNPS: 9.5, coursesCompleted: 10, coursesInProgress: 1, happinessIndex: 92, turnoverRisk: 8, lastActive: '2025-01-24', propertyId: 'prop1', propertyName: 'Hotel Playa Cancún' },
  { id: 'emp4', employeeId: 'REC-201', name: 'Ana Martínez', position: 'Recepcionista', positionEn: 'Receptionist', department: 'Recepción', departmentEn: 'Front Desk', hireDate: '2023-08-10', status: 'active', careerLevel: 2, careerPath: 'Recepcionista Jr. → Recepcionista → Supervisor Recepción', careerPathEn: 'Jr. Receptionist → Receptionist → Front Desk Supervisor', knowledgeScore: 72, salesScore: 65, hospitalityScore: 88, overallScore: 75, totalUpselling: 2100, avgNPS: 8.9, coursesCompleted: 5, coursesInProgress: 2, happinessIndex: 78, turnoverRisk: 35, lastActive: '2025-01-24', propertyId: 'prop3', propertyName: 'Gran Hotel CDMX' },
  { id: 'emp5', employeeId: 'CAM-301', name: 'Roberto Sánchez', position: 'Camarista', positionEn: 'Housekeeper', department: 'Ama de Llaves', departmentEn: 'Housekeeping', hireDate: '2024-01-15', status: 'active', careerLevel: 2, careerPath: 'Camarista → Supervisor de Piso → Ama de Llaves', careerPathEn: 'Housekeeper → Floor Supervisor → Head Housekeeper', knowledgeScore: 68, salesScore: 30, hospitalityScore: 82, overallScore: 60, totalUpselling: 450, avgNPS: 8.4, coursesCompleted: 4, coursesInProgress: 1, happinessIndex: 72, turnoverRisk: 45, lastActive: '2025-01-22', propertyId: 'prop1', propertyName: 'Hotel Playa Cancún' },
  { id: 'emp6', employeeId: 'MES-501', name: 'Laura Hernández', position: 'Capitana', positionEn: 'Captain', department: 'Alimentos y Bebidas', departmentEn: 'Food & Beverage', hireDate: '2021-05-01', status: 'active', careerLevel: 4, careerPath: 'Mesero Jr. → Mesero Sr. → Capitán → Gerente A&B', careerPathEn: 'Jr. Waiter → Sr. Waiter → Captain → F&B Manager', knowledgeScore: 95, salesScore: 88, hospitalityScore: 92, overallScore: 91.7, totalUpselling: 6800, avgNPS: 9.6, coursesCompleted: 14, coursesInProgress: 0, happinessIndex: 95, turnoverRisk: 5, lastActive: '2025-01-24', propertyId: 'prop2', propertyName: 'Restaurante La Terraza' },
  { id: 'emp7', employeeId: 'BAR-601', name: 'Miguel Torres', position: 'Bartender', positionEn: 'Bartender', department: 'Bar', departmentEn: 'Bar', hireDate: '2023-09-01', status: 'active', careerLevel: 2, careerPath: 'Barback → Bartender → Bar Manager', careerPathEn: 'Barback → Bartender → Bar Manager', knowledgeScore: 78, salesScore: 85, hospitalityScore: 80, overallScore: 81, totalUpselling: 3400, avgNPS: 8.7, coursesCompleted: 6, coursesInProgress: 2, happinessIndex: 82, turnoverRisk: 22, lastActive: '2025-01-24', propertyId: 'prop4', propertyName: 'Bar Mar Azul' },
  { id: 'emp8', employeeId: 'MES-701', name: 'Patricia Ruiz', position: 'Mesera', positionEn: 'Waitress', department: 'Alimentos y Bebidas', departmentEn: 'Food & Beverage', hireDate: '2024-03-20', status: 'offboarding', careerLevel: 2, careerPath: 'Mesero Jr. → Mesero Sr. → Capitán', careerPathEn: 'Jr. Waiter → Sr. Waiter → Captain', knowledgeScore: 55, salesScore: 42, hospitalityScore: 60, overallScore: 52.3, totalUpselling: 1100, avgNPS: 7.2, coursesCompleted: 3, coursesInProgress: 0, happinessIndex: 35, turnoverRisk: 92, offboardingDate: '2025-01-20', lastActive: '2025-01-20', propertyId: 'prop5', propertyName: 'Resort Los Cabos' },
  { id: 'emp9', employeeId: 'REC-801', name: 'Diego Flores', position: 'Recepcionista Jr.', positionEn: 'Jr. Receptionist', department: 'Recepción', departmentEn: 'Front Desk', hireDate: '2024-10-01', status: 'onboarding', careerLevel: 1, careerPath: 'Recepcionista Jr. → Recepcionista → Supervisor', careerPathEn: 'Jr. Receptionist → Receptionist → Supervisor', knowledgeScore: 30, salesScore: 15, hospitalityScore: 65, overallScore: 36.7, totalUpselling: 200, avgNPS: 7.0, coursesCompleted: 1, coursesInProgress: 4, happinessIndex: 55, turnoverRisk: 65, lastActive: '2025-01-23', propertyId: 'prop3', propertyName: 'Gran Hotel CDMX' },
  { id: 'emp10', employeeId: 'MES-901', name: 'Sofía Vargas', position: 'Mesera Sr.', positionEn: 'Sr. Waitress', department: 'Alimentos y Bebidas', departmentEn: 'Food & Beverage', hireDate: '2022-07-15', status: 'active', careerLevel: 3, careerPath: 'Mesero Jr. → Mesero Sr. → Capitán → Gerente A&B', careerPathEn: 'Jr. Waiter → Sr. Waiter → Captain → F&B Manager', knowledgeScore: 82, salesScore: 90, hospitalityScore: 86, overallScore: 86, totalUpselling: 5200, avgNPS: 9.1, coursesCompleted: 9, coursesInProgress: 1, happinessIndex: 88, turnoverRisk: 15, lastActive: '2025-01-24', propertyId: 'prop6', propertyName: 'Restaurante Puerto Veracruz' },
]

export const mockServices: Service[] = [
  { id: 'srv1', name: 'Maridaje de Vino Premium', nameEn: 'Premium Wine Pairing', description: 'Sugerencia de maridaje de vino premium con cortes de carne', descriptionEn: 'Premium wine pairing suggestion with steak cuts', category: 'upselling', categoryEn: 'upselling', price: 450, upsellingTarget: 680, active: true, propertyId: 'prop1' },
  { id: 'srv2', name: 'Tour Isla Mujeres', nameEn: 'Isla Mujeres Tour', description: 'Tour privado a Isla Mujeres en lancha', descriptionEn: 'Private boat tour to Isla Mujeres', category: 'tour', categoryEn: 'tour', price: 1200, upsellingTarget: 1800, active: true, propertyId: 'prop1' },
  { id: 'srv3', name: 'Upgrade Suite Ocean View', nameEn: 'Ocean View Suite Upgrade', description: 'Mejora a suite con vista al mar', descriptionEn: 'Upgrade to ocean view suite', category: 'room_upgrade', categoryEn: 'room_upgrade', price: 890, upsellingTarget: 1200, active: true, propertyId: 'prop1' },
  { id: 'srv4', name: 'Cocktail de la Casa', nameEn: 'House Cocktail', description: 'Cocktel artesanal del chef', descriptionEn: 'Chef\'s artisan cocktail', category: 'upselling', categoryEn: 'upselling', price: 180, upsellingTarget: 280, active: true, propertyId: 'prop4' },
  { id: 'srv5', name: 'Experiencia Cenote', nameEn: 'Cenote Experience', description: 'Tour privado a cenote con guía', descriptionEn: 'Private cenote tour with guide', category: 'experience', categoryEn: 'experience', price: 950, upsellingTarget: 1400, active: true, propertyId: 'prop1' },
  { id: 'srv6', name: 'Postre del Chef', nameEn: 'Chef\'s Dessert', description: 'Postre especial del chef', descriptionEn: 'Chef\'s special dessert', category: 'menu', categoryEn: 'menu', price: 220, upsellingTarget: 320, active: true, propertyId: 'prop2' },
  { id: 'srv7', name: 'Tour Chichén Itzá VIP', nameEn: 'VIP Chichén Itzá Tour', description: 'Tour VIP a Chichén Itzá con acceso exclusivo', descriptionEn: 'VIP tour to Chichén Itzá with exclusive access', category: 'tour', categoryEn: 'tour', price: 2500, upsellingTarget: 3200, active: true, propertyId: 'prop1' },
  { id: 'srv8', name: 'Spa & Wellness Package', nameEn: 'Spa & Wellness Package', description: 'Paquete completo de spa y bienestar', descriptionEn: 'Complete spa and wellness package', category: 'experience', categoryEn: 'experience', price: 1500, upsellingTarget: 2200, active: true, propertyId: 'prop5' },
  { id: 'srv9', name: 'Corte Wagyu A5', nameEn: 'Wagyu A5 Cut', description: 'Corte premium de res Wagyu A5', descriptionEn: 'Premium Wagyu A5 cut', category: 'upselling', categoryEn: 'upselling', price: 850, upsellingTarget: 1200, active: true, propertyId: 'prop6' },
  { id: 'srv10', name: 'Sunset Sailing', nameEn: 'Sunset Sailing', description: 'Paseo en velero al atardecer', descriptionEn: 'Sunset sailing experience', category: 'experience', categoryEn: 'experience', price: 1800, upsellingTarget: 2500, active: true, propertyId: 'prop5' },
]

export const mockOrders: Order[] = [
  { id: 'ord1', employeeId: 'emp1', employeeName: 'Juan Pérez', serviceId: 'srv1', serviceName: 'Maridaje de Vino Premium', quantity: 2, unitPrice: 450, totalAmount: 900, isUpselling: true, customerSatisfaction: 10, orderDate: '2025-01-24T14:30:00' },
  { id: 'ord2', employeeId: 'emp1', employeeName: 'Juan Pérez', serviceId: 'srv2', serviceName: 'Tour Isla Mujeres', quantity: 1, unitPrice: 1200, totalAmount: 1200, isUpselling: true, customerSatisfaction: 9, orderDate: '2025-01-24T11:00:00' },
  { id: 'ord3', employeeId: 'emp3', employeeName: 'Carlos López', serviceId: 'srv3', serviceName: 'Upgrade Suite Ocean View', quantity: 1, unitPrice: 890, totalAmount: 890, isUpselling: true, customerSatisfaction: 10, orderDate: '2025-01-24T09:15:00' },
  { id: 'ord4', employeeId: 'emp6', employeeName: 'Laura Hernández', serviceId: 'srv6', serviceName: 'Postre del Chef', quantity: 4, unitPrice: 220, totalAmount: 880, isUpselling: true, customerSatisfaction: 9, orderDate: '2025-01-24T20:30:00' },
  { id: 'ord5', employeeId: 'emp7', employeeName: 'Miguel Torres', serviceId: 'srv4', serviceName: 'Cocktail de la Casa', quantity: 6, unitPrice: 180, totalAmount: 1080, isUpselling: true, customerSatisfaction: 8, orderDate: '2025-01-24T22:00:00' },
  { id: 'ord6', employeeId: 'emp2', employeeName: 'María García', serviceId: 'srv1', serviceName: 'Maridaje de Vino Premium', quantity: 1, unitPrice: 450, totalAmount: 450, isUpselling: true, customerSatisfaction: 7, orderDate: '2025-01-23T15:00:00' },
  { id: 'ord7', employeeId: 'emp10', employeeName: 'Sofía Vargas', serviceId: 'srv9', serviceName: 'Corte Wagyu A5', quantity: 1, unitPrice: 850, totalAmount: 850, isUpselling: true, customerSatisfaction: 10, orderDate: '2025-01-23T19:45:00' },
  { id: 'ord8', employeeId: 'emp3', employeeName: 'Carlos López', serviceId: 'srv5', serviceName: 'Experiencia Cenote', quantity: 2, unitPrice: 950, totalAmount: 1900, isUpselling: true, customerSatisfaction: 10, orderDate: '2025-01-23T10:00:00' },
  { id: 'ord9', employeeId: 'emp1', employeeName: 'Juan Pérez', serviceId: 'srv7', serviceName: 'Tour Chichén Itzá VIP', quantity: 1, unitPrice: 2500, totalAmount: 2500, isUpselling: true, customerSatisfaction: 9, orderDate: '2025-01-22T08:30:00' },
  { id: 'ord10', employeeId: 'emp4', employeeName: 'Ana Martínez', serviceId: 'srv3', serviceName: 'Upgrade Suite Ocean View', quantity: 1, unitPrice: 890, totalAmount: 890, isUpselling: true, customerSatisfaction: 8, orderDate: '2025-01-22T16:00:00' },
]

export const mockCourses: Course[] = [
  { id: 'crs1', title: 'Técnicas de Upselling Avanzado', titleEn: 'Advanced Upselling Techniques', description: 'Aprende las mejores técnicas para aumentar el ticket promedio sin ser invasivo', descriptionEn: 'Learn the best techniques to increase average ticket without being pushy', category: 'upselling', categoryEn: 'upselling', modality: 'virtual', duration: 45, difficulty: 'intermediate', difficultyEn: 'intermediate', points: 25, active: true, enrollmentCount: 28, completionRate: 72 },
  { id: 'crs2', title: 'Maridaje de Vinos Premium', titleEn: 'Premium Wine Pairing', description: 'Conoce cómo sugerir el maridaje perfecto de vinos con cortes de carne', descriptionEn: 'Learn how to suggest perfect wine pairings with steak cuts', category: 'product_knowledge', categoryEn: 'product_knowledge', modality: 'virtual', duration: 30, difficulty: 'advanced', difficultyEn: 'advanced', points: 30, active: true, enrollmentCount: 15, completionRate: 65 },
  { id: 'crs3', title: 'Venta Consultiva de Tours', titleEn: 'Consultive Tour Sales', description: 'Vende tours y experiencias locales de manera consultiva y personalizada', descriptionEn: 'Sell tours and local experiences in a consultive and personalized way', category: 'upselling', categoryEn: 'upselling', modality: 'virtual', duration: 35, difficulty: 'beginner', difficultyEn: 'beginner', points: 15, active: true, enrollmentCount: 42, completionRate: 85 },
  { id: 'crs4', title: 'Servicio al Cliente Premium', titleEn: 'Premium Customer Service', description: 'Estándares de hospitalidad de clase mundial para la industria turística', descriptionEn: 'World-class hospitality standards for the tourism industry', category: 'hospitality', categoryEn: 'hospitality', modality: 'in_person', duration: 480, difficulty: 'intermediate', difficultyEn: 'intermediate', points: 40, active: true, enrollmentCount: 22, completionRate: 90 },
  { id: 'crs5', title: 'Onboarding: Tu Primer Día', titleEn: 'Onboarding: Your First Day', description: 'Todo lo que necesitas saber para tu primer día en el equipo', descriptionEn: 'Everything you need to know for your first day on the team', category: 'onboarding', categoryEn: 'onboarding', modality: 'virtual', duration: 20, difficulty: 'beginner', difficultyEn: 'beginner', points: 10, active: true, enrollmentCount: 55, completionRate: 95 },
  { id: 'crs6', title: 'Liderazgo en Piso', titleEn: 'Floor Leadership', description: 'Desarrolla habilidades de liderazgo para dirigir equipos en el restaurante', descriptionEn: 'Develop leadership skills to manage restaurant teams', category: 'leadership', categoryEn: 'leadership', modality: 'in_person', duration: 600, difficulty: 'advanced', difficultyEn: 'advanced', points: 50, active: true, enrollmentCount: 8, completionRate: 75 },
  { id: 'crs7', title: 'Cocktails y Mixología', titleEn: 'Cocktails and Mixology', description: 'Conoce las técnicas básicas de mixología para sugerir las mejores bebidas', descriptionEn: 'Learn basic mixology techniques to suggest the best drinks', category: 'product_knowledge', categoryEn: 'product_knowledge', modality: 'virtual', duration: 40, difficulty: 'beginner', difficultyEn: 'beginner', points: 20, active: true, enrollmentCount: 18, completionRate: 78 },
  { id: 'crs8', title: 'Manejo de Quejas y Conflictos', titleEn: 'Complaint and Conflict Management', description: 'Aprende a manejar quejas de clientes de manera profesional', descriptionEn: 'Learn to handle customer complaints professionally', category: 'hospitality', categoryEn: 'hospitality', modality: 'virtual', duration: 25, difficulty: 'intermediate', difficultyEn: 'intermediate', points: 20, active: true, enrollmentCount: 35, completionRate: 82 },
]

export const mockEmployeeCourses: EmployeeCourse[] = [
  { id: 'ec1', employeeId: 'emp1', employeeName: 'Juan Pérez', courseId: 'crs1', courseTitle: 'Técnicas de Upselling Avanzado', courseTitleEn: 'Advanced Upselling Techniques', status: 'completed', progress: 100, score: 92, startedAt: '2024-12-01', completedAt: '2024-12-15' },
  { id: 'ec2', employeeId: 'emp1', employeeName: 'Juan Pérez', courseId: 'crs2', courseTitle: 'Maridaje de Vinos Premium', courseTitleEn: 'Premium Wine Pairing', status: 'completed', progress: 100, score: 88, startedAt: '2024-12-16', completedAt: '2025-01-02' },
  { id: 'ec3', employeeId: 'emp1', employeeName: 'Juan Pérez', courseId: 'crs3', courseTitle: 'Venta Consultiva de Tours', courseTitleEn: 'Consultive Tour Sales', status: 'in_progress', progress: 65, startedAt: '2025-01-10' },
  { id: 'ec4', employeeId: 'emp2', employeeName: 'María García', courseId: 'crs5', courseTitle: 'Onboarding: Tu Primer Día', courseTitleEn: 'Onboarding: Your First Day', status: 'completed', progress: 100, score: 75, startedAt: '2024-06-01', completedAt: '2024-06-01' },
  { id: 'ec5', employeeId: 'emp2', employeeName: 'María García', courseId: 'crs1', courseTitle: 'Técnicas de Upselling Avanzado', courseTitleEn: 'Advanced Upselling Techniques', status: 'in_progress', progress: 40, startedAt: '2025-01-05' },
  { id: 'ec6', employeeId: 'emp2', employeeName: 'María García', courseId: 'crs8', courseTitle: 'Manejo de Quejas y Conflictos', courseTitleEn: 'Complaint and Conflict Management', status: 'not_started', progress: 0 },
  { id: 'ec7', employeeId: 'emp3', employeeName: 'Carlos López', courseId: 'crs3', courseTitle: 'Venta Consultiva de Tours', courseTitleEn: 'Consultive Tour Sales', status: 'completed', progress: 100, score: 95, startedAt: '2024-08-01', completedAt: '2024-08-10' },
  { id: 'ec8', employeeId: 'emp3', employeeName: 'Carlos López', courseId: 'crs4', courseTitle: 'Servicio al Cliente Premium', courseTitleEn: 'Premium Customer Service', status: 'completed', progress: 100, score: 97, startedAt: '2024-09-01', completedAt: '2024-09-02' },
  { id: 'ec9', employeeId: 'emp6', employeeName: 'Laura Hernández', courseId: 'crs6', courseTitle: 'Liderazgo en Piso', courseTitleEn: 'Floor Leadership', status: 'in_progress', progress: 80, startedAt: '2025-01-01' },
  { id: 'ec10', employeeId: 'emp9', employeeName: 'Diego Flores', courseId: 'crs5', courseTitle: 'Onboarding: Tu Primer Día', courseTitleEn: 'Onboarding: Your First Day', status: 'completed', progress: 100, score: 80, startedAt: '2024-10-01', completedAt: '2024-10-01' },
  { id: 'ec11', employeeId: 'emp9', employeeName: 'Diego Flores', courseId: 'crs8', courseTitle: 'Manejo de Quejas y Conflictos', courseTitleEn: 'Complaint and Conflict Management', status: 'in_progress', progress: 30, startedAt: '2025-01-15' },
]

export const mockTurnoverAlerts: TurnoverAlert[] = [
  { id: 'ta1', employeeId: 'emp2', employeeName: 'María García', employeePosition: 'Mesera Jr.', type: 'stagnation', typeEn: 'Career Stagnation', severity: 'high', message: 'Estancamiento en el árbol de carrera. No ha completado cursos en 30 días y su puntuación de ventas es baja.', messageEn: 'Career stagnation. No courses completed in 30 days and sales score is low.', probability: 78, isRead: false, isResolved: false, createdAt: '2025-01-23T10:00:00' },
  { id: 'ta2', employeeId: 'emp2', employeeName: 'María García', employeePosition: 'Mesera Jr.', type: 'low_happiness', typeEn: 'Low Work Happiness', severity: 'critical', message: 'Índice de felicidad laboral en 68/100. Tres meses sin bono de permanencia. Riesgo alto de renuncia.', messageEn: 'Work happiness index at 68/100. Three months without retention bonus. High risk of resignation.', probability: 85, isRead: false, isResolved: false, createdAt: '2025-01-22T14:00:00' },
  { id: 'ta3', employeeId: 'emp5', employeeName: 'Roberto Sánchez', employeePosition: 'Camarista', type: 'inactivity', typeEn: 'App Inactivity', severity: 'medium', message: 'Sin actividad en la app por 5 días. Posible desmotivación.', messageEn: 'No app activity for 5 days. Possible demotivation.', probability: 45, isRead: true, isResolved: false, createdAt: '2025-01-21T09:00:00' },
  { id: 'ta4', employeeId: 'emp8', employeeName: 'Patricia Ruiz', employeePosition: 'Mesera', type: 'low_nps', typeEn: 'Consecutive Low NPS', severity: 'high', message: 'NPS promedio cayó a 7.2 en las últimas 2 semanas. Clientes reportan servicio apresurado.', messageEn: 'Average NPS dropped to 7.2 in the last 2 weeks. Customers report rushed service.', probability: 92, isRead: true, isResolved: false, createdAt: '2025-01-19T16:00:00' },
  { id: 'ta5', employeeId: 'emp4', employeeName: 'Ana Martínez', employeePosition: 'Recepcionista', type: 'contract_end', typeEn: 'Contract Ending Soon', severity: 'medium', message: 'Contrato termina en 45 días. Sin conversación de renovación iniciada.', messageEn: 'Contract ends in 45 days. No renewal conversation started.', probability: 35, isRead: false, isResolved: false, createdAt: '2025-01-20T11:00:00' },
  { id: 'ta6', employeeId: 'emp9', employeeName: 'Diego Flores', employeePosition: 'Recepcionista Jr.', type: 'stagnation', typeEn: 'Career Stagnation', severity: 'medium', message: 'En fase de onboarding extendida. Progreso lento en cursos asignados.', messageEn: 'Extended onboarding phase. Slow progress on assigned courses.', probability: 65, isRead: false, isResolved: false, createdAt: '2025-01-22T08:00:00' },
]

export const mockInstructors: Instructor[] = [
  { id: 'ins1', name: 'Ricardo Mendoza', specialty: 'Upselling y Ventas', location: 'Cancún', region: 'cancun', rating: 4.9, hourlyRate: 45, available: true },
  { id: 'ins2', name: 'Isabel Navarro', specialty: 'Hospitalidad Premium', location: 'CDMX', region: 'cdmx', rating: 4.8, hourlyRate: 50, available: true },
  { id: 'ins3', name: 'Fernando Delgado', specialty: 'Liderazgo y Gestión', location: 'Puebla', region: 'puebla', rating: 4.7, hourlyRate: 40, available: true },
  { id: 'ins4', name: 'Carmen Salinas', specialty: 'Servicio al Cliente', location: 'Los Cabos', region: 'los_cabos', rating: 4.9, hourlyRate: 55, available: false },
  { id: 'ins5', name: 'Alejandro Vega', specialty: 'Mixología y Bebidas', location: 'Playa del Carmen', region: 'playa_carmen', rating: 4.6, hourlyRate: 35, available: true },
]

export const mockBookings: Booking[] = [
  { id: 'bk1', courseId: 'crs4', courseTitle: 'Servicio al Cliente Premium', courseTitleEn: 'Premium Customer Service', instructorId: 'ins1', instructorName: 'Ricardo Mendoza', propertyId: 'prop1', propertyName: 'Hotel Playa Cancún', date: '2025-02-05T09:00:00', endTime: '2025-02-05T17:00:00', modality: 'in_person', status: 'confirmed', participants: 12, cost: 499 },
  { id: 'bk2', courseId: 'crs1', courseTitle: 'Técnicas de Upselling Avanzado', courseTitleEn: 'Advanced Upselling Techniques', propertyId: 'prop2', propertyName: 'Restaurante La Terraza', date: '2025-02-10T10:00:00', modality: 'virtual', status: 'pending', participants: 8 },
  { id: 'bk3', courseId: 'crs6', courseTitle: 'Liderazgo en Piso', courseTitleEn: 'Floor Leadership', instructorId: 'ins2', instructorName: 'Isabel Navarro', propertyId: 'prop3', propertyName: 'Gran Hotel CDMX', date: '2025-02-15T09:00:00', endTime: '2025-02-16T17:00:00', modality: 'in_person', status: 'pending', participants: 6, cost: 999 },
  { id: 'bk4', courseId: 'crs4', courseTitle: 'Servicio al Cliente Premium', courseTitleEn: 'Premium Customer Service', instructorId: 'ins3', instructorName: 'Fernando Delgado', propertyId: 'prop6', propertyName: 'Restaurante Puerto Veracruz', date: '2025-01-20T09:00:00', endTime: '2025-01-20T17:00:00', modality: 'in_person', status: 'completed', participants: 15, cost: 499 },
  { id: 'bk5', courseId: 'crs3', courseTitle: 'Venta Consultiva de Tours', courseTitleEn: 'Consultive Tour Sales', propertyId: 'prop1', propertyName: 'Hotel Playa Cancún', date: '2025-01-15T14:00:00', modality: 'virtual', status: 'completed', participants: 20 },
  { id: 'bk6', courseId: 'crs7', courseTitle: 'Cocktails y Mixología', courseTitleEn: 'Cocktails and Mixology', instructorId: 'ins5', instructorName: 'Alejandro Vega', propertyId: 'prop4', propertyName: 'Bar Mar Azul', date: '2025-01-10T11:00:00', endTime: '2025-01-10T15:00:00', modality: 'in_person', status: 'completed', participants: 8, cost: 350 },
  { id: 'bk7', courseId: 'crs1', courseTitle: 'Técnicas de Upselling Avanzado', courseTitleEn: 'Advanced Upselling Techniques', propertyId: 'prop5', propertyName: 'Resort Los Cabos', date: '2025-01-05T10:00:00', modality: 'virtual', status: 'cancelled', participants: 10 },
  { id: 'bk8', courseId: 'crs8', courseTitle: 'Manejo de Quejas y Conflictos', courseTitleEn: 'Complaint and Conflict Management', propertyId: 'prop3', propertyName: 'Gran Hotel CDMX', date: '2024-12-28T16:00:00', modality: 'virtual', status: 'cancelled', participants: 5 },
  { id: 'bk9', courseId: 'crs2', courseTitle: 'Maridaje de Vinos Premium', courseTitleEn: 'Premium Wine Pairing', instructorId: 'ins1', instructorName: 'Ricardo Mendoza', propertyId: 'prop1', propertyName: 'Hotel Playa Cancún', date: '2025-02-20T10:00:00', endTime: '2025-02-20T14:00:00', modality: 'in_person', status: 'confirmed', participants: 10, cost: 799 },
  { id: 'bk10', courseId: 'crs5', courseTitle: 'Onboarding: Tu Primer Día', courseTitleEn: 'Onboarding: Your First Day', propertyId: 'prop2', propertyName: 'Restaurante La Terraza', date: '2025-02-25T09:00:00', modality: 'virtual', status: 'pending', participants: 4 },
]

export const mockNotifications: Notification[] = [
  { id: 'ntf1', type: 'employee_offboard', title: '¡Empleado dado de baja!', titleEn: 'Employee offboarded!', message: 'Patricia Ruiz (MES-701) se ha dado de baja. Se requiere buscar reemplazo.', messageEn: 'Patricia Ruiz (MES-701) has been offboarded. Replacement needed.', isRead: false, propertyId: 'prop5', createdAt: '2025-01-20T10:00:00' },
  { id: 'ntf2', type: 'booking_request', title: 'Nueva solicitud de capacitación', titleEn: 'New training request', message: 'Gran Hotel CDMX solicita taller de Liderazgo en Piso para 6 participantes.', messageEn: 'Grand Hotel CDMX requests Floor Leadership workshop for 6 participants.', isRead: false, propertyId: 'prop3', createdAt: '2025-01-22T15:00:00' },
  { id: 'ntf3', type: 'alert', title: 'Alerta de rotación crítica', titleEn: 'Critical turnover alert', message: 'María García tiene 85% de probabilidad de abandonar en los próximos 30 días.', messageEn: 'María García has 85% probability of leaving in the next 30 days.', isRead: true, propertyId: 'prop1', createdAt: '2025-01-22T14:00:00' },
  { id: 'ntf4', type: 'course_completed', title: 'Curso completado', titleEn: 'Course completed', message: 'Carlos López completó "Venta Consultiva de Tours" con puntuación de 95.', messageEn: 'Carlos López completed "Consultive Tour Sales" with a score of 95.', isRead: true, createdAt: '2025-01-21T16:00:00' },
]

export const mockNPSResponses: NPSResponse[] = [
  { id: 'nps1', employeeId: 'emp1', employeeName: 'Juan Pérez', score: 10, comment: 'Excelente servicio, muy atento', promoter: true, source: 'QR', createdAt: '2025-01-24T15:30:00' },
  { id: 'nps2', employeeId: 'emp1', employeeName: 'Juan Pérez', score: 9, comment: 'Muy buena recomendación de vino', promoter: true, source: 'SMS', createdAt: '2025-01-23T20:00:00' },
  { id: 'nps3', employeeId: 'emp1', employeeName: 'Juan Pérez', score: 9, promoter: true, source: 'App', createdAt: '2025-01-22T14:00:00' },
  { id: 'nps4', employeeId: 'emp2', employeeName: 'María García', score: 7, comment: 'Todavía aprendiendo, pero amable', promoter: false, source: 'QR', createdAt: '2025-01-23T16:00:00' },
  { id: 'nps5', employeeId: 'emp2', employeeName: 'María García', score: 8, promoter: false, source: 'SMS', createdAt: '2025-01-20T19:30:00' },
  { id: 'nps6', employeeId: 'emp3', employeeName: 'Carlos López', score: 10, comment: 'Servicio excepcional, nos ayudó con todo', promoter: true, source: 'QR', createdAt: '2025-01-24T10:00:00' },
  { id: 'nps7', employeeId: 'emp3', employeeName: 'Carlos López', score: 10, comment: 'Siempre dispuesto a ayudar', promoter: true, source: 'App', createdAt: '2025-01-22T12:00:00' },
  { id: 'nps8', employeeId: 'emp3', employeeName: 'Carlos López', score: 9, promoter: true, source: 'SMS', createdAt: '2025-01-21T11:00:00' },
  { id: 'nps9', employeeId: 'emp6', employeeName: 'Laura Hernández', score: 10, comment: 'La mejor capitana, excelente liderazgo', promoter: true, source: 'QR', createdAt: '2025-01-24T21:00:00' },
  { id: 'nps10', employeeId: 'emp6', employeeName: 'Laura Hernández', score: 9, promoter: true, source: 'App', createdAt: '2025-01-23T20:30:00' },
  { id: 'nps11', employeeId: 'emp7', employeeName: 'Miguel Torres', score: 9, comment: 'Muy buen bartender, cócteles increíbles', promoter: true, source: 'QR', createdAt: '2025-01-24T23:00:00' },
  { id: 'nps12', employeeId: 'emp7', employeeName: 'Miguel Torres', score: 8, promoter: false, source: 'SMS', createdAt: '2025-01-22T22:30:00' },
  { id: 'nps13', employeeId: 'emp4', employeeName: 'Ana Martínez', score: 9, comment: 'Muy profesional en recepción', promoter: true, source: 'QR', createdAt: '2025-01-24T08:00:00' },
  { id: 'nps14', employeeId: 'emp4', employeeName: 'Ana Martínez', score: 8, promoter: false, source: 'App', createdAt: '2025-01-22T09:00:00' },
  { id: 'nps15', employeeId: 'emp5', employeeName: 'Roberto Sánchez', score: 8, comment: 'Habitación impecable', promoter: false, source: 'QR', createdAt: '2025-01-22T14:00:00' },
  { id: 'nps16', employeeId: 'emp10', employeeName: 'Sofía Vargas', score: 9, comment: 'Excelente recomendación de corte', promoter: true, source: 'SMS', createdAt: '2025-01-23T21:00:00' },
  { id: 'nps17', employeeId: 'emp10', employeeName: 'Sofía Vargas', score: 10, promoter: true, source: 'App', createdAt: '2025-01-21T20:00:00' },
  { id: 'nps18', employeeId: 'emp8', employeeName: 'Patricia Ruiz', score: 7, comment: 'Servicio un poco apresurado', promoter: false, source: 'QR', createdAt: '2025-01-19T18:00:00' },
  { id: 'nps19', employeeId: 'emp9', employeeName: 'Diego Flores', score: 7, promoter: false, source: 'QR', createdAt: '2025-01-22T10:00:00' },
  { id: 'nps20', employeeId: 'emp9', employeeName: 'Diego Flores', score: 6, comment: 'Le faltó información sobre el hotel', promoter: false, source: 'SMS', createdAt: '2025-01-20T09:00:00' },
]

// Chart data
export const monthlySalesData = [
  { month: 'Jul', sales: 8200, upselling: 3100, training: 3 },
  { month: 'Aug', sales: 9100, upselling: 3800, training: 5 },
  { month: 'Sep', sales: 10500, upselling: 4500, training: 7 },
  { month: 'Oct', sales: 11200, upselling: 5200, training: 8 },
  { month: 'Nov', sales: 12800, upselling: 6100, training: 10 },
  { month: 'Dec', sales: 14500, upselling: 7200, training: 12 },
  { month: 'Jan', sales: 15200, upselling: 8100, training: 14 },
]

export const npsTrendData = [
  { month: 'Jul', nps: 7.2, promoters: 45, passives: 35, detractors: 20 },
  { month: 'Aug', nps: 7.5, promoters: 48, passives: 34, detractors: 18 },
  { month: 'Sep', nps: 7.9, promoters: 52, passives: 32, detractors: 16 },
  { month: 'Oct', nps: 8.2, promoters: 58, passives: 28, detractors: 14 },
  { month: 'Nov', nps: 8.6, promoters: 62, passives: 26, detractors: 12 },
  { month: 'Dec', nps: 8.9, promoters: 67, passives: 22, detractors: 11 },
  { month: 'Jan', nps: 9.1, promoters: 72, passives: 20, detractors: 8 },
]

export const propertyComparisonData = [
  { name: 'Cancún', nameEn: 'Cancún', revenue: 15200, nps: 9.1, turnover: 12, trainingCompletion: 85 },
  { name: 'CDMX', nameEn: 'CDMX', revenue: 12800, nps: 8.4, turnover: 18, trainingCompletion: 72 },
  { name: 'Puebla', nameEn: 'Puebla', revenue: 8900, nps: 9.3, turnover: 8, trainingCompletion: 90 },
  { name: 'Playa del Carmen', nameEn: 'Playa del Carmen', revenue: 7200, nps: 8.1, turnover: 22, trainingCompletion: 65 },
  { name: 'Los Cabos', nameEn: 'Los Cabos', revenue: 11500, nps: 8.7, turnover: 15, trainingCompletion: 78 },
  { name: 'Veracruz', nameEn: 'Veracruz', revenue: 6500, nps: 8.9, turnover: 10, trainingCompletion: 82 },
]

export const trainingCorrelationData = [
  { coursesCompleted: 0, avgUpselling: 200, avgNPS: 7.0 },
  { coursesCompleted: 1, avgUpselling: 450, avgNPS: 7.3 },
  { coursesCompleted: 2, avgUpselling: 820, avgNPS: 7.8 },
  { coursesCompleted: 3, avgUpselling: 1400, avgNPS: 8.2 },
  { coursesCompleted: 5, avgUpselling: 2800, avgNPS: 8.7 },
  { coursesCompleted: 7, avgUpselling: 4100, avgNPS: 9.0 },
  { coursesCompleted: 10, avgUpselling: 5800, avgNPS: 9.3 },
  { coursesCompleted: 14, avgUpselling: 7200, avgNPS: 9.6 },
]

// Pricing plans
export const pricingPlans = [
  {
    id: 'plan1',
    name: 'Boutique Connect',
    nameEn: 'Boutique Connect',
    setupFee: 499,
    monthlyFee: 149,
    targetMarket: 'Restaurantes locales o Hoteles Boutique',
    targetMarketEn: 'Local Restaurants or Boutique Hotels',
    features: [
      'Taller presencial de arranque de 1 día',
      'Alta en la App con onboarding digital',
      'Upselling básico automatizado',
      'Dashboard de métricas',
      'Soporte por chat',
    ],
    featuresEn: [
      '1-day kickoff in-person workshop',
      'App onboarding digital setup',
      'Basic automated upselling',
      'Metrics dashboard',
      'Chat support',
    ],
    popular: false,
  },
  {
    id: 'plan2',
    name: 'Enterprise Growth',
    nameEn: 'Enterprise Growth',
    setupFee: 999,
    monthlyFee: 349,
    targetMarket: 'Hoteles medianos y Grupos de Restaurantes',
    targetMarketEn: 'Mid-size Hotels and Restaurant Groups',
    features: [
      'Taller de 2 días: Integración de equipos',
      'Técnicas de venta y mapeo de habilidades',
      'Integración de APIs con POS',
      'Dashboard ROI y Analíticas avanzadas',
      'Alerta temprana de rotación',
      'Soporte prioritario',
    ],
    featuresEn: [
      '2-day workshop: Team integration',
      'Sales techniques and skill mapping',
      'POS API integration',
      'Advanced ROI & Analytics dashboard',
      'Early turnover alerts',
      'Priority support',
    ],
    popular: true,
  },
  {
    id: 'plan3',
    name: 'Global Chains',
    nameEn: 'Global Chains',
    setupFee: 0,
    monthlyFee: 699,
    targetMarket: 'Cadenas hoteleras o Franquicias transnacionales',
    targetMarketEn: 'Hotel Chains or Transnational Franchises',
    features: [
      'Programa completo de capacitación escalonado',
      'Comparación multi-propiedad',
      'Instructores locales en cada región',
      'API personalizada',
      'NPS automático por QR/SMS',
      'Gamificación avanzada',
      'Soporte dedicado 24/7',
    ],
    featuresEn: [
      'Complete staggered training program',
      'Multi-property comparison',
      'Local instructors in each region',
      'Custom API',
      'Automatic NPS via QR/SMS',
      'Advanced gamification',
      'Dedicated 24/7 support',
    ],
    popular: false,
  },
]

// Career paths data for training module
export interface CareerPathLevel {
  title: string
  titleEn: string
  level: number
  requiredCourses: number
  minScore: number
  knowledgeTarget: number
  salesTarget: number
  hospitalityTarget: number
}

export interface CareerPath {
  id: string
  department: string
  departmentEn: string
  icon: string
  levels: CareerPathLevel[]
}

export const mockCareerPaths: CareerPath[] = [
  {
    id: 'cp1',
    department: 'Mesero',
    departmentEn: 'Waiter',
    icon: '🍽️',
    levels: [
      { title: 'Mesero Jr.', titleEn: 'Jr. Waiter', level: 1, requiredCourses: 2, minScore: 60, knowledgeTarget: 40, salesTarget: 30, hospitalityTarget: 50 },
      { title: 'Mesero Sr.', titleEn: 'Sr. Waiter', level: 2, requiredCourses: 5, minScore: 75, knowledgeTarget: 65, salesTarget: 60, hospitalityTarget: 70 },
      { title: 'Capitán', titleEn: 'Captain', level: 3, requiredCourses: 8, minScore: 85, knowledgeTarget: 80, salesTarget: 80, hospitalityTarget: 85 },
      { title: 'Gerente A&B', titleEn: 'F&B Manager', level: 4, requiredCourses: 12, minScore: 90, knowledgeTarget: 90, salesTarget: 85, hospitalityTarget: 90 },
    ],
  },
  {
    id: 'cp2',
    department: 'Bellboy',
    departmentEn: 'Bellboy',
    icon: '🧳',
    levels: [
      { title: 'Bellboy Jr.', titleEn: 'Jr. Bellboy', level: 1, requiredCourses: 2, minScore: 55, knowledgeTarget: 35, salesTarget: 20, hospitalityTarget: 55 },
      { title: 'Bellboy Sr.', titleEn: 'Sr. Bellboy', level: 2, requiredCourses: 5, minScore: 70, knowledgeTarget: 60, salesTarget: 45, hospitalityTarget: 75 },
      { title: 'Jefe de Conserjería', titleEn: 'Head Concierge', level: 3, requiredCourses: 8, minScore: 85, knowledgeTarget: 80, salesTarget: 60, hospitalityTarget: 90 },
    ],
  },
  {
    id: 'cp3',
    department: 'Recepcionista',
    departmentEn: 'Receptionist',
    icon: '🏨',
    levels: [
      { title: 'Recepcionista Jr.', titleEn: 'Jr. Receptionist', level: 1, requiredCourses: 2, minScore: 55, knowledgeTarget: 30, salesTarget: 20, hospitalityTarget: 50 },
      { title: 'Recepcionista', titleEn: 'Receptionist', level: 2, requiredCourses: 5, minScore: 70, knowledgeTarget: 60, salesTarget: 50, hospitalityTarget: 75 },
      { title: 'Supervisor Recepción', titleEn: 'Front Desk Supervisor', level: 3, requiredCourses: 9, minScore: 85, knowledgeTarget: 80, salesTarget: 65, hospitalityTarget: 88 },
    ],
  },
  {
    id: 'cp4',
    department: 'Camarista',
    departmentEn: 'Housekeeper',
    icon: '🛏️',
    levels: [
      { title: 'Camarista', titleEn: 'Housekeeper', level: 1, requiredCourses: 2, minScore: 55, knowledgeTarget: 40, salesTarget: 15, hospitalityTarget: 55 },
      { title: 'Supervisor de Piso', titleEn: 'Floor Supervisor', level: 2, requiredCourses: 5, minScore: 70, knowledgeTarget: 65, salesTarget: 30, hospitalityTarget: 75 },
      { title: 'Ama de Llaves', titleEn: 'Head Housekeeper', level: 3, requiredCourses: 8, minScore: 85, knowledgeTarget: 80, salesTarget: 40, hospitalityTarget: 90 },
    ],
  },
  {
    id: 'cp5',
    department: 'Bartender',
    departmentEn: 'Bartender',
    icon: '🍸',
    levels: [
      { title: 'Barback', titleEn: 'Barback', level: 1, requiredCourses: 2, minScore: 50, knowledgeTarget: 30, salesTarget: 25, hospitalityTarget: 45 },
      { title: 'Bartender', titleEn: 'Bartender', level: 2, requiredCourses: 5, minScore: 70, knowledgeTarget: 60, salesTarget: 60, hospitalityTarget: 65 },
      { title: 'Bar Manager', titleEn: 'Bar Manager', level: 3, requiredCourses: 9, minScore: 85, knowledgeTarget: 80, salesTarget: 80, hospitalityTarget: 80 },
    ],
  },
]

// Position to micro-course mapping for virtual training
export const positionMicroCourses: Record<string, { courseId: string; order: number }[]> = {
  mesero: [
    { courseId: 'crs5', order: 1 },
    { courseId: 'crs3', order: 2 },
    { courseId: 'crs1', order: 3 },
    { courseId: 'crs8', order: 4 },
    { courseId: 'crs2', order: 5 },
  ],
  bellboy: [
    { courseId: 'crs5', order: 1 },
    { courseId: 'crs4', order: 2 },
    { courseId: 'crs3', order: 3 },
    { courseId: 'crs8', order: 4 },
  ],
  recepcionista: [
    { courseId: 'crs5', order: 1 },
    { courseId: 'crs8', order: 2 },
    { courseId: 'crs1', order: 3 },
    { courseId: 'crs4', order: 4 },
  ],
  camarista: [
    { courseId: 'crs5', order: 1 },
    { courseId: 'crs4', order: 2 },
    { courseId: 'crs8', order: 3 },
  ],
  bartender: [
    { courseId: 'crs5', order: 1 },
    { courseId: 'crs7', order: 2 },
    { courseId: 'crs1', order: 3 },
    { courseId: 'crs2', order: 4 },
  ],
}

export const regions = [
  { id: 'cancun', name: 'Cancún', nameEn: 'Cancún' },
  { id: 'cdmx', name: 'CDMX', nameEn: 'Mexico City' },
  { id: 'puebla', name: 'Puebla', nameEn: 'Puebla' },
  { id: 'playa_carmen', name: 'Playa del Carmen', nameEn: 'Playa del Carmen' },
  { id: 'los_cabos', name: 'Los Cabos', nameEn: 'Los Cabos' },
  { id: 'baja_california', name: 'Baja California', nameEn: 'Baja California' },
  { id: 'veracruz', name: 'Veracruz', nameEn: 'Veracruz' },
  { id: 'acapulco', name: 'Acapulco', nameEn: 'Acapulco' },
  { id: 'mazatlan', name: 'Mazatlán', nameEn: 'Mazatlán' },
  { id: 'tlaxcala', name: 'Tlaxcala', nameEn: 'Tlaxcala' },
]
