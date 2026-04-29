import { useEffect, useState } from 'react';
import MovieCard from "../components/MovieCard"; 
import SkeletonCard from "../components/SkeletonCard";
import { useSearch } from '../context/SearchContext';
import { useAuth } from '../context/AuthContext';
import '../styles/MovieList.css';

function Home({ onMovieSelect }) {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [favoriteIds, setFavoriteIds] = useState([]); 

  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);


  const { searchQuery } = useSearch();
  const username = localStorage.getItem('username') || sessionStorage.getItem('username');

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    
    setIsLoading(true);

    const timer = setTimeout(() => {
      const baseUrl = "http://localhost:8000";
      const url = searchQuery 
        ? `${baseUrl}/movies?q=${searchQuery}&page=${page}` 
        : `${baseUrl}/movies?page=${page}`;
      
      fetch(url, { signal })
        .then(res => res.json())
        .then(data => {
          // DEBUG : Affichez ceci dans la console (F12) pour vérifier le format
          console.log("Données reçues :", data);

          // On gère les deux formats pour être sûr
          const fetchedMovies = data.results ? data.results : (Array.isArray(data) ? data : []);
          const total = data.total_pages ? data.total_pages : 1;

          setMovies(fetchedMovies);
          setTotalPages(total);
          setIsLoading(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            console.error("Erreur films:", err);
            setIsLoading(false);
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
    if (totalPages <= 1) return null; // Pas de menu si une seule page

    // 1. Toujours afficher la première page
    pages.push(
      <button key={1} className={`page-item ${page === 1 ? 'active' : ''}`} onClick={() => setPage(1)}>1</button>
    );

    // 2. Ellipse du début (si on est loin du début)
    if (page > 3) {
      pages.push(<span key="ellipsis-start" className="ellipsis" style={{ color: 'white', padding: '0 10px' }}>...</span>);
    }

    // 3. Pages autour de la page courante
    const startPage = Math.max(2, page - 1);
    const endPage = Math.min(totalPages - 1, page + 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button key={i} className={`page-item ${page === i ? 'active' : ''}`} onClick={() => setPage(i)}>{i}</button>
      );
    }

    // 4. Ellipse de fin (si on est loin de la fin)
    if (page < totalPages - 2) {
      pages.push(<span key="ellipsis-end" className="ellipsis" style={{ color: 'white', padding: '0 10px' }}>...</span>);
    }

    // 5. Toujours afficher la dernière page (si elle est différente de la page 1)
    if (totalPages > 1) {
      pages.push(
        <button key={totalPages} className={`page-item ${page === totalPages ? 'active' : ''}`} onClick={() => setPage(totalPages)}>{totalPages}</button>
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
        {isLoading ? (
          /* On génère 10 Skeletons pour simuler le chargement  */
          [...Array(10)].map((_, index) => (
            <SkeletonCard key={index} />
          ))
        ) : movies.length > 0 ? (
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
            Aucun film trouvé.
          </p>
        )}
      </div>

      {/* Rendu de la nouvelle pagination intelligente */}
      {!isLoading && totalPages > 1 && (
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
            disabled={page === totalPages}
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