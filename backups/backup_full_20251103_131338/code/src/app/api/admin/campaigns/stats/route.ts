import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/admin/campaigns/stats - Get stats for all campaigns
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "admin" && session.user.role !== "editor")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get all activities with their donations and expenses
    const activities = await prisma.activity.findMany({
      where: {
        isPublished: true,
      },
      include: {
        donations: {
          where: { isConfirmed: true },
        },
        expenses: true,
      },
      orderBy: {
        tripDate: "desc",
      },
    })

    // Calculate stats for each activity
    const campaignsStats = activities.map(activity => {
      const totalDonations = activity.donations.reduce((sum, d) => sum + d.amount, 0)
      const totalExpenses = activity.expenses.reduce((sum, e) => sum + e.amount, 0)
      const balance = totalDonations - totalExpenses
      const donationCount = activity.donations.length
      const expenseCount = activity.expenses.length
      const uniqueDonors = new Set(
        activity.donations
          .filter(d => !d.isAnonymous && d.name)
          .map(d => d.name)
      ).size

      return {
        activityId: activity.id,
        activityTitle: activity.title,
        activitySlug: activity.slug,
        location: activity.location,
        tripDate: activity.tripDate,
        status: activity.status,
        isUpcoming: activity.isUpcoming,
        stats: {
          totalDonations,
          totalExpenses,
          balance,
          donationCount,
          expenseCount,
          uniqueDonors,
          utilizationRate: totalDonations > 0 ? (totalExpenses / totalDonations) * 100 : 0,
        },
      }
    })

    // Overall summary
    const overallStats = {
      totalCampaigns: campaignsStats.length,
      totalDonations: campaignsStats.reduce((sum, c) => sum + c.stats.totalDonations, 0),
      totalExpenses: campaignsStats.reduce((sum, c) => sum + c.stats.totalExpenses, 0),
      totalBalance: campaignsStats.reduce((sum, c) => sum + c.stats.balance, 0),
      totalDonationCount: campaignsStats.reduce((sum, c) => sum + c.stats.donationCount, 0),
      totalExpenseCount: campaignsStats.reduce((sum, c) => sum + c.stats.expenseCount, 0),
      totalDonors: new Set(
        activities.flatMap(a => 
          a.donations
            .filter(d => !d.isAnonymous && d.name)
            .map(d => d.name)
        )
      ).size,
    }

    return NextResponse.json({
      overallStats,
      campaignsStats,
    })
  } catch (error: any) {
    console.error("Error fetching campaigns stats:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch campaigns stats" },
      { status: 500 }
    )
  }
}

