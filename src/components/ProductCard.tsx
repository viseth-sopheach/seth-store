import { useState } from "react";
import { type Product } from "../fetchApi/fetchApi";

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
      <div className="group flex h-full flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
        <div className="relative flex h-44 items-center justify-center overflow-hidden border-b border-stone-100 bg-stone-50">
          {product.image_url || product.image ? (
            <img
              src={product.image_url || product.image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-stone-200 bg-white text-stone-400">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.2}
                  d="M9 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V8l-5-5zM9 3v5h9"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-5">
          {categoryName && (
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-600">
              {categoryName}
            </span>
          )}
          <h3 className="text-base font-semibold leading-snug text-stone-900">
            {product.name}
          </h3>
          {product.brand && <p className="text-sm text-stone-500">{product.brand}</p>}
          {product.type && (
            <span className="inline-flex w-fit rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-medium capitalize text-stone-600">
              {product.type}
            </span>
          )}

          <div className="mt-auto flex items-center justify-between border-t border-stone-100 pt-4">
            <span className="text-base font-semibold text-stone-900">
              ${" "}
              {typeof product.price === "number"
                ? product.price.toFixed(2)
                : Number(product.price).toFixed(2)}
            </span>
            {isLoggedIn ? (
              <button
                onClick={() => onBuy(product)}
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700"
              >
                Buy
              </button>
            ) : (
              <button
                disabled
                title="Login to buy"
                className="cursor-not-allowed rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-400"
              >
                Buy
              </button>
            )}
          </div>
        </div>

        {isAdmin && (
          <div className="flex border-t border-stone-100">
            <button
              onClick={() => onEdit(product)}
              className="flex-1 py-3 text-sm font-medium text-stone-600 transition-colors duration-200 hover:bg-stone-50 hover:text-blue-600"
            >
              Edit
            </button>
            <div className="w-px bg-stone-100" />
            <button
              onClick={() => setShowModal(true)}
              className="flex-1 py-3 text-sm font-medium text-stone-600 transition-colors duration-200 hover:bg-stone-50 hover:text-red-600"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-stone-200 bg-white p-6 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>

            <h3 className="mb-2 text-lg font-semibold text-stone-900">Delete item?</h3>
            <p className="mb-6 text-sm leading-relaxed text-stone-500">
              Are you sure you want to delete <span className="font-medium text-stone-700">{product.name}</span>? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-600 transition-colors duration-200 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(product.id);
                  setShowModal(false);
                }}
                className="flex-1 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-red-700"
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
