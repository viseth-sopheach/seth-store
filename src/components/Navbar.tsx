import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { loginUser, logoutUser, registerUser } from "../api/fetchApi";
import { glassInput } from "./glassTokens";
import LoginModal from "./Loginmodal";
import { useNavbarContext } from "./Navbarcontext";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    productCount,
    loadingProducts,
    search,
    onSearchChange,
    onAdd,
    user,
    authLoading,
    setUser,
  } = useNavbarContext();

  const [loginOpen, setLoginOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const isDashboard = location.pathname === "/dashboard";
  const isAdmin = user?.role?.toUpperCase() === "ADMIN";
  const isLoggedIn = user !== null;

  // Listen for "open-login-modal" dispatched by other components
  useEffect(() => {
    const handler = () => setLoginOpen(true);
    window.addEventListener("open-login-modal", handler);
    return () => window.removeEventListener("open-login-modal", handler);
  }, []);

  // ── Auth handlers 

  const handleLogin = async (email: string, password: string) => {
    setAuthError(null);
    try {
      await loginUser(email, password);
      window.dispatchEvent(new Event("auth-change"));
      setLoginOpen(false);
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : "Login failed.");
    }
  };

  const handleRegister = async (
    name: string,
    email: string,
    password: string
  ) => {
    setAuthError(null);
    try {
      await registerUser(name, email, password);
      window.dispatchEvent(new Event("auth-change"));
      setLoginOpen(false);
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : "Registration failed.");
    }
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    window.dispatchEvent(new Event("auth-change"));
  };

  // ── Avoid a flash before auth resolves
  if (authLoading) {
    return null;
  }

  return (
    <div className="sticky top-0 z-30 bg-white/25 backdrop-blur-2xl border-b border-white/40 shadow-[0_2px_20px_rgba(0,0,0,0.06)]">
      <header className="sticky top-0 z-30 bg-white/25 backdrop-blur-2xl border-b border-white/40 shadow-[0_2px_20px_rgba(0,0,0,0.06)] px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* LEFT — Title + item count */}
          <div className="flex-1 min-w-0 pl-2">
            <h1 className="text-gray-800 font-bold text-lg sm:text-xl tracking-tight leading-tight">
              {isDashboard ? "Computer Shop Orders" : "Viseth's Tech"}
            </h1>
            {!isDashboard && (
              <p className="text-[12px] text-gray-400 mt-0.5 leading-none">
                {loadingProducts
                  ? "Loading…"
                  : `${productCount ?? 0} item${productCount !== 1 ? "s" : ""}`}
              </p>
            )}
          </div>

          {/* CENTER — Search bar (only relevant on the products page) */}
          {!isDashboard && (
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
          )}

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
                <button
                  onClick={() => navigate("/")}
                  className="w-fit whitespace-nowrap bg-cyan-200 rounded-2xl py-2 px-4 text-sm font-medium text-gray-700 cursor-pointer hover:bg-cyan-300 transition-colors"
                >
                  Computer Products
                </button>
                {!isDashboard && onAdd && (
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

      {loginOpen && createPortal(
     <LoginModal
       onLogin={handleLogin}
       onRegister={handleRegister}
       onClose={() => setLoginOpen(false)}
       authError={authError}
     />,
     document.body
   )}

      {/* Mobile search — only on the products page */}
      {!isDashboard && (
        <div className="sm:hidden px-4 pt-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none select-none">
              <FaSearch/>
            </span>
            <input
              value={search ?? ""}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search products…"
              className={`${glassInput} pl-9`}
            />
          </div>
        </div>
      )}
    </div>
  );
}