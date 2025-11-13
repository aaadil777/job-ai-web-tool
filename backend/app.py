# backend/app.py
from __future__ import annotations
import os, re, json, random, string
import requests
from datetime import datetime, timezone 
from typing import Any, Dict, List, Tuple

import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from ml.pre_llm_filter_functions import ParsingFunctionsPreLLM

from pathlib import Path
import mammoth
import pdfplumber
from io import BytesIO

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Optional MySQL
import mysql.connector
from werkzeug.utils import secure_filename
from werkzeug.exceptions import HTTPException

# Gemini
import google.generativeai as genai

# -----------------------------
# Env & app
# -----------------------------
load_dotenv()
app = Flask(__name__)

# Log whether Adzuna creds are available (do not print the secrets)
if os.getenv("ADZUNA_APP_ID") and os.getenv("ADZUNA_APP_KEY"):
    app.logger.info("Adzuna credentials found in environment")
else:
    app.logger.warning(
        "Adzuna credentials not found in environment; "
        "set ADZUNA_APP_ID and ADZUNA_APP_KEY in .env or env"
    )

# CORS allowlist (env) or permissive for dev
_allow = os.getenv("CORS_ALLOW_ORIGINS", "")
origins = [o.strip() for o in _allow.split(",") if o.strip()]

# Always give Flask-CORS a list (never None)
if not origins:
    origins = ["*"]  # Allow all for local dev

@app.errorhandler(413)
def too_large(e):
    return bad("File too large (max 5MB)", 413)

@app.errorhandler(Exception)
def handle_uncaught(e):
    if isinstance(e, HTTPException):
        return e
    app.logger.exception("Unhandled exception", exc_info=e)
    return bad("Server error", 500)

CORS(app, origins=origins, supports_credentials=True)

# -----------------------------
# Gemini config
# -----------------------------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    app.logger.info(f"Gemini model set to {GEMINI_MODEL}")
else:
    app.logger.warning("GEMINI_API_KEY not set; /api/chat will return an error")

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
                use_pure=True,
            )
            _cursor = _db.cursor(dictionary=True)
        return _db, _cursor
    except Exception as e:
        app.logger.warning(f"MySQL unavailable, using memory store. Error: {e}")
        return None, None


# Try to connect once at startup
# get_db()

# -----------------------------
# Resume Upload Helpers
# -----------------------------

# Define a max file size of 5MB
app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024

# Only allow PDFs, Open XML, and TXT files 
ALLOWED_MIME = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
}

# *** CHANGE LATER IF NEEDED ***
def _get_user_id():
    """
    Grab user id for the authenticated user.
    """
    h = request.headers.get("X-User-Id")
    try:
        return int(h) if h is not None else None
    except Exception:
        return None

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
    "python", "sql", "excel", "power bi", "tableau", "snowflake", "pandas", "numpy", "r",
    "java", "javascript", "react", "node", "api", "rest", "fastapi", "flask",
    "dashboards", "kpi", "etl", "data pipeline", "airflow", "docker", "kubernetes",
    "git", "jira", "experimentation", "a b testing", "a/b testing", "statistics",
    "forecast", "supply chain", "sap", "ibp", "ml", "machine learning", "genai",
}


def _extract_resume_skills(text: str, user_list: List[str] | None = None) -> List[str]:
    text_l = text.lower()
    hits = []
    for sk in _BASE_SKILLS.union({s.lower() for s in (user_list or [])}):
        if sk and sk in text_l:
            hits.append(sk)
    hits.sort(key=lambda k: text_l.find(k))
    return [h.upper() if h in {"sql", "r"} else h.title() for h in hits]


def _match_score(resume_text: str, job_skills: List[str]) -> Tuple[int, List[str]]:
    text = resume_text.lower()
    hits = [k for k in job_skills if k.lower() in text]
    score = max(40, min(99, 60 + 7 * len(hits)))
    gaps = [k for k in job_skills if k.lower() not in text]
    return score, gaps


def _make_bullets(job_title: str, job_company: str, matched: List[str]) -> List[str]:
    top = matched[:3] if matched else []
    bullets = [
        "Improved process efficiency through data analysis and clear metrics reporting.",
        "Built concise status updates and dashboards to support decision making.",
        "Partnered with stakeholders to clarify requirements and reduce cycle time.",
    ]
    if top:
        bullets.insert(
            0,
            f"Applied {', '.join(top)} to tasks relevant to the {job_title} role at {job_company}.",
        )
    return bullets[:4]


