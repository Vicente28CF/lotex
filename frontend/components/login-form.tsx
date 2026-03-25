"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

import { useAuth } from "@/components/auth-provider";
import type { AuthSession, AuthUser } from "@/lib/types";

type LoginResponse = {
  user: AuthUser;
  tokens: {
    access: string;
    refresh: string;
  };
  non_field_errors?: string[];
  detail?: string;
};

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
    setStatus({ type: "loading", message: "Validando acceso..." });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as LoginResponse;

      if (!response.ok) {
        const message = data.non_field_errors?.[0] ?? data.detail ?? "No se pudo iniciar sesion.";
        throw new Error(message);
      }

      const session: AuthSession = {
        accessToken: data.tokens.access,
        refreshToken: data.tokens.refresh,
        user: data.user,
      };

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
    <form onSubmit={handleSubmit} className="rounded-[32px] border border-line bg-white p-8 shadow-panel">
      <span className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-coral">
        Login
      </span>
      <h2 className="mt-4 text-3xl font-semibold text-ink">Entra para publicar o contactar.</h2>
      <p className="mt-3 text-sm leading-7 text-stone">
        La exploracion es publica. La autenticacion aparece solo cuando el usuario ya quiere ejecutar una accion con impacto.
      </p>

      <div className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-ink">Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            className="h-14 w-full rounded-2xl border border-line px-4 outline-none transition focus:border-ink"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-ink">Contrasena</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            className="h-14 w-full rounded-2xl border border-line px-4 outline-none transition focus:border-ink"
            required
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={status.type === "loading"}
        className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-coral px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#e31c5f]"
      >
        {status.type === "loading" ? "Entrando..." : "Iniciar sesion"}
      </button>

      <p className="mt-4 min-h-6 text-sm text-red-600">{status.type === "error" ? status.message : ""}</p>

      <div className="mt-4 flex items-center justify-between text-sm text-stone">
        <span>Explorar sigue abierto sin cuenta.</span>
        <Link href="/" className="font-medium text-ink">
          Volver al home
        </Link>
      </div>
    </form>
  );
}
