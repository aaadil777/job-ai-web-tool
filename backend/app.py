# backend/app.py
from __future__ import annotations
import os, re, random, string
from datetime import datetime
from typing import Any, Dict, List, Tuple

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.utils import secure_filename

# -------------------------------------------------
# Env & app
# -------------------------------------------------
load_dotenv()
app = Flask(__name__)

# CORS allowlist (env) or permissive for dev
_allow = os.getenv("CORS_ALLOW_ORIGINS", "")
origins = [o.strip() for o in _allow.split(",") if o.strip()]
CORS(app, origins=origins or None, supports_credentials=True)

# -------------------------------------------------
# In-memory store (no MySQL)
# -------------------------------------------------
MEM = {
    "resumes": {},     # resume_id -> {"user_id":..., "text":..., "file_name":..., "name":..., "skills":[...]}
    "jobs": {},        # job_id    -> job dict
    "next_resume_id": 1,
    "next_job_id": 1,
}

def _gen_id(prefix="J", n=6) -> str:
    return prefix + "".join(random.choices(string.ascii_uppercase + string.digits, k=n))

def ok(data: Dict[str, Any] | List[Any] | str = "ok", code: int = 200):
    if isinstance(data, str):
        data = {"status": data}
    return jsonify(data), code

def bad(msg: str, code: int = 400):
    return jsonify({"error": msg}), code

def _normalize_ws(s: str) -> str:
    return re.sub(r"\s+", " ", s or "").strip()

# --- skill extraction / simple matching ---
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

# -------------------------------------------------
# Routes
# -------------------------------------------------
@app.route("/")
def home():
    return "JobHunter.ai Backend Running Successfully! (in-memory mode)"

@app.route("/db-check")
def db_check():
    return "Database not configured; running in in-memory mode."

@app.route("/users")
def get_users():
    return jsonify({"error": "Users table not available in in-memory mode"})

@app.get("/api/health")
def health():
    info = {
        "status": "ok",
        "time": datetime.utcnow().isoformat() + "Z",
        "use_db": False,
        "env": os.getenv("FLASK_ENV", "unknown"),
    }
    return ok(info)

# POST /api/resumes  JSON {"text":"...", "meta":{"name":"...", "skills":[...], "experience":"..."}}
# or multipart 'file'
@app.post("/api/resumes")
def upload_resume():
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
        rid = MEM["next_resume_id"]; MEM["next_resume_id"] += 1
        MEM["resumes"][rid] = {
            "user_id": None, "text": text_to_store, "file_name": None,
            "name": name, "skills": u_skills, "experience": experience
        }
        return ok({"resume_id": rid})

    if "file" not in request.files:
        return bad("No file part. Use 'file' field for upload or send JSON with 'text'")
    file = request.files["file"]
    fname = secure_filename(file.filename or "resume.txt")
    content = file.read()
    try:
        text = content.decode("utf-8", errors="ignore")
    except Exception:
        text = ""

    rid = MEM["next_resume_id"]; MEM["next_resume_id"] += 1
    MEM["resumes"][rid] = {"user_id": None, "text": text, "file_name": fname, "name": "", "skills": [], "experience": ""}
    return ok({"resume_id": rid})

# POST /api/jobs/search { "inputs": ["https://...", "data analyst chicago", ...] }
@app.post("/api/jobs/search")
def jobs_search():
    data = request.get_json(force=True) or {}
    inputs = data.get("inputs", [])
    if not isinstance(inputs, list) or not inputs:
        return bad("Provide 'inputs' as a non-empty list of links or queries")

    results = []
    for s in inputs:
        jid = MEM["next_job_id"]; MEM["next_job_id"] += 1
        s_low = s.lower()
        is_da = any(k in s_low for k in ["analyst", "analytics", "data"])
        title = "Data Analyst" if is_da else ("Associate Product Manager" if "product" in s_low else "Operations Analyst")
        company = "Northstar Logistics" if "logistic" in s_low else ("Acme Robotics" if "robot" in s_low else "BluePeak")
        skills = ["SQL", "Python", "Power BI", "APIs", "Experimentation"] if is_da else ["Roadmaps", "Jira", "Stakeholder mgmt", "KPIs"]
        fake = {
            "job_id": jid,
            "title": title,
            "company": company,
            "location": "Remote - US",
            "url": s if s.startswith("http") else f"https://jobs.example.com/{_gen_id()}",
            "skills": skills,
            "description": f"Auto-generated placeholder for input: {s[:160]}",
        }
        MEM["jobs"][jid] = fake
        results.append(fake)

    return ok({"results": results})

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

# --- Optional: Gemini chat blueprint (requires GEMINI_API_KEY in env) ---
try:
    from chat_api import chat_bp    # backend/chat_api.py
    app.register_blueprint(chat_bp)
except Exception as e:
    app.logger.warning(f"Chat blueprint not loaded: {e}")

# -------------------------------------------------
# Main
# -------------------------------------------------
if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=True)
