import { FiEye, FiEyeOff } from "react-icons/fi";
import { useState } from "react";
import { glass, glassBtn, glassInput } from "./glassTokens";

// ─── LoginModal ───────────────────────────────────────────────────────────────

interface LoginModalProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onClose: () => void;
  authError: string | null;
}

export default function LoginModal({
  onLogin,
  onClose,
  authError,
}: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = () => onLogin(email, password);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/35 backdrop-blur-sm">
      <div
        className={`${glass} w-full sm:max-w-md rounded-3xl overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/30">
          <h2 className="text-gray-800 font-semibold text-base">Sign in</h2>
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
            className="w-full py-3 rounded-2xl bg-blue-500/90 text-white text-sm font-semibold hover:bg-blue-500 transition-all duration-200"
          >
            Sign in
          </button>

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
