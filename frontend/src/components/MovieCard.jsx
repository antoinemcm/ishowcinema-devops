import '../styles/MovieList.css';
import { useNavigate } from 'react-router-dom';

function MovieCard({ movie, showRemove = false, onRemove, isFavorite, onAdd }) {
  const currentUser = sessionStorage.getItem('username');
  const navigate = useNavigate(); // Hook de navigation

  const handleAddFavorite = async () => {
    if (!currentUser) return alert("Connecte-toi pour ajouter des favoris !");
    try {
      const params = new URLSearchParams({ username: currentUser, movie_title: movie.title, movie_id: movie.id });
      const response = await fetch(`http://localhost:8000/add-favorite?${params.toString()}`, { method: 'POST' });
      if (response.ok){
        if (onAdd) onAdd();
        alert(`❤️ "${movie.title}" a été ajouté !`);
      } 
    } catch (error) {
      console.error("Erreur ajout favori:", error);
    }
  };

  const handleRemoveFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Retirer "${movie.title}" de tes favoris ?`)) return;

    try {
      const params = new URLSearchParams({ username: currentUser, movie_title: movie.title, movie_id: movie.id });
      const response = await fetch(`http://localhost:8000/remove-favorite?${params.toString()}`, { method: 'POST' });
      if (response.ok) { if (onRemove) onRemove(); }
    } catch (error) {
      alert("Erreur lors de la suppression");
    }
  };

  return (
    <div className="movie-card">
      <img src={movie.image_url} alt={movie.title} />
      <div className="movie-info">
        <div className="info-top">
          <h2>{movie.title} <span>({movie.year})</span></h2>
          <p className="director">De {movie.director}</p>
          <div className="badges-container">
            <span className="genre-badge">{movie.genre}</span>
          </div>
        </div>

        <div className="card-footer-grid">
          {/* Nouveau comportement du bouton Détails */}
          <button className="btn-grid btn-grid-details" onClick={() => navigate(`/movie/${movie.id}`)}>
            ℹ️ Détails
          </button>

          {showRemove ? (
            <button className="btn-grid btn-grid-remove" onClick={handleRemoveFavorite}>
              ✖ Retirer
            </button>
          ) : (
            isFavorite ? (
              <button className="btn-grid btn-grid-added" disabled>
                ✅ Ajouté
              </button>
            ) : (
              <button className="btn-grid btn-grid-fav" onClick={handleAddFavorite}>
                ❤️ Favoris
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default MovieCard;