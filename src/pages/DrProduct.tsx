import { useEffect, useState } from "react";
import {
  getComputerProducts,
  deleteComputerProduct,
  createComputerProduct,
  updateComputerProduct,
  type Product,
} from "../fetchApi/fetchApi";

// ─── Liquid Glass Tokens ──────────────────────────────────────────────────────

const glass =
  "bg-white/30 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)]";

const glassInput =
  "w-full bg-white/20 backdrop-blur-md border border-white/50 rounded-2xl px-4 py-2.5 text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:border-white/70 focus:bg-white/30 transition-all duration-200 shadow-inner";

const glassBtn =
  "bg-white/30 backdrop-blur-md border border-white/50 hover:bg-white/50 transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.06)]";

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

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({
  product,
  onEdit,
  onDelete,
}: {
  product: Product;
  onEdit: (p: Product) => void;
  onDelete: (id: number) => void;
}) {
  // Fix 1: extract category name safely
  const categoryName =
    typeof product.category === "object" && product.category !== null
      ? product.category.name
      : typeof product.category === "string"
      ? product.category
      : undefined;

  // Fix 2: access specs instead of description (description doesn't exist on Product)
  const subtitle = product.specs;

  return (
    <div
      className={`${glass} rounded-3xl overflow-hidden flex flex-col group hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)] hover:bg-white/40 transition-all duration-300`}
    >
      {/* Image area with ambient blobs */}
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
            className="w-14 h-14 text-gray-400/60 relative z-10 group-hover:text-gray-500/70 transition-colors duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
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
        {subtitle && (
          <p className="text-gray-500 text-[13px] line-clamp-2 leading-relaxed">
            {subtitle}
          </p>
        )}
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-white/50">
          <span className="text-gray-800 font-bold text-base tracking-tight">
            ${Number(product.price).toFixed(2)}
          </span>
          <Badge stock={product.stock} />
        </div>
      </div>

      {/* Action row */}
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
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

// Fix 3: form category is always a plain string; we derive it from product.category
function getCategoryString(category?: Product["category"]): string {
  if (!category) return "";
  if (typeof category === "string") return category;
  return category.name ?? "";
}

function Modal({
  initial,
  onClose,
  onSave,
}: {
  initial?: Product | null;
  onClose: () => void;
  onSave: (data: Partial<Product>) => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    specs: initial?.specs ?? "",
    price: initial?.price ?? ("" as number | string),
    stock: initial?.stock ?? ("" as number | string),
    // Store category as plain string in the form
    categoryName: getCategoryString(initial?.category),
  });

  const handle = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = () => {
    if (!form.name || !form.price) return;
    onSave({
      name: form.name,
      specs: form.specs || undefined,
      price: Number(form.price),
      stock: form.stock !== "" ? Number(form.stock) : undefined,
      // Pass category as null when empty so the API receives a valid value
      category: form.categoryName
        ? ({ name: form.categoryName } as Product["category"])
        : null,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
      style={{ background: "rgba(180,190,210,0.4)", backdropFilter: "blur(24px)" }}
    >
      <div
        className={`${glass} w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl overflow-hidden`}
        style={{
          boxShadow:
            "0 24px 80px rgba(0,0,0,0.14), 0 0 0 1px rgba(255,255,255,0.55) inset",
        }}
      >
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-300/80" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/40">
          <h2 className="text-gray-800 font-semibold text-base">
            {initial ? "Edit Product" : "New Product"}
          </h2>
          <button
            onClick={onClose}
            className={`${glassBtn} w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 text-xs`}
          >
            ✕
          </button>
        </div>

        {/* Form fields */}
        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className="text-[11px] text-gray-400 mb-1.5 block uppercase tracking-wider font-medium">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handle}
              className={glassInput}
              placeholder="e.g. RTX 5090"
            />
          </div>

          <div>
            <label className="text-[11px] text-gray-400 mb-1.5 block uppercase tracking-wider font-medium">
              Specs
            </label>
            <textarea
              name="specs"
              value={form.specs}
              onChange={handle}
              rows={2}
              className={`${glassInput} resize-none`}
              placeholder="Short specs…"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-gray-400 mb-1.5 block uppercase tracking-wider font-medium">
                Price <span className="text-red-400">*</span>
              </label>
              <input
                name="price"
                type="number"
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
                value={form.stock}
                onChange={handle}
                className={glassInput}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-gray-400 mb-1.5 block uppercase tracking-wider font-medium">
              Category
            </label>
            <input
              name="categoryName"
              value={form.categoryName}
              onChange={handle}
              className={glassInput}
              placeholder="GPU, CPU, RAM…"
            />
          </div>
        </div>

        {/* Footer actions — fix 4: removed duplicate pb-6/pb-8 conflict */}
        <div className="flex gap-3 px-6 pb-8">
          <button
            onClick={onClose}
            className={`${glassBtn} flex-1 py-3 rounded-2xl text-gray-500 text-sm font-medium`}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className="flex-1 py-3 rounded-2xl bg-blue-500/80 backdrop-blur-md hover:bg-blue-500 text-white text-sm font-semibold border border-blue-400/40 shadow-[0_4px_16px_rgba(59,130,246,0.3)] transition-all duration-200"
          >
            {initial ? "Save Changes" : "Add Product"}
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

  const load = async () => {
    try {
      setError(null);
      const data = await getComputerProducts();
      setProducts(
        Array.isArray(data) ? data : (data as { data: Product[] }).data ?? []
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this product?")) return;
    await deleteComputerProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSave = async (data: Partial<Product>) => {
    if (editing) {
      const updated = await updateComputerProduct(editing.id, data);
      setProducts((prev) =>
        prev.map((p) => (p.id === editing.id ? updated : p))
      );
    } else {
      const created = await createComputerProduct(data);
      setProducts((prev) => [created, ...prev]);
    }
    setModalOpen(false);
    setEditing(null);
  };

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (p: Product) => { setEditing(p); setModalOpen(true); };

  const filtered = products.filter((p) => {
    const categoryName = getCategoryString(p.category);
    return [p.name, categoryName, p.specs]
      .filter(Boolean)
      .some((f) => f!.toLowerCase().includes(search.toLowerCase()));
  });

  return (
    <div
      className="min-h-screen font-sans relative overflow-x-hidden"
      style={{
        background:
          "linear-gradient(135deg, #ddeeff 0%, #ede8ff 35%, #fce4ec 65%, #daf4ff 100%)",
      }}
    >
      {/* Ambient background blobs */}
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

      {/* ── Header ── */}
      <header
        className="sticky top-0 z-30 bg-white/25 backdrop-blur-2xl border-b border-white/40 shadow-[0_2px_20px_rgba(0,0,0,0.06)] px-4 sm:px-6 py-3"
      >
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

          {/* Desktop search */}
          <div className="relative hidden sm:block w-60">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none select-none">
              🔍
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className={`${glassInput} pl-9`}
            />
          </div>

          <button
            onClick={openAdd}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-blue-500/75 backdrop-blur-md hover:bg-blue-500/90 active:scale-95 text-white text-sm font-semibold border border-blue-400/40 shadow-[0_4px_16px_rgba(59,130,246,0.28)] transition-all duration-200"
          >
            <span className="text-lg leading-none -mt-0.5">+</span>
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </header>

      {/* Mobile search bar */}
      <div className="sm:hidden px-4 pt-4">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none select-none">
            🔍
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className={`${glassInput} pl-9`}
          />
        </div>
      </div>

      {/* ── Content ── */}
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto">

        {loading && (
          <div className="flex flex-col items-center justify-center py-40 gap-5">
            <div
              className={`${glass} w-16 h-16 rounded-2xl flex items-center justify-center`}
            >
              <div className="w-7 h-7 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-gray-400 text-sm">Loading products…</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center py-40 gap-4 text-center">
            <div className={`${glass} rounded-3xl px-8 py-7 max-w-xs w-full`}>
              <div className="text-3xl mb-3">⚠️</div>
              <p className="text-red-500 font-medium text-sm mb-5">{error}</p>
              <button
                onClick={() => { setLoading(true); load(); }}
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
              {search ? "🔍" : "📦"}
            </div>
            <div>
              <p className="text-gray-600 font-semibold">
                {search ? `No results for "${search}"` : "No products yet"}
              </p>
              {!search && (
                <p className="text-gray-400 text-sm mt-1">
                  Tap + to add your first product
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
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {modalOpen && (
        <Modal
          initial={editing}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}