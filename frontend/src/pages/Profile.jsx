import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './jobAI.css'

export default function Profile() {
  useEffect(() => { document.title = 'Profile – jobhunter.ai' }, [])

  // Placeholder for database/API fetch logic
  useEffect(() => {
    async function fetchData() {
      // TODO: Insert API/database fetch call here
    }
    fetchData()
  }, [])

  const [editing, setEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '—',
    role: '—',
    email: '—',
    location: '—',
    phone: '—'
  })

  const handleEditToggle = () => {
    setEditing(!editing)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    setProfileData({
      name: formData.get('name') || '—',
      role: formData.get('role') || '—',
      email: formData.get('email') || '—',
      location: formData.get('location') || '—',
      phone: formData.get('phone') || '—'
    })
    setEditing(false)
  }

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
          <div data-slot="card" className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border" style={{ width: '100vw', maxWidth: '100%', boxSizing: 'border-box' }}>
            <div data-slot="card-header" className="px-6 pt-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4" style={{ width: '80px', height: '80px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>

              <h4 data-slot="card-title" className="leading-none" id="profileName">{profileData.name}</h4>
              <p data-slot="card-description" className="text-muted-foreground" id="profileRole">{profileData.role}</p>
            </div>

            <div data-slot="card-content" className="px-6 pb-6 space-y-4" style={{ width: '100%', maxWidth: '680px', margin: '0 auto' }}>
              <section aria-labelledby="personal-info">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                  <h5 id="personal-info" style={{ margin: 0, fontWeight: 700 }}>Personal information</h5>
                  <div>
                    <button id="editProfileBtn" onClick={handleEditToggle} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink)' }}>
                      {editing ? 'Cancel' : 'Edit'}
                    </button>
                  </div>
                </div>

                {!editing && (
                  <div id="profileView" style={{ marginTop: '12px', display: 'grid', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'left', minWidth: '160px', flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>Email</div>
                        <div className="text-muted-foreground" id="profileEmail">{profileData.email}</div>
                      </div>
                      <div style={{ textAlign: 'left', minWidth: '160px', flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>Location</div>
                        <div className="text-muted-foreground" id="profileLocation">{profileData.location}</div>
                      </div>
                      <div style={{ textAlign: 'left', minWidth: '160px', flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>Phone</div>
                        <div className="text-muted-foreground" id="profilePhone">{profileData.phone}</div>
                      </div>
                    </div>
                  </div>
                )}

                {editing && (
                  <form id="profileEdit" onSubmit={handleSubmit} style={{ marginTop: '12px', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <input name="name" placeholder="Full name" defaultValue={profileData.name === '—' ? '' : profileData.name} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink)' }} />
                      <input name="role" placeholder="Role / Title" defaultValue={profileData.role === '—' ? '' : profileData.role} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink)' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                      <input name="email" placeholder="Email" defaultValue={profileData.email === '—' ? '' : profileData.email} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink)' }} />
                      <input name="location" placeholder="Location" defaultValue={profileData.location === '—' ? '' : profileData.location} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink)' }} />
                      <input name="phone" placeholder="Phone" defaultValue={profileData.phone === '—' ? '' : profileData.phone} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink)' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
                      <button type="button" id="cancelEdit" onClick={() => setEditing(false)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink)' }}>Cancel</button>
                      <button type="submit" style={{ padding: '8px 12px', borderRadius: '8px', background: 'var(--brand)', border: 0, color: '#07120c', fontWeight: 600 }}>Save</button>
                    </div>
                  </form>
                )}
              </section>

              <section aria-labelledby="resumes" style={{ marginTop: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h5 id="resumes" style={{ margin: 0, fontWeight: 700 }}>Resumes</h5>
                </div>

                <ul id="resumeList" style={{ listStyle: 'none', padding: 0, margin: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* populated dynamically */}
                </ul>
              </section>

              <section aria-labelledby="preferences" style={{ marginTop: '6px' }}>
                <h5 id="preferences" style={{ margin: '0 0 8px 0', fontWeight: 700 }}>Job preferences</h5>
                <form id="prefsForm" style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <input name="pref_location" placeholder="Preferred locations (comma separated)" style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink)' }} />
                    <select name="pref_type" style={{ minWidth: '160px', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink)' }}>
                      <option value="">Any type</option>
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Contract</option>
                      <option>Remote</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <label style={{ margin: 0, fontSize: '14px', color: 'var(--muted)', minWidth: '120px' }}>Desired salary</label>
                    <input name="pref_salary" placeholder="$80,000" style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink)' }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                    <button type="submit" style={{ padding: '8px 12px', borderRadius: '8px', background: 'var(--brand)', border: 0, color: '#07120c', fontWeight: 600 }}>Save preferences</button>
                  </div>
                </form>
              </section>

              <section style={{ marginTop: '6px' }}>
                <h5 style={{ margin: '0 0 8px 0', fontWeight: 700 }}>Security</h5>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <a href="#" id="changePassword" style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink)' }}>Change password</a>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
