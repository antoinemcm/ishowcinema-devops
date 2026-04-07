import { useState } from 'react';
import './styles/App.css';
import Header from "./components/Header";
import Home from "./pages/Home";
import Auth from "./components/Auth";
import Profile from "./pages/Profil"; // On n'oublie pas d'importer la nouvelle page

function App() {
  // 'home' par défaut. Peut devenir 'auth' ou 'profile'
  const [view, setView] = useState('home');

  return (
    <div className="App">
      <Header 
        onLoginClick={() => setView('auth')} 
        onHomeClick={() => setView('home')}
        onProfileClick={() => setView('profile')}
      />

      <main>
        {/* On affiche le composant en fonction de la valeur de 'view' */}
        {view === 'home' && <Home />}
        
        {view === 'auth' && (
          <Auth onLoginSuccess={() => setView('home')} />
        )}

        {view === 'profile' && <Profile />}
      </main>
    </div>
  );
}

export default App;