import { useState, useEffect } from 'react';
import { useSearch } from '../context/SearchContext';
import '../styles/MovieList.css';

function MovieList() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // On récupère le texte tapé dans le Header
  const { searchQuery } = useSearch();

  useEffect(() => {
    setLoading(true);
    
    // On adapte l'URL selon si une recherche est en cours ou non.
    // Assurez-vous que votre FastAPI gère le paramètre ?q=... sur cette route.
    const url = searchQuery 
      ? `http://127.0.0.1:8000/movies?q=${searchQuery}` 
      : 'http://127.0.0.1:8000/movies';

    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des films');
        }
        return response.json();
      })
      .then(data => {
        setMovies(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [searchQuery]); // Le useEffect se redéclenche dès que searchQuery change

  if (loading) return <div className="message">⏳ Chargement des films...</div>;
  if (error) return <div className="message error">❌ Erreur : {error}</div>;

  return (
    <div className="movie-container">
      {/* Le titre change dynamiquement si on fait une recherche */}
      <h1>{searchQuery ? `Résultats pour "${searchQuery}"` : "🍿 IShowCinema - À l'affiche"}</h1>
      
      {movies.length === 0 && !loading && (
        <p className="message" style={{ color: 'white' }}>Aucun film trouvé.</p>
      )}

      <div className="movies-grid">
        {movies.map((movie, index) => (
          <div key={index} className="movie-card">
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