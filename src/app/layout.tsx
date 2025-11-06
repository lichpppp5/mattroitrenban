import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "@/components/conditional-layout";
import Providers from "@/components/providers";
import { FaviconInjector } from "@/components/favicon-injector";
import { prisma } from "@/lib/prisma";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Get favicon URL from database (if configured)
async function getFaviconUrl(): Promise<string | undefined> {
  try {
    const content = await prisma.siteContent.findUnique({
      where: { key: "site.favicon" },
    });
    
    if (content && content.value) {
      const url = content.value.trim();
      if (url.startsWith("http") || url.startsWith("/")) {
        return url;
      }
    }
  } catch (error) {
    console.error("Error fetching favicon:", error);
  }
  
  // Default to /favicon.ico (Next.js will automatically serve from app/favicon.ico)
  return "/favicon.ico";
}

export async function generateMetadata(): Promise<Metadata> {
  const faviconUrl = await getFaviconUrl();
  
  // Normalize favicon URL - ensure absolute URL for local files
  let normalizedFaviconUrl = faviconUrl || "/favicon.ico"
  if (normalizedFaviconUrl.startsWith("/") && !normalizedFaviconUrl.startsWith("//")) {
    // For local files, use full URL with metadataBase
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://mattroitrenban.vn"
    normalizedFaviconUrl = `${baseUrl}${normalizedFaviconUrl}`
  }
  
  return {
    title: "Mặt Trời Trên Bản - Tổ chức thiện nguyện",
    description: "Tổ chức thiện nguyện Mặt Trời Trên Bản - Chung tay hỗ trợ vùng cao, mang ánh sáng đến những nơi cần thiết",
    keywords: "thiện nguyện, từ thiện, vùng cao, hỗ trợ, cộng đồng",
    authors: [{ name: "Mặt Trời Trên Bản" }],
    metadataBase: new URL("https://mattroitrenban.vn"),
    icons: {
      icon: [
        { url: normalizedFaviconUrl, sizes: "32x32", type: "image/x-icon" },
        { url: normalizedFaviconUrl, sizes: "16x16", type: "image/x-icon" },
      ],
      shortcut: normalizedFaviconUrl,
      apple: normalizedFaviconUrl,
    },
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: "Mặt Trời Trên Bản - Tổ chức thiện nguyện",
      description: "Tổ chức thiện nguyện Mặt Trời Trên Bản - Chung tay hỗ trợ vùng cao",
      url: "https://mattroitrenban.vn",
      siteName: "Mặt Trời Trên Bản",
      type: "website",
      locale: "vi_VN",
    },
    twitter: {
      card: "summary_large_image",
      title: "Mặt Trời Trên Bản - Tổ chức thiện nguyện",
      description: "Tổ chức thiện nguyện Mặt Trời Trên Bản - Chung tay hỗ trợ vùng cao",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${inter.variable} ${poppins.variable} font-sans antialiased`}
      >
        <FaviconInjector />
        <Providers>
          <ConditionalLayout>{children}</ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}
