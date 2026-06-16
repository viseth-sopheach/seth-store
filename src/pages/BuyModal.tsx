import { useEffect, useState } from "react";
import {
  placeOrder,
  type Product,
} from "../fetchApi/fetchApi";

const glass =
  "bg-white/30 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)]";

const glassInput =
  "w-full bg-white/20 backdrop-blur-md border border-white/50 rounded-2xl px-4 py-2.5 text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:border-white/70 focus:bg-white/30 transition-all duration-200 shadow-inner";

const glassBtn =
  "bg-white/30 backdrop-blur-md border border-white/50 hover:bg-white/50 transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.06)]";

const DRINK_TYPES = ["hot", "cold", "alcoholic", "non-alcoholic"] as const;


// ─── Buy Modal ────────────────────────────────────────────────────────────────

function BuyModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const [tableNumber, setTableNumber] = useState("");
  const [floor, setFloor] = useState("");
  const [qty, setQty] = useState("1");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const price =
    typeof product.price === "number" ? product.price : Number(product.price);

  const total = price * (Number(qty) || 1);

  const handleSubmit = async () => {
    setError(null);

    if (!tableNumber.trim()) {
      setError("Please enter your table number.");
      return;
    }
    if (!floor.trim()) {
      setError("Please enter the floor.");
      return;
    }
    if (!qty || Number(qty) < 1) {
      setError("Quantity must be at least 1.");
      return;
    }

    setSubmitting(true);
    try {
      await placeOrder({
        product_type: "drink",
        product_id: product.id,
        product_name: product.name,
        unit_price: price,
        quantity: Number(qty),
        table_number: tableNumber.trim(),
        floor: floor.trim(),
      });
      setSubmitted(true);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to place order. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-4xl bg-white/95 shadow-[0_30px_120px_rgba(13,33,75,0.15)] ring-1 ring-white/60 backdrop-blur-xl overflow-hidden">
          <div className="flex flex-col items-center gap-4 px-8 py-10 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-3xl">
              ✅
            </div>
            <h3 className="text-gray-800 font-bold text-lg">Order Placed!</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              <span className="font-semibold text-gray-700">
                {product.name}
              </span>{" "}
              × {qty} will be delivered to{" "}
              <span className="font-semibold text-blue-600">
                Table {tableNumber}
              </span>{" "}
              on{" "}
              <span className="font-semibold text-blue-600">Floor {floor}</span>
              .
            </p>
            <p className="text-gray-800 font-bold text-xl">
              Total: ${total.toFixed(2)}
            </p>
            <button
              onClick={onClose}
              className="mt-2 w-full py-3 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors duration-200"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-4xl bg-white/95 shadow-[0_30px_120px_rgba(13,33,75,0.15)] ring-1 ring-white/60 backdrop-blur-xl">
        {/* Handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-300/80" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-gray-800 font-semibold text-base">Place Order</h2>
          <button
            onClick={onClose}
            className={`${glassBtn} w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 text-xs`}
          >
            ✕
          </button>
        </div>

        {/* Product summary */}
        <div className="mx-6 mt-5 flex items-center gap-4 rounded-2xl bg-blue-50/60 border border-blue-100 px-4 py-3">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/60 flex-shrink-0 flex items-center justify-center border border-white/50">
            {product.image_url || product.image ? (
              <img
                src={product.image_url || product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl">🥤</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-800 font-semibold text-sm truncate">
              {product.name}
            </p>
            {product.brand && (
              <p className="text-gray-400 text-[12px]">{product.brand}</p>
            )}
            <p className="text-blue-600 font-bold text-sm mt-0.5">
              ${price.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="p-6 flex flex-col gap-4">
          {/* Quantity */}
          <div>
            <label className="text-[11px] text-gray-400 mb-1.5 block uppercase tracking-wider font-medium">
              Quantity <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  setQty((q) => String(Math.max(1, Number(q) - 1)))
                }
                disabled={submitting}
                className={`${glassBtn} w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 font-bold text-lg flex-shrink-0 disabled:opacity-50`}
              >
                −
              </button>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                disabled={submitting}
                className={`${glassInput} text-center`}
              />
              <button
                onClick={() => setQty((q) => String(Number(q) + 1))}
                disabled={submitting}
                className={`${glassBtn} w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 font-bold text-lg flex-shrink-0 disabled:opacity-50`}
              >
                +
              </button>
            </div>
          </div>

          {/* Table Number */}
          <div>
            <label className="text-[11px] text-gray-400 mb-1.5 block uppercase tracking-wider font-medium">
              Table Number <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={tableNumber}
              onChange={(e) => {
                setError(null);
                setTableNumber(e.target.value);
              }}
              disabled={submitting}
              className={glassInput}
              placeholder="e.g. 12"
            />
          </div>

          {/* Floor */}
          <div>
            <label className="text-[11px] text-gray-400 mb-1.5 block uppercase tracking-wider font-medium">
              Floor <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={floor}
              onChange={(e) => {
                setError(null);
                setFloor(e.target.value);
              }}
              disabled={submitting}
              className={glassInput}
              placeholder="e.g. 2nd Floor"
            />
          </div>

          {/* Total */}
          <div className="flex items-center justify-between rounded-2xl bg-gray-50/80 border border-gray-100 px-4 py-3">
            <span className="text-gray-500 text-sm">Total</span>
            <span className="text-gray-800 font-bold text-lg">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 py-5 border-t border-white/30">
          <button
            onClick={onClose}
            disabled={submitting}
            className={`${glassBtn} flex-1 py-3 rounded-2xl text-gray-500 text-sm font-medium disabled:opacity-50`}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-3 rounded-2xl bg-blue-500/90 backdrop-blur-md hover:bg-blue-500 text-white text-sm font-semibold border border-blue-400/40 shadow-[0_4px_16px_rgba(59,130,246,0.3)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {submitting ? "Placing Order…" : "Confirm Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BuyModal;