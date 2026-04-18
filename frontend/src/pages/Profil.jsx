import { useEffect, useState } from 'react';
import MovieCard from '../components/MovieCard';
import '../styles/Profil.css'; 

function Profile() {
  const [favMovies, setFavMovies] = useState([]);
  const username = sessionStorage.getItem('username');

  // Fonction pour charger (ou rafraîchir) les favoris
  const loadFavorites = () => {
    if (username) {
      fetch(`http://localhost:8000/favorites-details/${username}`)
        .then(res => res.json())
        .then(data => setFavMovies(data))
        .catch(err => console.error("Erreur:", err));
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [username]);

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-info-main">
          <div className="profile-avatar">
            {username ? username[0].toUpperCase() : '?' }
          </div>
          <div className="profile-text">
            <h1>{username}</h1>
          </div>
        </div>
      </div>

      <div className="favorites-section">
        <h2 className="section-title">❤️ Mes Films Favoris</h2>
        
        {favMovies.length > 0 ? (
          <div className="movies-grid"> 
            {favMovies.map((movie) => (
              <MovieCard 
                key={movie.title} 
                movie={movie} 
                showRemove={true}  
                onRemove={loadFavorites} // On passe la fonction de recharge ici
              />
            ))}
          </div>
        ) : (
          <div className="no-favorites">
            <p>Ta liste est vide. Ajoute des films pour les voir apparaître ici !</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;