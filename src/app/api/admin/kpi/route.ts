import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Fetch all donations (only confirmed) and expenses
    const [donations, expenses, activities] = await Promise.all([
      prisma.donation.findMany({
        where: { isConfirmed: true }, // Chỉ tính confirmed donations
        include: { activity: true },
      }),
      prisma.expense.findMany(),
      prisma.activity.findMany({ where: { isPublished: true } }),
    ])

    // Calculate totals - split by campaign vs general
    const campaignDonations = donations.filter(d => d.activityId !== null)
    const generalDonations = donations.filter(d => d.activityId === null)
    
    const totalDonations = donations.reduce((sum, d) => sum + (d.amount || 0), 0)
    const totalCampaignDonations = campaignDonations.reduce((sum, d) => sum + (d.amount || 0), 0)
    const totalGeneralDonations = generalDonations.reduce((sum, d) => sum + (d.amount || 0), 0)
    
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
    const balance = totalDonations - totalExpenses
    
    // Count unique donors (not anonymous)
    const uniqueDonors = new Set(
      donations.filter(d => !d.isAnonymous && d.name).map(d => d.name)
    ).size

    const totalActivities = activities.length
    
    // Stats by activity
    const activityStats = activities.map(activity => {
      const activityDonations = donations.filter(d => d.activityId === activity.id)
      const activityTotal = activityDonations.reduce((sum, d) => sum + (d.amount || 0), 0)
      const activityDonorCount = new Set(
        activityDonations.filter(d => !d.isAnonymous && d.name).map(d => d.name)
      ).size
      
      return {
        activityId: activity.id,
        activityTitle: activity.title,
        activitySlug: activity.slug,
        totalAmount: activityTotal,
        donationCount: activityDonations.length,
        donorCount: activityDonorCount,
      }
    }).filter(stat => stat.totalAmount > 0) // Chỉ hiển thị dự án có quyên góp

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
        income: Math.round(monthDonations / 1000000), // Convert to millions
        expense: Math.round(monthExpenses / 1000000),
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
      }
      return {
        name,
        value: Math.round(value / 1000000), // Convert to millions
        color: colorMap[name] || "#264653",
      }
    })

    // Get recent activity (last 10 donations and expenses)
    const recentDonations = donations
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(d => ({
        type: 'donation' as const,
        description: d.isAnonymous ? 'Quyên góp ẩn danh' : `Nhận quyên góp từ ${d.name || 'Người quyên góp'}`,
        amount: d.amount,
        timestamp: d.createdAt.toISOString(),
      }))

    const recentExpenses = expenses
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(e => ({
        type: 'expense' as const,
        description: e.title,
        amount: -e.amount,
        timestamp: e.createdAt.toISOString(),
      }))

    const recentActivity = [...recentDonations, ...recentExpenses]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)

    const kpiData = {
      totalDonations,
      totalCampaignDonations,
      totalGeneralDonations,
      totalExpenses,
      balance,
      uniqueDonors,
      totalActivities,
      activityStats,
      monthlyData,
      categoryData,
      recentActivity,
    }

    return NextResponse.json(kpiData)
  } catch (error) {
    console.error('KPI API error:', error)
    return NextResponse.json({ error: 'Failed to fetch KPI data' }, { status: 500 })
  }
}
