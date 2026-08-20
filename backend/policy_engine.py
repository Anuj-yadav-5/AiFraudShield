"""
Policy Engine — converts ML risk scores into actionable security decisions.
Thresholds are configurable and represent prototype policies.
"""


class PolicyEngine:
    """Configurable policy engine for risk-based security decisions."""

    DEFAULT_THRESHOLDS = {
        "low_max": 30,
        "medium_max": 70,
    }

    def __init__(self, thresholds: dict = None):
        self.thresholds = thresholds or self.DEFAULT_THRESHOLDS

    def evaluate(self, risk_score: int) -> dict:
        """
        Evaluate a risk score and return the security decision.

        Args:
            risk_score: Integer from 0 to 100

        Returns:
            dict with risk_level and action
        """
        if risk_score <= self.thresholds["low_max"]:
            return {
                "risk_level": "Low",
                "action": "Allow",
                "description": "Transaction appears safe. No action required.",
                "color": "green",
            }
        elif risk_score <= self.thresholds["medium_max"]:
            return {
                "risk_level": "Medium",
                "action": "Warn",
                "description": "Transaction shows some suspicious indicators. User should verify before proceeding.",
                "color": "amber",
            }
        else:
            return {
                "risk_level": "High",
                "action": "Hold",
                "description": "Transaction is highly suspicious. Recommended to hold for review.",
                "color": "red",
            }


# Singleton instance with default thresholds
policy_engine = PolicyEngine()
