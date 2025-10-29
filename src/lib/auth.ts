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

        if (!hasDatabase) {
          // Fallback về mock auth nếu chưa có database
          console.warn("DATABASE_URL not found, using fallback authentication")
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
            console.error("Database connection error:", error.message)
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
