"""
FraudShield FastAPI Backend
Main API server for transaction risk analysis, batch processing, watchlists, and policy simulations.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import uuid
import time

from feature_engine import extract_features
from ml.predict import predict
from policy_engine import policy_engine, PolicyEngine

# ── App setup ─────────────────────────────────────────────────────────────
app = FastAPI(
    title="FraudShield API",
    description="AI-powered fraud detection & security engine for Web3 transactions",
    version="1.1.0",
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Mock Watchlist Database ───────────────────────────────────────────────
INITIAL_WATCHLIST = [
    {
        "address": "0xDEADBEEF00000000000000000000000000000001",
        "category": "Inferno Drainer Phishing",
        "risk_level": "High",
        "reported_date": "2026-08-15",
        "reports_count": 42,
        "status": "Verified Malicious",
    },
    {
        "address": "0x8888888888888888888888888888888888888888",
        "category": "Tornado Cash Privacy Mixer",
        "risk_level": "High",
        "reported_date": "2026-08-10",
        "reports_count": 128,
        "status": "Sanctioned Entity",
    },
    {
        "address": "0x9999999999999999999999999999999999999999",
        "category": "Fake Uniswap Permit2 Drainer",
        "risk_level": "High",
        "reported_date": "2026-08-18",
        "reports_count": 19,
        "status": "Verified Malicious",
    },
    {
        "address": "0x3333333333333333333333333333333333333333",
        "category": "Suspicious Rapid Counterparty",
        "risk_level": "Medium",
        "reported_date": "2026-08-19",
        "reports_count": 5,
        "status": "Under Investigation",
    },
]

watchlist_db = list(INITIAL_WATCHLIST)


# ── Models ────────────────────────────────────────────────────────────────
class TransactionRequest(BaseModel):
    sender_address: str = Field(..., description="Sender wallet address")
    recipient_address: str = Field(..., description="Recipient wallet address")
    amount: float = Field(..., gt=0, description="Transaction amount in ETH")
    sender_wallet_age: Optional[int] = Field(None, ge=0, description="Sender wallet age in days")
    recipient_wallet_age: Optional[int] = Field(None, ge=0, description="Recipient wallet age in days")


class BatchAnalyzeRequest(BaseModel):
    transactions: List[TransactionRequest]


class WatchlistReportRequest(BaseModel):
    address: str
    category: str
    description: Optional[str] = None


class PolicySimulateRequest(BaseModel):
    low_max: int = Field(30, ge=5, le=50)
    medium_max: int = Field(70, ge=31, le=95)
    sample_risk_scores: Optional[List[int]] = None


class RiskFactor(BaseModel):
    feature: str
    name: str
    contribution: float
    value: float


class AnalysisResponse(BaseModel):
    tx_id: str
    sender_address: str
    recipient_address: str
    amount: float
    risk_score: int
    risk_level: str
    action: str
    description: str
    risk_factors: list[RiskFactor]
    fraud_probability: float
    features: dict
    timestamp: int


# ── Endpoints ─────────────────────────────────────────────────────────────

@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "FraudShield API", "version": "1.1.0"}


@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_transaction(request: TransactionRequest):
    """Analyze a single crypto transaction for fraud risk."""
    try:
        tx_id = f"FS-{uuid.uuid4().hex[:12].upper()}"

        features = extract_features(
            sender_address=request.sender_address,
            recipient_address=request.recipient_address,
            amount=request.amount,
            sender_wallet_age=request.sender_wallet_age,
            recipient_wallet_age=request.recipient_wallet_age,
        )

        prediction = predict(features)
        policy = policy_engine.evaluate(prediction["risk_score"])

        return AnalysisResponse(
            tx_id=tx_id,
            sender_address=request.sender_address,
            recipient_address=request.recipient_address,
            amount=request.amount,
            risk_score=prediction["risk_score"],
            risk_level=prediction["risk_level"],
            action=prediction["action"],
            description=policy["description"],
            risk_factors=prediction["risk_factors"],
            fraud_probability=prediction["fraud_probability"],
            features=features,
            timestamp=int(time.time()),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


# ── FEATURE 1: BATCH SCANNED TRANSACTIONS API ─────────────────────────────

@app.post("/api/batch-analyze")
async def batch_analyze(request: BatchAnalyzeRequest):
    """
    Feature 1: Process multiple transactions at once for institutional/exchange compliance.
    """
    results = []
    total_amount = 0.0
    high_risk_count = 0

    for req in request.transactions:
        tx_id = f"FS-{uuid.uuid4().hex[:12].upper()}"
        features = extract_features(
            sender_address=req.sender_address,
            recipient_address=req.recipient_address,
            amount=req.amount,
            sender_wallet_age=req.sender_wallet_age,
            recipient_wallet_age=req.recipient_wallet_age,
        )
        prediction = predict(features)
        policy = policy_engine.evaluate(prediction["risk_score"])

        if prediction["risk_level"] == "High":
            high_risk_count += 1
        total_amount += req.amount

        results.append({
            "tx_id": tx_id,
            "sender_address": req.sender_address,
            "recipient_address": req.recipient_address,
            "amount": req.amount,
            "risk_score": prediction["risk_score"],
            "risk_level": prediction["risk_level"],
            "action": prediction["action"],
            "description": policy["description"],
            "risk_factors": prediction["risk_factors"],
            "timestamp": int(time.time()),
        })

    return {
        "batch_size": len(results),
        "total_amount_eth": round(total_amount, 4),
        "high_risk_count": high_risk_count,
        "results": results,
    }


# ── FEATURE 2: MALICIOUS ADDRESS WATCHLIST & REPORTING ───────────────────

@app.get("/api/watchlist")
async def get_watchlist():
    """Feature 2: Retrieve real-time list of malicious, drainer & scam addresses."""
    return {"watchlist": watchlist_db, "count": len(watchlist_db)}


@app.post("/api/watchlist/report")
async def report_address(report: WatchlistReportRequest):
    """Feature 2: Submit a suspicious address to the community threat DB."""
    # Check if address exists
    for item in watchlist_db:
        if item["address"].lower() == report.address.lower():
            item["reports_count"] += 1
            return {"status": "updated", "entry": item}

    new_entry = {
        "address": report.address,
        "category": report.category,
        "risk_level": "High",
        "reported_date": time.strftime("%Y-%m-%d"),
        "reports_count": 1,
        "status": "Under Investigation",
    }
    watchlist_db.insert(0, new_entry)
    return {"status": "reported", "entry": new_entry}


# ── FEATURE 3: POLICY THRESHOLD SIMULATOR ─────────────────────────────────

@app.post("/api/policy/simulate")
async def simulate_policy(req: PolicySimulateRequest):
    """
    Feature 3: Custom policy simulator allowing dApps/exchanges to configure custom thresholds.
    """
    custom_engine = PolicyEngine(thresholds={"low_max": req.low_max, "medium_max": req.medium_max})
    sample_scores = req.sample_risk_scores or [15, 35, 55, 75, 90]

    simulated_results = []
    for score in sample_scores:
        evaluation = custom_engine.evaluate(score)
        simulated_results.append({
            "risk_score": score,
            "risk_level": evaluation["risk_level"],
            "action": evaluation["action"],
            "description": evaluation["description"],
        })

    return {
        "configured_thresholds": {
            "low_range": f"0 – {req.low_max}",
            "medium_range": f"{req.low_max + 1} – {req.medium_max}",
            "high_range": f"{req.medium_max + 1} – 100",
        },
        "simulation": simulated_results,
    }


@app.get("/api/policy")
async def get_policy():
    """Return current default policy thresholds."""
    return {
        "thresholds": policy_engine.thresholds,
        "levels": [
            {"range": "0-30", "level": "Low", "action": "Allow"},
            {"range": "31-70", "level": "Medium", "action": "Warn / Verify"},
            {"range": "71-100", "level": "High", "action": "Hold / Review"},
        ],
    }
