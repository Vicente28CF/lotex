"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

import { useAuth } from "@/components/auth-provider";
import { loginUser } from "@/lib/api";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: "terrenos@test.com",
    password: "terrenosLotex28",
  });
  const [status, setStatus] = useState<{ type: "idle" | "loading" | "error"; message: string }>({
    type: "idle",
    message: "",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ type: "loading", message: "Revisando tus datos..." });

    try {
      const session = await loginUser(form);
      login(session);
      router.push(searchParams.get("redirect") ?? "/");
      router.refresh();
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "No se pudo iniciar sesion.",
      });
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[32px] border border-white/80 bg-white/88 p-8 shadow-panel"
    >
      <span className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-coral">
        Acceso
      </span>
      <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-ink">
        Entra para publicar o contactar.
      </h2>
      <p className="mt-3 text-sm leading-7 text-stone">
        Puedes ver terrenos sin registrarte. Inicia sesion solo cuando quieras publicar o pedir informes.
      </p>

      <div className="mt-8 space-y-4">
        <label className="block rounded-[24px] border border-line bg-[#fcfaf7] px-4 py-3 transition focus-within:border-coral/40 focus-within:bg-white">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-stone">
            Email
          </span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            className="w-full bg-transparent text-sm font-medium text-ink outline-none"
            required
          />
        </label>

        <label className="block rounded-[24px] border border-line bg-[#fcfaf7] px-4 py-3 transition focus-within:border-coral/40 focus-within:bg-white">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-stone">
            Contrasena
          </span>
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            className="w-full bg-transparent text-sm font-medium text-ink outline-none"
            required
          />
        </label>
      </div>

      <div className="mt-5 rounded-[22px] border border-line bg-[#fff8f4] px-4 py-4 text-sm leading-7 text-stone">
        Si ya tienes cuenta, entra con tus datos. Si estas probando en local, usa las credenciales de ejemplo.
      </div>

      <button
        type="submit"
        disabled={status.type === "loading"}
        className="mt-6 inline-flex w-full items-center justify-center rounded-[24px] bg-coral px-5 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#e31c5f]"
      >
        {status.type === "loading" ? "Entrando..." : "Entrar"}
      </button>

      <div className="mt-4 min-h-6 text-sm">
        {status.type === "error" ? (
          <p className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-red-600">
            {status.message}
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-stone">
        <span>Puedes seguir explorando terrenos sin iniciar sesion.</span>
        <Link href="/" className="font-medium text-ink transition hover:text-coral">
          Volver al inicio
        </Link>
      </div>
    </form>
  );
}
