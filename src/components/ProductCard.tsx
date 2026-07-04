import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { type Product } from "../api/fetchApi";
import { getCategoryString } from "./types";
import { useState } from "react";

const glassBtn =
  "bg-white/30 backdrop-blur-md border border-white/50 hover:bg-white/50 transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.06)]";

function Badge({ stock }: { stock?: number }) {
  if (stock === undefined) return null;
  const inStock = stock > 0;
  return (
    <span
      className={`shrink-0 whitespace-nowrap text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-md border ${
        inStock
          ? "bg-emerald-400/20 text-emerald-700 border-emerald-300/50"
          : "bg-red-400/20 text-red-600 border-red-300/50"
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
  const image =
    product.image_url ||
    (typeof product.image === "string" ? product.image : null);
  const categoryName = getCategoryString(product.category);
  const price =
    typeof product.price === "number" ? product.price : Number(product.price);
  const outOfStock = (product.stock ?? 0) <= 0;
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="bg-white/30 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-2xl overflow-hidden flex flex-col w-full h-full">
      {/* Image */}
      <div className="h-36 sm:h-40 bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-4xl">💻</span>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-gray-800 font-semibold text-sm leading-tight truncate min-w-0">
            {product.name}
          </h3>
          <Badge stock={product.stock} />
        </div>

        {product.brand && (
          <p className="text-gray-500 text-xs truncate">{product.brand}</p>
        )}

        {categoryName && (
          <span className="self-start max-w-full truncate text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-400/15 text-blue-700 border border-blue-300/30">
            {categoryName}
          </span>
        )}

        {product.specs && (
          <p className="text-gray-500 text-xs line-clamp-2 break-words">
            {product.specs}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2 gap-2">
          <span className="text-gray-800 font-bold text-base truncate">
            ${price.toFixed(2)}
          </span>
        </div>

        {/* Actions: Admin gets Edit/Delete, logged-in non-admin gets Buy, guest gets nothing */}
        {isAdmin ? (
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => onEdit(product)}
              className={`${glassBtn} flex-1 py-2 rounded-xl text-xs font-medium text-gray-700 truncate`}
            >
              Edit
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className={`${glassBtn} flex-1 py-2 rounded-xl text-xs font-medium text-red-600 truncate`}
            >
              Delete
            </button>
          </div>
        ) : isLoggedIn ? (
          <button
            onClick={() => onBuy(product)}
            disabled={outOfStock}
            className="w-full py-2 rounded-xl bg-blue-500/85 hover:bg-blue-500 text-white text-xs font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed mt-2 truncate"
          >
            {outOfStock ? "Out of stock" : "Buy"}
          </button>
        ) : (
          <p className="text-[11px] text-gray-400 italic text-center pt-2">
            Login to buy
          </p>
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
