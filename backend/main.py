"""
main.py

FastAPI backend web server for Apple Support Bot.
Provides REST API endpoints for chat generation, taxonomy definitions,
golden dataset preview, and system health/analytics.
"""

import os
import yaml
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import config
from responder import SupportResponder

app = FastAPI(
    title="Apple Support Bot API",
    description="RAG-grounded support bot API built with Intent Classification & Vector Embeddings.",
    version="1.0.0"
)

# Enable CORS for local React frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

responder = SupportResponder()

class ChatRequest(BaseModel):
    message: str


@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Apple Support Bot API",
        "version": "1.0.0"
    }


@app.post("/api/chat")
def chat_endpoint(payload: ChatRequest):
    message = payload.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
    
    try:
        result = responder.generate_response(message)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/taxonomy")
def get_taxonomy():
    taxonomy_path = os.path.join(config.BASE_DIR, "taxonomy.yaml")
    if not os.path.exists(taxonomy_path):
        raise HTTPException(status_code=444, detail="Taxonomy file not found.")
    
    with open(taxonomy_path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    
    return data.get("intents", [])


@app.get("/api/stats")
def get_stats():
    pairs_count = 0
    if os.path.exists(config.PAIRS_CSV_PATH):
        df_pairs = pd.read_csv(config.PAIRS_CSV_PATH)
        pairs_count = len(df_pairs)
        
    golden_count = 0
    if os.path.exists(config.GOLDEN_SET_PATH):
        df_golden = pd.read_csv(config.GOLDEN_SET_PATH)
        golden_count = len(df_golden)

    embeddings_ready = os.path.exists(config.EMBEDDINGS_PATH)

    return {
        "pairs_count": pairs_count,
        "golden_set_size": golden_count,
        "embedding_model": config.EMBEDDING_MODEL_NAME,
        "embeddings_cached": embeddings_ready,
        "top_k": config.TOP_K_SIMILAR,
        "intents_count": 8
    }


@app.get("/api/golden-set")
def get_golden_set():
    if not os.path.exists(config.GOLDEN_SET_PATH):
        return []
    
    df = pd.read_csv(config.GOLDEN_SET_PATH).fillna("")
    return df.to_dict(orient="records")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
