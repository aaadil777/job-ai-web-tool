// src/api/api.js

// Use Vite-provided env or sensible defaults. Prefer VITE_API_BASE when set.
const API_BASE =
  import.meta.env.VITE_API_BASE || (import.meta.env.PROD ? "https://api.yourdomain.com/api" : "http://localhost:5001/api");

// Helper: Handle errors & responses
async function handleResponse(res) {
  if (res.ok) {
    // Prefer JSON but fall back to text when server returns plain text
    try {
      return await res.json();
    } catch {
      return await res.text();
    }
  }

  // Non-OK: try to parse JSON error body, otherwise return text/status
  let errBody = null;
  try {
    errBody = await res.json();
  } catch {
    try {
      errBody = await res.text();
    } catch {
      errBody = null;
    }
  }

  const message =
    (errBody && (errBody.error || errBody.message || JSON.stringify(errBody))) ||
    res.statusText ||
    `HTTP ${res.status}`;
  throw new Error(message);
}

// --------------------
// Example API methods
// --------------------

// Check backend health
export async function getHealth() {
  const res = await fetch(`${API_BASE}/health`); // ex: http://localhost:5000/api/health
  return await handleResponse(res);
}

// Upload resume (JSON)
export async function uploadResume(text, meta = {}) {
  const res = await fetch(`${API_BASE}/resumes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, meta }),
  });
  return handleResponse(res);
}

// Upload resume (file)
export async function uploadResumeFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/resumes`, {
    method: "POST",
    body: formData,
  });
  return handleResponse(res);
}

// Search jobs
export async function searchJobs(options = {}) {
  // options: { inputs, query, location, page, resultsPerPage, salaryMin, salaryMax, type, experience }
  const payload = {
    ...(options.inputs ? { inputs: options.inputs } : {}),
    ...(options.query ? { query: options.query } : {}),
    ...(options.location ? { location: options.location } : {}),
    page: options.page || 1,
    resultsPerPage: options.resultsPerPage || 10,
    ...(options.salaryMin ? { salaryMin: options.salaryMin } : {}),
    ...(options.salaryMax ? { salaryMax: options.salaryMax } : {}),
    ...(options.type ? { type: options.type } : {}),
    ...(options.experience ? { experience: options.experience } : {}),
  };

  const res = await fetch(`${API_BASE}/jobs/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // Use handleResponse to throw on HTTP errors and parse body
  const data = await handleResponse(res);

  // If backend returned the expected structure, map job fields to frontend-friendly shape
  if (data && Array.isArray(data.results)) {
    const mapped = data.results.map((j) => ({
      job_id: j.job_id,
      external_id: j.external_id,
      title: j.title,
      company: j.company,
      location: j.location,
      description: j.description,
      skills: j.skills || [],
      salaryMin: j.salary_min || 0,
      salaryMax: j.salary_max || 0,
      category: j.category,
      url: j.url,
      raw: j.raw || {},
      // Prefer server-provided normalized type, fall back to raw heuristics
      type: j.type || (() => {
        const raw = j.raw || {}
        const ct = (raw.contract_time || raw.contract_type || "" ).toString().toLowerCase()
        if (ct.includes('full') || ct.includes('permanent')) return 'Full-time'
        if (ct.includes('part')) return 'Part-time'
        if (ct.includes('contract') || ct.includes('temporary')) return 'Contract'
        if (ct.includes('intern')) return 'Internship'
        if (ct.includes('remote')) return 'Remote'
        // try to infer from title/description heuristics
        const txt = ((j.title || '') + ' ' + (j.description || '') + ' ' + (raw.description || '')).toLowerCase()
        if (txt.includes('remote')) return 'Remote'
        if (txt.includes('part-time')) return 'Part-time'
        if (txt.includes('contract')) return 'Contract'
        if (txt.includes('intern')) return 'Internship'
        return ''
      })(),
      // Normalize experience to a simple returned value (lowercase from backend). The frontend will format/display it.
      experience: j.experience_level || j.experience || '',
    }))

    // Normalize paging metadata to camelCase for consumers
    const respPage = Number(data.page || 1)
    const respRpp = Number(data.resultsPerPage ?? data.results_per_page ?? 10)
    const respTotal = Number(data.totalResults ?? data.total_results ?? 0)

    return {
      // normalized
      page: respPage,
      resultsPerPage: respRpp,
      totalResults: respTotal,
      // raw backend payload (included for debugging if needed)
      _raw: data,
      results: mapped,
    };
  }

  return data;
}

// Get recommendations
export async function getRecommendations(resumeId, jobIds) {
  const res = await fetch(`${API_BASE}/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resume_id: resumeId, job_ids: jobIds }),
  });

  const data = await handleResponse(res);

  // Map results array (if present) so callers get predictable keys
  if (data && Array.isArray(data.results)) {
    const mapped = data.results.map((r) => ({
      job_id: r.job_id,
      title: r.title,
      company: r.company,
      location: r.location,
      score: r.score,
      gaps: r.gaps || [],
      resume_bullets: r.resume_bullets || [],
      cover_letter: r.cover_letter || '',
      matched_skills: r.matched_skills || [],
      derived_resume_skills: r.derived_resume_skills || [],
    }))
    return { ...data, results: mapped };
  }

  return data;
}

// Match a single resume with a single job and return match metadata + generated cover letter
// payload: { resume_id?, resume_text?, name?, job_id?, job? }
export async function matchResumeToJob(payload = {}) {
  const res = await fetch(`${API_BASE}/match`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await handleResponse(res);
  // The backend `match` endpoint now returns only a numeric score. Normalize to { score } when present.
  if (data && typeof data.score !== 'undefined') {
    return { score: Number(data.score) };
  }
  return data;
}

// Generate a cover letter for a resume/job pair. Returns { cover_letter, resume_bullets }
// payload: same shape as matchResumeToJob
export async function generateCoverLetter(payload = {}) {
  const res = await fetch(`${API_BASE}/generate-cover-letter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // Normalize AI response so callers always get { cover_letter, resume_bullets }
  const data = await handleResponse(res);
  if (!data || typeof data !== 'object') return { cover_letter: '', resume_bullets: [] };

  return {
    cover_letter: data.cover_letter || data.coverLetter || data.cover || '',
    resume_bullets: Array.isArray(data.resume_bullets) ? data.resume_bullets : (Array.isArray(data.resumeBullets) ? data.resumeBullets : (Array.isArray(data.resumeBullets) ? data.resumeBullets : [])),
    // include raw data for debugging if callers need it
    _raw: data,
  };
}
