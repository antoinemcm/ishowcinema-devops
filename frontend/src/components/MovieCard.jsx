import '../styles/MovieList.css';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function MovieCard({ movie, showRemove = false, onRemove, isFavorite, onAdd }) {
  // On vérifie les deux stockages pour respecter le choix "Se souvenir de moi"
  const currentUser = localStorage.getItem('username') || sessionStorage.getItem('username');
  const navigate = useNavigate(); 

  const handleAddFavorite = async () => {
    if (!currentUser) {
      // MODIFIÉ : Une belle erreur non bloquante
      toast.error("Connecte-toi pour ajouter des favoris !");
      return;
    }
    
    try {
      const params = new URLSearchParams({ username: currentUser, movie_title: movie.title, movie_id: movie.id });
      const response = await fetch(`http://localhost:8000/add-favorite?${params.toString()}`, { method: 'POST' });
      if (response.ok){
        if (onAdd) onAdd();
        toast.success(`${movie.title} a été ajouté aux favoris !`);
      } 
    } catch (error) {
      console.error("Erreur ajout favori:", error);
      toast.error("Erreur lors de l'ajout aux favoris.");
    }
  };

  const handleRemoveFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // SUPPRIMÉ : Le window.confirm() qui bloquait l'écran. 
    // L'action est maintenant immédiate et réversible par l'utilisateur s'il le souhaite.

    try {
      const params = new URLSearchParams({ username: currentUser, movie_title: movie.title, movie_id: movie.id });
      const response = await fetch(`http://localhost:8000/remove-favorite?${params.toString()}`, { method: 'POST' });
      
      if (response.ok) { 
        if (onRemove) onRemove(); 
        // NOUVEAU : On confirme discrètement le retrait
        toast.success(`"${movie.title}" retiré de tes favoris.`);
      }
    } catch (error) {
      // MODIFIÉ : Remplacement du alert()
      toast.error("Erreur lors de la suppression.");
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