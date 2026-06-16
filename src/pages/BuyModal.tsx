import { useState } from "react";
import { placeOrder, type Product } from "../fetchApi/fetchApi";

// ─── Design Tokens (Liquid Glass System)
// Core philosophy: multi-layer translucency with chromatic light bending
// Each surface = frosted pane + inner glow rim + outer shadow moat

const glass = {
  // Outer shell – the deepest glass pane
  shell: [
    "relative overflow-hidden",
    "bg-white/[0.08] backdrop-blur-2xl",
    "border border-white/20",
    "shadow-[0_32px_80px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-1px_0_rgba(0,0,0,0.15)]",
    "rounded-[2rem]",
  ].join(" "),

  // Inner card surface – lighter, feels raised
  surface: [
    "bg-white/[0.06] backdrop-blur-xl",
    "border border-white/15",
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(0,0,0,0.08)]",
    "rounded-2xl",
  ].join(" "),

  // Product card – vivid tinted glass
  productCard: [
    "bg-gradient-to-br from-white/20 to-blue-400/10 backdrop-blur-md",
    "border border-white/30",
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_4px_20px_rgba(59,130,246,0.12)]",
    "rounded-2xl",
  ].join(" "),

  // Input fields
  input: [
    "w-full bg-white/10 backdrop-blur-sm",
    "border border-white/25",
    "rounded-xl px-4 py-3",
    "text-white text-sm placeholder:text-white/35",
    "focus:outline-none focus:border-white/50 focus:bg-white/15 focus:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]",
    "transition-all duration-200",
    "shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]",
  ].join(" "),

  // Qty stepper button
  stepBtn: [
    "w-10 h-10 sm:w-11 sm:h-11",
    "bg-white/15 backdrop-blur-sm",
    "border border-white/25 hover:border-white/40",
    "hover:bg-white/25 active:bg-white/10 active:scale-95",
    "rounded-xl flex items-center justify-center",
    "text-white font-bold text-lg",
    "transition-all duration-150",
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_6px_rgba(0,0,0,0.2)]",
    "disabled:opacity-30 disabled:cursor-not-allowed",
  ].join(" "),

  // Cancel / secondary button
  cancelBtn: [
    "flex-1 py-3 px-4",
    "bg-white/10 backdrop-blur-sm",
    "border border-white/20 hover:border-white/35",
    "hover:bg-white/18 active:bg-white/8 active:scale-[0.98]",
    "rounded-2xl",
    "text-white/75 hover:text-white text-sm font-medium",
    "transition-all duration-200",
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
  ].join(" "),

  // Primary CTA
  primaryBtn: [
    "flex-1 py-3 px-4",
    "bg-gradient-to-br from-blue-400/80 via-blue-500/80 to-indigo-500/80 backdrop-blur-md",
    "border border-blue-300/30 hover:border-blue-300/50",
    "hover:from-blue-400/90 hover:via-blue-500/90 hover:to-indigo-500/90",
    "active:scale-[0.98]",
    "rounded-2xl",
    "text-white text-sm font-semibold",
    "shadow-[0_4px_24px_rgba(59,130,246,0.4),inset_0_1px_0_rgba(255,255,255,0.25)]",
    "transition-all duration-200",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
    "flex items-center justify-center gap-2",
  ].join(" "),
};

// Chromatic prism overlay — pure CSS, no JS
function PrismOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-[2rem] overflow-hidden"
    >
      {/* Top specular highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      {/* Inner glow — top-left corner catch */}
      <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white/[0.04] blur-2xl" />
      {/* Chromatic accent — bottom right */}
      <div className="absolute -bottom-16 -right-16 w-72 h-72 rounded-full bg-blue-400/[0.06] blur-3xl" />
      {/* Subtle rainbow sheen across glass face */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          background:
            "linear-gradient(135deg, #ff6b6b 0%, #ffd93d 20%, #6bcb77 40%, #4d96ff 60%, #c77dff 80%, #ff6b6b 100%)",
        }}
      />
    </div>
  );
}

