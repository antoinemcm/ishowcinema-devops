import { useEffect, useState } from 'react';
import { useSearch } from '../context/SearchContext';
import '../styles/Header.css'

function Header({ onLoginClick, onHomeClick, onProfileClick, currentView }) {
  const [username, setUsername] = useState(null);
  const { searchQuery, setSearchQuery } = useSearch();

  useEffect(() => {
    const savedUser = sessionStorage.getItem('username');
    if (savedUser) setUsername(savedUser);
  }, []);

  // Définit les pages où on cache la recherche et la navigation
  const isSimpleMode = currentView === 'profile' || currentView === 'movie-details' || currentView === 'auth';

  return (
    <header className="header">
      
      {/* 1. Logo : Se centre si on est en mode simple */}
      <h1 
        onClick={onHomeClick} 
        className={`header-logo ${isSimpleMode ? 'centered-logo' : ''}`}
        style={{ cursor: 'pointer' }}
      >
        🍿 IShowCinema
      </h1>

      {/* 2. Barre de recherche : On l'affiche seulement si on n'est PAS en mode simple */}
      {!isSimpleMode && (
        <form onSubmit={(e) => e.preventDefault()} className="search-form">
          <input
            type="text"
            className="search-input"
            placeholder="Rechercher un film..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      )}
      
      {/* 3. Navigation : On l'affiche aussi seulement si on n'est PAS en mode simple */}
      {!isSimpleMode && (
        <nav className="header-nav">
          {username ? (
            <>
              <span onClick={onProfileClick} className="user-profile" style={{ cursor: 'pointer' }}>
                👤 {username}
              </span>
              <button onClick={() => {
                sessionStorage.removeItem('username');
                window.location.reload();
              }} className="btn-red">
                Déconnexion
              </button>
            </>
          ) : (
            <button onClick={onLoginClick} className="btn-red">
              Connexion / Inscription
            </button>
          )}
        </nav>
      )}

    </header>
  );
}

export default Header;