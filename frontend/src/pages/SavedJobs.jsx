import { useState, useEffect} from 'react'
import { Link } from 'react-router-dom'
import './jobAI.css'

export default function SavedJobs() {
  useEffect(() => { document.title = 'Saved Jobs – jobhunter.ai' }, [])

 // Placeholder for database/API fetch logic
  useEffect(() => {
      // TODO: Insert API/database fetch call here
      fetch("/mocks/savedjobs.json")
        .then((response) => response.json())
        .then((data) => setJobs(data))
  }, [])

  const [jobs, setJobs] = useState([]);
  
  const formatSalary = (val) => `$${Math.round(val / 1000)}k`

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
          <h1>Saved Jobs</h1>
          <p className="text-muted-foreground">Jobs you marked to review or apply later.</p>

          <section id="savedList" className="jobs" style={{ width: '100vw', maxWidth: '100%', display: 'grid', gap: '14px', marginTop: '18px', boxSizing: 'border-box' }}>
            {jobs.length === 0 && (
            <div id="savedEmpty" style={{
              display: 'none',
              padding: '36px',
              borderRadius: '12px',
              border: '1px dashed var(--border)',
              textAlign: 'center',
              color: 'var(--muted)'
            }}>
              <p style={{ margin: '0 0 8px' }}>No saved jobs yet.</p>
              <p style={{ margin: '0' }}>
                <Link to="/matchedAI" style={{ color: 'var(--brand)', textDecoration: 'none' }}>
                  Browse matched jobs →
                </Link>
              </p>
            </div>
            )}
          {/* Populate job cards */}
          {jobs.map((job,index) => (
          <JobCard key={index} job={job} formatSalary={formatSalary}/>
          ))}
          </section>
        </main>
      </div>
    </div>
  )
}

function JobCard({job, formatSalary}) {
  return (
  <div className="job-card">
    <div className="job-card-header">
      <h2 className="job-title">{job.title}</h2>
      <div className="company-name-and-location-and-type">{job.company} - {job.location} || {job.type}</div>
      <div className="skills">Skills: {job.skills.join(", ")}</div>
      <div className="salary-range">Salary: {formatSalary(job.salaryMin)} - {formatSalary(job.salaryMax)}</div>
      <div className='job-experience'>Experience Level: {job.experience}</div>
      <div className="job-match-score">Match Score: <strong>{job.matchScore}%</strong></div>
      <div style={{ display:'flex', gap:10, justifyContent:'flex-end', padding:'14px 20px'}}>
        <button style={{ padding:'4px 12px'}}>View</button>
        <button style={{ padding:'4px 12px'}}>Remove</button>
        <button style={{ padding:'4px 12px'}}>Apply</button>
      </div>
    </div>
  </div>
);
}