// ─── Buy Modal
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
    if (!tableNumber.trim()) return setError("Please enter your table number.");
    if (!floor.trim()) return setError("Please enter the floor.");
    if (!qty || Number(qty) < 1) return setError("Quantity must be at least 1.");

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
          : "Failed to place order. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Success State
  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-md"
          onClick={onClose}
        />

        <div className={`relative z-10 w-full max-w-xs sm:max-w-sm ${glass.shell}`}>
          <PrismOverlay />

          <div className="relative z-10 flex flex-col items-center gap-5 px-6 sm:px-8 py-10 text-center">
            {/* Success icon */}
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl ${glass.surface}`}
            >
              ✅
            </div>

            <div className="space-y-2">
              <h3 className="text-white font-bold text-xl sm:text-2xl tracking-tight">
                Order Placed!
              </h3>
              <p className="text-white/60 text-sm sm:text-base leading-relaxed">
                <span className="font-semibold text-white">{product.name}</span>{" "}
                × {qty} headed to{" "}
                <span className="text-blue-300 font-semibold">
                  Table {tableNumber}
                </span>
                ,{" "}
                <span className="text-blue-300 font-semibold">
                  Floor {floor}
                </span>
                .
              </p>
            </div>

            {/* Total chip */}
            <div
              className={`w-full py-3 px-5 flex items-center justify-between ${glass.productCard}`}
            >
              <span className="text-white/55 text-sm">Total paid</span>
              <span className="text-white font-bold text-xl">
                ${total.toFixed(2)}
              </span>
            </div>

            <button onClick={onClose} className={`w-full ${glass.primaryBtn} py-3.5`}>
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Order Form
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 p-0">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Sheet on mobile, centered modal on sm+ */}
      <div
        className={`
          relative z-10 w-full
          sm:max-w-md
          ${glass.shell}
          rounded-t-[2rem] sm:rounded-[2rem]
        `}
      >
        <PrismOverlay />

        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3.5 pb-1 sm:hidden" aria-hidden="true">
          <div className="w-10 h-1 rounded-full bg-white/25" />
        </div>

        {/* ── Header */}
        <div className="relative z-10 flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-white font-semibold text-base sm:text-lg tracking-tight">
              Place Order
            </h2>
            <p className="text-white/40 text-xs mt-0.5">
              Confirm your delivery details
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className={`
              w-8 h-8 rounded-xl
              flex items-center justify-center
              bg-white/10 border border-white/20
              hover:bg-white/20 active:scale-95
              text-white/60 hover:text-white text-xs
              transition-all duration-150
              shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]
            `}
          >
            ✕
          </button>
        </div>

        {/* ── Product summary card */}
        <div className="relative z-10 mx-5 sm:mx-6 mt-5">
          <div className={`flex items-center gap-4 p-4 ${glass.productCard}`}>
            {/* Thumbnail */}
            <div
              className={`
                w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0
                flex items-center justify-center
                bg-white/10 border border-white/20
              `}
            >
              {product.image_url || product.image ? (
                <img
                  src={product.image_url || product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl sm:text-3xl">🥤</span>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="text-white font-semibold text-sm sm:text-base truncate">
                {product.name}
              </p>
              {product.brand && (
                <p className="text-white/45 text-xs mt-0.5">{product.brand}</p>
              )}
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-blue-300 font-bold text-sm sm:text-base">
                  ${price.toFixed(2)}
                </span>
                <span className="text-white/30 text-xs">per item</span>
              </div>
            </div>

            {/* Per-unit price badge */}
            <div className="shrink-0">
              <span
                className="
                  text-[10px] font-semibold uppercase tracking-widest
                  text-blue-300/80 bg-blue-400/15
                  border border-blue-400/20
                  rounded-lg px-2 py-1
                "
              >
                Drink
              </span>
            </div>
          </div>
        </div>

        {/* ── Error banner */}
        {error && (
          <div className="relative z-10 mx-5 sm:mx-6 mt-4">
            <div
              className="
                rounded-xl px-4 py-3 text-sm
                bg-red-500/15 border border-red-400/25
                text-red-200
                shadow-[inset_0_1px_0_rgba(255,100,100,0.2)]
              "
            >
              {error}
            </div>
          </div>
        )}

        {/* ── Form fields */}
        <div className="relative z-10 p-5 sm:p-6 space-y-4">
          {/* Quantity stepper */}
          <div>
            <label className="text-[10px] sm:text-[11px] text-white/45 mb-2 block uppercase tracking-widest font-medium">
              Quantity <span className="text-red-400/80">*</span>
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQty((q) => String(Math.max(1, Number(q) - 1)))}
                disabled={submitting}
                className={glass.stepBtn}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                disabled={submitting}
                className={`${glass.input} text-center font-semibold`}
              />
              <button
                onClick={() => setQty((q) => String(Number(q) + 1))}
                disabled={submitting}
                className={glass.stepBtn}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          {/* Table + Floor row — side by side on wider screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] sm:text-[11px] text-white/45 mb-2 block uppercase tracking-widest font-medium">
                Table number <span className="text-red-400/80">*</span>
              </label>
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => {
                  setError(null);
                  setTableNumber(e.target.value);
                }}
                disabled={submitting}
                className={glass.input}
                placeholder="e.g. 12"
              />
            </div>

            <div>
              <label className="text-[10px] sm:text-[11px] text-white/45 mb-2 block uppercase tracking-widest font-medium">
                Floor <span className="text-red-400/80">*</span>
              </label>
              <input
                type="text"
                value={floor}
                onChange={(e) => {
                  setError(null);
                  setFloor(e.target.value);
                }}
                disabled={submitting}
                className={glass.input}
                placeholder="e.g. 2nd Floor"
              />
            </div>
          </div>

          {/* Total row */}
          <div
            className={`
              flex items-center justify-between
              px-5 py-3.5
              ${glass.surface}
            `}
          >
            <div>
              <p className="text-white/40 text-xs uppercase tracking-widest font-medium">
                Total
              </p>
              <p className="text-white/55 text-xs mt-0.5">
                {qty} × ${price.toFixed(2)}
              </p>
            </div>
            <span className="text-white font-bold text-2xl sm:text-3xl tracking-tight">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* ── Actions */}
        <div className="relative z-10 flex gap-3 px-5 sm:px-6 pb-6 sm:pb-5 pt-1">
          <button
            onClick={onClose}
            disabled={submitting}
            className={glass.cancelBtn}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={glass.primaryBtn}
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