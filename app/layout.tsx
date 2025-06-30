import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

// Updated font configuration with fallbacks and preloading
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: true,
  fallback: ["system-ui", "arial"],
  variable: "--font-inter",
  preload: true
});

export const metadata: Metadata = {
  title: {
    default: "Bright Orion - MLM Platform",
    template: "%s | Bright Orion"
  },
  description: "Multi-Level Marketing Platform for Bright Orion - Join the network and start earning today!",
  keywords: ["MLM", "Multi-Level Marketing", "Bright Orion", "Network Marketing", "Earn Money"],
  authors: [{ name: "Bright Orion Team", url: "https://brightorion.com" }],
  openGraph: {
    title: "Bright Orion - MLM Platform",
    description: "Join the Bright Orion network and start earning today!",
    url: "https://brightorion.com",
    siteName: "Bright Orion",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
      }
    ],
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    }
  },
  twitter: {
    title: "Bright Orion - MLM Platform",
    card: "summary_large_image",
  },
  icons: {
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
  generator: "Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`font-sans ${inter.className}`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}