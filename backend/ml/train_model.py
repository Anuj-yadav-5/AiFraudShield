"""
Train a Random Forest classifier for fraud detection.
Saves the trained model and scaler for use in the prediction module.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix,
)
import joblib
import os

# ── Feature columns ──────────────────────────────────────────────────────
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

TARGET = "is_fraud"

# ── Human-readable names for explainability ──────────────────────────────
FEATURE_NAMES = {
    "transaction_amount": "Transaction Amount",
    "wallet_age_days": "Wallet Age",
    "transaction_frequency": "Transaction Frequency",
    "unique_recipients": "Unique Recipients",
    "unique_senders": "Unique Senders",
    "avg_transaction_amount": "Average Transaction Amount",
    "amount_deviation": "Amount Deviation from Average",
    "recipient_is_new": "New Recipient",
    "rapid_transaction_flag": "Rapid Transaction Pattern",
    "suspicious_interaction_count": "Suspicious Interactions",
}


def main():
    # ── Load dataset ──────────────────────────────────────────────────────
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(base_dir, "..", "..", "dataset", "transactions.csv")
    dataset_path = os.path.normpath(dataset_path)

    print(f"Loading dataset from: {dataset_path}")
    df = pd.read_csv(dataset_path)
    print(f"Dataset shape: {df.shape}")
    print(f"Fraud ratio: {df[TARGET].mean()*100:.1f}%\n")

    X = df[FEATURE_COLUMNS]
    y = df[TARGET]

    # ── Train/test split ──────────────────────────────────────────────────
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # ── Scale features ────────────────────────────────────────────────────
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # ── Train model ───────────────────────────────────────────────────────
    print("Training Random Forest classifier...")
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=15,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train_scaled, y_train)

    # ── Evaluate ──────────────────────────────────────────────────────────
    y_pred = model.predict(X_test_scaled)
    y_prob = model.predict_proba(X_test_scaled)[:, 1]

    print("\n" + "=" * 50)
    print("MODEL EVALUATION")
    print("=" * 50)
    print(f"Accuracy:  {accuracy_score(y_test, y_pred):.4f}")
    print(f"Precision: {precision_score(y_test, y_pred):.4f}")
    print(f"Recall:    {recall_score(y_test, y_pred):.4f}")
    print(f"F1 Score:  {f1_score(y_test, y_pred):.4f}")
    print(f"\nClassification Report:\n{classification_report(y_test, y_pred)}")
    print(f"Confusion Matrix:\n{confusion_matrix(y_test, y_pred)}")

    # ── Feature importances ───────────────────────────────────────────────
    importances = model.feature_importances_
    sorted_idx = np.argsort(importances)[::-1]

    print("\n" + "=" * 50)
    print("FEATURE IMPORTANCES")
    print("=" * 50)
    for i in sorted_idx:
        name = FEATURE_NAMES.get(FEATURE_COLUMNS[i], FEATURE_COLUMNS[i])
        print(f"  {name:35s}: {importances[i]:.4f}")

    # ── Save model and scaler ─────────────────────────────────────────────
    model_path = os.path.join(base_dir, "model.pkl")
    scaler_path = os.path.join(base_dir, "scaler.pkl")

    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)

    print(f"\nModel saved to: {model_path}")
    print(f"Scaler saved to: {scaler_path}")
    print("\nTraining complete!")


if __name__ == "__main__":
    main()
