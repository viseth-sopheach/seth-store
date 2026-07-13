import { FaSearch, FaBoxOpen } from "react-icons/fa";
import type { Product } from "../api/fetchApi";
import ProductCard from "./ProductCard";
import { glass, glassBtn } from "./glassTokens";

interface ProductGridProps {
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  products: Product[];
  search: string;
  isAdmin: boolean;
  isLoggedIn: boolean;
  onRetry: () => void;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  onBuy: (product: Product) => void;
}

export default function ProductGrid({
  loading,
  refreshing,
  error,
  products,
  search,
  isAdmin,
  isLoggedIn,
  onRetry,
  onEdit,
  onDelete,
  onBuy,
}: ProductGridProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <div
          className={`${glass} flex h-16 w-16 items-center justify-center rounded-2xl`}
        >
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-stone-900 border-t-transparent" />
        </div>
        <p className="text-sm text-stone-500">Loading products…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center py-24 text-center">
        <div className={`${glass} w-full max-w-sm rounded-[1.5rem] px-8 py-7`}>
          <p className="mb-4 text-sm font-medium text-red-600">{error}</p>
          <button onClick={onRetry} className={`${glassBtn} w-full`}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <div
          className={`${glass} flex h-20 w-20 items-center justify-center rounded-[1.5rem]`}
        >
          {search ? (
            <FaSearch className="text-stone-500" />
          ) : (
            <FaBoxOpen className="text-stone-500" />
          )}
        </div>
        <div className="max-w-sm rounded-[1.25rem] border border-stone-200 bg-white px-6 py-4 shadow-sm">
          <p className="font-semibold text-stone-900">
            {search ? `No results for "${search}"` : "No products yet"}
          </p>
          {!search && isAdmin && (
            <p className="mt-1 text-sm text-stone-600">
              Tap + to add your first product.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {refreshing && (
        <div
          className={`${glass} absolute -top-10 right-0 z-10 flex items-center gap-2 rounded-full px-3 py-1.5 text-xs text-stone-600`}
        >
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-stone-900 border-t-transparent" />
          Refreshing…
        </div>
      )}
      <div
        className={`grid grid-cols-1 gap-4 transition-opacity sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${refreshing ? "opacity-70" : "opacity-100"}`}
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isAdmin={isAdmin}
            isLoggedIn={isLoggedIn}
            onEdit={onEdit}
            onDelete={onDelete}
            onBuy={onBuy}
          />
        ))}
      </div>
    </div>
  );
}
