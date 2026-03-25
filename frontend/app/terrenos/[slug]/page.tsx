import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GuardedPanel } from "@/components/protected-action";
import { SiteHeader } from "@/components/site-header";
import { terrenosMock } from "@/lib/mock-terrenos";

export async function generateStaticParams() {
  return terrenosMock.map((terreno) => ({ slug: terreno.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const terreno = terrenosMock.find((item) => item.slug === params.slug);
  return {
    title: terreno ? `${terreno.title} | LoteX` : "Terreno | LoteX",
  };
}

export default function TerrenoDetailPage({ params }: { params: { slug: string } }) {
  const terreno = terrenosMock.find((item) => item.slug === params.slug);

  if (!terreno) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <SiteHeader />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[36px] border border-line bg-white shadow-panel">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="p-8 md:p-12">
              <span className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-coral">
                {terreno.municipio}
              </span>
              <h1 className="mt-6 text-4xl font-semibold leading-tight text-ink md:text-6xl">
                {terreno.title}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-stone">{terreno.description}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                {[`${terreno.areaLabel}`, `${terreno.estado}`, `$${terreno.priceLabel} MXN`].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-line bg-sand px-4 py-2 text-sm text-stone"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="min-h-[360px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={terreno.image} alt={terreno.title} className="h-full w-full object-cover" />
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_420px]">
          <article className="rounded-[32px] border border-line bg-white p-8 shadow-panel">
            <h2 className="text-2xl font-semibold text-ink">Detalle visible sin iniciar sesion</h2>
            <p className="mt-4 text-sm leading-7 text-stone">
              Esta es la experiencia correcta para el comprador: ver inventario, comparar precio y entender la oportunidad antes de comprometerse con un registro.
            </p>
          </article>

          <GuardedPanel
            title="Contactar al vendedor"
            description="Aqui si conviene pedir autenticacion. Ya hay una accion sensible y un intento real de conversion."
            ctaLabel="Iniciar sesion para contactar"
            loginHref={`/login?redirect=%2Fterrenos%2F${terreno.slug}`}
          >
            <div className="space-y-4">
              <span className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-coral">
                Sesion activa
              </span>
              <h2 className="text-2xl font-semibold text-ink">Aqui conectaremos el contacto mediado.</h2>
              <p className="text-sm leading-7 text-stone">
                El formulario real ira sobre tu API segura de contacto, sin exponer telefono o email del vendedor.
              </p>
            </div>
          </GuardedPanel>
        </section>
      </div>
    </main>
  );
}
