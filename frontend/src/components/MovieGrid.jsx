import { useState, useEffect } from 'react';
import '../styles/MovieList.css'; // On importe le style qu'on va créer juste après

function MovieList() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // On appelle ton API FastAPI (assure-toi qu'elle tourne sur le port 8000 !)
    fetch('http://127.0.0.1:8000/movies')
      .then(response => {
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des films');
        }
        return response.json();
      })
      .then(data => {
        setMovies(data);
        setLoading(false); // On arrête le chargement
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Affichage pendant que les données arrivent
  if (loading) return <div className="message">⏳ Chargement des films...</div>;
  
  // Affichage en cas de problème de connexion avec FastAPI
  if (error) return <div className="message error">❌ Erreur : {error}</div>;

  return (
    <div className="movie-container">
      <h1>🍿 IShowCinema - À l'affiche</h1>
      
      <div className="movies-grid">
        {movies.map((movie, index) => (
          <div key={index} className="movie-card">
            {/* L'image pointe vers le dossier public/images/ de ton React */}
            <img src={movie.image_url} alt={`Affiche du film ${movie.title}`} />
            
            <div className="movie-info">
              <h2>{movie.title} <span>({movie.year})</span></h2>
              <p className="director">De {movie.director}</p>
              <span className="genre-badge">{movie.genre}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MovieList;