import { useState } from "react";
import { type Product } from "../fetchApi/fetchApi";

const glass =
  "bg-white/30 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)]";

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({
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
  const [showModal, setShowModal] = useState(false);
  const categoryName = product.category?.name ?? "";

  return (
    <>
      <div
        className={`${glass} rounded-3xl overflow-hidden flex flex-col group hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)] hover:bg-white/40 transition-all duration-300`}
      >
        {/* Image */}
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
              className="w-14 h-14 text-gray-400/60 relative z-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.2}
                d="M9 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V8l-5-5zM9 3v5h9"
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
          {product.brand && (
            <p className="text-gray-500 text-[13px] leading-relaxed">
              {product.brand}
            </p>
          )}
          {product.type && (
            <span className="self-start text-[11px] px-2 py-0.5 rounded-full bg-blue-100/60 text-blue-600 border border-blue-200/50 capitalize">
              {product.type}
            </span>
          )}
          <div className="mt-auto pt-3 flex items-center justify-between border-t border-white/50">
            <span className="text-gray-800 font-bold text-base tracking-tight">
              ${" "}
              {typeof product.price === "number"
                ? product.price.toFixed(2)
                : Number(product.price).toFixed(2)}
            </span>
            {isLoggedIn ? (
              <button
                onClick={() => onBuy(product)}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-full text-sm font-medium transition-colors duration-200"
              >
                BUY
              </button>
            ) : (
              <button
                disabled
                title="Login to buy"
                className="bg-gray-200 text-gray-400 py-2 px-4 rounded-full text-sm font-medium cursor-not-allowed"
              >
                BUY
              </button>
            )}
          </div>
        </div>

        {/* Admin actions */}
        {isAdmin && (
          <div className="flex border-t border-white/40">
            <button
              onClick={() => onEdit(product)}
              className="flex-1 py-3 text-[13px] text-gray-500 hover:text-blue-600 hover:bg-blue-500/5 transition-all duration-200 font-medium"
            >
              Edit
            </button>
            <div className="w-px bg-white/40" />
            <button
              onClick={() => setShowModal(true)}
              className="flex-1 py-3 text-[13px] text-gray-500 hover:text-red-500 hover:bg-red-500/5 transition-all duration-200 font-medium"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* ─── Delete Confirmation Modal ─────────────────────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-md"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-sm p-6 rounded-[2rem] bg-white/25 backdrop-blur-2xl border border-white/40 shadow-[0_30px_120px_rgba(0,0,0,0.12)] text-center animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="mx-auto w-16 h-16 rounded-full bg-red-500/15 border border-red-400/30 backdrop-blur-sm flex items-center justify-center mb-5 shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]">
              <svg
                className="w-8 h-8 text-red-300/90"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>

            <h3 className="text-white/90 font-semibold text-lg mb-2 drop-shadow-sm">
              Delete Item?
            </h3>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Are you sure you want to delete{" "}
              <span className="text-white/80 font-medium">{product.name}</span>?
              This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-2xl text-white/70 text-sm font-medium bg-white/15 backdrop-blur-md border border-white/30 hover:bg-white/25 hover:text-white/90 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(product.id);
                  setShowModal(false);
                }}
                className="flex-1 py-3 rounded-2xl text-white text-sm font-semibold bg-red-500/80 backdrop-blur-md border border-red-400/40 hover:bg-red-500 shadow-[0_4px_20px_rgba(239,68,68,0.3)] hover:shadow-[0_4px_30px_rgba(239,68,68,0.4)] transition-all duration-300"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProductCard;
