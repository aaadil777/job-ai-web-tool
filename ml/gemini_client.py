from dataclasses import dataclass
import os
from dotenv import load_dotenv
import google.generativeai as genai

@dataclass
class GeminiConfig:
    
    api_key: str | None = None
    model: str = "gemini-2.5-flash"

    @classmethod
    def from_env(info):
        load_dotenv()
        return info(
            api_key=os.getenv("GEMINI_API_KEY"),
            model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        )
    
class GeminiClient:
    def __init__(self):
        self.cfg = GeminiConfig.from_env()
        genai.configure(api_key=self.cfg.api_key)
        self.model = genai.GenerativeModel(self.cfg.model)

    def generate(self, prompt, system):
        parts = []
        if system:
            parts.append({"role":"model", "parts": [system]})
        parts.append({"role":"user", "parts": [prompt]})
        resp = self.model.generate_content(parts)
        return resp.text.strip()