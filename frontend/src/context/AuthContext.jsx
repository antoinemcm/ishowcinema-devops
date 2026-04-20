import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [username, setUsername] = useState(null);

  // Au démarrage, on vérifie si l'utilisateur était déjà connecté
  useEffect(() => {
    const savedUser = sessionStorage.getItem('username');
    if (savedUser) setUsername(savedUser);
  }, []);

  // Fonction centralisée pour se connecter
  const login = (user) => {
    sessionStorage.setItem('username', user);
    setUsername(user); // Met à jour React en temps réel
  };

  // Fonction centralisée pour se déconnecter
  const logout = () => {
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