import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

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
                    <th scope="col" className="px-6 py-3.5">
                      Borrower
                    </th>
                  )}
                  <th scope="col" className="px-6 py-3.5">
                    Borrowed
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Due
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
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                        {b.user?.name || "Unknown"}
                      </td>
                    )}
                    <td className="whitespace-nowrap px-6 py-4 text-slate-500 dark:text-slate-400">
                      {b.borrowed_at}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-500 dark:text-slate-400">
                      {b.due_date}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium uppercase tracking-wider ${
                          b.status === "borrowed"
                            ? "bg-amber-50 text-amber-800 border border-amber-200/60 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30"
                            : b.status === "returned"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30"
                              : "bg-slate-100 text-slate-700 border border-slate-200/60 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      {b.status === "borrowed" && (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            disabled={busyId === b.id}
                            onClick={() => handleReturn(b)}
                            className="inline-flex h-8 items-center justify-center rounded-md bg-slate-900 px-3 text-xs font-medium text-white shadow-sm transition-colors hover:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
                          >
                            Return
                          </button>
                          <button
                            type="button"
                            disabled={busyId === b.id}
                            onClick={() => handleCancel(b)}
                            className="inline-flex h-8 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-50"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
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
