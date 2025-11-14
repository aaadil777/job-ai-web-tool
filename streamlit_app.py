# streamlit_app.py  (or backend/streamlit_app.py depending on your repo layout)

import os
from typing import List, Dict, Any

import requests
import pandas as pd
import streamlit as st

# Optional: load .env for local dev
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

# -------------------------------------------------
# Page config
# -------------------------------------------------
st.set_page_config(page_title="AI Job Hunter", layout="wide")

st.title("AI Job Hunter")
st.caption("Search • Tailor • Apply • Track")

# -------------------------------------------------
# Config & helpers
# -------------------------------------------------

# Prefer Streamlit secrets, then fall back to environment
_raw_api_base = (st.secrets.get("API_BASE", None) or os.getenv("API_BASE", "")).strip()
API_BASE = _raw_api_base.rstrip("/") if _raw_api_base else ""

def _url(path: str) -> str:
    """Join API_BASE with a relative or absolute path."""
    if not API_BASE:
        raise RuntimeError("API_BASE is not configured.")
    if path.startswith("/"):
        return f"{API_BASE}{path}"
    return f"{API_BASE}/{path}"

def api_get(path: str, timeout: int = 30) -> Any:
    r = requests.get(_url(path), timeout=timeout)
    r.raise_for_status()
    return r.json()

def api_post(path: str, json: Dict | None = None,
             files: Dict | None = None, timeout: int = 90) -> Any:
    r = requests.post(_url(path), json=json, files=files, timeout=timeout)
    r.raise_for_status()
    return r.json()

# -------------------------------------------------
# Health check banner
# -------------------------------------------------
health_ok = False

if API_BASE:
    try:
        health = api_get("/api/health")
        health_ok = True
        st.success(f"API OK: {health}")
    except Exception as e:
        st.warning(
            "API not reachable. Check that your Flask backend on Render is live "
            f"and that API_BASE is correct. Error: {e}"
        )
else:
    st.info(
        "API_BASE is not set. Add API_BASE to .streamlit/secrets.toml "
        "or as an environment variable for local dev."
    )

# -------------------------------------------------
# Layout
# -------------------------------------------------
col1, col2 = st.columns(2)

# ------------------ Resume input -----------------
with col1:
    st.subheader("1) Resume")

    resume_txt = st.text_area(
        "Paste resume text",
        height=220,
        placeholder="Paste raw text…"
    )

    uploaded_file = st.file_uploader(
        "…or upload PDF/DOCX (best-effort text extraction)",
        type=["pdf", "doc", "docx"]
    )

    save_disabled = not health_ok

    if st.button("Save resume", disabled=save_disabled):
        try:
            if resume_txt:
                # JSON body path
                res = api_post(
                    "/api/resumes",
                    json={"text": resume_txt},
                )
            elif uploaded_file is not None:
                # File upload path
                res = api_post(
                    "/api/resumes",
                    files={
                        "file": (
                            uploaded_file.name,
                            uploaded_file.getvalue(),
                            uploaded_file.type,
                        )
                    },
                )
            else:
                st.error("Provide resume text or upload a file.")
                st.stop()

            st.session_state["resume_id"] = res.get("resume_id")
            st.success(f"Saved resume. id={st.session_state['resume_id']}")
        except Exception as e:
            st.error(f"Save failed: {e}")

# ------------------ Jobs input -------------------
with col2:
    st.subheader("2) Jobs")

    links_raw = st.text_area(
        "Paste job links (one per line)",
        height=220,
        placeholder=(
            "https://boards.greenhouse.io/...\n"
            "https://jobs.lever.co/...\n"
            "Or a plain-text query like: data analyst chicago"
        ),
    )

    find_disabled = not health_ok

    if st.button("Find roles", disabled=find_disabled):
        try:
            inputs: List[str] = [
                s.strip() for s in links_raw.splitlines() if s.strip()
            ]
            if not inputs:
                st.error("Add at least one link or query.")
                st.stop()

            payload = {"inputs": inputs}
            resp = api_post("/api/jobs/search", json=payload)
            st.session_state["jobs"] = resp.get("results", [])
            total = resp.get("total_results") or resp.get("totalResults")
            st.success(
                f"Found {len(st.session_state['jobs'])} roles "
                + (f"(Adzuna total: {total})" if total is not None else "")
            )
        except Exception as e:
            st.error(f"Search failed: {e}")

st.divider()

# -------------------------------------------------
# Results & recommendation
# -------------------------------------------------
jobs: List[Dict[str, Any]] = st.session_state.get("jobs", [])

if not jobs:
    st.info("Paste links and click **Find roles** to see results.")
    st.stop()

st.subheader("3) Results")

df = pd.DataFrame(jobs)
if not df.empty:
    # Show a compact table of core job info
    cols_to_show = [c for c in ["job_id", "title", "company", "location", "experience_level", "type"] if c in df.columns]
    st.dataframe(df[cols_to_show], use_container_width=True)

# Multiselect by job_id with label mapping
job_id_options = [j["job_id"] for j in jobs]

def _label_for_job(jid: int | str) -> str:
    for j in jobs:
        if j["job_id"] == jid:
            name = j.get("title") or "Unknown title"
            comp = j.get("company") or "Unknown company"
            return f"{name} @ {comp}"
    return str(jid)

selected_ids = st.multiselect(
    "Select jobs to tailor",
    options=job_id_options,
    format_func=_label_for_job,
)

can_generate = bool(
    health_ok and selected_ids and st.session_state.get("resume_id")
)

if st.button("Generate tailored materials", disabled=not can_generate):
    try:
        payload = {
            "resume_id": st.session_state["resume_id"],
            "job_ids": selected_ids,
        }
        resp = api_post("/api/recommend", json=payload, timeout=180)

        st.success("Tailored materials generated.")
        for r in resp.get("results", []):
            title = r.get("title", "Unknown role")
            company = r.get("company", "Unknown company")
            score = r.get("score", "?")
            header = f"{title} — {company} (score {score})"

            with st.expander(header):
                if r.get("matched_skills"):
                    st.write("Matched skills:", ", ".join(r["matched_skills"]))
                if r.get("gaps"):
                    st.write("Skill gaps:", ", ".join(r["gaps"]))
                if r.get("resume_bullets"):
                    st.markdown(
                        "**Suggested resume bullets:**\n\n"
                        + "\n".join(f"- {b}" for b in r["resume_bullets"])
                    )
                if r.get("cover_letter"):
                    st.markdown("**Cover letter draft:**")
                    st.code(r["cover_letter"])
    except Exception as e:
        st.error(f"Recommend failed: {e}")