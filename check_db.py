import sqlite3
import os

DB_FILE = "backend/persona_trace.db"
if os.path.exists(DB_FILE):
    with sqlite3.connect(DB_FILE) as conn:
        cur = conn.execute("SELECT timestamp FROM scan_history ORDER BY id DESC LIMIT 5")
        rows = cur.fetchall()
        for r in rows:
            print(f"Timestamp in DB: {r[0]}")
else:
    print(f"{DB_FILE} not found")
