import { useEffect, useState } from 'react';
import { useSearch } from '../context/SearchContext';

function Header({ onLoginClick, onHomeClick, onProfileClick }) {
  const [username, setUsername] = useState(null);
  const { searchQuery, setSearchQuery } = useSearch();

  // 1. Gestion de la session utilisateur
  useEffect(() => {
    const savedUser = localStorage.getItem('username');
    if (savedUser) {
      setUsername(savedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('username');
    setUsername(null);
    if (onHomeClick) onHomeClick(); // Retour à l'accueil
    window.location.reload(); 
  };

  // 2. Gestion de la recherche
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', backgroundColor: '#141414', color: 'white' }}>
      
      {/* Logo / Titre */}
      <h1 onClick={onHomeClick} style={{ cursor: 'pointer', color: '#e50914', margin: 0 }}>
        🍿 IShowCinema
      </h1>

      {/* Barre de recherche (au centre) */}
      <form onSubmit={handleSearchSubmit} className="search-form">
        <input
          type="text"
          className="search-input"
          placeholder="Rechercher un film..."
          value={searchQuery}
          onChange={handleSearchChange}
          style={{ padding: '8px', borderRadius: '4px', border: 'none', width: '250px' }}
        />
      </form>
      
      {/* Navigation utilisateur (à droite) */}
      <nav>
        {username ? (
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <span 
              onClick={onProfileClick} 
              style={{ cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}
            >
              👤 {username}
            </span>
            <button 
              onClick={handleLogout} 
              style={{ cursor: 'pointer', backgroundColor: '#e50914', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px' }}
            >
              Déconnexion
            </button>
          </div>
        ) : (
          <button 
            onClick={onLoginClick} 
            style={{ cursor: 'pointer', backgroundColor: '#e50914', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px' }}
          >
            Connexion / Inscription
          </button>
        )}
      </nav>
    </header>
  );
}

export default Header;