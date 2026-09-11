"""
label_golden_set.py

Interactive CLI tool to build the Golden Evaluation Dataset (200 labeled cases).
Reads valid intents from taxonomy.yaml, pairs from apple_pairs.csv, and appends
labels directly to backend/data/golden_set.csv.

Supports resuming anytime!
"""

import os
import sys
import yaml
import pandas as pd
import config


def load_taxonomy_intents() -> list[str]:
    """Load valid intent names from taxonomy.yaml."""
    taxonomy_path = os.path.join(config.BASE_DIR, "taxonomy.yaml")
    if not os.path.exists(taxonomy_path):
        print(f"Error: {taxonomy_path} not found.")
        sys.exit(1)

    with open(taxonomy_path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)

    intents = [item["name"] for item in data.get("intents", [])]
    return intents


def load_existing_golden_set() -> pd.DataFrame:
    """Load existing golden set if it exists, otherwise return an empty DataFrame."""
    if os.path.exists(config.GOLDEN_SET_PATH):
        try:
            return pd.read_csv(config.GOLDEN_SET_PATH)
        except Exception:
            return pd.DataFrame(columns=["tweet_id", "text_query", "intent", "escalate", "reason"])
    return pd.DataFrame(columns=["tweet_id", "text_query", "intent", "escalate", "reason"])


def save_golden_row(row_dict: dict):
    """Append a single labeled row to golden_set.csv immediately."""
    df_row = pd.DataFrame([row_dict])
    file_exists = os.path.exists(config.GOLDEN_SET_PATH) and os.path.getsize(config.GOLDEN_SET_PATH) > 0
    df_row.to_csv(config.GOLDEN_SET_PATH, mode="a", index=False, header=not file_exists)


def main():
    intents = load_taxonomy_intents()
    print("=" * 60)
    print("      GOLDEN SET INTERACTIVE LABELING TOOL")
    print("=" * 60)
    print("Valid intents from taxonomy.yaml:")
    for idx, name in enumerate(intents, 1):
        print(f"  {idx}. {name}")
    print("=" * 60)

    # Load pairs
    if not os.path.exists(config.PAIRS_CSV_PATH):
        print(f"Error: {config.PAIRS_CSV_PATH} not found. Please run data_prep.py first.")
        return

    pairs = pd.read_csv(config.PAIRS_CSV_PATH)
    existing_df = load_existing_golden_set()
    already_labeled_ids = set(existing_df["tweet_id"].astype(str).tolist()) if "tweet_id" in existing_df.columns else set()

    total_target = config.GOLDEN_SET_SIZE
    current_count = len(already_labeled_ids)

    print(f"Progress: {current_count}/{total_target} rows already labeled.")
    if current_count >= total_target:
        print("Target of 200 labeled cases already reached in golden_set.csv!")
        return

    print("Tip: You can select intent by entering its NUMBER (1-8) or exact name.")
    print("Press Ctrl+C at any time to save and exit.\n")

    try:
        for index, row in pairs.iterrows():
            tweet_id_str = str(row["tweet_id"])
            if tweet_id_str in already_labeled_ids:
                continue

            current_count += 1
            print("-" * 60)
            print(f"[{current_count}/{total_target}] Tweet ID: {tweet_id_str}")
            print(f"Query: {row['text_query']}")
            print("-" * 60)

            # Intent selection loop
            chosen_intent = None
            while chosen_intent is None:
                user_input = input(f"Intent (1-{len(intents)} or name, 'q' to quit): ").strip()
                if user_input.lower() == 'q':
                    print("\nSaving and quitting...")
                    return

                if user_input.isdigit():
                    num = int(user_input)
                    if 1 <= num <= len(intents):
                        chosen_intent = intents[num - 1]
                    else:
                        print(f"Invalid number. Please enter 1-{len(intents)}.")
                elif user_input in intents:
                    chosen_intent = user_input
                else:
                    print(f"Invalid intent '{user_input}'. Must be one of: {', '.join(intents)}")

            # Escalate prompt
            escalate_input = input("Escalate to human support? (y/n, default 'n'): ").strip().lower()
            escalate = True if escalate_input.startswith("y") else False

            # Reason prompt
            reason = input("Reason / Note (optional, press Enter to skip): ").strip()

            record = {
                "tweet_id": tweet_id_str,
                "text_query": row["text_query"],
                "intent": chosen_intent,
                "escalate": escalate,
                "reason": reason
            }

            save_golden_row(record)
            already_labeled_ids.add(tweet_id_str)
            print(f"-> Saved! ({chosen_intent}, escalate={escalate})\n")

            if current_count >= total_target:
                print("=" * 60)
                print("Congratulations! You reached 200 labeled rows in golden_set.csv!")
                print("=" * 60)
                break

    except KeyboardInterrupt:
        print("\n\nLabeling paused. All completed rows have been saved to golden_set.csv.")
        print("Run `python label_golden_set.py` anytime to resume!")


if __name__ == "__main__":
    main()
