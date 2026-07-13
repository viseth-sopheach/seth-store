import { useEffect, useState, useMemo, type ChangeEvent } from "react";
import {
  getCategories,
  type Product,
  type ProductCategory,
} from "../api/fetchApi";

// ─── Shared Payload type (mirrors fetchApi ProductPayload)
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

const glassInput =
  "w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200 transition";

const glassBtn =
  "rounded-xl border border-stone-300 bg-stone-100 px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-200";

// ─── Computer-specific constants
const COMPUTER_TYPES = [
  "laptop",
  "desktop",
  "monitor",
  "accessory",
  "component",
] as const;
type ComputerType = (typeof COMPUTER_TYPES)[number];

// ─── Modal
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

  // ── Fetch categories
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

  // ── Memoised <option> lists
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

  // ── Handlers
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

  // Submit
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

  // ── Render
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/45 p-3 sm:items-center sm:p-6">
      <div className="w-full max-w-2xl overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.16)]">
        <div className="flex justify-center pb-1 pt-3 sm:hidden">
          <div className="h-1.5 w-10 rounded-full bg-stone-300" />
        </div>

        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">
              Inventory
            </p>
            <h2 className="text-base font-semibold text-stone-900">
              {initial ? "Edit product" : "New product"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-sm text-stone-600 transition hover:bg-stone-100"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto p-6">
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.2em] text-stone-500">
              Name <span className="text-red-500">*</span>
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
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.2em] text-stone-500">
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
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.2em] text-stone-500">
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
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.2em] text-stone-500">
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
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.2em] text-stone-500">
                Price <span className="text-red-500">*</span>
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
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.2em] text-stone-500">
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
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.2em] text-stone-500">
              Category <span className="text-red-500">*</span>
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
              <p className="mt-1 text-[11px] text-stone-500">
                Current:{" "}
                <span className="font-medium text-stone-700">
                  {initial.category.name}
                </span>{" "}
                (ID {initial.category.id})
              </p>
            )}
          </div>

          {/* Image */}
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.2em] text-stone-500">
              Image
            </label>
            <div className="grid gap-3 sm:grid-cols-[120px_1fr] sm:items-center">
              <div className="flex h-28 items-center justify-center overflow-hidden rounded-2xl border border-stone-200 bg-stone-50">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt={form.name || "preview"}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span className="text-[11px] text-stone-400">No image</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <div className="relative inline-block overflow-hidden rounded-xl border border-stone-300 bg-stone-50 px-3 py-2.5">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleImage}
                    className="block w-[140px] text-sm text-stone-600 file:mr-0 file:cursor-pointer file:rounded-full file:border-0 file:bg-stone-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-stone-700 hover:file:bg-stone-200"
                  />
                </div>
                <p className="text-[11px] leading-relaxed text-stone-500">
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

        <div className="flex gap-3 border-t border-stone-200 bg-stone-50 px-6 py-5">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            {saving && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
            )}
            {initial ? "Save changes" : "Add product"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
