"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import { TerrenoDrawer } from "@/components/terreno-drawer";
import {
  type AuthRequestOptions,
  fetchMyTerrenos,
  fetchReceivedContacts,
  resendContactRequestEmail,
  updateContactRequestStatus,
} from "@/lib/api";
import type { ContactRequest, Terreno } from "@/lib/types";

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

type DrawerState = {
  isOpen: boolean;
  mode: "create" | "edit";
  terrenoSlug: string | null;
};

export function SellerDashboard() {
  const { auth, session } = useAuth();
  const [terrenos, setTerrenos] = useState<Terreno[]>([]);
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [updatingContactId, setUpdatingContactId] = useState<string | null>(null);
  const [resendingContactId, setResendingContactId] = useState<string | null>(null);
  const [contactsExpanded, setContactsExpanded] = useState(false);
  const [drawer, setDrawer] = useState<DrawerState>({
    isOpen: false,
    mode: "create",
    terrenoSlug: null,
  });

  useEffect(() => {
    async function loadData() {
      if (!auth) {
        setError("No hay sesión activa.");
        setIsLoading(false);
        return;
      }

      try {
        const [myTerrenos, receivedContacts] = await Promise.all([
          fetchMyTerrenos(auth),
          fetchReceivedContacts(auth),
        ]);
        setTerrenos(myTerrenos);
        setContacts(receivedContacts.results);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar datos.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadData();
  }, [auth]);

  useEffect(() => {
    if (!toast) return;
    const timeoutId = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
  }

  function openDrawer(mode: "create" | "edit", slug: string | null = null) {
    setDrawer({ isOpen: true, mode, terrenoSlug: slug });
  }

  function closeDrawer() {
    setDrawer((prev) => ({ ...prev, isOpen: false }));
  }

  function handleSaveTerreno(updatedTerreno: Terreno) {
    setTerrenos((current) => {
      const exists = current.some((t) => t.slug === updatedTerreno.slug);
      if (exists) {
        return current.map((t) => (t.slug === updatedTerreno.slug ? updatedTerreno : t));
      }
      return [updatedTerreno, ...current];
    });
  }

  async function handleContactStatusChange(contactId: string, nextStatus: ContactRequest["status"]) {
    if (!auth) return;

    setUpdatingContactId(contactId);
    try {
      const updatedContact = await updateContactRequestStatus(contactId, nextStatus, auth);
      setContacts((current) =>
        current.map((c) => (c.id === updatedContact.id ? updatedContact : c)),
      );
      showToast("success", "Estado actualizado.");
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Error al actualizar.");
    } finally {
      setUpdatingContactId(null);
    }
  }

  async function handleResendEmail(contactId: string) {
    if (!auth) return;

    setResendingContactId(contactId);
    try {
      const updatedContact = await resendContactRequestEmail(contactId, auth);
      setContacts((current) =>
        current.map((c) => (c.id === updatedContact.id ? updatedContact : c)),
      );
      showToast("success", "Email reenviado.");
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Error al reenviar.");
    } finally {
      setResendingContactId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-sand border-t-coral" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-5">
        <p className="text-sm font-medium text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-24 right-6 z-50 flex max-w-sm items-start gap-3 rounded-2xl border bg-white px-4 py-3 shadow-xl">
          <div
            className={`mt-0.5 h-5 w-5 rounded-full ${
              toast.type === "success" ? "bg-emerald-500" : "bg-red-500"
            }`}
          />
          <p className="text-sm font-medium text-ink">{toast.message}</p>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-stone hover:text-ink"
          >
            ✕
          </button>
        </div>
      )}

      <TerrenoDrawer
        isOpen={drawer.isOpen}
        onClose={closeDrawer}
        mode={drawer.mode}
        terrenoSlug={drawer.terrenoSlug}
        auth={auth}
        onSave={handleSaveTerreno}
        onNotify={showToast}
      />

      <header className="flex flex-col gap-4 rounded-3xl border border-white/80 bg-white p-5 shadow-sm sm:flex-row sm:items-start sm:justify-between">
        <div>
          {session?.user && (
            <span className="inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1 text-xs font-semibold text-stone">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              {session.user.fullName}
            </span>
          )}
          <h1 className="mt-3 font-display text-2xl font-semibold text-ink sm:text-3xl">
            Mis terrenos
          </h1>
          <p className="mt-1 text-sm text-stone">
            Gestiona tus publicaciones y revisa contactos
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="rounded-2xl bg-sand px-4 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone">Total</p>
            <p className="text-xl font-semibold text-ink">{terrenos.length}</p>
          </div>
          <div className="rounded-2xl bg-rose-50 px-4 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-coral/70">Contactos</p>
            <p className="text-xl font-semibold text-coral">{contacts.length}</p>
          </div>
          <button
            onClick={() => openDrawer("create")}
            className="flex items-center gap-2 rounded-2xl bg-coral px-5 py-2 text-sm font-bold text-white shadow-[0_4px_14px_rgba(255,56,92,0.3)] transition hover:-translate-y-0.5 hover:bg-[#e92a5b]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Publicar
          </button>
        </div>
      </header>

      {terrenos.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line/60 bg-sand/50 p-10 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-white shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-stone/50" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-ink">Sin publicaciones aún</h3>
          <p className="mt-2 text-sm text-stone">
            Publica tu primer terreno y empieza a recibir contactos.
          </p>
          <button
            onClick={() => openDrawer("create")}
            className="mt-5 rounded-2xl bg-coral px-6 py-3 text-sm font-bold text-white transition hover:bg-[#e92a5b]"
          >
            Publicar mi primer terreno
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {terrenos.map((terreno) => (
            <SellerTerrenoCard
              key={terreno.id}
              terreno={terreno}
              onEdit={() => openDrawer("edit", terreno.slug)}
            />
          ))}
        </div>
      )}

      <div className="rounded-3xl border border-white/80 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setContactsExpanded((prev) => !prev)}
          className="flex w-full items-center justify-between p-5 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-ink">Contactos</h2>
              <p className="text-sm text-stone">
                {contacts.length} solicitud{contacts.length !== 1 ? "es" : ""} reciente{contacts.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 text-stone transition-transform ${contactsExpanded ? "rotate-180" : ""}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {contactsExpanded && (
          <div className="border-t border-line/60 px-5 pb-5">
            {contacts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line/60 bg-sand/50 py-8 text-center">
                <p className="text-sm text-stone">
                  Cuando alguien te escriba desde un terreno, aparecerá aquí.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {contacts.slice(0, 5).map((contact) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    onStatusChange={(status) => void handleContactStatusChange(contact.id, status)}
                    isUpdating={updatingContactId === contact.id}
                    onResendEmail={() => void handleResendEmail(contact.id)}
                    isResendingEmail={resendingContactId === contact.id}
                  />
                ))}
                {contacts.length > 5 && (
                  <p className="text-center text-sm text-stone">
                    +{contacts.length - 5} más...
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SellerTerrenoCard({
  terreno,
  onEdit,
}: {
  terreno: Terreno;
  onEdit: () => void;
}) {
  const coverImage = terreno.image ?? null;

  const statusConfig =
    terreno.status === "active"
      ? { label: "Activo", bg: "bg-emerald-50", text: "text-emerald-700" }
      : terreno.status === "paused"
        ? { label: "Pausado", bg: "bg-amber-50", text: "text-amber-700" }
        : { label: "Vendido", bg: "bg-stone-100", text: "text-stone-700" };

  return (
    <div className="group overflow-hidden rounded-3xl border border-line/60 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="relative aspect-[4/3] bg-sand">
        {coverImage ? (
          <img
            src={coverImage}
            alt={terreno.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-stone/30" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        <span className={`absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusConfig.bg} ${statusConfig.text}`}>
          {statusConfig.label}
        </span>
      </div>

      <div className="p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-stone">{terreno.municipio}</p>
        <h3 className="mt-1 line-clamp-2 text-base font-semibold text-ink">{terreno.title}</h3>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-sand px-2.5 py-1 text-xs font-semibold text-ink">
            {terreno.areaLabel}
          </span>
          <span className="rounded-full bg-coral/10 px-2.5 py-1 text-xs font-bold text-coral">
            {terreno.priceLabel}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <a
            href={`/terrenos/${terreno.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-full border border-line/80 bg-sand px-3 py-2 text-center text-xs font-semibold text-ink transition hover:bg-sand/80"
          >
            Ver anuncio
          </a>
          <button
            onClick={onEdit}
            className="flex-1 rounded-full bg-coral px-3 py-2 text-center text-xs font-bold text-white transition hover:bg-[#e92a5b]"
          >
            Editar
          </button>
        </div>
      </div>
    </div>
  );
}

function ContactCard({
  contact,
  onStatusChange,
  isUpdating,
  onResendEmail,
  isResendingEmail,
}: {
  contact: ContactRequest;
  onStatusChange: (status: ContactRequest["status"]) => void;
  isUpdating: boolean;
  onResendEmail: () => void;
  isResendingEmail: boolean;
}) {
  const statusConfig =
    contact.status === "pending"
      ? { bg: "bg-amber-100", text: "text-amber-700" }
      : contact.status === "read"
        ? { bg: "bg-sky-100", text: "text-sky-700" }
        : { bg: "bg-emerald-100", text: "text-emerald-700" };

  const statusLabel =
    contact.status === "pending" ? "Pendiente" : contact.status === "read" ? "Leído" : "Respondido";

  return (
    <div className="rounded-2xl border border-line/60 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-ink">{contact.buyerName}</p>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusConfig.bg} ${statusConfig.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${contact.status === "pending" ? "bg-amber-500" : contact.status === "read" ? "bg-sky-500" : "bg-emerald-500"}`} />
              {statusLabel}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-stone">{contact.terreno.title}</p>
          <p className="mt-2 line-clamp-2 text-sm text-stone/80">{contact.message}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-stone/70">
            <span>{contact.buyerEmail}</span>
            {contact.buyerPhone && <span>{contact.buyerPhone}</span>}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <div className="inline-flex rounded-full bg-sand p-0.5">
          {(["pending", "read", "replied"] as const).map((statusOption) => (
            <button
              key={statusOption}
              type="button"
              onClick={() => onStatusChange(statusOption)}
              disabled={isUpdating}
              className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition ${
                contact.status === statusOption
                  ? statusOption === "pending"
                    ? "bg-amber-100 text-amber-700"
                    : statusOption === "read"
                      ? "bg-sky-100 text-sky-700"
                      : "bg-emerald-100 text-emerald-700"
                  : "text-stone hover:bg-white"
              }`}
            >
              {statusOption === "pending" ? "Pend" : statusOption === "read" ? "Leído" : "Resp."}
            </button>
          ))}
        </div>
        {contact.notificationStatus !== "sent" && (
          <button
            onClick={onResendEmail}
            disabled={isResendingEmail}
            className="inline-flex items-center gap-1 rounded-full border border-line/80 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-ink transition hover:bg-sand disabled:opacity-50"
          >
            {isResendingEmail ? "Enviando..." : "Reenviar email"}
          </button>
        )}
        <a
          href={`/mensajes/${contact.id}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-coral px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-[#e92a5b]"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          Responder
          {contact.lastMessage && (
            <span className="ml-1 rounded-full bg-white/20 px-1.5">nuevo</span>
          )}
        </a>
      </div>
    </div>
  );
}