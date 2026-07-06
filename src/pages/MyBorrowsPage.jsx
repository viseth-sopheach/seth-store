import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

// Laravel date casts serialize as "YYYY-MM-DD" (or a full ISO string).
// Render everything as dd/mm/yyyy per the required format.
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
  pending:
    "bg-amber-50 text-amber-800 border border-amber-200/60 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30",
  approved:
    "bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/30",
  returned:
    "bg-emerald-50 text-emerald-800 border border-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30",
  rejected:
    "bg-red-50 text-red-700 border border-red-200/60 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/30",
  cancelled:
    "bg-slate-100 text-slate-700 border border-slate-200/60 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800",
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

export function MyBorrowsPage() {
  const { isAdmin } = useAuth();
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  function load() {
    setLoading(true);
    api
      .get("/books_borrowed")
      .then(setBorrows)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleApprove(borrow) {
    setBusyId(borrow.id);
    try {
      const updated = await api.patch(`/books_borrowed/${borrow.id}/approve`);
      setBorrows((prev) =>
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
      setBorrows((prev) =>
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
      setBorrows((prev) => prev.map((b) => (b.id === borrow.id ? updated : b)));
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
      setBorrows((prev) =>
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
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800 dark:border-slate-800 dark:border-t-slate-200" />
        <p className="mt-3 text-xs font-semibold tracking-wide text-slate-400 uppercase">
          Loading borrows…
        </p>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8 border-b border-slate-200 pb-5 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">
          {isAdmin ? "All Borrows" : "My Borrows"}
        </h1>
        {!isAdmin && (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Track your borrow requests and see due dates once they're
            approved.
          </p>
        )}
      </div>

      {/* Error Message Box */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200 text-sm font-medium text-red-800 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Empty State vs Log Table Container */}
      {borrows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-12 text-center dark:border-slate-800">
          <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
            No borrow records yet.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-900/50 dark:text-slate-400">
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
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                {borrows.map((b) => (
                  <tr
                    key={b.id}
                    className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/20"
                  >
                    <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-900 dark:text-slate-50">
                      {b.title}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600 dark:text-slate-400">
                      {b.author}
                    </td>
                    {isAdmin && (
                      <>
                        <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                          {b.user?.name || "Unknown"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-slate-500 dark:text-slate-400">
                          {b.user?.email || "—"}
                        </td>
                      </>
                    )}
                    <td className="whitespace-nowrap px-6 py-4 text-slate-500 dark:text-slate-400">
                      {formatDate(b.due_date)}
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
                              className="inline-flex h-8 items-center justify-center rounded-md bg-blue-600 px-3 text-xs font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              disabled={busyId === b.id}
                              onClick={() => handleReject(b)}
                              className="inline-flex h-8 items-center justify-center rounded-md border border-red-200 bg-red-50 px-3 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 disabled:pointer-events-none disabled:opacity-50 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
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
                            className="inline-flex h-8 items-center justify-center rounded-md bg-slate-900 px-3 text-xs font-medium text-white shadow-sm transition-colors hover:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
                          >
                            Mark returned
                          </button>
                        )}

                        {!isAdmin && b.status === "pending" && (
                          <button
                            type="button"
                            disabled={busyId === b.id}
                            onClick={() => handleCancel(b)}
                            className="inline-flex h-8 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-50"
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
