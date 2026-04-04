"use client";

import { useEffect, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { TerrainCard } from "@/components/terrain-card";
import { TerrainFilterSort } from "@/components/terrain-filter-sort";
import { fetchTerrenos } from "@/lib/api";
import type { Terreno } from "@/lib/types";

export function TerrainBrowser({
  initialTerrenos,
  initialHasNextPage,
}: {
  initialTerrenos: Terreno[];
  initialHasNextPage: boolean;
}) {
  const [allTerrenos, setAllTerrenos] = useState(initialTerrenos);
  const [filteredTerrenos, setFilteredTerrenos] = useState(initialTerrenos);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Cuando cargamos más terrenos, los pasamos también al filtro
  useEffect(() => {
    setFilteredTerrenos(allTerrenos);
  }, [allTerrenos]);

  async function loadMore() {
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const response = await fetchTerrenos(nextPage);
      setAllTerrenos((prev) => [...prev, ...response.results]);
      setHasNextPage(!!response.next);
      setPage(nextPage);
    } catch {
      alert("No pudimos cargar más terrenos. Intenta de nuevo.");
    } finally {
      setIsLoadingMore(false);
    }
  }

  return (
    <>
      <TerrainFilterSort terrenos={allTerrenos} onFilteredTerrenosChange={setFilteredTerrenos} />

      <div className="mb-5 flex flex-col gap-3 rounded-[28px] border border-white/80 bg-white/82 px-5 py-4 shadow-[0_18px_40px_rgba(15,23,42,0.06)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-ink">{filteredTerrenos.length} terrenos visibles</p>
          <p className="text-sm text-stone">Explora libremente y contacta solo cuando encuentres una buena opcion.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-line/80 bg-[#fcfaf7] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-stone">
            Sin registro al inicio
          </span>
          <span className="rounded-full border border-line/80 bg-[#fff8f4] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-coral">
            Facil de usar en celular
          </span>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {filteredTerrenos.length === 0 ? (
          <EmptyState
            message="No se encontraron terrenos con estos filtros."
            description="Prueba con otro municipio o ajusta rangos de precio y area."
          />
        ) : (
          filteredTerrenos.map((terreno) => <TerrainCard key={terreno.id} terreno={terreno} />)
        )}
      </div>

      {hasNextPage && filteredTerrenos.length === allTerrenos.length && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={loadMore}
            disabled={isLoadingMore}
            className="flex min-w-[200px] items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink shadow-[0_8px_20px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_25px_rgba(15,23,42,0.12)] disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {isLoadingMore ? "Cargando..." : "Cargar más terrenos"}
          </button>
        </div>
      )}
    </>
  );
}
