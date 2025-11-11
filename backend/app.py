# backend/app.py
from __future__ import annotations
import os, re, json, random, string
import requests
from datetime import datetime
from typing import Any, Dict, List, Tuple

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Optional MySQL
import mysql.connector
from werkzeug.utils import secure_filename

# -----------------------------
# Env & app
# -----------------------------
load_dotenv()
app = Flask(__name__)

# Log whether Adzuna creds are available (don't print the secrets themselves)
if os.getenv("ADZUNA_APP_ID") and os.getenv("ADZUNA_APP_KEY"):
    app.logger.info("Adzuna credentials found in environment")
else:
    app.logger.warning("Adzuna credentials not found in environment; set ADZUNA_APP_ID and ADZUNA_APP_KEY in .env or env")

# CORS allowlist (env) or permissive for dev
_allow = os.getenv("CORS_ALLOW_ORIGINS", "")
origins = [o.strip() for o in _allow.split(",") if o.strip()]

# Always give Flask-CORS a list (never None)
if not origins:
    origins = ["*"]  # Allow all for local dev

CORS(app, origins=origins, supports_credentials=True)


# -----------------------------
# DB helpers (uses your global connection style, but with safe fallback)
# -----------------------------
USE_DB = all(os.getenv(k) for k in ["DB_HOST", "DB_USER", "DB_NAME"])
_db = None
_cursor = None

def get_db():
    global _db, _cursor
    if not USE_DB:
        return None, None
    try:
        if _db is None or not _db.is_connected():
            _db = mysql.connector.connect(
                host=os.getenv("DB_HOST"),
                user=os.getenv("DB_USER"),
                password=os.getenv("DB_PASSWORD"),
                database=os.getenv("DB_NAME"),
                autocommit=True,
            )
            _cursor = _db.cursor(dictionary=True)
        return _db, _cursor
    except Exception as e:
        app.logger.warning(f"MySQL unavailable, using memory store. Error: {e}")
        return None, None

# Try to connect once at startup (your original behavior)
get_db()

# -----------------------------
# In-memory fallback store
# -----------------------------
MEM = {
    "resumes": {},     # resume_id -> {"user_id":..., "text":..., "file_name":..., "name":..., "skills":[...]}
    "jobs": {},        # job_id -> job dict
    "next_resume_id": 1,
    "next_job_id": 1,
}

def _gen_id(prefix="J", n=6):
    return prefix + "".join(random.choices(string.ascii_uppercase + string.digits, k=n))

def ok(data: Dict[str, Any] | List[Any] | str = "ok", code: int = 200):
    if isinstance(data, str):
        data = {"status": data}
    return jsonify(data), code

def bad(msg: str, code: int = 400):
    return jsonify({"error": msg}), code

def _normalize_ws(s: str) -> str:
    return re.sub(r"\s+", " ", s or "").strip()

# Simple skill extraction / scoring utilities
_BASE_SKILLS = {
    "python","sql","excel","power bi","tableau","snowflake","pandas","numpy","r",
    "java","javascript","react","node","api","rest","fastapi","flask",
    "dashboards","kpi","etl","data pipeline","airflow","docker","kubernetes",
    "git","jira","experimentation","a b testing","a/b testing","statistics",
    "forecast","supply chain","sap","ibp","ml","machine learning","genai"
}

def _extract_resume_skills(text: str, user_list: List[str] | None = None) -> List[str]:
    text_l = text.lower()
    hits = []
    for sk in _BASE_SKILLS.union({s.lower() for s in (user_list or [])}):
        if sk and sk in text_l:
            hits.append(sk)
    hits.sort(key=lambda k: text_l.find(k))
    return [h.upper() if h in {"sql","r"} else h.title() for h in hits]

def _match_score(resume_text: str, job_skills: List[str]) -> Tuple[int, List[str]]:
    text = resume_text.lower()
    hits = [k for k in job_skills if k.lower() in text]
    score = max(40, min(99, 60 + 7*len(hits)))
    gaps = [k for k in job_skills if k.lower() not in text]
    return score, gaps

