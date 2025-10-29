import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Bắt đầu seed database...')

  // Tạo admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mattroitrendb.org' },
    update: {},
    create: {
      email: 'admin@mattroitrendb.org',
      name: 'Administrator',
      password: hashedPassword,
      role: 'admin',
    },
  })

  console.log('✅ Admin user created:', admin.email)

  // Tạo site content mặc định
  const siteContents = [
    {
      key: 'site_title',
      value: 'Mặt Trời Trên Bản',
      type: 'text'
    },
    {
      key: 'site_description',
      value: 'Tổ chức thiện nguyện Mặt Trời Trên Bản - Chung tay hỗ trợ vùng cao, mang ánh sáng đến những nơi cần thiết',
      type: 'text'
    },
    {
      key: 'hero_title',
      value: 'Mặt Trời Trên Bản',
      type: 'text'
    },
    {
      key: 'hero_subtitle',
      value: 'Mang ánh sáng và hy vọng đến những vùng cao xa xôi, nơi cần sự hỗ trợ và quan tâm nhất',
      type: 'text'
    },
    {
      key: 'contact_email',
      value: 'info@mattroitrendb.org',
      type: 'text'
    },
    {
      key: 'contact_phone',
      value: '+84 123 456 789',
      type: 'text'
    },
    {
      key: 'contact_address',
      value: '123 Đường ABC, Phường XYZ, Quận 1, Thành phố Hồ Chí Minh',
      type: 'text'
    }
  ]

  for (const content of siteContents) {
    await prisma.siteContent.upsert({
      where: { key: content.key },
      update: content,
      create: content,
    })
  }

  console.log('✅ Site content created')

  // Tạo activities mẫu
  const activities = [
    {
      title: 'Xây dựng trường học tại bản X, tỉnh Y',
      slug: 'xay-dung-truong-hoc-ban-x-tinh-y',
      content: 'Hoàn thành xây dựng 2 phòng học mới với đầy đủ trang thiết bị, mang đến không gian học tập tốt hơn cho 50 em học sinh tại bản X, tỉnh Y. Dự án được thực hiện trong 3 tháng với tổng kinh phí 200 triệu đồng.',
      category: 'Giáo dục',
      isPublished: true,
    },
    {
      title: 'Khám bệnh miễn phí cho đồng bào vùng cao',
      slug: 'kham-benh-mien-phi-dong-bao-vung-cao',
      content: 'Tổ chức khám bệnh miễn phí cho 200 người dân tại 3 bản làng, cung cấp thuốc và tư vấn sức khỏe. Hoạt động có sự tham gia của 10 bác sĩ và 20 y tá tình nguyện.',
      category: 'Y tế',
      isPublished: true,
    },
    {
      title: 'Trao học bổng cho học sinh nghèo hiếu học',
      slug: 'trao-hoc-bong-hoc-sinh-ngheo-hieu-hoc',
      content: 'Trao 30 suất học bổng cho học sinh nghèo hiếu học, mỗi suất trị giá 2 triệu đồng. Chương trình nhằm khuyến khích các em tiếp tục học tập và phát triển tài năng.',
      category: 'Giáo dục',
      isPublished: true,
    }
  ]

  for (const activity of activities) {
    await prisma.activity.upsert({
      where: { slug: activity.slug },
      update: activity,
      create: activity,
    })
  }

  console.log('✅ Activities created')

  // Tạo donations mẫu
  const donations = [
    {
      name: 'Nguyễn Văn A',
      amount: 500000,
      message: 'Chúc các em học sinh có điều kiện học tập tốt hơn',
      isPublic: true,
      isAnonymous: false,
    },
    {
      name: 'Trần Thị B',
      amount: 1000000,
      message: 'Hy vọng tổ chức sẽ giúp đỡ được nhiều người hơn',
      isPublic: true,
      isAnonymous: false,
    },
    {
      name: null,
      amount: 200000,
      message: 'Chúc tổ chức phát triển mạnh mẽ',
      isPublic: true,
      isAnonymous: true,
    }
  ]

  for (const donation of donations) {
    await prisma.donation.create({
      data: donation,
    })
  }

  console.log('✅ Donations created')

  // Tạo expenses mẫu
  const expenses = [
    {
      title: 'Xây dựng trường học tại bản X',
      amount: 20000000,
      description: 'Chi phí xây dựng 2 phòng học mới',
      category: 'Giáo dục',
      event: 'Dự án giáo dục 2024',
    },
    {
      title: 'Khám bệnh miễn phí',
      amount: 5000000,
      description: 'Chi phí thuốc và dụng cụ y tế',
      category: 'Y tế',
      event: 'Hoạt động y tế 2024',
    },
    {
      title: 'Trao học bổng',
      amount: 60000000,
      description: '30 suất học bổng x 2 triệu đồng',
      category: 'Giáo dục',
      event: 'Chương trình học bổng 2024',
    }
  ]

  for (const expense of expenses) {
    await prisma.expense.create({
      data: expense,
    })
  }

  console.log('✅ Expenses created')

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
