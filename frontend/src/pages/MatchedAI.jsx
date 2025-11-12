import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import './jobAI.css'
import { searchJobs, getRecommendations, generateCoverLetter } from '../api/api'

export default function MatchedAI() {
  useEffect(() => { document.title = 'AI Matched Jobs – jobhunter.ai' }, [])

  const [jobs, setJobs] = useState([])
  const [type, setType] = useState("")
  const [experience, setExp] = useState("")
  const [location, setLoc] = useState("")
  const [searchQuery, setSearchQuery] = useState('data analyst')

  const [salaryMin, setSalaryMin] = useState(30000)
  const [salaryMax, setSalaryMax] = useState(200000)
  const [page, setPage] = useState(1)
  const [resultsPerPage, setResultsPerPage] = useState(10)
  const [totalResults, setTotalResults] = useState(0)
  const [coverModalOpen, setCoverModalOpen] = useState(false)
  const [coverModalLoading, setCoverModalLoading] = useState(false)
  const [coverModalError, setCoverModalError] = useState('')
  const [coverModalContent, setCoverModalContent] = useState('')
  const [coverModalBullets, setCoverModalBullets] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)

  const formatSalary = (val) => `$${Math.round((val || 0) / 1000)}k`

  const handleSalaryMinChange = (e) => {
    const newMin = parseInt(e.target.value || 0)
    if (newMin <= salaryMax) setSalaryMin(newMin)
  }
  const handleSalaryMaxChange = (e) => {
    const newMax = parseInt(e.target.value || 0)
    if (newMax >= salaryMin) setSalaryMax(newMax)
  }

  const normalizeExperience = (expLevel) => {
    if (!expLevel) return ''
    const s = String(expLevel).toLowerCase()
    if (s.includes('entry')) return 'Entry'
    if (s.includes('mid')) return 'Mid'
    if (s.includes('senior')) return 'Senior'
    return expLevel
  }

  const fetchJobs = useCallback(async (opts = {}) => {
    const payload = {
      query: opts.query ?? searchQuery ?? 'data analyst',
      location: opts.location ?? location ?? '',
      page: opts.page ?? page,
      resultsPerPage: opts.resultsPerPage ?? resultsPerPage,
      salaryMin: opts.salaryMin ?? salaryMin,
      salaryMax: opts.salaryMax ?? salaryMax,
      type: opts.type ?? type,
      experience: opts.experience ?? (experience || ''),
    }

    try {
      const data = await searchJobs(payload)

      const mapped = (data.results || []).map((j) => ({
        ...j,
        experience: normalizeExperience(j.experience),
        skills: Array.isArray(j.skills) ? j.skills : (j.skills || []),
        salaryMin: j.salaryMin || 0,
        salaryMax: j.salaryMax || 0,
      }))

      setJobs(mapped)

      if (data) {
        setPage(Number(data.page || 1))
        setResultsPerPage(Number(data.resultsPerPage || resultsPerPage))
        setTotalResults(Number(data.totalResults || 0))
      }

      const rid = parseInt(localStorage.getItem('resume_id') || '', 10)
      if (rid && mapped.length) {
        try {
          const rec = await getRecommendations(rid, mapped.map((m) => m.job_id))
          if (rec && Array.isArray(rec.results)) {
            const scoresById = {}
            rec.results.forEach((r) => { scoresById[r.job_id] = r })
            const merged = mapped.map((m) => ({ ...m, ...(scoresById[m.job_id] || {}) }))
            setJobs(merged)
          }
        } catch (err) {
          console.warn('Recommend call failed', err)
        }
      }

    } catch (err) {
      console.error('Failed to fetch jobs', err)
      setJobs([])
    }
  }, [searchQuery, location, salaryMin, salaryMax, type, experience, page, resultsPerPage])

  useEffect(() => { fetchJobs({ query: searchQuery, page, resultsPerPage }) }, [fetchJobs, page, resultsPerPage, searchQuery])

  // Generate cover letter for a selected job and show modal
  const handleGenerateCoverLetter = async (job) => {
    setSelectedJob(job)
    setCoverModalError('')
    setCoverModalContent('')
    setCoverModalBullets([])
    setCoverModalOpen(true)
    setCoverModalLoading(true)

    try {
      const resumeId = Number(localStorage.getItem('resume_id') || 0) || undefined
      const payload = { resume_id: resumeId, job_id: job.job_id, job }
      const data = await generateCoverLetter(payload)
      setCoverModalContent(data.cover_letter || data.coverLetter || '')
      setCoverModalBullets(Array.isArray(data.resume_bullets) ? data.resume_bullets : (data.resumeBullets || []))
    } catch (err) {
      console.error('generateCoverLetter failed', err)
      setCoverModalError(String(err?.message || err || 'Failed to generate cover letter'))
    } finally {
      setCoverModalLoading(false)
    }
  }

  const filterJobs = useMemo(() => {
    return jobs.filter((j) => {
      const jMin = j.salaryMin || 0
      const jMax = j.salaryMax || 0

      const jobTypeStr = String(j.type || '')
      const passType = !type || jobTypeStr === '' || jobTypeStr.toLowerCase().includes(type.toLowerCase())

      const passSalary = (jMax >= salaryMin) && (jMin <= salaryMax)

      const jobExp = String(j.experience || '')
      const passExp = !experience || jobExp.toLowerCase() === experience.toLowerCase() || jobExp.toLowerCase() === 'unknown' || jobExp === ''

      const passLoc = !location || (j.location || '').toLowerCase().includes(location.toLowerCase())

      return passType && passSalary && passExp && passLoc
    })
  }, [jobs, type, experience, salaryMin, salaryMax, location])

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
                        d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75
