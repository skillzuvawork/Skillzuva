import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthGuard from "@/components/AuthGuard";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "SkillZuva — Transform Knowledge Into Skills",
    template: "%s | SkillZuva",
  },
  description:
    "Learn industry-relevant business, finance, marketing, communication and management skills through structured online courses on SkillZuva.",
  keywords: ["online learning", "business courses", "marketing", "finance", "BBA", "MBA", "B.Com", "India"],
  authors: [{ name: "SkillZuva" }],
  openGraph: {
    type: "website",
    siteName: "SkillZuva",
    title: "SkillZuva — Transform Knowledge Into Skills",
    description:
      "India's premier online learning platform for business, finance, marketing, and communication skills.",
    images: [{ url: "/logo-removebg-preview.png", width: 400, height: 200, alt: "SkillZuva" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthGuard />
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
