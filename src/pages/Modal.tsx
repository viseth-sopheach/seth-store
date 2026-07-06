import { useEffect, useState, useMemo, type ChangeEvent } from "react";
import {
  getCategories,
  type Product,
  type ProductPayload,
  type ProductCategory,
} from "../fetchApi/fetchApi";

const glassInput =
  "w-full rounded-2xl border border-white/20 bg-white/18 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_10px_30px_rgba(0,0,0,0.08)] transition-all duration-300 focus:border-white/35 focus:bg-white/24 focus:shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_16px_40px_rgba(0,0,0,0.12)]";

const glassBtn =
  "rounded-2xl border border-white/20 bg-white/14 px-4 py-2.5 text-sm font-medium text-white/90 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_10px_25px_rgba(0,0,0,0.08)] transition-all duration-300 hover:bg-white/20 hover:border-white/30 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_16px_35px_rgba(0,0,0,0.12)] active:scale-[0.99]";

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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 sm:items-center sm:p-6">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-400/30 blur-3xl" />
        <div className="absolute right-[-5rem] top-24 h-80 w-80 rounded-full bg-fuchsia-500/25 blur-3xl" />
        <div className="absolute bottom-[-6rem] left-1/3 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl overflow-hidden rounded-[2.25rem] border border-white/20 bg-white/12 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-3xl ring-1 ring-inset ring-white/20">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.35),rgba(255,255,255,0.06)_35%,rgba(255,255,255,0.02)_70%,rgba(255,255,255,0.16))]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_30%)]" />

        <div className="relative flex items-center justify-between border-b border-white/15 px-6 py-4 sm:px-7">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">
              Drink details
            </p>
            <h2 className="mt-1 text-lg font-semibold text-white drop-shadow-sm">
              {initial ? "Edit Drink" : "New Drink"}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/12 text-white/85 backdrop-blur-xl transition-all duration-300 hover:bg-white/20 hover:text-white hover:shadow-[0_0_0_6px_rgba(255,255,255,0.05)]"
          >
            <span className="text-base leading-none transition-transform duration-300 group-hover:rotate-90">
              ✕
            </span>
          </button>
        </div>

        {error && (
          <div className="relative mx-6 mt-4 rounded-2xl border border-red-300/20 bg-red-500/15 px-4 py-3 text-sm text-red-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl sm:mx-7">
            {error}
          </div>
        )}

        <div className="relative max-h-[60vh] space-y-4 overflow-y-auto p-6 sm:p-7">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
                Name <span className="text-red-200">*</span>
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
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
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
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
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
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
                Price <span className="text-red-200">*</span>
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
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
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
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
              Category <span className="text-red-200">*</span>
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
              <p className="mt-2 text-[11px] text-white/45">
                Current:{" "}
                <span className="text-cyan-200">{initial.category.name}</span>{" "}
                (ID {initial.category.id})
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
              Image
            </label>

            <div className="grid gap-4 sm:grid-cols-[132px_1fr] sm:items-start">
              <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-[1.4rem] border border-white/20 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_14px_35px_rgba(0,0,0,0.12)]">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt={form.name || "preview"}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span className="text-[11px] text-white/35">No image</span>
                )}
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),transparent_45%,rgba(255,255,255,0.06))]" />
              </div>

              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleImage}
                  className="block w-full text-sm text-white/70 file:mr-4 file:rounded-2xl file:border-0 file:bg-white/18 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white/90 file:backdrop-blur-xl file:transition-all file:duration-300 hover:file:bg-white/25"
                />
                <p className="text-[11px] leading-relaxed text-white/40">
                  {imageFile
                    ? `Selected: ${imageFile.name}`
                    : currentImage
                      ? "Current image stays unless you pick a new file."
                      : "Choose an image for this drink."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex gap-3 border-t border-white/15 bg-white/8 px-6 py-5 backdrop-blur-xl sm:px-7">
          <button
            onClick={onClose}
            disabled={saving}
            className={`${glassBtn} flex-1 text-white/85 hover:text-white disabled:cursor-not-allowed disabled:opacity-50`}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-cyan-200/25 bg-gradient-to-r from-cyan-300/25 via-white/20 to-blue-400/25 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(59,130,246,0.18)] backdrop-blur-xl transition-all duration-300 hover:border-white/35 hover:from-cyan-300/30 hover:via-white/25 hover:to-blue-400/30 hover:shadow-[0_18px_45px_rgba(59,130,246,0.24)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
            )}
            {initial ? "Save Changes" : "Add Drink"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
