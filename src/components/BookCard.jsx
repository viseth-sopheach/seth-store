import { useState } from "react";
import { BookDescriptionModal } from "./BookDescriptionModal";

export function BookCard({ book, onBorrow, borrowing }) {
  const [showDescription, setShowDescription] = useState(false);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {book.image_url && (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100">
          <img
            src={book.image_url}
            alt={book.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col pt-3">
        <h3 className="line-clamp-1 text-base font-semibold tracking-tight text-gray-900">
          {book.title}
        </h3>

        <p className="mt-1 line-clamp-1 text-xs font-medium text-gray-500">
          {book.author}
        </p>

        <button
          type="button"
          onClick={() => setShowDescription(true)}
          className="mt-1.5 self-start text-xs font-semibold text-gray-600 transition hover:text-black hover:underline"
        >
          See description
        </button>

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-gray-200 pt-3">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-black">
              ${Number(book.price).toFixed(2)}
            </span>
            <span className="text-[11px] font-medium text-gray-500">
              {book.stock} left
            </span>
          </div>

          {onBorrow ? (
            <button
              type="button"
              onClick={() => onBorrow(book)}
              disabled={book.stock < 1 || borrowing}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-500 px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
            >
              {book.stock < 1
                ? "Out of stock"
                : borrowing
                  ? "Requesting…"
                  : "Borrow"}
            </button>
          ) : (
            <span className="text-[11px] font-medium italic text-gray-400">
              Login to borrow a book
            </span>
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
