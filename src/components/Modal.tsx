import { useEffect, useState, useMemo, type ChangeEvent } from "react";
import {
  getCategories,
  type Product,
  type ProductPayload,
  type ProductCategory,
} from "../fetchApi/fetchApi";

const inputClass =
  "w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100";
const buttonClass =
  "rounded-2xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-600 transition hover:bg-stone-50";

const DRINK_TYPES = ["hot", "cold", "alcoholic", "non-alcoholic"] as const;
type DrinkType = (typeof DRINK_TYPES)[number];

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
        if (alive) setError(e instanceof Error ? e.message : "Could not load categories.");
      } finally {
        if (alive) setLoadingCategories(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

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

  const handleImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setError(null);
    setImageFile(file);

    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/45 p-4 sm:items-center sm:p-6">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4 sm:px-7">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400">Drink details</p>
            <h2 className="mt-1 text-lg font-semibold text-stone-900">{initial ? "Edit drink" : "New drink"}</h2>
          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 transition hover:bg-stone-50"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-7">
            {error}
          </div>
        )}

        <div className="max-h-[60vh] space-y-4 overflow-y-auto p-6 sm:p-7">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">
                Name <span className="text-red-500">*</span>
              </label>
              <input name="name" value={form.name} onChange={handle} className={inputClass} placeholder="e.g. Mineral Water" />
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">Brand</label>
              <input name="brand" value={form.brand} onChange={handle} className={inputClass} placeholder="e.g. Evian, Coca-Cola…" />
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">Type</label>
              <select name="type" value={form.type} onChange={handle} className={inputClass}>
                <option value="">— none —</option>
                {drinkTypeOptions}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">
                Price <span className="text-red-500">*</span>
              </label>
              <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handle} className={inputClass} placeholder="0.00" />
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">Stock</label>
              <input name="stock" type="number" min="0" value={form.stock} onChange={handle} className={inputClass} placeholder="0" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">
              Category <span className="text-red-500">*</span>
            </label>
            <select name="category_id" value={form.category_id} onChange={handle} className={inputClass} disabled={loadingCategories}>
              <option value="">{loadingCategories ? "Loading categories..." : "Select a category"}</option>
              {categoryOptions}
            </select>

            {initial?.category && (
              <p className="mt-2 text-[11px] text-stone-500">
                Current: <span className="font-medium text-blue-600">{initial.category.name}</span> (ID {initial.category.id})
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">Image</label>
            <div className="grid gap-4 sm:grid-cols-[132px_1fr] sm:items-start">
              <div className="flex h-32 items-center justify-center overflow-hidden rounded-[1.25rem] border border-stone-200 bg-stone-50">
                {imagePreview ? (
                  <img src={imagePreview} alt={form.name || "preview"} className="h-full w-full object-cover" loading="lazy" decoding="async" />
                ) : (
                  <span className="text-sm text-stone-400">No image</span>
                )}
              </div>

              <div className="space-y-3">
                <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleImage} className="block w-full text-sm text-stone-500 file:mr-4 file:rounded-2xl file:border-0 file:bg-stone-100 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-stone-700 hover:file:bg-stone-200" />
                <p className="text-[11px] leading-relaxed text-stone-500">
                  {imageFile ? `Selected: ${imageFile.name}` : currentImage ? "Current image stays unless you pick a new file." : "Choose an image for this drink."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 border-t border-stone-100 bg-stone-50 px-6 py-5 sm:px-7">
          <button onClick={onClose} disabled={saving} className={`${buttonClass} flex-1 disabled:cursor-not-allowed disabled:opacity-50`}>
            Cancel
          </button>
          <button onClick={submit} disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
            {saving && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />}
            {initial ? "Save changes" : "Add drink"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
