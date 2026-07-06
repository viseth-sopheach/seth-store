import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(
        form.name,
        form.email,
        form.password,
        form.password_confirmation,
      );
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
            Create an account
          </h1>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Join us to explore and borrow books from the library.
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
              Full Name
            </label>
            <input
              placeholder="John Doe"
              value={form.name}
              onChange={update("name")}
              required
              className="block h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-slate-50 dark:focus:bg-slate-950"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={form.email}
              onChange={update("email")}
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
              value={form.password}
              onChange={update("password")}
              required
              className="block h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-slate-50 dark:focus:bg-slate-950"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password_confirmation}
              onChange={update("password_confirmation")}
              required
              className="block h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-slate-50 dark:focus:bg-slate-950"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 inline-flex h-10 items-center justify-center rounded-lg bg-slate-900 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:pointer-events-none disabled:opacity-50 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200 dark:focus-visible:outline-slate-50"
          >
            {submitting ? "Creating…" : "Create account"}
          </button>
        </form>

        {/* Footer Link */}
        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-slate-900 underline underline-offset-4 transition-colors hover:text-slate-700 dark:text-slate-50 dark:hover:text-slate-300"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
