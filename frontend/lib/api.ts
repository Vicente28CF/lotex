// lib/api.ts — capa de acceso a la API REST del backend

import type {
  AuthSession,
  AuthUser,
  ContactRequest,
  ContactRequestPayload,
  CreateTerrenoPayload,
  Terreno,
  TerrenoImageInput,
  UpdateTerrenoPayload,
} from "@/lib/types";

type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

type TerrenoListApi = {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  municipio: string;
  estado: string;
  area_m2: string;
  price: string;
  status: "active" | "paused" | "sold";
  is_featured: boolean;
  image: string | null;
};

type TerrenoDetailApi = {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: string;
  area_m2: string;
  municipio: string;
  estado: string;
  address: string;
  latitude: string | null;
  longitude: string | null;
  status: string;
  is_featured: boolean;
  views_count: number;
  images: Array<{
    id: string;
    image_url: string;
    order: number;
    is_cover: boolean;
  }>;
  owner: {
    full_name: string;
    is_verified: boolean;
  };
  created_at: string;
  updated_at: string;
};

type AuthUserApi = {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  is_verified: boolean;
  can_publish: boolean;
  created_at: string;
  updated_at: string;
};

type ContactRequestApi = {
  id: string;
  terreno: {
    title: string;
    slug: string;
  };
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  message: string;
  status: "pending" | "read" | "replied";
  notification_status: "pending" | "sent" | "failed";
  notification_sent_at: string | null;
  notification_error: string;
  created_at: string;
};

type LoginResponse = {
  user: AuthUser;
  tokens: {
    access: string;
    refresh: string;
  };
  non_field_errors?: string[];
  detail?: string;
};

type RefreshResponse = {
  access: string;
  refresh?: string;
  detail?: string;
};

type ApiErrorLike = {
  detail?: string;
  non_field_errors?: unknown;
  [key: string]: unknown;
};

export type AuthRequestOptions = {
  accessToken: string;
  refreshToken: string;
  onSessionUpdate?: (session: AuthSession) => void;
  onUnauthorized?: () => void;
  onRefreshStart?: () => void;
  onRefreshSuccess?: () => void;
  onRefreshFailure?: () => void;
};

export type ContactFilters = {
  status?: ContactRequest["status"] | "all";
  notificationStatus?: ContactRequest["notificationStatus"] | "all";
  search?: string;
  page?: number;
};

export type ContactListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ContactRequest[];
};

class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function getApiBaseUrl() {
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://localhost:8000/api";

  return rawBaseUrl.endsWith("/api")
    ? rawBaseUrl
    : `${rawBaseUrl.replace(/\/$/, "")}/api`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatArea(value: number) {
  return `${new Intl.NumberFormat("es-MX", {
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value)} m2`;
}

function toNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapAuthUser(item: AuthUserApi): AuthUser {
  return {
    id: item.id,
    email: item.email,
    fullName: item.full_name,
    phone: item.phone,
    role: item.role,
    isVerified: item.is_verified,
    canPublish: item.can_publish,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

function mapTerrenoList(item: TerrenoListApi): Terreno {
  const price = toNumber(item.price) ?? 0;
  const areaM2 = toNumber(item.area_m2) ?? 0;

  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    shortDescription: item.short_description,
    description: item.short_description,
    municipio: item.municipio,
    estado: item.estado,
    areaM2,
    areaLabel: formatArea(areaM2),
    price,
    priceLabel: formatCurrency(price),
    status: item.status,
    isFeatured: item.is_featured,
    image: item.image,
    images: [],
    viewsCount: 0,
    address: "",
    latitude: null,
    longitude: null,
    owner: null,
    createdAt: null,
    updatedAt: null,
  };
}

function mapTerrenoDetail(item: TerrenoDetailApi): Terreno {
  const price = toNumber(item.price) ?? 0;
  const areaM2 = toNumber(item.area_m2) ?? 0;

  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    shortDescription: item.description.slice(0, 140).trim(),
    description: item.description,
    municipio: item.municipio,
    estado: item.estado,
    areaM2,
    areaLabel: formatArea(areaM2),
    price,
    priceLabel: formatCurrency(price),
    status: item.status as "active" | "paused" | "sold",
    isFeatured: item.is_featured,
    image: item.images.find((image) => image.is_cover)?.image_url ?? item.images[0]?.image_url ?? null,
    images: item.images.map((image) => ({
      id: image.id,
      imageUrl: image.image_url,
      order: image.order,
      isCover: image.is_cover,
    })),
    viewsCount: item.views_count,
    address: item.address,
    latitude: toNumber(item.latitude),
    longitude: toNumber(item.longitude),
    owner: {
      fullName: item.owner.full_name,
      isVerified: item.owner.is_verified,
    },
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

function mapContactRequest(item: ContactRequestApi): ContactRequest {
  return {
    id: item.id,
    terreno: item.terreno,
    buyerName: item.buyer_name,
    buyerEmail: item.buyer_email,
    buyerPhone: item.buyer_phone,
    message: item.message,
    status: item.status,
    notificationStatus: item.notification_status,
    notificationSentAt: item.notification_sent_at,
    notificationError: item.notification_error,
    createdAt: item.created_at,
  };
}

async function readJsonResponse<T>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text) {
    return null;
  }

  return JSON.parse(text) as T;
}

function pickFirstMessage(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const message = pickFirstMessage(item);
      if (message) return message;
    }
  }

  if (value && typeof value === "object") {
    for (const item of Object.values(value)) {
      const message = pickFirstMessage(item);
      if (message) return message;
    }
  }

  return undefined;
}