def _make_bullets(job_title: str, job_company: str, matched: List[str]) -> List[str]:
    top = matched[:3] if matched else []
    bullets = [
        "Improved process efficiency through data analysis and clear metrics reporting.",
        "Built concise status updates and dashboards to support decision making.",
        "Partnered with stakeholders to clarify requirements and reduce cycle time."
    ]
    if top:
        bullets.insert(0, f"Applied {', '.join(top)} to tasks relevant to the {job_title} role at {job_company}.")
    return bullets[:4]

def _make_cover_letter(candidate_name: str, job_title: str, company: str, matched: List[str], gaps: List[str]) -> str:
    who = candidate_name or "Candidate"
    have = ", ".join(matched[:3]) if matched else "relevant tools"
    need = ", ".join(gaps[:2]) if gaps else "the listed requirements"
    return (
        f"Dear Hiring Manager,\n\n"
        f"I am interested in the {job_title} role at {company}. My background includes practical experience with {have} "
        f"and a consistent focus on clear communication and measurable outcomes. I understand the importance of {need} "
        f"and learn quickly to meet team goals.\n\n"
        f"Thank you for your time and consideration.\nSincerely,\n{who}"
    )

# -----------------------------
# Your original routes (kept)
# -----------------------------
@app.route("/")
def home():
    return "JobHunter.ai Backend Running Successfully!"

@app.route("/db-check")
def db_check():
    db, cursor = get_db()
    if not db:
        return "Database connection not configured; using memory store."
    try:
        cursor.execute("SELECT DATABASE() AS db;")
        result = cursor.fetchone()
        return f"Connected successfully to database: {result['db']}"
    except Exception as e:
        return f"Database connection failed: {e}"

@app.route("/users")
def get_users():
    db, cursor = get_db()
    if not db:
        return jsonify({"error": "DB not configured; no users table in memory mode"})
    try:
        cursor.execute("SELECT * FROM users;")
        users = cursor.fetchall()
        return jsonify(users)
    except Exception as e:
        return jsonify({"error": str(e)})

# -----------------------------
# New routes (added)
# -----------------------------
@app.get("/api/health")
def health():
    db, _ = get_db()
    info = {
        "status": "ok",
        "time": datetime.utcnow().isoformat() + "Z",
        "use_db": bool(db),
        "env": os.getenv("FLASK_ENV", "unknown"),
    }
    return ok(info)

# POST /api/resumes  JSON {"text": "...", "meta":{"name":"...", "skills":[...], "experience":"..."}}
# or multipart 'file'
@app.post("/api/resumes")
def upload_resume():
    db, cursor = get_db()

    if request.is_json:
        body = request.get_json(force=True) or {}
        text = _normalize_ws(body.get("text", ""))
        meta = body.get("meta") or {}
        name = _normalize_ws(meta.get("name", ""))
        u_skills = meta.get("skills") or []
        experience = _normalize_ws(meta.get("experience", ""))
        if not text and not experience:
            return bad("Provide 'text' or 'meta.experience' or upload a file")

        text_to_store = text or experience

        if db:
            try:
                cursor.execute(
                    "INSERT INTO resumes (user_id, resume_text, created_at) VALUES (%s, %s, NOW())",
                    (None, text_to_store),
                )
                cursor.execute("SELECT LAST_INSERT_ID() AS id")
                resume_id = cursor.fetchone()["id"]
                # keep meta in memory even if DB does not have columns
                MEM["resumes"][resume_id] = {
                    "user_id": None, "text": text_to_store, "file_name": None,
                    "name": name, "skills": u_skills, "experience": experience
                }
                return ok({"resume_id": resume_id})
            except Exception as e:
                app.logger.exception(e)

        rid = MEM["next_resume_id"]; MEM["next_resume_id"] += 1
        MEM["resumes"][rid] = {
            "user_id": None, "text": text_to_store, "file_name": None,
            "name": name, "skills": u_skills, "experience": experience
        }
        return ok({"resume_id": rid})

    # file path
    if "file" not in request.files:
        return bad("No file part. Use 'file' field for upload or send JSON with 'text'")
    file = request.files["file"]
    fname = secure_filename(file.filename or "resume.txt")
    content = file.read()
    try:
        text = content.decode("utf-8", errors="ignore")
    except Exception:
        text = ""

    if db:
        try:
            cursor.execute(
                "INSERT INTO resumes (user_id, resume_text, file_name, created_at) VALUES (%s, %s, %s, NOW())",
                (None, text, fname),
            )
            cursor.execute("SELECT LAST_INSERT_ID() AS id")
            resume_id = cursor.fetchone()["id"]
            MEM["resumes"][resume_id] = {"user_id": None, "text": text, "file_name": fname, "name": "", "skills": [], "experience": ""}
            return ok({"resume_id": resume_id})
        except Exception as e:
            app.logger.exception(e)

    rid = MEM["next_resume_id"]; MEM["next_resume_id"] += 1
    MEM["resumes"][rid] = {"user_id": None, "text": text, "file_name": fname, "name": "", "skills": [], "experience": ""}
    return ok({"resume_id": rid})

