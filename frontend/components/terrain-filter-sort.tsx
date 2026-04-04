"use client";

import { useEffect, useMemo, useState } from "react";

import type { Terreno } from "@/lib/types";

type TerrainFilterSortProps = {
  terrenos: Terreno[];
  onFilteredTerrenosChange: (filteredTerrenos: Terreno[]) => void;
};

export function TerrainFilterSort({
  terrenos,
  onFilteredTerrenosChange,
}: TerrainFilterSortProps) {
  const [municipioFilter, setMunicipioFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minArea, setMinArea] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  const availableMunicipios = useMemo(() => {
    const municipios = new Set(terrenos.map((terreno) => terreno.municipio));
    return Array.from(municipios).sort();
  }, [terrenos]);

  useEffect(() => {
    let filtered = [...terrenos];

    if (municipioFilter) {
      filtered = filtered.filter((terreno) => terreno.municipio === municipioFilter);
    }

    const parsedMinPrice = Number(minPrice);
    const parsedMaxPrice = Number(maxPrice);
    const parsedMinArea = Number(minArea);

    if (!Number.isNaN(parsedMinPrice) && minPrice !== "") {
      filtered = filtered.filter((terreno) => terreno.price >= parsedMinPrice);
    }

    if (!Number.isNaN(parsedMaxPrice) && maxPrice !== "") {
      filtered = filtered.filter((terreno) => terreno.price <= parsedMaxPrice);
    }

    if (!Number.isNaN(parsedMinArea) && minArea !== "") {
      filtered = filtered.filter((terreno) => terreno.areaM2 >= parsedMinArea);
    }

    filtered.sort((a, b) => {
      switch (sortOrder) {
        case "price_asc":
          return a.price - b.price;
        case "price_desc":
          return b.price - a.price;
        default:
          return 0;
      }
    });

    onFilteredTerrenosChange(filtered);
  }, [terrenos, municipioFilter, minPrice, maxPrice, minArea, sortOrder, onFilteredTerrenosChange]);

  return (
    <div className="mb-8 space-y-4">
      <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() => setMunicipioFilter("")}
          className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition ${
            municipioFilter === "" ? "bg-ink text-white" : "border border-line bg-white/88 text-stone"
          }`}
        >
          Todos
        </button>
        {availableMunicipios.map((municipio) => (
          <button
            key={municipio}
            type="button"
            onClick={() => setMunicipioFilter(municipio)}
            className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition ${
              municipioFilter === municipio
                ? "bg-ink text-white"
                : "border border-line bg-white/88 text-stone"
            }`}
          >
            {municipio}
          </button>
        ))}
      </div>

      <div className="rounded-[30px] border border-white/80 bg-white/82 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">Filtra los terrenos</p>
            <p className="text-sm text-stone">Ajusta precio, superficie y orden para encontrar mejores opciones.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setMunicipioFilter("");
              setMinPrice("");
              setMaxPrice("");
              setMinArea("");
              setSortOrder("newest");
            }}
            className="rounded-full border border-line bg-[#fcfaf7] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone transition hover:bg-white"
          >
            Limpiar filtros
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="rounded-2xl border border-line/80 bg-[#fcfaf7] px-4 py-3">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-stone">
              Precio desde
            </span>
            <input
              type="number"
              min="0"
              placeholder="500000"
              className="w-full bg-transparent text-sm font-medium text-ink outline-none"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
            />
          </label>

          <label className="rounded-2xl border border-line/80 bg-[#fcfaf7] px-4 py-3">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-stone">
              Precio hasta
            </span>
            <input
              type="number"
              min="0"
              placeholder="2000000"
              className="w-full bg-transparent text-sm font-medium text-ink outline-none"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
            />
          </label>

          <label className="rounded-2xl border border-line/80 bg-[#fcfaf7] px-4 py-3">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-stone">
              Superficie minima
            </span>
            <input
              type="number"
              min="0"
              placeholder="120"
              className="w-full bg-transparent text-sm font-medium text-ink outline-none"
              value={minArea}
              onChange={(event) => setMinArea(event.target.value)}
            />
          </label>

          <label className="rounded-2xl border border-line/80 bg-[#fcfaf7] px-4 py-3">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-stone">
              Orden
            </span>
            <select
              className="w-full bg-transparent text-sm font-medium text-ink outline-none"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
            >
              <option value="newest">Destacados y recientes</option>
              <option value="price_asc">Precio ascendente</option>
              <option value="price_desc">Precio descendente</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
