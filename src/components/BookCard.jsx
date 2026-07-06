import { useState } from "react";
import { BookDescriptionModal } from "./BookDescriptionModal";

export function BookCard({ book, onBorrow, borrowing }) {
  const [showDescription, setShowDescription] = useState(false);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
      {book.image_url && (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-900">
          <img
            src={book.image_url}
            alt={book.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col pt-3">
        <h3 className="line-clamp-1 font-semibold text-slate-900 dark:text-slate-50 text-base tracking-tight">
          {book.title}
        </h3>

        <p className="mt-1 line-clamp-1 text-xs font-medium text-slate-500 dark:text-slate-400">
          {book.author}{" "}
        </p>

        <button
          type="button"
          onClick={() => setShowDescription(true)}
          className="mt-1.5 self-start text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
        >
          See description
        </button>

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-900">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-900 dark:text-slate-50">
              ${Number(book.price).toFixed(2)}
            </span>
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              {book.stock} left
            </span>
          </div>

          {onBorrow && (
            <button
              type="button"
              onClick={() => onBorrow(book)}
              disabled={book.stock < 1 || borrowing}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-3.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:pointer-events-none disabled:bg-slate-100 disabled:text-slate-400 dark:disabled:bg-slate-900 dark:disabled:text-slate-600"
            >
              {book.stock < 1
                ? "Out of stock"
                : borrowing
                  ? "Requesting…"
                  : "Borrow"}
            </button>
          )}
        </div>
      </div>

      {showDescription && (
        <BookDescriptionModal
          book={book}
          onClose={() => setShowDescription(false)}
        />
      )}
    </div>
  );
}
