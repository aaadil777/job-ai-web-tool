import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import './jobAI.css'

export default function AppliedJobs() {
  useEffect(() => { document.title = 'Applied Jobs – jobhunter.ai' }, [])

  // Placeholder for database/API fetch logic
  useEffect(() => {
    async function fetchData() {
      // TODO: Insert API/database fetch call here
    }
    fetchData()
  }, [])

  return (
    <div>
      <div>
        <a href="/" className="brand-right" aria-label="jobhunter.ai home">
          <span className="brand-dot-right" aria-hidden="true"></span>
          <span>jobhunter.ai</span>
        </a>
      </div>

      <div className="app-row">
        <nav className="sidebar">
          <ul>
            <li>
              <Link to="/" className="nav-link">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                     strokeWidth="1.5" stroke="currentColor" className="nav-icon">
                  <path strokeLinecap="round" strokeLinejoin="round"
                        d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>
                </svg>
                Home
              </Link>
            </li>
            <li><Link to="/resume_upload">Upload Resume</Link></li>
            <li><Link to="/matchedAI">AI Matched Jobs</Link></li>
            <li><Link to="/savedJobs">Saved Jobs</Link></li>
            <li><Link to="/appliedJobs">Applied Jobs</Link></li>
            <li><Link to="/profile">Profile</Link></li>
          </ul>
        </nav>

        <main className="container">
          <h1>Applied Jobs</h1>
          <p className="text-muted-foreground">Track jobs you've applied to.</p>

          <section id="appliedList" className="jobs" style={{ width: '100vw', maxWidth: '100%', display: 'grid', gap: '14px', marginTop: '18px', boxSizing: 'border-box' }}>
            <div id="appliedEmpty" style={{
              padding: '36px',
              borderRadius: '12px',
              border: '1px dashed var(--border)',
              textAlign: 'center',
              color: 'var(--muted)'
            }}>
              <p style={{ margin: '0 0 8px' }}>You haven't applied to any jobs yet.</p>
              <p style={{ margin: '0' }}>
                <Link to="/matchedAI" style={{ color: 'var(--brand)', textDecoration: 'none' }}>
                  Browse matched jobs →
                </Link>
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}