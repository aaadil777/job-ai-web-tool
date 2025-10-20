import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './jobAI.css';

export default function MatchedAI() {
  // page title
  useEffect(() => { document.title = 'AI Matched Jobs – jobhunter.ai'; }, []);

  // form state
  const [q, setQ] = useState('');
  const [locationQ, setLocationQ] = useState('');
  const [type, setType] = useState('');
  const [exp, setExp] = useState('');
  const [salaryMin, setSalaryMin] = useState(40000);
  const [salaryMax, setSalaryMax] = useState(200000);

  // data state
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // fetch mock jobs
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/mocks/jobs.json', { cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed to load mock jobs (${res.status})`);
        
        const data = await res.json();
        console.log("Fetched jobs:", data);

        if (alive) setAllJobs(Array.isArray(data) ? data : []);
      } catch (e) {
        if (alive) setError(e.message || 'Could not load jobs.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // helpers
  const norm = (s) => (s || '').toString().toLowerCase();

  // filter logic
  const filtered = useMemo(() => {
    const qNorm = norm(q);
    const locNorm = norm(locationQ);
    const typeNorm = norm(type);
    const expNorm = norm(exp);

    return allJobs.filter(j => {
      const hay = [j.title, j.company, j.location, ...(j.skills || [])]
        .join(' ')
        .toLowerCase();

      const qOk   = !qNorm   || hay.includes(qNorm);
      const locOk = !locNorm || norm(j.location).includes(locNorm);
      const typeOk= !typeNorm|| norm(j.type) === typeNorm;
      const expOk = !expNorm || norm(j.experience) === expNorm;

      const jobMin = j.salaryMin ?? 20000;

      const salOk = Number(jobMin) >= Number(salaryMin) &&
                    Number(jobMin) <= Number(salaryMax);

      return qOk && locOk && typeOk && expOk && salOk;
    });
  }, [allJobs, q, locationQ, type, exp, salaryMin, salaryMax]);

  return (
    <div className="app-row">
      {/* Sidebar */}
      <nav className="sidebar">
        <ul>
          <li><Link to="/" className="nav-link">Home</Link></li>
          <li><Link to="/resume_upload">Upload Resume</Link></li>
          <li><Link to="/matchedAI">AI Matched Jobs</Link></li>
          <li><Link to="/savedJobs">Saved Jobs</Link></li>
          <li><Link to="/appliedJobs">Applied Jobs</Link></li>
          <li><Link to="/profile">Profile</Link></li>
        </ul>
      </nav>

      {/* Main */}
      <main className="container">
        <h1>AI Matched Jobs</h1>
        <p className="text-muted-foreground">Jobs matched to your resume and preferences.</p>
        <p className="text-muted-foreground">Use filters to help narrow results.</p>

        {/* Filters (controlled) */}
        <form
          className="filters"
          onSubmit={(e) => e.preventDefault()}
          style={{
            width:'100%', maxWidth:'920px', margin:'18px 0',
            display:'flex', gap:'12px', flexWrap:'wrap',
            justifyContent:'center', alignItems:'center'
          }}
        >
          <input
            type="search"
            name="q"
            placeholder="Search job title, company or skill"
            className="filter-input"
            style={{ flex: 1, minWidth: '220px' }}
            value={q}
            onChange={(e)=>setQ(e.target.value)}
          />

          <input
            type="search"
            name="location"
            id="locationSearch"
            className="filter-input"
            placeholder="Location (city, zip or Remote)"
            list="location-list"
            style={{ minWidth: '180px' }}
            value={locationQ}
            onChange={(e)=>setLocationQ(e.target.value)}
          />
          <datalist id="location-list">
            <option value="Remote" />
            <option value="San Francisco, CA" />
            <option value="New York, NY" />
            <option value="Austin, TX" />
          </datalist>

          <select
            name="type"
            className="filter-input"
            style={{ minWidth:'150px' }}
            value={type}
            onChange={(e)=>setType(e.target.value)}
          >
            <option value="">Any type</option>
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
            <option>Remote</option>
            <option>Hybrid</option>
            <option>Internship</option>
          </select>

          <select
            name="exp"
            className="filter-input"
            style={{ minWidth:'140px' }}
            value={exp}
            onChange={(e)=>setExp(e.target.value)}
          >
            <option value="">Experience</option>
            <option>Entry</option>
            <option>Mid</option>
            <option>Senior</option>
          </select>

        {/* Salary range sliders */}
        <div className="range-group" style={{ width:'100%', maxWidth:'420px', display:'flex', flexDirection:'column', gap:'12px', marginTop:'6px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px' }}>
            <label style={{ margin:0, fontSize:'14px', color:'var(--muted)', fontWeight:500 }}>Salary Range</label>
            <div style={{ fontSize:'13px', color:'var(--muted)', fontWeight:500 }}>
              {`$${Math.round(salaryMin/1000)}k`} – {`$${Math.round(salaryMax/1000)}k`}
            </div>
          </div>

          {/* Min slider row */}
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <label htmlFor="salaryMin" style={{ fontSize:'12px', color:'var(--muted)', minWidth:'30px' }}>Min</label>
            <input
              type="range"
              id="salaryMin"
              name="salaryMin"
              min="20000"
              max="300000"
              step="5000"
              value={salaryMin}
              onChange={(e)=>{
                const v = Number(e.target.value);
                setSalaryMin(Math.min(v, salaryMax));
              }}
              className="range-input"
              aria-label="Minimum salary"
              style={{ width:'100%' }}
            />
            <span style={{ fontSize:'12px', color:'var(--muted)', minWidth:'50px', textAlign:'right' }}>
              {`$${Math.round(salaryMin/1000)}k`}
            </span>
          </div>

          {/* Max slider row */}
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <label htmlFor="salaryMax" style={{ fontSize:'12px', color:'var(--muted)', minWidth:'30px' }}>Max</label>
            <input
              type="range"
              id="salaryMax"
              name="salaryMax"
              min="20000"
              max="300000"
              step="5000"
              value={salaryMax}
              onChange={(e)=>{
                const v = Number(e.target.value);
                setSalaryMax(Math.max(v, salaryMin));
              }}
              className="range-input"
              aria-label="Maximum salary"
              style={{ width:'100%' }}
            />
            <span style={{ fontSize:'12px', color:'var(--muted)', minWidth:'50px', textAlign:'right' }}>
              {`$${Math.round(salaryMax/1000)}k`}
            </span>
          </div>
        </div>


          <button type="submit" style={{ padding:'10px 14px', borderRadius:'10px', background:'var(--brand)', border:0, color:'#07120c', fontWeight:600, minWidth:'96px' }}>
            Apply Filters
          </button>
        </form>

        {/* Results */}
        <section id="jobsList" className="jobs" style={{ width:'100%', maxWidth:'820px', display:'grid', gap:'14px', marginTop:'8px' }}>
          {loading && <p className="text-muted-foreground">Loading jobs…</p>}
          {error && <p className="text-muted-foreground">Error: {error}</p>}
          {!loading && !error && filtered.length === 0 && (
            <p className="text-muted-foreground">No matches found. Try broadening filters.</p>
          )}
          {!loading && !error && filtered.map(job => (
            <JobCard key={job.id || job.title} job={job} />
          ))}
        </section>
      </main>
    </div>
  );
}

function JobCard({ job }) {
  const initials = (job.title || 'NA').split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase();
  const skills = (job.skills || []).join(' · ');
  return (
    <article data-slot="card" aria-label={`Job: ${job.title || ''}`}>
      <div style={{ display:'flex', alignItems:'center', gap:'14px', padding:'18px 20px' }}>
        <div style={{ width:56, height:56, borderRadius:10, background:'rgba(255,255,255,0.04)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'var(--muted)' }}>
          {initials}
        </div>
        <div style={{ flex:1, textAlign:'left' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px' }}>
            <div>
              <div style={{ fontWeight:700 }}>{job.title}</div>
              <div className="text-muted-foreground" style={{ fontSize:13, marginTop:4 }}>
                {job.company} — {job.location} • {job.type || '—'}
              </div>
            </div>
            <div style={{ textAlign:'right', color:'var(--muted)', fontSize:13 }}>
              Matches: <strong style={{ color:'var(--brand)' }}>{job.matchScore ?? '—'}%</strong>
            </div>
          </div>
          {skills && (
            <div className="text-muted-foreground" style={{ marginTop:10, fontSize:13 }}>
              Key skills: {skills}
            </div>
          )}
        </div>
      </div>
      <div style={{ display:'flex', gap:10, alignItems:'center', justifyContent:'flex-end', padding:'14px 20px', borderTop:'1px solid var(--border)', background:'transparent' }}>
        <a href="#" style={{ padding:'8px 12px', borderRadius:8, border:'1px solid var(--border)', background:'transparent', color:'var(--ink)' }}>View</a>
        <button style={{ padding:'8px 12px', borderRadius:8, background:'var(--brand)', border:0, color:'#07120c', fontWeight:600 }}>Apply</button>
      </div>
    </article>
  );
}
