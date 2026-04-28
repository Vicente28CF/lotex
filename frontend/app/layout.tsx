import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DM_Sans, Sora } from "next/font/google";
import Script from "next/script";

import { AuthProvider } from "@/components/auth-provider";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { SiteFooter } from "@/components/site-footer";

import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Terrify — Terrenos en Jalisco",
    template: "%s | Terrify",
  },
  description:
    "Explora, compara y publica terrenos en Zacoalco de Torres y toda la región de Jalisco. Sin fricción, sin registrarte.",
  keywords: ["terrenos", "Jalisco", "Zacoalco de Torres", "comprar terreno", "vender terreno", "Terrify"],
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "Terrify",
    title: "Terrify — Terrenos en Jalisco",
    description: "Explora terrenos disponibles en tu zona. Revisa fotos, precio y ubicación antes de decidir.",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" data-scroll-behavior="smooth" className={`${dmSans.variable} ${sora.variable}`}>
      <body>
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="beforeInteractive"
        />
        <AuthProvider>
          {children}
          <SiteFooter />
          <MobileBottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
