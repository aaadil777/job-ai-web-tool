# backend/streamlit_app.py
import os
import requests
import pandas as pd
import streamlit as st

st.set_page_config("AI Job Hunter", layout="wide")

# --- Config & helpers ---
_raw = st.secrets.get("API_BASE", os.getenv("API_BASE", "")).strip()
API_BASE = _raw.rstrip("/") if _raw else ""
def _url(path: str) -> str:
    return f"{API_BASE}{path}" if path.startswith("/") else f"{API_BASE}/{path}"

def api_get(path, timeout=30):
    r = requests.get(_url(path), timeout=timeout); r.raise_for_status(); return r.json()

def api_post(path, json=None, files=None, timeout=90):
    r = requests.post(_url(path), json=json, files=files, timeout=timeout)
    r.raise_for_status(); return r.json()

st.title("AI Job Hunter")
st.caption("Search • Tailor • Apply • Track")

# --- Health ---
health_ok = False
if API_BASE:
    try:
        h = api_get("/api/health")
        health_ok = True
        st.success(f"API OK: {h}")
    except Exception as e:
        st.warning(f"API not reachable. Set API_BASE in secrets or .env. Error: {e}")
else:
    st.info("Set API_BASE in .streamlit/secrets.toml or export API_BASE for local dev.")

col1, col2 = st.columns([1, 1])

# --- Resume input ---
with col1:
    st.subheader("1) Resume")
    resume_txt = st.text_area("Paste resume text", height=220, placeholder="Paste raw text…")
    up = st.file_uploader("…or upload PDF/DOCX (best-effort text extraction)", type=["pdf", "doc", "docx"])
    save_disabled = not health_ok
    if st.button("Save resume", disabled=save_disabled):
        try:
            if resume_txt:
                res = api_post("/api/resumes", json={"text": resume_txt})
            elif up is not None:
                # Backend currently decodes bytes as UTF-8; real PDF/DOCX parsing can be added server-side later.
                res = api_post("/api/resumes", files={"file": (up.name, up.getvalue(), up.type)})
            else:
                st.error("Provide resume text or upload a file.")
                st.stop()
            st.session_state["resume_id"] = res.get("resume_id")
            st.success(f"Saved. resume_id={st.session_state['resume_id']}")
        except Exception as e:
            st.error(f"Save failed: {e}")

# --- Jobs input ---
with col2:
    st.subheader("2) Jobs")
    links = st.text_area(
        "Paste job links (one per line)",
        height=220,
        placeholder="https://boards.greenhouse.io/... \nhttps://jobs.lever.co/..."
    )
    find_disabled = not health_ok
    if st.button("Find roles", disabled=find_disabled):
        try:
            items = api_post("/api/jobs/search", json={
                "inputs": [s.strip() for s in links.splitlines() if s.strip()]
            })
            st.session_state["jobs"] = items.get("results", [])
            st.success(f"Found {len(st.session_state['jobs'])} roles")
        except Exception as e:
            st.error(f"Search failed: {e}")

st.divider()

# --- Results & recommend ---
jobs = st.session_state.get("jobs", [])
if jobs:
    st.subheader("3) Results")
    df = pd.DataFrame(jobs)
    if not df.empty:
        st.dataframe(df[["job_id", "title", "company", "location"]], use_container_width=True)

    select_ids = st.multiselect(
        "Select jobs to tailor",
        [j["job_id"] for j in jobs],
        format_func=lambda jid: next(
            (f"{j['title']} @ {j['company']}" for j in jobs if j["job_id"] == jid),
            str(jid)
        ),
    )

    gen_disabled = not (health_ok and select_ids and st.session_state.get("resume_id"))
    if st.button("Generate tailored materials", disabled=gen_disabled):
        try:
            out = api_post("/api/recommend", json={
                "resume_id": st.session_state["resume_id"],
                "job_ids": select_ids
            }, timeout=180)
            st.success("Generated")
            for r in out.get("results", []):
                with st.expander(f"{r['title']} — {r['company']} (score {r.get('score','?')})"):
                    st.write("Gaps:", r.get("gaps"))
                    st.write("Resume bullets:")
                    st.write("\n- " + "\n- ".join(r.get("resume_bullets", [])))
                    if r.get("cover_letter"):
                        st.code(r["cover_letter"])
        except Exception as e:
            st.error(f"Recommend failed: {e}")
else:
    st.info("Paste links and click Find roles to see results.")
