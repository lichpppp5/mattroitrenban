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
            // Nếu chưa có password, fallback về mock auth cho demo
            if (credentials.email === "admin@mattroitrendb.org" && credentials.password === "admin123") {
              // Tạo hoặc cập nhật user với password đã hash
              const hashedPassword = await bcrypt.hash("admin123", 10)
              const updatedUser = await prisma.user.upsert({
                where: { email: credentials.email },
                update: { password: hashedPassword },
                create: {
                  email: credentials.email,
                  password: hashedPassword,
                  name: "Administrator",
                  role: "admin",
                  isActive: true,
                },
              })

              return {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name || "User",
                role: updatedUser.role,
              }
            }
            return null
          }

          // So sánh password với bcrypt
          const isValidPassword = await bcrypt.compare(credentials.password, user.password)

          if (!isValidPassword) {
            return null
          }

          // Cập nhật lastLogin
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
          })

          return {
            id: user.id,
            email: user.email,
            name: user.name || "User",
            role: user.role,
          }
        } catch (error) {
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
