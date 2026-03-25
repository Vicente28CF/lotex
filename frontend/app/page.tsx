import Link from "next/link";

import { ProtectedAction } from "@/components/protected-action";
import { SiteHeader } from "@/components/site-header";
import { TerrainCard } from "@/components/terrain-card";
import { terrenosMock } from "@/lib/mock-terrenos";

const featured = terrenosMock.slice(0, 2);

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[36px] border border-line bg-white p-8 shadow-panel md:p-12">
            <span className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-coral">
              Guadalajara y zona metropolitana
            </span>
            <h1 className="mt-6 max-w-3xl text-4xl sm:text-5xl font-semibold leading-tight text-ink md:text-7xl"> {/* Adjusted for smaller mobile screens */}
              Explora terrenos sin friccion. Registra tu cuenta solo cuando importe.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-stone md:text-lg">
              Un marketplace publico para descubrir opciones, comparar ubicaciones y entender el mercado local.
              Publicar o contactar si requiere autenticacion; explorar, no.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#listado"
                className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-black"
              >
                Explorar terrenos
              </Link>
              <ProtectedAction
                actionLabel="Publicar terreno"
                authenticatedHref="/publicar"
                unauthenticatedHref="/login?redirect=%2Fpublicar"
                className="rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink transition hover:border-ink"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[32px] border border-line bg-[#fff8f6] p-7 shadow-panel">
              <p className="text-sm text-stone">Inventario curado localmente</p>
              <p className="mt-3 text-4xl font-semibold text-ink">+200</p>
              <p className="mt-2 text-sm leading-7 text-stone">
                El objetivo no es ruido. Es claridad para compradores y visibilidad limpia para vendedores.
              </p>
            </div>
            <div className="rounded-[32px] border border-line bg-white p-7 shadow-panel">
              <p className="text-sm text-stone">Flujo sugerido</p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-stone">
                <li>1. Buscar por municipio y rango.</li>
                <li>2. Ver detalle sin barreras.</li>
                <li>3. Iniciar sesion solo al publicar o contactar.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-10 flex flex-wrap gap-3">
          {["Zapopan", "Tlajomulco", "Tlaquepaque", "Tonala"].map((item) => (
            <span
              key={item}
              className="rounded-full border border-line bg-white px-5 py-3 text-sm text-stone shadow-sm"
            >
              {item}
            </span>
          ))}
        </section>

        <section className="mt-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-coral">Destacados</p>
              <h2 className="mt-3 text-3xl font-semibold text-ink md:text-4xl">
                Una portada limpia, aireada y util.
              </h2>
            </div>
            <Link href="/login" className="text-sm font-medium text-ink">
              Iniciar sesion
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {featured.map((terreno) => (
              <article
                key={terreno.slug}
                className="overflow-hidden rounded-[32px] border border-line bg-white shadow-panel"
              >
                <div className="aspect-video"> {/* Changed from h-72 to aspect-video */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={terreno.image} alt={terreno.title} className="h-full w-full object-cover" />
                </div>
                <div className="space-y-3 p-6">
                  <p className="text-sm text-stone">{terreno.municipio}</p>
                  <h3 className="text-2xl font-semibold text-ink">{terreno.title}</h3>
                  <p className="text-sm leading-7 text-stone">{terreno.shortDescription}</p>
                  <p className="text-lg font-semibold text-ink">${terreno.priceLabel} MXN</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="listado" className="mt-16">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-coral">Listado publico</p>
              <h2 className="mt-3 text-3xl font-semibold text-ink md:text-4xl">
                Explorar primero. Convertir despues.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-stone">
              Esta primera version usa datos mock para validar navegacion y experiencia visual. El siguiente paso es conectarla a la API real de terrenos.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {terrenosMock.map((terreno) => (
              <TerrainCard key={terreno.slug} terreno={terreno} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
