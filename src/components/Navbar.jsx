import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  const linkClass = ({ isActive }) =>
    [
      "transition-colors",
      isActive
        ? "text-slate-900 dark:text-slate-50 font-semibold"
        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50",
    ].join(" ");

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Navigation Links */}
        <div className="flex items-center gap-6 text-sm font-medium">
          <NavLink to="/" end className={linkClass}>
            Books
          </NavLink>

          {user && (
            <NavLink to="/my-borrows" className={linkClass}>
              My Borrows
            </NavLink>
          )}

          {isAdmin && (
            <NavLink to="/admin/books" className={linkClass}>
              Manage Books
            </NavLink>
          )}
        </div>

        {/* User Actions Right Side */}
        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {user.name}
              </span>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-50"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  [
                    "font-medium transition-colors",
                    isActive
                      ? "text-slate-900 dark:text-slate-50"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50",
                  ].join(" ")
                }
              >
                Log in
              </NavLink>

              <NavLink
                to="/register"
                className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
              >
                Register
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
