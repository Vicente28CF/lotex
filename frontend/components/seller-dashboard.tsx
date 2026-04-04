"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import { useAuth } from "@/components/auth-provider";
import {
  type AuthRequestOptions,
  type ContactListResponse,
  createTerreno,
  deleteTerrenoImage,
  fetchMyTerrenos,
  fetchOwnedTerrenoBySlug,
  fetchReceivedContacts,
  fetchReceivedContactsWithFilters,
  manageTerrenoImages,
  resendContactRequestEmail,
  updateContactRequestStatus,
  uploadTerrenoImages,
  updateTerreno,
} from "@/lib/api";
import type {
  ContactRequest,
  CreateTerrenoPayload,
  Terreno,
  TerrenoImage,
  UpdateTerrenoPayload,
} from "@/lib/types";

type DashboardTab = "overview" | "terrenos" | "contacts";

type DashboardStatus = {
  type: "loading" | "ready" | "error";
  message: string;
};

type TerrainEditorMode = "create" | "edit";

type TerrainFormValue = {
  title: string;
  description: string;
  price: string;
  areaM2: string;
  municipio: string;
  estado: string;
  address: string;
  status: "active" | "paused" | "sold";
};

type PendingUploadImage = {
  id: string;
  file: File;
  previewUrl: string;
};

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

const EMPTY_FORM: TerrainFormValue = {
  title: "",
  description: "",
  price: "",
  areaM2: "",
  municipio: "",
  estado: "Jalisco",
  address: "",
  status: "active",
};

