import { useEffect, useState } from 'react';
import MovieCard from "../components/MovieCard"; 
import { useSearch } from '../context/SearchContext';
import '../styles/MovieList.css';

function Home({ onMovieSelect }) {
  const [movies, setMovies] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]); 
  const { searchQuery } = useSearch();
  const username = sessionStorage.getItem('username');

  useEffect(() => {
    const url = searchQuery 
      ? `http://localhost:8000/movies?q=${searchQuery}` 
      : 'http://localhost:8000/movies';
    
    fetch(url)
      .then(res => res.json())
      .then(data => setMovies(data))
      .catch(err => console.error("Erreur films:", err));
  }, [searchQuery]);

  useEffect(() => {
    if (username) {
      fetch(`http://localhost:8000/favorites-details/${username}`)
        .then(res => res.json())
        .then(data => setFavoriteIds(data.map(m => String(m.id))))
        .catch(err => console.error("Erreur favs:", err));
    }
  }, [username]);

  return (
    <div className="movie-container">
      <h2 style={{ textAlign: 'center', color: 'white', margin: '20px 0' }}>
        {searchQuery ? `Résultats : ${searchQuery}` : "🍿 Films Populaires"}
      </h2>
      <div className="movies-grid">
        {movies.length > 0 ? (
          movies.map((movie) => (
            <MovieCard 
              key={movie.id} 
              movie={movie} 
              isFavorite={favoriteIds.includes(String(movie.id))} 
              onDetailsClick={() => onMovieSelect(movie.id)}
            />
          ))
        ) : (
          <p style={{ textAlign: 'center', color: 'white' }}>Chargement des films...</p>
        )}
      </div>
    </div>
  );
}

export default Home;