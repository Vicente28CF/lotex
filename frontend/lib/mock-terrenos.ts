import type { Terreno } from "@/lib/types";

export const terrenosMock: Terreno[] = [
  {
    slug: "terreno-zapopan-bosque",
    title: "Terreno residencial cerca del bosque",
    shortDescription: "Frente amplio, zona premium y acceso rapido a vialidades principales.",
    description:
      "Un lote pensado para quien quiere construir con plusvalia desde el primer dia, cerca de servicios y corredores residenciales de alta demanda.",
    municipio: "Zapopan",
    estado: "Jalisco",
    areaLabel: "320 m2",
    priceLabel: "1,890,000",
    isFeatured: true,
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"
  },
  {
    slug: "terreno-tlajomulco-esquina",
    title: "Terreno en esquina para inversion",
    shortDescription: "Buena configuracion para vivienda o proyecto pequeno con doble frente.",
    description:
      "Alternativa solida para inversionistas que buscan costo de entrada mas eficiente en una zona con crecimiento sostenido.",
    municipio: "Tlajomulco",
    estado: "Jalisco",
    areaLabel: "240 m2",
    priceLabel: "980,000",
    isFeatured: false,
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"
  },
  {
    slug: "terreno-tonala-comercial",
    title: "Lote comercial sobre avenida",
    shortDescription: "Visibilidad alta y flujo vehicular para proyecto mixto o comercial.",
    description:
      "Con metraje suficiente para desarrollar desde bodega hasta local comercial, en un punto que ya tiene movimiento constante.",
    municipio: "Tonala",
    estado: "Jalisco",
    areaLabel: "410 m2",
    priceLabel: "2,450,000",
    isFeatured: true,
    image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80"
  },
  {
    slug: "terreno-tlaquepaque-familiar",
    title: "Terreno listo para vivienda familiar",
    shortDescription: "Entorno tranquilo y buena relacion precio por metro cuadrado.",
    description:
      "Una opcion pensada para quienes quieren construir casa propia en una ubicacion conectada y sin sobrepagar.",
    municipio: "Tlaquepaque",
    estado: "Jalisco",
    areaLabel: "180 m2",
    priceLabel: "760,000",
    isFeatured: false,
    image:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80"
  }
];
