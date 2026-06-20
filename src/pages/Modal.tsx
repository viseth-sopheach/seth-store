import { useEffect, useState, useMemo, type ChangeEvent } from "react";
import {
  getCategories,
  type Product,
  type ProductPayload,
  type ProductCategory,
} from "../fetchApi/fetchApi";

const glassInput =
  "w-full bg-white/20 backdrop-blur-md border border-white/50 rounded-2xl px-4 py-2.5 text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:border-white/70 focus:bg-white/30 transition-all duration-200 shadow-inner";

const glassBtn =
  "bg-white/30 backdrop-blur-md border border-white/50 hover:bg-white/50 transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.06)]";

const DRINK_TYPES = ["hot", "cold", "alcoholic", "non-alcoholic"] as const;
type DrinkType = (typeof DRINK_TYPES)[number];

// ─── Modal (Add/Edit) ─────────────────────────────────────────────────────────

function Modal({
  initial,
  onClose,
  onSave,
}: {
  initial?: Product | null;
  onClose: () => void;
  onSave: (data: ProductPayload) => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    brand: initial?.brand ?? "",
    type: (initial?.type ?? "") as DrinkType | "",
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
    initial?.image_url || initial?.image || null,
  );

  const currentImage = initial?.image_url || initial?.image || null;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingCategories(true);
        const data = await getCategories();
        if (!alive) return;
        setCategories(Array.isArray(data) ? data : ((data as any).data ?? []));
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

  // FIX 1: Memoize options map to prevent recalculating on every keystroke
  const categoryOptions = useMemo(
    () =>
      categories.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name} (ID {c.id})
        </option>
      )),
    [categories],
  );

  const drinkTypeOptions = useMemo(
    () =>
      DRINK_TYPES.map((t) => (
        <option key={t} value={t} className="capitalize">
          {t}
        </option>
      )),
    [],
  );

  const handle = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setError(null);
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  // FIX 2: Properly revoke Object URLs to prevent memory leaks/jank
  const handleImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setError(null);
    setImageFile(file);

    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      // Revoke previous preview if it was a blob (not a server URL)
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    } else {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(currentImage);
    }
  };

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

    const payload: ProductPayload = {
      name: form.name.trim(),
      price: Number(form.price),
      category_id: Number(form.category_id),
      ...(form.brand ? { brand: form.brand.trim() } : {}),
      ...(form.type ? { type: form.type } : {}),
      ...(form.stock !== "" ? { stock: Number(form.stock) } : { stock: 0 }),
      ...(imageFile ? { image: imageFile } : {}),
    };

    setSaving(true);
    setError(null);
    try {
      await onSave(payload);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    // FIX 3: Removed heavy backdrop-blur-2xl and bg-black/20 from overlay.
    // Standard bg-black/40 is hardware-accelerated and won't lag.
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/40">
      {/* FIX 4: Added will-change-transform to hint the browser to put this on the GPU */}
      <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] bg-white/20 shadow-[0_30px_120px_rgba(0,0,0,0.12)] ring-1 ring-inset ring-white/40 backdrop-blur-2xl border border-white/30 will-change-transform">
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/40" />
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/20">
          <h2 className="text-white/90 font-semibold text-base drop-shadow-sm">
            {initial ? "Edit Drink" : "New Drink"}
          </h2>
          <button
            onClick={onClose}
            className={`${glassBtn} w-8 h-8 rounded-full flex items-center justify-center text-red-700 hover:text-white/90 hover:bg-white/15 text-xs transition-all duration-300`}
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 rounded-2xl bg-red-500/15 border border-red-400/30 backdrop-blur-md px-4 py-3 text-sm text-red-200 shadow-[inset_0_0_20px_rgba(239,68,68,0.05)]">
            {error}
          </div>
        )}

        {/* FIX 5: Changed from max-h-[70vh] to max-h-[60vh] and added will-change-scroll-content */}
        <div className="p-6 flex flex-col gap-4 max-h-[60vh] overflow-y-auto will-change-scroll-content scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          <div>
            <label className="text-[11px] text-white/50 mb-1.5 block uppercase tracking-wider font-medium drop-shadow-sm">
              Name <span className="text-red-300/80">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handle}
              className={glassInput}
              placeholder="e.g. Mineral Water"
            />
          </div>
          <div>
            <label className="text-[11px] text-white/50 mb-1.5 block uppercase tracking-wider font-medium drop-shadow-sm">
              Brand
            </label>
            <input
              name="brand"
              value={form.brand}
              onChange={handle}
              className={glassInput}
              placeholder="e.g. Evian, Coca-Cola…"
            />
          </div>
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
              {drinkTypeOptions}
            </select>
          </div>
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
                  ? "Loading categories..."
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
          <div>
            <label className="text-[11px] text-white/50 mb-1.5 block uppercase tracking-wider font-medium drop-shadow-sm">
              Image
            </label>
            <div className="grid gap-3 sm:grid-cols-[120px_1fr] sm:items-center">
              <div className="h-28 rounded-2xl overflow-hidden border border-white/20 bg-white/10 backdrop-blur-md flex items-center justify-center shadow-[inset_0_0_30px_rgba(255,255,255,0.05)]">
                {imagePreview ? (
                  // FIX 6: Added loading="lazy" and decoding="async" to prevent image decode blocking the main thread
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
                    : "Choose an image for this drink."}
              </p>
            </div>
          </div>
        </div>

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
            {initial ? "Save Changes" : "Add Drink"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
