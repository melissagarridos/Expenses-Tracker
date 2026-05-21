import sqlite3
import os
from datetime import datetime
from typing import Any, Optional

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "database", "history.db")


def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            currency TEXT NOT NULL,
            language TEXT NOT NULL,
            raw_md TEXT NOT NULL,
            html TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()


def save_report(filename: str, currency: str, language: str, raw_md: str, html: str):
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        "INSERT INTO reports (filename, currency, language, raw_md, html, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        (filename, currency, language, raw_md, html, datetime.now().isoformat())
    )
    conn.commit()
    conn.close()


def get_history() -> list[dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute(
        "SELECT id, filename, currency, language, created_at FROM reports ORDER BY created_at DESC LIMIT 50"
    ).fetchall()
    conn.close()
    return [
        {"id": r[0], "filename": r[1], "currency": r[2], "language": r[3], "created_at": r[4]}
        for r in rows
    ]


def get_report(report_id: int) -> Optional[dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    row = conn.execute(
        "SELECT id, filename, currency, language, raw_md, html, created_at FROM reports WHERE id = ?",
        (report_id,)
    ).fetchone()
    conn.close()
    if not row:
        return None
    return {
        "id": row[0], "filename": row[1], "currency": row[2],
        "language": row[3], "raw_md": row[4], "html": row[5], "created_at": row[6]
    }


def delete_report(report_id: int) -> bool:
    conn = sqlite3.connect(DB_PATH)
    conn.execute("DELETE FROM reports WHERE id = ?", (report_id,))
    conn.commit()
    conn.close()
    return True
