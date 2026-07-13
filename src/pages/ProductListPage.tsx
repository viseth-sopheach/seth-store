import { useCallback, useEffect, useRef, useState } from "react";
import BuyModal from "../components/BuyModal";
import Modal, { type ComputerPayload } from "../components/Modal";
import ProductGrid from "../components/Productgrid";
import {
  usePublishNavbarData,
  useNavbarContext,
} from "../components/Navbarcontext";
import {
  getComputerProducts,
  deleteComputerProduct,
  createComputerProduct,
  updateComputerProduct,
  normalizeApiAssetUrl,
  type Product,
} from "../api/fetchApi";
import { getCategoryString } from "../components/types";
interface ProductListPageProps {
  pageType: "laptop" | "desktop" | "accessory";
}

// PcProduct.tsx

const PRODUCTS_CACHE_KEY = "pc_products_cache_v1";

function readProductsCache(): Product[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((product) => ({
      ...product,
      image_url: normalizeApiAssetUrl(product.image_url),
      image:
        typeof product.image === "string"
          ? (normalizeApiAssetUrl(product.image) ?? product.image)
          : product.image,
    }));
  } catch {
    return [];
  }
}

function writeProductsCache(products: Product[]) {
  try {
    localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(products));
  } catch {}
}

// ─── PcProduct

export default function PcProduct({ pageType }: ProductListPageProps) {
  const { user, products, setProducts, productsLoaded, setProductsLoaded } =
    useNavbarContext();

  // ── Hydrate from localStorage immediately on mount (before fetch), so a
  // Ctrl+R shows the last-seen grid right away instead of skeletons/spinner.
  const hydratedRef = useRef(false);

  // `loading` = true only when there's truly nothing to show yet (no live
  // data, no cache hit). `refreshing` = true for any background refetch —
  // page shell + existing cards stay mounted throughout.
  const [loading, setLoading] = useState(
    !productsLoaded && products.length === 0,
  );
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [buyProduct, setBuyProduct] = useState<Product | null>(null);

  const fetchInFlight = useRef(false);

  const isAdmin = user?.role?.toUpperCase() === "ADMIN";
  const isLoggedIn = user !== null;

  useEffect(() => {
    if (hydratedRef.current || products.length > 0) return;

    const cached = readProductsCache();
    if (cached.length > 0) {
      setProducts(cached);
      setLoading(false);
    }

    hydratedRef.current = true;
  }, [products.length, setProducts]);

  // ── Bootstrap — always (re)confirm with a background fetch, but never
  // block the UI if we already have cached or context data to show.
  useEffect(() => {
    load({ silent: products.length > 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Data loading
  const load = async ({ silent = true }: { silent?: boolean } = {}) => {
    if (fetchInFlight.current) return;
    fetchInFlight.current = true;

    try {
      setError(null);
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await getComputerProducts();
      const list = Array.isArray(data) ? data : ((data as any).data ?? []);
      setProducts(list);
      setProductsLoaded(true);
      writeProductsCache(list); // keep cache fresh for the next hard reload
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load products.");
    } finally {
      setLoading(false);
      setRefreshing(false);
      fetchInFlight.current = false;
    }
  };

  // ── CRUD

  const handleDelete = async (id: number) => {
    try {
      await deleteComputerProduct(id);
      setProducts((prev) => {
        const next = prev.filter((p) => p.id !== id);
        writeProductsCache(next);
        return next;
      });
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
    await load({ silent: true });
    setModalOpen(false);
    setEditing(null);
  };

  const openAdd = useCallback(() => {
    setEditing(null);
    setModalOpen(true);
  }, []);

  const openEdit = (p: Product) => {
    setEditing(p);
    setModalOpen(true);
  };

  // ── Filtering

  const filtered = products.filter((p) => {
    // Only show products whose `type` matches this page's category
    if (p.type?.toLowerCase() !== pageType) return false;

    const categoryName = getCategoryString(p.category);
    return [p.name, p.brand, p.type, categoryName, p.specs]
      .filter(Boolean)
      .some((f) => f!.toLowerCase().includes(search.toLowerCase()));
  });

  // ── Publish data to Navbar (rendered once in App.tsx, outside this page)

  usePublishNavbarData({
    productCount: products.length,
    loadingProducts: loading || refreshing,
    search,
    onSearchChange: setSearch,
    onAdd: isAdmin ? openAdd : undefined,
  });

  // ── Render

  return (
    <>
      <ProductGrid
        // Only true when there's no live data AND no cache hit — should be
        // rare after the first-ever visit on a given browser.
        loading={loading && products.length === 0}
        refreshing={refreshing}
        error={error}
        products={filtered}
        search={search}
        isAdmin={isAdmin}
        isLoggedIn={isLoggedIn}
        onRetry={() => load({ silent: products.length > 0 })}
        onEdit={openEdit}
        onDelete={handleDelete}
        onBuy={setBuyProduct}
      />

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
    </>
  );
}
