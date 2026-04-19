import { useEffect, useState } from 'react'; // 👈 INDISPENSABLE
import { useSearch } from '../context/SearchContext'; // 👈 INDISPENSABLE
import '../styles/Header.css'


function Header({ onLoginClick, onHomeClick, onProfileClick, currentView }) {
  const [username, setUsername] = useState(null);
  const { searchQuery, setSearchQuery } = useSearch();

  useEffect(() => {
    const savedUser = sessionStorage.getItem('username');
    if (savedUser) setUsername(savedUser);
  }, []);

  const isProfilePage = currentView === 'profile';

  return (
    <header className="header">
      
      {/* 1. Logo : Se centre si on est sur le profil */}
      <h1 
        onClick={onHomeClick} 
        className={`header-logo ${isProfilePage ? 'centered-logo' : ''}`}
      >
        🍿 IShowCinema
      </h1>

      {/* 2. Barre de recherche : Uniquement sur l'accueil */}
      {!isProfilePage && (
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
      
      {/* 3. Navigation : Masquée sur le profil */}
      {!isProfilePage && (
        <nav className="header-nav">
          {username ? (
            <>
              <span onClick={onProfileClick} className="user-profile">
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