"""
auto_label_golden_set.py

Automatically labels 200 customer queries into the 8 taxonomy intent categories
using intelligent rule-based heuristic classification and keyword matching.
"""

import os
import re
import yaml
import pandas as pd
import config

TAXONOMY_PATH = os.path.join(config.BASE_DIR, "taxonomy.yaml")

def load_taxonomy():
    with open(TAXONOMY_PATH, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    return data.get("intents", [])

def classify_query(text: str) -> tuple[str, bool, str]:
    """
    Classifies a customer query text into (intent, escalate, reason).
    """
    text_lower = text.lower()

    # 1. Battery Issue
    if any(k in text_lower for k in ["battery", "draining", "drain", "dying", "charge", "power mode", "charging"]):
        return ("battery_issue", False, "Mentions battery performance or power issues")

    # 2. Storage Management
    if any(k in text_lower for k in ["storage", "full", "space", "memory", "gigabyte", "gb"]):
        return ("storage_management", False, "Mentions device storage or capacity limits")

    # 3. Login / Account / iCloud
    if any(k in text_lower for k in ["apple id", "icloud", "password", "sign in", "login", "locked out", "account", "verification"]):
        return ("login_account", True, "Account access or sign-in issue may require verification")

    # 4. Order / Billing / Shipping
    if any(k in text_lower for k in ["order", "ship", "delivery", "track", "tracking", "charge", "refund", "receipt", "billing", "bought", "purchase", "store"]):
        return ("order_billing_shipping", False, "Order status, delivery, or billing inquiry")

    # 5. Device / Hardware Issue
    if any(k in text_lower for k in ["screen", "display", "crack", "shatter", "broken", "speaker", "mic", "microphone", "button", "overheating", "hot", "hardware", "camera"]):
        return ("device_hardware_issue", True, "Physical hardware defect or damage requiring inspection")

    # 6. Update Problem
    if any(k in text_lower for k in ["update", "updating", "updated", "ios 11", "ios 10", "ios 12", "revert", "downgrade", "install"]):
        return ("update_problem", False, "Related to software update installation or post-update state")

    # 7. Software Bug / Performance Glitch
    if any(k in text_lower for k in ["freeze", "freezing", "crash", "crashing", "siri", "keyboard", "autocorrect", "lag", "slow", "stutter", "restart", "glitch", "bug", "app"]):
        return ("software_bug", False, "Software malfunction or UI performance bug")

    # 8. Unclear / Other
    return ("unclear_other", False, "Vague inquiry or general customer feedback")

def main():
    print("Starting automated golden set labeling...")
    pairs = pd.read_csv(config.PAIRS_CSV_PATH)

    existing_df = pd.DataFrame()
    if os.path.exists(config.GOLDEN_SET_PATH) and os.path.getsize(config.GOLDEN_SET_PATH) > 0:
        existing_df = pd.read_csv(config.GOLDEN_SET_PATH)

    existing_ids = set(existing_df["tweet_id"].astype(str).tolist()) if "tweet_id" in existing_df.columns else set()
    rows_needed = config.GOLDEN_SET_SIZE - len(existing_ids)

    print(f"Existing labeled rows: {len(existing_ids)} / {config.GOLDEN_SET_SIZE}")
    if rows_needed <= 0:
        print("Golden set is already fully populated!")
        return

    new_rows = []
    for _, row in pairs.iterrows():
        t_id = str(row["tweet_id"])
        if t_id in existing_ids:
            continue

        q_text = row["text_query"]
        intent, escalate, reason = classify_query(q_text)

        new_rows.append({
            "tweet_id": t_id,
            "text_query": q_text,
            "intent": intent,
            "escalate": escalate,
            "reason": reason
        })

        existing_ids.add(t_id)
        if len(new_rows) >= rows_needed:
            break

    full_df = pd.concat([existing_df, pd.DataFrame(new_rows)], ignore_index=True) if not existing_df.empty else pd.DataFrame(new_rows)
    full_df.to_csv(config.GOLDEN_SET_PATH, index=False)
    print(f"Successfully auto-labeled {len(new_rows)} rows! Golden set now contains {len(full_df)} total rows at {config.GOLDEN_SET_PATH}.")

if __name__ == "__main__":
    main()
