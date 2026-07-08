import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { BookCard } from "../components/BookCard";

const CACHE_KEY = "books_cache";

export function BooksPage() {
  const { user } = useAuth();
  const [books, setBooks] = useState(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem(CACHE_KEY);
    } catch {
      return true;
    }
  });
  const [error, setError] = useState(null);
  const [borrowingId, setBorrowingId] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let cached = null;

    try {
      cached = sessionStorage.getItem(CACHE_KEY);
    } catch {}

    // Show cached books immediately
    if (cached) {
      try {
        setBooks(JSON.parse(cached));
        setLoading(false);
      } catch {}
    }

    // Always fetch latest books
    api
      .get("/books")
      .then((data) => {
        setBooks(data);

        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
        } catch {}
      })
      .catch((err) => {
        if (!cached) {
          setError(err.message);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  function refetch() {
    setLoading(true);
    api
      .get("/books")
      .then((data) => {
        setBooks(data);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
        } catch {}
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  async function handleBorrow(book) {
    setMessage(null);
    setBorrowingId(book.id);
    try {
      await api.post("/books_borrowed", { book_id: book.id });
      setMessage(
        `Borrow request for "${book.title}" was submitted. It'll appear on My Borrows once an admin approves it.`,
      );
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBorrowingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] w-full flex-col items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800 dark:border-slate-800 dark:border-t-slate-200" />
        <p className="mt-3 text-xs font-semibold tracking-wide text-slate-400 uppercase">
          Loading books…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between border-b border-slate-100 pb-5 dark:border-slate-900">
        <h1 className="text-2xl font-bold tracking-tight text-[#4f4023] sm:text-3xl">
          Let's read together!
        </h1>
        <button
          type="button"
          onClick={refetch}
          className="text-xs font-semibold text-slate-500 underline underline-offset-4 hover:text-slate-800"
        >
          Refresh
        </button>
      </div>

      {/* Status Messages */}
      {message && (
        <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          The book you borrowed has been successfully requested. Please wait for
          an admin to approve your request.
        </div>
      )}

      {books.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-12 text-center dark:border-slate-800">
          <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
            No books available yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onBorrow={user ? handleBorrow : undefined}
              borrowing={borrowingId === book.id}
            />
          ))}
        </div>
      )}
    </section>
  );
}
