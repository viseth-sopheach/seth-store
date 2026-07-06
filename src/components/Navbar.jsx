import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Navigation Links */}
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link
            to="/"
            className="text-slate-900 transition-colors hover:text-slate-600 dark:text-slate-50 dark:hover:text-slate-300"
          >
            Books
          </Link>

          {user && (
            <Link
              to="/my-borrows"
              className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
            >
              My Borrows
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin/books"
              className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
            >
              Manage Books
            </Link>
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
              <Link
                to="/login"
                className="font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
              >
                Log in
              </Link>

              <Link
                to="/register"
                className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
