import { useEffect, useState } from "react";
import type { Order, OrderStatus } from "../pages/dashBorad";
import { authHeaders, StatusBadge } from "../pages/dashBorad";
import { API_URL } from "../fetchApi/fetchApi";

const STATUS_META_MODAL = {
  pending: { label: "Pending", textClass: "text-amber-700", bgClass: "bg-amber-50", borderClass: "border-amber-200" },
  confirmed: { label: "Confirmed", textClass: "text-blue-700", bgClass: "bg-blue-50", borderClass: "border-blue-200" },
  delivered: { label: "Delivered", textClass: "text-emerald-700", bgClass: "bg-emerald-50", borderClass: "border-emerald-200" },
  cancelled: { label: "Cancelled", textClass: "text-red-700", bgClass: "bg-red-50", borderClass: "border-red-200" },
};

const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

async function fetchOrder(id: number): Promise<Order> {
  const res = await fetch(`${API_URL}/orders/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch order: ${res.statusText}`);
  return res.json();
}

async function updateOrderStatus(id: number, status: OrderStatus): Promise<Order> {
  const res = await fetch(`${API_URL}/orders/${id}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || `Failed to update status: ${res.statusText}`);
  }
  return res.json();
}

interface OrderModalProps {
  orderId: number;
  onClose: () => void;
  onStatusChange: (updated: Order) => void;
}

export default function OrderModal({ orderId, onClose, onStatusChange }: OrderModalProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrder(orderId)
      .then(setOrder)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [orderId]);

  async function handleStatusChange(status: OrderStatus) {
    if (!order) return;
    setUpdating(true);
    setError(null);
    try {
      const updated = await updateOrderStatus(order.id, status);
      setOrder(updated);
      onStatusChange(updated);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to update status");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/45 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">Order details</p>
            <h2 className="mt-1 text-lg font-semibold text-stone-900">Order #{orderId}</h2>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-xl text-stone-400 transition hover:text-stone-600" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {loading && <p className="text-center text-sm text-stone-500">Loading…</p>}
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
          {order && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  ["Product", order.product_name],
                  ["Type", order.product_type],
                  ["Unit Price", `$${Number(order.unit_price).toFixed(2)}`],
                  ["Qty", order.quantity],
                  ["Total", `$${Number(order.total_price).toFixed(2)}`],
                  ["Table", `${order.floor} — Table ${order.table_number}`],
                  ["Placed", new Date(order.created_at).toLocaleString()],
                  ["Last Updated", new Date(order.updated_at).toLocaleString()],
                ].map(([label, val]) => (
                  <div key={String(label)} className="rounded-2xl border border-stone-100 bg-stone-50 px-4 py-3">
                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400">{label}</div>
                    <div className="text-sm font-medium text-stone-700">{val}</div>
                  </div>
                ))}
                <div className="rounded-2xl border border-stone-100 bg-stone-50 px-4 py-3">
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400">Status</div>
                  <StatusBadge status={order.status} />
                </div>
              </div>

              {NEXT_STATUSES[order.status].length > 0 && (
                <div className="mt-6 border-t border-stone-100 pt-5">
                  <div className="mb-2.5 text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">Move to</div>
                  <div className="flex flex-wrap gap-2.5">
                    {NEXT_STATUSES[order.status].map((s) => (
                      <button
                        key={s}
                        disabled={updating}
                        onClick={() => handleStatusChange(s)}
                        className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${STATUS_META_MODAL[s].bgClass} ${STATUS_META_MODAL[s].textClass} ${STATUS_META_MODAL[s].borderClass} ${updating ? "cursor-not-allowed opacity-60" : "hover:brightness-95"}`}
                      >
                        {STATUS_META_MODAL[s].label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