def extract_experience_level_helper(text: str) -> str:
    """Heuristic to infer experience level from free text.

    Returns one of: 'entry', 'mid', 'senior', or 'unknown'.

    Heuristics (in order):
    - explicit keywords for entry (intern, junior, entry-level, graduate) => 'entry'
    - explicit keywords for senior (senior, sr, lead, principal, director, vp, manager) => 'senior'
    - numeric years of experience (e.g. "3 years") => mapped to thresholds:
        0-1 => entry, 2-4 => mid, 5+ => senior
    - otherwise 'unknown'
    """
    if not text:
        return 'unknown'

    s = text.lower()

    # entry keywords
    if re.search(r"\b(intern(ship)?|intern|fresher|new\s+grad|graduate|entry[- ]?level|junior)\b", s):
        return 'entry'

    # senior keywords (include common abbreviations)
    if re.search(r"\b(senior|sr\.?|lead|principal|director|vp\b|vice\s+president|manager)\b", s):
        return 'senior'

    # numeric years: map to categories
    m = re.search(r"(\d+)\s*(\+|plus)?\s*(years|yrs|y)\b", s)
    if m:
        try:
            years = int(m.group(1))
        except Exception:
            years = 0
        if years <= 1:
            return 'entry'
        if 2 <= years <= 4:
            return 'mid'
        if years >= 5:
            return 'senior'

    return 'unknown'


def _normalize_contract_type(job_raw: dict, title: str, description: str) -> str:
    """Normalize job type into friendly labels.

    Returns one of: 'Full-time', 'Part-time', 'Contract', 'Internship', 'Remote', ''
    """
    if not isinstance(job_raw, dict):
        job_raw = {}
    ct = (job_raw.get("contract_time") or job_raw.get("contract_type") or "").strip().lower()
    if ct:
        if "full" in ct or "permanent" in ct:
            return "Full-time"
        if "part" in ct:
            return "Part-time"
        if "contract" in ct or "temporary" in ct:
            return "Contract"
        if "intern" in ct:
            return "Internship"
        if "remote" in ct:
            return "Remote"
        if "hybrid" in ct:
            return "Hybrid"

    # fallback: look into title/description heuristics
    txt = f"{title or ''} {description or ''}".lower()
    if "remote" in txt:
        return "Remote"
    if "part-time" in txt or "part time" in txt:
        return "Part-time"
    if "contract" in txt or "temporary" in txt:
        return "Contract"
    if "intern" in txt or "internship" in txt:
        return "Internship"

    return ""

