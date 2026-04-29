import requests
import os
import concurrent.futures
from fastapi import FastAPI, HTTPException
from typing import Optional 
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pymongo import MongoClient
from passlib.context import CryptContext
from pydantic import BaseModel
import redis
import json

load_dotenv()

app = FastAPI()

# API 
TMDB_API_KEY = os.getenv("TMDB_TOKEN")

# BDD
MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongodb-service:27017/")
client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
db = client["ishowcinema"]
users_collection = db["users"]

# cache
REDIS_HOST = os.getenv("REDIS_HOST", "redis") 
cache = redis.Redis(host=REDIS_HOST, port=6379, db=0, decode_responses=True)

# Sécurité
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")



app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserAuth(BaseModel):
    username: str
    password: str

# --- GESTION DES FAVORIS ---

@app.post("/add-favorite")
def add_favorite(username: str, movie_id: str):
    users_collection.update_one(
        {"username": username},
        {"$addToSet": {"favorites": movie_id}}
    )
    return {"message": "Succès"}

@app.post("/remove-favorite")
def remove_favorite(username: str, movie_id: str):
    users_collection.update_one(
        {"username": username},
        {"$pull": {"favorites": movie_id}}
    )
    return {"message": "Succès"}

@app.get("/favorites-details/{username}")
def get_favorites_details(username: str):
    user = users_collection.find_one({"username": username})
    if not user: return []
    
    fav_ids = user.get("favorites", [])[::-1] 

    def fetch_single_favorite(m_id):
        url = f"https://api.themoviedb.org/3/movie/{m_id}?api_key={TMDB_API_KEY}&language=fr-FR&append_to_response=credits"
        try:
            res = requests.get(url)
            if res.status_code == 200:
                item = res.json()
                director = "Inconnu"
                for member in item.get("credits", {}).get("crew", []):
                    if member.get("job") == "Director":
                        director = member.get("name")
                        break

                return {
                    "id": item.get("id"),
                    "title": item.get("title"),
                    "year": item.get("release_date", "")[:4] if item.get("release_date") else "N/A",
                    "director": director,
                    "genre": "Favori",
                    "image_url": f"https://image.tmdb.org/t/p/w500{item.get('poster_path')}" if item.get('poster_path') else "https://placehold.co/400x600"
                }
        except: return None
        return None

    with concurrent.futures.ThreadPoolExecutor(max_workers=15) as executor:
        results = list(executor.map(fetch_single_favorite, fav_ids))
            
    return [movie for movie in results if movie is not None]

# --- AUTHENTIFICATION ---

@app.post("/signup")
def signup(user: UserAuth):
    if not user.username or not user.password:
        raise HTTPException(status_code=400, detail="Champs manquants")
    if users_collection.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Pseudo déjà pris")
    
    users_collection.insert_one({
        "username": user.username, 
        "password": pwd_context.hash(user.password), 
        "favorites": []
    })
    return {"message": "Succès"}

@app.post("/login")
def login(user: UserAuth):
    db_user = users_collection.find_one({"username": user.username.strip()})
    if db_user and pwd_context.verify(user.password.strip(), db_user["password"]):
        return {"message": "Succès", "username": user.username.strip()}
    raise HTTPException(status_code=400, detail="Identifiants incorrects")

# --- FILMS ---

