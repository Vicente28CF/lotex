import type { Metadata } from "next";
import Link from "next/link";

import { GuardedPanel } from "@/components/protected-action";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Publicar | LoteX",
};

export default function PublicarPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <GuardedPanel
          title="Publicar un terreno"
          description="Este flujo ya tiene impacto en el negocio y por eso si debe estar protegido."
          ctaLabel="Iniciar sesion para publicar"
          loginHref="/login?redirect=%2Fpublicar"
        >
          <div className="space-y-4">
            <span className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-coral">
              Sesion activa
            </span>
            <h1 className="text-4xl font-semibold text-ink">Tu panel de publicacion puede vivir aqui.</h1>
            <p className="max-w-2xl text-sm leading-7 text-stone">
              Dejamos resuelto el comportamiento correcto: publico para explorar, privado para operar. El siguiente paso es construir el formulario real de alta de terreno.
            </p>
            <Link
              href="/"
              className="inline-flex rounded-full border border-line px-5 py-3 text-sm font-semibold text-ink transition hover:border-ink"
            >
              Volver al home
            </Link>
          </div>
        </GuardedPanel>
      </div>
    </main>
  );
}
