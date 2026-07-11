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
    <header className="sticky top-0 z-30 bg-white/25 backdrop-blur-2xl border-b border-white/40 shadow-[0_2px_20px_rgba(0,0,0,0.06)] px-4 sm:px-6 py-3">
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
              className="bg-cyan-200 rounded-2xl py-2 px-4 border-t-cyan-600"
            >
              Dashboard
            </button>
            <button
              onClick={onAdd}
              className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-blue-500/75 backdrop-blur-md hover:bg-blue-500/90 active:scale-95 text-white text-sm font-semibold border border-blue-400/40 shadow-[0_4px_16px_rgba(59,130,246,0.28)] transition-all duration-200"
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
            className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md ${
              isAdmin
                ? "bg-emerald-400/20 text-emerald-700 border-emerald-300/50"
                : "bg-amber-400/20 text-amber-700 border-amber-300/50"
            }`}
          >
            {user.name}
          </span>
        )}

        {/* Auth button */}
        <button
          onClick={user ? onLogout : onLogin}
          className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-stone-900/90 backdrop-blur-md hover:bg-stone-800/90 active:scale-95 text-white text-sm font-semibold border border-stone-700/40 shadow-[0_4px_16px_rgba(15,23,42,0.28)] transition-all duration-200"
        >
          {user ? "Logout" : "Login"}
        </button>
      </div>
    </header>
  );
}
