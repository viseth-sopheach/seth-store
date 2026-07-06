import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Navbar() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <nav style={{ display: 'flex', gap: 16, padding: 16, borderBottom: '1px solid var(--border)' }}>
      <Link to="/">Books</Link>
      {user && <Link to="/my-borrows">My Borrows</Link>}
      {isAdmin && <Link to="/admin/books">Manage Books</Link>}

      <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
        {user ? (
          <>
            <span>{user.name}</span>
            <button type="button" onClick={handleLogout}>Log out</button>
          </>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}