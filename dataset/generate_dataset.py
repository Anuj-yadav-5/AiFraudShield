"""
Synthetic Blockchain Transaction Dataset Generator
Generates a labeled dataset for training the FraudShield ML model.
All data is synthetic — not derived from real blockchain data.
"""

import pandas as pd
import numpy as np
import os

np.random.seed(42)

NUM_SAMPLES = 10000
FRAUD_RATIO = 0.15  # 15% fraud

num_fraud = int(NUM_SAMPLES * FRAUD_RATIO)
num_legit = NUM_SAMPLES - num_fraud


def generate_legit(n):
    """Generate legitimate transaction features."""
    return pd.DataFrame({
        "transaction_amount": np.random.exponential(scale=0.5, size=n).clip(0.001, 10),
        "wallet_age_days": np.random.randint(60, 1800, size=n),
        "transaction_frequency": np.random.randint(1, 50, size=n),
        "unique_recipients": np.random.randint(1, 30, size=n),
        "unique_senders": np.random.randint(1, 25, size=n),
        "avg_transaction_amount": np.random.exponential(scale=0.4, size=n).clip(0.001, 8),
        "amount_deviation": np.random.uniform(0, 2, size=n),
        "recipient_is_new": np.random.choice([0, 1], size=n, p=[0.7, 0.3]),
        "rapid_transaction_flag": np.random.choice([0, 1], size=n, p=[0.9, 0.1]),
        "suspicious_interaction_count": np.random.randint(0, 3, size=n),
        "is_fraud": 0,
    })


def generate_fraud(n):
    """Generate fraudulent transaction features with suspicious patterns."""
    return pd.DataFrame({
        "transaction_amount": np.random.exponential(scale=3.0, size=n).clip(0.5, 50),
        "wallet_age_days": np.random.randint(0, 30, size=n),
        "transaction_frequency": np.random.randint(20, 200, size=n),
        "unique_recipients": np.random.randint(10, 100, size=n),
        "unique_senders": np.random.randint(0, 5, size=n),
        "avg_transaction_amount": np.random.exponential(scale=2.5, size=n).clip(0.1, 40),
        "amount_deviation": np.random.uniform(2, 10, size=n),
        "recipient_is_new": np.random.choice([0, 1], size=n, p=[0.2, 0.8]),
        "rapid_transaction_flag": np.random.choice([0, 1], size=n, p=[0.3, 0.7]),
        "suspicious_interaction_count": np.random.randint(3, 20, size=n),
        "is_fraud": 1,
    })


def main():
    legit = generate_legit(num_legit)
    fraud = generate_fraud(num_fraud)

    df = pd.concat([legit, fraud], ignore_index=True)
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)

    # Add noise to make the boundary less clean
    noise_indices = np.random.choice(df.index, size=int(0.05 * len(df)), replace=False)
    df.loc[noise_indices, "recipient_is_new"] = 1 - df.loc[noise_indices, "recipient_is_new"]

    output_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(output_dir, "transactions.csv")
    df.to_csv(output_path, index=False)

    print(f"Dataset generated: {output_path}")
    print(f"Total samples: {len(df)}")
    print(f"Fraud samples: {df['is_fraud'].sum()} ({df['is_fraud'].mean()*100:.1f}%)")
    print(f"Legit samples: {len(df) - df['is_fraud'].sum()}")
    print(f"\nFeature columns: {list(df.columns[:-1])}")
    print(f"\nSample data:\n{df.head()}")


if __name__ == "__main__":
    main()
