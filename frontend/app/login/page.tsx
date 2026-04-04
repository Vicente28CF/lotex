import { Suspense } from "react";
import type { Metadata } from "next";

import { LoginForm } from "@/components/login-form";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Login | LoteX",
};

const accessPoints = [
  "Publicar tus terrenos",
  "Escribir al vendedor cuando te interese una propiedad",
  "Entrar a tu panel de forma segura",
];

const productPrinciples = [
  "Puedes ver terrenos sin crear cuenta",
  "Solo pedimos acceso cuando vas a hacer una accion importante",
  "Tu cuenta ayuda a proteger la informacion y los mensajes",
];

export default function LoginPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[36px] border border-white/80 bg-white/78 px-5 py-6 soft-ring sm:px-8 sm:py-8 lg:px-10 lg:py-10">
          <div className="pointer-events-none absolute -left-10 top-12 h-40 w-40 rounded-full bg-[#ffd9c9]/45 blur-3xl" />
          <div className="pointer-events-none absolute bottom-8 right-8 h-40 w-40 rounded-full bg-[#ffe8a8]/35 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
            <section className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-coral">
                  Acceso seguro
                </span>
                <span className="inline-flex rounded-full border border-line bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone">
                  Solo cuando hace falta
                </span>
              </div>

              <div className="max-w-4xl">
                <h1 className="text-[2.4rem] font-semibold leading-[1.02] tracking-[-0.045em] text-ink sm:text-[3.5rem] lg:text-[4.4rem]">
                  Inicia sesion para publicar tu terreno o pedir informes.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-stone sm:text-lg">
                  Puedes recorrer los terrenos libremente. Solo te pedimos iniciar sesion cuando
                  quieras enviar un mensaje o administrar tus publicaciones.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {accessPoints.map((item, index) => (
                  <div
                    key={item}
                    className="rounded-[28px] border border-white/80 bg-white/90 px-5 py-5 shadow-[0_18px_35px_rgba(15,23,42,0.06)] rise-in"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <p className="text-sm leading-7 text-ink">{item}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-[30px] border border-white/80 bg-[#1f1f1f] p-6 text-white shadow-[0_18px_44px_rgba(15,23,42,0.16)]">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">
                  Para que sirve tu cuenta
                </p>
                <div className="mt-5 space-y-3">
                  {productPrinciples.map((item) => (
                    <div
                      key={item}
                      className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-white/88"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <Suspense
              fallback={
                <div className="rounded-[32px] border border-white/80 bg-white/88 p-8 shadow-panel">
                  Cargando acceso...
                </div>
              }
            >
              <LoginForm />
            </Suspense>
          </div>
        </section>
      </div>
    </main>
  );
}
