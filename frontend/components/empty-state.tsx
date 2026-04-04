type EmptyStateProps = {
  message?: string;
  description?: string;
};

export function EmptyState({
  message = "No se encontraron resultados.",
  description = "Intenta ajustar tus filtros o buscar en otra area.",
}: EmptyStateProps) {
  return (
    <div className="col-span-full rounded-[32px] border border-dashed border-line/90 bg-white/72 px-6 py-12 text-center text-stone shadow-[0_16px_36px_rgba(15,23,42,0.05)]">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="mx-auto mb-4 h-12 w-12 text-stone/50"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25m-9-9h1.5"
        />
      </svg>
      <h3 className="mb-2 text-xl font-semibold tracking-[-0.03em] text-ink">{message}</h3>
      <p className="mx-auto max-w-xl text-base leading-7">{description}</p>
    </div>
  );
}
