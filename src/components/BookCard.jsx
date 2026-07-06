export function BookCard({ book, onBorrow, borrowing }) {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 16, textAlign: 'left' }}>
      {book.image_url && (
        <img src={book.image_url} alt={book.title} style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 4 }} />
      )}
      <h3 style={{ margin: '12px 0 4px' }}>{book.title}</h3>
      <p style={{ margin: 0, color: 'var(--text)' }}>{book.author} · {book.genre}</p>
      <p style={{ margin: '8px 0' }}>${Number(book.price).toFixed(2)} · {book.stock} in stock</p>
      {onBorrow && (
        <button type="button" onClick={() => onBorrow(book)} disabled={book.stock < 1 || borrowing}>
          {book.stock < 1 ? 'Out of stock' : borrowing ? 'Borrowing…' : 'Borrow'}
        </button>
      )}
    </div>
  )
}