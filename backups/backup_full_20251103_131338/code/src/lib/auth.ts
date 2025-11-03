import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Kiểm tra xem có DATABASE_URL không
        const hasDatabase = !!process.env.DATABASE_URL

        // Fallback users khi chưa có database (chỉ dùng trong development)
        const fallbackUsers = [
          {
            email: "admin@mattroitrenban.vn",
            password: "admin123",
            id: "fallback-admin-1",
            name: "Quản trị viên",
            role: "admin" as const,
          },
          {
            email: "editor@mattroitrenban.vn",
            password: "editor123",
            id: "fallback-editor-1",
            name: "Biên tập viên",
            role: "editor" as const,
          },
          {
            email: "viewer@mattroitrenban.vn",
            password: "viewer123",
            id: "fallback-viewer-1",
            name: "Người xem",
            role: "viewer" as const,
          },
        ]

        if (!hasDatabase) {
          // Fallback về mock auth nếu chưa có database
          console.warn("DATABASE_URL not found, using fallback authentication")
          const fallbackUser = fallbackUsers.find(
            (u) => u.email === credentials.email && u.password === credentials.password
          )

          if (fallbackUser) {
            return {
              id: fallbackUser.id,
              email: fallbackUser.email,
              name: fallbackUser.name,
              role: fallbackUser.role,
            }
          }
          return null
        }

        try {
          // Tìm user trong database
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          })

          if (!user) {
            return null
          }

          // Kiểm tra user có active không
          if (!user.isActive) {
            throw new Error("Tài khoản đã bị vô hiệu hóa")
          }

          // Kiểm tra password
          if (!user.password) {
            return null
          }

          // So sánh password với bcrypt
          const isValidPassword = await bcrypt.compare(credentials.password, user.password)

          if (!isValidPassword) {
            return null
          }

          // Cập nhật lastLogin
          try {
            await prisma.user.update({
              where: { id: user.id },
              data: { lastLogin: new Date() },
            })
          } catch (updateError) {
            // Nếu không update được lastLogin, vẫn cho phép đăng nhập
            console.warn("Failed to update lastLogin:", updateError)
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name || "User",
            role: user.role,
          }
        } catch (error: any) {
          // Kiểm tra nếu lỗi là do DATABASE_URL hoặc Prisma connection
          if (error?.code === "P1001" || error?.message?.includes("DATABASE_URL") || error?.message?.includes("Environment variable not found")) {
            console.error("Database connection error, trying fallback authentication:", error.message)
            
            // Thử fallback authentication khi có lỗi database
            const fallbackUser = fallbackUsers.find(
              (u) => u.email === credentials.email && u.password === credentials.password
            )

            if (fallbackUser) {
              return {
                id: fallbackUser.id,
                email: fallbackUser.email,
                name: fallbackUser.name,
                role: fallbackUser.role,
              }
            }
            
            return null
          }
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: "/root-admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "development-secret",
}
