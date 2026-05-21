import json
import requests
import webview
import openpyxl
from typing import Any


class API:
    def minimize_window(self) -> None:
        if webview.windows:
            webview.windows[0].minimize()

    def close_window(self) -> None:
        if webview.windows:
            webview.windows[0].destroy()

    def process_excel(self, file_path: str) -> dict[str, Any]:
        try:
            wb = openpyxl.load_workbook(file_path)
            ws = wb.active
            headers = [cell.value for cell in next(ws.iter_rows(max_row=1))]
            rows = []
            for row in ws.iter_rows(min_row=2, values_only=True):
                rows.append(dict(zip(headers, row)))
            return {"success": True, "data": rows}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def generate_report(self, json_data: str) -> dict[str, Any]:
        try:
            response = requests.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "phi3",
                    "prompt": f"""
Analiza estos gastos mensuales:

{json_data}

Genera:
- resumen financiero
- recomendaciones
- categoría con mayor gasto
""",
                    "stream": False,
                },
                timeout=120,
            )
            data = response.json()
            return {"success": True, "response": data.get("response", "")}
        except Exception as e:
            return {"success": False, "error": str(e)}