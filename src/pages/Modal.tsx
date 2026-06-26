import { useEffect, useState, useMemo, type ChangeEvent } from "react";
import {
  getCategories,
  type Product,
  type ProductCategory,
} from "../api/fetchApi";

// ─── Shared Payload type (mirrors fetchApi ProductPayload if you have one) ────
export interface ComputerPayload {
  name: string;
  brand?: string;
  type?: string;
  specs?: string;
  price: number;
  stock?: number;
  category_id?: number | null;
  image?: File | null;
}

// ─── Styles (same tokens as drink Modal) ─────────────────────────────────────
const glassInput =
  "w-full bg-white/20 backdrop-blur-md border border-white/50 rounded-2xl px-4 py-2.5 text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:border-white/70 focus:bg-white/30 transition-all duration-200 shadow-inner";

const glassBtn =
  "bg-white/30 backdrop-blur-md border border-white/50 hover:bg-white/50 transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.06)]";

// ─── Computer-specific constants ──────────────────────────────────────────────
const COMPUTER_TYPES = [
  "laptop",
  "desktop",
  "monitor",
  "accessory",
  "component",
] as const;
type ComputerType = (typeof COMPUTER_TYPES)[number];

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({
  initial,
  onClose,
  onSave,
}: {
  initial?: Product | null;
  onClose: () => void;
  onSave: (data: ComputerPayload) => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    brand: initial?.brand ?? "",
    type: (initial?.type ?? "") as ComputerType | "",
    specs: initial?.specs ?? "",
    price: initial?.price != null ? String(initial.price) : "",
    stock: initial?.stock != null ? String(initial.stock) : "",
    category_id:
      initial?.category?.id != null
        ? String(initial.category.id)
        : initial?.category_id != null
          ? String(initial.category_id)
          : "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initial?.image_url ||
      (typeof initial?.image === "string" ? initial.image : null) ||
      null,
  );

  const currentImage =
    initial?.image_url ||
    (typeof initial?.image === "string" ? initial.image : null) ||
    null;

  // ── Fetch categories ────────────────────────────────────────────────────────
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingCategories(true);
        const data = await getCategories();
        if (!alive) return;
        setCategories(
          Array.isArray(data)
            ? data
            : ((data as { data: ProductCategory[] }).data ?? []),
        );
      } catch (e) {
        if (alive)
          setError(
            e instanceof Error ? e.message : "Could not load categories.",
          );
      } finally {
        if (alive) setLoadingCategories(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // ── Memoised <option> lists ─────────────────────────────────────────────────
  const categoryOptions = useMemo(
    () =>
      categories.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name} (ID {c.id})
        </option>
      )),
    [categories],
  );

  const computerTypeOptions = useMemo(
    () =>
      COMPUTER_TYPES.map((t) => (
        <option key={t} value={t} className="capitalize">
          {t.charAt(0).toUpperCase() + t.slice(1)}
        </option>
      )),
    [],
  );

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handle = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setError(null);
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setError(null);
    setImageFile(file);

    if (file) {
      const url = URL.createObjectURL(file);
      if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
      setImagePreview(url);
    } else {
      if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
      setImagePreview(currentImage);
    }
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const submit = async () => {
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!form.price || isNaN(Number(form.price))) {
      setError("A valid price is required.");
      return;
    }
    if (!form.category_id || isNaN(Number(form.category_id))) {
      setError("Please select a category.");
      return;
    }

    // Constructing sanitized object
    const payload: ComputerPayload = {
      name: form.name.trim(),
      price: Number(form.price),
      category_id: Number(form.category_id),
      brand: form.brand.trim() || undefined,
      type: form.type || undefined,
      specs: form.specs.trim() || undefined,
      stock: form.stock !== "" ? Number(form.stock) : 0,
      ...(imageFile ? { image: imageFile } : {}),
    };

    setSaving(true);
    setError(null);
    try {
      await onSave(payload);
      onClose(); // Safe close after save is resolved successfully
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/40">
      <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] bg-white/20 shadow-[0_30px_120px_rgba(0,0,0,0.12)] ring-1 ring-inset ring-white/40 backdrop-blur-2xl border border-white/30 will-change-transform">
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/40" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/20">
          <h2 className="text-white/90 font-semibold text-base drop-shadow-sm">
            {initial ? "Edit Computer Product" : "New Computer Product"}
          </h2>
          <button
            onClick={onClose}
            className={`${glassBtn} w-8 h-8 rounded-full flex items-center justify-center text-red-700 hover:text-white/90 hover:bg-white/15 text-xs transition-all duration-300`}
          >
            ✕
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mx-6 mt-4 rounded-2xl bg-red-500/15 border border-red-400/30 backdrop-blur-md px-4 py-3 text-sm text-red-200 shadow-[inset_0_0_20px_rgba(239,68,68,0.05)]">
            {error}
          </div>
        )}

        {/* Form body */}
        <div className="p-6 flex flex-col gap-4 max-h-[60vh] overflow-y-auto will-change-scroll-content scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {/* Name */}
          <div>
            <label className="text-[11px] text-white/50 mb-1.5 block uppercase tracking-wider font-medium drop-shadow-sm">
              Name <span className="text-red-300/80">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handle}
              className={glassInput}
              placeholder="e.g. MacBook Pro 14"
            />
          </div>

          {/* Brand */}
          <div>
            <label className="text-[11px] text-white/50 mb-1.5 block uppercase tracking-wider font-medium drop-shadow-sm">
              Brand
            </label>
            <input
              name="brand"
              value={form.brand}
              onChange={handle}
              className={glassInput}
              placeholder="e.g. Apple, Dell, ASUS…"
            />
          </div>

          {/* Type */}
          <div>
            <label className="text-[11px] text-white/50 mb-1.5 block uppercase tracking-wider font-medium drop-shadow-sm">
              Type
            </label>
            <select
              name="type"
              value={form.type}
              onChange={handle}
              className={glassInput}
            >
              <option value="">— none —</option>
              {computerTypeOptions}
            </select>
          </div>

          {/* Specs */}
          <div>
            <label className="text-[11px] text-white/50 mb-1.5 block uppercase tracking-wider font-medium drop-shadow-sm">
              Specs
            </label>
            <input
              name="specs"
              value={form.specs}
              onChange={handle}
              className={glassInput}
              placeholder="e.g. M3 Pro, 18GB RAM, 512GB SSD"
            />
          </div>

          {/* Price + Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-white/50 mb-1.5 block uppercase tracking-wider font-medium drop-shadow-sm">
                Price <span className="text-red-300/80">*</span>
              </label>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handle}
                className={glassInput}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="text-[11px] text-white/50 mb-1.5 block uppercase tracking-wider font-medium drop-shadow-sm">
                Stock
              </label>
              <input
                name="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={handle}
                className={glassInput}
                placeholder="0"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-[11px] text-white/50 mb-1.5 block uppercase tracking-wider font-medium drop-shadow-sm">
              Category <span className="text-red-300/80">*</span>
            </label>
            <select
              name="category_id"
              value={form.category_id}
              onChange={handle}
              className={glassInput}
              disabled={loadingCategories}
            >
              <option value="">
                {loadingCategories
                  ? "Loading categories…"
                  : "Select a category"}
              </option>
              {categoryOptions}
            </select>
            {initial?.category && (
              <p className="text-[11px] text-white/40 mt-1 drop-shadow-sm">
                Current:{" "}
                <span className="text-blue-300/80">
                  {initial.category.name}
                </span>{" "}
                (ID {initial.category.id})
              </p>
            )}
          </div>

          {/* Image */}
          <div>
            <label className="text-[11px] text-white/50 mb-1.5 block uppercase tracking-wider font-medium drop-shadow-sm">
              Image
            </label>
            <div className="grid gap-3 sm:grid-cols-[120px_1fr] sm:items-center">
              <div className="h-28 rounded-2xl overflow-hidden border border-white/20 bg-white/10 backdrop-blur-md flex items-center justify-center shadow-[inset_0_0_30px_rgba(255,255,255,0.05)]">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt={form.name || "preview"}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span className="text-[11px] text-white/30 drop-shadow-sm">
                    No image
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleImage}
                  className="block w-full text-sm text-white/60 file:mr-4 file:rounded-xl file:border-0 file:bg-white/20 file:backdrop-blur-md file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white/90 file:border file:border-white/30 hover:file:bg-white/30 file:transition-all file:duration-300 file:cursor-pointer file:shadow-[0_2px_10px_rgba(255,255,255,0.1)]"
                />
                <p className="text-[11px] text-white/40 leading-relaxed drop-shadow-sm">
                  {imageFile
                    ? `Selected: ${imageFile.name}`
                    : currentImage
                      ? "Current image stays unless you pick a new file."
                      : "Choose an image for this product."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-5 border-t border-white/15 bg-white/5 backdrop-blur-sm">
          <button
            onClick={onClose}
            disabled={saving}
            className={`${glassBtn} flex-1 py-3 rounded-2xl text-red-700 text-sm font-medium disabled:opacity-50 hover:bg-white/15 hover:text-white/90 transition-all duration-300`}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="flex-1 py-3 rounded-2xl bg-white/25 backdrop-blur-md hover:bg-white/35 text-blue-500 text-sm font-semibold border border-white/40 shadow-[0_4px_30px_rgba(255,255,255,0.15)] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-[0_4px_40px_rgba(255,255,255,0.2)] hover:scale-[1.01] active:scale-[0.99]"
          >
            {saving && (
              <span className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
            )}
            {initial ? "Save Changes" : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;