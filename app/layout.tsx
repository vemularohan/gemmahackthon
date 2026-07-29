import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AccessibilityProvider } from "@/context/AccessibilityContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "సారథి AI (Saarathi AI) - Voice-First Telugu Assistant",
  description: "A production-ready digital assistant designed for Telugu-speaking communities. Access agricultural help, healthcare guidance, government schemes, and translation services with voice.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Saarathi AI",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F172A",
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="te" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0F172A] text-slate-100 selection:bg-blue-600/30 selection:text-white">
        <AccessibilityProvider>
          {children}
        </AccessibilityProvider>
      </body>
    </html>
  );
}
