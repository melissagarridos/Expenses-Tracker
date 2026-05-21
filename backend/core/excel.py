import openpyxl
from collections import Counter
from datetime import datetime, date
from typing import Any


def get_sheet_names(file_path: str) -> list[dict[str, Any]]:
    wb = openpyxl.load_workbook(file_path, read_only=True)
    sheets = [{"name": name, "rows": wb[name].max_row} for name in wb.sheetnames]
    wb.close()
    return sheets


def parse_sheet(file_path: str, sheet_name: str) -> dict[str, Any]:
    wb = openpyxl.load_workbook(file_path)
    ws = wb[sheet_name]
    headers = [cell.value for cell in next(ws.iter_rows(max_row=1))]
    rows = []
    for row in ws.iter_rows(min_row=2, values_only=True):
        rows.append(dict(zip(headers, row)))
    wb.close()
    return {"headers": headers, "rows": rows, "total_rows": len(rows)}


def _detect_type(values: list) -> str:
    non_null = [v for v in values if v is not None]
    if not non_null:
        return "text"
    numeric = sum(1 for v in non_null if isinstance(v, (int, float)))
    if numeric / len(non_null) > 0.8:
        return "numeric"
    dates = sum(1 for v in non_null if isinstance(v, (datetime, date)))
    if dates / len(non_null) > 0.8:
        return "date"
    try:
        parsed = 0
        for v in non_null:
            float(v)
            parsed += 1
        if parsed / len(non_null) > 0.8:
            return "numeric"
    except (ValueError, TypeError):
        pass
    return "text"


_MONETARY_KEYS = {"monto", "valor", "precio", "costo", "total", "importe", "amount", "price", "cost", "saldo", "balance", "ingreso", "egreso"}
_CATEGORY_KEYS = {"categoria", "categoría", "category", "tipo", "type", "rubro", "rubro", "clase", "class"}
_DATE_KEYS = {"fecha", "date", "fecha"}


def compute_summary(headers: list[str], rows: list[dict]) -> dict[str, Any]:
    summary = {"total_rows": len(rows), "columns": [], "hints": {}}
    for header in headers:
        col_vals = [r.get(header) for r in rows]
        col_type = _detect_type(col_vals)
        non_null = [v for v in col_vals if v is not None]
        col_info = {"name": header, "type": col_type, "non_null": len(non_null), "nulls": len(rows) - len(non_null)}
        if col_type == "numeric":
            nums = []
            for v in col_vals:
                try:
                    nums.append(float(v))
                except (ValueError, TypeError):
                    pass
            if nums:
                col_info["min"] = round(min(nums), 2)
                col_info["max"] = round(max(nums), 2)
                col_info["sum"] = round(sum(nums), 2)
                col_info["avg"] = round(sum(nums) / len(nums), 2)
        elif col_type == "text":
            counts = Counter(str(v) for v in non_null)
            col_info["top"] = counts.most_common(10)
        summary["columns"].append(col_info)
        hl = header.lower().strip()
        if hl in _MONETARY_KEYS or any(k in hl for k in _MONETARY_KEYS):
            summary["hints"][header] = "monetary"
        elif hl in _CATEGORY_KEYS or any(k in hl for k in _CATEGORY_KEYS):
            summary["hints"][header] = "category"
        elif hl in _DATE_KEYS or any(k in hl for k in _DATE_KEYS):
            summary["hints"][header] = "date"
    return summary


def get_sample(rows: list[dict], n: int = 10) -> list[dict]:
    return rows[:n]
