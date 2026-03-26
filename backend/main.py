from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import ScanRequest, ScanResponse
from services import analyze_exposure
import database

app = FastAPI(title="PersonaTrace API", description="Digital Exposure Risk Analyzer API")

# Allow CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    database.init_db()

@app.post("/scan", response_model=ScanResponse)
def scan_endpoint(request: ScanRequest):
    result = analyze_exposure(request.email, request.username, request.phone)
    # Save the scan securely off-band inside the local DB instance
    database.save_scan(request.email, result["risk_score"], result["risk_level"], result)
    return result

@app.get("/history")
def get_history_endpoint():
    return database.get_history()

@app.get("/history/{scan_id}", response_model=ScanResponse)
def get_history_scan_endpoint(scan_id: int):
    data = database.get_scan(scan_id)
    if data:
        return data
    return {"error": "not found"}

@app.get("/")
def read_root():
    return {"status": "ok", "message": "PersonaTrace API is running"}
