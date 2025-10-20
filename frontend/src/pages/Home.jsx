import { useEffect, useMemo, useState } from 'react'
import './Home.css'

export default function Home() {
  useEffect(() => {
    document.title = 'jobhunter.ai – web services solutions for your job hunt needs'
  }, [])

  // Mobile menu state
  const [menuOpen, setMenuOpen] = useState(false)

  // Typewriter effect
  const phrases = useMemo(() => [
    'jobhunter.ai',
    'Resume tailoring on tap',
    'Smarter role search',
    'Outreach that gets replies',
  ], [])
  const [pi, setPi] = useState(0)
  const [ci, setCi] = useState(0)
  const [del, setDel] = useState(false)

  useEffect(() => {
    const txt = phrases[pi]
    let t = setTimeout(() => {
      if (!del) {
        const next = ci + 1
        setCi(next)
        if (next === txt.length) {
          setDel(true)
        }
      } else {
        const next = ci - 1
        setCi(next)
        if (next === 0) {
          setDel(false)
          setPi((pi + 1) % phrases.length)
        }
      }
    }, del ? 45 : (ci === phrases[pi].length ? 1200 : 75))
    return () => clearTimeout(t)
  }, [ci, del, pi, phrases])

  // Back-to-top visibility
  const [showTop, setShowTop] = useState(false)
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500)
    window.addEventListener('scroll', onScroll)
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Year
  const year = useMemo(() => new Date().getFullYear(), [])

  // Smooth in-page scrolling
  const onAnchorClick = (e, targetId) => {
    const target = document.getElementById(targetId)
    if (!target) return
    e.preventDefault()
    const header = document.querySelector('.header')
    const y = target.getBoundingClientRect().top + window.pageYOffset - ((header?.offsetHeight) || 0) - 6
    window.scrollTo({ top: y, behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <div>
      {/* Header / Nav */}
      <header className="header" id="top">
        <nav className="nav" aria-label="Primary">
          <a href="#home" className="brand" aria-label="jobhunter.ai home" onClick={(e) => onAnchorClick(e, 'home')}>
            <span className="brand-dot" aria-hidden="true"></span>
            <span>jobhunter.ai</span>
          </a>

          <button
            className="hamb"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            aria-controls="nav-menu"
            onClick={() => setMenuOpen(v => !v)}
          >
            <span></span><span></span><span></span>
          </button>

          <div id="nav-menu" className={`menu ${menuOpen ? 'open' : ''}`} role="menu">
            <a role="menuitem" href="#about" onClick={(e) => onAnchorClick(e, 'about')}>About</a>
            <a role="menuitem" href="#features" onClick={(e) => onAnchorClick(e, 'features')}>Features</a>
            <a role="menuitem" href="#faq" onClick={(e) => onAnchorClick(e, 'faq')}>FAQ</a>
            <a role="menuitem" href="#contact" className="cta" onClick={(e) => onAnchorClick(e, 'contact')}>Get Started</a>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main id="home" className="hero">
        <section>
          <div className="kicker">A web services solution for your job hunt needs</div>
          <h1 className="title">
            <span className="typewriter">{phrases[pi].slice(0, ci)}</span>
          </h1>
          <p className="sub">
            Automate the busywork and focus on offers. Tailor resumes, track roles, schedule outreach, and analyze job descriptions with a fast, lightweight toolkit.
          </p>
          <div className="actions">
            <a href="#features" className="btn" onClick={(e) => onAnchorClick(e, 'features')}>Explore Features</a>
            <a href="#contact" className="btn" onClick={(e) => onAnchorClick(e, 'contact')}>Try it now</a>
          </div>

          <div className="grid">
            <div className="card">
              <strong>Resume Tailor</strong>
              <p className="a">Paste a JD and your resume; get a tailored draft with quantified bullets and hard-skill alignment.</p>
            </div>
            <div className="card">
              <strong>Search Automation</strong>
              <p className="a">Daily role fetches across boards with filters for title, level, remote, and tech stack.</p>
            </div>
            <div className="card">
              <strong>Outreach Engine</strong>
              <p className="a">Generate concise, relevant messages that reference team work, stack, and business outcomes.</p>
            </div>
          </div>
        </section>

        <aside className="card" aria-label="Demo preview">
          <strong>Quick Demo</strong>
          <p className="a">This is a static preview box. Embed your app iframe or screenshot here.</p>
          <img src="" alt="" aria-hidden="true" />
        </aside>
      </main>

      {/* About */}
      <section id="about" className="section">
        <h2>About jobhunter.ai</h2>
        <p className="lead">
          jobhunter.ai combines simple UX with powerful automations so you spend less time clicking and more time interviewing. It is designed to be fast, privacy-aware, and portable.
        </p>
      </section>

      {/* Features */}
      <section id="features" className="section">
        <h2>Core Features</h2>
        <ul className="lead" style={{ marginTop: 8 }}>
          <li>Type-safe templates for resumes and outreach</li>
          <li>Role parsers for skills and keywords</li>
          <li>Spreadsheet and ATS-friendly exports</li>
          <li>Scheduling for daily searches and reminders</li>
        </ul>
      </section>

      {/* FAQ */}
      <section id="faq" className="section">
        <h2>FAQ</h2>
        <div className="faq" role="list">
          <details>
            <summary><span className="q">How is my data handled?</span><span className="chev">›</span></summary>
            <div className="a">Your inputs are processed to produce drafts and insights. You can clear history at any time. Add your own privacy policy link here.</div>
          </details>
          <details>
            <summary><span className="q">Can I export results?</span><span className="chev">›</span></summary>
            <div className="a">Yes. Export tailored resumes, cover letters, and role lists to PDF, DOCX, or CSV.</div>
          </details>
          <details>
            <summary><span className="q">Does it work for non-tech roles?</span><span className="chev">›</span></summary>
            <div className="a">Yes. Templates adapt to operations, analytics, healthcare, and more.</div>
          </details>
          <details>
            <summary><span className="q">Is there a free plan?</span><span className="chev">›</span></summary>
            <div className="a">Add your pricing and plan details here.</div>
          </details>
        </div>
      </section>

      {/* Contact / CTA */}
      <section id="contact" className="section">
        <h2>Get Started</h2>
        <p className="lead">Drop your email, or link this button to your app signup.</p>
        <p className="actions">
          <a href="/createNewUser" className="cta">Sign up</a>
          <a className="btn" href="#top" aria-label="Back to top" onClick={(e) => onAnchorClick(e, 'top')}>Back to top</a>
        </p>
      </section>

      <footer>
        © <span>{year}</span> jobhunter.ai. Built for faster job hunts.
      </footer>

      <a
        href="#top"
        className={`top ${showTop ? 'show' : ''}`}
        id="toTop"
        aria-label="Back to top"
        onClick={(e) => onAnchorClick(e, 'top')}
      >
        ↑ Top
      </a>
    </div>
  )
}