export function SellerDashboard() {
  const { auth, session } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [terrenos, setTerrenos] = useState<Terreno[]>([]);
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [contactsCount, setContactsCount] = useState(0);
  const [filteredContacts, setFilteredContacts] = useState<ContactRequest[]>([]);
  const [filteredContactsCount, setFilteredContactsCount] = useState(0);
  const [contactPage, setContactPage] = useState(1);
  const [contactHasNextPage, setContactHasNextPage] = useState(false);
  const [contactHasPreviousPage, setContactHasPreviousPage] = useState(false);
  const [selectedTerrenoSlug, setSelectedTerrenoSlug] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<TerrainEditorMode>("create");
  const [status, setStatus] = useState<DashboardStatus>({
    type: "loading",
    message: "Cargando panel...",
  });
  const [publishStatus, setPublishStatus] = useState<DashboardStatus>({
    type: "ready",
    message: "",
  });
  const [contactStatusMessage, setContactStatusMessage] = useState<DashboardStatus>({
    type: "ready",
    message: "",
  });
  const [updatingContactId, setUpdatingContactId] = useState<string | null>(null);
  const [resendingContactId, setResendingContactId] = useState<string | null>(null);
  const [contactSearch, setContactSearch] = useState("");
  const [debouncedContactSearch, setDebouncedContactSearch] = useState("");
  const [contactFilter, setContactFilter] = useState<"all" | ContactRequest["status"]>("all");
  const [notificationFilter, setNotificationFilter] = useState<
    "all" | ContactRequest["notificationStatus"]
  >("all");
  const [toast, setToast] = useState<ToastState>(null);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsLoadReason, setContactsLoadReason] = useState<"filters" | "page" | null>(null);
  const [isAutoRefreshingContacts, setIsAutoRefreshingContacts] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      if (!auth) {
        setStatus({
          type: "error",
          message: "No se encontro una sesion valida para cargar el panel.",
        });
        return;
      }

      setStatus({
        type: "loading",
        message: "Cargando panel...",
      });

      try {
        const [myTerrenos, receivedContacts] = await Promise.all([
          fetchMyTerrenos(auth),
          fetchReceivedContacts(auth),
        ]);

        setTerrenos(myTerrenos);
        setContacts(receivedContacts.results);
        setContactsCount(receivedContacts.count);
        setFilteredContacts(receivedContacts.results);
        setFilteredContactsCount(receivedContacts.count);
        setContactHasNextPage(Boolean(receivedContacts.next));
        setContactHasPreviousPage(Boolean(receivedContacts.previous));
        setStatus({
          type: "ready",
          message: "",
        });
      } catch (error) {
        setStatus({
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : "No se pudo cargar el panel del vendedor.",
        });
      }
    }

    void loadDashboard();
  }, [auth, session?.accessToken]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedContactSearch(contactSearch.trim());
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [contactSearch]);

  const summary = useMemo(
    () => ({
      terrenos: terrenos.length,
      destacados: terrenos.filter((terreno) => terreno.isFeatured).length,
      contactos: contactsCount,
    }),
    [terrenos, contactsCount],
  );

  useEffect(() => {
    setContactPage(1);
  }, [contactFilter, notificationFilter, debouncedContactSearch]);

  useEffect(() => {
    async function loadFilteredContacts() {
      if (!auth || activeTab !== "contacts") {
        return;
      }

      setContactsLoading(true);
      setContactsLoadReason(contactPage > 1 ? "page" : "filters");

      try {
        const nextContacts = await fetchReceivedContactsWithFilters(auth, {
          status: contactFilter,
          notificationStatus: notificationFilter,
          search: debouncedContactSearch,
          page: contactPage,
        });
        setFilteredContacts(nextContacts.results);
        setFilteredContactsCount(nextContacts.count);
        setContactHasNextPage(Boolean(nextContacts.next));
        setContactHasPreviousPage(Boolean(nextContacts.previous));
      } catch (error) {
        setContactStatusMessage({
          type: "error",
          message: error instanceof Error ? error.message : "No se pudieron cargar los contactos filtrados.",
        });
      } finally {
        setContactsLoading(false);
        setContactsLoadReason(null);
      }
    }

    void loadFilteredContacts();
  }, [activeTab, auth, contactFilter, notificationFilter, debouncedContactSearch, contactPage]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 3200);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
  }

  function handleEditRequest(slug: string) {
    setSelectedTerrenoSlug(slug);
    setEditorMode("edit");
    setActiveTab("terrenos");
    setPublishStatus({ type: "ready", message: "" });
  }

  function handleCreateRequest() {
    setSelectedTerrenoSlug(null);
    setEditorMode("create");
    setActiveTab("terrenos");
    setPublishStatus({ type: "ready", message: "" });
  }

  async function refreshFilteredContactsPage() {
    if (!auth) {
      return;
    }

    const nextContacts = await fetchReceivedContactsWithFilters(auth, {
      status: contactFilter,
      notificationStatus: notificationFilter,
      search: debouncedContactSearch,
      page: contactPage,
    });
    setFilteredContacts(nextContacts.results);
    setFilteredContactsCount(nextContacts.count);
    setContactHasNextPage(Boolean(nextContacts.next));
    setContactHasPreviousPage(Boolean(nextContacts.previous));
  }

  useEffect(() => {
    if (!auth || activeTab !== "contacts") {
      return;
    }

    const currentAuth = auth;
    let isCancelled = false;

    async function pollContacts() {
      if (document.visibilityState !== "visible") {
        return;
      }

      setIsAutoRefreshingContacts(true);

      try {
        const [summaryContacts, pageContacts] = await Promise.all([
          fetchReceivedContacts(currentAuth),
          fetchReceivedContactsWithFilters(currentAuth, {
            status: contactFilter,
            notificationStatus: notificationFilter,
            search: debouncedContactSearch,
            page: contactPage,
          }),
        ]);

        if (isCancelled) {
          return;
        }

        setContacts(summaryContacts.results);
        setContactsCount(summaryContacts.count);
        setFilteredContacts(pageContacts.results);
        setFilteredContactsCount(pageContacts.count);
        setContactHasNextPage(Boolean(pageContacts.next));
        setContactHasPreviousPage(Boolean(pageContacts.previous));
      } catch {
        if (isCancelled) {
          return;
        }
      } finally {
        if (!isCancelled) {
          setIsAutoRefreshingContacts(false);
        }
      }
    }

    const intervalId = window.setInterval(() => {
      void pollContacts();
    }, 30000);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, [activeTab, auth, contactFilter, notificationFilter, debouncedContactSearch, contactPage]);

  async function handleContactStatusChange(
    contactId: string,
    nextStatus: ContactRequest["status"],
  ) {
    if (!auth) {
      setContactStatusMessage({
        type: "error",
        message: "Tu sesion no es valida. Vuelve a iniciar sesion.",
      });
      return;
    }

    setUpdatingContactId(contactId);
    setContactStatusMessage({
      type: "loading",
      message: "Actualizando estado del contacto...",
    });

    try {
      const updatedContact = await updateContactRequestStatus(contactId, nextStatus, auth);
      setContacts((current) =>
        current.map((contact) => (contact.id === updatedContact.id ? updatedContact : contact)),
      );
      await refreshFilteredContactsPage();
      setContactStatusMessage({
        type: "ready",
        message: "Estado del contacto actualizado.",
      });
      showToast("success", "Estado del contacto actualizado.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo actualizar el estado del contacto.";
      setContactStatusMessage({
        type: "error",
        message,
      });
      showToast("error", message);
    } finally {
      setUpdatingContactId(null);
    }
  }

  async function handleResendContactEmail(contactId: string) {
    if (!auth) {
      setContactStatusMessage({
        type: "error",
        message: "Tu sesion no es valida. Vuelve a iniciar sesion.",
      });
      return;
    }

    setResendingContactId(contactId);
    setContactStatusMessage({
      type: "loading",
      message: "Reenviando notificacion por email...",
    });

    try {
      const updatedContact = await resendContactRequestEmail(contactId, auth);
      setContacts((current) =>
        current.map((contact) => (contact.id === updatedContact.id ? updatedContact : contact)),
      );
      await refreshFilteredContactsPage();
      setContactStatusMessage({
        type: "ready",
        message: "Notificacion reenviada.",
      });
      showToast("success", "Notificacion reenviada.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo reenviar la notificacion del contacto.";
      setContactStatusMessage({
        type: "error",
        message,
      });
      showToast("error", message);
    } finally {
      setResendingContactId(null);
    }
  }

  if (status.type === "loading") {
    return (
      <div className="rounded-[30px] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
        <p className="text-sm text-stone">{status.message}</p>
      </div>
    );
  }

  if (status.type === "error") {
    return (
      <div className="rounded-[30px] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
        <p className="text-sm text-red-600">{status.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast ? <DashboardToast toast={toast} onClose={() => setToast(null)} /> : null}

      {/* Hero Section - Compacto y con nombre de usuario */}
      <section className="overflow-hidden rounded-[32px] border border-white/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-dash-accent">
                Panel privado
              </span>
              {session?.user && (
                <span className="inline-flex items-center gap-2 rounded-full bg-[#f5f5f5] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  {session.user.fullName}
                </span>
              )}
            </div>
            <h1 className="mt-3 font-display text-2xl font-semibold tracking-[-0.02em] text-ink sm:text-3xl">
              Administra tus terrenos
            </h1>
            <p className="mt-2 text-sm text-stone">
              Publica, actualiza y da seguimiento a tus compradores en un solo lugar.
            </p>
          </div>

          {/* Quick stats pills */}
          <div className="flex flex-wrap gap-2">
            <div className="rounded-[20px] bg-[#f8f8f8] px-4 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone">Total</p>
              <p className="font-display text-xl font-semibold text-ink">{summary.terrenos}</p>
            </div>
            <div className="rounded-[20px] bg-rose-50 px-4 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-dash-accent/70">Destacados</p>
              <p className="font-display text-xl font-semibold text-dash-accent">{summary.destacados}</p>
            </div>
            <div className="rounded-[20px] bg-emerald-50 px-4 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-dash-success/70">Contactos</p>
              <p className="font-display text-xl font-semibold text-dash-success">{summary.contactos}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs de navegación */}
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
              activeTab === "overview"
                ? "bg-ink text-white shadow-md"
                : "bg-white text-stone hover:bg-[#f5f5f5]"
            }`}
          >
            <span className={activeTab === "overview" ? "font-semibold" : ""}>Resumen</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("terrenos")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
              activeTab === "terrenos"
                ? "bg-ink text-white shadow-md"
                : "bg-white text-stone hover:bg-[#f5f5f5]"
            }`}
          >
            <span className={activeTab === "terrenos" ? "font-semibold" : ""}>Mis terrenos</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("contacts")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
              activeTab === "contacts"
                ? "bg-ink text-white shadow-md"
                : "bg-white text-stone hover:bg-[#f5f5f5]"
            }`}
          >
            <span className={activeTab === "contacts" ? "font-semibold" : ""}>Contactos</span>
          </button>
        </div>
        <button
          type="button"
          onClick={handleCreateRequest}
          className="inline-flex items-center gap-2 rounded-full bg-dash-accent px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(232,24,74,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#d11742] hover:shadow-[0_6px_20px_rgba(232,24,74,0.4)]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nuevo terreno
        </button>
      </section>

      {activeTab === "overview" ? (
        <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
          {/* Mis terrenos preview */}
          <div className="rounded-[32px] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-semibold text-ink">Mis terrenos</h2>
                <p className="text-sm text-stone">Vista rapida de tus publicaciones</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("terrenos")}
                className="inline-flex items-center gap-1 text-sm font-medium text-ink transition hover:text-dash-accent"
              >
                Ver todos
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              {terrenos.length === 0 ? (
                <EmptyDashboardMessage
                  title="Aun no tienes terrenos en tu panel."
                  description="Ya puedes publicar el primero desde la pestaña de Mis terrenos."
                />
              ) : (
                terrenos
                  .slice(0, 3)
                  .map((terreno) => (
                    <SellerTerrenoCard
                      key={terreno.id}
                      terreno={terreno}
                      onEdit={() => handleEditRequest(terreno.slug)}
                    />
                  ))
              )}
            </div>
          </div>

          {/* Contactos recientes preview */}
          <div className="rounded-[32px] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-semibold text-ink">Contactos recientes</h2>
                <p className="text-sm text-stone">Solicitudes de compradores</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("contacts")}
                className="inline-flex items-center gap-1 text-sm font-medium text-ink transition hover:text-dash-accent"
              >
                Ver todos
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              {contacts.length === 0 ? (
                <EmptyDashboardMessage
                  title="Todavia no recibes solicitudes."
                  description="Cuando un comprador te escriba desde un terreno, su mensaje aparecera aqui."
                />
              ) : (
                contacts.slice(0, 3).map((contact) => (
                  <SellerContactCard
                    key={contact.id}
                    contact={contact}
                    compact
                    onStatusChange={(nextStatus) =>
                      void handleContactStatusChange(contact.id, nextStatus)
                    }
                    isUpdating={updatingContactId === contact.id}
                    onResendEmail={() => void handleResendContactEmail(contact.id)}
                    isResendingEmail={resendingContactId === contact.id}
                  />
                ))
              )}
            </div>
          </div>
        </section>
      ) : null}

      {activeTab === "terrenos" ? (
        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          {/* Panel izquierdo - Formulario de edición/creación */}
          <div className="rounded-[32px] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-semibold text-ink">
                  {editorMode === "edit" ? "Editar terreno" : "Nuevo terreno"}
                </h2>
                <p className="text-sm text-stone">
                  {editorMode === "edit" ? "Actualiza la información de tu terreno" : "Crea una nueva publicación"}
                </p>
              </div>
              <div className="rounded-full bg-[#f5f5f5] px-4 py-2 text-sm font-medium text-ink">
                {terrenos.length} publicados
              </div>
            </div>
            <TerrainEditorPanel
              auth={auth}
              mode={editorMode}
              selectedTerrenoSlug={selectedTerrenoSlug}
              setSelectedTerrenoSlug={setSelectedTerrenoSlug}
              publishStatus={publishStatus}
              onCreate={async (payload) => {
                if (!auth) {
                  throw new Error("Tu sesion no es valida. Vuelve a iniciar sesion.");
                }

                setPublishStatus({ type: "loading", message: "Publicando terreno..." });
                const terreno = await createTerreno(payload, auth);
                setTerrenos((current) => [terreno, ...current]);
                setPublishStatus({
                  type: "ready",
                  message: "Terreno publicado correctamente.",
                });
                showToast("success", "Terreno publicado correctamente.");
                setSelectedTerrenoSlug(terreno.slug);
                setEditorMode("edit");
                return terreno;
              }}
              onUpdate={async (slug, payload) => {
                if (!auth) {
                  throw new Error("Tu sesion no es valida. Vuelve a iniciar sesion.");
                }

                setPublishStatus({ type: "loading", message: "Guardando cambios..." });
                const terreno = await updateTerreno(slug, payload, auth);
                setTerrenos((current) =>
                  current.map((item) => (item.slug === terreno.slug ? { ...item, ...terreno } : item)),
                );
                setPublishStatus({
                  type: "ready",
                  message: "Terreno actualizado correctamente.",
                });
                showToast("success", "Terreno actualizado correctamente.");
              }}
              onImagesSaved={(updatedTerreno) => {
                setTerrenos((current) =>
                  current.map((item) =>
                    item.slug === updatedTerreno.slug ? { ...item, ...updatedTerreno } : item,
                  ),
                );
              }}
              onNotify={showToast}
            />
          </div>

          {/* Panel derecho - Lista de terrenos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-ink">Tus terrenos</h3>
              <span className="rounded-full bg-[#f5f5f5] px-3 py-1 text-xs font-medium text-stone">
                {terrenos.length} en total
              </span>
            </div>
            <div className="grid gap-3">
              {terrenos.length === 0 ? (
                <EmptyDashboardMessage
                  title="No tienes terrenos cargados."
                  description="Usa el formulario para publicar tu primer terreno desde este panel."
                />
              ) : (
                terrenos.map((terreno) => (
                  <SellerTerrenoCard
                    key={terreno.id}
                    terreno={terreno}
                    onEdit={() => handleEditRequest(terreno.slug)}
                    isSelected={selectedTerrenoSlug === terreno.slug}
                  />
                ))
              )}
            </div>
          </div>
        </section>
      ) : null}

      {activeTab === "contacts" ? (
        <section className="rounded-[32px] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">Contactos recibidos</h2>
              <p className="text-sm text-stone">Solicitudes mediadas desde tus anuncios.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-dash-success">
                {contacts.length} solicitudes
              </span>
            </div>
          </div>

          {/* Filtros */}
          <div className="mb-5 grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
            <DashboardInput
              label="Buscar"
              value={contactSearch}
              onChange={setContactSearch}
              placeholder="Nombre, email, telefono, terreno..."
              disabled={contactsLoading}
            />
            <label className="rounded-[20px] border border-[#e8e8e8] bg-white px-4 py-3 shadow-sm">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-stone">
                Estado
              </span>
              <select
                value={contactFilter}
                onChange={(event) =>
                  setContactFilter(event.target.value as "all" | ContactRequest["status"])
                }
                disabled={contactsLoading}
                className="w-full bg-transparent text-sm font-medium text-ink outline-none"
              >
                <option value="all">Todos</option>
                <option value="pending">Pendientes</option>
                <option value="read">Leídos</option>
                <option value="replied">Respondidos</option>
              </select>
            </label>
            <label className="rounded-[20px] border border-[#e8e8e8] bg-white px-4 py-3 shadow-sm">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-stone">
                Email
              </span>
              <select
                value={notificationFilter}
                onChange={(event) =>
                  setNotificationFilter(
                    event.target.value as "all" | ContactRequest["notificationStatus"],
                  )
                }
                disabled={contactsLoading}
                className="w-full bg-transparent text-sm font-medium text-ink outline-none"
              >
                <option value="all">Todos</option>
                <option value="pending">Pendiente</option>
                <option value="sent">Enviado</option>
                <option value="failed">Fallido</option>
              </select>
            </label>
          </div>

          {/* Resultados */}
          <div className="mb-4 flex items-center justify-between rounded-[20px] bg-[#f8f8f8] px-4 py-3 text-sm">
            <span className="text-stone">
              Mostrando <span className="font-semibold text-ink">{filteredContacts.length}</span> de{" "}
              <span className="font-semibold text-ink">{filteredContactsCount}</span> solicitudes
            </span>
          </div>

          {/* Lista de contactos */}
          {contactsCount === 0 ? (
            <EmptyDashboardMessage
              title="Aun no hay contactos en tu bandeja."
              description="Cuando alguien te escriba desde la ficha de un terreno, el mensaje aparecera aqui."
            />
          ) : filteredContacts.length === 0 ? (
            <EmptyDashboardMessage
              title="No hay resultados con esos filtros."
              description="Ajusta la busqueda o limpia los filtros para volver a ver la bandeja completa."
            />
          ) : contactsLoading ? (
            <div className="space-y-4">
              <ContactCardSkeleton />
              <ContactCardSkeleton />
              <ContactCardSkeleton />
            </div>
          ) : (
            <div className="space-y-3">
              {filteredContacts.map((contact) => (
                <SellerContactCard
                  key={contact.id}
                  contact={contact}
                  onStatusChange={(nextStatus) =>
                    void handleContactStatusChange(contact.id, nextStatus)
                  }
                  isUpdating={updatingContactId === contact.id}
                  onResendEmail={() => void handleResendContactEmail(contact.id)}
                  isResendingEmail={resendingContactId === contact.id}
                />
              ))}
            </div>
          )}

          {/* Paginación */}
          {filteredContactsCount > 0 && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[20px] bg-[#f8f8f8] px-4 py-3">
              <span className="text-sm text-stone">Página {contactPage}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setContactPage((current) => Math.max(1, current - 1))}
                  disabled={!contactHasPreviousPage || contactsLoading}
                  className="inline-flex items-center gap-1 rounded-full border border-[#e8e8e8] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink transition-all duration-200 hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setContactPage((current) => current + 1)}
                  disabled={!contactHasNextPage || contactsLoading}
                  className="inline-flex items-center gap-1 rounded-full border border-[#e8e8e8] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink transition-all duration-200 hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Siguiente
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Estados de carga */}
          {contactsLoading ? (
            <p className="mt-4 text-sm text-stone">
              {contactsLoadReason === "page"
                ? "Cargando otra pagina de contactos..."
                : "Actualizando filtros desde la API..."}
            </p>
          ) : isAutoRefreshingContacts ? (
            <p className="mt-4 text-sm text-stone">Refrescando contactos en segundo plano...</p>
          ) : null}

          <div className="mt-4 min-h-6 text-sm">
            {contactStatusMessage.type === "error" ? (
              <p className="text-dash-error">{contactStatusMessage.message}</p>
            ) : null}
            {contactStatusMessage.type === "loading" ? (
              <p className="text-stone">{contactStatusMessage.message}</p>
            ) : null}
            {contactStatusMessage.type === "ready" && contactStatusMessage.message ? (
              <p className="text-dash-success">{contactStatusMessage.message}</p>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function TerrainEditorPanel({
  auth,
  mode,
  selectedTerrenoSlug,
  setSelectedTerrenoSlug,
  publishStatus,
  onCreate,
  onUpdate,
  onImagesSaved,
  onNotify,
}: {
  auth: AuthRequestOptions | null;
  mode: TerrainEditorMode;
  selectedTerrenoSlug: string | null;
  publishStatus: DashboardStatus;
  onCreate: (payload: CreateTerrenoPayload) => Promise<Terreno>;
  onUpdate: (slug: string, payload: UpdateTerrenoPayload) => Promise<void>;
  onImagesSaved: (terreno: Terreno) => void;
  onNotify: (type: "success" | "error", message: string) => void;
  setSelectedTerrenoSlug: (slug: string | null) => void;
}) {
  const [form, setForm] = useState<TerrainFormValue>(EMPTY_FORM);
  const [terrainImages, setTerrainImages] = useState<TerrenoImage[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<PendingUploadImage[]>([]);
  const [editorStatus, setEditorStatus] = useState<DashboardStatus>({
    type: "ready",
    message: "",
  });
  const [isManagingImages, setIsManagingImages] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // New state for multi-step form

  const steps = [
    { name: "Informacion General" },
    { name: "Detalles y Ubicacion" },
    { name: "Imagenes" },
    { name: "Revisar y Publicar" },
  ];

  const handleNextStep = () => {
    // Basic validation before moving to the next step
    if (currentStep === 0) {
      if (!form.title.trim() || !form.description.trim()) {
        setEditorStatus({
          type: "error",
          message: "Titulo y descripcion son obligatorios.",
        });
        return;
      }
    } else if (currentStep === 1) {
      if (!form.municipio.trim() || !form.address.trim()) {
        setEditorStatus({
          type: "error",
          message: "Municipio y direccion son obligatorios.",
        });
        return;
      }
      if (Number(form.price) <= 0 || Number(form.areaM2) <= 0) {
        setEditorStatus({
          type: "error",
          message: "Precio y area deben ser mayores a cero.",
        });
        return;
      }
    } else if (currentStep === 2) {
      if (mode === "create" && selectedFiles.length === 0) {
        setEditorStatus({
          type: "error",
          message: "Debes seleccionar al menos una imagen para publicar un terreno nuevo.",
        });
        return;
      }
    }

    setEditorStatus({ type: "ready", message: "" }); // Clear previous errors
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  useEffect(() => {
    async function loadSelectedTerreno() {
      if (!auth || !selectedTerrenoSlug || mode !== "edit") {
        setForm(EMPTY_FORM);
        setTerrainImages([]);
        setSelectedFiles([]);
        setCurrentStep(0); // Reset step when changing mode or no terreno selected
        return;
      }

      setEditorStatus({ type: "loading", message: "Cargando terreno..." });

      try {
        const terreno = await fetchOwnedTerrenoBySlug(selectedTerrenoSlug, auth);
        setForm({
          title: terreno.title,
          description: terreno.description,
          price: String(terreno.price),
          areaM2: String(terreno.areaM2),
          municipio: terreno.municipio,
          estado: terreno.estado,
          address: terreno.address,
          status: terreno.status,
        });
        setTerrainImages(terreno.images);
        setSelectedFiles([]);
        setEditorStatus({ type: "ready", message: "" });
        setCurrentStep(0); // Reset step when loading a terreno
      } catch (error) {
        setEditorStatus({
          type: "error",
          message:
            error instanceof Error ? error.message : "No se pudo cargar el terreno seleccionado.",
        });
      }
    }

    void loadSelectedTerreno();
  }, [auth, selectedTerrenoSlug, mode]);

  useEffect(() => {
    return () => {
      selectedFiles.forEach((file) => {
        URL.revokeObjectURL(file.previewUrl);
      });
    };
  }, [selectedFiles]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Only submit if on the last step
    if (currentStep !== steps.length - 1) {
      return;
    }

    // Final validation before submission
    if (!form.title.trim() || !form.description.trim() || !form.municipio.trim() || !form.address.trim()) {
      setEditorStatus({
        type: "error",
        message: "Todos los campos de informacion general y detalles son obligatorios.",
      });
      return;
    }

    if (Number(form.price) <= 0 || Number(form.areaM2) <= 0) {
      setEditorStatus({
        type: "error",
        message: "Precio y area deben ser mayores a cero.",
      });
      return;
    }

    if (mode === "create" && selectedFiles.length === 0) {
      setEditorStatus({
        type: "error",
        message: "Debes seleccionar al menos una imagen para publicar un terreno nuevo.",
      });
      return;
    }

    const payload: CreateTerrenoPayload = {
      title: form.title.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      areaM2: Number(form.areaM2),
      municipio: form.municipio.trim(),
      estado: form.estado.trim(),
      address: form.address.trim(),
      status: form.status,
      latitude: null,
      longitude: null,
    };

    try {
      if (mode === "edit" && selectedTerrenoSlug) {
        await onUpdate(selectedTerrenoSlug, payload);
        // If images were selected for an existing terreno, upload them after updating the main info
        if (selectedFiles.length > 0) {
          await handleSaveImages(false); // Don't show toast immediately, it will be shown after images are saved
        }
      } else {
        const newTerreno = await onCreate(payload); // onCreate should return the created terreno
        // After creating, if there are images, upload them
        if (selectedFiles.length > 0) {
          // Need to set selectedTerrenoSlug temporarily for image upload
          const originalSelectedTerrenoSlug = selectedTerrenoSlug;
          setSelectedTerrenoSlug(newTerreno.slug);
          await handleSaveImages(true); // Show toast after images are saved
          setSelectedTerrenoSlug(originalSelectedTerrenoSlug); // Restore original slug
        }
        setForm(EMPTY_FORM);
        setSelectedFiles([]); // Clear selected files after successful creation and upload
      }
      setEditorStatus({ type: "ready", message: "" });
      onNotify("success", `Terreno ${mode === "edit" ? "actualizado" : "publicado"} correctamente.`);
    } catch (error) {
      setEditorStatus({
        type: "error",
        message: error instanceof Error ? error.message : "No se pudo guardar el terreno.",
      });
      onNotify("error", error instanceof Error ? error.message : "No se pudo guardar el terreno.");
    }
  }

  async function handleSaveImages(showSuccessToast = true) {
    if (!auth || !selectedTerrenoSlug || mode !== "edit") {
      setEditorStatus({
        type: "error",
        message: "Primero selecciona o crea un terreno para subir imagenes.",
      });
      return;
    }

    if (selectedFiles.length === 0) {
      setEditorStatus({
        type: "error",
        message: "Selecciona al menos una imagen desde tu dispositivo.",
      });
      return;
    }

    try {
      setEditorStatus({ type: "loading", message: "Guardando imagenes..." });
      const terreno = await uploadTerrenoImages(
        selectedTerrenoSlug,
        selectedFiles.map((item) => item.file),
        auth,
      );
      onImagesSaved(terreno);
      setTerrainImages(terreno.images);
      selectedFiles.forEach((file) => {
        URL.revokeObjectURL(file.previewUrl);
      });
      setSelectedFiles([]);
      setEditorStatus({ type: "ready", message: "Imagenes guardadas correctamente." });
      if (showSuccessToast) {
        onNotify("success", "Imagenes guardadas correctamente.");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudieron guardar las imagenes.";
      setEditorStatus({
        type: "error",
        message,
      });
      onNotify("error", message);
    }
  }

  async function handleGalleryChange(nextImages: TerrenoImage[]) {
    if (!auth || !selectedTerrenoSlug || mode !== "edit") {
      setEditorStatus({
        type: "error",
        message: "Primero selecciona un terreno para gestionar su galeria.",
      });
      return;
    }

    setIsManagingImages(true);
    setEditorStatus({ type: "loading", message: "Actualizando galeria..." });

    try {
      const terreno = await manageTerrenoImages(
        selectedTerrenoSlug,
        nextImages.map((image, index) => ({
          id: image.id,
          order: index,
          isCover: image.isCover,
        })),
        auth,
      );
      setTerrainImages(terreno.images);
      onImagesSaved(terreno);
      setEditorStatus({ type: "ready", message: "Galeria actualizada correctamente." });
      onNotify("success", "Galeria actualizada correctamente.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo actualizar la galeria.";
      setEditorStatus({
        type: "error",
        message,
      });
      onNotify("error", message);
    } finally {
      setIsManagingImages(false);
    }
  }

  async function handleDeleteImage(imageId: string) {
    if (!auth || !selectedTerrenoSlug || mode !== "edit") {
      setEditorStatus({
        type: "error",
        message: "Primero selecciona un terreno para gestionar su galeria.",
      });
      return;
    }

    if (terrainImages.length <= 1 && selectedFiles.length === 0) {
      setEditorStatus({
        type: "error",
        message: "Debes conservar al menos una imagen en la galeria o subir una nueva.",
      });
      return;
    }

    if (!window.confirm("Esta accion eliminara la imagen del terreno. Deseas continuar?")) {
      return;
    }

    setIsManagingImages(true);
    setEditorStatus({ type: "loading", message: "Eliminando imagen..." });

    try {
      const terreno = await deleteTerrenoImage(selectedTerrenoSlug, imageId, auth);
      setTerrainImages(terreno.images);
      onImagesSaved(terreno);
      setEditorStatus({ type: "ready", message: "Imagen eliminada correctamente." });
      onNotify("success", "Imagen eliminada correctamente.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo eliminar la imagen.";
      setEditorStatus({
        type: "error",
        message,
      });
      onNotify("error", message);
    } finally {
      setIsManagingImages(false);
    }
  }

  function handleSetCover(imageId: string) {
    const nextImages = terrainImages.map((image, index) => ({
      ...image,
      order: index,
      isCover: image.id === imageId,
    }));
    void handleGalleryChange(nextImages);
  }

  function handleMoveImage(imageId: string, direction: "left" | "right") {
    const index = terrainImages.findIndex((image) => image.id === imageId);
    const targetIndex = direction === "left" ? index - 1 : index + 1;

    if (index < 0 || targetIndex < 0 || targetIndex >= terrainImages.length) {
      return;
    }

    const nextImages = [...terrainImages];
    const [movedImage] = nextImages.splice(index, 1);
    nextImages.splice(targetIndex, 0, movedImage);

    void handleGalleryChange(
      nextImages.map((image, currentIndex) => ({
        ...image,
        order: currentIndex,
      })),
    );
  }

  function handlePendingFilesChange(files: FileList | null) {
    const nextFiles = Array.from(files ?? []).map((file) => ({
      id: `${file.name}-${file.lastModified}-${file.size}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setSelectedFiles((current) => {
      current.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl);
      });
      return nextFiles;
    });
  }

  function handleRemovePendingFile(fileId: string) {
    setSelectedFiles((current) => {
      const fileToRemove = current.find((item) => item.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return current.filter((item) => item.id !== fileId);
    });
  }

  return (
    <div className="rounded-[28px] border border-[#e8e8e8] bg-white p-5 shadow-sm">
      <div className="mb-5">
        <span className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-dash-accent">
          {mode === "edit" ? "Editar terreno" : "Nueva publicacion"}
        </span>
        <h3 className="mt-3 font-display text-xl font-semibold text-ink">
          {mode === "edit" ? "Actualizar información e imágenes" : "Publicar terreno"}
        </h3>
        <p className="mt-1.5 text-sm text-stone">
          Gestiona la ficha principal del terreno y opera la galería desde una sola vista.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-5">
        <div className="flex justify-between text-xs font-medium text-stone">
          {steps.map((step, index) => (
            <span
              key={step.name}
              className={`flex-1 text-center transition-colors duration-200 ${
                index <= currentStep ? "text-dash-accent font-semibold" : ""
              }`}
            >
              {index + 1}. {step.name}
            </span>
          ))}
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#f0f0f0]">
          <div
            className="h-full rounded-full bg-dash-accent transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        {currentStep === 0 && (
          <>
            <DashboardInput
              label="Titulo"
              value={form.title}
              onChange={(value) => setForm((current) => ({ ...current, title: value }))}
              placeholder="Ej. Terreno residencial en esquina"
            />

            <DashboardTextArea
              label="Descripcion"
              value={form.description}
              onChange={(value) => setForm((current) => ({ ...current, description: value }))}
              placeholder="Describe ubicacion, oportunidad, uso y contexto del terreno."
            />
          </>
        )}

        {currentStep === 1 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <DashboardInput
                label="Precio"
                type="number"
                value={form.price}
                onChange={(value) => setForm((current) => ({ ...current, price: value }))}
                placeholder="1250000"
              />
              <DashboardInput
                label="Area m2"
                type="number"
                value={form.areaM2}
                onChange={(value) => setForm((current) => ({ ...current, areaM2: value }))}
                placeholder="250"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <DashboardInput
                label="Municipio"
                value={form.municipio}
                onChange={(value) => setForm((current) => ({ ...current, municipio: value }))}
                placeholder="Zapopan"
              />
              <DashboardInput
                label="Estado"
                value={form.estado}
                onChange={(value) => setForm((current) => ({ ...current, estado: value }))}
                placeholder="Jalisco"
              />
            </div>

            <DashboardInput
              label="Direccion de referencia"
              value={form.address}
              onChange={(value) => setForm((current) => ({ ...current, address: value }))}
              placeholder="Colonia o zona"
            />

            <label className="rounded-[20px] border border-[#e8e8e8] bg-white px-4 py-3 shadow-sm">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-stone">
                Estado de publicacion
              </span>
              <select
                className="w-full bg-transparent text-sm font-medium text-ink outline-none"
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value as TerrainFormValue["status"],
                  }))
                }
              >
                <option value="active">Activo</option>
                <option value="paused">Pausado</option>
                <option value="sold">Vendido</option>
              </select>
            </label>
          </>
        )}

        {currentStep === 2 && (
          <div className="rounded-[24px] border border-[#e8e8e8] bg-[#faf9f8] p-4">
            <div>
              <h4 className="font-display text-base font-semibold text-ink">Imagenes del terreno</h4>
              <p className="mt-1 text-sm text-stone">
                Sube nuevas imagenes, cambia la portada, reordena la galeria o elimina las que ya no necesitas.
              </p>
            </div>

            {mode === "edit" ? (
              <div className="mt-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink">Galeria actual</p>
                  <span className="rounded-full bg-[#f0f0f0] px-2.5 py-1 text-[11px] font-medium text-stone">
                    {terrainImages.length} imagenes
                  </span>
                </div>

                {terrainImages.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {terrainImages.map((image, index) => (
                      <div
                        key={image.id}
                        className="overflow-hidden rounded-[20px] border border-[#e8e8e8] bg-white shadow-sm"
                      >
                        <div className="relative aspect-[4/3] bg-[#f5f5f5]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={image.imageUrl}
                            alt={`Imagen ${index + 1} del terreno`}
                            className="h-full w-full object-cover"
                          />
                          {image.isCover && (
                            <span className="absolute left-2.5 top-2.5 rounded-full bg-dash-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                              Portada
                            </span>
                          )}
                        </div>

                        <div className="space-y-2 p-3">
                          <div className="flex items-center justify-between text-[11px] text-stone">
                            <span>Posicion {index + 1}</span>
                            <span className={image.isCover ? "font-medium text-dash-accent" : ""}>
                              {image.isCover ? "Portada" : "Secundaria"}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => handleMoveImage(image.id, "left")}
                              disabled={isManagingImages || index === 0}
                              className="rounded-full border border-[#e8e8e8] bg-white px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ink transition hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Subir
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveImage(image.id, "right")}
                              disabled={isManagingImages || index === terrainImages.length - 1}
                              className="rounded-full border border-[#e8e8e8] bg-white px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ink transition hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Bajar
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => handleSetCover(image.id)}
                              disabled={isManagingImages || image.isCover}
                              className="rounded-full bg-[#f5f5f5] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ink transition hover:bg-[#ebebeb] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {image.isCover ? "Es portada" : "Hacer portada"}
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDeleteImage(image.id)}
                              disabled={isManagingImages || (terrainImages.length <= 1 && selectedFiles.length === 0)}
                              className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[16px] border border-dashed border-[#e8e8e8] bg-white px-4 py-5 text-center text-sm text-stone">
                    Este terreno aun no tiene imagenes cargadas.
                  </div>
                )}
              </div>
            ) : null}

            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-[20px] border border-dashed border-[#d0d0d0] bg-white px-4 py-6 text-center transition-all duration-200 hover:border-dash-accent/40 hover:bg-rose-50/30">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(event) => handlePendingFilesChange(event.target.files)}
              />
              <div className="mb-2 grid h-10 w-10 place-items-center rounded-full bg-[#f5f5f5]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-stone" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-ink">Elegir imagenes</span>
              <span className="mt-1 text-xs text-stone">
                JPG, PNG o WEBP. Hasta 5 MB por archivo.
              </span>
            </label>

            <div className="mt-4 space-y-2">
              {selectedFiles.length > 0 ? (
                selectedFiles.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-[16px] border border-[#e8e8e8] bg-white px-3 py-2.5"
                  >
                    <div className="h-12 w-12 overflow-hidden rounded-xl bg-[#f5f5f5]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.previewUrl}
                        alt={`Preview ${item.file.name}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">
                        {item.file.name}
                        {index === 0 && terrainImages.length === 0 && " (portada)"}
                      </span>
                      <span className="text-xs text-stone">
                        {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePendingFile(item.id)}
                      className="shrink-0 rounded-full border border-[#e8e8e8] bg-white px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-stone transition hover:bg-[#f5f5f5]"
                    >
                      Quitar
                    </button>
                  </div>
                ))
              ) : (
                <div className="rounded-[16px] border border-[#e8e8e8] bg-white px-4 py-3 text-sm text-stone">
                  Aun no seleccionas archivos.
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => void handleSaveImages()}
              disabled={publishStatus.type === "loading" || isManagingImages || selectedFiles.length === 0}
              className="mt-4 inline-flex w-full items-center justify-center rounded-[20px] border border-[#e8e8e8] bg-[#f5f5f5] px-4 py-3 text-sm font-semibold text-ink transition hover:bg-[#ebebeb] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isManagingImages ? "Espera un momento..." : "Subir imagenes"}
            </button>
          </div>
        )}

        {currentStep === 3 && (
          <div className="rounded-[24px] border border-[#e8e8e8] bg-[#faf9f8] p-4">
            <h4 className="font-display text-base font-semibold text-ink">Revisa tu publicacion</h4>
            <p className="mt-1 text-sm text-stone">
              Asegurate que toda la informacion sea correcta antes de {mode === "edit" ? "actualizar" : "publicar"}.
            </p>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between border-b border-[#e8e8e8] pb-2">
                <span className="text-stone">Titulo</span>
                <span className="font-medium text-ink">{form.title}</span>
              </div>
              <div className="flex justify-between border-b border-[#e8e8e8] pb-2">
                <span className="text-stone">Precio</span>
                <span className="font-semibold text-dash-accent">${form.price}</span>
              </div>
              <div className="flex justify-between border-b border-[#e8e8e8] pb-2">
                <span className="text-stone">Area</span>
                <span className="font-medium text-ink">{form.areaM2} m²</span>
              </div>
              <div className="flex justify-between border-b border-[#e8e8e8] pb-2">
                <span className="text-stone">Ubicacion</span>
                <span className="font-medium text-ink">{form.address}, {form.municipio}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone">Estado</span>
                <StatusBadge status={form.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-stone">Imagenes</span>
                <span className="font-medium text-ink">{terrainImages.length + selectedFiles.length} archivos</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between gap-3">
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={handlePreviousStep}
              className="inline-flex items-center gap-1 rounded-full border border-[#e8e8e8] bg-white px-4 py-2.5 text-sm font-semibold text-ink transition-all duration-200 hover:bg-[#f5f5f5]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Anterior
            </button>
          ) : (
            <div />
          )}

          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="inline-flex items-center gap-1 rounded-full bg-dash-accent px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(232,24,74,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#d11742]"
            >
              Siguiente
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          ) : (
            <button
              type="submit"
              disabled={publishStatus.type === "loading"}
              className="inline-flex items-center gap-2 rounded-full bg-dash-accent px-6 py-3 text-sm font-bold text-white shadow-[0_4px_14px_rgba(232,24,74,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#d11742] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {publishStatus.type === "loading" ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Guardando...
                </>
              ) : mode === "edit" ? (
                "Guardar cambios"
              ) : (
                "Publicar terreno"
              )}
            </button>
          )}
        </div>
      </form>

      <div className="mt-4 min-h-5 text-sm">
        {editorStatus.type === "error" ? (
          <p className="text-dash-error">{editorStatus.message}</p>
        ) : editorStatus.type === "loading" ? (
          <p className="text-stone">{editorStatus.message}</p>
        ) : editorStatus.type === "ready" && editorStatus.message ? (
          <p className="text-dash-success">{editorStatus.message}</p>
        ) : null}
        {publishStatus.type === "ready" && publishStatus.message && editorStatus.message === "" && (
          <p className="text-dash-success">{publishStatus.message}</p>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  dark = false,
  icon,
}: {
  label: string;
  value: number;
  dark?: boolean;
  icon?: ReactNode;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-[24px] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
        dark
          ? "border border-white/10 bg-[#1f1f1f] text-white"
          : "border border-[#e8e8e8] bg-white text-ink"
      }`}
    >
      {/* Icono decorativo */}
      <div className={`absolute -right-3 -top-3 h-16 w-16 opacity-10 ${dark ? "text-white" : "text-ink"}`}>
        {icon}
      </div>

      <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${dark ? "text-white/60" : "text-stone"}`}>
        {label}
      </p>
      <p className={`mt-2 font-display text-4xl font-semibold tracking-[-0.03em] ${dark ? "text-white" : "text-ink"}`}>
        {value}
      </p>
      <p className={`mt-2 text-xs leading-5 ${dark ? "text-white/50" : "text-stone"}`}>
        {dark ? "Mensajes recibidos de personas interesadas." : "Resumen rápido para revisar tu actividad."}
      </p>
    </div>
  );
}

function DashboardToast({
  toast,
  onClose,
}: {
  toast: NonNullable<ToastState>;
  onClose: () => void;
}) {
  const styles =
    toast.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-red-200 bg-red-50 text-red-700";

  return (
    <div className="sticky top-4 z-40 flex justify-end">
      <div
        className={`flex max-w-md items-start gap-3 rounded-[22px] border px-4 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.12)] ${styles}`}
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{toast.type === "success" ? "Listo" : "Atencion"}</p>
          <p className="mt-1 text-sm leading-6">{toast.message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-[0.14em]"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

function DashboardLeadCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-[20px] bg-[#f8f8f8] px-4 py-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone">{label}</p>
      <p className="mt-2 font-display text-lg font-semibold text-ink">{value}</p>
      <p className="mt-1.5 text-xs leading-5 text-stone">{description}</p>
    </div>
  );
}

function SellerTerrenoCard({
  terreno,
  onEdit,
  isSelected = false,
}: {
  terreno: Terreno;
  onEdit: () => void;
  isSelected?: boolean;
}) {
  const coverImage = terreno.images?.find(img => img.isCover)?.imageUrl || terreno.images?.[0]?.imageUrl;

  return (
    <div
      className={`group relative overflow-hidden rounded-[24px] border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
        isSelected
          ? "border-dash-accent/40 bg-rose-50/60 shadow-[0_8px_24px_rgba(232,24,74,0.15)]"
          : "border-[#e8e8e8] bg-white shadow-sm hover:border-dash-accent/30"
      }`}
    >
      <div className="flex gap-4">
        {/* Thumbnail de imagen */}
        {coverImage ? (
          <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-[16px] bg-[#f0f0f0]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImage}
              alt={terreno.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="grid h-24 w-28 shrink-0 place-items-center rounded-[16px] bg-[#f5f5f5]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-stone/40" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        {/* Contenido */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone">{terreno.municipio}</p>
              <h3 className="mt-1 truncate font-display text-lg font-semibold text-ink">{terreno.title}</h3>
            </div>
            {terreno.isFeatured && (
              <span className="shrink-0 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-dash-accent">
                Destacado
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#f5f5f5] px-2.5 py-1 text-[11px] font-semibold text-ink">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 11-2 0V4H6v11a1 1 0 11-2 0V4z" clipRule="evenodd" />
              </svg>
              {terreno.areaLabel}
            </span>
            <span className="rounded-full bg-dash-accent/10 px-2.5 py-1 text-[11px] font-bold text-dash-accent">
              {terreno.priceLabel}
            </span>
            <StatusBadge status={terreno.status} />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#f0f0f0] pt-3">
        <Link
          href={`/terrenos/${terreno.slug}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-ink transition hover:text-dash-accent"
        >
          Ver anuncio
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </Link>
        <button
          type="button"
          onClick={onEdit}
          className="rounded-full border border-[#e8e8e8] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-ink transition-all duration-200 hover:border-dash-accent/40 hover:bg-rose-50"
        >
          Editar
        </button>
      </div>
    </div>
  );
}

