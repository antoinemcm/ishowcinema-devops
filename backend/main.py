import requests
import os
from fastapi import FastAPI, HTTPException
from typing import Optional 
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pymongo import MongoClient
from passlib.context import CryptContext
from pydantic import BaseModel
import concurrent.futures

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

# --- 1. ROUTES FAVORIS ---

@app.post("/add-favorite")
def add_favorite(username: str, movie_id: str):
    users_collection.update_one(
        {"username": username},
        {"$addToSet": {"favorites": movie_id}}
    )
    return {"message": "Succès"}

@app.get("/favorites-details/{username}")
def get_favorites_details(username: str):
    user = users_collection.find_one({"username": username})
    if not user: return []
    
    # On récupère les IDs et on les inverse pour avoir les plus récents en premier
    fav_ids = user.get("favorites", [])[::-1] 

    # 1. On isole la requête d'un seul film
    def fetch_single_favorite(m_id):
        url = f"https://api.themoviedb.org/3/movie/{m_id}?api_key={TMDB_API_KEY}&language=fr-FR&append_to_response=credits"
        try:
            res = requests.get(url)
            if res.status_code == 200:
                item = res.json()
                poster_path = item.get("poster_path")
                
                # Extraction du réalisateur
                director = "Inconnu"
                crew = item.get("credits", {}).get("crew", [])
                for member in crew:
                    if member.get("job") == "Director":
                        director = member.get("name")
                        break

                return {
                    "id": item.get("id"),
                    "title": item.get("title"),
                    "year": item.get("release_date", "")[:4],
                    "director": director,
                    "genre": "Favori",
                    "image_url": f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else "https://placehold.co/400x600"
                }
        except Exception as e:
            print(f"Erreur ID {m_id}: {e}")
        return None # En cas d'erreur sur un film, on renvoie None

    # 2. On lance toutes les requêtes en même temps !
    full_movies = []
    # On limite à 15 requêtes simultanées pour ne pas spammer TMDB
    with concurrent.futures.ThreadPoolExecutor(max_workers=15) as executor:
        # map exécute la fonction en parallèle tout en gardant l'ordre de la liste (super important pour les favoris !)
        results = list(executor.map(fetch_single_favorite, fav_ids))
        
    # On nettoie la liste en enlevant les "None" (au cas où un film aurait planté)
    full_movies = [movie for movie in results if movie is not None]

    return full_movies

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
    results = tmdb_data.get("results", [])[:12]
    
    # 1. On isole le travail pour UN SEUL film dans une sous-fonction
    def fetch_movie_data(item):
        movie_id = item.get("id")
        poster_path = item.get("poster_path")
        release_date = item.get("release_date", "")
        
        # Récupération du réalisateur
        cred_url = f"https://api.themoviedb.org/3/movie/{movie_id}/credits?api_key={TMDB_API_KEY}"
        director = "Inconnu"
        try:
            cred_res = requests.get(cred_url).json()
            for member in cred_res.get("crew", []):
                if member.get("job") == "Director":
                    director = member.get("name")
                    break
        except Exception:
            pass

        return {
            "id": movie_id,
            "title": item.get("title"),
            "year": release_date[:4] if release_date else "N/A",
            "director": director, 
            "genre": "Populaire" if not q else "Recherche",
            "image_url": f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else "https://placehold.co/400x600"
        }

    # 2. On lance les 12 requêtes EN MÊME TEMPS grâce au ThreadPool !
    movies_formatted = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as executor:
        # map() va exécuter fetch_movie_data sur chaque 'item' de la liste 'results' en parallèle
        movies_formatted = list(executor.map(fetch_movie_data, results))

    return movies_formatted


@app.get("/movies/{movie_id}")
def get_movie_details(movie_id: str):
    # Appel direct avec append_to_response pour avoir les détails ET le casting
    url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key={TMDB_API_KEY}&language=fr-FR&append_to_response=credits"
    
    try:
        response = requests.get(url)
        if response.status_code != 200:
            raise HTTPException(status_code=404, detail="Film non trouvé sur TMDB")
            
        item = response.json()
        poster_path = item.get("poster_path")
        
        # Extraction du réalisateur
        director = "Inconnu"
        crew = item.get("credits", {}).get("crew", [])
        for member in crew:
            if member.get("job") == "Director":
                director = member.get("name")
                break
        
        # Extraction du premier genre
        genres = item.get("genres", [])
        genre_name = genres[0]["name"] if len(genres) > 0 else "Inconnu"
        
        return {
            "id": item.get("id"),
            "title": item.get("title"),
            "year": item.get("release_date", "")[:4],
            "director": director, 
            "genre": genre_name, 
            "synopsis": item.get("overview", "Aucun synopsis disponible."), 
            "image_url": f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else "https://placehold.co/400x600"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur serveur: {str(e)}")