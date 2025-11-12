import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Providers } from "./Providers";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StylingAssistant from "@/components/StylingAssistant/StylingAssistant";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Decharmix",
  description: "Mix your way, become slay",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Wrap everything in the single Providers component */}
        <Providers>
          <Toaster
            position="top-right" // Vị trí hiển thị
            toastOptions={{
              duration: 3000, // Thông báo tự tắt sau 3 giây
              style: {
                background: "#333",
                color: "#fff",
                borderRadius: "8px",
                padding: "12px 16px",
                fontSize: "1rem",
              },
              // Style riêng cho từng loại
              success: {
                iconTheme: {
                  primary: "#10b981", // Xanh lá
                  secondary: "#fff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444", // Đỏ
                  secondary: "#fff",
                },
              },
            }}
          />
          <Header />
          <main>{children}</main>
          <Footer />
          <StylingAssistant />
        </Providers>
      </body>
    </html>
  );
}
