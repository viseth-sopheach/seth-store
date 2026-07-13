import { useEffect, useState } from "react";
import {
  fetchComputerShopOrder,
  type ComputerShopOrder,
  type ComputerShopOrderStatus,
} from "../api/fetchApi";
import StatusBadge from "./StatusBadge";

interface OrderModalProps {
  orderId: number;
  onClose: () => void;
  onStatusChange: (
    id: number,
    status: ComputerShopOrderStatus,
  ) => Promise<void>;
}

const STATUS_OPTIONS: ComputerShopOrderStatus[] = [
  "pending",
  "confirmed",
  "delivered",
  "cancelled",
];

function Spinner({
  size = 20,
  color = "text-indigo-600",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <div
      className={`animate-spin inline-block rounded-full border-2 border-current border-t-transparent ${color}`}
      style={{ width: size, height: size }}
    />
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-b-0">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

export default function OrderModal({
  orderId,
  onClose,
  onStatusChange,
}: OrderModalProps) {
  const [order, setOrder] = useState<ComputerShopOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedStatus, setSelectedStatus] =
    useState<ComputerShopOrderStatus | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetchComputerShopOrder(orderId)
      .then((data) => {
        if (cancelled) return;
        setOrder(data);
        setSelectedStatus(data.status);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load order");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const hasChanges =
    order && selectedStatus !== null && selectedStatus !== order.status;

  async function handleSave() {
    if (!order || !selectedStatus) return;
    setSaving(true);
    setSaveError(null);
    try {
      await onStatusChange(order.id, selectedStatus);
      setOrder({ ...order, status: selectedStatus });
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Failed to update status");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-base text-gray-900 m-0">
            Order {order ? `#${order.id}` : `#${orderId}`}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none cursor-pointer"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          {loading ? (
            <div className="py-10 text-center">
              <Spinner />
              <p className="text-gray-400 mt-2 text-sm">Loading order…</p>
            </div>
          ) : error ? (
            <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          ) : order ? (
            <>
              <div className="mb-4">
                <DetailRow label="Product" value={order.product_name} />
                <DetailRow
                  label="Unit Price"
                  value={`$${Number(order.unit_price).toFixed(2)}`}
                />
                <DetailRow label="Quantity" value={order.quantity} />
                <DetailRow
                  label="Total"
                  value={
                    <span className="text-emerald-600 font-semibold">
                      ${Number(order.total_price).toFixed(2)}
                    </span>
                  }
                />
                <DetailRow label="Address" value={order.address} />
                <DetailRow
                  label="Placed"
                  value={`${new Date(order.created_at).toLocaleDateString()} ${new Date(order.created_at).toLocaleTimeString()}`}
                />
                <DetailRow
                  label="Current Status"
                  value={<StatusBadge status={order.status} />}
                />
              </div>

              {/* Status updater */}
              <div className="border-t border-gray-100 pt-4">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-2">
                  Update Status
                </label>
                <div className="flex gap-2.5">
                  <select
                    value={selectedStatus ?? order.status}
                    onChange={(e) =>
                      setSelectedStatus(
                        e.target.value as ComputerShopOrderStatus,
                      )
                    }
                    disabled={saving}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white cursor-pointer outline-none focus:border-indigo-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleSave}
                    disabled={!hasChanges || saving}
                    className={`px-4 py-1.5 rounded-lg font-semibold text-sm flex items-center gap-1.5 transition-all ${
                      !hasChanges || saving
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
                    }`}
                  >
                    {saving ? (
                      <Spinner size={14} color="text-gray-400" />
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>
                {saveError && (
                  <p className="text-red-600 text-xs mt-2">{saveError}</p>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
