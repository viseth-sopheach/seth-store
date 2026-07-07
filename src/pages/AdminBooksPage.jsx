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
  const [imageFile, setImageFile] = useState(null);
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
    setImageFile(null);
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
    setImageFile(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const data = new FormData();
      data.append("category_id", form.category_id);
      data.append("title", form.title);
      data.append("author", form.author);
      data.append("price", form.price);
      data.append("stock", form.stock);
      if (form.description) data.append("description", form.description);
      if (imageFile) data.append("image", imageFile);

      if (editingId) {
        // PHP won't parse a raw PUT multipart body, so spoof it as POST
        data.append("_method", "PUT");
        await api.post(`/books/${editingId}`, data);
      } else {
        await api.post("/books", data);
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
      <div className="mb-8 border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">
          Manage Books
        </h1>
      </div>

      {/* Error Alert Box */}
      {error && (
        <div className="mb-6 rounded-lg bg-blue-50 p-4 border border-blue-200">
          <div className="flex">
            <div className="text-sm font-medium text-blue-800">
              {error}
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Form Card */}
      <div className="mb-10 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
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
            className="block h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 shadow-sm transition-colors focus:border-blue-600 focus:bg-white focus:outline-none"
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
            className="block h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-blue-600 focus:bg-white focus:outline-none"
          />

          <input
            placeholder="Author"
            value={form.author}
            onChange={update("author")}
            required
            className="block h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-blue-600 focus:bg-white focus:outline-none"
          />

          <input
            type="number"
            step="0.01"
            placeholder="Price"
            value={form.price}
            onChange={update("price")}
            required
            className="block h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-blue-600 focus:bg-white focus:outline-none"
          />

          <input
            type="number"
            placeholder="Stock"
            value={form.stock}
            onChange={update("stock")}
            className="block h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-blue-600 focus:bg-white focus:outline-none"
          />

          <input
            key={editingId ?? "new"}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="block h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 shadow-sm transition-colors file:mr-3 file:h-full file:border-0 file:bg-transparent file:text-sm file:font-medium focus:border-blue-600 focus:bg-white focus:outline-none"
          />

          <textarea
            placeholder="Description"
            value={form.description}
            onChange={update("description")}
            rows={2}
            className="col-span-1 block w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-blue-600 focus:bg-white focus:outline-none sm:col-span-2 md:col-span-3 lg:col-span-6"
          />

          <div className="col-span-1 flex flex-wrap items-center gap-3 pt-2 sm:col-span-2 md:col-span-3 lg:col-span-6">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:pointer-events-none disabled:opacity-50"
            >
              {editingId ? "Update book" : "Add book"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-xs font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Data Management Table Component */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
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
            <tbody className="divide-y divide-gray-100">
              {books.map((book) => (
                <tr
                  key={book.id}
                  className="transition-colors hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap px-6 py-4 font-semibold text-gray-900">
                    {book.title}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                    {book.author}
                  </td>
                  <td className="max-w-xs truncate px-6 py-4 text-gray-600">
                    {book.description || "—"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                    ${Number(book.price).toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                    {book.stock}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(book)}
                        className="inline-flex h-8 items-center justify-center rounded-md border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:text-black"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(book)}
                        className="inline-flex h-8 items-center justify-center rounded-md border border-transparent bg-blue-50 px-3 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
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