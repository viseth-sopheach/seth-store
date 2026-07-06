import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await register(form.name, form.email, form.password, form.password_confirmation)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 320, margin: '48px auto', display: 'grid', gap: 12 }}>
      <h1>Register</h1>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      <input placeholder="Name" value={form.name} onChange={update('name')} required />
      <input type="email" placeholder="Email" value={form.email} onChange={update('email')} required />
      <input type="password" placeholder="Password" value={form.password} onChange={update('password')} required />
      <input type="password" placeholder="Confirm password" value={form.password_confirmation} onChange={update('password_confirmation')} required />
      <button type="submit" disabled={submitting}>{submitting ? 'Creating…' : 'Create account'}</button>
      <p>Already have an account? <Link to="/login">Log in</Link></p>
    </form>
  )
}