function SellerContactCard({
  contact,
  compact = false,
  onStatusChange,
  isUpdating = false,
  onResendEmail,
  isResendingEmail = false,
}: {
  contact: ContactRequest;
  compact?: boolean;
  onStatusChange?: (status: ContactRequest["status"]) => void;
  isUpdating?: boolean;
  onResendEmail?: () => void;
  isResendingEmail?: boolean;
}) {
  const statusLabel = getContactStatusLabel(contact.status);
  const createdAtLabel = formatContactDate(contact.createdAt);
  const canResendEmail = contact.notificationStatus !== "sent" && Boolean(onResendEmail);

  return (
    <div className="group rounded-[24px] border border-[#e8e8e8] bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display text-base font-semibold text-ink">{contact.buyerName}</p>
            <ContactStatusBadge status={contact.status} />
          </div>
          <p className="mt-0.5 text-sm font-medium text-stone">{contact.terreno.title}</p>
          <p className="mt-1 flex items-center gap-1 text-[11px] text-stone/70">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            {createdAtLabel}
          </p>
        </div>
      </div>

      <p className={`mt-3 rounded-[16px] bg-[#f8f8f8] p-3 text-sm leading-6 text-stone ${compact ? "line-clamp-2" : ""}`}>
        {contact.message}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
        <span className="inline-flex items-center gap-1 rounded-full bg-[#f0f0f0] px-2.5 py-1 text-stone">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
          {contact.buyerEmail}
        </span>
        {contact.buyerPhone && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#f0f0f0] px-2.5 py-1 text-stone">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            {contact.buyerPhone}
          </span>
        )}
        <Link
          href={`/terrenos/${contact.terreno.slug}`}
          className="inline-flex items-center gap-1 font-medium text-dash-accent transition hover:text-dash-accent/80"
        >
          Ver terreno
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>

      {/* Estado de notificación y acciones */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <ContactNotificationBadge status={contact.notificationStatus} />
        {contact.notificationStatus === "sent" && contact.notificationSentAt && (
          <span className="text-[11px] text-stone/70">
            {formatContactDate(contact.notificationSentAt)}
          </span>
        )}
        {contact.notificationStatus === "failed" && contact.notificationError && (
          <span className="text-[11px] text-dash-error">{contact.notificationError}</span>
        )}
        {canResendEmail && (
          <button
            type="button"
            onClick={onResendEmail}
            disabled={isResendingEmail}
            className="inline-flex items-center gap-1 rounded-full border border-[#e8e8e8] bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-ink transition-all duration-200 hover:border-dash-accent/30 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isResendingEmail ? (
              <>
                <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Reenviando...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                Reenviar email
              </>
            )}
          </button>
        )}
      </div>

      {/* Selector de estado */}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-full bg-[#f5f5f5] p-0.5">
          {(["pending", "read", "replied"] as const).map((statusOption) => (
            <button
              key={statusOption}
              type="button"
              onClick={() => onStatusChange?.(statusOption)}
              disabled={!onStatusChange || isUpdating}
              className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] transition-all duration-200 disabled:cursor-not-allowed ${
                contact.status === statusOption
                  ? statusOption === "pending"
                    ? "bg-amber-100 text-amber-700"
                    : statusOption === "read"
                    ? "bg-sky-100 text-sky-700"
                    : "bg-emerald-100 text-emerald-700"
                  : "bg-transparent text-stone hover:bg-white"
              }`}
            >
              {getContactStatusLabel(statusOption)}
            </button>
          ))}
        </div>
        {isUpdating && (
          <span className="inline-flex items-center gap-1 text-[11px] text-stone">
            <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Guardando...
          </span>
        )}
      </div>
    </div>
  );
}

function ContactStatusBadge({
  status,
}: {
  status: ContactRequest["status"];
}) {
  const styles =
    status === "pending"
      ? "bg-amber-100 text-amber-700"
      : status === "read"
        ? "bg-sky-100 text-sky-700"
        : "bg-emerald-100 text-emerald-700";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${styles}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${
        status === "pending" ? "bg-amber-500" : status === "read" ? "bg-sky-500" : "bg-emerald-500"
      }`} />
      {getContactStatusLabel(status)}
    </span>
  );
}

