"""Optional task-summary service.

Next.js handles all CRUD. This service only computes read-only summary numbers.
It forwards the caller's Supabase access token, so Row Level Security still applies
and no service-role key is needed.
"""
import os
from datetime import datetime, timezone

import httpx
from fastapi import FastAPI, Header, HTTPException

app = FastAPI(title="TaskNest summary service")
SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY", "")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/summary")
async def summary(authorization: str = Header(...)):
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise HTTPException(500, "Service is not configured")
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(
            f"{SUPABASE_URL}/rest/v1/tasks?select=status,deadline",
            headers={"apikey": SUPABASE_ANON_KEY, "Authorization": authorization},
        )
    if r.status_code in (401, 403):
        raise HTTPException(401, "Invalid or expired token")
    if r.status_code != 200:
        raise HTTPException(502, "Could not load tasks")
    tasks = r.json()
    now = datetime.now(timezone.utc)
    overdue = sum(
        1 for t in tasks
        if t["deadline"] and t["status"] != "Completed"
        and datetime.fromisoformat(t["deadline"].replace("Z", "+00:00")) < now
    )
    done = sum(1 for t in tasks if t["status"] == "Completed")
    return {
        "total": len(tasks),
        "pending": sum(1 for t in tasks if t["status"] == "Pending"),
        "in_progress": sum(1 for t in tasks if t["status"] == "In Progress"),
        "completed": done,
        "overdue": overdue,
        "completion_percent": round(100 * done / len(tasks)) if tasks else 0,
    }
