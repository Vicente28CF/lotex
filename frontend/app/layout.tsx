import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AuthProvider } from "@/components/auth-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "LoteX",
  description: "Marketplace de terrenos con una experiencia publica limpia y moderna.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
