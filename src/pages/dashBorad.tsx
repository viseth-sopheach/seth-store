import { useEffect, useState, useCallback } from "react";
import { fetchAuthUser } from "../fetchApi/fetchApi";
import type { AuthUser } from "../fetchApi/fetchApi";
import { MdOutlineDashboard } from "react-icons/md";
import OrderModal from "../components/OrderModal";
import { API_URL } from "../fetchApi/fetchApi";
import { useNavigate } from "react-router-dom";

export type OrderStatus = "pending" | "confirmed" | "delivered" | "cancelled";
export type ProductType = "drink" | "book" | "computer" | "phone";

export interface Order {
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

export function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("seth_token");
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchOrders(): Promise<Order[]> {
  const res = await fetch(`${API_URL}/orders`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch orders: ${res.statusText}`);
  return res.json();
}

export async function deleteOrder(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || `Failed to delete order: ${res.statusText}`);
  }
}

function Spinner({ size = 20, color = "text-blue-600" }: { size?: number; color?: string }) {
  return (
    <div
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${color}`}
      style={{ width: size, height: size }}
    />
  );
}

function StatCard({ label, value, borderTopClass }: { label: string; value: string | number; borderTopClass: string }) {
  return (
    <div className={`min-w-40 flex-1 basis-40 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm ${borderTopClass}`}>
      <div className="text-2xl font-semibold tracking-tight text-stone-900">{value}</div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">{label}</div>
    </div>
  );
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  const STATUS_META = {
    pending: { label: "Pending", textClass: "text-amber-700", bgClass: "bg-amber-50" },
    confirmed: { label: "Confirmed", textClass: "text-blue-700", bgClass: "bg-blue-50" },
    delivered: { label: "Delivered", textClass: "text-emerald-700", bgClass: "bg-emerald-50" },
    cancelled: { label: "Cancelled", textClass: "text-red-700", bgClass: "bg-red-50" },
  };
  const { label, textClass, bgClass } = STATUS_META[status];
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${bgClass} ${textClass}`}>
      {label}
    </span>
  );
}

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
  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

  useEffect(() => {
    fetchAuthUser().then(setUser).catch(() => setUser(null)).finally(() => setAuthLoading(false));
  }, []);

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
    if (!isAdmin) return;

    loadOrders();

    const interval = setInterval(() => {
      loadOrders();
    }, 15000);

    return () => clearInterval(interval);
  }, [isAdmin, loadOrders]);

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

  function handleStatusChange(updated: Order) {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  }

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
    revenue: orders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + Number(o.total_price), 0),
  };

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("seth_token");
    setUser(null);
    window.location.href = "/";
  };

  const visible = orders.filter((o) => {
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    const q = search.toLowerCase();
    return (
      matchStatus &&
      (!q ||
        o.product_name.toLowerCase().includes(q) ||
        String(o.id).includes(q) ||
        o.table_number.includes(q) ||
        o.floor.toLowerCase().includes(q))
    );
  });

  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50">
        <Spinner />
        <p className="mt-3 text-sm text-stone-500">Verifying session…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-4 text-center">
        <div className="mb-3 text-4xl">🔒</div>
        <h2 className="text-xl font-semibold text-stone-900">Access denied</h2>
        <p className="mt-2 text-sm text-stone-500">Please log in to continue.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-4 text-center">
        <p className="text-sm text-stone-500">404: Not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white">
              <MdOutlineDashboard />
            </div>
            <div>
              <p className="text-base font-semibold text-stone-900">Admin dashboard</p>
              <p className="text-xs text-stone-500">Monitor and manage orders</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button  onClick={()=>navigate(-1)} className="bg-blue-400 rounded-2xl p-2">
              Products
            </button>
            <span className="rounded-full bg-stone-100 px-3 py-2 text-sm font-medium text-stone-700">{user.name}</span>
            <button onClick={handleLogout} className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 flex flex-wrap gap-4">
          <StatCard label="Total orders" value={stats.total} borderTopClass="border-t-4 border-t-blue-600" />
          <StatCard label="Pending" value={stats.pending} borderTopClass="border-t-4 border-t-amber-500" />
          <StatCard label="Confirmed" value={stats.confirmed} borderTopClass="border-t-4 border-t-blue-500" />
          <StatCard label="Delivered" value={stats.delivered} borderTopClass="border-t-4 border-t-emerald-500" />
          <StatCard label="Cancelled" value={stats.cancelled} borderTopClass="border-t-4 border-t-red-500" />
          <StatCard label="Revenue" value={`$${stats.revenue.toFixed(2)}`} borderTopClass="border-t-4 border-t-stone-900" />
        </div>

        <div className="overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 px-4 py-4 sm:px-5">
            <div>
              <h2 className="text-base font-semibold text-stone-900">Orders</h2>
              <p className="text-sm text-stone-500">{visible.length} of {orders.length} visible</p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <input type="text" placeholder="Search product, table, floor…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full min-w-[220px] rounded-full border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-700 outline-none transition focus:border-blue-500 focus:bg-white sm:w-56" />
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as OrderStatus | "all")} className="rounded-full border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 outline-none transition focus:border-blue-500">
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button onClick={loadOrders} disabled={ordersLoading} className={`flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition ${ordersLoading ? "cursor-not-allowed opacity-70" : "hover:bg-blue-700"}`}>
                {ordersLoading ? <Spinner size={14} color="text-white" /> : "↻"} Refresh
              </button>
            </div>
          </div>

          {error && <div className="border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 sm:px-5">{error}</div>}

          <div className="overflow-x-auto">
            {ordersLoading && orders.length === 0 ? (
              <div className="p-12 text-center">
                <Spinner />
                <p className="mt-2 text-sm text-stone-500">Loading orders…</p>
              </div>
            ) : visible.length === 0 ? (
              <div className="p-12 text-center text-sm text-stone-500">No orders match your filters.</div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-stone-50 text-left text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">
                    {["#", "Product", "Type", "Floor / Table", "Qty", "Total", "Status", "Placed", "Actions"].map((h) => (
                      <th key={h} className="whitespace-nowrap border-b border-stone-100 px-4 py-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {visible.map((order) => (
                    <tr key={order.id} className="bg-white transition-colors hover:bg-stone-50">
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-blue-600">#{order.id}</td>
                      <td className="px-4 py-3 text-sm font-medium text-stone-900">{order.product_name}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-stone-600"><span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-semibold capitalize text-stone-600">{order.product_type}</span></td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-stone-600">{order.floor} — T{order.table_number}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-stone-600">{order.quantity}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-stone-900">${Number(order.total_price).toFixed(2)}</td>
                      <td className="whitespace-nowrap px-4 py-3"><StatusBadge status={order.status} /></td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-stone-500">
                        {new Date(order.created_at).toLocaleDateString()}
                        <span className="mt-0.5 block text-[11px]">{new Date(order.created_at).toLocaleTimeString()}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => setSelectedOrderId(order.id)} className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100">View</button>
                          {order.status !== "delivered" && order.status !== "cancelled" && (
                            <button onClick={() => handleDelete(order.id)} disabled={deletingId === order.id} className={`rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition ${deletingId === order.id ? "cursor-not-allowed opacity-60" : "hover:bg-red-100"}`}>
                              {deletingId === order.id ? "…" : "Delete"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {selectedOrderId !== null && (
        <OrderModal orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} onStatusChange={handleStatusChange} />
      )}
    </div>
  );
}
