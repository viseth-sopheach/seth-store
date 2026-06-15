import { useEffect, useState, useCallback } from "react";
import { fetchAuthUser } from "../fetchApi/fetchApi";
import type { AuthUser } from "../fetchApi/fetchApi";
import { MdOutlineDashboard } from "react-icons/md";

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = "pending" | "confirmed" | "delivered" | "cancelled";
type ProductType = "drink" | "book" | "computer" | "phone";

interface Order {
  id: number;
  user_id: number;
  product_type: ProductType;
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  table_number: string;
  floor: string;
  total_price: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

// ─── API helpers ──────────────────────────────────────────────────────────────

const API_URL = "http://127.0.0.1:8000/api";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("skybot_token");
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fetchOrders(): Promise<Order[]> {
  const res = await fetch(`${API_URL}/orders`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch orders: ${res.statusText}`);
  return res.json();
}

async function fetchOrder(id: number): Promise<Order> {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch order: ${res.statusText}`);
  return res.json();
}

async function updateOrderStatus(
  id: number,
  status: OrderStatus,
): Promise<Order> {
  const res = await fetch(`${API_URL}/orders/${id}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(
      body?.message || `Failed to update status: ${res.statusText}`,
    );
  }
  return res.json();
}

async function deleteOrder(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(
      body?.message || `Failed to delete order: ${res.statusText}`,
    );
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const STATUS_META: Record<
  OrderStatus,
  { label: string; textClass: string; bgClass: string; borderClass: string }
> = {
  pending: {
    label: "Pending",
    textClass: "text-amber-700",
    bgClass: "bg-amber-100",
    borderClass: "border-amber-200",
  },
  confirmed: {
    label: "Confirmed",
    textClass: "text-blue-700",
    bgClass: "bg-blue-100",
    borderClass: "border-blue-200",
  },
  delivered: {
    label: "Delivered",
    textClass: "text-emerald-700",
    bgClass: "bg-emerald-100",
    borderClass: "border-emerald-200",
  },
  cancelled: {
    label: "Cancelled",
    textClass: "text-red-700",
    bgClass: "bg-red-100",
    borderClass: "border-red-200",
  },
};

const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const { label, textClass, bgClass } = STATUS_META[status];
  return (
    <span
      className={`rounded-md px-2.5 py-0.5 text-xs font-semibold tracking-wide inline-block ${bgClass} ${textClass}`}
    >
      {label}
    </span>
  );
}

function StatCard({
  label,
  value,
  borderTopClass,
}: {
  label: string;
  value: string | number;
  borderTopClass: string;
}) {
  return (
    <div
      className={`bg-white border border-gray-200 border-t-4 rounded-xl p-5 min-w-[160px] flex-1 basis-40 ${borderTopClass}`}
    >
      <div className="text-2xl font-bold text-gray-900 tracking-tight">
        {value}
      </div>
      <div className="text-xs text-gray-500 mt-1 font-medium tracking-widest uppercase">
        {label}
      </div>
    </div>
  );
}

// ─── Order Detail Modal ───────────────────────────────────────────────────────

function OrderModal({
  orderId,
  onClose,
  onStatusChange,
}: {
  orderId: number;
  onClose: () => void;
  onStatusChange: (updated: Order) => void;
}) {
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
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <span className="font-bold text-lg text-gray-900">
            Order #{orderId}
          </span>
          <button
            onClick={onClose}
            className="bg-none border-none cursor-pointer text-xl text-gray-400 p-1 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
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
                    <div className="text-sm text-gray-900 font-medium">
                      {val}
                    </div>
                  </div>
                ))}
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                    Status
                  </div>
                  <StatusBadge status={order.status} />
                </div>
              </div>

              {/* Status actions */}
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
                          STATUS_META[s].bgClass
                        } ${STATUS_META[s].textClass} ${STATUS_META[s].borderClass} ${
                          updating
                            ? "opacity-60 cursor-not-allowed"
                            : "hover:brightness-95 cursor-pointer"
                        }`}
                      >
                        {STATUS_META[s].label}
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

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");

  // ── Auth guard ──
  useEffect(() => {
    fetchAuthUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setAuthLoading(false));
  }, []);

