import sqlite3
import json
from typing import Dict, Any, List

DB_FILE = "persona_trace.db"

def init_db():
    with sqlite3.connect(DB_FILE) as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS scan_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                risk_score INTEGER,
                risk_level TEXT,
                data TEXT
            )
        ''')
        conn.commit()

def save_scan(email: str, risk_score: int, risk_level: str, data: dict):
    with sqlite3.connect(DB_FILE) as conn:
        conn.execute(
            "INSERT INTO scan_history (email, risk_score, risk_level, data) VALUES (?, ?, ?, ?)",
            (email, risk_score, risk_level, json.dumps(data))
        )
        conn.commit()

def get_history() -> List[Dict[str, Any]]:
    with sqlite3.connect(DB_FILE) as conn:
        conn.row_factory = sqlite3.Row
        cur = conn.execute("SELECT id, email, (REPLACE(timestamp, ' ', 'T') || 'Z') as timestamp, risk_score, risk_level FROM scan_history ORDER BY id DESC LIMIT 50")
        rows = cur.fetchall()
        return [dict(row) for row in rows]
        
def get_scan(scan_id: int) -> Any:
    with sqlite3.connect(DB_FILE) as conn:
        conn.row_factory = sqlite3.Row
        cur = conn.execute("SELECT data FROM scan_history WHERE id = ?", (scan_id,))
        row = cur.fetchone()
        if row:
            return json.loads(row["data"])
    return None