# POST /api/jobs/search { "inputs": ["https://...", "data analyst chicago", ...] }
@app.post("/api/jobs/search")
def jobs_search():
    data = request.get_json(force=True) or {}
    # Read filters from frontend --> frontend sends camelCase salaryMin/salaryMax
    query = (data.get("query") or (data.get("inputs") or [""])[0] or "").strip()
    location = (data.get("location") or "").strip()

    # pagination --> allows efficient browsing through large result sets
    try:
        page = int(data.get("page", 1) or 1)
    except Exception:
        page = 1
    try:
        results_per_page = int(data.get("resultsPerPage", data.get("results_per_page", 10)) or 10)
    except Exception:
        results_per_page = 10

    # make salary filters into ints
    try:
        salary_min = int(data.get("salaryMin", 0) or 0)
    except Exception:
        salary_min = 0
    try:
        salary_max = int(data.get("salaryMax", 999999) or 999999)
    except Exception:
        salary_max = 999999

    job_type = (data.get("type") or "").strip()
    experience = (data.get("exp") or data.get("experience") or "").strip()

    if not isinstance(query, str) or not query:
        return bad("Provide 'query' as a non-empty string")

    # Read Adzuna credentials from environment 
    app_id = os.getenv("ADZUNA_APP_ID")
    app_key = os.getenv("ADZUNA_APP_KEY")
    country = os.getenv("ADZUNA_COUNTRY", "us")

    if not app_id or not app_key:
        return bad("Adzuna API credentials not configured on server. Set ADZUNA_APP_ID and ADZUNA_APP_KEY.")

    url = f"https://api.adzuna.com/v1/api/jobs/{country}/search/{page}"
    params = {
        "app_id": app_id,
        "app_key": app_key,
        "results_per_page": results_per_page,
        "what": query,
        "where": location,
        "content-type": "application/json"
    }

    # Apply salary filters only when provided
    if salary_min and salary_min > 0:
        params["salary_min"] = salary_min
    if salary_max and salary_max < 999999:
        params["salary_max"] = salary_max

    # Note: Adzuna has limited direct filters for type/experience in query params; keep them for local filtering below
    try:
        res = requests.get(url, params=params, timeout=8)
        res.raise_for_status()
        adzuna_data = res.json()
    except Exception as e:
        app.logger.exception(f"Adzuna API error: {e}")
        return bad("Failed to fetch jobs from Adzuna API")

    # Convert Adzuna data into your frontend format and extract skills for later recommend()
    results = []
    # Ensure total is an integer (0 when missing) so frontend math is reliable
    try:
        total = int(adzuna_data.get("count") or 0)
    except Exception:
        total = 0
    for job in adzuna_data.get("results", []):
        jid = MEM["next_job_id"]
        MEM["next_job_id"] += 1

        # Adzuna does not have specific experience level field; infer experience from title/description
        raw_desc = job.get("description", "") or ""
        # strip basic HTML tags from description
        desc = re.sub(r"<[^>]+>", "", raw_desc)

        # extract a simple list of skills from the job description using the helper function
        skills = _extract_resume_skills(desc)

        # normalize salary fields to ints or None
        def _to_int_or_none(v):
            if v is None:
                return None
            try:
                return int(float(v))
            except Exception:
                # try to strip non-digits
                s = re.sub(r"[^0-9.-]", "", str(v) or "")
                try:
                    return int(float(s))
                except Exception:
                    return None

        s_min = _to_int_or_none(job.get("salary_min"))
        s_max = _to_int_or_none(job.get("salary_max"))

        # infer experience level from title+description
        exp_level = extract_experience_level_helper(f"{job.get('title','')} {desc}")

        external_id = job.get("id") or job.get("ad_id") or job.get("redirect_url")

        normalized_type = _normalize_contract_type(job, job.get('title',''), desc)

        job_data = {
            "job_id": jid,
            "external_id": external_id,
            "title": job.get("title"),
            "company": job.get("company", {}).get("display_name", "Unknown"),
            "location": job.get("location", {}).get("display_name", ""),
            "url": job.get("redirect_url"),
            "description": desc[:300],
            "salary_min": s_min,
            "salary_max": s_max,
            # convenience camelCase aliases for some frontends that expect them
            "salaryMin": s_min,
            "salaryMax": s_max,
            # provide a default matchScore so the UI has a consistent field to show
            "matchScore": 0,
            "category": job.get("category", {}).get("label", ""),
            "created": job.get("created"),
            "skills": skills,
            "experience_level": exp_level,
            "type": normalized_type,
            # preserve raw metadata that may help local filtering
            "raw": job,
        }

        # Local filtering: if frontend asked for a job type or experience, try to filter heuristically
        if job_type:
            # common Adzuna field names for contract type vary; check raw data for matches
            raw_type = (job.get("contract_time") or job.get("contract_type") or "")
            if raw_type and job_type.lower() not in raw_type.lower():
                # skip this job if it doesn't match requested type
                continue

        MEM["jobs"][jid] = job_data
        results.append(job_data)

    # Pagination, limit results to requested page size
    resp = {
        "results": results,
        "total_results": total,
        "totalResults": total,
        "page": page,
        "results_per_page": results_per_page,
        "resultsPerPage": results_per_page,
    }
    
    return ok(resp)

