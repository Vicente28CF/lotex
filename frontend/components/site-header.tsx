"use client";

import Link from "next/link";
import { useState } from "react"; // Import useState

import { useAuth } from "@/components/auth-provider";

export function SiteHeader() {
  const { isAuthenticated, logout, session } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-coral text-sm font-semibold text-white">
            LX
          </div>
          <div className="leading-tight">
            <p className="text-base font-semibold text-ink">LoteX</p>
            <p className="text-xs text-stone">Marketplace de terrenos</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 text-sm text-stone md:flex">
          <Link href="/">Explorar</Link>
          <Link href="/publicar">Publicar</Link>
          <Link href="/login">Entrar</Link>
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated && session ? (
            <>
              <span className="hidden rounded-full border border-line px-4 py-2 text-sm text-stone sm:inline-flex">
                {session.user.full_name}
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition hover:border-ink"
              >
                Cerrar sesion
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="hidden rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition hover:border-ink md:inline-flex" // Hide on mobile
            >
              Iniciar sesion
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-md text-ink hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-coral"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <span className="sr-only">Open main menu</span>
            {/* Hamburger icon */}
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
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
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-ink hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Explorar
            </Link>
            <Link
              href="/publicar"
              className="block px-3 py-2 rounded-md text-base font-medium text-ink hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Publicar
            </Link>
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-ink hover:bg-gray-50"
              >
                Cerrar sesion
              </button>
            ) : (
              <Link
                href="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-ink hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Iniciar sesion
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
