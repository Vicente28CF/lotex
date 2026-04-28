import type { Metadata } from "next";

import { GuardedPanel } from "@/components/protected-action";
import { SellerDashboard } from "@/components/seller-dashboard";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Panel Del Vendedor | Terrify",
};

export default function PublicarPage() {
  return (
    <main className="min-h-screen pb-24 md:pb-10">
      <SiteHeader />

      <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
        <div className="mt-6">
          <GuardedPanel
            title="Panel del vendedor"
            description="Administra tus terrenos, revisa mensajes y mantén tus anuncios actualizados."
            ctaLabel="Iniciar sesion para entrar al panel"
            loginHref="/login?redirect=%2Fpublicar"
          >
            <SellerDashboard />
          </GuardedPanel>
        </div>
      </div>
    </main>
  );
}