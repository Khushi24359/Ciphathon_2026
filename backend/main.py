from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import ScanRequest, ScanResponse
from services import analyze_exposure, ai_usernames_with_rules, run_sherlock

app = FastAPI(title="PersonaTrace API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/scan", response_model=ScanResponse)
def scan_endpoint(request: ScanRequest):
    return analyze_exposure(request.email, request.username, request.phone)

@app.post("/generate_usernames")
def generate_usernames_endpoint(request: dict):
    email = request.get("email")
    if not email: return {"error": "Missing email"}
    return {"usernames": ai_usernames_with_rules(email)}

@app.post("/run_pipeline")
def run_pipeline_endpoint(request: dict):
    username = request.get("username")
    if not username: return {"error": "Missing username"}
    try:
        profiles = run_sherlock(username)
        return {"username": username, "profiles": profiles, "found": len(profiles)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Backend is running without database"}

