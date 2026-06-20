import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  mockProperties,
  mockEmployees,
  mockServices,
  mockOrders,
  mockCourses,
  mockEmployeeCourses,
  mockNPSResponses,
  mockTurnoverAlerts,
  mockInstructors,
  mockBookings,
  mockNotifications,
} from '@/lib/mock-data'

export async function GET() {
  try {
    // Delete existing data in reverse dependency order
    await db.notification.deleteMany()
    await db.booking.deleteMany()
    await db.turnoverAlert.deleteMany()
    await db.nPSResponse.deleteMany()
    await db.employeeCourse.deleteMany()
    await db.order.deleteMany()
    await db.course.deleteMany()
    await db.service.deleteMany()
    await db.instructor.deleteMany()
    await db.employee.deleteMany()
    await db.property.deleteMany()

    // Create Properties
    const properties = await Promise.all(
      mockProperties.map((p) =>
        db.property.create({
          data: {
            id: p.id,
            name: p.name,
            nameEn: p.nameEn,
            type: p.type,
            location: p.location,
            region: p.region,
            plan: p.plan,
            active: p.active,
          },
        })
      )
    )

    // Create Employees
    const employees = await Promise.all(
      mockEmployees.map((e) =>
        db.employee.create({
          data: {
            id: e.id,
            employeeId: e.employeeId,
            name: e.name,
            position: e.position,
            positionEn: e.positionEn,
            department: e.department,
            departmentEn: e.departmentEn,
            photo: e.photo,
            hireDate: new Date(e.hireDate),
            status: e.status,
            careerLevel: e.careerLevel,
            careerPath: e.careerPath,
            careerPathEn: e.careerPathEn,
            knowledgeScore: e.knowledgeScore,
            salesScore: e.salesScore,
            hospitalityScore: e.hospitalityScore,
            overallScore: e.overallScore,
            totalUpselling: e.totalUpselling,
            avgNPS: e.avgNPS,
            coursesCompleted: e.coursesCompleted,
            coursesInProgress: e.coursesInProgress,
            happinessIndex: e.happinessIndex,
            turnoverRisk: e.turnoverRisk,
            lastActive: e.lastActive ? new Date(e.lastActive) : null,
            offboardingDate: e.offboardingDate ? new Date(e.offboardingDate) : null,
            propertyId: e.propertyId,
          },
        })
      )
    )

    // Create Services
    const services = await Promise.all(
      mockServices.map((s) =>
        db.service.create({
          data: {
            id: s.id,
            name: s.name,
            nameEn: s.nameEn,
            description: s.description,
            descriptionEn: s.descriptionEn,
            category: s.category,
            categoryEn: s.categoryEn,
            price: s.price,
            upsellingTarget: s.upsellingTarget,
            image: s.image,
            active: s.active,
            propertyId: s.propertyId,
          },
        })
      )
    )

    // Create Orders
    const orders = await Promise.all(
      mockOrders.map((o) =>
        db.order.create({
          data: {
            id: o.id,
            employeeId: o.employeeId,
            serviceId: o.serviceId,
            quantity: o.quantity,
            unitPrice: o.unitPrice,
            totalAmount: o.totalAmount,
            isUpselling: o.isUpselling,
            customerSatisfaction: o.customerSatisfaction,
            orderDate: new Date(o.orderDate),
          },
        })
      )
    )

    // Create Courses
    const courses = await Promise.all(
      mockCourses.map((c) =>
        db.course.create({
          data: {
            id: c.id,
            title: c.title,
            titleEn: c.titleEn,
            description: c.description,
            descriptionEn: c.descriptionEn,
            category: c.category,
            categoryEn: c.categoryEn,
            modality: c.modality,
            duration: c.duration,
            difficulty: c.difficulty,
            difficultyEn: c.difficultyEn,
            points: c.points,
            active: c.active,
            propertyId: c.propertyId || null,
          },
        })
      )
    )

    // Create EmployeeCourses
    const employeeCourses = await Promise.all(
      mockEmployeeCourses.map((ec) =>
        db.employeeCourse.create({
          data: {
            id: ec.id,
            employeeId: ec.employeeId,
            courseId: ec.courseId,
            status: ec.status,
            progress: ec.progress,
            score: ec.score,
            startedAt: ec.startedAt ? new Date(ec.startedAt) : null,
            completedAt: ec.completedAt ? new Date(ec.completedAt) : null,
          },
        })
      )
    )

    // Create NPSResponses
    const npsResponses = await Promise.all(
      mockNPSResponses.map((nps) =>
        db.nPSResponse.create({
          data: {
            id: nps.id,
            employeeId: nps.employeeId,
            score: nps.score,
            comment: nps.comment,
            promoter: nps.promoter,
            source: nps.source,
            createdAt: new Date(nps.createdAt),
          },
        })
      )
    )

    // Create TurnoverAlerts
    const turnoverAlerts = await Promise.all(
      mockTurnoverAlerts.map((ta) =>
        db.turnoverAlert.create({
          data: {
            id: ta.id,
            employeeId: ta.employeeId,
            type: ta.type,
            typeEn: ta.typeEn,
            severity: ta.severity,
            message: ta.message,
            messageEn: ta.messageEn,
            probability: ta.probability,
            isRead: ta.isRead,
            isResolved: ta.isResolved,
            createdAt: new Date(ta.createdAt),
          },
        })
      )
    )

    // Create Instructors
    const instructors = await Promise.all(
      mockInstructors.map((i) =>
        db.instructor.create({
          data: {
            id: i.id,
            name: i.name,
            specialty: i.specialty,
            location: i.location,
            region: i.region,
            rating: i.rating,
            hourlyRate: i.hourlyRate,
            available: i.available,
          },
        })
      )
    )

    // Create Bookings
    const bookings = await Promise.all(
      mockBookings.map((b) =>
        db.booking.create({
          data: {
            id: b.id,
            courseId: b.courseId,
            instructorId: b.instructorId || null,
            propertyId: b.propertyId,
            date: new Date(b.date),
            endTime: b.endTime ? new Date(b.endTime) : null,
            modality: b.modality,
            status: b.status,
            participants: b.participants,
            notes: b.notes || null,
            cost: b.cost || null,
          },
        })
      )
    )

    // Create Notifications
    const notifications = await Promise.all(
      mockNotifications.map((n) =>
        db.notification.create({
          data: {
            id: n.id,
            type: n.type,
            title: n.title,
            titleEn: n.titleEn,
            message: n.message,
            messageEn: n.messageEn,
            isRead: n.isRead,
            propertyId: n.propertyId || null,
            createdAt: new Date(n.createdAt),
          },
        })
      )
    )

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      counts: {
        properties: properties.length,
        employees: employees.length,
        services: services.length,
        orders: orders.length,
        courses: courses.length,
        employeeCourses: employeeCourses.length,
        npsResponses: npsResponses.length,
        turnoverAlerts: turnoverAlerts.length,
        instructors: instructors.length,
        bookings: bookings.length,
        notifications: notifications.length,
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
