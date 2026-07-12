import { useState } from "react";
import { placeOrder, type Product } from "../fetchApi/fetchApi";

const surface = "rounded-2xl border border-stone-200 bg-stone-50";
const input =
  "w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const stepBtn =
  "flex h-11 w-11 items-center justify-center rounded-xl border border-stone-200 bg-white text-lg font-semibold text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50";
const cancelBtn =
  "flex-1 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-600 transition hover:bg-stone-50";
const primaryBtn =
  "flex flex-1 items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60";

function BuyModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [tableNumber, setTableNumber] = useState("");
  const [floor, setFloor] = useState("");
  const [qty, setQty] = useState("1");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const price = typeof product.price === "number" ? product.price : Number(product.price);
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
      setError(e instanceof Error ? e.message : "Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 p-4">
        <div className="w-full max-w-sm rounded-3xl border border-stone-200 bg-white p-6 text-center shadow-xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-2xl font-semibold text-blue-600">
            ✓
          </div>

          <h3 className="mb-2 text-xl font-semibold text-stone-900">Order placed</h3>
          <p className="mb-6 text-sm leading-relaxed text-stone-500">
            <span className="font-medium text-stone-700">{product.name}</span> × {qty} is on its way to <span className="font-medium text-stone-700">Table {tableNumber}</span> on <span className="font-medium text-stone-700">Floor {floor}</span>.
          </p>

          <div className={`mb-5 flex items-center justify-between px-4 py-3 ${surface}`}>
            <span className="text-sm text-stone-500">Total paid</span>
            <span className="text-lg font-semibold text-stone-900">${total.toFixed(2)}</span>
          </div>

          <button onClick={onClose} className={`${primaryBtn} w-full`}>
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/50 p-0 sm:items-center sm:p-6">
      <div className="relative w-full rounded-t-[2rem] border border-stone-200 bg-white shadow-xl sm:max-w-md sm:rounded-[2rem]">
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">Place order</h2>
            <p className="mt-0.5 text-sm text-stone-500">Confirm delivery details</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-sm text-stone-500 transition hover:bg-stone-50 hover:text-stone-700">
            ✕
          </button>
        </div>

        <div className="mx-5 mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-4 sm:mx-6">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white">
              {product.image_url || product.image ? (
                <img src={product.image_url || product.image} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xl">🥤</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-stone-900">{product.name}</p>
              {product.brand && <p className="text-sm text-stone-500">{product.brand}</p>}
              <p className="mt-1 text-sm font-semibold text-blue-600">${price.toFixed(2)} each</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-5 py-5 sm:px-6">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">
                Table number
              </label>
              <input value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} className={input} placeholder="e.g. 12" />
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">
                Floor
              </label>
              <input value={floor} onChange={(e) => setFloor(e.target.value)} className={input} placeholder="e.g. 1" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">
              Quantity
            </label>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setQty((prev) => String(Math.max(1, Number(prev) - 1)))} disabled={Number(qty) <= 1} className={stepBtn}>
                −
              </button>
              <input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} className={`${input} text-center`} />
              <button type="button" onClick={() => setQty((prev) => String(Number(prev) + 1))} className={stepBtn}>
                +
              </button>
            </div>
          </div>

          <div className={`px-4 py-3 ${surface}`}>
            <div className="flex items-center justify-between text-sm text-stone-500">
              <span>Subtotal</span>
              <span>${price.toFixed(2)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-base font-semibold text-stone-900">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className={cancelBtn}>
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={submitting} className={primaryBtn}>
              {submitting ? "Placing…" : "Place order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuyModal;
