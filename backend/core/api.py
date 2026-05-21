import openpyxl
import webview
from typing import Any
from backend.core.llm import LLMClient


class API:
    def __init__(self, llm_client: LLMClient):
        self._llm = llm_client

    def minimize_window(self) -> None:
        if webview.windows:
            webview.windows[0].minimize()

    def close_window(self) -> None:
        if webview.windows:
            webview.windows[0].destroy()

    def open_file_dialog(self) -> dict[str, Any]:
        try:
            result = webview.windows[0].create_file_dialog(
                webview.FileDialog.OPEN,
                allow_multiple=False,
                file_types=("Excel Files (*.xlsx;*.xls)",),
            )
            if result and len(result) > 0:
                return {"success": True, "path": result[0]}
            return {"success": False, "error": "No file selected"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def get_model_info(self) -> dict[str, str]:
        model = self._llm.ollama_model if self._llm.use_ollama else self._llm.nvidia_model
        return {"model": model}

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
            response = self._llm.generate(json_data)
            if response is None:
                return {"success": False, "error": "No response from LLM"}
            return {"success": True, "response": response}
        except Exception as e:
            return {"success": False, "error": str(e)}