function getErrorMessage(
  data: unknown,
  fallbackMessage: string,
  preferredKeys: string[] = [],
) {
  if (data && typeof data === "object") {
    const errorData = data as ApiErrorLike;

    for (const key of preferredKeys) {
      const preferredMessage = pickFirstMessage(errorData[key]);
      if (preferredMessage) {
        return preferredMessage;
      }
    }

    const commonMessage =
      pickFirstMessage(errorData.non_field_errors) ??
      pickFirstMessage(errorData.detail);

    if (commonMessage) {
      return commonMessage;
    }
  }

  return pickFirstMessage(data) ?? fallbackMessage;
}

async function requestJson<T>(
  path: string,
  init: RequestInit = {},
  {
    next,
    fallbackMessage,
    preferredErrorKeys = [],
  }: {
    next?: { revalidate: number };
    fallbackMessage: string;
    preferredErrorKeys?: string[];
  },
): Promise<T> {
  const response = await fetch(`${await getApiBaseUrl()}${path}`, {
    ...init,
    ...(next ? { next } : {}),
  });

  const data = await readJsonResponse<T>(response);

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(data, fallbackMessage, preferredErrorKeys),
      response.status,
      data,
    );
  }

  return data as T;
}

async function fetchCurrentUser(accessToken: string): Promise<AuthUser> {
  const data = await requestJson<AuthUserApi>(
    "/users/me/",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    },
    {
      fallbackMessage: "No se pudo recuperar la sesion actual.",
    },
  );
  return mapAuthUser(data);
}

export async function loginUser(credentials: {
  email: string;
  password: string;
}): Promise<AuthSession> {
  const data = await requestJson<LoginResponse>(
    "/auth/login/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    },
    {
      fallbackMessage: "No se pudo iniciar sesion.",
    },
  );

  return {
    accessToken: data.tokens.access,
    refreshToken: data.tokens.refresh,
    user: data.user,
  };
}

export async function refreshAuthSession(refreshToken: string): Promise<AuthSession | null> {
  try {
    const refreshData = await requestJson<RefreshResponse>(
      "/auth/token/refresh/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      },
      {
        fallbackMessage: "No se pudo refrescar la sesion.",
      },
    );

    const nextRefreshToken = refreshData.refresh ?? refreshToken;
    const user = await fetchCurrentUser(refreshData.access);

    return {
      accessToken: refreshData.access,
      refreshToken: nextRefreshToken,
      user,
    };
  } catch {
    return null;
  }
}

