import { useState } from 'react';
import './styles/App.css';
import Header from "./components/Header";
import Home from "./pages/Home";
import Auth from "./components/Auth";
import Profile from "./components/Profil"; // Vérifie bien si c'est Profil ou Profile dans ton dossier components
import { SearchProvider } from "./context/SearchContext";

function App() {
  const [view, setView] = useState('home');

  const handleLoginSuccess = () => {
    setView('home');
  };

  return (
    <SearchProvider>
      <div className="App">
        <Header 
          onLoginClick={() => setView('auth')} 
          onHomeClick={() => setView('home')}
          onProfileClick={() => setView('profile')}
        />

        <main>
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