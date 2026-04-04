import type { Metadata } from "next";

import { GuardedPanel } from "@/components/protected-action";
import { SellerDashboard } from "@/components/seller-dashboard";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Panel Del Vendedor | LoteX",
};

const sellerHighlights = [
  "Publica y edita terrenos desde una sola vista",
  "Gestiona contactos y estados sin salir del panel",
  "Controla imagenes, portada y orden visual del anuncio",
];

export default function PublicarPage() {
  return (
    <main className="min-h-screen pb-24 md:pb-10">
      <SiteHeader />

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-5 sm:px-6 lg:px-8">
        <section className="hero-grid relative overflow-hidden rounded-[36px] border border-white/70 bg-white/[0.68] px-5 py-6 soft-ring sm:px-8 sm:py-8 lg:px-10 lg:py-10">
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] bg-[radial-gradient(circle_at_top,rgba(255,56,92,0.18),transparent_55%)] lg:block" />
          <div className="pointer-events-none absolute -left-16 top-10 h-44 w-44 rounded-full bg-[#ffd9c9]/55 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-10 h-36 w-36 rounded-full bg-[#ffe8a8]/45 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-coral">
                  Panel privado
                </span>
                <span className="inline-flex rounded-full border border-line/80 bg-[#fff8f4] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone">
                  Gestion de tus terrenos
                </span>
              </div>

              <h1 className="mt-5 text-[2.35rem] font-semibold leading-[1.03] tracking-[-0.045em] text-ink sm:text-[3.4rem]">
                Publica, actualiza y da seguimiento a tus terrenos desde un solo lugar.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-stone sm:text-lg">
                Desde aqui puedes subir tus terrenos, mantener tu informacion al dia, revisar
                mensajes y cuidar la presentacion de cada anuncio.
              </p>
            </div>

            <div className="rounded-[30px] border border-white/80 bg-[#1f1f1f] p-6 text-white shadow-[0_24px_55px_rgba(15,23,42,0.16)]">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">
                Lo que haces aqui
              </p>
              <div className="mt-5 space-y-3">
                {sellerHighlights.map((item) => (
                  <div
                    key={item}
                    className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-white/88"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="mt-12">
          <GuardedPanel
            title="Panel del vendedor"
            description="Desde este panel puedes administrar tus terrenos, revisar mensajes y mantener tus anuncios actualizados."
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
