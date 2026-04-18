import '../styles/MovieList.css';

function MovieCard({ movie, showRemove = false, onRemove }) {
  const currentUser = sessionStorage.getItem('username');

  const handleAddFavorite = async () => {
    if (!currentUser) return alert("Connecte-toi !");
    const params = new URLSearchParams({ username: currentUser, movie_title: movie.title, movie_id: movie.id });
    const response = await fetch(`http://localhost:8000/add-favorite?${params.toString()}`, { method: 'POST' });
    if (response.ok) {
      alert(`❤️ "${movie.title}" a été ajouté à tes favoris !`);
    }
  };

  const handleRemoveFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Retirer "${movie.title}" ?`)) return;

    try {
      const params = new URLSearchParams({ username: currentUser, movie_title: movie.title, movie_id: movie.id });
      const response = await fetch(`http://localhost:8000/remove-favorite?${params.toString()}`, { method: 'POST' });

      if (response.ok) {
        // AU LIEU DE RELOAD : on appelle la fonction de mise à jour du parent
        if (onRemove) {
            onRemove(); 
        }
      }
    } catch (error) {
      alert("Erreur serveur");
    }
  };

  return (
    <div className="movie-card">
      <img src={movie.image_url} alt={movie.title} />
      <div className="movie-info">
        <h2>{movie.title} <span>({movie.year})</span></h2>
        <p className="director">De {movie.director}</p>
        <div className="card-footer">
          <span className="genre-badge">{movie.genre}</span>
          <div className="card-actions">
            {!showRemove ? (
              <button className="btn-fav" onClick={handleAddFavorite}>❤️</button>
            ) : (
              <button className="btn-remove" onClick={handleRemoveFavorite}>✖</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieCard;