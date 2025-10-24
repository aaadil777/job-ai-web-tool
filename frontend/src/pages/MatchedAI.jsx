import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import './jobAI.css'

export default function MatchedAI() {

  useEffect(() => { document.title = 'AI Matched Jobs – jobhunter.ai' }, [])

  // Placeholder for database/API fetch logic
  useEffect(() => {
      // TODO: Insert API/database fetch call here
      fetch("/mocks/jobs.json")
        .then((response) => response.json())
        .then((data) => setJobs(data))
  }, [])

  const [jobs, setJobs] = useState([]);
  const [type, setType] = useState("");
  const [experience, setExp] = useState("");
  const [location, setLoc] = useState("");

  const [salaryMin, setSalaryMin] = useState(30000)
  const [salaryMax, setSalaryMax] = useState(200000)

  const formatSalary = (val) => `$${Math.round(val / 1000)}k`

  const handleSalaryMinChange = (e) => {
    const newMin = parseInt(e.target.value)
    if (newMin <= salaryMax) {
      setSalaryMin(newMin)
    }
  }

  const handleSalaryMaxChange = (e) => {
    const newMax = parseInt(e.target.value)
    if (newMax >= salaryMin) {
      setSalaryMax(newMax)
    }
  }

  const filterJobs = useMemo(() => {
    return jobs.filter(j => {
      const jMin = j.salaryMin;
      const jMax = j.salaryMax;

      const passType = !type || j.type === type;
      const passSalary = jMax >= salaryMin && jMin <= salaryMax;
      const passExp = !experience || j.experience === experience;
      const passLoc = !location || j.location === location;

      return passType && passSalary && passExp && passLoc;
    });
    }, [jobs, type, experience, salaryMin, salaryMax, location]);

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
              value={location}
              onChange={(e) => setLoc(e.target.value)}
            />
            <datalist id="location-list">
              <option value="Remote" />
              <option value="San Francisco, CA" />
              <option value="New York, NY" />
              <option value="Austin, TX" />
            </datalist>

            <select name="type" className="filter-input" style={{ minWidth: '150px' }} value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Any type</option>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Remote</option>
              <option>Hybrid</option>
              <option>Internship</option>
            </select>

            <select name="exp" className="filter-input" style={{ minWidth: '140px' }} value={experience} onChange={(e) => setExp(e.target.value)}>
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
              gap: '12px',
              marginTop: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <label style={{ margin: 0, fontSize: '14px', color: 'var(--muted)', fontWeight: 500 }}>Salary Range</label>
                <div style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>
                  <span id="salaryLabel">{formatSalary(salaryMin)} - {formatSalary(salaryMax)}</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label htmlFor="salaryMin" style={{ fontSize: '12px', color: 'var(--muted)', minWidth: '30px' }}>Min</label>
                  <input
                    type="range"
                    id="salaryMin"
                    name="salaryMin"
                    min="10000"
                    max="700000"
                    step="5000"
                    value={salaryMin}
                    onChange={handleSalaryMinChange}
                    className="range-input"
                    aria-label="Minimum salary"
                    style={{
                      width: '100%'
                    }}
                  />
                  <span style={{ fontSize: '12px', color: 'var(--muted)', minWidth: '50px', textAlign: 'right' }}>
                    {formatSalary(salaryMin)}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label htmlFor="salaryMax" style={{ fontSize: '12px', color: 'var(--muted)', minWidth: '30px' }}>Max</label>
                  <input
                    type="range"
                    id="salaryMax"
                    name="salaryMax"
                    min="10000"
                    max="700000"
                    step="5000"
                    value={salaryMax}
                    onChange={handleSalaryMaxChange}
                    className="range-input"
                    aria-label="Maximum salary"
                    style={{
                      width: '100%'
                    }}
                  />
                  <span style={{ fontSize: '12px', color: 'var(--muted)', minWidth: '50px', textAlign: 'right' }}>
                    {formatSalary(salaryMax)}
                  </span>
                </div>
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
          }}>
          {/* Populate job cards */}
          {filterJobs.map((job,index) => (
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
        <button style={{ padding:'4px 12px'}}>Save</button>
        <button style={{ padding:'4px 12px'}}>Apply</button>
      </div>
    </div>
  </div>
);
}