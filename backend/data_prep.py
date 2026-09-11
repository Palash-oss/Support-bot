
import pandas as pd
import config


def load_raw_data() -> pd.DataFrame:
    """Load the raw twitter CSV (both customer tweets and Apple's replies)."""
    df = pd.read_csv(config.RAW_CSV_PATH, low_memory=False)
    print(f"[load_raw_data] loaded {len(df)} total rows")
    return df


def build_query_reply_pairs(df: pd.DataFrame) -> pd.DataFrame:
    """
    Reconstruct (customer_query -> apple_reply) pairs.

    How it works:
    1. Take every row where Apple is the author -> these are Apple's replies.
    2. Each Apple reply has 'in_response_to_tweet_id' pointing to the tweet
       it was replying to.
    3. Look up that tweet_id in the full dataframe to get the customer's
       original message.
    4. Join them side by side into one row: (customer text, apple reply text).
    """
    apple_replies = df[df["author_id"] == config.BRAND_NAME].copy()
    print(f"[build_query_reply_pairs] {len(apple_replies)} Apple reply tweets found")

    # Apple replies where we don't know what tweet they were responding to
    # are useless to us (we can't pair them with a customer question) -- drop them.
    before = len(apple_replies)
    apple_replies = apple_replies.dropna(subset=["in_response_to_tweet_id"])
    dropped = before - len(apple_replies)
    print(f"[build_query_reply_pairs] dropped {dropped} Apple replies with no "
          f"in_response_to_tweet_id (nothing to pair them with)")

    # tweet_id columns are sometimes read as float/str inconsistently -- normalize
    df["tweet_id"] = df["tweet_id"].astype(str)
    apple_replies["in_response_to_tweet_id"] = (
        apple_replies["in_response_to_tweet_id"].astype(float).astype(int).astype(str)
    )

    # customer tweets only (inbound=True means "sent TO the brand", i.e. from a customer)
    customer_tweets = df[df["inbound"] == True][["tweet_id", "text", "created_at"]]
    customer_tweets = customer_tweets.rename(
        columns={"text": "text_query", "created_at": "created_at_query"}
    )

    merged = apple_replies.merge(
        customer_tweets,
        left_on="in_response_to_tweet_id",
        right_on="tweet_id",
        how="inner",              # only keep rows where we actually found the customer's question
        suffixes=("_reply", "_query"),
    )
    print(f"[build_query_reply_pairs] {len(merged)} pairs successfully matched")

    merged = merged.rename(columns={"text": "text_reply"})
    result = merged[["tweet_id_query", "text_query", "text_reply", "created_at_query"]].copy()
    result = result.rename(columns={"tweet_id_query": "tweet_id"})

    # drop any remaining empty text
    before = len(result)
    result = result.dropna(subset=["text_query", "text_reply"])
    print(f"[build_query_reply_pairs] dropped {before - len(result)} rows with empty text")

    return result.reset_index(drop=True)


def subsample(pairs: pd.DataFrame) -> pd.DataFrame:
    """Take a fixed-size random sample so the project stays fast to run/reproduce."""
    n = min(config.PAIR_SUBSAMPLE_SIZE, len(pairs))
    sampled = pairs.sample(n=n, random_state=config.RANDOM_SEED)
    print(f"[subsample] using {len(sampled)} of {len(pairs)} total pairs "
          f"(seed={config.RANDOM_SEED}, reproducible)")
    return sampled.reset_index(drop=True)


def export_taxonomy_sample(pairs: pd.DataFrame) -> None:
    """
    Export a random set of customer questions to a CSV for YOU to read.
    You open this file, read the 'text_query' column, and note down
    6-8 recurring categories you see -- that becomes your taxonomy.
    """
    sample = pairs.sample(
        n=min(config.TAXONOMY_SAMPLE_SIZE, len(pairs)),
        random_state=config.RANDOM_SEED,
    )
    sample[["tweet_id", "text_query"]].to_csv(config.TAXONOMY_SAMPLE_PATH, index=False)
    print(f"[export_taxonomy_sample] wrote {len(sample)} rows to {config.TAXONOMY_SAMPLE_PATH}")


def main():
    df = load_raw_data()
    pairs = build_query_reply_pairs(df)
    pairs = subsample(pairs)
    pairs.to_csv(config.PAIRS_CSV_PATH, index=False)
    print(f"[main] saved working dataset to {config.PAIRS_CSV_PATH}")

    export_taxonomy_sample(pairs)
    print("[main] done. Next step: open taxonomy_sample.csv and read ~200 "
          "customer questions to define your 6-8 intents.")


if __name__ == "__main__":
    main()