export async function logoutAuthSession(session: AuthSession): Promise<void> {
  try {
    await fetch(`${await getApiBaseUrl()}/auth/logout/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({ refresh: session.refreshToken }),
    });
  } catch {
    // Logout local siempre debe continuar aunque falle el backend.
  }
}

async function requestAuthenticatedJson<T>(
  path: string,
  auth: AuthRequestOptions,
  init: RequestInit,
  {
    fallbackMessage,
    preferredErrorKeys = [],
  }: {
    fallbackMessage: string;
    preferredErrorKeys?: string[];
  },
): Promise<T> {
  let currentAccessToken = auth.accessToken;
  let currentRefreshToken = auth.refreshToken;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${currentAccessToken}`);

    const response = await fetch(`${await getApiBaseUrl()}${path}`, {
      ...init,
      headers,
      cache: init.cache ?? "no-store",
    });

    const data = await readJsonResponse<T>(response);

    if (response.ok) {
      return data as T;
    }

    if (response.status === 401 && attempt === 0) {
      auth.onRefreshStart?.();
      const refreshedSession = await refreshAuthSession(currentRefreshToken);

      if (!refreshedSession) {
        auth.onRefreshFailure?.();
        auth.onUnauthorized?.();
        throw new ApiError("Tu sesion expiro. Vuelve a iniciar sesion.", 401, data);
      }

      currentAccessToken = refreshedSession.accessToken;
      currentRefreshToken = refreshedSession.refreshToken;
      auth.onSessionUpdate?.(refreshedSession);
      auth.onRefreshSuccess?.();
      continue;
    }

    throw new ApiError(
      getErrorMessage(data, fallbackMessage, preferredErrorKeys),
      response.status,
      data,
    );
  }

  throw new ApiError(fallbackMessage, 500, null);
}

export async function fetchTerrenos(page = 1) {
  const path = page > 1 ? `/terrenos/?page=${page}` : "/terrenos/";
  const response = await requestJson<PaginatedResponse<TerrenoListApi>>(
    path,
    {},
    {
      next: { revalidate: 60 },
      fallbackMessage: "No se pudieron cargar los terrenos.",
    },
  );

  return {
    ...response,
    results: response.results.map(mapTerrenoList),
  };
}

export async function fetchTerrenoBySlug(slug: string) {
  const response = await requestJson<TerrenoDetailApi>(
    `/terrenos/${slug}/`,
    {},
    {
      next: { revalidate: 60 },
      fallbackMessage: "No se pudo cargar el terreno.",
    },
  );

  return mapTerrenoDetail(response);
}

export async function createContactRequest(payload: ContactRequestPayload, auth: AuthRequestOptions) {
  const response = await requestAuthenticatedJson<ContactRequestApi>(
    "/contact-requests/",
    auth,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        terreno_slug: payload.terrenoSlug,
        buyer_name: payload.buyerName,
        buyer_email: payload.buyerEmail,
        buyer_phone: payload.buyerPhone,
        message: payload.message,
      }),
    },
    {
      fallbackMessage: "No se pudo enviar la solicitud de contacto.",
      preferredErrorKeys: ["message"],
    },
  );

  return mapContactRequest(response);
}

export async function fetchMyTerrenos(auth: AuthRequestOptions) {
  const response = await requestAuthenticatedJson<PaginatedResponse<TerrenoListApi>>(
    "/terrenos/mine/",
    auth,
    {
      method: "GET",
    },
    {
      fallbackMessage: "No se pudieron cargar tus terrenos.",
    },
  );

  return response.results.map(mapTerrenoList);
}

export async function fetchReceivedContacts(auth: AuthRequestOptions) {
  return fetchReceivedContactsWithFilters(auth);
}

export async function fetchReceivedContactsWithFilters(
  auth: AuthRequestOptions,
  filters: ContactFilters = {},
): Promise<ContactListResponse> {
  const params = new URLSearchParams();

  if (filters.status && filters.status !== "all") {
    params.set("status", filters.status);
  }

  if (filters.notificationStatus && filters.notificationStatus !== "all") {
    params.set("notification_status", filters.notificationStatus);
  }

  const trimmedSearch = filters.search?.trim();
  if (trimmedSearch) {
    params.set("search", trimmedSearch);
  }

  if (filters.page && filters.page > 1) {
    params.set("page", String(filters.page));
  }

  const path = params.toString()
    ? `/contact-requests/?${params.toString()}`
    : "/contact-requests/";

  const response = await requestAuthenticatedJson<PaginatedResponse<ContactRequestApi>>(
    path,
    auth,
    {
      method: "GET",
    },
    {
      fallbackMessage: "No se pudieron cargar los contactos.",
    },
  );

  return {
    count: response.count,
    next: response.next,
    previous: response.previous,
    results: response.results.map(mapContactRequest),
  };
}

export async function resendContactRequestEmail(id: string, auth: AuthRequestOptions) {
  const response = await requestAuthenticatedJson<ContactRequestApi>(
    `/contact-requests/${id}/resend-email/`,
    auth,
    {
      method: "POST",
    },
    {
      fallbackMessage: "No se pudo reenviar la notificacion del contacto.",
    },
  );

  return mapContactRequest(response);
}

