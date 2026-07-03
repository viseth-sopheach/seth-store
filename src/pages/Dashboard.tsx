import Feedback from "./Feedback";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import {
  fetchComputerShopOrders,
  updateComputerShopOrderStatus,
  deleteComputerShopOrder,
  type ComputerShopOrderStatus,
} from "../api/fetchApi";
import OrderModal from "../components/OrderModal";
import Spinner from "../components/Spinner";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import { useNavbarContext } from "../components/Navbarcontext";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function Dashboard() {
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();
  const {
    user,
    authLoading,
    orders,
    setOrders,
    ordersLoaded,
    setOrdersLoaded,
  } = useNavbarContext();
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<
    ComputerShopOrderStatus | "all"
  >("all");
  const [search, setSearch] = useState("");
  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    setError(null);
    try {
      const data = await fetchComputerShopOrders();
      setOrders(data);
      setOrdersLoaded(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load orders");
    } finally {
      setOrdersLoading(false);
    }
  }, [setOrders, setOrdersLoaded]);

  useEffect(() => {
    if (!isAdmin) return;

    setOrdersLoaded(false);
    loadOrders();

    const interval = setInterval(() => {
      loadOrders();
    }, 15000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, loadOrders]);

  async function handleDelete(id: number) {
    if (!confirm(`Cancel and delete order #${id}?`)) return;
    setDeletingId(id);
    try {
      await deleteComputerShopOrder(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleStatusChange(
    id: number,
    status: ComputerShopOrderStatus,
  ) {
    const updated = await updateComputerShopOrderStatus(id, status);
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  }

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

  const visible = orders.filter((o) => {
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    const q = search.toLowerCase();
    return (
      matchStatus &&
      (!q ||
        o.product_name.toLowerCase().includes(q) ||
        String(o.id).includes(q) ||
        o.address.toLowerCase().includes(q))
    );
  });

  if (authLoading) {
    return null;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-sans">
        <h2 className="text-gray-900 font-bold text-xl">Access Denied</h2>
        <p className="text-gray-500 mt-2 text-sm">Please log in to continue.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 px-6">
        <div className="text-center max-w-md">
          <h1 className="text-8xl font-extrabold text-gray-500 tracking-tight">
            404
          </h1>
          <h2 className="mt-4 text-3xl font-bold text-gray-500">
            Page Not Found
          </h2>
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition shadow"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased text-gray-800">
      <main className="p-8 max-w-7xl mx-auto">
        <div className="flex gap-4 flex-wrap mb-8">
          <StatCard
            label="Total Orders"
            value={stats.total}
            // borderTopClass="border-t-indigo-500"
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            // borderTopClass="border-t-amber-500"
          />
          <StatCard
            label="Confirmed"
            value={stats.confirmed}
            // borderTopClass="border-t-blue-500"
          />
          <StatCard
            label="Delivered"
            value={stats.delivered}
            // borderTopClass="border-t-emerald-500"
          />
          <StatCard
            label="Cancelled"
            value={stats.cancelled}
            // borderTopClass="border-t-red-500"
          />
          <StatCard
            label="Revenue (Non-Cancelled)"
            value={`$${stats.revenue.toFixed(2)}`}
            // borderTopClass="border-t-purple-500"
          />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-wrap gap-3">
            <h2 className="m-0 font-bold text-base text-gray-900">
              Orders
              <span className="ml-2 text-xs font-medium text-gray-400">
                {visible.length} of {orders.length}
              </span>
            </h2>

            <div className="flex gap-2.5 flex-wrap">
              <input
                type="text"
                placeholder="Search product, address…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 outline-none w-56 focus:border-indigo-500 transition-colors"
              />

              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(
                    e.target.value as ComputerShopOrderStatus | "all",
                  )
                }
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white cursor-pointer outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <button
                onClick={() => setShowFeedback((prev) => !prev)}
                className="rounded-lg bg-gray-900 hover:bg-gray-800 active:bg-gray-950 text-white px-5 py-2.5 text-sm font-medium shadow-sm transition-colors duration-150 flex items-center gap-2"
              >
                {showFeedback ? (
                  <>
                    <span>Hide Feedback</span>
                    <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Show Feedback</span>
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                onClick={loadOrders}
                disabled={ordersLoading}
                className={`bg-indigo-600 text-white border-none rounded-lg px-4 py-1.5 font-semibold text-sm flex items-center gap-1.5 transition-all ${
                  ordersLoading
                    ? "opacity-75 cursor-not-allowed"
                    : "hover:bg-indigo-700 cursor-pointer"
                }`}
              >
                {ordersLoading ? <Spinner size={14} color="text-white" /> : "↻"}{" "}
                Refresh
              </button>
            </div>
          </div>

          {error && (
            <div className="px-5 py-3 bg-red-50 border-b border-red-100 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            {/* CHANGED: only show the full-page spinner when we have nothing
                to show yet (orders.length === 0). Otherwise, keep the table
                visible while a background refresh runs — the table will
                update in place once loadOrders() resolves. This avoids the
                "stale data sits there forever because ordersLoaded was true
                from a previous visit" bug, while also avoiding an
                unnecessary full-page spinner flash on every revisit. */}
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
                      "Address",
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
                      <td className="px-4 py-3 text-sm text-gray-700 align-middle max-w-xs truncate">
                        <span className="text-sm text-gray-600">
                          {order.address}
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
                        {new Date(order.created_at).toLocaleDateString()}
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

      {selectedOrderId !== null && (
        <OrderModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      <div className="flex flex-col items-center gap-4">
        {/* <button
          onClick={() => setShowFeedback((prev) => !prev)}
          className="rounded-lg bg-gray-900 hover:bg-gray-800 active:bg-gray-950 text-white px-5 py-2.5 text-sm font-medium shadow-sm transition-colors duration-150 flex items-center gap-2"
        >
          {showFeedback ? (
            <>
              <span>Hide Feedback</span>
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>Show Feedback</span>
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button> */}

        {showFeedback && (
          <div className="w-full flex justify-center animate-in fade-in slide-in-from-top-2 duration-200">
            <Feedback />
          </div>
        )}
      </div>
    </div>
  );
}
