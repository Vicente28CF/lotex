export type TerrenoImage = {
  id: string;
  imageUrl: string;
  order: number;
  isCover: boolean;
};

export type TerrenoOwner = {
  fullName: string;
  isVerified: boolean;
};

export type Terreno = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  municipio: string;
  estado: string;
  areaM2: number;
  areaLabel: string;
  price: number;
  priceLabel: string;
  status: "active" | "paused" | "sold";
  isFeatured: boolean;
  image: string | null;
  images: TerrenoImage[];
  viewsCount: number;
  address: string;
  latitude: number | null;
  longitude: number | null;
  owner: TerrenoOwner | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  isVerified: boolean;
  canPublish: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export type ContactRequestPayload = {
  terrenoSlug: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  message: string;
};

export type ContactRequest = {
  id: string;
  terreno: {
    title: string;
    slug: string;
  };
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  message: string;
  status: "pending" | "read" | "replied";
  notificationStatus: "pending" | "sent" | "failed";
  notificationSentAt: string | null;
  notificationError: string;
  createdAt: string;
};

export type SellerDashboardData = {
  terrenos: Terreno[];
  contacts: ContactRequest[];
};

export type CreateTerrenoPayload = {
  title: string;
  description: string;
  price: number;
  areaM2: number;
  municipio: string;
  estado: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  status: "active" | "paused" | "sold";
};

export type UpdateTerrenoPayload = CreateTerrenoPayload;

export type TerrenoImageInput = {
  cloudinaryUrl: string;
  cloudinaryId: string;
  order: number;
  isCover: boolean;
};
