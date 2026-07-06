import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export function MyBorrowsPage() {
  const { isAdmin } = useAuth()
  const [borrows, setBorrows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busyId, setBusyId] = useState(null)

  function load() {
    setLoading(true)
    api
      .get('/books_borrowed')
      .then(setBorrows)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function handleReturn(borrow) {
    setBusyId(borrow.id)
    try {
      const updated = await api.patch(`/books_borrowed/${borrow.id}/return`)
      setBorrows((prev) => prev.map((b) => (b.id === borrow.id ? updated : b)))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  async function handleCancel(borrow) {
    setBusyId(borrow.id)
    try {
      await api.delete(`/books_borrowed/${borrow.id}`)
      setBorrows((prev) => prev.map((b) => (b.id === borrow.id ? { ...b, status: 'cancelled' } : b)))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <p>Loading borrows…</p>

  return (
    <section style={{ padding: 24 }}>
      <h1>{isAdmin ? 'All Borrows' : 'My Borrows'}</h1>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {borrows.length === 0 ? (
        <p>No borrow records yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              {isAdmin && <th>Borrower</th>}
              <th>Borrowed</th>
              <th>Due</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {borrows.map((b) => (
              <tr key={b.id} style={{ borderTop: '1px solid var(--border)' }}>
                <td>{b.title}</td>
                <td>{b.author}</td>
                {isAdmin && <td>{b.user?.name}</td>}
                <td>{b.borrowed_at}</td>
                <td>{b.due_date}</td>
                <td>{b.status}</td>
                <td>
                  {b.status === 'borrowed' && (
                    <>
                      <button type="button" disabled={busyId === b.id} onClick={() => handleReturn(b)}>
                        Return
                      </button>{' '}
                      <button type="button" disabled={busyId === b.id} onClick={() => handleCancel(b)}>
                        Cancel
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}