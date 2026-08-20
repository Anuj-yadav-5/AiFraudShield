"""
Prediction module — loads the trained model and returns risk assessments.
"""

import os
import numpy as np
import joblib

# ── Load model and scaler at module level ─────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "scaler.pkl")

model = None
scaler = None

FEATURE_COLUMNS = [
    "transaction_amount",
    "wallet_age_days",
    "transaction_frequency",
    "unique_recipients",
    "unique_senders",
    "avg_transaction_amount",
    "amount_deviation",
    "recipient_is_new",
    "rapid_transaction_flag",
    "suspicious_interaction_count",
]

FEATURE_NAMES = {
    "transaction_amount": "Unusual Transaction Amount",
    "wallet_age_days": "Recently Created Wallet",
    "transaction_frequency": "Abnormal Transaction Frequency",
    "unique_recipients": "High Number of Unique Recipients",
    "unique_senders": "Low Number of Unique Senders",
    "avg_transaction_amount": "Unusual Average Transaction Amount",
    "amount_deviation": "Amount Deviation from Normal",
    "recipient_is_new": "New Recipient",
    "rapid_transaction_flag": "Rapid Transaction Pattern",
    "suspicious_interaction_count": "Suspicious Interactions Detected",
}


def load_model():
    """Load the model and scaler from disk."""
    global model, scaler
    if model is None:
        model = joblib.load(MODEL_PATH)
        scaler = joblib.load(SCALER_PATH)


def predict(features: dict) -> dict:
    """
    Run fraud prediction on a single transaction.

    Args:
        features: dict with keys matching FEATURE_COLUMNS

    Returns:
        dict with risk_score, risk_level, action, and risk_factors
    """
    load_model()

    # Build feature vector in the correct order
    feature_vector = np.array([[features.get(col, 0) for col in FEATURE_COLUMNS]])

    # Scale
    feature_scaled = scaler.transform(feature_vector)

    # Predict probability of fraud
    fraud_prob = model.predict_proba(feature_scaled)[0][1]

    # Convert to 0–100 risk score
    risk_score = int(round(fraud_prob * 100))

    # Determine risk level and action
    if risk_score <= 30:
        risk_level = "Low"
        action = "Allow"
    elif risk_score <= 70:
        risk_level = "Medium"
        action = "Warn"
    else:
        risk_level = "High"
        action = "Hold"

    # ── Explainability: Compute per-feature risk contributions ────────
    # Use feature importances weighted by how far each feature is from
    # the "normal" (mean) values seen during training
    importances = model.feature_importances_

    # Z-scores represent how abnormal each feature value is
    mean = scaler.mean_
    std = scaler.scale_
    z_scores = np.abs((feature_vector[0] - mean) / (std + 1e-8))

    # Contribution = importance * z_score (how important AND how abnormal)
    contributions = importances * z_scores
    total = contributions.sum() + 1e-8
    contributions_pct = (contributions / total) * risk_score

    # Build risk factors list, sorted by contribution
    risk_factors = []
    sorted_idx = np.argsort(contributions_pct)[::-1]
    for i in sorted_idx:
        pct = contributions_pct[i]
        if pct >= 1:  # Only show factors contributing ≥ 1 point
            risk_factors.append({
                "feature": FEATURE_COLUMNS[i],
                "name": FEATURE_NAMES.get(FEATURE_COLUMNS[i], FEATURE_COLUMNS[i]),
                "contribution": round(float(pct), 1),
                "value": float(features.get(FEATURE_COLUMNS[i], 0)),
            })

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "action": action,
        "risk_factors": risk_factors,
        "fraud_probability": round(float(fraud_prob), 4),
    }
