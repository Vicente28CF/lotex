import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DM_Sans, Sora } from "next/font/google";

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
    default: "LoteX — Terrenos en Jalisco",
    template: "%s | LoteX",
  },
  description:
    "Explora, compara y publica terrenos en Zacoalco de Torres y toda la región de Jalisco. Sin fricción, sin registrarte.",
  keywords: ["terrenos", "Jalisco", "Zacoalco de Torres", "comprar terreno", "vender terreno", "LoteX"],
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "LoteX",
    title: "LoteX — Terrenos en Jalisco",
    description: "Explora terrenos disponibles en tu zona. Revisa fotos, precio y ubicación antes de decidir.",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${dmSans.variable} ${sora.variable}`}>
      <body>
        <AuthProvider>
          {children}
          <SiteFooter />
          <MobileBottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
