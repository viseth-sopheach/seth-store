import { useEffect, useState } from "react";
import BuyModal from "./BuyModal";
import ProductCard from "./ProductCard";
import Modal, { type ComputerPayload } from "./Modal";
import { FaSearch } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";
import {
  getComputerProducts,
  deleteComputerProduct,
  createComputerProduct,
  updateComputerProduct,
  loginUser,
  logoutUser,
  fetchAuthUser,
  type Product,
  type AuthUser,
} from "../api/fetchApi";
import { getCategoryString } from "./types";

// ─── Liquid Glass Tokens -----

const glass =
  "bg-white/30 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)]";

const glassInput =
  "w-full bg-white/20 backdrop-blur-md border border-white/50 rounded-2xl px-4 py-2.5 text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:border-white/70 focus:bg-white/30 transition-all duration-200 shadow-inner";

const glassBtn =
  "bg-white/30 backdrop-blur-md border border-white/50 hover:bg-white/50 transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.06)]";

// ─── Badge

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

// ─── Page ─────

export default function PcProduct() {
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
  const [showPassword, setShowPassword] = useState(false);
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
    if (!confirm("Delete this product?")) return;
    try {
      await deleteComputerProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed.");
    }
  };

  const handleSave = async (data: ComputerPayload) => {
    if (editing) {
      await updateComputerProduct(editing.id, data as any);
    } else {
      await createComputerProduct(data as any);
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

  const filtered = products.filter((p) => {
    const categoryName = getCategoryString(p.category);
    return [p.name, p.brand, p.type, categoryName, p.specs]
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
          <div className="px-7 pt-1 flex-1 min-w-0">
            <h1 className="text-gray-800 font-bold text-lg sm:text-xl tracking-tight leading-tight">
              PC Products
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
              <button
                onClick={() => (window.location.href = "/dashboard")}
                className="bg-cyan-200 rounded-2xl py-2 px-4 border-t-cyan-600"
              >
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
              {user.name}
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
            placeholder="Search products…"
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
            <p className="text-gray-400 text-sm">Loading products…</p>
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
              {search ? "🔍" : "📦"}
            </div>
            <div>
              <p className="text-gray-600 font-semibold">
                {search ? `No results for "${search}"` : "No products yet"}
              </p>
              {!search && isAdmin && (
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
                <label className="text-[11px] text-black mb-1.5 block uppercase tracking-wider font-medium">
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
                <label className="text-[11px] text-black mb-1.5 block uppercase tracking-wider font-medium">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    className={`${glassInput} pr-10`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <FiEyeOff size={18} />
                    ) : (
                      <FiEye size={18} />
                    )}
                  </button>
                </div>
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
