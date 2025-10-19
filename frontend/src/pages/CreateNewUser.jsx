import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './jobAI.css'

export default function CreateNewUser() {
  useEffect(() => { document.title = 'Create Account – jobhunter.ai' }, [])

  // Placeholder for database/API fetch logic
  useEffect(() => {
    async function fetchData() {
      // TODO: Insert API/database fetch call here
    }
    fetchData()
  }, [])

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <div>
      <a href="/" className="brand" aria-label="jobhunter.ai">
        <span className="brand-dot" aria-hidden="true"></span>
        <span>jobhunter.ai</span>
      </a>

      <div className="auth-wrap" style={{ marginTop: '110px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100vw', boxSizing: 'border-box' }}>
        <div data-slot="card" style={{
          maxWidth: '680px',
          width: '90%',
          padding: '2.5rem 3rem',
          boxSizing: 'border-box'
        }}>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>Create Account</h1>
          <p style={{ color: 'var(--muted)', marginBottom: '1.75rem' }}>
            Start automating your job hunt today.
          </p>

          <form>
            <label>
              <span className="sr-only">Full Name</span>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                required
                aria-label="Full Name"
              />
            </label>

            <label>
              <span className="sr-only">Email</span>
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                aria-label="Email"
              />
            </label>

            <label style={{ position: 'relative' }}>
              <span className="sr-only">Password</span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                required
                aria-label="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{
                  position: 'absolute',
                  right: '0.625rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 0,
                  color: 'var(--muted)',
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  padding: '0.25rem 0.5rem'
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'hide' : 'show'}
              </button>
            </label>

            <label style={{ position: 'relative' }}>
              <span className="sr-only">Confirm Password</span>
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirm"
                placeholder="Confirm Password"
                required
                aria-label="Confirm Password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                style={{
                  position: 'absolute',
                  right: '0.625rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 0,
                  color: 'var(--muted)',
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  padding: '0.25rem 0.5rem'
                }}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? 'hide' : 'show'}
              </button>
            </label>

            <button type="submit" style={{ marginTop: '0.5rem' }}>
              Sign Up
            </button>
          </form>

          <p style={{
            textAlign: 'center',
            marginTop: '1.25rem',
            fontSize: '0.875rem',
            color: 'var(--muted)'
          }}>
            Already have an account?{' '}
            <Link
              to="/signIn"
              style={{
                color: 'var(--accent)',
                textDecoration: 'none',
                fontWeight: 500
              }}
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
