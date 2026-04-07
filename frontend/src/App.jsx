import { useState } from 'react';
import './styles/App.css';
import Header from "./components/Header";
import Home from "./pages/Home";
import Auth from "./components/Auth";
import Profile from "./pages/Profile"; // Vérifie bien si c'est Profile ou Profil (avec ou sans 'e')
import { SearchProvider } from "./context/SearchContext";

function App() {
  // L'état 'view' gère quelle page est affichée : 'home', 'auth', ou 'profile'
  const [view, setView] = useState('home');

  // Fonction pour gérer le succès du login et rediriger vers l'accueil
  const handleLoginSuccess = () => {
    setView('home');
  };

  return (
    <SearchProvider>
      <div className="App">
        {/* On passe les fonctions de navigation au Header */}
        <Header 
          onLoginClick={() => setView('auth')} 
          onHomeClick={() => setView('home')}
          onProfileClick={() => setView('profile')}
        />

        <main>
          {/* Affichage conditionnel selon la vue active */}
          {view === 'home' && <Home />}
          
          {view === 'auth' && (
            <Auth onLoginSuccess={handleLoginSuccess} />
          )}

          {view === 'profile' && <Profile />}
        </main>
      </div>
    </SearchProvider>
  );
}

export default App;