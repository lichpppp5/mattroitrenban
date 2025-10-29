import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') // donations, expenses, activities
  const format = searchParams.get('format') // csv, pdf
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  try {
    if (format === 'csv') {
      return await exportCSV(type, from, to)
    } else if (format === 'pdf') {
      return await exportPDF(type, from, to)
    } else {
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
    }
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}

async function exportCSV(type: string | null, from: string | null, to: string | null) {
  // Sample data based on type
  let data: any[] = []
  let filename = 'export.csv'
  
  if (type === 'donations') {
    data = [
      { id: 1, name: 'Nguyễn Văn A', amount: 500000, date: '2024-06-15', method: 'Momo' },
      { id: 2, name: 'Trần Thị B', amount: 1000000, date: '2024-06-14', method: 'Bank Transfer' },
      { id: 3, name: 'Anonymous', amount: 200000, date: '2024-06-13', method: 'Cash' },
    ]
    filename = 'donations.csv'
  } else if (type === 'expenses') {
    data = [
      { id: 1, title: 'Xây dựng trường học', amount: 20000000, category: 'Giáo dục', date: '2024-06-15' },
      { id: 2, title: 'Khám bệnh miễn phí', amount: 5000000, category: 'Y tế', date: '2024-06-14' },
      { id: 3, title: 'Trao học bổng', amount: 60000000, category: 'Giáo dục', date: '2024-06-13' },
    ]
    filename = 'expenses.csv'
  } else if (type === 'activities') {
    data = [
      { id: 1, title: 'Xây dựng trường học', category: 'Giáo dục', status: 'published', date: '2024-06-15' },
      { id: 2, title: 'Khám bệnh miễn phí', category: 'Y tế', status: 'published', date: '2024-06-14' },
      { id: 3, title: 'Trao học bổng', category: 'Giáo dục', status: 'draft', date: '2024-06-13' },
    ]
    filename = 'activities.csv'
  }

  // Convert to CSV
  const headers = Object.keys(data[0] || {})
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n')

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}

async function exportPDF(type: string | null, from: string | null, to: string | null) {
  // For PDF export, we would use a library like Puppeteer or PDFKit
  // This is a simplified version that returns a JSON response
  const reportData = {
    type,
    from,
    to,
    generatedAt: new Date().toISOString(),
    summary: {
      totalDonations: 500000000,
      totalExpenses: 400000000,
      balance: 100000000,
      totalActivities: 50,
    },
    data: type === 'donations' ? [
      { name: 'Nguyễn Văn A', amount: 500000, date: '2024-06-15' },
      { name: 'Trần Thị B', amount: 1000000, date: '2024-06-14' },
    ] : []
  }

  return NextResponse.json({
    message: 'PDF export would be generated here',
    data: reportData,
    note: 'In production, this would generate an actual PDF file'
  })
}