def _make_cover_letter(
    candidate_name: str,
    job_title: str,
    company: str,
    matched: List[str],
    gaps: List[str],
) -> str:
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

def _parse_pdf_with_pre_llm(content: bytes):
    """
    Use ParsingFunctionsPreLLM to get clean text + sections + contacts from PDF.
    """
    parser = ParsingFunctionsPreLLM(path="<in-memory>")
    raw_text = parser.extract_text_from_pdf_bytes(content)
    cleaned_text = parser.clean_up_text(raw_text)
    sections = parser.define_sections(cleaned_text)
    contacts = parser.gather_contact_info_from_text(cleaned_text)

    return {
        "raw_text": raw_text,
        "cleaned_text": cleaned_text,
        "sections": sections,
        "contacts": contacts,
    }
    
def _parse_plain_text_with_pre_llm(text: str):
    """
    Uses the same logic as _parse_pdf_with_pre_llm except starts from already extracted plain text (DOCX/TXT).
    """
    parser = ParsingFunctionsPreLLM(path="<in-memory>")
    cleaned = parser.clean_up_text(text or "")
    sections = parser.define_sections(cleaned)
    contacts = parser.gather_contact_info_from_text(cleaned)
    return {
        "raw_text": text or "",
        "cleaned_text": cleaned,
        "sections": sections,
        "contacts": contacts,
    }
    
# -----------------------------
# Original routes
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
# New routes
# -----------------------------
@app.get("/api/health")
def health():
    db, _ = get_db()
    info = {
        "status": "ok",
        "time": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "use_db": bool(db),
        "env": os.getenv("FLASK_ENV", "unknown"),
    }
    return ok(info)


# POST /api/resumes  JSON {"text": "...", "meta":{"name":"...", "skills":[...], "experience":"..."}}
# or multipart 'file'
@app.post("/api/resumes")
def upload_resume():
    db, cursor = get_db()
    uid = _get_user_id()

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
                    "INSERT INTO resumes (user_id, resume_text, created_at) "
                    "VALUES (%s, %s, NOW())",
                    (uid, text_to_store),
                )
                cursor.execute("SELECT LAST_INSERT_ID() AS id")
                resume_id = cursor.fetchone()["id"]
                # keep meta in memory even if DB does not have columns
                MEM["resumes"][resume_id] = {
                    "user_id": uid,
                    "text": text_to_store,
                    "file_name": None,
                    "name": name,
                    "skills": u_skills,
                    "experience": experience,
                }
                return ok({"resume_id": resume_id})
            except Exception as e:
                app.logger.exception(e)

        rid = MEM["next_resume_id"]
        MEM["next_resume_id"] += 1
        MEM["resumes"][rid] = {
            "user_id": uid,
            "text": text_to_store,
            "file_name": None,
            "name": name,
            "skills": u_skills,
            "experience": experience,
        }
        return ok({"resume_id": rid})

    # file path
    if "file" not in request.files:
        return bad("No file part. Use 'file' field for upload or send JSON with 'text'")
    file = request.files["file"]
    fname = secure_filename(file.filename or "resume.pdf")
    mime = file.mimetype or ""
    if mime not in ALLOWED_MIME:
        return bad("Only PDF, DOCX, or TXT allowed")

    content = file.read() or b""

    parsed = None
    if mime == "application/pdf":
        parsed = _parse_pdf_with_pre_llm(content)
        text = parsed["cleaned_text"]
    elif mime == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        result = mammoth.extract_raw_text(BytesIO(content))
        raw = (result.value or "").strip()
        parsed = _parse_plain_text_with_pre_llm(raw)
        text = parsed["cleaned_text"]
    else:  # text/plain
        raw = content.decode("utf-8", errors="ignore")
        parsed = _parse_plain_text_with_pre_llm(raw)
        text = parsed["cleaned_text"]

    meta_blob = {}
    if parsed:
        meta_blob = {
            "sections": parsed["sections"],
            "contacts": parsed["contacts"],
        }

    if db:
        try:
            cursor.execute(
                "INSERT INTO resumes (user_id, resume_text, file_name, parsed_sections, parsed_contacts, created_at) "
                "VALUES (%s, %s, %s, %s, %s, NOW())",
                (
                    uid,
                    text,
                    fname,
                    json.dumps(meta_blob.get("sections")) if meta_blob else None,
                    json.dumps(meta_blob.get("contacts")) if meta_blob else None,
                ),
            )
            cursor.execute("SELECT LAST_INSERT_ID() AS id")
            resume_id = cursor.fetchone()["id"]

            MEM["resumes"][resume_id] = {
                "user_id": uid,
                "text": text,
                "file_name": fname,
                "name": "",
                "skills": [],
                "experience": "",
                "parsed_sections": meta_blob.get("sections"),
                "parsed_contacts": meta_blob.get("contacts"),
            }
            return ok({"resume_id": resume_id})
        except Exception as e:
            app.logger.exception(e)

    # memory fallback
    rid = MEM["next_resume_id"]
    MEM["next_resume_id"] += 1
    MEM["resumes"][rid] = {
        "user_id": uid,
        "text": text,
        "file_name": fname,
        "name": "",
        "skills": [],
        "experience": "",
        "parsed_sections": meta_blob.get("sections"),
        "parsed_contacts": meta_blob.get("contacts"),
    }

    app.logger.info(f"Upload: name={fname}, mime={mime}, size={len(content)}")

    return ok({"resume_id": rid})

