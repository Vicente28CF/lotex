"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { EmptyState } from "@/components/empty-state";
import { TerrainCard } from "@/components/terrain-card";
import { TerrainCardSkeleton } from "@/components/terrain-card-skeleton";
import { TerrainFilterSort, type FilterState } from "@/components/terrain-filter-sort";
import { fetchTerrenos, type TerrenoFilters } from "@/lib/api";
import type { Terreno } from "@/lib/types";

function buildApiFilters(filters: FilterState): TerrenoFilters {
  return {
    search: filters.search || undefined,
    precio_max: filters.precioMax ? Number(filters.precioMax) : undefined,
    min_area: filters.areaMin ? Number(filters.areaMin) : undefined,
    is_featured: filters.soloDestacados ? true : undefined,
    ordering: filters.ordering || undefined,
  };
}

function hasActiveFilters(filters: FilterState) {
  return Boolean(
    filters.search ||
      filters.precioMax ||
      filters.areaMin ||
      filters.ordering ||
      filters.soloDestacados,
  );
}

function mergeTerrenos(previous: Terreno[], incoming: Terreno[]) {
  const seen = new Set(previous.map((terreno) => terreno.id));
  const next = [...previous];

  for (const terreno of incoming) {
    if (!seen.has(terreno.id)) {
      seen.add(terreno.id);
      next.push(terreno);
    }
  }

  return next;
}

export function TerrainBrowser({
  initialTerrenos,
  initialHasNextPage,
  initialCount,
}: {
  initialTerrenos: Terreno[];
  initialHasNextPage: boolean;
  initialCount: number;
}) {
  const searchParams = useSearchParams();

  const [terrenos, setTerrenos] = useState(initialTerrenos);
  const [count, setCount] = useState(initialCount);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const hasAppliedInitialFiltersRef = useRef(false);
  const requestIdRef = useRef(0);
  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get("search") ?? searchParams.get("municipio") ?? "",
    precioMax: searchParams.get("precio_max") ?? "",
    areaMin: searchParams.get("area_min") ?? "",
    ordering: "",
    soloDestacados: searchParams.get("is_featured") === "true" || searchParams.get("destacados") === "true",
  });

  const applyFilters = useCallback(async (nextFilters: FilterState) => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsLoading(true);
    setPage(1);

    try {
      const response = await fetchTerrenos(1, buildApiFilters(nextFilters));
      if (requestId !== requestIdRef.current) {
        return;
      }
      setTerrenos(response.results);
      setCount(response.count);
      setHasNextPage(!!response.next);
    } catch {
      // Conservamos resultados previos si falla la consulta.
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!hasAppliedInitialFiltersRef.current && hasActiveFilters(filters)) {
      hasAppliedInitialFiltersRef.current = true;
      void applyFilters(filters);
    }
  }, [applyFilters, filters]);

  const handleFiltersChange = (nextFilters: FilterState) => {
    setFilters(nextFilters);
    void applyFilters(nextFilters);
  };

  async function loadMore() {
    setIsLoadingMore(true);

    try {
      const nextPage = page + 1;
      const response = await fetchTerrenos(nextPage, buildApiFilters(filters));
      setTerrenos((prev) => mergeTerrenos(prev, response.results));
      setCount(response.count);
      setHasNextPage(!!response.next);
      setPage(nextPage);
    } catch {
      alert("No pudimos cargar mas terrenos. Intenta de nuevo.");
    } finally {
      setIsLoadingMore(false);
    }
  }

  return (
    <>
      <TerrainFilterSort
        filters={filters}
        count={count}
        isLoading={isLoading}
        onFiltersChange={handleFiltersChange}
      />

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <TerrainCardSkeleton key={index} />
          ))}
        </div>
      ) : terrenos.length === 0 ? (
        <EmptyState
          message="Sin resultados."
          description="Ajusta los filtros o amplia la busqueda para ver mas terrenos."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {terrenos.map((terreno) => (
            <TerrainCard key={terreno.id} terreno={terreno} />
          ))}
        </div>
      )}

      {!isLoading && hasNextPage && (
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={isLoadingMore}
            className="rounded-full border-2 border-ink px-8 py-3 text-sm font-bold text-ink transition hover:bg-ink hover:text-white disabled:opacity-40"
          >
            {isLoadingMore ? "Cargando..." : "Mostrar mas"}
          </button>
        </div>
      )}
    </>
  );
}
