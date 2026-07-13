import { FaLaptopCode } from "react-icons/fa";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { type Product } from "../api/fetchApi";
import { getCategoryString } from "./types";
import { useState } from "react";

function Badge({ stock }: { stock?: number }) {
  if (stock === undefined) return null;
  const inStock = stock > 0;
  return (
    <span
      className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        inStock
          ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border border-red-200 bg-red-50 text-red-600"
      }`}
    >
      {inStock ? `${stock} in stock` : "Out of stock"}
    </span>
  );
}

export default function ProductCard({
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
  const image = product.image_url || (typeof product.image === "string" ? product.image : null);
  const categoryName = getCategoryString(product.category);
  const price = typeof product.price === "number" ? product.price : Number(product.price);
  const outOfStock = (product.stock ?? 0) <= 0;
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-[1.25rem] border border-stone-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
      <div className="flex h-40 items-center justify-center overflow-hidden bg-stone-100/70 sm:h-44">
        {image ? (
          <img src={image} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <FaLaptopCode className="text-5xl"/>
        )}
      </div>

      <div className="flex flex-1 min-w-0 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 truncate text-sm font-semibold text-stone-900">{product.name}</h3>
          <Badge stock={product.stock} />
        </div>

        {product.brand && <p className="truncate text-xs text-stone-500">{product.brand}</p>}

        {categoryName && (
          <span className="self-start max-w-full truncate rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-stone-600">
            {categoryName}
          </span>
        )}

        {product.specs && <p className="line-clamp-2 break-words text-xs text-stone-600">{product.specs}</p>}

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="truncate text-base font-semibold text-stone-900">${price.toFixed(2)}</span>
        </div>

        {isAdmin ? (
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => onEdit(product)}
              className="flex-1 rounded-xl border border-stone-300 bg-stone-100 px-3 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-200"
            >
              Edit
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="flex-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100"
            >
              Delete
            </button>
          </div>
        ) : isLoggedIn ? (
          <button
            onClick={() => onBuy(product)}
            disabled={outOfStock}
            className="mt-2 w-full rounded-xl bg-stone-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            {outOfStock ? "Out of stock" : "Buy"}
          </button>
        ) : (
          <p className="pt-2 text-center text-[11px] italic text-stone-400">Login to buy</p>
        )}
      </div>

      {showConfirm && (
        <ConfirmDeleteModal
          productName={product.name}
          onConfirm={() => {
            setShowConfirm(false);
            onDelete(product.id);
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
