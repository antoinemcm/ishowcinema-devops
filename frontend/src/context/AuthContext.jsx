import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [username, setUsername] = useState(null);

  // Au démarrage, on vérifie s'il y a des données dans le localStorage ou dans la Session
  useEffect(() => {
    const savedUser = localStorage.getItem('username') || sessionStorage.getItem('username');
    if (savedUser) setUsername(savedUser);
  }, []);

  // La fonction login accepte maintenant un paramètre pour le choix de l'utilisateur
  const login = (user, rememberMe = false) => {
    if (rememberMe) {
      localStorage.setItem('username', user);
    } else {
      sessionStorage.setItem('username', user);
    }
    setUsername(user);
  };

  // À la déconnexion, on nettoie les deux stockages par précaution
  const logout = () => {
    localStorage.removeItem('username');
    sessionStorage.removeItem('username');
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}