import { useEffect } from 'react'
import './jobAI.css'

export default function ResumeUpload() {
  useEffect(() => { document.title = 'Resume Upload – jobhunter.ai' }, [])

  // Placeholder for database/API fetch logic
  useEffect(() => {
    async function fetchData() {
      // TODO: Insert API/database fetch call here
    }
    fetchData()
  }, [])
  
  return (
    <div>
      {/* Top-right brand */}
      <div>
        <a href="/" className="brand-right" aria-label="jobhunter.ai home">
          <span className="brand-dot-right" aria-hidden="true"></span>
          <span>jobhunter.ai</span>
        </a>
      </div>
      
      {/* Sidebar */}
      <div className="app-row">
        <nav className="sidebar">
          <ul>
            <li>
              <a href="/" className="nav-link">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                     strokeWidth="1.5" stroke="currentColor" className="nav-icon">
                  <path strokeLinecap="round" strokeLinejoin="round"
                        d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>
                </svg>
                Home
              </a>
            </li>
            <li><a href="/resume_upload">Upload Resume</a></li>
            <li><a href="/matchedAI">AI Matched Jobs</a></li>
            <li><a href="/savedJobs">Saved Jobs</a></li>
            <li><a href="/appliedJobs">Applied Jobs</a></li>
            <li><a href="/profile">Profile</a></li>
          </ul>
        </nav>
        
        {/* Main Content */}
  <main className="container" style={{ width: '100vw', maxWidth: '100%', boxSizing: 'border-box' }}>
          <h1 className="page-title">Upload Your Resume</h1>
          <p className="text-muted-foreground">Let AI help you match with jobs</p>

          <div data-slot="card" className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border"> 
            <div data-slot="card-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', paddingTop: '24px', paddingBottom: '12px' }}>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-upload w-8 h-8 text-primary">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" x2="12" y1="3" y2="15"></line>
                </svg>
              </div>
              <h4 data-slot="card-title" className="leading-none" style={{ margin: 0 }}>Upload Your Resume</h4>
              <p data-slot="card-description" className="text-muted-foreground" style={{ margin: 0 }}>We'll check your resume and give you tips to make it better</p>
            </div>
            <div data-slot="card-content" className="px-6 [&:last-child]:pb-6 space-y-4" style={{ paddingBottom: '64px' }}>
              <div className="border-dashed">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text w-12 h-12 text-muted-foreground mx-auto mb-4">
                  <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                  <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                  <path d="M10 9H8"></path>
                  <path d="M16 13H8"></path>
                  <path d="M16 17H8"></path>
                </svg>
                <p className="mb-4">Drop your resume here or click below</p>
                <label htmlFor="fileUpload" style={{ padding: '10px 24px', borderRadius: '8px', background: 'var(--brand)', color: '#07120c', fontWeight: 600, cursor: 'pointer', display: 'inline-block' }}>Choose File</label>
                <input id="fileUpload" type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} />
                <p className="text-sm text-muted-foreground mt-4">PDF or Word document</p>
              </div>
            </div>
          </div>
          
          {/* Removed 'Go back Home' option as requested */}
        </main>
      </div>
    </div>
  )
}
