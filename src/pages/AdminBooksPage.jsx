import { useEffect, useState } from "react";
import { api } from "../api/client";

const emptyForm = {
  category_id: "",
  title: "",
  author: "",
  price: "",
  stock: 0,
  description: "",
};

export function AdminBooksPage() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  function load() {
    api
      .get("/books")
      .then(setBooks)
      .catch((err) => setError(err.message));
    api
      .get("/categories")
      .then(setCategories)
      .catch(() => {});
  }

  useEffect(load, []);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function startEdit(book) {
    setEditingId(book.id);
    setForm({
      category_id: book.category_id,
      title: book.title,
      author: book.author,
      price: book.price,
      stock: book.stock,
      description: book.description ?? "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/books/${editingId}`, form);
      } else {
        await api.post("/books", form);
      }
      cancelEdit();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(book) {
    if (!confirm(`Delete "${book.title}"?`)) return;
    try {
      await api.delete(`/books/${book.id}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8 border-b border-slate-200 pb-5 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-black  sm:text-3xl">
          Manage Books
        </h1>
      </div>

      {/* Error Alert Box */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200 dark:bg-red-950/30 dark:border-red-900/50">
          <div className="flex">
            <div className="text-sm font-medium text-red-800 dark:text-red-400">
              {error}
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Form Card */}
      <div className="mb-10 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {editingId ? "Modify Selected Item" : "Register New Inventory Item"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
        >
          <select
            value={form.category_id}
            onChange={update("category_id")}
            required
            className="block h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 shadow-sm transition-colors focus:border-slate-900 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50 dark:focus:border-slate-50 dark:focus:bg-slate-950"
          >
            <option value="">Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            placeholder="Title"
            value={form.title}
            onChange={update("title")}
            required
            className="block h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-slate-50 dark:focus:bg-slate-950"
          />

          <input
            placeholder="Author"
            value={form.author}
            onChange={update("author")}
            required
            className="block h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-slate-50 dark:focus:bg-slate-950"
          />

          <input
            type="number"
            step="0.01"
            placeholder="Price"
            value={form.price}
            onChange={update("price")}
            required
            className="block h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-slate-50 dark:focus:bg-slate-950"
          />

          <input
            type="number"
            placeholder="Stock"
            value={form.stock}
            onChange={update("stock")}
            className="block h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-slate-50 dark:focus:bg-slate-950"
          />

          <textarea
            placeholder="Description"
            value={form.description}
            onChange={update("description")}
            rows={2}
            className="col-span-1 block w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-slate-50 dark:focus:bg-slate-950 sm:col-span-2 md:col-span-3 lg:col-span-6"
          />

          <div className="col-span-1 flex flex-wrap items-center gap-3 pt-2 sm:col-span-2 md:col-span-3 lg:col-span-6">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white shadow-sm transition-all hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:pointer-events-none disabled:opacity-50 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200 dark:focus-visible:outline-slate-50"
            >
              {editingId ? "Update book" : "Add book"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Data Management Table Component */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-900/50 dark:text-slate-400">
              <tr>
                <th scope="col" className="px-6 py-3.5">
                  Title
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Author
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Description
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Price
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Stock
                </th>
                <th scope="col" className="px-6 py-3.5 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
              {books.map((book) => (
                <tr
                  key={book.id}
                  className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/20"
                >
                  <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-900 dark:text-slate-50">
                    {book.title}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-slate-600 dark:text-slate-400">
                    {book.author}
                  </td>
                  <td className="max-w-xs truncate px-6 py-4 text-slate-600 dark:text-slate-400">
                    {book.description || "—"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-900 dark:text-slate-50">
                    ${Number(book.price).toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-slate-600 dark:text-slate-400">
                    {book.stock}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(book)}
                        className="inline-flex h-8 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(book)}
                        className="inline-flex h-8 items-center justify-center rounded-md border border-transparent bg-red-50 px-3 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
