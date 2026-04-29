import './styles/App.css';
import { Routes, Route } from 'react-router-dom'; 
import Header from "./components/Header";
import Home from "./pages/Home";
import Auth from "./components/Auth";
import Profile from "./pages/Profile"; 
import MovieDetails from "./pages/MovieDetails";
import NotFound from "./pages/NotFound";
import { SearchProvider } from "./context/SearchContext";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <SearchProvider>
        <div className="App">
          <Header />
          <Toaster 
            position="top-center" 
            toastOptions={{
              style: {
                background: '#333',
                color: '#fff',
              },
            }} 
          />
          <main className="page-fade-in">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/movie/:id" element={<MovieDetails />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </SearchProvider>
    </AuthProvider>
  );
}

export default App;