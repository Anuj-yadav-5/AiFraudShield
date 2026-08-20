"""
Feature Engine — derives behavioral features from raw transaction input.
For the hackathon MVP, we simulate wallet lookups and behavioral analysis.
In production, these would query blockchain APIs and wallet databases.
"""

import hashlib
import random


def extract_features(
    sender_address: str,
    recipient_address: str,
    amount: float,
    sender_wallet_age: int = None,
    recipient_wallet_age: int = None,
) -> dict:
    """
    Extract behavioral features from transaction parameters.

    For the MVP, some features are derived deterministically from addresses
    (to produce consistent results) and some are provided by the user.

    Args:
        sender_address: Sender's wallet address
        recipient_address: Recipient's wallet address
        amount: Transaction amount in ETH
        sender_wallet_age: Days since sender wallet was created (optional)
        recipient_wallet_age: Days since recipient wallet was created (optional)

    Returns:
        Dictionary of features matching the ML model's expected input
    """
    # Use address hashes for deterministic pseudo-random feature generation
    sender_seed = int(hashlib.sha256(sender_address.lower().encode()).hexdigest(), 16)
    recipient_seed = int(hashlib.sha256(recipient_address.lower().encode()).hexdigest(), 16)

    rng_sender = random.Random(sender_seed)
    rng_recipient = random.Random(recipient_seed)

    # ── Wallet age ────────────────────────────────────────────────────────
    # Use provided values or derive from address
    wallet_age = recipient_wallet_age if recipient_wallet_age is not None else rng_recipient.randint(1, 500)

    # ── Transaction frequency (recipient) ─────────────────────────────────
    transaction_frequency = rng_recipient.randint(1, 150)

    # ── Unique counterparties ─────────────────────────────────────────────
    unique_recipients = rng_sender.randint(1, 50)
    unique_senders = rng_recipient.randint(0, 30)

    # ── Average transaction amount ────────────────────────────────────────
    avg_amount = rng_recipient.uniform(0.01, 5.0)

    # ── Amount deviation ──────────────────────────────────────────────────
    amount_deviation = abs(amount - avg_amount) / (avg_amount + 0.01)

    # ── Recipient novelty ─────────────────────────────────────────────────
    # Deterministic based on the pair of addresses
    pair_seed = int(hashlib.sha256(
        (sender_address + recipient_address).lower().encode()
    ).hexdigest(), 16)
    recipient_is_new = 1 if (pair_seed % 100) > 40 else 0

    # ── Rapid transaction flag ────────────────────────────────────────────
    rapid_transaction_flag = 1 if transaction_frequency > 80 else 0

    # ── Suspicious interactions ───────────────────────────────────────────
    suspicious_interaction_count = rng_recipient.randint(0, 15)

    return {
        "transaction_amount": round(amount, 6),
        "wallet_age_days": wallet_age,
        "transaction_frequency": transaction_frequency,
        "unique_recipients": unique_recipients,
        "unique_senders": unique_senders,
        "avg_transaction_amount": round(avg_amount, 6),
        "amount_deviation": round(amount_deviation, 6),
        "recipient_is_new": recipient_is_new,
        "rapid_transaction_flag": rapid_transaction_flag,
        "suspicious_interaction_count": suspicious_interaction_count,
    }
