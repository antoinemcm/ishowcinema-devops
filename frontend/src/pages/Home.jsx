import { useEffect, useState } from 'react';
import MovieCard from "../components/MovieCard"; 
import { useSearch } from '../context/SearchContext';
import { useAuth } from '../context/AuthContext';
import '../styles/MovieList.css';

function Home({ onMovieSelect }) {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [favoriteIds, setFavoriteIds] = useState([]); 
  const { searchQuery } = useSearch();
  const username = useAuth();


  useEffect(() => {
    setPage(1);
  }, [searchQuery]);


  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    const timer = setTimeout(() => {
      setMovies([]); 
      const baseUrl = "http://localhost:8000";
      const url = searchQuery 
        ? `${baseUrl}/movies?q=${searchQuery}&page=${page}` 
        : `${baseUrl}/movies?page=${page}`;
      
      fetch(url, { signal })
        .then(res => res.json())
        .then(data => {
          setMovies(data);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            console.error("Erreur films:", err);
          }
        });
    }, 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, page]);

  useEffect(() => {
    if (username) {
      fetch(`http://localhost:8000/favorites-details/${username}`)
        .then(res => res.json())
        .then(data => setFavoriteIds(data.map(m => String(m.id))))
        .catch(err => console.error("Erreur favs:", err));
    } else {
      setFavoriteIds([]);
    }
  }, [username]);

  const handleMovieAdded = (movieId) => {
    setFavoriteIds(prevIds => [...prevIds, String(movieId)]);
  };


  const renderPagination = () => {
    const pages = [];
    const startPage = Math.max(1, page - 2);
    const endPage = page + 2;

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button 
          key={i} 
          className={`page-item ${page === i ? 'active' : ''}`}
          onClick={() => setPage(i)}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="movie-container">
      <h2 style={{ textAlign: 'center', color: 'white', margin: '20px 0' }}>
        {searchQuery ? `Résultats pour "${searchQuery}"` : "🍿 Films Populaires"}
      </h2>

      <div className="movies-grid">
        {movies.length > 0 ? (
          movies
            .filter((movie, index, self) => 
                index === self.findIndex((m) => m.id === movie.id)
            )
            .map((movie) => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                isFavorite={favoriteIds.includes(String(movie.id))} 
                onAdd={() => handleMovieAdded(movie.id)}
              />
            ))
        ) : (
          <p style={{ textAlign: 'center', color: 'white', gridColumn: '1/-1', padding: '40px' }}>
            Chargement des films...
          </p>
        )}
      </div>

      {movies.length > 0 && (
        <div className="pagination-bar">
          <button 
            disabled={page === 1} 
            onClick={() => setPage(page - 1)}
            className="page-nav"
          >
            &laquo; Précédent
          </button>
          
          {renderPagination()}

          <button 
            onClick={() => setPage(page + 1)}
            className="page-nav"
          >
            Suivant &raquo;
          </button>
        </div>
      )}
    </div>
  );
}

export default Home;