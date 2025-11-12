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
    <div data-slot="card" className="bg-card text-card-foreground border" style={{padding: '12px 16px'}}>
      <div data-slot="card-header" style={{textAlign: 'left'}}>
        <div style={{display:'flex', justifyContent:'space-between', gap:12, alignItems:'flex-start'}}>
          <div style={{minWidth:0}}>
            <h4 data-slot="card-title" style={{margin:0}}>{job.title}</h4>
            <p data-slot="card-description">{job.company} · {job.location} {job.type ? `• ${job.type}` : ''}</p>

            <div className="text-muted-foreground" style={{marginTop:6}}>
              <div className="skills">Skills: {Array.isArray(job.skills) ? job.skills.join(', ') : (job.skills || '')}</div>
              <div className="salary-range">Salary: {formatSalary(job.salaryMin)} - {formatSalary(job.salaryMax)}</div>
              <div className='job-experience'>Experience: {job.experience}</div>
            </div>
          </div>

          <div style={{textAlign:'right', minWidth:72}}>
            <div className="text-muted-foreground" style={{marginBottom:6}}>Match</div>
            <div><strong>{job.matchScore ?? 0}%</strong></div>
          </div>
        </div>
      </div>

      <div data-slot="card-content">
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end', paddingTop:6}}>
          <a href={job.url || '#'}><button>View</button></a>
          <button>Remove</button>
          <button>Apply</button>
        </div>
      </div>
    </div>
  );
}