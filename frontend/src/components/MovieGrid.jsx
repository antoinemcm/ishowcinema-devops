import { useState, useEffect } from 'react';
import { useSearch } from '../context/SearchContext';
import '../styles/MovieList.css';
import MovieCard from './MovieCard';

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
    // Dans MovieList.jsx, remplace la ligne de l'URL par :
    const url = searchQuery 
      ? `http://localhost:8000/movies?q=${searchQuery}` 
      : 'http://localhost:8000/movies';

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
    <h1>{searchQuery ? `Résultats pour "${searchQuery}"` : "🍿 IShowCinema - À l'affiche"}</h1>
    
    <div className="movies-grid">
      {movies.map((movie) => (
        <MovieCard key={movie.id || movie.title} movie={movie} />
      ))}
    </div>
  </div>
);
}

export default MovieList;