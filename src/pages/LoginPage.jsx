import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        {/* Header Block */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Log in to your account
          </h1>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Welcome back! Please enter your details below.
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 border border-red-200 text-xs font-medium text-red-800 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Form Elements */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="block h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-slate-50 dark:focus:bg-slate-950"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-slate-50 dark:focus:bg-slate-950"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 inline-flex h-10 items-center justify-center rounded-lg bg-slate-900 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:pointer-events-none disabled:opacity-50 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200 dark:focus-visible:outline-slate-50"
          >
            {submitting ? "Logging in…" : "Log in"}
          </button>
        </form>

        {/* Footer Link */}
        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          No account?{" "}
          <Link
            to="/register"
            className="font-semibold text-slate-900 underline underline-offset-4 transition-colors hover:text-slate-700 dark:text-slate-50 dark:hover:text-slate-300"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
