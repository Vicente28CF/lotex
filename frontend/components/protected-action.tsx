"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { useAuth } from "@/components/auth-provider";

type ProtectedActionProps = {
  actionLabel: string;
  authenticatedHref: string;
  unauthenticatedHref: string;
  className?: string;
};

export function ProtectedAction({
  actionLabel,
  authenticatedHref,
  unauthenticatedHref,
  className,
}: ProtectedActionProps) {
  const { isAuthenticated } = useAuth();

  return (
    <Link href={isAuthenticated ? authenticatedHref : unauthenticatedHref} className={className}>
      {actionLabel}
    </Link>
  );
}

type GuardedPanelProps = {
  title: string;
  description: string;
  ctaLabel: string;
  loginHref: string;
  children: ReactNode;
};

export function GuardedPanel({
  title,
  description,
  ctaLabel,
  loginHref,
  children,
}: GuardedPanelProps) {
  const { isAuthenticated, isReady } = useAuth();

  if (!isReady) {
    return <section className="rounded-3xl border border-line bg-white p-8 shadow-panel">Cargando...</section>;
  }

  if (!isAuthenticated) {
    return (
      <section className="rounded-3xl border border-line bg-white p-8 shadow-panel">
        <span className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-coral">
          Accion protegida
        </span>
        <h2 className="mt-4 text-2xl font-semibold text-ink">{title}</h2>
        <p className="mt-3 text-sm leading-7 text-stone">{description}</p>
        <Link
          href={loginHref}
          className="mt-6 inline-flex rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#e31c5f]"
        >
          {ctaLabel}
        </Link>
      </section>
    );
  }

  return <section className="rounded-3xl border border-line bg-white p-8 shadow-panel">{children}</section>;
}
