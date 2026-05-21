import requests
from openai import OpenAI
from typing import Optional


OLLAMA_BASE = "http://localhost:11434"
NVIDIA_BASE = "https://integrate.api.nvidia.com/v1"
FINANCIAL_PROMPT = """Analiza estos gastos mensuales:

{data}

Genera:
- resumen financiero
- recomendaciones
- categoría con mayor gasto"""


class LLMClient:
    def __init__(self, use_ollama: bool, ollama_model: str, nvidia_model: str, nvidia_api_key: str):
        self.use_ollama = use_ollama
        self.ollama_model = ollama_model
        self.nvidia_model = nvidia_model
        self.nvidia_api_key = nvidia_api_key

    def generate(self, json_data: str) -> Optional[str]:
        prompt = FINANCIAL_PROMPT.format(data=json_data)
        if self.use_ollama:
            return self._ollama_generate(prompt)
        return self._nvidia_generate(prompt)

    def _ollama_generate(self, prompt: str) -> Optional[str]:
        try:
            resp = requests.post(
                f"{OLLAMA_BASE}/api/generate",
                json={"model": self.ollama_model, "prompt": prompt, "stream": False},
                timeout=120,
            )
            return resp.json().get("response", "")
        except Exception as e:
            return None

    def _nvidia_generate(self, prompt: str) -> Optional[str]:
        try:
            client = OpenAI(base_url=NVIDIA_BASE, api_key=self.nvidia_api_key)
            completion = client.chat.completions.create(
                model=self.nvidia_model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                top_p=0.8,
                max_tokens=4096,
                stream=False,
            )
            return completion.choices[0].message.content
        except Exception as e:
            return None