  // ── Load orders ──
  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    setError(null);
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load orders");
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "admin") loadOrders();
  }, [user, loadOrders]);

  // ── Delete ──
  async function handleDelete(id: number) {
    if (!confirm(`Cancel and delete order #${id}?`)) return;
    setDeletingId(id);
    try {
      await deleteOrder(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  // ── Status update from modal ──
  function handleStatusChange(updated: Order) {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  }

  // ── Stats ──
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
    revenue: orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + Number(o.total_price), 0),
  };

  //logout
  const handleLogout = () => {
    localStorage.removeItem("skybot_token");

    // optional: clear user state
    setUser(null);

    // redirect
    window.location.href = "/";
  };

  // ── Filter + search ──
  const visible = orders.filter((o) => {
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      o.product_name.toLowerCase().includes(q) ||
      String(o.id).includes(q) ||
      o.table_number.includes(q) ||
      o.floor.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  // ─── Loading ───
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-sans">
        <Spinner />
        <p className="text-gray-500 mt-3 text-sm">Verifying session…</p>
      </div>
    );
  }

  // ─── Not logged in ───
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-sans">
        <div className="text-4xl mb-3">🔒</div>
        <h2 className="text-gray-900 font-bold text-xl">Access Denied</h2>
        <p className="text-gray-500 mt-2 text-sm">Please log in to continue.</p>
      </div>
    );
  }

  // ─── Not admin ───
  if (user.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-sans">
        <div className="text-4xl mb-3">🚫</div>
        <h2 className="text-gray-900 font-bold text-xl">Admins Only</h2>
        <p className="text-gray-500 mt-2 text-sm">
          Your account (<strong>{user.email}</strong>) does not have dashboard
          access.
        </p>
      </div>
    );
  }

  // ─── Dashboard ───
  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased text-gray-800">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-8 h-16 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm">
            <MdOutlineDashboard />
          </div>
          <span className="font-bold text-base text-gray-900 tracking-tight">
            Admin Dashboard
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-gray-700 font-medium">{user.name}</span>
          <span className="text-[11px] font-semibold bg-purple-50 text-purple-700 rounded-md px-2 py-0.5 tracking-wider uppercase">
            Admin
          </span>
          <button onClick={handleLogout}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-stone-900/90 backdrop-blur-md hover:bg-stone-800/90 active:scale-95 text-white text-sm font-semibold border border-stone-700/40 shadow-[0_4px_16px_rgba(15,23,42,0.28)] transition-all duration-200">
            {user ? "Logout" : "Login"}
          </button>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto">
        {/* Stats */}
        <div className="flex gap-4 flex-wrap mb-8">
          <StatCard
            label="Total Orders"
            value={stats.total}
            borderTopClass="border-t-indigo-500"
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            borderTopClass="border-t-amber-500"
          />
          <StatCard
            label="Confirmed"
            value={stats.confirmed}
            borderTopClass="border-t-blue-500"
          />
          <StatCard
            label="Delivered"
            value={stats.delivered}
            borderTopClass="border-t-emerald-500"
          />
          <StatCard
            label="Cancelled"
            value={stats.cancelled}
            borderTopClass="border-t-red-500"
          />
          <StatCard
            label="Revenue (Non-Cancelled)"
            value={`$${stats.revenue.toFixed(2)}`}
            borderTopClass="border-t-purple-500"
          />
        </div>

        {/* Toolbar */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-wrap gap-3">
            <h2 className="m-0 font-bold text-base text-gray-900">
              Orders
              <span className="ml-2 text-xs font-medium text-gray-400">
                {visible.length} of {orders.length}
              </span>
            </h2>

            <div className="flex gap-2.5 flex-wrap">
              {/* Search */}
              <input
                type="text"
                placeholder="Search product, table, floor…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 outline-none w-56 focus:border-indigo-500 transition-colors"
              />

              {/* Status filter */}
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value as OrderStatus | "all")
                }
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white cursor-pointer outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Refresh */}
              <button
                onClick={loadOrders}
                disabled={ordersLoading}
                className={`bg-indigo-600 text-white border-none rounded-lg px-4 py-1.5 font-semibold text-sm flex items-center gap-1.5 transition-all ${
                  ordersLoading
                    ? "opacity-75 cursor-not-allowed"
                    : "hover:bg-indigo-700 cursor-pointer"
                }`}
              >
                {ordersLoading ? <Spinner size={14} color="#ffffff" /> : "↻"}{" "}
                Refresh
              </button>
              <button
                onClick={() => window.history.back()}
                className="bg-cyan-100 text-cyan-800 font-semibold text-sm rounded-lg py-1.5 px-4 border border-cyan-200 hover:bg-cyan-200 transition-colors cursor-pointer"
              >
                Back to drink
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="px-5 py-3 bg-red-50 border-b border-red-100 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            {ordersLoading && orders.length === 0 ? (
              <div className="p-12 text-center">
                <Spinner />
                <p className="text-gray-400 mt-2 text-sm">Loading orders…</p>
              </div>
            ) : visible.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-sm">
                No orders match your filters.
              </div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    {[
                      "#",
                      "Product",
                      "Type",
                      "Floor / Table",
                      "Qty",
                      "Total",
                      "Status",
                      "Placed",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visible.map((order, i) => (
                    <tr
                      key={order.id}
                      className={`transition-colors hover:bg-sky-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                    >
                      <td className="px-4 py-3 text-sm text-gray-700 align-middle whitespace-nowrap">
                        <span className="font-semibold text-indigo-600">
                          #{order.id}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 align-middle">
                        <span className="font-medium text-gray-900">
                          {order.product_name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 align-middle whitespace-nowrap">
                        <span className="text-[11px] font-semibold bg-gray-100 text-gray-700 rounded-md px-2 py-0.5 capitalize">
                          {order.product_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 align-middle whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {order.floor} — T{order.table_number}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 align-middle whitespace-nowrap">
                        <span className="font-medium">{order.quantity}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 align-middle whitespace-nowrap">
                        <span className="font-semibold text-emerald-600">
                          ${Number(order.total_price).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 align-middle whitespace-nowrap">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 align-middle whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString()}{" "}
                        <span className="block text-[11px] text-gray-400 mt-0.5">
                          {new Date(order.created_at).toLocaleTimeString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 align-middle whitespace-nowrap">
                        <button
                          onClick={() => setSelectedOrderId(order.id)}
                          className="bg-transparent border border-indigo-600 text-indigo-600 rounded-md px-3 py-1 font-semibold text-xs cursor-pointer hover:bg-indigo-50 transition-colors"
                        >
                          View
                        </button>
                        {order.status !== "delivered" &&
                          order.status !== "cancelled" && (
                            <button
                              onClick={() => handleDelete(order.id)}
                              disabled={deletingId === order.id}
                              className={`border border-red-500 text-red-500 bg-transparent rounded-md px-3 py-1 font-semibold text-xs ml-1.5 transition-colors ${
                                deletingId === order.id
                                  ? "opacity-50 cursor-not-allowed"
                                  : "hover:bg-red-50 cursor-pointer"
                              }`}
                            >
                              {deletingId === order.id ? "…" : "Delete"}
                            </button>
                          )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      {selectedOrderId !== null && (
        <OrderModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

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
