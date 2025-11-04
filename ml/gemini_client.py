from dataclasses import dataclass
import os
from google import genai

@dataclass
class GeminiConfig:

    @classmethod
    def from_env(info):
        return info(
            api_key=os.getenv("GEMINI_API_KEY"),
            model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        )
    
class GeminiClient:
    def __init__(self):
        self.cfg = GeminiConfig.from_env()
        genai.configure(api_key=self.cfg.api_key)
        self.model = genai.GenerativeModel(self.cfg.model)