import { useEffect, useState } from 'react';
import { useSearch } from '../context/SearchContext';
import '../styles/Header.css';

function Header({ onLoginClick, onHomeClick, onProfileClick }) {
  const [username, setUsername] = useState(null);
  const { searchQuery, setSearchQuery } = useSearch();

  // On vérifie la session au chargement
  useEffect(() => {
    const savedUser = sessionStorage.getItem('username');
    if (savedUser) {
      setUsername(savedUser);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('username');
    setUsername(null);
    if (onHomeClick) onHomeClick(); 
    window.location.reload(); 
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <header className="header">
      
      {/* 1. Logo / Titre (À gauche) */}
      <h1 onClick={onHomeClick} className="header-logo">
        🍿 IShowCinema
      </h1>

      {/* 2. Barre de recherche (Au centre) */}
      <form onSubmit={handleSearchSubmit} className="search-form">
        <input
          type="text"
          className="search-input"
          placeholder="Rechercher un film..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </form>
      
      {/* 3. Navigation utilisateur (À droite) */}
      <nav className="header-nav">
        {username ? (
          <>
            <span onClick={onProfileClick} className="user-profile">
              👤 {username}
            </span>
            {/* On utilise la classe btn-red qu'on a mise dans App.css */}
            <button onClick={handleLogout} className="btn-red">
              Déconnexion
            </button>
          </>
        ) : (
          <button onClick={onLoginClick} className="btn-red">
            Connexion / Inscription
          </button>
        )}
      </nav>

    </header>
  );
}

export default Header;