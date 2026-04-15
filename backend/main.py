import requests
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pymongo import MongoClient
from passlib.context import CryptContext
from pydantic import BaseModel
from fastapi import HTTPException
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
    allow_credentials=True,
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

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Erreur API TMDB")

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
    
# Configuration du hachage des mots de passe
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Modèle pour les données reçues
class UserAuth(BaseModel):
    username: str
    password: str

# --- INSCRIPTION ---
@app.post("/signup")
def signup(user: UserAuth):
    # 1. On vérifie juste si les champs sont remplis
    if not user.username or not user.password:
        raise HTTPException(status_code=400, detail="Remplis tous les champs !")

    # 2. On vérifie si le pseudo existe déjà
    if users_collection.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Pseudo déjà pris !")

    # 3. On hache le mot de passe avant de le sauvegarder
    hashed_password = pwd_context.hash(user.password)

    new_user = {
        "username": user.username,
        "password": hashed_password, # <--- On stocke le hash sécurisé
        "favorites": []
    }
    
    users_collection.insert_one(new_user)
    return {"message": "Inscription réussie ! 🎉"}

# --- CONNEXION ---
@app.post("/login")
def login(user: UserAuth):
    # .strip() enlève les espaces invisibles au début et à la fin
    username_clean = user.username.strip()
    password_clean = user.password.strip()

    # On cherche l'utilisateur en base
    db_user = users_collection.find_one({"username": username_clean})
    
    # On vérifie si l'utilisateur existe ET si le mot de passe correspond au hash
    if db_user and pwd_context.verify(password_clean, db_user["password"]):
        return {"message": "Succès", "username": username_clean}
    
    # Si l'un des deux est faux, on renvoie une erreur générique (bonne pratique de sécurité)
    raise HTTPException(status_code=400, detail="Compte inexistant ou mauvais mot de passe")