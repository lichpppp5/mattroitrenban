# 🌞 Mặt Trời Trên Bản - Website Tổ Chức Thiện Nguyện

Website phi lợi nhuận chuyên nghiệp cho tổ chức thiện nguyện "Mặt Trời Trên Bản" với các tính năng:

- 🏠 **Trang chủ**: Hero section, thống kê, giới thiệu tổ chức
- 👥 **Giới thiệu**: Câu chuyện, tầm nhìn, sứ mệnh, đội ngũ
- 📰 **Hoạt động**: Danh sách hoạt động thiện nguyện với tìm kiếm và lọc
- 💝 **Quyên góp**: Form quyên góp với nhiều phương thức thanh toán
- 💰 **Minh bạch**: Báo cáo tài chính với biểu đồ trực quan
- 📬 **Liên hệ**: Form liên hệ và thông tin tổ chức

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL
- **Authentication**: NextAuth.js với role-based access
- **Media**: Cloudinary cho upload và quản lý hình ảnh
- **Charts**: Recharts cho biểu đồ tài chính
- **Editor**: TipTap cho WYSIWYG editor

## 📦 Cài đặt

1. **Clone repository**
```bash
git clone <repository-url>
cd mat-troi-tren-ban
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Cấu hình môi trường**
```bash
cp env.example .env.local
```

Cập nhật các biến môi trường trong `.env.local`:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mattroitrendb"

# NextAuth
NEXTAUTH_SECRET="your_secret_key_here"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary
CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"

# Email
RESEND_API_KEY="resend_key_here"
EMAIL_FROM="noreply@mattroitrendb.org"

# App Configuration
NEXT_PUBLIC_APP_NAME="Mặt Trời Trên Bản"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. **Setup database**
```bash
# Tạo database migration
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

5. **Chạy development server**
```bash
npm run dev
```

Website sẽ chạy tại `http://localhost:3000`

## 🗄️ Database Schema

Project sử dụng Prisma với các models chính:

- **User**: Quản lý người dùng và phân quyền
- **Activity**: Quản lý hoạt động thiện nguyện
- **Donation**: Quản lý quyên góp
- **Expense**: Quản lý chi tiêu
- **SiteContent**: Quản lý nội dung website
- **Media**: Quản lý hình ảnh và file
- **ContactMessage**: Quản lý tin nhắn liên hệ

## 🎨 Design System

- **Màu chủ đạo**: Vàng nắng (#F4A261) + Xanh núi (#2A9D8F)
- **Font**: Inter + Poppins
- **Style**: Modern, clean, responsive
- **Theme**: Thiện nguyện, nhân văn, tối giản

## 📱 Responsive Design

Website được thiết kế responsive với:
- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- Touch-friendly interface
- Optimized images và performance

## 🔐 Authentication

Hệ thống authentication với NextAuth.js:
- Credentials provider
- Role-based access (admin, editor, viewer)
- Protected routes cho admin panel
- Session management

## 📊 Features

### Public Pages
- ✅ Trang chủ với hero section và thống kê
- ✅ Giới thiệu tổ chức
- ✅ Danh sách hoạt động với tìm kiếm
- ✅ Form quyên góp với validation
- ✅ Báo cáo tài chính với biểu đồ
- ✅ Form liên hệ

### Admin Panel (Coming Soon)
- 🔄 Dashboard tổng quan
- 🔄 Quản lý nội dung website
- 🔄 Quản lý hoạt động (CRUD)
- 🔄 Quản lý quyên góp và chi tiêu
- 🔄 Upload và quản lý media
- 🔄 Cấu hình website

## 🚀 Deployment

### Vercel (Recommended)
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### Manual Deployment
```bash
npm run build
npm start
```

## 📈 Performance

- ⚡ Next.js 15 với App Router
- 🎯 Server-side rendering (SSR)
- 📦 Code splitting tự động
- 🖼️ Image optimization
- 🗜️ Bundle size optimization

## 🔧 Development

### Scripts
```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint check
npm run type-check   # TypeScript check
```

### Code Structure
```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable components
│   ├── ui/             # shadcn/ui components
│   ├── navigation.tsx   # Main navigation
│   └── footer.tsx      # Footer component
├── lib/                # Utilities and configs
│   ├── prisma.ts       # Database client
│   ├── auth.ts         # NextAuth config
│   └── utils.ts        # Helper functions
└── types/              # TypeScript type definitions
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

Nếu bạn cần hỗ trợ, hãy liên hệ:
- Email: info@mattroitrenban.vn
- Phone: +84 123 456 789

---

**Mặt Trời Trên Bản** - Mang ánh sáng đến những vùng cao xa xôi 🌞
