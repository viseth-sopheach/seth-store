import { useEffect, useState } from "react";
import type { Order, OrderStatus } from "./dashBorad";
import { authHeaders, StatusBadge } from "./dashBorad";
import { API_URL } from "../fetchApi/fetchApi";

// ─── Modal Meta configurations ────────────────────────────────────────────────
const STATUS_META_MODAL = {
  pending: { label: "Pending", textClass: "text-amber-700", bgClass: "bg-amber-100", borderClass: "border-amber-200" },
  confirmed: { label: "Confirmed", textClass: "text-blue-700", bgClass: "bg-blue-100", borderClass: "border-blue-200" },
  delivered: { label: "Delivered", textClass: "text-emerald-700", bgClass: "bg-emerald-100", borderClass: "border-emerald-200" },
  cancelled: { label: "Cancelled", textClass: "text-red-700", bgClass: "bg-red-100", borderClass: "border-red-200" },
};

const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

// ─── Modal Local API Call ─────────────────────────────────────────────────────
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
      className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl w-full max-w-lg mx-4 shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <span className="font-bold text-lg text-gray-900">Order #{orderId}</span>
          <button
            onClick={onClose}
            className="bg-none border-none cursor-pointer text-xl text-gray-400 p-1 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {loading && <p className="text-gray-500 text-center">Loading…</p>}
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          {order && (
            <>
              <div className="grid grid-cols-2 gap-x-5 gap-y-3.5">
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
                  <div key={String(label)}>
                    <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                      {label}
                    </div>
                    <div className="text-sm text-gray-900 font-medium">{val}</div>
                  </div>
                ))}
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                    Status
                  </div>
                  <StatusBadge status={order.status} />
                </div>
              </div>

              {NEXT_STATUSES[order.status].length > 0 && (
                <div className="mt-6 pt-5 border-t border-gray-100">
                  <div className="text-xs font-semibold text-gray-500 mb-2.5 uppercase tracking-wide">
                    Move to
                  </div>
                  <div className="flex gap-2.5 flex-wrap">
                    {NEXT_STATUSES[order.status].map((s) => (
                      <button
                        key={s}
                        disabled={updating}
                        onClick={() => handleStatusChange(s)}
                        className={`border rounded-lg px-4 py-1.5 font-semibold text-sm transition-all ${
                          STATUS_META_MODAL[s].bgClass
                        } ${STATUS_META_MODAL[s].textClass} ${STATUS_META_MODAL[s].borderClass} ${
                          updating
                            ? "opacity-60 cursor-not-allowed"
                            : "hover:brightness-95 cursor-pointer"
                        }`}
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
