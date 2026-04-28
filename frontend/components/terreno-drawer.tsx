"use client";

import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";

import {
  type AuthRequestOptions,
  createTerreno,
  deleteTerrenoImage,
  manageTerrenoImages,
  uploadTerrenoImages,
  fetchOwnedTerrenoBySlug,
  updateTerreno,
} from "@/lib/api";
import { MUNICIPIOS_JALISCO } from "@/lib/municipios-jalisco";
import type {
  Terreno,
  TerrenoImage,
  CreateTerrenoPayload,
  UpdateTerrenoPayload,
} from "@/lib/types";

const NEARBY_SERVICES = [
  { id: "tienda", label: "Tienda", emoji: "🛒" },
  { id: "farmacia", label: "Farmacia", emoji: "💊" },
  { id: "escuela", label: "Escuela", emoji: "🏫" },
  { id: "iglesia", label: "Iglesia", emoji: "⛪" },
  { id: "transporte", label: "Transporte", emoji: "🚌" },
  { id: "agua", label: "Agua potable", emoji: "💧" },
  { id: "luz", label: "Electricidad", emoji: "⚡" },
  { id: "drenaje", label: "Drenaje", emoji: "🔧" },
  { id: "internet", label: "Internet", emoji: "📶" },
  { id: "banco", label: "Banco/Cajero", emoji: "🏦" },
  { id: "hospital", label: "Hospital/Clínica", emoji: "🏥" },
  { id: "mercado", label: "Mercado", emoji: "🏪" },
];

const TERRENO_TYPES = [
  { id: "habitacional", label: "Habitacional", emoji: "🏡", desc: "Para construir casa" },
  { id: "comercial", label: "Comercial", emoji: "🏪", desc: "Para negocio o local" },
  { id: "agricola", label: "Agrícola", emoji: "🌾", desc: "Para cultivo o rancho" },
  { id: "mixto", label: "Mixto", emoji: "🏘️", desc: "Uso combinado" },
];

const STEPS_CREATE = [
  { id: "fotos", emoji: "📸", label: "Fotos", title: "Agrega fotos de tu terreno", subtitle: "Las fotos generan más interés. Sube de 1 a 10 imágenes." },
  { id: "basicos", emoji: "📋", label: "Datos", title: "Datos principales", subtitle: "La información clave que buscan los compradores." },
  { id: "ubicacion", emoji: "🗺️", label: "Ubicación", title: "¿Dónde está tu terreno?", subtitle: "Ayuda a que te encuentren más fácil." },
  { id: "extras", emoji: "✨", label: "Extras", title: "Añade más valor a tu terreno", subtitle: "Los servicios cercanos aumentan el interés." },
];

const STEPS_EDIT = [
  { id: "informacion", emoji: "📋", label: "Info", title: "Información del terreno", subtitle: "Edita los datos principales." },
  { id: "ubicacion", emoji: "🗺️", label: "Ubicación", title: "Ubicación y descripción", subtitle: "Edita la ubicación y detalles." },
  { id: "galeria", emoji: "📸", label: "Fotos", title: "Gestiona las fotos", subtitle: "Administra las imágenes de tu terreno." },
];

