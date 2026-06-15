import { useEffect, useState } from "react";
// import { Router, Routes, useNavigate, Route } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import {
  getComputerProducts,
  deleteComputerProduct,
  createComputerProduct,
  updateComputerProduct,
  getCategories,
  loginUser,
  logoutUser,
  fetchAuthUser,
  placeOrder,
  type Product,
  type ProductPayload,
  type ProductCategory,
  type AuthUser,
} from "../fetchApi/fetchApi";

// const navigate = useNavigate();

// Inside your export default function DrProduct() { ...


// ─── Liquid Glass Tokens ──────────────────────────────────────────────────────

const glass =
  "bg-white/30 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)]";

const glassInput =
  "w-full bg-white/20 backdrop-blur-md border border-white/50 rounded-2xl px-4 py-2.5 text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:border-white/70 focus:bg-white/30 transition-all duration-200 shadow-inner";

const glassBtn =
  "bg-white/30 backdrop-blur-md border border-white/50 hover:bg-white/50 transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.06)]";

const DRINK_TYPES = ["hot", "cold", "alcoholic", "non-alcoholic"] as const;
type DrinkType = (typeof DRINK_TYPES)[number];

// ─── Badge ────────────────────────────────────────────────────────────────────

function Badge({ stock }: { stock?: number }) {
  if (stock === undefined) return null;
  const inStock = stock > 0;
  return (
    <span
      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-md border ${
        inStock
          ? "bg-emerald-400/20 text-emerald-700 border-emerald-300/50"
          : "bg-red-400/20 text-red-600 border-red-300/50"
      }`}
    >
      {inStock ? `${stock} in stock` : "Out of stock"}
    </span>
  );
}

// ─── Buy Modal ────────────────────────────────────────────────────────────────

function BuyModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const [tableNumber, setTableNumber] = useState("");
  const [floor, setFloor] = useState("");
  const [qty, setQty] = useState("1");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const price =
    typeof product.price === "number" ? product.price : Number(product.price);

  const total = price * (Number(qty) || 1);

  const handleSubmit = async () => {
    setError(null);

    if (!tableNumber.trim()) {
      setError("Please enter your table number.");
      return;
    }
    if (!floor.trim()) {
      setError("Please enter the floor.");
      return;
    }
    if (!qty || Number(qty) < 1) {
      setError("Quantity must be at least 1.");
      return;
    }

    setSubmitting(true);
    try {
      await placeOrder({
        product_type: "drink",
        product_id: product.id,
        product_name: product.name,
        unit_price: price,
        quantity: Number(qty),
        table_number: tableNumber.trim(),
        floor: floor.trim(),
      });
      setSubmitted(true);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to place order. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-4xl bg-white/95 shadow-[0_30px_120px_rgba(13,33,75,0.15)] ring-1 ring-white/60 backdrop-blur-xl overflow-hidden">
          <div className="flex flex-col items-center gap-4 px-8 py-10 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-3xl">
              ✅
            </div>
            <h3 className="text-gray-800 font-bold text-lg">Order Placed!</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              <span className="font-semibold text-gray-700">
                {product.name}
              </span>{" "}
              × {qty} will be delivered to{" "}
              <span className="font-semibold text-blue-600">
                Table {tableNumber}
              </span>{" "}
              on{" "}
              <span className="font-semibold text-blue-600">Floor {floor}</span>
              .
            </p>
            <p className="text-gray-800 font-bold text-xl">
              Total: ${total.toFixed(2)}
            </p>
            <button
              onClick={onClose}
              className="mt-2 w-full py-3 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors duration-200"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-4xl bg-white/95 shadow-[0_30px_120px_rgba(13,33,75,0.15)] ring-1 ring-white/60 backdrop-blur-xl">
        {/* Handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-300/80" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-gray-800 font-semibold text-base">Place Order</h2>
          <button
            onClick={onClose}
            className={`${glassBtn} w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 text-xs`}
          >
            ✕
          </button>
        </div>

        {/* Product summary */}
        <div className="mx-6 mt-5 flex items-center gap-4 rounded-2xl bg-blue-50/60 border border-blue-100 px-4 py-3">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/60 flex-shrink-0 flex items-center justify-center border border-white/50">
            {product.image_url || product.image ? (
              <img
                src={product.image_url || product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl">🥤</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-800 font-semibold text-sm truncate">
              {product.name}
            </p>
            {product.brand && (
              <p className="text-gray-400 text-[12px]">{product.brand}</p>
            )}
            <p className="text-blue-600 font-bold text-sm mt-0.5">
              ${price.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="p-6 flex flex-col gap-4">
          {/* Quantity */}
          <div>
            <label className="text-[11px] text-gray-400 mb-1.5 block uppercase tracking-wider font-medium">
              Quantity <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  setQty((q) => String(Math.max(1, Number(q) - 1)))
                }
                disabled={submitting}
                className={`${glassBtn} w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 font-bold text-lg flex-shrink-0 disabled:opacity-50`}
              >
                −
              </button>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                disabled={submitting}
                className={`${glassInput} text-center`}
              />
              <button
                onClick={() => setQty((q) => String(Number(q) + 1))}
                disabled={submitting}
                className={`${glassBtn} w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 font-bold text-lg flex-shrink-0 disabled:opacity-50`}
              >
                +
              </button>
            </div>
          </div>

          {/* Table Number */}
          <div>
            <label className="text-[11px] text-gray-400 mb-1.5 block uppercase tracking-wider font-medium">
              Table Number <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={tableNumber}
              onChange={(e) => {
                setError(null);
                setTableNumber(e.target.value);
              }}
              disabled={submitting}
              className={glassInput}
              placeholder="e.g. 12"
            />
          </div>

          {/* Floor */}
          <div>
            <label className="text-[11px] text-gray-400 mb-1.5 block uppercase tracking-wider font-medium">
              Floor <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={floor}
              onChange={(e) => {
                setError(null);
                setFloor(e.target.value);
              }}
              disabled={submitting}
              className={glassInput}
              placeholder="e.g. 2nd Floor"
            />
          </div>

          {/* Total */}
          <div className="flex items-center justify-between rounded-2xl bg-gray-50/80 border border-gray-100 px-4 py-3">
            <span className="text-gray-500 text-sm">Total</span>
            <span className="text-gray-800 font-bold text-lg">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 py-5 border-t border-white/30">
          <button
            onClick={onClose}
            disabled={submitting}
            className={`${glassBtn} flex-1 py-3 rounded-2xl text-gray-500 text-sm font-medium disabled:opacity-50`}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-3 rounded-2xl bg-blue-500/90 backdrop-blur-md hover:bg-blue-500 text-white text-sm font-semibold border border-blue-400/40 shadow-[0_4px_16px_rgba(59,130,246,0.3)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {submitting ? "Placing Order…" : "Confirm Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({
  product,
  isAdmin,
  isLoggedIn,
  onEdit,
  onDelete,
  onBuy,
}: {
  product: Product;
  isAdmin: boolean;
  isLoggedIn: boolean;
  onEdit: (p: Product) => void;
  onDelete: (id: number) => void;
  onBuy: (p: Product) => void;
}) {
  const categoryName = product.category?.name ?? "";

  return (
    <div
      className={`${glass} rounded-3xl overflow-hidden flex flex-col group hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)] hover:bg-white/40 transition-all duration-300`}
    >
      {/* Image */}
      <div className="relative h-44 flex items-center justify-center bg-linear-to-br from-white/40 to-white/10 border-b border-white/30 overflow-hidden">
        <div className="absolute w-24 h-24 rounded-full bg-blue-300/30 blur-2xl top-2 left-4 group-hover:bg-blue-300/50 transition-colors duration-500 pointer-events-none" />
        <div className="absolute w-20 h-20 rounded-full bg-purple-300/25 blur-2xl bottom-2 right-4 group-hover:bg-purple-300/40 transition-colors duration-500 pointer-events-none" />
        {product.image_url || product.image ? (
          <img
            src={product.image_url || product.image}
            alt={product.name}
            className="w-full h-full object-cover relative z-10 group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <svg
            className="w-14 h-14 text-gray-400/60 relative z-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.2}
              d="M9 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V8l-5-5zM9 3v5h9"
            />
          </svg>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5 gap-2">
        {categoryName && (
          <span className="text-[11px] uppercase tracking-widest text-blue-500/80 font-semibold">
            {categoryName}
          </span>
        )}
        <h3 className="text-gray-800 font-semibold text-[15px] leading-snug line-clamp-2">
          {product.name}
        </h3>
        {product.brand && (
          <p className="text-gray-500 text-[13px] leading-relaxed">
            {product.brand}
          </p>
        )}
        {product.type && (
          <span className="self-start text-[11px] px-2 py-0.5 rounded-full bg-blue-100/60 text-blue-600 border border-blue-200/50 capitalize">
            {product.type}
          </span>
        )}
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-white/50">
          <span className="text-gray-800 font-bold text-base tracking-tight">
            $
            {typeof product.price === "number"
              ? product.price.toFixed(2)
              : Number(product.price).toFixed(2)}
          </span>
          {isLoggedIn ? (
            <button
              onClick={() => onBuy(product)}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-full text-sm font-medium transition-colors duration-200"
            >
              BUY
            </button>
          ) : (
            <button
              disabled
              title="Login to buy"
              className="bg-gray-200 text-gray-400 py-2 px-4 rounded-full text-sm font-medium cursor-not-allowed"
            >
              BUY
            </button>
          )}
        </div>
      </div>

      {/* Admin actions */}
      {isAdmin && (
        <div className="flex border-t border-white/40">
          <button
            onClick={() => onEdit(product)}
            className="flex-1 py-3 text-[13px] text-gray-500 hover:text-blue-600 hover:bg-blue-500/5 transition-all duration-200 font-medium"
          >
            Edit
          </button>
          <div className="w-px bg-white/40" />
          <button
            onClick={() => onDelete(product.id)}
            className="flex-1 py-3 text-[13px] text-gray-500 hover:text-red-500 hover:bg-red-500/5 transition-all duration-200 font-medium"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DrProduct() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [buyProduct, setBuyProduct] = useState<Product | null>(null);

  const isAdmin = user?.role?.toUpperCase() === "ADMIN";
  const isLoggedIn = user !== null;

  const load = async () => {
    try {
      setError(null);
      const data = await getComputerProducts();
      setProducts(Array.isArray(data) ? data : ((data as any).data ?? []));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    (async () => {
      try {
        const currentUser = await fetchAuthUser();
        setUser(currentUser);
      } catch {
        logoutUser();
        setUser(null);
      }
    })();
  }, []);

  const handleLogin = async () => {
    setAuthError(null);
    try {
      const currentUser = await loginUser(loginEmail, loginPassword);
      setUser(currentUser);
      setLoginOpen(false);
      setLoginEmail("");
      setLoginPassword("");
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : "Login failed.");
    }
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this drink?")) return;
    try {
      await deleteComputerProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed.");
    }
  };

  const handleSave = async (data: ProductPayload) => {
    if (editing) {
      await updateComputerProduct(editing.id, data);
    } else {
      await createComputerProduct(data);
    }
    await load();
    setModalOpen(false);
    setEditing(null);
  };

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (p: Product) => {
    setEditing(p);
    setModalOpen(true);
  };

  const filtered = products.filter((p) =>
    [p.name, p.brand, p.type, p.category?.name]
      .filter(Boolean)
      .some((f) => f!.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div
      className="min-h-screen font-sans relative overflow-x-hidden"
      style={{
        background:
          "linear-gradient(135deg, #ddeeff 0%, #ede8ff 35%, #fce4ec 65%, #daf4ff 100%)",
      }}
    >
      <div
        className="fixed top-[-15%] left-[-10%] w-[65vw] h-[65vw] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(147,197,253,0.45) 0%, transparent 70%)",
          filter: "blur(70px)",
        }}
      />
      <div
        className="fixed bottom-[-15%] right-[-10%] w-[55vw] h-[55vw] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(216,180,254,0.4) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="fixed top-[35%] right-[15%] w-[35vw] h-[35vw] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(252,165,165,0.25) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/25 backdrop-blur-2xl border-b border-white/40 shadow-[0_2px_20px_rgba(0,0,0,0.06)] px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-gray-800 font-bold text-lg sm:text-xl tracking-tight leading-tight">
              Drinks
            </h1>
            <p className="text-[12px] text-gray-400 mt-0.5 leading-none">
              {loading
                ? "Loading…"
                : `${products.length} item${products.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          <div className="relative hidden sm:block w-60">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none select-none">
              <FaSearch />
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className={`${glassInput} pl-9`}
            />
          </div>

          {isAdmin && (
            <>
              <button onClick={() => window.location.href = "/dashboard"} className="bg-cyan-200 rounded-2xl py-2 px-4 border-t-cyan-600">
                Dashboard
              </button>
              <button
                onClick={openAdd}
                className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-blue-500/75 backdrop-blur-md hover:bg-blue-500/90 active:scale-95 text-white text-sm font-semibold border border-blue-400/40 shadow-[0_4px_16px_rgba(59,130,246,0.28)] transition-all duration-200"
              >
                <span className="text-lg leading-none -mt-0.5">+</span>
                <span className="hidden sm:inline">Add</span>
              </button>
            </>
          )}

          {!isLoggedIn && (
            <p className="hidden sm:block text-[11px] text-gray-400 italic">
              Login to buy
            </p>
          )}

          {user && (
            <span
              className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md ${
                isAdmin
                  ? "bg-emerald-400/20 text-emerald-700 border-emerald-300/50"
                  : "bg-amber-400/20 text-amber-700 border-amber-300/50"
              }`}
            >
              {user.role}
            </span>
          )}

          <button
            onClick={user ? handleLogout : () => setLoginOpen(true)}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-stone-900/90 backdrop-blur-md hover:bg-stone-800/90 active:scale-95 text-white text-sm font-semibold border border-stone-700/40 shadow-[0_4px_16px_rgba(15,23,42,0.28)] transition-all duration-200"
          >
            {user ? "Logout" : "Login"}
          </button>
        </div>
      </header>

      {/* Mobile search */}
      <div className="sm:hidden px-4 pt-4">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none select-none">
            🔍
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search drinks…"
            className={`${glassInput} pl-9`}
          />
        </div>
      </div>

      {/* Main */}
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto">
        {loading && (
          <div className="flex flex-col items-center justify-center py-40 gap-5">
            <div
              className={`${glass} w-16 h-16 rounded-2xl flex items-center justify-center`}
            >
              <div className="w-7 h-7 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-gray-400 text-sm">Loading drinks…</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center py-40 gap-4 text-center">
            <div className={`${glass} rounded-3xl px-8 py-7 max-w-xs w-full`}>
              <div className="text-3xl mb-3">!</div>
              <p className="text-red-500 font-medium text-sm mb-5">{error}</p>
              <button
                onClick={() => {
                  setLoading(true);
                  load();
                }}
                className={`${glassBtn} px-5 py-2.5 rounded-xl text-gray-600 text-sm font-medium w-full`}
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center py-40 gap-4 text-center">
            <div
              className={`${glass} w-20 h-20 rounded-3xl flex items-center justify-center text-4xl`}
            >
              {search ? "🔍" : "🥤"}
            </div>
            <div>
              <p className="text-gray-600 font-semibold">
                {search ? `No results for "${search}"` : "No drinks yet"}
              </p>
              {!search && isAdmin && (
                <p className="text-gray-400 text-sm mt-1">
                  Tap + to add your first drink
                </p>
              )}
            </div>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isAdmin={isAdmin}
                isLoggedIn={isLoggedIn}
                onEdit={openEdit}
                onDelete={handleDelete}
                onBuy={(p) => setBuyProduct(p)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <Modal
          initial={editing}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSave={handleSave}
        />
      )}

      {/* Buy Modal */}
      {buyProduct && (
        <BuyModal product={buyProduct} onClose={() => setBuyProduct(null)} />
      )}

      {/* Login Modal */}
      {loginOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/35 backdrop-blur-sm">
          <div
            className={`${glass} w-full sm:max-w-md rounded-3xl overflow-hidden`}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/30">
              <h2 className="text-gray-800 font-semibold text-base">Sign in</h2>
              <button
                onClick={() => setLoginOpen(false)}
                className={`${glassBtn} w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800`}
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              {authError && (
                <div className="rounded-3xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {authError}
                </div>
              )}
              <div>
                <label className="text-[11px] text-gray-500 mb-1.5 block uppercase tracking-wider font-medium">
                  Email
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className={glassInput}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-500 mb-1.5 block uppercase tracking-wider font-medium">
                  Password
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className={glassInput}
                  placeholder="••••••••"
                />
              </div>
              <button
                onClick={handleLogin}
                className="w-full py-3 rounded-2xl bg-blue-500/90 text-white text-sm font-semibold hover:bg-blue-500 transition-all duration-200"
              >
                Sign in
              </button>
              <button
                onClick={() => setLoginOpen(false)}
                className={`${glassBtn} w-full py-3 rounded-2xl text-sm font-medium text-gray-600`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
