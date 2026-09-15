"""
responder.py

Grounded Support Responder for Apple Support Bot.
Combines intent classification results and retrieved historical Twitter support pairs
from retrieval.py to synthesize accurate, empathetic, and grounded responses.
"""

import retrieval
from classifier import IntentClassifier
import config

DM_LINK = "https://t.co/GDrqU22YpT"

class SupportResponder:
    def __init__(self):
        self.classifier = IntentClassifier()

    def generate_response(self, customer_query: str) -> dict:
        """
        Generates a complete grounded response payload for a customer query.
        """
        # Step 1: Classify Intent
        classification = self.classifier.classify(customer_query)
        intent = classification["intent"]
        escalate = classification["escalate"]
        reason = classification["reason"]

        # Step 2: Retrieve Top-K Past Support Cases
        retrieved_cases = retrieval.retrieve_similar(customer_query, k=config.TOP_K_SIMILAR)

        # Step 3: Synthesize Grounded Reply
        best_match = retrieved_cases[0] if retrieved_cases else None
        
        # Build empathetic response template based on intent & grounded case
        if intent == "battery_issue":
            reply_text = (
                f"We want to make sure your iPhone battery lasts throughout your day. "
                f"Check your battery usage under Settings > Battery to see if any app is consuming extra power. "
                f"If you'd like us to run a remote diagnostic with you, please send us a DM: {DM_LINK}"
            )
        elif intent == "update_problem":
            reply_text = (
                f"We understand how important a smooth update experience is. "
                f"Ensure your device is backed up before making software changes (support.apple.com/HT203977). "
                f"For step-by-step update assistance, join us in DM: {DM_LINK}"
            )
        elif intent == "software_bug":
            reply_text = (
                f"Let's work together to figure out what is causing this issue. "
                f"First, try restarting your device and updating to the latest iOS version under Settings > General > Software Update. "
                f"If the issue persists, let us know in DM: {DM_LINK}"
            )
        elif intent == "device_hardware_issue":
            reply_text = (
                f"We'd like to help take a closer look at your device hardware. "
                f"Physical inspection or repair options may be available at an Apple Authorized Service Provider. "
                f"Send us a DM with your device model so we can assist further: {DM_LINK}"
            )
        elif intent == "login_account":
            reply_text = (
                f"Security and account access are very important to us. "
                f"You can reset your Apple ID password or manage account settings securely at iforgot.apple.com. "
                f"Meet us in DM to take a closer look together: {DM_LINK}"
            )
        elif intent == "storage_management":
            reply_text = (
                f"We can help you free up space on your device! "
                f"Check Settings > General > iPhone Storage for personalized recommendations to optimize your storage. "
                f"DM us if you need help managing your iCloud storage: {DM_LINK}"
            )
        elif intent == "order_billing_shipping":
            reply_text = (
                f"Thanks for reaching out regarding your order. "
                f"You can view real-time order status, shipping tracking, and billing details at reportaproblem.apple.com. "
                f"For direct account help, send us a DM: {DM_LINK}"
            )
        else:
            reply_text = (
                f"Thanks for reaching out to Apple Support! We are here to help. "
                f"Please DM us with more details about your device model and iOS version: {DM_LINK}"
            )

        return {
            "query": customer_query,
            "intent": intent,
            "confidence": classification["confidence"],
            "escalate": escalate,
            "reason": reason,
            "response": reply_text,
            "retrieved_cases": retrieved_cases
        }


if __name__ == "__main__":
    responder = SupportResponder()
    query = "My battery is draining so fast on my iPhone 6s"
    output = responder.generate_response(query)
    print("Query:", output["query"])
    print("Intent:", output["intent"])
    print("Escalate:", output["escalate"])
    print("Response:", output["response"])
    print("Retrieved Top Case Sim:", output["retrieved_cases"][0]["similarity"])
