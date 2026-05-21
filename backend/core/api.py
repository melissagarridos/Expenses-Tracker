import os
import json
import markdown
import webview
from typing import Any
from backend.core.llm import LLMClient
from backend.core import excel, database

_CACHE: dict[str, Any] = {}


class API:
    def __init__(self, llm_client: LLMClient):
        self._llm = llm_client
        database.init_db()

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

    def get_provider(self) -> dict[str, Any]:
        return {"ollama": self._llm.use_ollama, "provider": "ollama" if self._llm.use_ollama else "nvidia"}

    def get_sheet_names(self, file_path: str) -> dict[str, Any]:
        try:
            sheets = excel.get_sheet_names(file_path)
            return {"success": True, "sheets": sheets}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def process_sheet(self, file_path: str, sheet_name: str) -> dict[str, Any]:
        try:
            parsed = excel.parse_sheet(file_path, sheet_name)
            summary = excel.compute_summary(parsed["headers"], parsed["rows"])
            sample = excel.get_sample(parsed["rows"])
            filename = os.path.basename(file_path)
            _CACHE["current"] = {
                "headers": parsed["headers"],
                "rows": parsed["rows"],
                "summary": summary,
                "sample": sample,
                "filename": filename,
                "sheet": sheet_name,
            }
            return {
                "success": True,
                "summary": summary,
                "sample": sample,
                "headers": parsed["headers"],
                "total_rows": parsed["total_rows"],
                "filename": filename,
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    def generate_report(self, filename: str, currency: str = "original", language: str = "Español") -> dict[str, Any]:
        try:
            cached = _CACHE.get("current")
            if not cached or cached.get("filename") != filename:
                return {"success": False, "error": "No data loaded. Select a sheet first."}

            payload = {
                "summary": cached["summary"],
                "sample": cached["sample"],
                "rows": cached["rows"] if len(cached["rows"]) <= 500 else [],
                "all_rows": cached["rows"],
            }

            raw_md = self._llm.generate(json.dumps(payload), currency=currency, language=language)
            if raw_md is None:
                return {"success": False, "error": "No response from LLM"}

            html = markdown.markdown(raw_md, extensions=["nl2br", "sane_lists"])
            database.save_report(filename, currency, language, raw_md, html)
            return {"success": True, "html": html, "raw_md": raw_md}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def get_history(self) -> dict[str, Any]:
        try:
            items = database.get_history()
            return {"success": True, "items": items}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def get_report(self, report_id: int) -> dict[str, Any]:
        try:
            row = database.get_report(report_id)
            if not row:
                return {"success": False, "error": "Report not found"}
            return {"success": True, **row}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def delete_report(self, report_id: int) -> dict[str, Any]:
        try:
            database.delete_report(report_id)
            return {"success": True}
        except Exception as e:
            return {"success": False, "error": str(e)}
