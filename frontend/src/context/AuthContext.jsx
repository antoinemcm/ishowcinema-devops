import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const savedUser = sessionStorage.getItem('username');
    if (savedUser) setUsername(savedUser);
  }, []);

  const login = (user) => {
    sessionStorage.setItem('username', user);
    setUsername(user); 
  };

  const logout = () => {
    sessionStorage.removeItem('username');
    setUsername(null);
    window.location.href = '/';
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