import { useEffect, useState } from "react";
import {
  getCategories,
  type Product,
  type ProductPayload,
  type ProductCategory,
} from "../fetchApi/fetchApi";

const glass =
  "bg-white/30 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)]";

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

  const handle = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setError(null);
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setError(null);
    setImageFile(file);
    setImagePreview(
      file
        ? URL.createObjectURL(file)
        : initial?.image_url || initial?.image || null,
    );
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-4xl bg-white/95 shadow-[0_30px_120px_rgba(13,33,75,0.15)] ring-1 ring-white/60 backdrop-blur-xl">
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-300/80" />
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-gray-800 font-semibold text-base">
            {initial ? "Edit Drink" : "New Drink"}
          </h2>
          <button
            onClick={onClose}
            className={`${glassBtn} w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 text-xs`}
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="text-[11px] text-gray-400 mb-1.5 block uppercase tracking-wider font-medium">
              Name <span className="text-red-400">*</span>
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
            <label className="text-[11px] text-gray-400 mb-1.5 block uppercase tracking-wider font-medium">
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
            <label className="text-[11px] text-gray-400 mb-1.5 block uppercase tracking-wider font-medium">
              Type
            </label>
            <select
              name="type"
              value={form.type}
              onChange={handle}
              className={glassInput}
            >
              <option value="">— none —</option>
              {DRINK_TYPES.map((t) => (
                <option key={t} value={t} className="capitalize">
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-gray-400 mb-1.5 block uppercase tracking-wider font-medium">
                Price <span className="text-red-400">*</span>
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
              <label className="text-[11px] text-gray-400 mb-1.5 block uppercase tracking-wider font-medium">
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
            <label className="text-[11px] text-gray-400 mb-1.5 block uppercase tracking-wider font-medium">
              Category <span className="text-red-400">*</span>
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
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (ID {c.id})
                </option>
              ))}
            </select>
            {initial?.category && (
              <p className="text-[11px] text-gray-400 mt-1">
                Current:{" "}
                <span className="text-blue-500">{initial.category.name}</span>{" "}
                (ID {initial.category.id})
              </p>
            )}
          </div>
          <div>
            <label className="text-[11px] text-gray-400 mb-1.5 block uppercase tracking-wider font-medium">
              Image
            </label>
            <div className="grid gap-3 sm:grid-cols-[120px_1fr] sm:items-center">
              <div className="h-28 rounded-2xl overflow-hidden border border-white/50 bg-white/20 flex items-center justify-center">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt={form.name || "preview"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-[11px] text-gray-400">No image</span>
                )}
              </div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleImage}
                className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-500/80 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-500"
              />
              <p className="text-[11px] text-gray-400 leading-relaxed">
                {imageFile
                  ? `Selected: ${imageFile.name}`
                  : currentImage
                    ? "Current image stays unless you pick a new file."
                    : "Choose an image for this drink."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-5 border-t border-white/30">
          <button
            onClick={onClose}
            disabled={saving}
            className={`${glassBtn} flex-1 py-3 rounded-2xl text-gray-500 text-sm font-medium disabled:opacity-50`}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="flex-1 py-3 rounded-2xl bg-blue-500/80 backdrop-blur-md hover:bg-blue-500 text-white text-sm font-semibold border border-blue-400/40 shadow-[0_4px_16px_rgba(59,130,246,0.3)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {initial ? "Save Changes" : "Add Drink"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
