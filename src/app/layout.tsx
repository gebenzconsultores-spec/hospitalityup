import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HospitalityUP - Hybrid Training Command Center",
  description: "Comprehensive SaaS platform for hospitality training, employee management, upselling analytics, and turnover prevention. Built for hotels, restaurants, and bars.",
  keywords: ["HospitalityUP", "hospitality", "training", "hotel management", "restaurant management", "upselling", "employee retention", "SaaS"],
  authors: [{ name: "HospitalityUP" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "HospitalityUP - Hybrid Training Command Center",
    description: "Comprehensive hospitality training and management platform",
    type: "website",
    siteName: "HospitalityUP",
  },
  twitter: {
    card: "summary_large_image",
    title: "HospitalityUP - Hybrid Training Command Center",
    description: "Comprehensive hospitality training and management platform",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
