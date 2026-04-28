"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface HeroSearchProps {
  municipios: string[];
}

export function HeroSearch({ municipios }: HeroSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showSugg, setShowSugg] = useState(false);

  const suggestions = municipios.filter((m) =>
    m.toLowerCase().includes(query.toLowerCase())
  );

  function goToListado(value?: string) {
    const q = value ?? query;
    if (q.trim()) {
      const params = new URLSearchParams({ municipio: q.trim() });
      router.replace(`/?${params.toString()}#listado`, { scroll: false });
    } else {
      router.replace("/#listado", { scroll: false });
    }
    document.getElementById("listado")?.scrollIntoView({ behavior: "smooth" });
    setShowSugg(false);
  }

  return (
    <div className="relative">
      <div className="flex items-center rounded-full border border-line/60 bg-white px-3 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition focus-within:shadow-[0_4px_24px_rgba(255,56,92,0.15)] focus-within:border-coral/40 sm:py-4">
        <div className="pl-2 pr-3 text-stone">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>

        <input
          type="text"
          placeholder="Municipio, zona o colonia..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowSugg(true); }}
          onKeyDown={(e) => e.key === "Enter" && goToListado()}
          onFocus={() => setShowSugg(true)}
          onBlur={() => setTimeout(() => setShowSugg(false), 150)}
          className="flex-1 bg-transparent text-base font-medium text-ink placeholder:text-stone/50 outline-none"
        />

        <button
          type="button"
          onClick={() => goToListado()}
          className="ml-2 rounded-full bg-coral px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[#e92a5b] hover:scale-105 active:scale-95 sm:px-8 sm:py-3"
        >
          Buscar
        </button>
      </div>

      {showSugg && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-line/40 bg-white shadow-xl">
          {suggestions.map((m) => (
            <button
              key={m}
              type="button"
              onMouseDown={() => goToListado(m)}
              className="flex w-full items-center gap-3 px-5 py-3.5 text-left text-sm font-medium text-ink hover:bg-sand transition"
            >
              <svg className="h-4 w-4 flex-shrink-0 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              </svg>
              {m}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
