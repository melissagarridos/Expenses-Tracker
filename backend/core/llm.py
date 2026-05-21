import json
import re
import requests
from openai import OpenAI
from typing import Any, Optional
from backend.core.sandbox import execute as sandbox_execute

OLLAMA_BASE = "http://localhost:11434"
NVIDIA_BASE = "https://integrate.api.nvidia.com/v1"

_SUMMARY_PROMPT = """Eres un asistente de analisis financiero.

Resumen de datos:
{summary}

Primeras filas (muestra):
{sample}

Instrucciones:
- Genera un reporte financiero detallado en markdown
- Incluye: resumen ejecutivo, desglose por categorias, recomendaciones y categoria con mayor gasto
- NO uses emojis
- Idioma: {language}
- Moneda para los valores: {currency}

Para calculos adicionales puedes usar bloques de codigo Python con esta estructura exacta:

```python
# data es un dict: cada columna es una lista de valores
# Ej: data["Monto"] = [1500.0, 2300.0, ...], data["Categoria"] = ["Almuerzo", ...]
# print() muestra el resultado del calculo

total = sum(data["Monto"])
print(f"Total gastado: {total}")
```

Funciones disponibles unicamente:
sum, max, min, len, sorted, round, float, int, str, list, dict, tuple, set, bool, range, enumerate, zip, map, filter, any, all, isinstance, abs, pow, reversed, slice

No uses imports. No definas clases. No uses yield, async, await. Solo aritmetica, listas/dicts y comprehensions."""


def _process_code_blocks(text: str, data: dict) -> str:
    def replacer(match):
        code = match.group(1).strip()
        comment = f"```python\n{code}\n```"
        result = sandbox_execute(code, data)
        if result.startswith("Error:"):
            return f"{comment}\n> {result}"
        return f"{comment}\n> Resultado:\n{result}\n"
    return re.sub(r"```python\n(.*?)```", replacer, text, flags=re.DOTALL)


class LLMClient:
    def __init__(self, use_ollama: bool, ollama_model: str, nvidia_model: str, nvidia_api_key: str):
        self.use_ollama = use_ollama
        self.ollama_model = ollama_model
        self.nvidia_model = nvidia_model
        self.nvidia_api_key = nvidia_api_key

    def generate(self, json_data: str, currency: str = "original", language: str = "español") -> Optional[str]:
        parsed = json.loads(json_data)
        summary = parsed.get("summary", {})
        sample = parsed.get("sample", [])
        rows = parsed.get("rows", [])
        data_dict = self._rows_to_columns(rows) if rows else {}

        prompt = _SUMMARY_PROMPT.format(
            summary=json.dumps(summary, indent=2, ensure_ascii=False),
            sample=json.dumps(sample, indent=2, ensure_ascii=False),
            currency=currency,
            language=language,
        )

        if self.use_ollama:
            raw = self._ollama_generate(prompt)
        else:
            raw = self._nvidia_generate(prompt)

        if raw is None:
            return None

        return _process_code_blocks(raw, data_dict)

    def _rows_to_columns(self, rows: list[dict]) -> dict[str, list]:
        if not rows:
            return {}
        cols = {k: [] for k in rows[0]}
        for r in rows:
            for k in cols:
                cols[k].append(r.get(k))
        return cols

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