export async function updateContactRequestStatus(
  id: string,
  status: ContactRequest["status"],
  auth: AuthRequestOptions,
) {
  const response = await requestAuthenticatedJson<ContactRequestApi>(
    `/contact-requests/${id}/`,
    auth,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    },
    {
      fallbackMessage: "No se pudo actualizar el estado del contacto.",
      preferredErrorKeys: ["status"],
    },
  );

  return mapContactRequest(response);
}

export async function createTerreno(payload: CreateTerrenoPayload, auth: AuthRequestOptions) {
  const response = await requestAuthenticatedJson<TerrenoDetailApi>(
    "/terrenos/",
    auth,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: payload.title,
        description: payload.description,
        price: payload.price,
        area_m2: payload.areaM2,
        municipio: payload.municipio,
        estado: payload.estado,
        address: payload.address ?? "",
        latitude: payload.latitude ?? null,
        longitude: payload.longitude ?? null,
        status: payload.status,
      }),
    },
    {
      fallbackMessage: "No se pudo crear el terreno.",
    },
  );

  return mapTerrenoDetail(response);
}

export async function fetchOwnedTerrenoBySlug(slug: string, auth: AuthRequestOptions) {
  const response = await requestAuthenticatedJson<TerrenoDetailApi>(
    `/terrenos/${slug}/`,
    auth,
    {
      method: "GET",
    },
    {
      fallbackMessage: "No se pudo cargar el terreno.",
    },
  );

  return mapTerrenoDetail(response);
}

export async function updateTerreno(
  slug: string,
  payload: UpdateTerrenoPayload,
  auth: AuthRequestOptions,
) {
  const response = await requestAuthenticatedJson<TerrenoDetailApi>(
    `/terrenos/${slug}/`,
    auth,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: payload.title,
        description: payload.description,
        price: payload.price,
        area_m2: payload.areaM2,
        municipio: payload.municipio,
        estado: payload.estado,
        address: payload.address ?? "",
        latitude: payload.latitude ?? null,
        longitude: payload.longitude ?? null,
        status: payload.status,
      }),
    },
    {
      fallbackMessage: "No se pudo actualizar el terreno.",
    },
  );

  return mapTerrenoDetail(response);
}

export async function updateTerrenoImages(
  slug: string,
  images: TerrenoImageInput[],
  auth: AuthRequestOptions,
) {
  const response = await requestAuthenticatedJson<TerrenoDetailApi>(
    `/terrenos/${slug}/images/`,
    auth,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        images: images.map((image) => ({
          cloudinary_url: image.cloudinaryUrl,
          cloudinary_id: image.cloudinaryId,
          order: image.order,
          is_cover: image.isCover,
        })),
      }),
    },
    {
      fallbackMessage: "No se pudieron guardar las imagenes.",
    },
  );

  return mapTerrenoDetail(response);
}

export async function manageTerrenoImages(
  slug: string,
  images: Array<{ id: string; order: number; isCover: boolean }>,
  auth: AuthRequestOptions,
) {
  const response = await requestAuthenticatedJson<TerrenoDetailApi>(
    `/terrenos/${slug}/images/manage/`,
    auth,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        images: images.map((image) => ({
          id: image.id,
          order: image.order,
          is_cover: image.isCover,
        })),
      }),
    },
    {
      fallbackMessage: "No se pudo actualizar la galeria del terreno.",
      preferredErrorKeys: ["images"],
    },
  );

  return mapTerrenoDetail(response);
}

export async function deleteTerrenoImage(
  slug: string,
  imageId: string,
  auth: AuthRequestOptions,
) {
  const response = await requestAuthenticatedJson<TerrenoDetailApi>(
    `/terrenos/${slug}/images/manage/`,
    auth,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image_id: imageId }),
    },
    {
      fallbackMessage: "No se pudo eliminar la imagen.",
      preferredErrorKeys: ["image_id"],
    },
  );

  return mapTerrenoDetail(response);
}

export async function uploadTerrenoImages(
  slug: string,
  files: File[],
  auth: AuthRequestOptions,
) {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  const response = await requestAuthenticatedJson<TerrenoDetailApi>(
    `/terrenos/${slug}/upload-images/`,
    auth,
    {
      method: "POST",
      body: formData,
    },
    {
      fallbackMessage: "No se pudieron subir las imagenes.",
      preferredErrorKeys: ["images"],
    },
  );

  return mapTerrenoDetail(response);
}