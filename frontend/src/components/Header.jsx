import { useEffect, useState } from 'react';

function Header({ onLoginClick, onHomeClick, onProfileClick }) {
  const [username, setUsername] = useState(null);

  // On vérifie au chargement s'il y a un utilisateur dans le localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('username');
    if (savedUser) {
      setUsername(savedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('username'); // On vide la session
    setUsername(null);
    onHomeClick();
    window.location.reload(); // On recharge pour rafraîchir l'état global
  };

  return (
    <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', backgroundColor: '#141414', color: 'white' }}>
      <h1 onClick={onHomeClick} style={{ cursor: 'pointer', color: '#e50914' }}>IShowCinema</h1>
      
      <nav>
        {username ? (
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <span 
              onClick={onProfileClick} 
              style={{ cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}
            >
              👤 {username}
            </span>
            <button onClick={handleLogout} style={{ cursor: 'pointer' }}>Déconnexion</button>
          </div>
        ) : (
          <button onClick={onLoginClick} style={{ cursor: 'pointer' }}>Connexion / Inscription</button>
        )}
      </nav>
    </header>
  );
}

export default Header;