import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";
import {
  fetchAuthUser,
  loginUser,
  logoutUser,
  type AuthUser,
} from "../fetchApi/fetchApi";

interface NavbarProps {
  productsCount: number;
  onSearchChange?: (value: string) => void;
  onOpenAdd?: () => void;
  onOpenDashboard?: () => void;
  onAuthChange?: (user: AuthUser | null) => void;
}

const inputClass =
  "w-full rounded-2xl border border-stone-200 bg-white px-4 py-2.75 text-sm text-stone-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const Navbar = ({
  productsCount,
  onSearchChange,
  onOpenAdd,
  onOpenDashboard,
  onAuthChange,
}: NavbarProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [search, setSearch] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const isAdmin = user?.role?.toUpperCase() === "ADMIN";
  const isLoggedIn = user !== null;

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const currentUser = await fetchAuthUser();
        if (!active) return;
        setUser(currentUser);
        onAuthChange?.(currentUser);
      } catch {
        if (!active) return;
        logoutUser();
        setUser(null);
        onAuthChange?.(null);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    onSearchChange?.(value);
  };

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setAuthError(null);
    setIsLoggingIn(true);
    try {
      const currentUser = await loginUser(loginEmail, loginPassword);
      setUser(currentUser);
      onAuthChange?.(currentUser);
      setLoginOpen(false);
      setLoginEmail("");
      setLoginPassword("");
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : "Login failed.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    onAuthChange?.(null);
  };

  const handleOpenDashboard = () => {
    if (!isAdmin) return;
    navigate("/dashboard");
    onOpenDashboard?.();
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold tracking-tight text-stone-900 sm:text-xl">
              Viseth Café
            </h1>
            <p className="mt-0.5 text-xs text-stone-500">
              {productsCount} item{productsCount !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* <Link to="/" className={navLinkClass("/")}>
              Products
            </Link> */}
          </div>

          <div className="relative hidden w-60 sm:block">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-stone-400">
              <FaSearch />
            </span>
            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search…"
              className={`${inputClass} pl-9`}
            />
          </div>

          {isAdmin && (
            <>
              <button
                onClick={handleOpenDashboard}
                className="rounded-full border border-stone-200 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-50"
              >
                Dashboard
              </button>
              <button
                onClick={onOpenAdd}
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <span className="text-lg leading-none">+</span>
                <span className="hidden sm:inline">Add</span>
              </button>
            </>
          )}

          {!isLoggedIn && (
            <p className="hidden text-xs italic text-stone-500 sm:block">
              Login to buy
            </p>
          )}

          {user && (
            <span
              className={`hidden items-center rounded-full px-3 py-1 text-[11px] font-semibold sm:inline-flex ${
                isAdmin
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {user.name}
            </span>
          )}

          <button
            onClick={user ? handleLogout : () => setLoginOpen(true)}
            disabled={isLoggingIn}
            className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoggingIn ? "Logging in…" : user ? "Logout" : "Login"}
          </button>
        </div>
      </header>

      <div className="px-4 pt-4 sm:hidden">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-stone-400">
            <FaSearch />
          </span>

          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search drinks..."
            className={`${inputClass} w-full pl-10`}
          />
        </div>
      </div>

      {loginOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/40 p-4 sm:items-center">
          <div className="w-full rounded-[1.75rem] border border-stone-200 bg-white shadow-xl sm:max-w-md">
            <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
              <h2 className="text-base font-semibold text-stone-900">
                Sign in
              </h2>
              <button
                onClick={() => setLoginOpen(false)}
                disabled={isLoggingIn}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 p-6">
              {authError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {authError}
                </div>
              )}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">
                  Email
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  disabled={isLoggingIn}
                  className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-60`}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    disabled={isLoggingIn}
                    className={`${inputClass} pr-10 disabled:cursor-not-allowed disabled:opacity-60`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 transition hover:text-stone-700"
                  >
                    {showPassword ? (
                      <FiEyeOff size={18} />
                    ) : (
                      <FiEye size={18} />
                    )}
                  </button>
                </div>
              </div>
              <button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingIn ? "Signing in…" : "Sign in"}
              </button>
              <button
                onClick={() => setLoginOpen(false)}
                disabled={isLoggingIn}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
