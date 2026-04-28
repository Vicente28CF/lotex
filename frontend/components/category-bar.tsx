"use client";

import { useState } from "react";

const categories = [
  { id: "todos", emoji: "🗺️", label: "Todos" },
  { id: "destacados", emoji: "⭐", label: "Destacados" },
];

export function CategoryBar() {
  const [active, setActive] = useState("todos");

  function handleSelect(id: string) {
    setActive(id);
    const params = new URLSearchParams();
    if (id !== "todos") params.set("filter", id);
    window.history.replaceState({}, "", `/?${params}#listado`);
    window.location.reload();
  }

  return (
    <div className="w-full border-b border-line/40 bg-sand">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 overflow-x-auto py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelect(cat.id)}
              className={`flex shrink-0 flex-col items-center gap-1 rounded-xl px-5 py-2.5 text-xs font-semibold transition-all ${
                active === cat.id
                  ? "bg-ink text-white shadow-sm"
                  : "text-stone hover:bg-white hover:text-ink"
              }`}
            >
              <span className="text-lg leading-none">{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}