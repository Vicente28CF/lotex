import { Suspense } from "react";
import type { Metadata } from "next";

import { LoginForm } from "@/components/login-form";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Login | LoteX",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_520px] lg:px-8">
        <section className="rounded-[36px] border border-line bg-white p-8 shadow-panel md:p-12">
          <span className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-coral">
            Acceso bajo demanda
          </span>
          <h1 className="mt-6 text-5xl font-semibold leading-tight text-ink md:text-6xl">
            El login aparece cuando el usuario ya decidio actuar.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-stone">
            La parte publica debe sentirse libre y confiable. La autenticacion entra solo para publicar, guardar anuncios o enviar contacto al vendedor.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              "Exploracion sin cuenta",
              "Login por email",
              "Listo para JWT y acciones protegidas",
            ].map((item) => (
              <div key={item} className="rounded-3xl border border-line bg-sand px-5 py-6 text-sm leading-7 text-stone">
                {item}
              </div>
            ))}
          </div>
        </section>

        <Suspense fallback={<div className="rounded-[32px] border border-line bg-white p-8 shadow-panel">Cargando formulario...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