@app.get("/api/resumes")
def resume_get_latest_meta():
    """
    Returns the latest resume metadata for the current user.
    """
    uid = _get_user_id()
    db, cursor = get_db()

    if db:
        cursor.execute(
            """
            SELECT id, COALESCE(file_name, 'pasted-text') AS name, created_at
            FROM resumes
            WHERE (user_id <=> %s)
            ORDER BY created_at DESC
            LIMIT 1
            """,
            (uid,),
        )
        row = cursor.fetchone()
        if not row:
            return bad("No resume", 404)
        return ok({
            "resume_id": row["id"],
            "name": row["name"],
            "uploaded_at": (row["created_at"].isoformat() if row.get("created_at") else datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"))
        })

    # Find most recent by insertion order.
    if not MEM["resumes"]:
        return bad("No resume", 404)
    # Prefer last created for the same user if present; else any last.
    user_items = [(rid, r) for rid, r in MEM["resumes"].items() if r.get("user_id") == uid]
    rid, r = (user_items[-1] if user_items else list(MEM["resumes"].items())[-1])
    return ok({
        "resume_id": rid,
        "name": r.get("file_name") or "pasted-text",
        "uploaded_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    })


@app.put("/api/resumes/<int:rid>")
def resume_replace_existing(rid: int):
    """
    Replace an existing resume row with a new uploaded file.
    Accepts multipart 'file'. Updates resume_text + file_name and bumps created_at.
    """
    uid = _get_user_id()
    db, cursor = get_db()

    if "file" not in request.files:
        return bad("Missing 'file' in form-data")
    f = request.files["file"]
    if not f or not f.filename:
        return bad("Empty file")

    mime = f.mimetype or ""
    if mime not in ALLOWED_MIME:
        return bad("Only PDF, DOCX, or TXT allowed")

    content = f.read() or b""

    parsed = None
    if mime == "application/pdf":
        parsed = _parse_pdf_with_pre_llm(content)
        text = parsed["cleaned_text"]
    elif mime == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        result = mammoth.extract_raw_text(BytesIO(content))
        raw = (result.value or "").strip()
        parsed = _parse_plain_text_with_pre_llm(raw)
        text = parsed["cleaned_text"]
    else:  # text/plain
        raw = content.decode("utf-8", errors="ignore")
        parsed = _parse_plain_text_with_pre_llm(raw)
        text = parsed["cleaned_text"]

    safe_name = secure_filename(f.filename)

    if db:
        # Ensure the row exists and belongs to this user
        cursor.execute(
            """
            UPDATE resumes
            SET
                resume_text = %s,
                file_name = %s,
                parsed_sections = %s,
                parsed_contacts = %s,
                created_at = NOW()
            WHERE id=%s AND (user_id <=> %s)
            """,
            (
                text,
                safe_name,
                json.dumps(parsed["sections"]) if parsed else None,
                json.dumps(parsed["contacts"]) if parsed else None,
                rid,
                uid,
            ),
        )

        # Fetch fresh metadata
        cursor.execute(
            "SELECT id, COALESCE(file_name, 'pasted-text') AS name, created_at FROM resumes WHERE id=%s",
            (rid,),
        )
        fresh = cursor.fetchone()
        return ok({
            "resume_id": fresh["id"],
            "name": fresh["name"],
            "uploaded_at": fresh["created_at"].isoformat()
        })

    if rid not in MEM["resumes"] or MEM["resumes"][rid].get("user_id") != uid:
        # Accept null user match in dev if uid is None and record has None
        if not (rid in MEM["resumes"] and MEM["resumes"][rid].get("user_id") is None and uid is None):
            return bad("Not found", 404)
    MEM["resumes"][rid]["text"] = text
    MEM["resumes"][rid]["file_name"] = safe_name

    if parsed:
        MEM["resumes"][rid]["parsed_sections"] = parsed["sections"]
        MEM["resumes"][rid]["parsed_contacts"] = parsed["contacts"]

    return ok({
        "resume_id": rid,
        "name": safe_name,
        "uploaded_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    })


@app.delete("/api/resumes/<int:rid>")
def resume_delete_existing(rid: int):
    """
    Delete a resume row. 204 on success.
    """
    uid = _get_user_id()
    db, cursor = get_db()

    if db:
        cursor.execute(
            "SELECT id FROM resumes WHERE id=%s AND (user_id <=> %s)",
            (rid, uid),
        )
        row = cursor.fetchone()
        if not row:
            return bad("Not found", 404)
        cursor.execute(
            "DELETE FROM resumes WHERE id=%s AND (user_id <=> %s)",
            (rid, uid),
        )
        return "", 204

    r = MEM["resumes"].get(rid)
    if not r:
        return bad("Not found", 404)
    if not (r.get("user_id") == uid or (r.get("user_id") is None and uid is None)):
        return bad("Not found", 404)
    del MEM["resumes"][rid]
    return "", 204

@app.get("/api/resumes/<int:rid>/parsed")
def resume_get_parsed(rid: int):
    uid = _get_user_id()
    db, cursor = get_db()

    if db:
        cursor.execute(
            """
            SELECT id, parsed_sections, parsed_contacts
            FROM resumes
            WHERE id=%s AND (user_id <=> %s)
            """,
            (rid, uid),
        )
        row = cursor.fetchone()
        if not row:
            return bad("Not found", 404)

        def _maybe_load(v):
            if v is None:
                return None
            if isinstance(v, (dict, list)):
                return v
            try:
                return json.loads(v)
            except Exception:
                return None

        return ok({
            "resume_id": row["id"],
            "parsed_sections": _maybe_load(row.get("parsed_sections")),
            "parsed_contacts": _maybe_load(row.get("parsed_contacts")),
        })

    # memory fallback
    r = MEM["resumes"].get(rid)
    if not r or not (r.get("user_id") == uid or (r.get("user_id") is None and uid is None)):
        return bad("Not found", 404)

    return ok({
        "resume_id": rid,
        "parsed_sections": r.get("parsed_sections"),
        "parsed_contacts": r.get("parsed_contacts"),
    })

def extract_experience_level_helper(text: str) -> str:
    """Heuristic to infer experience level from free text.

    Returns one of: 'entry', 'mid', 'senior', or 'unknown'.
    """
    if not text:
        return "unknown"

    s = text.lower()

    # entry keywords
    if re.search(
        r"\b(intern(ship)?|intern|fresher|new\s+grad|graduate|entry[- ]?level|junior)\b",
        s,
    ):
        return "entry"

    # senior keywords (include common abbreviations)
    if re.search(
        r"\b(senior|sr\.?|lead|principal|director|vp\b|vice\s+president|manager)\b",
        s,
    ):
        return "senior"

    # numeric years: map to categories
    m = re.search(r"(\d+)\s*(\+|plus)?\s*(years|yrs|y)\b", s)
    if m:
        try:
            years = int(m.group(1))
        except Exception:
            years = 0
        if years <= 1:
            return "entry"
        if 2 <= years <= 4:
            return "mid"
        if years >= 5:
            return "senior"

    return "unknown"


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

    # fallback: look into title and description heuristics
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

    # Read filters from frontend, supports both "query" and legacy "inputs"
    query = (data.get("query") or (data.get("inputs") or [""])[0] or "").strip()
    location = (data.get("location") or "").strip()

    # pagination
    try:
        page = int(data.get("page", 1) or 1)
    except Exception:
        page = 1
    try:
        results_per_page = int(
            data.get("resultsPerPage", data.get("results_per_page", 10)) or 10
        )
    except Exception:
        results_per_page = 10

    # salary filters
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
        return bad(
            "Adzuna API credentials not configured on server. "
            "Set ADZUNA_APP_ID and ADZUNA_APP_KEY."
        )

    url = f"https://api.adzuna.com/v1/api/jobs/{country}/search/{page}"
    params = {
        "app_id": app_id,
        "app_key": app_key,
        "results_per_page": results_per_page,
        "what": query,
        "where": location,
        "content-type": "application/json",
    }

    # Apply salary filters only when provided
    if salary_min and salary_min > 0:
        params["salary_min"] = salary_min
    if salary_max and salary_max < 999999:
        params["salary_max"] = salary_max

    try:
        res = requests.get(url, params=params, timeout=8)
        res.raise_for_status()
        adzuna_data = res.json()
    except Exception as e:
        app.logger.exception(f"Adzuna API error: {e}")
        return bad("Failed to fetch jobs from Adzuna API")

    # Convert Adzuna data into your frontend format and extract skills for later recommend
    results = []
    try:
        total = int(adzuna_data.get("count") or 0)
    except Exception:
        total = 0

    for job in adzuna_data.get("results", []):
        jid = MEM["next_job_id"]
        MEM["next_job_id"] += 1

        raw_desc = job.get("description", "") or ""
        desc = re.sub(r"<[^>]+>", "", raw_desc)

        skills = _extract_resume_skills(desc)

        # normalize salary fields to ints or None
        def _to_int_or_none(v):
            if v is None:
                return None
            try:
                return int(float(v))
            except Exception:
                s = re.sub(r"[^0-9.-]", "", str(v) or "")
                try:
                    return int(float(s))
                except Exception:
                    return None

        s_min = _to_int_or_none(job.get("salary_min"))
        s_max = _to_int_or_none(job.get("salary_max"))

        exp_level = extract_experience_level_helper(
            f"{job.get('title', '')} {desc}"
        )

        external_id = job.get("id") or job.get("ad_id") or job.get("redirect_url")

        normalized_type = _normalize_contract_type(job, job.get("title", ""), desc)

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
            "raw": job,
        }

        # Local filtering for job_type
        if job_type:
            raw_type = (job.get("contract_time") or job.get("contract_type") or "")
            if raw_type and job_type.lower() not in raw_type.lower():
                continue

        MEM["jobs"][jid] = job_data
        results.append(job_data)

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
            cursor.execute(
                "SELECT resume_text FROM resumes WHERE id=%s", (resume_id,)
            )
            row = cursor.fetchone()
            if row:
                resume_text = row.get("resume_text") or ""
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
        cover = _make_cover_letter(
            candidate_name, job["title"], job["company"], matched, gaps
        )
        results.append(
            {
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
            }
        )

    return ok({"results": results})


# POST /api/jobs/recommend { "job_title": "...", "skills": [...], "location": "..." }
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
        "mock_score": mock_score,
    })


# -----------------------------
# Chat endpoint for landing page
# -----------------------------
@app.post("/api/chat")
def chat():
    """Simple chat endpoint for the landing-page assistant."""
    if not GEMINI_API_KEY:
        return bad("Gemini API key is not configured on the server")

    body = request.get_json(force=True) or {}
    messages = body.get("messages") or []
    user_text = (body.get("message") or "").strip()

    if not user_text:
        return bad("Missing 'message'")

    # Build prompt history
    history = []
    for m in messages[-10:]:
        role = m.get("role", "user")
        content = m.get("content", "")
        history.append({"role": role, "parts": [content]})

    history.append({"role": "user", "parts": [user_text]})

    try:
        model = genai.GenerativeModel(GEMINI_MODEL)
        response = model.generate_content(history)
        reply = (response.text or "").strip()
    except Exception as e:
        app.logger.exception(f"Gemini chat error: {e}")
        return bad("Chat service failed")

    return ok({"reply": reply})


# -----------------------------
# Main
# -----------------------------
if __name__ == "__main__":
    port = int(os.getenv("PORT", "5001"))
    app.run(host="0.0.0.0", port=port, debug=True)