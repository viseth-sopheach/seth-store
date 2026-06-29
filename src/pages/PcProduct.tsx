import { useEffect, useState } from "react";
import BuyModal from "./BuyModal";
import Modal, { type ComputerPayload } from "./Modal";
import BackgroundBlobs from "./Backgroundblobs";
import ProductGrid from "./Productgrid";
import { usePublishNavbarData } from "./Navbarcontext";
import {
  getComputerProducts,
  deleteComputerProduct,
  createComputerProduct,
  updateComputerProduct,
  fetchAuthUser,
  logoutUser,
  type Product,
  type AuthUser,
} from "../api/fetchApi";
import { getCategoryString } from "./types";

// ─── PcProduct

export default function PcProduct() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [buyProduct, setBuyProduct] = useState<Product | null>(null);

  // Mirror of auth state — kept in sync via "auth-change" events from Navbar
  const [user, setUser] = useState<AuthUser | null>(null);

  const isAdmin = user?.role?.toUpperCase() === "ADMIN";
  const isLoggedIn = user !== null;

  // ── Bootstrap
  useEffect(() => {
    load();

    // Sync initial user
    fetchAuthUser()
      .then(setUser)
      .catch(() => setUser(null));

    // Re-sync whenever Navbar logs in or out
    const syncUser = () => {
      fetchAuthUser()
        .then(setUser)
        .catch(() => {
          logoutUser();
          setUser(null);
        });
    };
    window.addEventListener("auth-change", syncUser);
    return () => window.removeEventListener("auth-change", syncUser);
  }, []);

  // ── Data loading ──────────────────────────────────────────────────────────

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

  // ── CRUD ──────────────────────────────────────────────────────────────────

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

  // ── Filtering

  const filtered = products.filter((p) => {
    const categoryName = getCategoryString(p.category);
    return [p.name, p.brand, p.type, categoryName, p.specs]
      .filter(Boolean)
      .some((f) => f!.toLowerCase().includes(search.toLowerCase()));
  });

  // ── Publish data to Navbar (rendered once in App.tsx, outside this page) ──

  usePublishNavbarData({
    productCount: products.length,
    loadingProducts: loading,
    search,
    onSearchChange: setSearch,
    onAdd: isAdmin ? openAdd : undefined,
  });

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen font-sans relative overflow-x-hidden"
      style={{
        background:
          "linear-gradient(135deg, #ddeeff 0%, #ede8ff 35%, #fce4ec 65%, #daf4ff 100%)",
      }}
    >
      <BackgroundBlobs />

      {/* Main content */}
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto">
        <ProductGrid
          loading={loading}
          error={error}
          products={filtered}
          search={search}
          isAdmin={isAdmin}
          isLoggedIn={isLoggedIn}
          onRetry={() => {
            setLoading(true);
            load();
          }}
          onEdit={openEdit}
          onDelete={handleDelete}
          onBuy={setBuyProduct}
        />
      </main>

      {/* Add / Edit modal */}
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

      {/* Buy modal */}
      {buyProduct && (
        <BuyModal product={buyProduct} onClose={() => setBuyProduct(null)} />
      )}
    </div>
  );
}
