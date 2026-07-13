import { useState, type FormEvent } from "react";
import { glass, glassInput, glassBtn } from "./glassTokens";
import { sendFeedback } from "../api/fetchApi";

export default function Footer() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setStatus("loading");
    setErrorMsg(null);

    try {
      await sendFeedback({ subject, message });
      setSubject("");
      setMessage("");
      setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  };

  return (
    <footer
      className={`${glass} mt-6 w-full rounded-[1.5rem] px-4 py-6 sm:px-6 sm:py-8 lg:px-8`}
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-md">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">
            Contact
          </p>
          <h3 className="mt-2 text-lg font-semibold text-stone-900">
            Send us feedback
          </h3>
          <p className="mt-1 text-sm text-stone-600">
            Share a suggestion, report a problem, or ask about a product.
          </p>
        </div>

        {status === "success" ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            Thanks — your feedback was sent successfully.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-3 md:max-w-md"
          >
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={glassInput}
              maxLength={255}
              required
            />
            <textarea
              placeholder="Your message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={`${glassInput} min-h-[104px] resize-none`}
              required
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className={`${glassBtn} self-start px-5 py-2.5 font-medium text-stone-800 disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {status === "loading" ? "Sending…" : "Send feedback"}
            </button>
            {status === "error" && errorMsg && (
              <p className="text-sm text-red-600">{errorMsg}</p>
            )}
          </form>
        )}
      </div>

      <div className="mx-auto mt-6 flex flex-col items-center justify-between gap-2 border-t border-stone-200 pt-6 text-sm text-stone-500 sm:flex-row">
        <p>© {new Date().getFullYear()} SOPHAECH VISETH</p>
        <div className="flex gap-4">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Contact</span>
        </div>
      </div>
    </footer>
  );
}