v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>
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

          <form id="filtersForm" className="filters" onSubmit={(e) => { e.preventDefault(); setPage(1); fetchJobs({ query: searchQuery, page: 1 }); }} style={{
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
            <select value={resultsPerPage} onChange={(e) => { const v = Number(e.target.value); setResultsPerPage(v); setPage(1); fetchJobs({ page:1, resultsPerPage: v }) }} className="filter-input" style={{ minWidth: '110px' }}>
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={30}>30 / page</option>
            </select>
          </form>

          <section id="jobsList" className="jobs" style={{
            width: '100%',
            maxWidth: '820px',
            display: 'grid',
            gap: '14px',
            marginTop: '8px'
          }}>
            {filterJobs.map((job,index) => (
              <JobCard key={job.job_id || index} job={job} formatSalary={formatSalary} onGenerateCover={() => handleGenerateCoverLetter(job)} />
            ))}
          </section>

          {/* Pagination footer: show server total and filtered count when client-side filters are active */}
          {(() => {
            const filteredCount = filterJobs.length || 0
            const clientFilterActive = Boolean(type || experience || location || salaryMin !== 30000 || salaryMax !== 200000)
            const pagesFromServer = totalResults ? Math.max(1, Math.ceil((totalResults || 0) / resultsPerPage)) : Math.max(1, Math.ceil((jobs.length || 0) / resultsPerPage))
            const pagesFromFiltered = Math.max(1, Math.ceil(filteredCount / resultsPerPage))
            const totalPages = clientFilterActive ? pagesFromFiltered : pagesFromServer

            const prevDisabled = page <= 1
            const nextDisabled = clientFilterActive ? (page >= totalPages) : (totalResults ? (page * resultsPerPage) >= totalResults : ((jobs.length || 0) < resultsPerPage))

            return (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 12 }}>
                <button onClick={() => { if (!prevDisabled) { const np = page - 1; setPage(np); fetchJobs({ page: np }); } }} disabled={prevDisabled}>Prev</button>
                <div style={{ fontSize: 14, color: 'var(--muted)' }}>
                  Page {page} of {totalPages}
                  {clientFilterActive ? ` — showing ${filteredCount} result${filteredCount === 1 ? '' : 's'} (server total: ${totalResults || 0})` : (totalResults ? ` — ${totalResults} total results` : '')}
                </div>
                <button onClick={() => { if (!nextDisabled) { const np = page + 1; setPage(np); fetchJobs({ page: np }); } }} disabled={nextDisabled}>Next</button>
              </div>
            )
          })()}
    {/* Cover letter modal */}
            {coverModalOpen ? (
              <div role="dialog" aria-modal="true" className="cover-modal-overlay" style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
              }} onClick={() => { if (!coverModalLoading) setCoverModalOpen(false) }}>
                <div className="cover-modal" style={{ background: '#fff', color: '#0b0b0b', maxWidth: 800, width: '95%', maxHeight: '90vh', overflow: 'auto', borderRadius: 8, padding: 18 }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <h3 style={{ margin: 0 }}>Cover Letter Preview</h3>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => { navigator.clipboard?.writeText(coverModalContent || '') }} disabled={!coverModalContent}>Copy</button>
                      <button onClick={() => { if (!coverModalLoading) setCoverModalOpen(false) }}>Close</button>
                    </div>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    {coverModalLoading ? (
                      <div style={{ padding: 24 }}>Generating cover letter…</div>
                    ) : coverModalError ? (
                      <div style={{ color: 'crimson' }}>Error: {coverModalError}</div>
                    ) : (
                      <>
                        {coverModalContent ? (
                          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{coverModalContent}</div>
                        ) : null}

                        {coverModalBullets && coverModalBullets.length ? (
                          <div style={{ marginTop: 16 }}>
                            <h4>Suggested resume bullets</h4>
                            <ul>
                              {coverModalBullets.map((b, i) => <li key={i}>{b}</li>)}
                            </ul>
                          </div>
                        ) : null}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

          </main>
        </div>
      </div>
  )
}

function JobCard({job, formatSalary, onGenerateCover}) {
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
            <div><strong>{job.score ?? job.matchScore ?? 0}%</strong></div>
          </div>
        </div>
      </div>

  <div data-slot="card-content">
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end', paddingTop:6}}>
          <a href={job.url || '#'}><button>View</button></a>
          <button>Save</button>
          <button>Apply</button>
          <button onClick={() => onGenerateCover && onGenerateCover()}>Cover Letter</button>
        </div>
      </div>
    </div>
  )
}
