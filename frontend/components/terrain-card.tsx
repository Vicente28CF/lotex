import Link from "next/link";

import type { Terreno } from "@/lib/types";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/1200x800?text=Terreno+Disponible";

export function TerrainCard({ terreno }: { terreno: Terreno }) {
  return (
    <Link href={`/terrenos/${terreno.slug}`} className="group block">
      <article className="overflow-hidden rounded-[28px] border border-white/80 bg-white/92 shadow-[0_18px_40px_rgba(15,23,42,0.08)] transition duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_26px_54px_rgba(15,23,42,0.12)]">
        <div className="relative aspect-[1.05/1] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={terreno.image ?? PLACEHOLDER_IMAGE}
            alt={terreno.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1f1f1f]/28 via-transparent to-transparent" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
            <span className="rounded-full bg-white/92 px-3 py-1 text-xs font-semibold text-ink backdrop-blur">
              {terreno.municipio}
            </span>
            {terreno.isFeatured ? (
              <span className="rounded-full bg-[#1f1f1f]/88 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                Destacado
              </span>
            ) : null}
          </div>
        </div>

        <div className="space-y-3 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold leading-6 text-ink">{terreno.title}</h3>
              <p className="text-sm text-stone">
                {terreno.estado} · {terreno.areaLabel}
              </p>
            </div>
            <StatusPill status={terreno.status} />
          </div>

          <p className="line-clamp-2 text-sm leading-6 text-stone">{terreno.shortDescription}</p>

          <div className="flex items-center justify-between gap-4 border-t border-line/70 pt-4">
            <p className="text-lg font-semibold text-ink">{terreno.priceLabel}</p>
            <span className="text-sm font-medium text-ink transition group-hover:translate-x-1">
              Ver detalle
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function StatusPill({ status }: { status: Terreno["status"] }) {
  const styles =
    status === "active"
      ? "bg-emerald-50 text-emerald-700"
      : status === "paused"
        ? "bg-amber-50 text-amber-700"
        : "bg-stone-200 text-stone-700";

  const label = status === "active" ? "Activo" : status === "paused" ? "Pausado" : "Vendido";

  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles}`}>{label}</span>;
}
