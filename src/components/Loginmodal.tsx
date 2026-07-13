import Spinner from "./Spinner";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useState } from "react";
import { glass, glassBtn, glassInput } from "./glassTokens";

// ─── LoginModal
type AuthMode = "login" | "register";

interface LoginModalProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (name: string, email: string, password: string) => Promise<void>;
  onClose: () => void;
  authError: string | null;
}

export default function LoginModal({
  onLogin,
  onRegister,
  onClose,
  authError,
}: LoginModalProps) {
  const [mode, setMode] = useState<AuthMode>("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  const handleSubmit = async () => {
    if (loading) return;

    setLoading(true);

    try {
      if (isLogin) {
        await onLogin(email, password);
      } else {
        await onRegister(name, email, password);
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next: AuthMode) => {
    if (loading) return;
    setMode(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-950/50 p-4">
      <div
        className={`${glass} w-full sm:max-w-md rounded-3xl overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
          <h2 className="text-gray-800 font-semibold text-base">
            {isLogin ? "Sign in" : "Create account"}
          </h2>
          <button
            onClick={onClose}
            className={`${glassBtn} w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800`}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {authError && (
            <div className="rounded-3xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {authError}
            </div>
          )}

          {/* Name (register only) */}
          {!isLogin && (
            <div>
              <label className="text-[11px] text-black mb-1.5 block uppercase tracking-wider font-medium">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className={glassInput}
                placeholder="Viseth"
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="text-[11px] text-black mb-1.5 block uppercase tracking-wider font-medium">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className={glassInput}
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-[11px] text-black mb-1.5 block uppercase tracking-wider font-medium">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className={`${glassInput} pr-10`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-900 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                {isLogin ? "Signing in..." : "Creating account..."}
                <Spinner />
              </>
            ) : isLogin ? (
              "Sign in"
            ) : (
              "Create account"
            )}
          </button>

          {/* Switch link */}
          <p className="text-center text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => switchMode(isLogin ? "register" : "login")}
              className="font-medium text-stone-900 hover:underline"
            >
              {isLogin ? "Register" : "Sign in"}
            </button>
          </p>

          <button
            onClick={onClose}
            className={`${glassBtn} w-full py-3 rounded-2xl text-sm font-medium text-gray-600`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
