import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { loginUser, logoutUser, registerUser } from "../api/fetchApi";
import { input as inputStyle } from "./glassTokens";
import LoginModal from "./Loginmodal";
import { useNavbarContext } from "./Navbarcontext";

function navPill(active: boolean, extra = "") {
  return `rounded-full px-3 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 ${
    active
      ? "bg-stone-900 text-white"
      : "bg-stone-100 text-stone-700 hover:bg-stone-200"
  } ${extra}`;
}

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
  const isStorePage = !isDashboard; // "/", "/desktop", "/accessory"
  const isAdmin = user?.role?.toUpperCase() === "ADMIN";
  const isLoggedIn = user !== null;

  useEffect(() => {
    const handler = () => setLoginOpen(true);
    window.addEventListener("open-login-modal", handler);
    return () => window.removeEventListener("open-login-modal", handler);
  }, []);

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
    password: string,
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

  if (authLoading) {
    return (
      <div className="bg-white">
        <div className="mx-auto flex h-[60px] max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div className="h-4 w-32 animate-pulse rounded bg-stone-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold tracking-tight text-stone-900 sm:text-xl">
            {isDashboard ? "Viseth Manager" : "Viseth's Tech"}
          </h1>
          {!isDashboard && (
            <p className="mt-0.5 text-xs text-stone-500 sm:text-sm">
              {loadingProducts
                ? "Loading…"
                : `${productCount ?? 0} item${productCount !== 1 ? "s" : ""} available`}
            </p>
          )}
        </div>

        {!isDashboard && (
          <div className="relative hidden w-56 md:block lg:w-72">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-stone-400">
              <FaSearch aria-hidden="true" />
            </span>
            <input
              value={search ?? ""}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search products"
              aria-label="Search products"
              className={`${inputStyle} pl-9`}
            />
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-2">
          {isAdmin && (
            <>
              <button
                onClick={() => navigate("/dashboard")}
                className={navPill(isDashboard)}
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate("/")}
                className={navPill(isStorePage)}
              >
                Store
              </button>
              {!isDashboard && onAdd && (
                <button
                  onClick={onAdd}
                  className="rounded-full bg-stone-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-stone-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
                >
                  + Add
                </button>
              )}
            </>
          )}

          {!isLoggedIn && (
            <p className="hidden text-xs text-stone-500 lg:block">
              Login to buy
            </p>
          )}

          {user && (
            <span className="hidden rounded-full border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-700 sm:inline-flex">
              {user.name}
            </span>
          )}

          <button
            onClick={user ? handleLogout : () => setLoginOpen(true)}
            className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
          >
            {user ? "Logout" : "Login"}
          </button>
        </div>
      </header>

      {!isDashboard && (
        <div className="px-4 pb-3 md:hidden">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-stone-400">
              <FaSearch aria-hidden="true" />
            </span>
            <input
              value={search ?? ""}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search products"
              aria-label="Search products"
              className={`${inputStyle} pl-9`}
            />
          </div>
        </div>
      )}

      {loginOpen &&
        createPortal(
          <LoginModal
            onLogin={handleLogin}
            onRegister={handleRegister}
            onClose={() => setLoginOpen(false)}
            authError={authError}
          />,
          document.body,
        )}
    </div>
  );
}
