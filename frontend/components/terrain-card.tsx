import Link from "next/link";

import { ProtectedAction } from "@/components/protected-action";
import type { Terreno } from "@/lib/types";

export function TerrainCard({ terreno }: { terreno: Terreno }) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-line bg-white shadow-panel transition hover:-translate-y-1">
      <div className="relative aspect-video"> {/* Changed from h-72 to aspect-video */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={terreno.image} alt={terreno.title} className="h-full w-full object-cover" />
        {terreno.isFeatured ? (
          <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink shadow">
            Destacado
          </span>
        ) : null}
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-stone">{terreno.municipio}</p>
            <h3 className="mt-1 text-xl font-semibold text-ink">{terreno.title}</h3>
          </div>
          <span className="text-sm font-medium text-stone">{terreno.areaLabel}</span>
        </div>

        <p className="text-sm leading-6 text-stone">{terreno.shortDescription}</p>

        <div className="flex items-center justify-between gap-4">
          <p className="text-lg font-semibold text-ink">${terreno.priceLabel} MXN</p>
          <div className="flex items-center gap-2">
            <Link
              href={`/terrenos/${terreno.slug}`}
              className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition hover:border-ink"
            >
              Ver detalle
            </Link>
            <ProtectedAction
              actionLabel="Contactar"
              authenticatedHref={`/terrenos/${terreno.slug}`}
              unauthenticatedHref={`/login?redirect=%2Fterrenos%2F${terreno.slug}`}
              className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-black"
            />
          </div>
        </div>
      </div>
    </article>
  );
}
