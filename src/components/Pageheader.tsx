import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { glassInput } from "./glassTokens";
import type { AuthUser } from "../api/fetchApi";

interface PageHeaderProps {
  productCount: number;
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  user: AuthUser | null;
  isAdmin: boolean;
  isLoggedIn: boolean;
  onAdd: () => void;
  onLogin: () => void;
  onLogout: () => void;
}

export default function PageHeader({
  productCount,
  loading,
  search,
  onSearchChange,
  user,
  isAdmin,
  isLoggedIn,
  onAdd,
  onLogin,
  onLogout,
}: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white px-4 py-3 shadow-sm sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        {/* Title */}
        <div className="px-7 pt-1 flex-1 min-w-0">
          <h1 className="text-gray-800 font-bold text-lg sm:text-xl tracking-tight leading-tight">
            PC Products
          </h1>
          <p className="text-[12px] text-gray-400 mt-0.5 leading-none">
            {loading
              ? "Loading…"
              : `${productCount} item${productCount !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Desktop search */}
        <div className="relative hidden sm:block w-60">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none select-none">
            <FaSearch />
          </span>
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search…"
            className={`${glassInput} pl-9`}
          />
        </div>

        {/* Admin controls */}
        {isAdmin && (
          <>
            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-2xl border border-stone-300 bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-200"
            >
              Dashboard
            </button>
            <button
              onClick={onAdd}
              className="flex shrink-0 items-center gap-1.5 rounded-2xl border border-stone-300 bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-700 active:scale-95"
            >
              <span className="text-lg leading-none -mt-0.5">+</span>
              <span className="hidden sm:inline">Add</span>
            </button>
          </>
        )}

        {/* Guest hint */}
        {!isLoggedIn && (
          <p className="hidden sm:block text-[11px] text-gray-400 italic">
            Login to buy
          </p>
        )}

        {/* User badge */}
        {user && (
          <span
            className={`hidden sm:inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${
              isAdmin
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
            }`}
          >
            {user.name}
          </span>
        )}

        {/* Auth button */}
        <button
          onClick={user ? onLogout : onLogin}
          className="flex shrink-0 items-center gap-1.5 rounded-2xl border border-stone-300 bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-700 active:scale-95"
        >
          {user ? "Logout" : "Login"}
        </button>
      </div>
    </header>
  );
}
