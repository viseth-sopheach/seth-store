import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { BookCard } from '../components/BookCard'

export function BooksPage() {
  const { user } = useAuth()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [borrowingId, setBorrowingId] = useState(null)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    api
      .get('/books')
      .then(setBooks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])  

  async function handleBorrow(book) {
    setMessage(null)
    setBorrowingId(book.id)
    try {
      await api.post('/books_borrowed', { book_id: book.id })
      setBooks((prev) => prev.map((b) => (b.id === book.id ? { ...b, stock: b.stock - 1 } : b)))
      setMessage(`Borrowed "${book.title}". Check My Borrows for the due date.`)
    } catch (err) {
      setMessage(err.message)
    } finally {
      setBorrowingId(null)
    }
  }

  if (loading) return <p>Loading books…</p>
  if (error) return <p style={{ color: 'crimson' }}>{error}</p>

  return (
    <section style={{ padding: 24 }}>
      <h1>Books</h1>
      {message && <p>{message}</p>}
      {books.length === 0 ? (
        <p>No books available yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
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
  )
}