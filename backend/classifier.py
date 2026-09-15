"""
classifier.py

Intent Classifier engine for Apple Support queries.
Reads intent definitions from taxonomy.yaml and classifies customer messages
into one of the 8 taxonomy intents, returning confidence, escalation flag, and reason.
"""

import os
import yaml
import re
import config


class IntentClassifier:
    def __init__(self):
        self.taxonomy_path = os.path.join(config.BASE_DIR, "taxonomy.yaml")
        self.intents = self._load_taxonomy()

    def _load_taxonomy(self) -> list[dict]:
        if not os.path.exists(self.taxonomy_path):
            return []
        with open(self.taxonomy_path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
        return data.get("intents", [])

    def classify(self, message: str) -> dict:
        """
        Classifies a customer message into an intent category.
        Returns a dict:
        {
            "intent": "battery_issue",
            "confidence": 0.92,
            "escalate": False,
            "reason": "Customer mentions battery draining after update"
        }
        """
        text_lower = message.lower()

        # Rule & Heuristic Intent Matching
        if any(k in text_lower for k in ["battery", "draining", "drain", "dying", "charge", "power mode", "charging", "battery life"]):
            return {
                "intent": "battery_issue",
                "confidence": 0.95,
                "escalate": False,
                "reason": "Mentions battery performance, charging, or power drain."
            }

        if any(k in text_lower for k in ["storage", "full", "space", "memory", "gigabyte", "gb"]):
            return {
                "intent": "storage_management",
                "confidence": 0.94,
                "escalate": False,
                "reason": "Inquiry regarding device storage capacity or full disk errors."
            }

        if any(k in text_lower for k in ["apple id", "icloud", "password", "sign in", "login", "locked out", "account", "verification"]):
            return {
                "intent": "login_account",
                "confidence": 0.91,
                "escalate": True,
                "reason": "Account access or security authentication requires escalation to DM verification."
            }

        if any(k in text_lower for k in ["order", "ship", "delivery", "track", "tracking", "charge", "refund", "receipt", "billing", "bought", "purchase", "store"]):
            return {
                "intent": "order_billing_shipping",
                "confidence": 0.90,
                "escalate": False,
                "reason": "Inquiry regarding purchase orders, shipping status, or billing charges."
            }

        if any(k in text_lower for k in ["screen", "display", "crack", "shatter", "broken", "speaker", "mic", "microphone", "button", "overheating", "hot", "hardware", "camera"]):
            return {
                "intent": "device_hardware_issue",
                "confidence": 0.93,
                "escalate": True,
                "reason": "Physical hardware damage or thermal defect requires technician review or service DM."
            }

        if any(k in text_lower for k in ["update", "updating", "updated", "ios 11", "ios 10", "ios 12", "revert", "downgrade", "install"]):
            return {
                "intent": "update_problem",
                "confidence": 0.92,
                "escalate": False,
                "reason": "Relates to iOS software update installation or post-update behavior."
            }

        if any(k in text_lower for k in ["freeze", "freezing", "crash", "crashing", "siri", "keyboard", "autocorrect", "lag", "slow", "stutter", "restart", "glitch", "bug", "app"]):
            return {
                "intent": "software_bug",
                "confidence": 0.88,
                "escalate": False,
                "reason": "OS performance stutter, application crash, or UI feature bug."
            }

        return {
            "intent": "unclear_other",
            "confidence": 0.70,
            "escalate": False,
            "reason": "General customer query or unclassified inquiry."
        }


# Quick test interface
if __name__ == "__main__":
    classifier = IntentClassifier()
    test_msg = "My iPhone 6s battery dies so fast after iOS 11 update"
    res = classifier.classify(test_msg)
    print(f"Test Query: {test_msg!r}")
    print(f"Result: {res}")