function MunicipioCombobox({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);

  const filtered = query.length >= 1
    ? MUNICIPIOS_JALISCO.filter((m) =>
        m.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : MUNICIPIOS_JALISCO.slice(0, 8);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        placeholder="Ej. Zacoalco de Torres"
        className="w-full rounded-2xl border border-line/80 bg-white px-4 py-3 text-sm font-medium text-ink placeholder-stone/40 outline-none transition focus:border-coral/50 min-h-[52px]"
      />
      {isOpen && filtered.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-2xl border border-line/60 bg-white shadow-xl">
          {filtered.map((municipio) => (
            <button
              key={municipio}
              type="button"
              onMouseDown={() => {
                setQuery(municipio);
                onChange(municipio);
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-ink hover:bg-sand transition"
            >
              <svg className="h-4 w-4 flex-shrink-0 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              </svg>
              {municipio}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

type TerrainFormValue = {
  title: string;
  description: string;
  price: string;
  areaM2: string;
  municipio: string;
  estado: string;
  address: string;
  latitude: string;
  longitude: string;
  status: "active" | "paused" | "sold";
  nearbyServices: string[];
  terrenoType: string;
};

type PendingUploadImage = {
  id: string;
  file: File;
  previewUrl: string;
};

type TerrenoDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  terrenoSlug: string | null;
  auth: AuthRequestOptions | null;
  onSave: (terreno: Terreno) => void;
  onNotify: (type: "success" | "error", message: string) => void;
};

const EMPTY_FORM: TerrainFormValue = {
  title: "",
  description: "",
  price: "",
  areaM2: "",
  municipio: "",
  estado: "Jalisco",
  address: "",
  latitude: "",
  longitude: "",
  status: "active",
  nearbyServices: [],
  terrenoType: "",
};

export function TerrenoDrawer({
  isOpen,
  onClose,
  mode,
  terrenoSlug,
  auth,
  onSave,
  onNotify,
}: TerrenoDrawerProps) {
  const [form, setForm] = useState<TerrainFormValue>(EMPTY_FORM);
  const [terrainImages, setTerrainImages] = useState<TerrenoImage[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<PendingUploadImage[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isManagingImages, setIsManagingImages] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [priceDisplay, setPriceDisplay] = useState("");
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "found" | "not_found">("idle");
  const geocodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const steps = mode === "create" ? STEPS_CREATE : STEPS_EDIT;

  useEffect(() => {
    async function loadTerreno() {
      if (!auth || !terrenoSlug || mode !== "edit") {
        if (mode === "create") {
          setForm(EMPTY_FORM);
          setTerrainImages([]);
          setSelectedFiles([]);
          setIsDirty(false);
          setCurrentStep(0);
        }
        return;
      }

      setIsLoading(true);
      setStepError(null);

      try {
        const terreno = await fetchOwnedTerrenoBySlug(terrenoSlug, auth);
        setForm({
          title: terreno.title,
          description: terreno.description,
          price: String(terreno.price),
          areaM2: String(terreno.areaM2),
          municipio: terreno.municipio,
          estado: terreno.estado,
          address: terreno.address,
          latitude: terreno.latitude ? String(terreno.latitude) : "",
          longitude: terreno.longitude ? String(terreno.longitude) : "",
          status: terreno.status,
          nearbyServices: terreno.nearbyServices ?? [],
          terrenoType: terreno.terrainType ?? "",
        });
        setTerrainImages(terreno.images);
        setSelectedFiles([]);
        setIsDirty(false);
        setCurrentStep(0);
      } catch (err) {
        setStepError(err instanceof Error ? err.message : "No se pudo cargar el terreno.");
      } finally {
        setIsLoading(false);
      }
    }

    if (isOpen) {
      void loadTerreno();
    }
  }, [isOpen, auth, terrenoSlug, mode]);

  useEffect(() => {
    return () => {
      selectedFiles.forEach((file) => {
        URL.revokeObjectURL(file.previewUrl);
      });
    };
  }, []);

  function handleFormChange(field: keyof TerrainFormValue, value: string | string[]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }

  function handlePriceChange(raw: string) {
    const numeric = raw.replace(/\D/g, "");
    handleFormChange("price", numeric);
    if (numeric) {
      setPriceDisplay(new Intl.NumberFormat("es-MX").format(Number(numeric)));
    } else {
      setPriceDisplay("");
    }
  }

  async function geocodeAddress(address: string, municipio: string) {
    if (!address.trim() && !municipio.trim()) return;

    const query = [address, municipio, "Jalisco", "México"].filter(Boolean).join(", ");

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=mx`,
        { headers: { "User-Agent": "Terrify/1.0 (terrify.mx)" } }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        handleFormChange("latitude", parseFloat(data[0].lat).toFixed(6));
        handleFormChange("longitude", parseFloat(data[0].lon).toFixed(6));
        setGeoStatus("found");
      } else {
        setGeoStatus("not_found");
      }
    } catch {
      setGeoStatus("not_found");
    }
  }

  function handleAddressChange(value: string) {
    handleFormChange("address", value);
    setGeoStatus("loading");

    if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);
    geocodeTimerRef.current = setTimeout(() => {
      void geocodeAddress(value, form.municipio);
    }, 800);
  }

  function toggleNearbyService(serviceId: string) {
    setForm((prev) => {
      const current = prev.nearbyServices;
      const next = current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId];
      return { ...prev, nearbyServices: next };
    });
    setIsDirty(true);
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
    setIsDirty(true);
  }

  function handleRemovePendingFile(fileId: string) {
    setSelectedFiles((current) => {
      const fileToRemove = current.find((item) => item.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return current.filter((item) => item.id !== fileId);
    });
    setIsDirty(true);
  }

  function handleCoverSelect(imageId: string) {
    const nextImages = terrainImages.map((image) => ({
      ...image,
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
    void handleGalleryChange(nextImages);
  }

  async function handleGalleryChange(nextImages: TerrenoImage[]) {
    if (!auth || !terrenoSlug) return;

    setIsManagingImages(true);
    try {
      const terreno = await manageTerrenoImages(
        terrenoSlug,
        nextImages.map((image, index) => ({
          id: image.id,
          order: index,
          isCover: image.isCover,
        })),
        auth,
      );
      setTerrainImages(terreno.images);
      onSave(terreno);
    } catch (err) {
      onNotify("error", err instanceof Error ? err.message : "No se pudo actualizar la galería.");
    } finally {
      setIsManagingImages(false);
    }
  }

  async function handleDeleteImage(imageId: string) {
    if (!auth || !terrenoSlug) return;

    if (terrainImages.length <= 1 && selectedFiles.length === 0) {
      onNotify("error", "Debes conservar al menos una imagen.");
      return;
    }

    if (!window.confirm("Eliminar esta imagen?")) return;

    setIsManagingImages(true);
    try {
      const terreno = await deleteTerrenoImage(terrenoSlug, imageId, auth);
      setTerrainImages(terreno.images);
      onSave(terreno);
      onNotify("success", "Imagen eliminada.");
    } catch (err) {
      onNotify("error", err instanceof Error ? err.message : "No se pudo eliminar la imagen.");
    } finally {
      setIsManagingImages(false);
    }
  }

  async function handleSaveImages() {
    if (!auth || !terrenoSlug || selectedFiles.length === 0) return;

    setIsManagingImages(true);
    try {
      const terreno = await uploadTerrenoImages(
        terrenoSlug,
        selectedFiles.map((item) => item.file),
        auth,
      );
      setTerrainImages(terreno.images);
      setSelectedFiles([]);
      onSave(terreno);
      onNotify("success", "Imágenes guardadas.");
    } catch (err) {
      onNotify("error", err instanceof Error ? err.message : "No se pudieron guardar las imágenes.");
    } finally {
      setIsManagingImages(false);
    }
  }

  function validateStep(): string | null {
    if (mode === "create") {
      if (currentStep === 0 && selectedFiles.length === 0) {
        return "Sube al menos una foto para continuar.";
      }
      if (currentStep === 1) {
        if (!form.title.trim()) return "El título es obligatorio.";
        if (Number(form.price) <= 0) return "El precio debe ser mayor a cero.";
        if (Number(form.areaM2) <= 0) return "El área debe ser mayor a cero.";
        if (!form.municipio.trim()) return "El municipio es obligatorio.";
      }
      if (currentStep === 2) {
        if (!form.estado.trim()) return "El estado es obligatorio.";
      }
    } else {
      if (currentStep === 0) {
        if (!form.title.trim()) return "El título es obligatorio.";
        if (Number(form.price) <= 0) return "El precio debe ser mayor a cero.";
        if (Number(form.areaM2) <= 0) return "El área debe ser mayor a cero.";
        if (!form.municipio.trim()) return "El municipio es obligatorio.";
      }
    }
    return null;
  }

  function handleNextStep() {
    const error = validateStep();
    if (error) {
      setStepError(error);
      return;
    }
    setStepError(null);
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  }

  function handlePrevStep() {
    setStepError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }

  async function handleSubmit() {
    const error = validateStep();
    if (error) {
      setStepError(error);
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
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
      nearbyServices: form.nearbyServices,
      terrainType: form.terrenoType,
    };

    setIsSaving(true);
    setStepError(null);

    try {
      let savedTerreno: Terreno;

      if (mode === "edit" && terrenoSlug) {
        savedTerreno = await updateTerreno(terrenoSlug, payload, auth!);

        if (selectedFiles.length > 0) {
          const updated = await uploadTerrenoImages(
            terrenoSlug,
            selectedFiles.map((item) => item.file),
            auth!,
          );
          savedTerreno = updated;
        }
      } else {
        savedTerreno = await createTerreno(payload, auth!);

        if (selectedFiles.length > 0) {
          savedTerreno = await uploadTerrenoImages(
            savedTerreno.slug,
            selectedFiles.map((item) => item.file),
            auth!,
          );
        }
      }

      onSave(savedTerreno);
      onNotify("success", mode === "edit" ? "Terreno actualizado." : "Terreno publicado.");
      setIsDirty(false);
      onClose();
    } catch (err) {
      setStepError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleClose() {
    if (isDirty && !window.confirm("Tienes cambios sin guardar. ¿Cerrar de todos modos?")) {
      return;
    }
    setForm(EMPTY_FORM);
    setTerrainImages([]);
    setSelectedFiles([]);
    setStepError(null);
    setIsDirty(false);
    setCurrentStep(0);
    onClose();
  }

  function renderStepContent() {
    if (mode === "create") {
      return renderCreateStep();
    } else {
      return renderEditStep();
    }
  }

  function renderCreateStep() {
    switch (currentStep) {
      case 0:
        return renderStepFotos();
      case 1:
        return renderStepBasicos();
      case 2:
        return renderStepUbicacion();
      case 3:
        return renderStepExtras();
      default:
        return null;
    }
  }

  function renderEditStep() {
    switch (currentStep) {
      case 0:
        return renderStepInfo();
      case 1:
        return renderStepUbicacion();
      case 2:
        return renderStepGaleria();
      default:
        return null;
    }
  }

  function renderStepFotos() {
    return (
      <div className="space-y-4">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone">
            {(mode === "edit" ? terrainImages.length : 0) + selectedFiles.length} imágenes seleccionadas
          </p>

          {mode === "edit" && terrainImages.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {terrainImages.map((image, index) => (
                <div key={image.id} className="overflow-hidden rounded-2xl border border-line/80 bg-white">
                  <div className="relative aspect-[4/3] bg-sand">
                    <img src={image.imageUrl} alt={`Imagen ${index + 1}`} className="h-full w-full object-cover" />
                    {image.isCover && (
                      <span className="absolute left-2 top-2 rounded-full bg-coral px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                        Portada
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 p-3">
                    <button
                      type="button"
                      onClick={() => handleMoveImage(image.id, "left")}
                      disabled={isManagingImages || index === 0}
                      className="rounded-full border border-line/80 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-ink transition hover:bg-sand disabled:opacity-50"
                    >
                      ← Subir
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveImage(image.id, "right")}
                      disabled={isManagingImages || index === terrainImages.length - 1}
                      className="rounded-full border border-line/80 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-ink transition hover:bg-sand disabled:opacity-50"
                    >
                      Bajar →
                    </button>
                    {!image.isCover && (
                      <button
                        type="button"
                        onClick={() => handleCoverSelect(image.id)}
                        disabled={isManagingImages}
                        className="rounded-full bg-sand px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-ink transition hover:bg-sand/80 disabled:opacity-50"
                      >
                        Portada
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => void handleDeleteImage(image.id)}
                      disabled={isManagingImages || (terrainImages.length <= 1 && selectedFiles.length === 0)}
                      className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line/60 bg-sand/50 px-6 py-8 text-center transition hover:border-coral/40 hover:bg-sand">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => handlePendingFilesChange(e.target.files)}
          />
          <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-white shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-stone" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-ink">Subir imágenes</span>
          <span className="mt-1 text-xs text-stone">JPG, PNG o WEBP. Máx 5 MB</span>
        </label>

        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone">
              Por subir ({selectedFiles.length})
            </p>
            {selectedFiles.map((item, index) => (
              <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-line/80 bg-white p-3">
                <div className="h-14 w-14 overflow-hidden rounded-xl bg-sand">
                  <img src={item.previewUrl} alt={item.file.name} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">
                    {item.file.name}
                    {index === 0 && terrainImages.length === 0 && (
                      <span className="ml-2 text-coral">(portada)</span>
                    )}
                  </p>
                  <p className="text-xs text-stone">{(item.file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemovePendingFile(item.id)}
                  className="rounded-full border border-line/80 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone transition hover:bg-sand"
                >
                  Quitar
                </button>
              </div>
            ))}

            {mode === "edit" && selectedFiles.length > 0 && (
              <button
                type="button"
                onClick={() => void handleSaveImages()}
                disabled={isManagingImages}
                className="w-full rounded-2xl border border-line/80 bg-sand px-4 py-3 text-sm font-semibold text-ink transition hover:bg-sand/80 disabled:opacity-50"
              >
                {isManagingImages ? "Subiendo..." : "Subir imágenes"}
              </button>
            )}
          </div>
        )}

        <div className="rounded-2xl bg-sand px-4 py-3 text-sm text-stone">
          💡 <strong>Tip:</strong> Los terrenos con más de 3 fotos reciben 3x más contactos.
        </div>
      </div>
    );
  }

  function renderStepBasicos() {
    const pricePerM2 = form.price && form.areaM2 && Number(form.areaM2) > 0
      ? Number(form.price) / Number(form.areaM2)
      : 0;

    return (
      <div className="space-y-5">
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone">Título *</span>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleFormChange("title", e.target.value)}
              placeholder="Ej. Terreno en esquina, zona residencial"
              className="w-full min-h-[52px] rounded-2xl border border-line/80 bg-white px-4 py-3 text-base text-ink placeholder-stone/40 outline-none transition focus:border-coral/50"
              required
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone">Precio (MXN) *</span>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-stone">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={priceDisplay}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  placeholder="1,250,000"
                  className="w-full min-h-[52px] rounded-2xl border border-line/80 bg-white py-3 pl-8 pr-4 text-base font-semibold text-ink placeholder-stone/40 outline-none transition focus:border-coral/50"
                  required
                />
              </div>
              {pricePerM2 > 0 && (
                <p className="mt-1.5 text-xs text-emerald-600 font-medium">
                  💡 {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(pricePerM2)} por m²
                </p>
              )}
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone">Área (m²) *</span>
              <input
                type="number"
                value={form.areaM2}
                onChange={(e) => handleFormChange("areaM2", e.target.value)}
                placeholder="250"
                className="w-full min-h-[52px] rounded-2xl border border-line/80 bg-white px-4 py-3 text-base text-ink placeholder-stone/40 outline-none transition focus:border-coral/50"
                required
                min="1"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone">Municipio *</span>
            <MunicipioCombobox
              value={form.municipio}
              onChange={(val) => handleFormChange("municipio", val)}
            />
          </label>
        </div>

        <div className="rounded-2xl bg-sand px-4 py-3 text-sm text-stone">
          💡 <strong>Tip:</strong> Puedes cambiar el precio después de publicar.
        </div>
      </div>
    );
  }

  function renderStepUbicacion() {
    return (
      <div className="space-y-5">
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone">Estado</span>
            <input
              type="text"
              value={form.estado}
              onChange={(e) => handleFormChange("estado", e.target.value)}
              placeholder="Jalisco"
              className="w-full min-h-[52px] rounded-2xl border border-line/80 bg-white px-4 py-3 text-base text-ink placeholder-stone/40 outline-none transition focus:border-coral/50"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone">Dirección de referencia</span>
            <div className="relative">
              <input
                type="text"
                value={form.address}
                onChange={(e) => handleAddressChange(e.target.value)}
                placeholder="Ej. Calle Hidalgo 45, Col. Centro"
                className="w-full min-h-[52px] rounded-2xl border border-line/80 bg-white px-4 py-3 pr-10 text-base text-ink placeholder-stone/40 outline-none transition focus:border-coral/50"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {geoStatus === "loading" && (
                  <svg className="h-4 w-4 animate-spin text-stone" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {geoStatus === "found" && (
                  <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {geoStatus === "not_found" && (
                  <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
                  </svg>
                )}
              </div>
            </div>
            {geoStatus === "found" && (
              <p className="mt-1.5 text-xs text-emerald-600 font-medium">✓ Ubicación encontrada — se mostrará en el mapa</p>
            )}
            {geoStatus === "not_found" && (
              <p className="mt-1.5 text-xs text-amber-600">No encontramos la ubicación exacta. Se usará el municipio como referencia.</p>
            )}
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone">Descripción</span>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => handleFormChange("description", e.target.value)}
              placeholder="Describe la ubicación, oportunidades, uso recomendado..."
              className="w-full resize-none rounded-2xl border border-line/80 bg-white px-4 py-3 text-base text-ink placeholder-stone/40 outline-none transition focus:border-coral/50"
            />
          </label>
        </div>
      </div>
    );
  }

  function renderStepExtras() {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone">Tipo de terreno</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {TERRENO_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => handleFormChange("terrenoType", type.id)}
                className={`flex flex-col items-start rounded-2xl border p-4 text-left transition-all ${
                  form.terrenoType === type.id
                    ? "border-coral bg-coral/5 shadow-md"
                    : "border-line/60 bg-white hover:border-coral/30"
                }`}
              >
                <span className="text-2xl">{type.emoji}</span>
                <span className="mt-2 font-semibold text-ink">{type.label}</span>
                <span className="text-xs text-stone">{type.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone">Servicios cercanos</span>
            <span className="block text-xs text-stone">Selecciona los que están cerca</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {NEARBY_SERVICES.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => toggleNearbyService(service.id)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  form.nearbyServices.includes(service.id)
                    ? "bg-coral text-white shadow-md scale-[1.02]"
                    : "bg-white border border-line/60 text-stone hover:border-coral/40 hover:text-ink"
                }`}
              >
                <span>{service.emoji}</span>
                {service.label}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone">Estado de publicación</span>
          <select
            value={form.status}
            onChange={(e) => handleFormChange("status", e.target.value as TerrainFormValue["status"])}
            className="w-full min-h-[52px] rounded-2xl border border-line/80 bg-white px-4 py-3 text-base text-ink outline-none transition focus:border-coral/50"
          >
            <option value="active">Activo - Visible para todos</option>
            <option value="paused">Pausado - Temporalmente oculto</option>
          </select>
        </label>

        <div className="rounded-2xl bg-sand px-4 py-3 text-sm text-stone">
          💡 <strong>Tip:</strong> Los terrenos con servicios marcados aparecen primero en las búsquedas.
        </div>
      </div>
    );
  }

  function renderStepInfo() {
    const pricePerM2 = form.price && form.areaM2 && Number(form.areaM2) > 0
      ? Number(form.price) / Number(form.areaM2)
      : 0;

    return (
      <div className="space-y-5">
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone">Título *</span>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleFormChange("title", e.target.value)}
              placeholder="Ej. Terreno en esquina, zona residencial"
              className="w-full min-h-[52px] rounded-2xl border border-line/80 bg-white px-4 py-3 text-base text-ink placeholder-stone/40 outline-none transition focus:border-coral/50"
              required
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone">Precio (MXN) *</span>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-stone">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={priceDisplay}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  placeholder="1,250,000"
                  className="w-full min-h-[52px] rounded-2xl border border-line/80 bg-white py-3 pl-8 pr-4 text-base font-semibold text-ink placeholder-stone/40 outline-none transition focus:border-coral/50"
                  required
                />
              </div>
              {pricePerM2 > 0 && (
                <p className="mt-1.5 text-xs text-emerald-600 font-medium">
                  💡 {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(pricePerM2)} por m²
                </p>
              )}
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone">Área (m²) *</span>
              <input
                type="number"
                value={form.areaM2}
                onChange={(e) => handleFormChange("areaM2", e.target.value)}
                placeholder="250"
                className="w-full min-h-[52px] rounded-2xl border border-line/80 bg-white px-4 py-3 text-base text-ink placeholder-stone/40 outline-none transition focus:border-coral/50"
                required
                min="1"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone">Municipio *</span>
              <MunicipioCombobox
                value={form.municipio}
                onChange={(val) => handleFormChange("municipio", val)}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone">Estado</span>
              <input
                type="text"
                value={form.estado}
                onChange={(e) => handleFormChange("estado", e.target.value)}
                placeholder="Jalisco"
                className="w-full min-h-[52px] rounded-2xl border border-line/80 bg-white px-4 py-3 text-base text-ink placeholder-stone/40 outline-none transition focus:border-coral/50"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone">Estado de publicación</span>
            <select
              value={form.status}
              onChange={(e) => handleFormChange("status", e.target.value as TerrainFormValue["status"])}
              className="w-full min-h-[52px] rounded-2xl border border-line/80 bg-white px-4 py-3 text-base text-ink outline-none transition focus:border-coral/50"
            >
              <option value="active">Activo - Visible para todos</option>
              <option value="paused">Pausado - Temporalmente oculto</option>
            </select>
          </label>
        </div>
      </div>
    );
  }

  function renderStepGaleria() {
    return renderStepFotos();
  }

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-ink/50 backdrop-blur-sm" onClick={handleClose} />

      <div className="fixed right-0 top-0 bottom-0 z-50 flex w-full max-w-lg flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-line/70 px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-ink">
              {mode === "edit" ? "Editar terreno" : "Publicar terreno"}
            </h2>
            <p className="text-sm text-stone">
              {mode === "edit" ? "Actualiza la información" : "Completa los datos del terreno"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-2 text-stone transition hover:bg-sand hover:text-ink"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2 px-6 pt-4 pb-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-1 flex-col items-center gap-1">
              <div className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                index < currentStep ? "bg-coral" :
                index === currentStep ? "bg-coral/60" :
                "bg-line/40"
              }`} />
              <span className={`text-[10px] font-semibold hidden sm:block ${
                index === currentStep ? "text-coral" : "text-stone/60"
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        <div className="px-6 pb-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{steps[currentStep].emoji}</span>
            <div>
              <h3 className="text-lg font-bold text-ink">{steps[currentStep].title}</h3>
              <p className="text-sm text-stone">{steps[currentStep].subtitle}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-sand border-t-coral" />
            </div>
          ) : (
            <>
              {stepError && (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {stepError}
                </div>
              )}
              {renderStepContent()}
            </>
          )}
        </div>

        <div className="border-t border-line/70 px-6 py-4">
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex items-center gap-2 rounded-2xl border border-line/80 px-5 py-3 text-sm font-semibold text-ink transition hover:bg-sand"
              >
                ← Atrás
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex-1 rounded-2xl bg-ink px-5 py-3 text-sm font-bold text-white transition hover:bg-ink/90"
              >
                Siguiente →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSaving}
                className="flex-1 rounded-2xl bg-coral px-5 py-3 text-sm font-bold text-white shadow-[0_4px_14px_rgba(255,56,92,0.3)] transition hover:-translate-y-0.5 hover:bg-[#e92a5b] disabled:opacity-60"
              >
                {isSaving ? "Publicando..." : mode === "edit" ? "Guardar cambios" : "🚀 Publicar terreno"}
              </button>
            )}
          </div>

          <p className="mt-3 text-center text-xs text-stone/60">
            Paso {currentStep + 1} de {steps.length}
          </p>
        </div>
      </div>
    </>
  );
}