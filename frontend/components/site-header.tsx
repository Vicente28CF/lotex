"use client";

import Link from "next/link";
import { useState } from "react";

import { useAuth } from "@/components/auth-provider";

export function SiteHeader() {
  const { isAuthenticated, isRefreshing, isRestoring, logout, session, sessionNotice } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const noticeStyles =
    sessionNotice?.type === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : sessionNotice?.type === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-sky-200 bg-sky-50 text-sky-700";

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-[#fffdf9]/75 backdrop-blur-2xl">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        {isRestoring || isRefreshing || sessionNotice ? (
          <div
            className={`mb-3 rounded-[18px] border px-4 py-2 text-sm ${
              isRestoring || isRefreshing ? "border-sky-200 bg-sky-50 text-sky-700" : noticeStyles
            }`}
          >
            {isRestoring
              ? "Restaurando sesion..."
              : isRefreshing
                ? "Renovando tu sesion..."
                : sessionNotice?.message}
          </div>
        ) : null}

        <div className="hidden items-center justify-between gap-6 lg:flex">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-coral text-sm font-semibold text-white shadow-[0_14px_24px_rgba(255,56,92,0.24)]">
                LX
              </div>
              <div className="leading-tight">
                <p className="text-base font-semibold text-coral">LoteX</p>
                <p className="text-xs text-stone">Compra y vende terrenos con claridad</p>
              </div>
            </Link>

            <nav className="flex items-center gap-2 rounded-full border border-line/80 bg-white/80 p-1 text-sm font-medium text-stone shadow-[0_12px_24px_rgba(15,23,42,0.05)]">
              <Link href="/" className="rounded-full px-4 py-2 transition hover:bg-sand hover:text-ink">
                Explorar
              </Link>
              <Link href="/publicar" className="rounded-full px-4 py-2 transition hover:bg-sand hover:text-ink">
                Publicar
              </Link>
            </nav>
          </div>

          <div className="glass-panel flex min-w-[360px] items-center justify-between rounded-full border border-white/80 px-3 py-2 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-4">
              <div className="rounded-full px-3 py-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone">
                  Ubicacion
                </p>
                <p className="text-sm font-medium text-ink">Jalisco</p>
              </div>
              <span className="h-8 w-px bg-line" />
              <div className="rounded-full px-3 py-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone">
                  Precio
                </p>
                <p className="text-sm font-medium text-ink">Flexible</p>
              </div>
            </div>
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full bg-coral text-white shadow-[0_10px_20px_rgba(255,56,92,0.28)]"
              aria-label="Buscar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && session ? (
              <>
                <span className="rounded-full border border-line bg-white/85 px-4 py-2 text-sm text-stone">
                  {session.user.fullName}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full border border-line bg-white/85 px-4 py-2 text-sm font-medium text-ink transition hover:border-ink"
                >
                  Cerrar sesion
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-full border border-line bg-white/85 px-4 py-2 text-sm font-medium text-ink transition hover:border-ink"
              >
                Iniciar sesion
              </Link>
            )}
          </div>
        </div>

        <div className="lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-coral text-sm font-semibold text-white shadow-[0_10px_24px_rgba(255,56,92,0.24)]">
                LX
              </div>
              <div className="leading-tight">
                <p className="text-base font-semibold text-coral">LoteX</p>
                <p className="text-xs text-stone">Terrenos en tu zona</p>
              </div>
            </Link>

            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-full border border-line bg-white text-ink"
              onClick={() => setIsMobileMenuOpen((current) => !current)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-5 w-5"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          <div className="glass-panel mt-4 rounded-[24px] border border-white/80 px-4 py-3 shadow-[0_12px_24px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-coral text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">Encuentra terrenos en Jalisco</p>
                <p className="truncate text-xs text-stone">
                  Revisa zona, precio y superficie en un solo lugar
                </p>
              </div>
            </div>
          </div>

          {isMobileMenuOpen ? (
            <div
              id="mobile-menu"
              className="glass-panel mt-4 rounded-[28px] border border-white/80 p-4 shadow-panel"
            >
              <div className="space-y-1 text-sm font-medium text-ink">
                <Link
                  href="/"
                  className="block rounded-2xl px-4 py-3 transition hover:bg-sand"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Explorar terrenos
                </Link>
                <Link
                  href="/publicar"
                  className="block rounded-2xl px-4 py-3 transition hover:bg-sand"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Publicar terreno
                </Link>
                <Link
                  href="/#listado"
                  className="block rounded-2xl px-4 py-3 transition hover:bg-sand"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Ver terrenos
                </Link>
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full rounded-2xl px-4 py-3 text-left transition hover:bg-sand"
                  >
                    Cerrar sesion
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="block rounded-2xl px-4 py-3 transition hover:bg-sand"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Iniciar sesion
                  </Link>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
