from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class ScanRequest(BaseModel):
    email: str
    username: Optional[str] = None
    phone: Optional[str] = None

class ScanResponse(BaseModel):
    breach_status: bool
    breach_details: List[Dict[str, Any]]
    simulated_accounts: List[Dict[str, Any]]
    risk_score: int
    risk_level: str
    attack_insights: List[str]
    attack_narrative: List[str]
    recommendations: List[str]
    graph_data: Dict[str, List[Dict[str, Any]]]
    correlation_engine: Optional[Dict[str, Any]] = None
    platforms_probed: Optional[int] = 0
