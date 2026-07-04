import { MdDone } from "react-icons/md";
import { useState } from "react";
import { placeComputerShopOrder, type Product } from "../api/fetchApi";

// ─── Buy Modal
function BuyModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const [address, setAddress] = useState("");
  const [qty, setQty] = useState("1");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const price =
    typeof product.price === "number" ? product.price : Number(product.price);
  const total = price * (Number(qty) || 1);

  const handleSubmit = async () => {
    setError(null);
    if (!address.trim()) return setError("Please enter your shipping address.");
    if (!qty || Number(qty) < 1)
      return setError("Quantity must be at least 1.");

    setSubmitting(true);
    try {
      await placeComputerShopOrder({
        computer_product_id: product.id,
        product_name: product.name,
        unit_price: price,
        quantity: Number(qty),
        address: address.trim(),
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

  // ─── Success State
  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40"
          onClick={onClose}
        />

        <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
            {/* Success icon */}
            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-green-50 border border-green-100">
              <MdDone className="text-green-600 text-2xl" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-gray-900 font-semibold text-lg sm:text-xl">
                Order placed
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                <span className="font-medium text-gray-700">{product.name}</span>{" "}
                × {qty} will be shipped to{" "}
                <span className="text-gray-700 font-medium">{address}</span>.
              </p>
            </div>

            {/* Total chip */}
            <div className="w-full py-3 px-4 flex items-center justify-between bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-gray-500 text-sm">Total paid</span>
              <span className="text-gray-900 font-semibold text-lg">
                ${total.toFixed(2)}
              </span>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-gray-900 hover:bg-gray-800 active:scale-[0.98] text-white text-sm font-medium transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Order Form
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Sheet on mobile, centered modal on sm+ */}
      <div className="relative z-10 w-full sm:max-w-md max-h-[92vh] sm:max-h-[90vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border border-gray-100">
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden" aria-hidden="true">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* ── Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-gray-900 font-semibold text-base sm:text-lg">
              Place order
            </h2>
            <p className="text-gray-400 text-xs mt-0.5">
              Confirm your shipping details
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 active:scale-95 text-gray-500 hover:text-gray-700 text-xs transition-all"
          >
            ✕
          </button>
        </div>

        {/* ── Product summary card */}
        <div className="mx-5 sm:mx-6 mt-5">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            {/* Thumbnail */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden shrink-0 flex items-center justify-center bg-white border border-gray-200">
              {product.image_url || product.image ? (
                <img
                  src={
                    (product.image_url ||
                      (typeof product.image === "string"
                        ? product.image
                        : undefined)) as string
                  }
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl sm:text-3xl">💻</span>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="text-gray-900 font-medium text-sm sm:text-base truncate">
                {product.name}
              </p>
              {product.brand && (
                <p className="text-gray-400 text-xs mt-0.5">{product.brand}</p>
              )}
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-gray-900 font-semibold text-sm sm:text-base">
                  ${price.toFixed(2)}
                </span>
                <span className="text-gray-400 text-xs">per item</span>
              </div>
            </div>

            {/* Type badge */}
            <div className="shrink-0">
              <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500 bg-white border border-gray-200 rounded-md px-2 py-1">
                {product.type || "Computer"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Error banner */}
        {error && (
          <div className="mx-5 sm:mx-6 mt-4">
            <div className="rounded-lg px-4 py-3 text-sm bg-red-50 border border-red-100 text-red-600">
              {error}
            </div>
          </div>
        )}

        {/* ── Form fields */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Quantity stepper */}
          <div>
            <label className="text-xs text-gray-500 mb-2 block uppercase tracking-wide font-medium">
              Quantity <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  setQty((q) => String(Math.max(1, Number(q) - 1)))
                }
                disabled={submitting}
                aria-label="Decrease quantity"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 border border-gray-200 active:scale-95 text-gray-700 font-semibold text-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                −
              </button>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                disabled={submitting}
                className="w-full text-center font-medium bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-gray-400 transition-all"
              />
              <button
                onClick={() => setQty((q) => String(Number(q) + 1))}
                disabled={submitting}
                aria-label="Increase quantity"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 border border-gray-200 active:scale-95 text-gray-700 font-semibold text-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>

          {/* Shipping address */}
          <div>
            <label className="text-xs text-gray-500 mb-2 block uppercase tracking-wide font-medium">
              Shipping address <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => {
                setError(null);
                setAddress(e.target.value);
              }}
              disabled={submitting}
              placeholder="e.g. 123 Main St, Apt 4B, City"
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition-all"
            />
          </div>

          {/* Total row */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide font-medium">
                Total
              </p>
              <p className="text-gray-500 text-xs mt-0.5">
                {qty} × ${price.toFixed(2)}
              </p>
            </div>
            <span className="text-gray-900 font-semibold text-xl sm:text-2xl">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* ── Actions */}
        <div className="flex gap-3 px-5 sm:px-6 pb-6 sm:pb-5 pt-1">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-3 px-4 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 active:scale-[0.98] text-gray-600 hover:text-gray-900 text-sm font-medium transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-3 px-4 rounded-xl bg-gray-900 hover:bg-gray-800 active:scale-[0.98] text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Placing order…
              </>
            ) : (
              "Confirm order"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BuyModal;