function ContactNotificationBadge({
  status,
}: {
  status: ContactRequest["notificationStatus"];
}) {
  const config =
    status === "sent"
      ? { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Email enviado" }
      : status === "failed"
        ? { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", label: "Email fallido" }
        : { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "Email pendiente" };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${config.bg} ${config.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

function getContactStatusLabel(status: ContactRequest["status"]) {
  if (status === "pending") return "Pendiente";
  if (status === "read") return "Leido";
  return "Respondido";
}

function formatContactDate(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

function StatusBadge({
  status,
}: {
  status: Terreno["status"];
}) {
  const config =
    status === "active"
      ? { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Activo" }
      : status === "paused"
        ? { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "Pausado" }
        : { bg: "bg-stone-100", text: "text-stone-700", dot: "bg-stone-500", label: "Vendido" };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${config.bg} ${config.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

function EmptyDashboardMessage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-[#e8e8e8] bg-[#faf9f8] p-5">
      <p className="font-display text-base font-semibold text-ink">{title}</p>
      <p className="mt-1.5 text-sm leading-6 text-stone">{description}</p>
    </div>
  );
}

function ContactCardSkeleton() {
  return (
    <div className="animate-pulse rounded-[30px] border border-white/80 bg-white/86 p-4 shadow-[0_16px_30px_rgba(15,23,42,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="h-4 w-32 rounded-full bg-sand" />
          <div className="h-4 w-40 rounded-full bg-sand/80" />
          <div className="h-3 w-24 rounded-full bg-sand/70" />
        </div>
        <div className="h-7 w-24 rounded-full bg-sand" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded-full bg-sand/80" />
        <div className="h-3 w-[92%] rounded-full bg-sand/70" />
        <div className="h-3 w-[70%] rounded-full bg-sand/70" />
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-6 w-24 rounded-full bg-sand/80" />
        <div className="h-6 w-28 rounded-full bg-sand/70" />
      </div>
    </div>
  );
}

function DashboardInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <label className="rounded-[20px] border border-[#e8e8e8] bg-white px-4 py-3 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-stone">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-transparent text-sm font-medium text-ink placeholder-stone/40 outline-none disabled:cursor-not-allowed disabled:opacity-50"
      />
    </label>
  );
}

function DashboardTextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="rounded-[20px] border border-[#e8e8e8] bg-white px-4 py-3 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-stone">
        {label}
      </span>
      <textarea
        rows={5}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full resize-none bg-transparent text-sm leading-7 text-ink placeholder-stone/40 outline-none"
      />
    </label>
  );
}
