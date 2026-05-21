import requests
from openai import OpenAI
from typing import Optional


OLLAMA_BASE = "http://localhost:11434"
NVIDIA_BASE = "https://integrate.api.nvidia.com/v1"

FINANCIAL_PROMPT = """Analiza estos gastos mensuales y genera un reporte financiero detallado.

Datos:
{data}

Instrucciones:
- Idioma del reporte: {language}
- Moneda para mostrar los valores: {currency}
- Convierte todos los valores monetarios a {currency} si es necesario
- NO uses emojis en ninguna parte del reporte
- Genera: resumen financiero, categorías de gasto con sus valores en {currency}, recomendaciones y categoria con mayor gasto
- Para las categorias usa el formato: - NombreCategoria: ValorNumerico (sin simbolo de moneda, solo el numero)"""


class LLMClient:
    def __init__(self, use_ollama: bool, ollama_model: str, nvidia_model: str, nvidia_api_key: str):
        self.use_ollama = use_ollama
        self.ollama_model = ollama_model
        self.nvidia_model = nvidia_model
        self.nvidia_api_key = nvidia_api_key

    def generate(self, json_data: str, currency: str = "original", language: str = "español") -> Optional[str]:
        prompt = FINANCIAL_PROMPT.format(data=json_data, currency=currency, language=language)
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
        except Exception:
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
        except Exception:
            return None