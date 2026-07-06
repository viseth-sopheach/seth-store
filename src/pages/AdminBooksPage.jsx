import { useEffect, useState } from 'react'
import { api } from '../api/client'

const emptyForm = { category_id: '', title: '', author: '', genre: '', price: '', stock: 0 }

export function AdminBooksPage() {
  const [books, setBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  function load() {
    api.get('/books').then(setBooks).catch((err) => setError(err.message))
    api.get('/categories').then(setCategories).catch(() => {})
  }

  useEffect(load, [])

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  function startEdit(book) {
    setEditingId(book.id)
    setForm({
      category_id: book.category_id,
      title: book.title,
      author: book.author,
      genre: book.genre,
      price: book.price,
      stock: book.stock,
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      if (editingId) {
        await api.put(`/books/${editingId}`, form)
      } else {
        await api.post('/books', form)
      }
      cancelEdit()
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(book) {
    if (!confirm(`Delete "${book.title}"?`)) return
    try {
      await api.delete(`/books/${book.id}`)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section style={{ padding: 24 }}>
      <h1>Manage Books</h1>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginBottom: 24 }}>
        <select value={form.category_id} onChange={update('category_id')} required>
          <option value="">Category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input placeholder="Title" value={form.title} onChange={update('title')} required />
        <input placeholder="Author" value={form.author} onChange={update('author')} required />
        <input placeholder="Genre" value={form.genre} onChange={update('genre')} required />
        <input type="number" step="0.01" placeholder="Price" value={form.price} onChange={update('price')} required />
        <input type="number" placeholder="Stock" value={form.stock} onChange={update('stock')} />
        <div style={{ gridColumn: '1 / -1' }}>
          <button type="submit" disabled={saving}>{editingId ? 'Update book' : 'Add book'}</button>{' '}
          {editingId && <button type="button" onClick={cancelEdit}>Cancel</button>}
        </div>
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr>
            <th>Title</th><th>Author</th><th>Genre</th><th>Price</th><th>Stock</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id} style={{ borderTop: '1px solid var(--border)' }}>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.genre}</td>
              <td>${Number(book.price).toFixed(2)}</td>
              <td>{book.stock}</td>
              <td>
                <button type="button" onClick={() => startEdit(book)}>Edit</button>{' '}
                <button type="button" onClick={() => handleDelete(book)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}