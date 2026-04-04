"use client";

type ShareButtonProps = {
  title: string;
  text?: string;
};

export function ShareButton({ title, text }: ShareButtonProps) {
  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: text ?? `Mira este terreno en LoteX: ${title}`,
          url: window.location.href,
        });
      } catch {
        // El usuario canceló o la API no está disponible — silencioso
      }
    } else {
      // Fallback: copiar URL al portapapeles
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("¡Enlace copiado al portapapeles!");
      } catch {
        // Nada que hacer si falla también
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition hover:scale-105 hover:bg-white"
      aria-label="Compartir"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <path d="M16 6l-4-4-4 4" />
        <path d="M12 2v13" />
      </svg>
    </button>
  );
}
