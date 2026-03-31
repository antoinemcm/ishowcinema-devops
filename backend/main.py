from fastapi import FastAPI
import json
from pathlib import Path
from typing import Optional

app = FastAPI()
DATA_PATH = Path(__file__).parent / "movies.json"
from fastapi.middleware.cors import CORSMiddleware


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/hello")
def hello():
    return {"message": "Hello World"}

@app.get("/movies")
def get_movies(limit: int = 30):
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        movies = json.load(f)
    return movies[:limit]

