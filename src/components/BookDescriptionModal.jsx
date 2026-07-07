import { createPortal } from "react-dom";

export function BookDescriptionModal({ book, onClose }) {
  if (!book) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {book.title}
            </h2>
            <p className="mt-0.5 text-xs font-medium text-gray-500">
              {book.author}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-md p-1 text-gray-400 transition-all hover:-translate-y-0.5 hover:bg-gray-100 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
          {book.description ? (
            <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
              {book.description}
            </p>
          ) : (
            <p className="text-sm italic text-gray-400">
              No description available for this book yet.
            </p>
          )}
        </div>

        <div className="flex justify-end border-t border-gray-100 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-xs font-semibold text-gray-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-gray-50 hover:text-gray-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
