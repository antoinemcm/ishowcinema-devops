import requests
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pymongo import MongoClient
from typing import Optional


load_dotenv()

app = FastAPI()

uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")

client = MongoClient(uri)
db = client["ishowcinema"]
users_collection = db["users"]
# Autorisation CORS pour que React puisse parler à FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🛑 REMPLACE CECI PAR TA VRAIE CLÉ API TMDB
TMDB_API_KEY = "c7d18e19b24cb397f78119b0008406ba"

@app.get("/movies")
def get_movies(q: Optional[str] = None):
    # Si l'utilisateur a tapé une recherche (q n'est pas vide)
    if q:
        # On utilise le endpoint "search" de TMDB
        url = f"https://api.themoviedb.org/3/search/movie?api_key={TMDB_API_KEY}&language=fr-FR&query={q}&page=1"
    else:
        # Sinon, on garde le comportement par défaut : les films populaires
        url = f"https://api.themoviedb.org/3/movie/popular?api_key={TMDB_API_KEY}&language=fr-FR&page=1"
        
    response = requests.get(url)
    tmdb_data = response.json()
    
    movies_formatted = []
    
    for item in tmdb_data.get("results", []):
        poster_path = item.get("poster_path")
        if poster_path:
            full_image_url = f"https://image.tmdb.org/t/p/w500{poster_path}"
        else:
            full_image_url = "https://placehold.co/400x600/1a1a1a/ffffff?text=Pas+d'affiche"

        release_date = item.get("release_date", "")
        year = release_date[:4] if release_date else "N/A"

        movies_formatted.append({
            "title": item.get("title"),
            "year": year,
            "director": "Voir détails", 
            "genre": "Recherche" if q else "Populaire", # Petit ajustement cosmétique
            "image_url": full_image_url
        })

    return movies_formatted


@app.get("/test-db")
def test_db():
    try:
        client.admin.command('ping')
        return {"status": "Connecté à MongoDB Local ! 🚀"}
    except Exception as e:
        return {"status": "Erreur", "details": str(e)}