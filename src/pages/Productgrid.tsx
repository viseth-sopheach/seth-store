import type { Product } from "../api/fetchApi";
import ProductCard from "./ProductCard";
import { glass, glassBtn } from "./glassTokens";

// ─── ProductGrid

interface ProductGridProps {
  loading: boolean;
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
  // ── Loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-5">
        <div
          className={`${glass} w-16 h-16 rounded-2xl flex items-center justify-center`}
        >
          <div className="w-7 h-7 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-gray-400 text-sm">Loading products…</p>
      </div>
    );
  }

  // ── Error
  if (error) {
    return (
      <div className="flex flex-col items-center py-40 gap-4 text-center">
        <div className={`${glass} rounded-3xl px-8 py-7 max-w-xs w-full`}>
          <div className="text-3xl mb-3">!</div>
          <p className="text-red-500 font-medium text-sm mb-5">{error}</p>
          <button
            onClick={onRetry}
            className={`${glassBtn} px-5 py-2.5 rounded-xl text-gray-600 text-sm font-medium w-full`}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // ── Empty
  if (products.length === 0) {
    return (
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
    );
  }

  // ── Grid
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
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
  );
}
