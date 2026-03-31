import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

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
def get_movies():
    # 1. On demande les films populaires du moment en français
    url = f"https://api.themoviedb.org/3/movie/popular?api_key={TMDB_API_KEY}&language=fr-FR&page=1"
    response = requests.get(url)
    
    # On convertit la réponse de TMDb en dictionnaire Python
    tmdb_data = response.json()
    
    # 2. On prépare la liste vide qu'on va renvoyer à React
    movies_formatted = []
    
    # 3. On boucle sur les résultats de TMDb pour les traduire pour notre React
    for item in tmdb_data.get("results", []):
        
        # TMDb ne donne que le bout du chemin de l'image (ex: /kqjL17yufvn9OVLyXYpvtyrFfak.jpg)
        # Il faut rajouter l'URL de base devant pour que l'image s'affiche
        poster_path = item.get("poster_path")
        if poster_path:
            full_image_url = f"https://image.tmdb.org/t/p/w500{poster_path}"
        else:
            full_image_url = "https://placehold.co/400x600/1a1a1a/ffffff?text=Pas+d'affiche"

        # On extrait juste l'année de la date de sortie (ex: "2024-03-01" -> "2024")
        release_date = item.get("release_date", "")
        year = release_date[:4] if release_date else "N/A"

        # On ajoute le film reformaté dans notre liste
        movies_formatted.append({
            "title": item.get("title"),
            "year": year,
            # TMDb demande des requêtes supplémentaires pour avoir le nom du réalisateur et les genres.
            # Pour l'instant, on met une valeur par défaut pour ne pas casser ton design React.
            "director": "Voir détails", 
            "genre": "Populaire",
            "image_url": full_image_url
        })

    # 4. On envoie les données toutes propres à React !
    return movies_formatted