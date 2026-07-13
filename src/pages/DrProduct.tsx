import { useEffect, useState } from "react";
import BuyModal from "../components/BuyModal";
import ProductCard from "../components/ProductCard";
import Modal from "../components/Modal";
import Navbar from "../components/Navbar";
import { FaSearch } from "react-icons/fa";
import {
  getComputerProducts,
  deleteComputerProduct,
  createComputerProduct,
  updateComputerProduct,
  type Product,
  type ProductPayload,
  type AuthUser,
} from "../fetchApi/fetchApi";
import { useNavigate } from "react-router-dom";

export default function DrProduct() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [buyProduct, setBuyProduct] = useState<Product | null>(null);

  const isAdmin = user?.role?.toUpperCase() === "ADMIN";
  const isLoggedIn = user !== null;
  const navToDash = useNavigate();

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
  }, []);

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
    <div className="min-h-screen overflow-x-hidden bg-stone-50 text-stone-900">
      <Navbar
        productsCount={products.length}
        onSearchChange={setSearch}
        onOpenAdd={openAdd}
        onOpenDashboard={() => {
          if (!isAdmin) return;
          navToDash("/dashboard");
        }}
        onAuthChange={setUser}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {loading && (
          <div className="flex flex-col items-center justify-center gap-4 py-28">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-stone-200 bg-white">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
            <p className="text-sm text-stone-500">Loading drinks…</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center py-24 text-center">
            <div className="w-full max-w-sm rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
              <p className="mb-5 text-sm font-medium text-red-600">{error}</p>
              <button
                onClick={() => {
                  setLoading(true);
                  load();
                }}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-stone-200 bg-white text-3xl">
              {search ? <FaSearch /> : ""}
            </div>
            <p className="text-base font-semibold text-stone-700">
              {search ? `No results for "${search}"` : "No drinks yet"}
            </p>
            {!search && isAdmin && (
              <p className="mt-1 text-sm text-stone-500">
                Tap + to add your first drink
              </p>
            )}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

      {buyProduct && (
        <BuyModal product={buyProduct} onClose={() => setBuyProduct(null)} />
      )}
    </div>
  );
}
