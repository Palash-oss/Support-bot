
import os

# ---- Folders ----
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")


# ---- Input ----
RAW_CSV_PATH = os.path.join(DATA_DIR, "apple_raw.csv")   # the file you uploaded
BRAND_NAME = "AppleSupport"


# ---- Outputs of data_prep.py ----
PAIRS_CSV_PATH = os.path.join(DATA_DIR, "apple_pairs.csv")          # query -> reply pairs
TAXONOMY_SAMPLE_PATH = os.path.join(DATA_DIR, "taxonomy_sample.csv") # sample for YOU to read & label intents


# ---- Tunable settings ----
PAIR_SUBSAMPLE_SIZE = 8000     # how many query->reply pairs to keep for the working dataset
TAXONOMY_SAMPLE_SIZE = 200     # how many rows to export for you to manually read
RANDOM_SEED = 42               # fixed seed so results are reproducible every run
 



# ---- Retrieval settings (used later in retrieval.py) ----
TOP_K_SIMILAR = 3              # how many past similar cases to retrieve as grounding
 
# ---- Golden set / eval settings (used later) ----
GOLDEN_SET_SIZE = 200
GOLDEN_SET_PATH = os.path.join(DATA_DIR, "golden_set.csv")


