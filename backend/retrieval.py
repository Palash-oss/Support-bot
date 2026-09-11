

import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
import config


def build_embeddings():
    """
    One-time step: convert every customer question in apple_pairs.csv into
    a vector of numbers (an "embedding") that captures its MEANING, not just
    its exact words. Two messages that mean the same thing end up as two
    vectors that are close together in space -- that's what lets us find
    "similar" messages later, even if they use totally different words.
    """
    pairs = pd.read_csv(config.PAIRS_CSV_PATH)
    print(f"[build_embeddings] loaded {len(pairs)} pairs from {config.PAIRS_CSV_PATH}")

    # Load the embedding model. First run downloads it (~80MB), then it's cached locally.
    model = SentenceTransformer(config.EMBEDDING_MODEL_NAME)
    print(f"[build_embeddings] loaded model '{config.EMBEDDING_MODEL_NAME}'")

    # .encode() turns a LIST of text strings into a LIST of vectors (arrays of numbers).
    # This is the slow-ish step -- 8000 texts takes roughly a minute on CPU.
    texts = pairs["text_query"].astype(str).tolist()
    embeddings = model.encode(texts, show_progress_bar=True, batch_size=64)
    print(f"[build_embeddings] created {embeddings.shape[0]} vectors of "
          f"dimension {embeddings.shape[1]} each")

    # Save both the original pairs AND their vectors together, so later we
    # can look up "vector #57 is most similar" and instantly know which
    # actual customer question + Apple reply that corresponds to.
    pairs["embedding"] = list(embeddings)
    pairs.to_pickle(config.EMBEDDINGS_PATH)
    print(f"[build_embeddings] saved to {config.EMBEDDINGS_PATH}")


# ---- Runtime lookup (used every time a new message comes in) ----

_cached_model = None
_cached_pairs = None


def _get_model():
    """
    Load the embedding model into memory ONCE and reuse it.
    Loading it fresh on every single request would be slow -- this is a
    simple cache using a module-level variable.
    """
    global _cached_model
    if _cached_model is None:
        _cached_model = SentenceTransformer(config.EMBEDDING_MODEL_NAME)
    return _cached_model


def _get_pairs():
    """Same caching idea, but for the saved embeddings file."""
    global _cached_pairs
    if _cached_pairs is None:
        _cached_pairs = pd.read_pickle(config.EMBEDDINGS_PATH)
    return _cached_pairs


def _cosine_similarity(query_vec, all_vecs):
    """
    Cosine similarity = a number between -1 and 1 measuring how much two
    vectors "point in the same direction." 1 = identical meaning,
    0 = unrelated, -1 = opposite. We use this (not raw distance) because
    it ignores sentence LENGTH and only cares about meaning/direction.

    query_vec: shape (384,)      -- one vector, the new message
    all_vecs:  shape (8000, 384) -- every past message's vector
    returns:   shape (8000,)     -- one similarity score per past message
    """
    query_norm = query_vec / np.linalg.norm(query_vec)
    all_norms = all_vecs / np.linalg.norm(all_vecs, axis=1, keepdims=True)
    return np.dot(all_norms, query_norm)


def retrieve_similar(message: str, k: int = None) -> list[dict]:
    """
    THE MAIN FUNCTION OTHER FILES WILL CALL.

    Given a new customer message, returns the top-k most similar past
    (question, Apple's reply) pairs, most similar first.

    Example return value:
    [
        {"text_query": "my battery dies fast", "text_reply": "Try...", "similarity": 0.87},
        ...
    ]
    """
    k = k or config.TOP_K_SIMILAR

    model = _get_model()
    pairs = _get_pairs()

    query_vec = model.encode([message])[0]              # embed just this one message
    all_vecs = np.vstack(pairs["embedding"].values)      # stack all saved vectors into one matrix

    scores = _cosine_similarity(query_vec, all_vecs)

    # np.argsort sorts ASCENDING (lowest first) and gives back the original
    # row positions, not the scores themselves. [::-1] reverses it so
    # highest similarity comes first. [:k] keeps only the top k.
    top_indices = np.argsort(scores)[::-1][:k]

    results = []
    for idx in top_indices:
        row = pairs.iloc[idx]
        results.append({
            "tweet_id": row["tweet_id"],
            "text_query": row["text_query"],
            "text_reply": row["text_reply"],
            "similarity": float(scores[idx]),
        })
    return results


if __name__ == "__main__":
    # Build the embeddings cache once.
    build_embeddings()

    # Quick sanity check: try a made-up message and see what comes back.
    test_message = "my iphone battery drains so fast after the update"
    print(f"\n[demo] query: {test_message!r}")
    for r in retrieve_similar(test_message, k=3):
        print(f"  sim={r['similarity']:.3f}  query={r['text_query'][:70]!r}")
        print(f"           reply={r['text_reply'][:70]!r}")