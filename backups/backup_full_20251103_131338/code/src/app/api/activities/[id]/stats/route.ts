import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/activities/[id]/stats - Get detailed stats for an activity
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "admin" && session.user.role !== "editor")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    
    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        donations: {
          where: { isConfirmed: true },
          orderBy: { createdAt: "desc" },
        },
        expenses: {
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      )
    }

    // Calculate donation stats
    const totalDonations = activity.donations.reduce((sum, d) => sum + d.amount, 0)
    const donationCount = activity.donations.length
    const uniqueDonors = new Set(
      activity.donations
        .filter(d => !d.isAnonymous && d.name)
        .map(d => d.name)
    ).size

    // Calculate expense stats
    const totalExpenses = activity.expenses.reduce((sum, e) => sum + e.amount, 0)
    const expenseCount = activity.expenses.length

    // Balance
    const balance = totalDonations - totalExpenses

    // Monthly breakdown (donations and expenses)
    const now = new Date()
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      
      const monthDonations = activity.donations.filter(d => {
        const date = new Date(d.createdAt)
        return date >= monthStart && date <= monthEnd
      })
      
      const monthExpenses = activity.expenses.filter(e => {
        const date = new Date(e.createdAt)
        return date >= monthStart && date <= monthEnd
      })
      
      const monthDonationTotal = monthDonations.reduce((sum, d) => sum + d.amount, 0)
      const monthExpenseTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0)
      
      const monthNames = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"]
      const monthIndex = now.getMonth() - i
      const monthName = monthIndex < 0 
        ? monthNames[12 + monthIndex] 
        : monthNames[monthIndex]
      
      return {
        month: monthName,
        donations: monthDonationTotal,
        expenses: monthExpenseTotal,
        balance: monthDonationTotal - monthExpenseTotal,
        donationCount: monthDonations.length,
        expenseCount: monthExpenses.length,
      }
    }).reverse()

    // Category breakdown for expenses
    const categoryTotals: Record<string, number> = {}
    activity.expenses.forEach(e => {
      const cat = e.category || "Khác"
      categoryTotals[cat] = (categoryTotals[cat] || 0) + e.amount
    })

    const categoryData = Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value: Math.round(value),
    }))

    return NextResponse.json({
      activity: {
        id: activity.id,
        title: activity.title,
        slug: activity.slug,
        location: activity.location,
        tripDate: activity.tripDate,
      },
      stats: {
        totalDonations,
        donationCount,
        uniqueDonors,
        averageDonation: donationCount > 0 ? totalDonations / donationCount : 0,
        totalExpenses,
        expenseCount,
        averageExpense: expenseCount > 0 ? totalExpenses / expenseCount : 0,
        balance,
        utilizationRate: totalDonations > 0 ? (totalExpenses / totalDonations) * 100 : 0,
      },
      monthlyData,
      categoryData,
      donations: activity.donations.map(d => ({
        id: d.id,
        name: d.isAnonymous ? null : d.name,
        amount: d.amount,
        message: d.message,
        createdAt: d.createdAt,
        isAnonymous: d.isAnonymous,
      })),
      expenses: activity.expenses.map(e => ({
        id: e.id,
        title: e.title,
        amount: e.amount,
        description: e.description,
        category: e.category,
        createdAt: e.createdAt,
      })),
    })
  } catch (error: any) {
    console.error("Error fetching activity stats:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch activity stats" },
      { status: 500 }
    )
  }
}

