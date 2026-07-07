import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

const CACHE_KEY = "borrows_cache";

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

const STATUS_STYLES = {
  pending: "bg-gray-100 text-gray-700 border border-gray-200",
  approved: "bg-black text-white border border-black",
  returned: "bg-gray-800 text-white border border-gray-800",
  rejected: "bg-gray-300 text-gray-900 border border-gray-400",
  cancelled: "bg-gray-100 text-gray-500 border border-gray-200",
};

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.cancelled;
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize tracking-wide ${style}`}
    >
      {status}
    </span>
  );
}

function readCache() {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

function writeCache(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // ignore storage write failures
  }
}

export function MyBorrowsPage() {
  const { isAdmin } = useAuth();
  const [borrows, setBorrows] = useState(() => readCache() ?? []);
  const [loading, setLoading] = useState(() => readCache() === null);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  function fetchBorrows() {
    setLoading(true);
    api
      .get("/books_borrowed")
      .then((data) => {
        setBorrows(data);
        writeCache(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (readCache() !== null) {
      // Already have data from earlier this session, no re fetching needed.
      return;
    }
    fetchBorrows();
  }, []);

  // update both state and cache together after a mutation.
  function applyUpdate(updater) {
    setBorrows((prev) => {
      const next = updater(prev);
      writeCache(next);
      return next;
    });
  }

  async function handleApprove(borrow) {
    setBusyId(borrow.id);
    try {
      const updated = await api.patch(`/books_borrowed/${borrow.id}/approve`);
      applyUpdate((prev) =>
        prev.map((b) => (b.id === borrow.id ? updated : b)),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(borrow) {
    setBusyId(borrow.id);
    try {
      const updated = await api.patch(`/books_borrowed/${borrow.id}/reject`);
      applyUpdate((prev) =>
        prev.map((b) => (b.id === borrow.id ? updated : b)),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleReturn(borrow) {
    setBusyId(borrow.id);
    try {
      const updated = await api.patch(`/books_borrowed/${borrow.id}/return`);
      applyUpdate((prev) =>
        prev.map((b) => (b.id === borrow.id ? updated : b)),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleCancel(borrow) {
    setBusyId(borrow.id);
    try {
      await api.delete(`/books_borrowed/${borrow.id}`);
      applyUpdate((prev) =>
        prev.map((b) =>
          b.id === borrow.id ? { ...b, status: "cancelled" } : b,
        ),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] w-full flex-col items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-black" />
        <p className="mt-3 text-xs font-semibold tracking-wide uppercase text-gray-500">
          Loading borrows…
        </p>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-[#4f4023] sm:text-3xl">
          {isAdmin ? "All Borrows" : "My Borrows"}
        </h1>
        <button
          type="button"
          onClick={fetchBorrows}
          className="text-xs font-semibold text-gray-500 underline underline-offset-4 hover:text-gray-800"
        >
          Refresh
        </button>
      </div>

      {/* Error Message Box */}
      {error && (
        <div className="mb-6 rounded-lg border border-gray-300 bg-gray-100 p-4 text-sm font-medium text-gray-800">
          {error}
        </div>
      )}

      {/* Empty State vs Log Table Container */}
      {borrows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-12 text-center">
          <p className="text-sm font-medium text-gray-500">
            No borrow records yet.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <tr>
                  <th scope="col" className="px-6 py-3.5">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Author
                  </th>
                  {isAdmin && (
                    <>
                      <th scope="col" className="px-6 py-3.5">
                        Borrower
                      </th>
                      <th scope="col" className="px-6 py-3.5">
                        Email
                      </th>
                    </>
                  )}
                  <th scope="col" className="px-6 py-3.5">
                    Due Date
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Return date
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {borrows.map((b) => (
                  <tr key={b.id} className="transition-colors hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 font-semibold text-black">
                      {b.title}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                      {b.author}
                    </td>
                    {isAdmin && (
                      <>
                        <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-700">
                          {b.user?.name || "Unknown"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                          {b.user?.email || "—"}
                        </td>
                      </>
                    )}
                    <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                      {formatDate(b.due_date)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                      returned: {formatDate(b.return_date)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {isAdmin && b.status === "pending" && (
                          <>
                            <button
                              type="button"
                              disabled={busyId === b.id}
                              onClick={() => handleApprove(b)}
                              className="inline-flex h-8 items-center justify-center rounded-md bg-black px-3 text-xs font-medium text-white shadow-sm transition-colors hover:bg-gray-800 disabled:pointer-events-none disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              disabled={busyId === b.id}
                              onClick={() => handleReject(b)}
                              className="inline-flex h-8 items-center justify-center rounded-md border border-gray-300 bg-white px-3 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {b.status === "approved" && (
                          <button
                            type="button"
                            disabled={busyId === b.id}
                            onClick={() => handleReturn(b)}
                            className="inline-flex h-8 items-center justify-center rounded-md bg-black px-3 text-xs font-medium text-white shadow-sm transition-colors hover:bg-gray-800 disabled:pointer-events-none disabled:opacity-50"
                          >
                            Mark returned
                          </button>
                        )}

                        {!isAdmin && b.status === "pending" && (
                          <button
                            type="button"
                            disabled={busyId === b.id}
                            onClick={() => handleCancel(b)}
                            className="inline-flex h-8 items-center justify-center rounded-md border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:text-black disabled:pointer-events-none disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
