import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './jobAI.css'

export default function SignIn() {
  useEffect(() => { document.title = 'Sign In – jobhunter.ai' }, [])

  // Placeholder for database/API fetch logic
  useEffect(() => {
    async function fetchData() {
      // TODO: Insert API/database fetch call here
    }
    fetchData()
  }, [])

  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Add authentication logic here
    navigate('/resume_upload')
  }

  return (
    <div>
      <a href="/" className="brand brand-right" aria-label="jobhunter.ai">
        <span className="brand-dot" aria-hidden="true"></span>
        <span>jobhunter.ai</span>
      </a>

      <div className="auth-wrap" style={{ marginTop: '110px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100vw', boxSizing: 'border-box' }}>
        <div data-slot="card" style={{
          maxWidth: '640px',
          width: '90%',
          padding: '2.5rem 3rem',
          boxSizing: 'border-box'
        }}>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>Sign In</h1>
          <p style={{ color: 'var(--muted)', marginBottom: '1.75rem' }}>
            Welcome back. Continue your job hunt.
          </p>

          <form onSubmit={handleSubmit}>
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

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: '1rem'
            }}>
              <a
                href="#forgot"
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--muted)',
                  textDecoration: 'none'
                }}
              >
                Forgot password?
              </a>
            </div>

            <button type="submit" style={{ marginTop: '0.5rem' }}>
              Sign In
            </button>
          </form>

          <p style={{
            textAlign: 'center',
            marginTop: '1.25rem',
            fontSize: '0.875rem',
            color: 'var(--muted)'
          }}>
            Don't have an account?{' '}
            <Link
              to="/createNewUser"
              style={{
                color: 'var(--accent)',
                textDecoration: 'none',
                fontWeight: 500
              }}
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
