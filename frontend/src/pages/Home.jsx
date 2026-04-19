import { useEffect, useState } from 'react';
import MovieCard from "../components/MovieCard"; 
import { useSearch } from '../context/SearchContext';
import '../styles/MovieList.css';

function Home({ onMovieSelect }) {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [favoriteIds, setFavoriteIds] = useState([]); 
  const { searchQuery } = useSearch();
  const username = sessionStorage.getItem('username');

  // 1. Reset à la page 1 lors d'une nouvelle recherche
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  // 2. Chargement des films avec nettoyage (évite les mélanges de pages)
  useEffect(() => {
    // On vide la liste actuelle pour montrer que ça charge et éviter les doublons visuels
    setMovies([]); 

    const url = searchQuery 
      ? `http://localhost:8000/movies?q=${searchQuery}&page=${page}` 
      : `http://localhost:8000/movies?page=${page}`;
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setMovies(data);
        // Retour en haut de page fluide pour la nouvelle liste
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch(err => console.error("Erreur films:", err));
  }, [searchQuery, page]);

  // 3. Chargement des favoris pour l'état des boutons ❤️
  useEffect(() => {
    if (username) {
      fetch(`http://localhost:8000/favorites-details/${username}`)
        .then(res => res.json())
        .then(data => setFavoriteIds(data.map(m => String(m.id))))
        .catch(err => console.error("Erreur favs:", err));
    }
  }, [username]);

  const handleMovieAdded = (movieId) => {
    setFavoriteIds(prevIds => [...prevIds, String(movieId)]);
  };

  // 4. Construction de la barre de numéros de page
  const renderPagination = () => {
    const pages = [];
    // Affiche 2 pages avant et 2 pages après la page actuelle
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
            // SÉCURITÉ ANTI-DOUBLONS : on ne garde que la première occurrence de chaque ID
            .filter((movie, index, self) => 
                index === self.findIndex((m) => m.id === movie.id)
            )
            .map((movie) => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                isFavorite={favoriteIds.includes(String(movie.id))} 
                onDetailsClick={() => onMovieSelect(movie.id)}
                onAdd={() => handleMovieAdded(movie.id)}
              />
            ))
        ) : (
          <p style={{ textAlign: 'center', color: 'white', gridColumn: '1/-1', padding: '40px' }}>
            Chargement des films...
          </p>
        )}
      </div>

      {/* Barre de Pagination */}
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