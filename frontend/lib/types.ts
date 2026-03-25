export type Terreno = {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  municipio: string;
  estado: string;
  areaLabel: string;
  priceLabel: string;
  isFeatured: boolean;
  image: string;
};

export type AuthUser = {
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

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};
