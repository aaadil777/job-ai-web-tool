# backend/chat_api.py
"""
Gemini chat blueprint

POST /api/chat
Body:
{
  "messages": [
    {"role": "system", "content": "You are a helpful job search assistant."},
    {"role": "user", "content": "Rewrite my resume bullet for SQL."}
  ],
  "temperature": 0.2,
  "max_output_tokens": 1024,
  "model": "gemini-1.5-flash"   # optional override
}

Response:
  {"text": "<assistant reply>"}
"""

import os
from flask import Blueprint, request, jsonify

# pip install google-generativeai
import google.generativeai as genai

chat_bp = Blueprint("chat_bp", __name__)

def _init_model(model_override: str | None = None):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is not set. Add it to your environment or Streamlit secrets."
        )
    genai.configure(api_key=api_key)
    model_name = model_override or os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    return genai.GenerativeModel(model_name)

def _to_gemini_contents(messages):
    """
    Convert OpenAI-style {role, content} list into Gemini 'contents'.
    - user/system -> role='user'
    - assistant -> role='model'
    """
    contents = []
    for m in messages or []:
        role = m.get("role", "user")
        text = m.get("content", "")
        if not isinstance(text, str) or not text.strip():
            continue
        g_role = "user" if role in ("user", "system") else "model"
        contents.append({"role": g_role, "parts": [text]})
    # ensure at least one user message
    if not contents:
        contents = [{"role": "user", "parts": ["Hello"]}]
    return contents

@chat_bp.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json(force=True) or {}
    messages = data.get("messages", [])
    temperature = float(data.get("temperature", 0.2))
    max_tokens = int(data.get("max_output_tokens", 1024))
    model_override = data.get("model")

    try:
        model = _init_model(model_override)
        contents = _to_gemini_contents(messages)

        resp = model.generate_content(
            contents,
            generation_config={
                "temperature": temperature,
                "max_output_tokens": max_tokens,
            },
        )
        # `resp.text` is the plain text answer
        return jsonify({"text": getattr(resp, "text", "") or ""})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