# POST /api/recommend { "resume_id": int, "job_ids": [int] }
@app.post("/api/recommend")
def recommend():
    data = request.get_json(force=True) or {}
    resume_id = data.get("resume_id")
    job_ids = data.get("job_ids", [])

    if not resume_id:
        return bad("Missing 'resume_id'")
    if not job_ids:
        return bad("Provide non-empty 'job_ids' array")

    # fetch resume text (from DB if available, else memory)
    db, cursor = get_db()
    resume_text = ""
    candidate_name = ""
    user_listed_skills: List[str] = []

    if db:
        try:
            cursor.execute("SELECT resume_text FROM resumes WHERE id=%s", (resume_id,))
            row = cursor.fetchone()
            if row:
                resume_text = (row.get("resume_text") or "")
        except Exception as e:
            app.logger.exception(e)

    if not resume_text:
        r = MEM["resumes"].get(resume_id, {})
        resume_text = r.get("text", "")
        candidate_name = r.get("name", "") or ""
        user_listed_skills = r.get("skills", []) or []
    if not resume_text:
        return bad("Resume not found")

    derived = _extract_resume_skills(resume_text, user_listed_skills)

    results = []
    for jid in job_ids:
        job = MEM["jobs"].get(jid)
        if not job:
            continue
        score, gaps = _match_score(resume_text, job["skills"])
        matched = [s for s in job["skills"] if s.lower() in resume_text.lower()] or derived[:3]
        bullets = _make_bullets(job["title"], job["company"], matched)
        cover = _make_cover_letter(candidate_name, job["title"], job["company"], matched, gaps)
        results.append({
            "job_id": jid,
            "title": job["title"],
            "company": job["company"],
            "location": job["location"],
            "score": score,
            "gaps": gaps[:3],
            "resume_bullets": bullets,
            "cover_letter": cover,
            "matched_skills": matched,
            "derived_resume_skills": derived[:8],
        })

    return ok({"results": results})

## POST /api/jobs/recommend { "job_title": "...", "skills": [...], "location": "..." }
@app.post("/api/jobs/recommend")
def job_recommend_mock():
    data = request.get_json(force=True) or {}
    job_title = data.get("job_title")
    skills = data.get("skills", [])
    location = data.get("location")

    # Validate required fields
    if not job_title or not skills or not location:
        return bad("Missing required field(s): job_title, skills, and location are required")

    # Mock response
    mock_score = 85 if "data analysis" in [s.lower() for s in skills] else 70
    return ok({
        "message": "Job recommendation generated successfully",
        "input": data,
        "mock_score": mock_score
    })


# -----------------------------
# Chatbot blueprint (Gemini) — optional
# -----------------------------
try:
    from chat_api import chat_bp    # backend/chat_api.py
    app.register_blueprint(chat_bp)
except Exception as e:
    app.logger.warning(f"Chat blueprint not loaded: {e}")

# -----------------------------
# Main
# -----------------------------
if __name__ == "__main__":
    port = int(os.getenv("PORT", "5001"))
    app.run(host="0.0.0.0", port=port, debug=True)