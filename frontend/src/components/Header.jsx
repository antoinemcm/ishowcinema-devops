import { useEffect, useState } from 'react';
import { useSearch } from '../context/SearchContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom'; 
import '../styles/Header.css'

function Header() {
  const { searchQuery, setSearchQuery } = useSearch();
  const { username, logout } = useAuth(); // On récupère username et logout

  // Hooks de navigation
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout(); // On utilise la fonction du Context
    navigate('/'); 
  };

  // On vérifie le chemin actuel pour le mode simple
  const isSimpleMode = location.pathname.includes('/profile') || 
                       location.pathname.includes('/movie') || 
                       location.pathname.includes('/auth');

  return (
    <header className="header">
      {/* 1. Logo avec composant Link */}
      <Link to="/" className={`header-logo ${isSimpleMode ? 'centered-logo' : ''}`} style={{ textDecoration: 'none' }}>
        <h1>🍿 IShowCinema</h1>
      </Link>

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
      
      {!isSimpleMode && (
        <nav className="header-nav">
          {username ? (
            <>
              {/* Remplacé le span par un Link vers le profil */}
              <Link to="/profile" className="user-profile" style={{ textDecoration: 'none' }}>
                👤 {username}
              </Link>
              <button onClick={handleLogout} className="btn-red">
                Déconnexion
              </button>
            </>
          ) : (
            <button onClick={() => navigate('/auth')} className="btn-red">
              Connexion
            </button>
          )}
        </nav>
      )}
    </header>
  );
}

export default Header;