@app.get("/movies")
def get_movies(q: Optional[str] = None, page: int = 1):
    cache_key = f"search_{q}_{page}" if q else f"popular_{page}"
    
    # données sont déjà dans le cache ?
    try:
        cached_data = cache.get(cache_key)
        if cached_data:
            print(f"Depuis le CACHE ! (clé: {cache_key})")
            return json.loads(cached_data)
    except Exception as e:
        print(f"Erreur de lecture Redis (ignorée): {e}")

    # Si non via tmdb
    if q:
        url = f"https://api.themoviedb.org/3/search/movie?api_key={TMDB_API_KEY}&language=fr-FR&query={q}&page={page}"
    else:
        url = f"https://api.themoviedb.org/3/movie/popular?api_key={TMDB_API_KEY}&language=fr-FR&page={page}"
        
    response = requests.get(url)
    data = response.json()
    results = data.get("results", [])
    
    def fetch_movie_data(item):
        movie_id = item.get("id")
        cred_url = f"https://api.themoviedb.org/3/movie/{movie_id}/credits?api_key={TMDB_API_KEY}"
        director = "Inconnu"
        try:
            cred_res = requests.get(cred_url).json()
            for member in cred_res.get("crew", []):
                if member.get("job") == "Director":
                    director = member.get("name")
                    break
        except: pass

        return {
            "id": movie_id,
            "title": item.get("title"),
            "year": item.get("release_date", "")[:4] if item.get("release_date") else "N/A",
            "director": director, 
            "genre": "Populaire" if not q else "Recherche",
            "image_url": f"https://image.tmdb.org/t/p/w500{item.get('poster_path')}" if item.get('poster_path') else "https://placehold.co/400x600"
        }

    # Parallélisation
    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        movies_formatted = list(executor.map(fetch_movie_data, results))

    # Sauvegarde dans le cache
    try:
        cache.setex(cache_key, 600, json.dumps(movies_formatted))
        print(f"Depuis TMDB et sauvegardées en cache ! (clé: {cache_key})")
    except Exception as e:
        print(f"Erreur d'écriture Redis (ignorée): {e}")

    return movies_formatted

@app.get("/movies/{movie_id}")
def get_movie_details(movie_id: str):
    # Récupération des infos
    url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key={TMDB_API_KEY}&language=fr-FR&append_to_response=credits,videos"
    
    try:
        res = requests.get(url)
        if res.status_code != 200:
            raise HTTPException(status_code=404, detail="Film non trouvé")
        
        item = res.json()
        
        # Réalisateur
        director = "Inconnu"
        for member in item.get("credits", {}).get("crew", []):
            if member.get("job") == "Director":
                director = member.get("name")
                break
        
        # Acteurs 
        actors = [m.get("name") for m in item.get("credits", {}).get("cast", [])[:5]]
        
        # Bande-annonce
        trailer_key = None
        for v in item.get("videos", {}).get("results", []):
            if v.get("type") == "Trailer" and v.get("site") == "YouTube":
                trailer_key = v.get("key")
                break

        return {
            "id": item.get("id"),
            "title": item.get("title"),
            "year": item.get("release_date", "")[:4] if item.get("release_date") else "N/A",
            "director": director, 
            "actors": actors,
            "genre": item.get("genres", [{"name": "Inconnu"}])[0]["name"], 
            "synopsis": item.get("overview", "Aucun synopsis disponible."), 
            "image_url": f"https://image.tmdb.org/t/p/w500{item.get('poster_path')}" if item.get('poster_path') else "https://placehold.co/400x600",
            "trailer_url": f"https://www.youtube.com/embed/{trailer_key}" if trailer_key else None
        }
    except Exception as e:
        print(f"Erreur API: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la récupération des détails")
    
    
@app.get("/movies/{movie_id}/recommendations")
def get_recommendations(movie_id: int):
    # On demande les recommandations à TMDB
    url = f"https://api.themoviedb.org/3/movie/{movie_id}/recommendations?api_key={TMDB_API_KEY}&language=fr-FR"
    
    try:
        response = requests.get(url)
        data = response.json()
        results = data.get("results", [])[:6] # On prend les 6 meilleurs
        
        recommendations = []
        for item in results:
            recommendations.append({
                "id": item.get("id"),
                "title": item.get("title"),
                "image_url": f"https://image.tmdb.org/t/p/w500{item.get('poster_path')}" if item.get('poster_path') else "https://placehold.co/400x600",
                "year": item.get("release_date", "")[:4] if item.get("release_date") else "N/A"
            })
        return recommendations
    except Exception as e:
        print(f"Erreur reco: {e}")
        return []