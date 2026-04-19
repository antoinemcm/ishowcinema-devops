import { useState } from 'react';
import './styles/App.css';
import Header from "./components/Header";
import Home from "./pages/Home";
import Auth from "./components/Auth";
import Profile from "./pages/Profil"; 
import MovieDetails from "./pages/MovieDetails";
import { SearchProvider } from "./context/SearchContext";

function App() {
  const [view, setView] = useState('home');
  const [selectedMovieId, setSelectedMovieId] = useState(null);

  const handleLoginSuccess = () => {
    setView('home');
  };

  const handleMovieSelect = (id) => {
    setSelectedMovieId(id);
    setView('movie-details');
  };

  return (
    <SearchProvider>
      <div className="App">
        <Header 
          onLoginClick={() => setView('auth')} 
          onHomeClick={() => setView('home')}
          onProfileClick={() => setView('profile')}
          currentView={view} 
        />

        <main className="page-fade-in">
          {view === 'home' && <Home onMovieSelect={handleMovieSelect} />}
          {view === 'auth' && <Auth onLoginSuccess={handleLoginSuccess} />}
          {view === 'profile' && <Profile onMovieSelect={handleMovieSelect} />}
          
          {view === 'movie-details' && (
            <MovieDetails 
              movieId={selectedMovieId} 
              onBack={() => setView('home')} 
            />
          )}
        </main>
      </div>
    </SearchProvider>
  );
}

export default App;