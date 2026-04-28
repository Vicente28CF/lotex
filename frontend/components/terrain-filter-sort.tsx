"use client";

import { useEffect, useState } from "react";

export type FilterState = {
  search: string;
  precioMax: string;
  areaMin: string;
  ordering: string;
  soloDestacados: boolean;
};

type Props = {
  filters: FilterState;
  count: number;
  isLoading: boolean;
  onFiltersChange: (filters: FilterState) => void;
};

export function TerrainFilterSort({ filters, count, isLoading, onFiltersChange }: Props) {
  const { search, precioMax, areaMin, ordering, soloDestacados } = filters;
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const update = (next: Partial<FilterState>) =>
    onFiltersChange({ ...filters, ...next });

  const clearAll = () => {
    setLocalSearch("");
    onFiltersChange({
      search: "",
      precioMax: "",
      areaMin: "",
      ordering: "",
      soloDestacados: false,
    });
  };

  const hasActiveFilters = Boolean(search || precioMax || areaMin || ordering || soloDestacados);

  function handleSearchSubmit() {
    update({ search: localSearch.trim() });
  }

  return (
    <div className="mb-8 space-y-4">
      <div className="flex items-stretch overflow-hidden rounded-[2rem] border border-line/60 bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] transition focus-within:border-coral/30 focus-within:shadow-[0_4px_24px_rgba(255,56,92,0.12)]">
        <div className="flex flex-1 items-center gap-3 px-5 py-3.5">
          <svg className="h-4 w-4 flex-shrink-0 text-stone" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
          <div className="flex-1">
            <p className="hidden text-[10px] font-bold uppercase tracking-widest text-stone/50 sm:block">
              Zona o municipio
            </p>
            <input
              type="text"
              placeholder="¿Dónde buscas tu terreno?"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
              className="w-full bg-transparent text-sm font-medium text-ink placeholder:text-stone/50 outline-none"
            />
          </div>
        </div>

        <div className="hidden w-px self-stretch bg-line/50 sm:block" />

        <div className="hidden items-center gap-2 px-5 sm:flex">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone/50">
              Precio max.
            </p>
            <div className="flex items-center gap-1">
              <span className="text-xs text-stone">$</span>
              <input
                type="number"
                placeholder="Sin limite"
                min="0"
                value={precioMax}
                onChange={(e) => update({ precioMax: e.target.value })}
                className="w-24 bg-transparent text-sm font-medium text-ink placeholder:text-stone/40 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="hidden w-px self-stretch bg-line/50 sm:block" />

        <div className="hidden items-center gap-2 px-5 sm:flex">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone/50">
              Superficie min.
            </p>
            <div className="flex items-center gap-1">
              <input
                type="number"
                placeholder="Cualquier m2"
                min="0"
                value={areaMin}
                onChange={(e) => update({ areaMin: e.target.value })}
                className="w-24 bg-transparent text-sm font-medium text-ink placeholder:text-stone/40 outline-none"
              />
              <span className="text-xs text-stone">m2</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSearchSubmit}
          className="m-1.5 flex items-center gap-2 rounded-full bg-coral px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:scale-[1.02] hover:bg-[#e92a5b] active:scale-95 sm:px-5"
          aria-label="Buscar terrenos"
        >
          {isLoading ? (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
          )}
          <span className="hidden sm:inline">Buscar</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-full border border-line/60 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => update({ soloDestacados: false })}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
              !soloDestacados ? "bg-ink text-white shadow-sm" : "text-stone hover:text-ink"
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => update({ soloDestacados: true })}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
              soloDestacados ? "bg-coral text-white shadow-sm" : "text-stone hover:text-ink"
            }`}
          >
            <span aria-hidden="true">⭐</span>
            Destacados
          </button>
        </div>

        <select
          value={ordering}
          onChange={(e) => update({ ordering: e.target.value })}
          className="cursor-pointer rounded-full border border-line/60 bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm outline-none transition hover:border-ink/30"
        >
          <option value="">Relevancia</option>
          <option value="precio_asc">Menor precio</option>
          <option value="precio_desc">Mayor precio</option>
          <option value="recientes">Mas recientes</option>
          <option value="area_asc">Menor superficie</option>
          <option value="area_desc">Mayor superficie</option>
        </select>

        <div className="flex gap-2 sm:hidden">
          <div className="flex items-center gap-1.5 rounded-full border border-line/60 bg-white px-4 py-2 shadow-sm focus-within:border-coral/30">
            <span className="text-xs font-semibold text-stone">$</span>
            <input
              type="number"
              placeholder="Precio max"
              value={precioMax}
              onChange={(e) => update({ precioMax: e.target.value })}
              className="w-20 bg-transparent text-sm text-ink outline-none placeholder:text-stone/40"
            />
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-line/60 bg-white px-4 py-2 shadow-sm focus-within:border-coral/30">
            <input
              type="number"
              placeholder="m2 min"
              value={areaMin}
              onChange={(e) => update({ areaMin: e.target.value })}
              className="w-16 bg-transparent text-sm text-ink outline-none placeholder:text-stone/40"
            />
            <span className="text-xs font-semibold text-stone">m2</span>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="rounded-full border border-line/60 bg-white px-4 py-2 text-sm font-medium text-stone shadow-sm transition hover:border-ink/30 hover:text-ink"
          >
            x Limpiar
          </button>
        )}

        <p className="ml-auto text-sm text-stone">
          {isLoading ? "Buscando..." : count === 0 ? "Sin resultados" : `${count} terreno${count !== 1 ? "s" : ""}`}
        </p>
      </div>
    </div>
  );
}
