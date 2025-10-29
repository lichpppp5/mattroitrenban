import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  try {
    // Sample KPI data
    const kpiData = {
      totalDonations: 500000000,
      totalExpenses: 400000000,
      balance: 100000000,
      uniqueDonors: 2500,
      totalActivities: 50,
      monthlyData: [
        { month: "T1", income: 50, expense: 30 },
        { month: "T2", income: 75, expense: 45 },
        { month: "T3", income: 60, expense: 40 },
        { month: "T4", income: 80, expense: 50 },
      ],
      categoryData: [
        { name: "Giáo dục", value: 200, color: "#F4A261" },
        { name: "Y tế", value: 150, color: "#2A9D8F" },
        { name: "Cơ sở hạ tầng", value: 100, color: "#E76F51" },
        { name: "Khác", value: 50, color: "#264653" },
      ],
      recentActivity: [
        {
          type: 'donation',
          description: 'Nhận quyên góp từ Nguyễn Văn A',
          amount: 500000,
          timestamp: new Date().toISOString(),
        },
        {
          type: 'expense',
          description: 'Chi phí xây dựng trường học',
          amount: -20000000,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
      ]
    }

    return NextResponse.json(kpiData)
  } catch (error) {
    console.error('KPI API error:', error)
    return NextResponse.json({ error: 'Failed to fetch KPI data' }, { status: 500 })
  }
}
