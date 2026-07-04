import { useEffect, useState } from "react";
import { fetchUsers, updateUserRole } from "../api/fetchApi"; // adjust import path to wherever fetchUsers/updateUserRole live
import type { AppUser } from "../api/fetchApi";

const ROLES = ["admin", "user"];
const USERS_CACHE_KEY = "app_users_cache";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default function Users() {
  // CHANGED: hydrate initial state synchronously from sessionStorage (if
  // present) so the first render already has data instead of an empty
  // array + loading spinner.
  const [users, setUsers] = useState<AppUser[]>(() => {
    try {
      const cached = sessionStorage.getItem(USERS_CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem(USERS_CACHE_KEY);
    } catch {
      return true;
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadUsers() {
    // CHANGED: only show the full loading state if we don't already have
    // cached data to display — background refresh stays silent.
    const hasCache = users.length > 0;
    if (!hasCache) setLoading(true);
    setError(null);
    try {
      const data = await fetchUsers();
      setUsers(data);
      try {
        sessionStorage.setItem(USERS_CACHE_KEY, JSON.stringify(data));
      } catch {
        // ignore quota/serialization errors, caching is best-effort
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(id: number, role: string) {
    const prev = users;
    setSavingId(id);
    // optimistic update
    setUsers((u) => {
      const next = u.map((usr) => (usr.id === id ? { ...usr, role } : usr));
      try {
        sessionStorage.setItem(USERS_CACHE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    try {
      const updated = await updateUserRole(id, role);
      setUsers((u) => {
        const next = u.map((usr) => (usr.id === id ? updated : usr));
        try {
          sessionStorage.setItem(USERS_CACHE_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    } catch (err) {
      setUsers(prev); // revert on failure
      try {
        sessionStorage.setItem(USERS_CACHE_KEY, JSON.stringify(prev));
      } catch {
        // ignore
      }
      setError(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setSavingId(null);
    }
  }

  const filtered = users.filter((u) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Users</h1>
            <p className="mt-1 text-sm text-slate-500">
              {loading
                ? "Loading users…"
                : `${users.length} users`}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
              className="w-full sm:w-64 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
            <button
              onClick={loadUsers}
              className="w-full sm:w-auto rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="shrink-0 font-medium hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr
                    key={i}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-8 w-24 animate-pulse rounded bg-slate-200" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    {users.length === 0
                      ? "No users yet."
                      : "No users match your search."}
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-400 text-xs font-medium text-white">
                          {initials(user.name)}
                        </div>
                        <span className="font-medium text-slate-900">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role.toLowerCase()}
                        disabled={savingId === user.id}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value)
                        }
                        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700 disabled:opacity-50"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                          </option>
                        ))}
                      </select>
                      {savingId === user.id && (
                        <span className="ml-2 text-xs text-slate-400">
                          Saving…
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {formatDate(user.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}