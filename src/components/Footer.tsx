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
    <footer className={`${glass} rounded-3xl w-full mt-12 px-6 py-8`}>
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div>
          <h3 className="text-gray-800 text-lg font-semibold">
            Send us feedback
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            Found a bug, have a suggestion, or just something else?
          </p>
        </div>

        {status === "success" ? (
          <p className="text-sm text-emerald-600 font-medium">
            Thanks — your feedback was sent!
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 w-full md:max-w-md"
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
              className={`${glassInput} min-h-[100px] resize-none`}
              required
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className={`${glassBtn} rounded-2xl px-5 py-2.5 text-sm font-medium text-gray-800 self-start disabled:opacity-60`}
            >
              {status === "loading" ? "Sending…" : "Send feedback"}
            </button>
            {status === "error" && errorMsg && (
              <p className="text-sm text-red-500">{errorMsg}</p>
            )}
          </form>
        )}
      </div>

      <div className="max-w-5xl mx-auto mt-6 pt-6 border-t border-white/40 flex flex-col sm:flex-row justify-between items-center gap-2">
        <p className="text-gray-400 text-xs">
          © {new Date().getFullYear()} SOPHAECH VISETH
        </p>
        <div className="flex gap-4 text-gray-400 text-xs">
          <a href="#" className="hover:text-gray-600">
            Privacy
          </a>
          <a href="#" className="hover:text-gray-600">
            Terms
          </a>
          <a href="#" className="hover:text-gray-600">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
