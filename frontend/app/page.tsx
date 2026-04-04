import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { ProtectedAction } from "@/components/protected-action";
import { SiteHeader } from "@/components/site-header";
import { TerrainBrowser } from "@/components/terrain-browser";
import { fetchTerrenos } from "@/lib/api";
import type { Terreno } from "@/lib/types";

const quickThemes = [
  "Inversion segura",
  "Residencial",
  "Esquina",
  "Comercial",
  "Uso mixto",
  "Listo para construir",
];

const trustPoints = [
  "Explora sin crear cuenta",
  "Revisa fotos, precio y ubicacion antes de decidir",
  "Contacta cuando de verdad te interesa",
];

export default function HomePage() {
  return (
    <main className="min-h-screen pb-24 md:pb-10">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-5 sm:px-6 lg:px-8">
        <Suspense fallback={<HomeSkeleton />}>
          <HomeContent />
        </Suspense>
      </div>
    </main>
  );
}

async function HomeContent() {
  let terrenos: Terreno[] = [];
  let totalTerrenos = 0;
  let hasNextPage = false;
  let errorMessage: string | null = null;

  try {
    const response = await fetchTerrenos();
    terrenos = response.results;
    totalTerrenos = response.count;
    hasNextPage = !!response.next;
  } catch {
    errorMessage = "No pudimos cargar los terrenos en este momento.";
  }

  const featured = terrenos.filter((terreno) => terreno.isFeatured).slice(0, 3);
  const municipios = Array.from(new Set(terrenos.map((terreno) => terreno.municipio))).slice(0, 5);
  const totalFeatured = terrenos.filter((terreno) => terreno.isFeatured).length;
  const averagePrice =
    terrenos.length > 0
      ? Math.round(terrenos.reduce((acc, terreno) => acc + terreno.price, 0) / terrenos.length)
      : 0;

  return (
    <>
      <section className="hero-grid rise-in relative overflow-hidden rounded-[36px] border border-white/70 bg-white/[0.68] px-5 py-6 soft-ring sm:px-8 sm:py-8 lg:px-10 lg:py-10">
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] bg-[radial-gradient(circle_at_top,rgba(255,56,92,0.18),transparent_55%)] lg:block" />
          <div className="pointer-events-none absolute -left-16 top-10 h-44 w-44 rounded-full bg-[#ffd9c9]/55 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-10 h-36 w-36 rounded-full bg-[#ffe8a8]/45 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-coral">
                  Terrenos en tu zona
                </span>
                <span className="inline-flex rounded-full border border-line/80 bg-[#fff8f4] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone">
                  Facil de revisar desde tu celular
                </span>
              </div>

              <div className="max-w-4xl">
                <h1 className="max-w-3xl text-[2.35rem] font-semibold leading-[1.02] tracking-[-0.04em] text-ink sm:text-[3.4rem] lg:text-[4.5rem]">
                  Encuentra terrenos de forma clara, rapida y sin complicarte.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-stone sm:text-lg">
                  En LoteX puedes ver terrenos disponibles, comparar opciones y pedir informes solo
                  cuando encuentres uno que si te interese.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1.15fr_1.15fr_0.95fr]">
                <InfoTile label="Zona principal" value="Zacoalco y Jalisco" detail="Opciones en zonas que la gente ya conoce y busca." />
                <InfoTile label="Consulta libre" value="Entra y compara" detail="Puedes revisar terrenos antes de iniciar sesion." />
                <Link
                  href="#listado"
                  className="group flex min-h-[110px] items-end justify-between rounded-[28px] bg-coral px-5 py-5 text-white shadow-[0_20px_40px_rgba(255,56,92,0.28)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#e92a5b]"
                >
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                      Empieza aqui
                    </p>
                    <p className="mt-2 text-lg font-semibold">Explorar terrenos</p>
                  </div>
                  <span className="text-xl transition group-hover:translate-x-1">→</span>
                </Link>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {quickThemes.map((theme, index) => (
                  <span
                    key={theme}
                    className="rounded-full border border-line/80 bg-white/90 px-4 py-2 text-sm font-medium text-stone rise-in"
                    style={{ animationDelay: `${index * 70}ms` }}
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="float-gentle rounded-[30px] border border-white/80 bg-[#1f1f1f] p-6 text-white shadow-[0_24px_55px_rgba(15,23,42,0.16)]">
                <p className="text-sm text-white/65">Terrenos disponibles</p>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <p className="text-5xl font-semibold tracking-[-0.05em]">{totalTerrenos}</p>
                  <p className="max-w-[12rem] text-right text-sm leading-6 text-white/70">
                    Terrenos que ya puedes revisar antes de registrarte.
                  </p>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <StatChip label="Terrenos destacados" value={totalFeatured} />
                  <StatChip
                    label="Precio promedio"
                    value={averagePrice > 0 ? new Intl.NumberFormat("es-MX", {
                      style: "currency",
                      currency: "MXN",
                      maximumFractionDigits: 0,
                    }).format(averagePrice) : "Por definir"}
                  />
                </div>
              </div>

              <div className="rounded-[30px] border border-line/80 bg-white/88 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-coral">
                      Como funciona
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold text-ink">Encuentra un terreno sin perder tiempo.</h2>
                  </div>
                  <div className="rounded-full border border-line bg-[#fcfaf7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-stone">
                    Asi de simple
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {trustPoints.map((point, index) => (
                    <div
                      key={point}
                      className="flow-step-card rise-in flex items-start gap-3 rounded-[22px] border border-line/80 bg-[#fcfaf7] px-4 py-4"
                      style={{ animationDelay: `${index * 140}ms` }}
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-sm font-semibold text-coral">
                        {index + 1}
                      </span>
                      <p className="text-sm leading-7 text-ink">{point}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <Link
                    href="#listado"
                    className="rounded-[22px] border border-line bg-white px-4 py-4 text-center text-sm font-medium text-ink transition hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(15,23,42,0.08)]"
                  >
                    Ver todos los terrenos
                  </Link>
                  <ProtectedAction
                    actionLabel="Quiero publicar mi terreno"
                    authenticatedHref="/publicar"
                    unauthenticatedHref="/login?redirect=%2Fpublicar"
                    className="rounded-[22px] bg-[#1f1f1f] px-4 py-4 text-center text-sm font-semibold text-white transition hover:-translate-y-0.5"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[32px] border border-line/80 bg-white/88 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-coral">Lo que mas buscan</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-ink">
              Zonas y tipos de terreno que hoy generan mas interes.
            </h2>
            <p className="mt-3 text-sm leading-7 text-stone">
              Esta vista te ayuda a detectar opciones mas rapido y enfocarte en lo que si buscas.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[32px] border border-line/80 bg-[#fff8f4] p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <p className="text-sm text-stone">Municipios disponibles</p>
              <div className="mt-5 flex flex-wrap gap-3">
                {(municipios.length ? municipios : ["Zapopan", "Tlaquepaque", "Tonala"]).map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/80 bg-white px-4 py-2 text-sm font-semibold text-ink"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-line/80 bg-white/88 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <p className="text-sm text-stone">Por que es facil usar LoteX</p>
              <div className="mt-4 space-y-3">
                <MicroFeature title="Navegacion clara" copy="Encuentra secciones importantes sin perderte." />
                <MicroFeature title="Terrenos faciles de comparar" copy="Mira fotos, precio y ubicacion de un vistazo." />
                <MicroFeature title="Filtros utiles" copy="Ajusta precio y superficie para acercarte a la opcion correcta." />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-coral">Destacados</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-ink md:text-4xl">
                Terrenos que vale la pena revisar primero.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-stone">
              Una seleccion para que empieces por las opciones mas llamativas del momento.
            </p>
          </div>

          {featured.length === 0 ? (
            <EmptyState
              message="Aun no hay terrenos destacados."
              description="Cuando haya terrenos destacados los veras en esta seccion."
            />
          ) : (
            <div className="grid gap-5 lg:grid-cols-3">
              {featured.map((terreno, index) => (
                <Link
                  key={terreno.id}
                  href={`/terrenos/${terreno.slug}`}
                  className="group rise-in overflow-hidden rounded-[30px] border border-white/70 bg-white/92 shadow-[0_18px_40px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_52px_rgba(15,23,42,0.12)]"
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={terreno.image ?? "/terreno-placeholder.svg"}
                      alt={terreno.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition duration-700 group-hover:scale-[1.05]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1f1f1f]/50 via-transparent to-transparent" />
                    <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
                      <span className="rounded-full bg-white/92 px-3 py-1 text-xs font-semibold text-ink">
                        {terreno.municipio}
                      </span>
                      <span className="rounded-full bg-[#1f1f1f]/88 px-3 py-1 text-xs font-semibold text-white">
                        Destacado
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-xl font-semibold text-ink">{terreno.title}</h3>
                      <span className="rounded-full bg-[#fff8f4] px-3 py-1 text-xs font-semibold text-coral">
                        Recomendado
                      </span>
                    </div>
                    <p className="line-clamp-2 text-sm leading-7 text-stone">{terreno.shortDescription}</p>
                    <div className="flex items-center justify-between gap-4 border-t border-line/70 pt-4">
                      <p className="text-lg font-semibold text-ink">{terreno.priceLabel}</p>
                      <span className="text-sm font-medium text-ink transition group-hover:translate-x-1">
                        Ver detalle
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section id="listado" className="mt-14">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-coral">
                Terrenos disponibles
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-ink md:text-4xl">
                Busca, compara y elige con mas claridad.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-stone">
              Filtra por zona, precio y superficie hasta encontrar un terreno que encaje contigo.
            </p>
          </div>

          {errorMessage ? (
            <EmptyState
              message="No pudimos cargar los terrenos."
              description="Intenta de nuevo en unos momentos."
            />
          ) : (
            <TerrainBrowser initialTerrenos={terrenos} initialHasNextPage={hasNextPage} />
          )}
        </section>
    </>
  );
}

function HomeSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Hero Skeleton */}
      <div className="hero-grid relative overflow-hidden rounded-[36px] border border-white/70 bg-white/[0.68] px-5 py-6 soft-ring sm:px-8 sm:py-8 lg:px-10 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-6">
            <div className="h-6 w-32 rounded-full bg-[#ece5dd]"></div>
            <div className="space-y-3">
              <div className="h-12 w-full max-w-xl rounded-2xl bg-[#ece5dd]"></div>
              <div className="h-12 w-3/4 max-w-lg rounded-2xl bg-[#ece5dd]"></div>
            </div>
            <div className="h-24 w-full rounded-2xl bg-[#ece5dd]"></div>
          </div>
          <div className="space-y-4">
            <div className="h-40 w-full rounded-[30px] bg-[#ece5dd]"></div>
            <div className="h-48 w-full rounded-[30px] bg-[#ece5dd]"></div>
          </div>
        </div>
      </div>
      {/* List Skeleton */}
      <div className="mt-14 space-y-6">
        <div className="h-8 w-64 rounded-xl bg-[#ece5dd]"></div>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[4/3] rounded-[30px] bg-[#ece5dd]"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoTile({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/80 bg-white/90 px-5 py-5 shadow-[0_18px_35px_rgba(15,23,42,0.06)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone">{label}</p>
      <p className="mt-3 text-lg font-semibold text-ink">{value}</p>
      <p className="mt-2 text-sm leading-6 text-stone">{detail}</p>
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">{label}</p>
      <p className="mt-2 text-base font-semibold text-white">{value}</p>
    </div>
  );
}

function MicroFeature({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="rounded-[22px] border border-line/80 bg-[#fcfaf7] px-4 py-4">
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="mt-1 text-sm leading-6 text-stone">{copy}</p>
    </div>
  );
}
