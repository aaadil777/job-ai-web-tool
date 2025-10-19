import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './jobAI.css'

export default function MatchedAI() {
  useEffect(() => { document.title = 'AI Matched Jobs – jobhunter.ai' }, [])

  // Placeholder for database/API fetch logic
  useEffect(() => {
    async function fetchData() {
      // TODO: Insert API/database fetch call here
    }
    fetchData()
  }, [])

  const [salaryMin, setSalaryMin] = useState(40000)

  const formatSalary = (val) => `$${Math.round(val / 1000)}k`

  const handleSalaryChange = (e) => {
    setSalaryMin(parseInt(e.target.value))
  }

  // Calculate fill percentage for visual track
  const fillPercent = ((salaryMin - 20000) / (300000 - 20000)) * 100

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
          <h1>AI Matched Jobs</h1>
          <p className="text-muted-foreground">Jobs matched to your resume and preferences.</p>
          <p className="text-muted-foreground">Use filters to help narrow results.</p>

          <form id="filtersForm" className="filters" style={{
            width: '100vw',
            maxWidth: '100%',
            margin: '18px 0',
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            boxSizing: 'border-box'
          }}>
            <input
              type="search"
              name="q"
              placeholder="Search job title, company or skill"
              className="filter-input"
              style={{ flex: 1, minWidth: '220px' }}
            />

            <input
              type="search"
              name="location"
              id="locationSearch"
              className="filter-input"
              placeholder="Location (city, zip or Remote)"
              list="location-list"
              style={{ minWidth: '180px' }}
            />
            <datalist id="location-list">
              <option value="Remote" />
              <option value="San Francisco, CA" />
              <option value="New York, NY" />
              <option value="Austin, TX" />
            </datalist>

            <select name="type" className="filter-input" style={{ minWidth: '150px' }}>
              <option value="">Any type</option>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Remote</option>
              <option>Hybrid</option>
              <option>Internship</option>
            </select>

            <select name="exp" className="filter-input" style={{ minWidth: '140px' }}>
              <option value="">Experience</option>
              <option>Entry</option>
              <option>Mid</option>
              <option>Senior</option>
            </select>

            <div className="range-group" style={{
              width: '100%',
              maxWidth: '420px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginTop: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <label style={{ margin: 0, fontSize: '14px', color: 'var(--muted)' }}>Minimum salary</label>
                <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                  <span id="salaryLabel">{formatSalary(salaryMin)}+</span>
                </div>
              </div>
              <div className="slider-wrap" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="range"
                  id="salaryMin"
                  name="salaryMin"
                  min="20000"
                  max="300000"
                  step="5000"
                  value={salaryMin}
                  onChange={handleSalaryChange}
                  className="range-input"
                  aria-label="Minimum salary"
                  style={{
                    width: '100%'
                  }}
                />
              </div>
            </div>

            <button type="submit" style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'var(--brand)',
              border: 0,
              color: '#07120c',
              fontWeight: 600,
              minWidth: '96px'
            }}>
              Apply Filters
            </button>
          </form>

          <section id="jobsList" className="jobs" style={{
            width: '100%',
            maxWidth: '820px',
            display: 'grid',
            gap: '14px',
            marginTop: '8px'
          }}></section>
        </main>
      </div>
    </div>
  )
}
