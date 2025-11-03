import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Hash password
  const hashedPassword = await bcrypt.hash("admin123", 10)

  // Tạo admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@mattroitrenban.vn" },
    update: {
      password: hashedPassword,
      role: "admin",
      isActive: true,
    },
    create: {
      email: "admin@mattroitrenban.vn",
      password: hashedPassword,
      name: "Quản trị viên",
      role: "admin",
      isActive: true,
    },
  })

  console.log("✅ Created admin user:", admin.email)

  // Tạo editor user
  const editorPassword = await bcrypt.hash("editor123", 10)
  const editor = await prisma.user.upsert({
    where: { email: "editor@mattroitrenban.vn" },
    update: {
      password: editorPassword,
      role: "editor",
      isActive: true,
    },
    create: {
      email: "editor@mattroitrenban.vn",
      password: editorPassword,
      name: "Biên tập viên",
      role: "editor",
      isActive: true,
    },
  })

  console.log("✅ Created editor user:", editor.email)

  // Tạo viewer user
  const viewerPassword = await bcrypt.hash("viewer123", 10)
  const viewer = await prisma.user.upsert({
    where: { email: "viewer@mattroitrenban.vn" },
    update: {
      password: viewerPassword,
      role: "viewer",
      isActive: true,
    },
    create: {
      email: "viewer@mattroitrenban.vn",
      password: viewerPassword,
      name: "Người xem",
      role: "viewer",
      isActive: true,
    },
  })

  console.log("✅ Created viewer user:", viewer.email)

  // Tạo user cho demo (admin@mattroitrendb.org)
  const demoPassword = await bcrypt.hash("admin123", 10)
  const demo = await prisma.user.upsert({
    where: { email: "admin@mattroitrendb.org" },
    update: {
      password: demoPassword,
      role: "admin",
      isActive: true,
    },
    create: {
      email: "admin@mattroitrendb.org",
      password: demoPassword,
      name: "Administrator",
      role: "admin",
      isActive: true,
    },
  })

  console.log("✅ Created demo admin user:", demo.email)

  console.log("\n🎉 Seeding completed!")
  console.log("\n📝 User accounts created:")
  console.log("  Admin:   admin@mattroitrenban.vn / admin123")
  console.log("  Editor:  editor@mattroitrenban.vn / editor123")
  console.log("  Viewer:  viewer@mattroitrenban.vn / viewer123")
  console.log("  Demo:    admin@mattroitrendb.org / admin123")
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })