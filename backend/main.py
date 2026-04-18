import requests
import os
from fastapi import FastAPI, HTTPException
from typing import Optional 
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pymongo import MongoClient
from passlib.context import CryptContext
from pydantic import BaseModel

load_dotenv()

app = FastAPI()

# Configuration MongoDB
uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(uri)
db = client["ishowcinema"]
users_collection = db["users"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TMDB_API_KEY = "c7d18e19b24cb397f78119b0008406ba"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserAuth(BaseModel):
    username: str
    password: str

# --- MODIFICATION AJOUT ---
@app.post("/add-favorite")
def add_favorite(username: str, movie_id: str): # On reçoit l'ID maintenant
    users_collection.update_one(
        {"username": username},
        {"$addToSet": {"favorites": movie_id}} # On stocke l'ID (ex: "496243")
    )
    return {"message": "Succès"}

# --- MODIFICATION RÉCUPÉRATION ---
@app.get("/favorites-details/{username}")
def get_favorites_details(username: str):
    user = users_collection.find_one({"username": username})
    if not user: return []
    
    fav_ids = user.get("favorites", [])[::-1] 
    full_movies = []

    for m_id in fav_ids:
        # On interroge TMDB par ID direct (beaucoup plus précis !)
        url = f"https://api.themoviedb.org/3/movie/{m_id}?api_key={TMDB_API_KEY}&language=fr-FR"
        try:
            res = requests.get(url)
            if res.status_code == 200:
                item = res.json()
                poster_path = item.get("poster_path")
                full_movies.append({
                    "id": item.get("id"), # On garde l'ID pour la suppression
                    "title": item.get("title"),
                    "year": item.get("release_date", "")[:4],
                    "director": "TMDB",
                    "genre": "Favori",
                    "image_url": f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else "https://placehold.co/400x600"
                })
        except Exception as e:
            print(f"Erreur ID {m_id}: {e}")
    return full_movies

# --- MODIFICATION SUPPRESSION ---
@app.post("/remove-favorite")
def remove_favorite(username: str, movie_id: str):
    users_collection.update_one(
        {"username": username},
        {"$pull": {"favorites": movie_id}}
    )
    return {"message": "Succès"}
# --- 2. ROUTES AUTHENTIFICATION ---

@app.post("/signup")
def signup(user: UserAuth):
    if not user.username or not user.password:
        raise HTTPException(status_code=400, detail="Remplis tous les champs !")
    if users_collection.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Pseudo déjà pris !")

    hashed_password = pwd_context.hash(user.password)
    users_collection.insert_one({
        "username": user.username,
        "password": hashed_password,
        "favorites": []
    })
    return {"message": "Inscription réussie !"}

@app.post("/login")
def login(user: UserAuth):
    db_user = users_collection.find_one({"username": user.username.strip()})
    if db_user and pwd_context.verify(user.password.strip(), db_user["password"]):
        return {"message": "Succès", "username": user.username.strip()}
    raise HTTPException(status_code=400, detail="Identifiants incorrects")

# --- 3. ROUTES FILMS ---

@app.get("/movies")
def get_movies(q: Optional[str] = None):
    if q:
        url = f"https://api.themoviedb.org/3/search/movie?api_key={TMDB_API_KEY}&language=fr-FR&query={q}&page=1"
    else:
        url = f"https://api.themoviedb.org/3/movie/popular?api_key={TMDB_API_KEY}&language=fr-FR&page=1"
        
    response = requests.get(url)
    tmdb_data = response.json()
    
    movies_formatted = []
    for item in tmdb_data.get("results", []):
        poster_path = item.get("poster_path")
        release_date = item.get("release_date", "")
        movies_formatted.append({
            "id": item.get("id"),
            "title": item.get("title"),
            "year": release_date[:4] if release_date else "N/A",
            "director": "TMDB", 
            "genre": "Action",
            "image_url": f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else "https://placehold.co/400x600"
        })
    return movies_formatted