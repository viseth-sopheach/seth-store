import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { MdOutlineDashboard, MdComputer } from "react-icons/md";
import { FaSearch } from "react-icons/fa";
import {
  fetchAuthUser,
  loginUser,
  logoutUser,
  type AuthUser,
} from "../api/fetchApi";
import { glassInput } from "./glassTokens";
import LoginModal from "./Loginmodal";
import { useNavbarContext } from "./Navbarcontext";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { productCount, loadingProducts, search, onSearchChange, onAdd } =
    useNavbarContext();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const isDashboard = location.pathname === "/dashboard";
  const isPcProducts =
    location.pathname === "/" || location.pathname === "/products";
  const isAdmin = user?.role?.toUpperCase() === "ADMIN";
  const isLoggedIn = user !== null;

  // ── Bootstrap auth
  useEffect(() => {
    fetchAuthUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setAuthLoading(false));
  }, []);

  // Listen for "open-login-modal" dispatched by other components
  useEffect(() => {
    const handler = () => setLoginOpen(true);
    window.addEventListener("open-login-modal", handler);
    return () => window.removeEventListener("open-login-modal", handler);
  }, []);

  // ── Auth handlers ─────────────────────────────────────────────────────────

  const handleLogin = async (email: string, password: string) => {
    setAuthError(null);
    try {
      await loginUser(email, password);
      const currentUser = await fetchAuthUser();
      setUser(currentUser);
      setLoginOpen(false);
      window.dispatchEvent(new Event("auth-change"));
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : "Login failed.");
    }
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    window.dispatchEvent(new Event("auth-change"));
  };

  // ── Hide navbar entirely on /dashboard for non-admins ─────────────────────
  // Wait for auth to finish loading first so we don't briefly hide it for
  // admins while fetchAuthUser() is still in flight.
  if (isDashboard && !authLoading && !isAdmin) {
    return null;
  }

  // ── Render: glass header (PC Products page) ───────────────────────────────

  if (isPcProducts) {
    return (
      <>
        <header className="sticky top-0 z-30 bg-white/25 backdrop-blur-2xl border-b border-white/40 shadow-[0_2px_20px_rgba(0,0,0,0.06)] px-4 sm:px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            {/* LEFT — Title + item count */}
            <div className="flex-1 min-w-0 pl-2">
              <h1 className="text-gray-800 font-bold text-lg sm:text-xl tracking-tight leading-tight">
                PC Products
              </h1>
              <p className="text-[12px] text-gray-400 mt-0.5 leading-none">
                {loadingProducts
                  ? "Loading…"
                  : `${productCount ?? 0} item${productCount !== 1 ? "s" : ""}`}
              </p>
            </div>

            {/* CENTER — Search bar */}
            <div className="relative hidden sm:block w-72">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none select-none">
                <FaSearch />
              </span>
              <input
                value={search ?? ""}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder="Search…"
                className={`${glassInput} pl-9`}
              />
            </div>

            {/* RIGHT — Admin buttons + user badge + auth */}
            <div className="flex items-center gap-2 flex-1 justify-end">
              {isAdmin && (
                <>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="bg-cyan-200 rounded-2xl py-2 px-4 text-sm font-medium text-gray-700 cursor-pointer hover:bg-cyan-300 transition-colors"
                  >
                    Dashboard
                  </button>
                  {onAdd && (
                    <button
                      onClick={onAdd}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-blue-500/75 backdrop-blur-md hover:bg-blue-500/90 active:scale-95 text-white text-sm font-semibold border border-blue-400/40 shadow-[0_4px_16px_rgba(59,130,246,0.28)] transition-all duration-200 cursor-pointer"
                    >
                      <span className="text-lg leading-none -mt-0.5">+</span>
                      <span className="hidden sm:inline">Add</span>
                    </button>
                  )}
                </>
              )}

              {!isLoggedIn && (
                <p className="hidden sm:block text-[11px] text-gray-400 italic">
                  Login to buy
                </p>
              )}

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

              <button
                onClick={user ? handleLogout : () => setLoginOpen(true)}
                className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-stone-900/90 backdrop-blur-md hover:bg-stone-800/90 active:scale-95 text-white text-sm font-semibold border border-stone-700/40 shadow-[0_4px_16px_rgba(15,23,42,0.28)] transition-all duration-200 cursor-pointer"
              >
                {user ? "Logout" : "Login"}
              </button>
            </div>
          </div>
        </header>

        {loginOpen && (
          <LoginModal
            onLogin={handleLogin}
            onClose={() => setLoginOpen(false)}
            authError={authError}
          />
        )}

        {/* Mobile search — shown below header on small screens */}
        <div className="sm:hidden px-4 pt-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none select-none">
              🔍
            </span>
            <input
              value={search ?? ""}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search products…"
              className={`${glassInput} pl-9`}
            />
          </div>
        </div>
      </>
    );
  }

  // ── Render: standard white nav (Dashboard + other pages) ──────────────────

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-8 h-16 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        {/* Branding */}
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm text-white ${
              isDashboard ? "bg-orange-600" : "bg-indigo-600"
            }`}
          >
            {isDashboard ? <MdOutlineDashboard /> : <MdComputer />}
          </div>
          <span className="font-bold text-base text-gray-900 tracking-tight">
            {isDashboard ? "Computer Shop Orders" : "Computer Shop"}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate("/")}
            className="bg-green-300 py-2.5 px-2.5 rounded-md text-sm text-gray-700 font-medium cursor-pointer hover:bg-green-400 transition-colors"
          >
            Computer Products
          </button>

          {isAdmin && (
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-cyan-200 py-2.5 px-4 rounded-2xl text-sm text-gray-700 font-medium cursor-pointer hover:bg-cyan-300 transition-colors flex items-center gap-1.5"
            >
              <MdOutlineDashboard className="text-base" />
              Dashboard
            </button>
          )}

          {user && (
            <span className="bg-gray-100 py-2.5 px-3 rounded-md text-sm text-gray-700 font-medium">
              {user.name}
            </span>
          )}

          <button
            onClick={user ? handleLogout : () => setLoginOpen(true)}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-stone-900/90 backdrop-blur-md hover:bg-stone-800/90 active:scale-95 text-white text-sm font-semibold border border-stone-700/40 shadow-[0_4px_16px_rgba(15,23,42,0.28)] transition-all duration-200 cursor-pointer"
          >
            {user ? "Logout" : "Login"}
          </button>
        </div>
      </header>

      {loginOpen && (
        <LoginModal
          onLogin={handleLogin}
          onClose={() => setLoginOpen(false)}
          authError={authError}
        />
      )}
    </>
  );
}
