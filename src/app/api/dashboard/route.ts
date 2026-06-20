import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Total employees
    const totalEmployees = await db.employee.count()

    // Average NPS across all employees
    const npsAgg = await db.employee.aggregate({
      _avg: { avgNPS: true },
    })

    // Total upselling revenue
    const upsellingAgg = await db.employee.aggregate({
      _sum: { totalUpselling: true },
    })

    // Turnover rate: employees with turnoverRisk > 50 as percentage of total
    const highRiskEmployees = await db.employee.count({
      where: { turnoverRisk: { gt: 50 } },
    })
    const turnoverRate = totalEmployees > 0
      ? Math.round((highRiskEmployees / totalEmployees) * 100)
      : 0

    // Courses completed
    const coursesCompleted = await db.employeeCourse.count({
      where: { status: 'completed' },
    })

    // Cost savings: estimate based on prevented turnover
    // Average replacement cost ~$3000 MXN per high-risk employee mitigated
    const resolvedAlerts = await db.turnoverAlert.count({
      where: { isResolved: true },
    })
    const costSavings = resolvedAlerts * 3000

    // Additional metrics
    const activeEmployees = await db.employee.count({
      where: { status: 'active' },
    })

    const onboardingEmployees = await db.employee.count({
      where: { status: 'onboarding' },
    })

    const offboardingEmployees = await db.employee.count({
      where: { status: 'offboarding' },
    })

    const totalOrders = await db.order.count()

    const upsellingOrders = await db.order.count({
      where: { isUpselling: true },
    })

    const ordersAgg = await db.order.aggregate({
      _sum: { totalAmount: true },
      where: { isUpselling: true },
    })

    const totalCourses = await db.course.count({
      where: { active: true },
    })

    const avgHappiness = await db.employee.aggregate({
      _avg: { happinessIndex: true },
    })

    return NextResponse.json({
      totalEmployees,
      activeEmployees,
      onboardingEmployees,
      offboardingEmployees,
      avgNPS: Math.round((npsAgg._avg.avgNPS || 0) * 10) / 10,
      totalUpsellingRevenue: upsellingAgg._sum.totalUpselling || 0,
      turnoverRate,
      coursesCompleted,
      costSavings,
      totalOrders,
      upsellingOrders,
      upsellingRevenue: ordersAgg._sum.totalAmount || 0,
      totalCourses,
      avgHappiness: Math.round((avgHappiness._avg.happinessIndex || 0) * 10) / 10,
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    )
  }
}
