import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/transparency - Get public transparency data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "50")

    // Fetch confirmed donations and all expenses (public data)
    const [donations, expenses] = await Promise.all([
      prisma.donation.findMany({
        where: {
          isPublic: true,
          isConfirmed: true, // Chỉ hiển thị donations đã được xác nhận
        },
        include: {
          activity: {
            select: {
              id: true,
              title: true,
              slug: true,
              location: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
      }),
      prisma.expense.findMany({
        include: {
          activity: {
            select: {
              id: true,
              title: true,
              slug: true,
              location: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
      }),
    ])

    // Calculate totals
    const totalDonations = donations.reduce((sum, d) => sum + (d.amount || 0), 0)
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
    const balance = totalDonations - totalExpenses

    // Split donations by campaign vs general
    const campaignDonations = donations.filter(d => d.activityId !== null)
    const generalDonations = donations.filter(d => d.activityId === null)
    
    const totalCampaignDonations = campaignDonations.reduce((sum, d) => sum + (d.amount || 0), 0)
    const totalGeneralDonations = generalDonations.reduce((sum, d) => sum + (d.amount || 0), 0)

    // Calculate monthly data (last 6 months)
    const now = new Date()
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      
      const monthDonations = donations
        .filter(d => {
          const date = new Date(d.createdAt)
          return date >= monthStart && date <= monthEnd
        })
        .reduce((sum, d) => sum + (d.amount || 0), 0)
      
      const monthExpenses = expenses
        .filter(e => {
          const date = new Date(e.createdAt)
          return date >= monthStart && date <= monthEnd
        })
        .reduce((sum, e) => sum + (e.amount || 0), 0)
      
      const monthNames = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"]
      const monthIndex = now.getMonth() - i
      const monthName = monthIndex < 0 
        ? monthNames[12 + monthIndex] 
        : monthNames[monthIndex]
      
      return {
        month: monthName,
        income: monthDonations,
        expense: monthExpenses,
        balance: monthDonations - monthExpenses,
      }
    }).reverse()

    // Calculate category distribution
    const categoryTotals: Record<string, number> = {}
    expenses.forEach(e => {
      const cat = e.category || "Khác"
      categoryTotals[cat] = (categoryTotals[cat] || 0) + (e.amount || 0)
    })

    const categoryData = Object.entries(categoryTotals).map(([name, value]) => {
      const colorMap: Record<string, string> = {
        "Giáo dục": "#F4A261",
        "Y tế": "#2A9D8F",
        "Cơ sở hạ tầng": "#E76F51",
        "Hỗ trợ khẩn cấp": "#E63946",
        "Vận chuyển": "#457B9D",
        "Thực phẩm": "#264653",
      }
      return {
        name,
        value: Math.round(value),
        color: colorMap[name] || "#8884d8",
      }
    })

    // Format donations for public display
    const publicDonations = donations.map((donation) => ({
      id: donation.id,
      name: donation.isAnonymous ? "Người ủng hộ ẩn danh" : donation.name || "Người ủng hộ",
      amount: donation.amount,
      message: donation.message,
      isAnonymous: donation.isAnonymous,
      createdAt: donation.createdAt,
      activity: donation.activity ? {
        id: donation.activity.id,
        title: donation.activity.title,
        slug: donation.activity.slug,
        location: donation.activity.location,
      } : null,
    }))

    // Format expenses for public display
    const publicExpenses = expenses.map((expense) => ({
      id: expense.id,
      title: expense.title,
      amount: expense.amount,
      description: expense.description,
      category: expense.category,
      createdAt: expense.createdAt,
      activity: expense.activity ? {
        id: expense.activity.id,
        title: expense.activity.title,
        slug: expense.activity.slug,
        location: expense.activity.location,
      } : null,
    }))

    // Combine all transactions
    const allTransactions = [
      ...publicDonations.map(d => ({
        id: d.id,
        type: "income" as const,
        date: d.createdAt,
        description: d.activity 
          ? `Quyên góp cho: ${d.activity.title}` 
          : "Quyên góp chung",
        amount: d.amount,
        detail: d,
      })),
      ...publicExpenses.map(e => ({
        id: e.id,
        type: "expense" as const,
        date: e.createdAt,
        description: e.title,
        amount: -e.amount,
        detail: e,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json({
      summary: {
        totalDonations,
        totalCampaignDonations,
        totalGeneralDonations,
        totalExpenses,
        balance,
        donationCount: donations.length,
        expenseCount: expenses.length,
      },
      monthlyData,
      categoryData,
      donations: publicDonations,
      expenses: publicExpenses,
      transactions: allTransactions.slice(0, 50), // Limit to 50 most recent
    })
  } catch (error: any) {
    console.error("Error fetching transparency data:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch transparency data" },
      { status: 500 }
    )
  }
}

