import { useEffect, useState } from "react";
import { Loader2, PackageX, ShoppingCart } from "lucide-react";
import { getComputerProducts } from "../api/fetchApi";
import type { Product } from "../api/fetchApi";
import { glass, glassBtn } from "../components/glassTokens";

const CATEGORY_NAME = "Desktop";

export default function Desktop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const all = await getComputerProducts();
        const filtered = all.filter(
          (p) =>
            p.category?.name?.toLowerCase() === CATEGORY_NAME.toLowerCase(),
        );
        if (!cancelled) setProducts(filtered);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load products",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
          Desktops
        </h1>
        <span className="text-sm text-gray-500">
          {products.length} item{products.length !== 1 ? "s" : ""}
        </span>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-gray-500 gap-2">
          <Loader2 className="animate-spin" size={20} />
          Loading desktops...
        </div>
      )}

      {!loading && error && (
        <div
          className={`${glass} rounded-3xl p-6 text-center text-sm text-red-500`}
        >
          {error}
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div
          className={`${glass} rounded-3xl p-10 flex flex-col items-center gap-3 text-gray-500`}
        >
          <PackageX size={28} />
          <p className="text-sm">No desktops available right now.</p>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((product) => (
            <article
              key={product.id}
              className={`${glass} rounded-3xl p-4 flex flex-col gap-3`}
            >
              <div className="aspect-[4/3] rounded-2xl bg-white/40 overflow-hidden flex items-center justify-center">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-gray-400">No image</span>
                )}
              </div>

              <div className="flex-1 flex flex-col gap-1">
                {product.brand && (
                  <span className="text-[11px] uppercase tracking-wide text-gray-400">
                    {product.brand}
                  </span>
                )}
                <h3 className="text-sm font-semibold text-gray-800 leading-snug">
                  {product.name}
                </h3>
                {product.specs && (
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {product.specs}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/40">
                <span className="text-sm font-semibold text-gray-800">
                  ${Number(product.price).toFixed(2)}
                </span>
                <button
                  className={`${glassBtn} rounded-xl px-3 py-1.5 text-xs font-medium text-gray-800 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart size={14} />
                  {product.stock === 0 ? "Out of stock" : "Buy"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
