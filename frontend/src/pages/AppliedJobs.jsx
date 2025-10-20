import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './jobAI.css'

export default function AppliedJobs() {
  const [applied, setApplied] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { document.title = 'Applied Jobs – jobhunter.ai' }, [])

  useEffect(() => {
    async function fetchAppliedJobs() {
      try {
        const res = await fetch('/mocks/appliedjobs.json')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const rows = await res.json()
        setApplied(rows || [])
      } catch (e) {
        console.error('Failed to load /mocks/appliedjobs.json', e)
        setError('Could not load applied jobs.')
      } finally {
        setLoading(false)
      }
    }
    fetchAppliedJobs()
  }, [])

  const gridStyle = useMemo(() => ({
    width: '100vw',
    maxWidth: '100%',
    display: 'grid',
    gap: '14px',
    marginTop: '18px',
    boxSizing: 'border-box',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))'
  }), [])

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

          {loading ? (
            <div className="jobs" style={gridStyle} aria-busy>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="job-card skeleton" aria-hidden="true" />
              ))}
            </div>
          ) : (
            <section id="appliedList" className="jobs" style={gridStyle}>
              {error && (
                <div style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--muted-bg)', color: 'var(--foreground)', gridColumn: '1 / -1' }}>
                  {error}
                </div>
              )}

              {(!error && applied.length === 0) ? (
                <div id="appliedEmpty" style={{ padding: '36px', borderRadius: '12px', border: '1px dashed var(--border)', textAlign: 'center', color: 'var(--muted)', gridColumn: '1 / -1' }}>
                  <p style={{ margin: '0 0 8px' }}>You haven't applied to any jobs yet.</p>
                  <p style={{ margin: 0 }}>
                    <Link to="/matchedAI" style={{ color: 'var(--brand)', textDecoration: 'none' }}>
                      Browse matched jobs →
                    </Link>
                  </p>
                </div>
              ) : (
                applied.map(job => <JobCard key={job.id} job={job} applied />)
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

function JobCard({ job }) {
  const navigate = useNavigate()
  const { id, title, company, location, type, experience, matchScore, skills = [] } = job

  const initials = (company || '')
    .split(/\s+/)
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '•'

  return (
    <article className="job-card" data-jobid={id}>
      <header className="job-card-head">
        <div className="job-title-wrap">
          <h3 className="job-title">{title}</h3>
          <div className="job-sub">
            <span className="company">{company}</span>
            {location && <span className="dash"> — </span>}
            {location && <span className="location">{location}</span>}
            {type && <><span className="dot"> • </span><span className="type">{type}</span></>}
          </div>
          {skills?.length > 0 && (
            <div className="job-skills">
              <span className="muted">Key skills:</span>{' '}
              {skills.join(' · ')}
            </div>
          )}
        </div>

        {typeof matchScore === 'number' && (
          <div className="match-score">
            <span>Matches: </span>
            <strong>{matchScore}%</strong>
          </div>
        )}
      </header>

      <div className="job-divider" />

      <footer className="job-card-foot">
        <div className="job-actions">
          <button className="btn btn-ghost" style={{ padding:'8px 12px', borderRadius:8, border:'1px solid var(--border)', background:'transparent', color:'var(--ink)' }}>View</button>
          <button className="btn btn-primary" style={{ padding:'8px 12px', borderRadius:8, background:'var(--brand)', border:0, color:'#07120c', fontWeight:600 }} onClick={() => navigate(`/apply/${id || ''}`)}>
            Applied
          </button>
        </div>
      </footer>
    </article>
  )
}