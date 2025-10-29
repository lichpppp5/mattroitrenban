import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { ConditionalLayout } from "@/components/conditional-layout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Mặt Trời Trên Bản - Tổ chức thiện nguyện",
  description: "Tổ chức thiện nguyện Mặt Trời Trên Bản - Chung tay hỗ trợ vùng cao, mang ánh sáng đến những nơi cần thiết",
  keywords: "thiện nguyện, từ thiện, vùng cao, hỗ trợ, cộng đồng",
  authors: [{ name: "Mặt Trời Trên Bản" }],
  metadataBase: new URL("https://mattroitrenban.vn"),
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
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}
