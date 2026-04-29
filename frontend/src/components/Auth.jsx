import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import '../styles/Auth.css';

function Auth() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState(null);
  
  const navigate = useNavigate();

  const { login, username: connectedUser } = useAuth();

  useEffect(() => {
    if (connectedUser) {
      navigate('/', { replace: true });
    }
  }, [connectedUser, navigate]);

  const getPasswordFeedback = (pwd) => {
    if (pwd.length === 0) return null;
    if (pwd.length < 8) return "Au moins 8 caractères";
    if (!/[A-Z]/.test(pwd)) return "Au moins une majuscule";
    if (!/[0-9]/.test(pwd)) return "Au moins un chiffre";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return "Au moins un caractère spécial (!@#$...)";
    return null;
  };

  const currentPasswordError = getPasswordFeedback(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!isLogin && currentPasswordError) {
      setFormError("Le mot de passe ne respecte pas tous les critères.");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setFormError("Les mots de passe ne correspondent pas !");
      return;
    }

    const endpoint = isLogin ? '/login' : '/signup';
    
    try {
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          toast.success(`Content de te revoir, ${data.username} !`);
          login(data.username, rememberMe);
          navigate('/'); 
        } else {
          toast.success("Compte créé ! Tu peux maintenant te connecter.");
          setIsLogin(true); 
          setPassword('');
          setConfirmPassword('');
        }
      } else {
        setFormError(data.detail || "Erreur lors de la requête");
      }
    } catch (error) {
      setFormError("Le serveur ne répond pas.");
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>{isLogin ? 'Connexion' : 'Inscription'}</h2>
        
        <input 
          type="text" 
          placeholder="Nom d'utilisateur" 
          value={username} 
          onChange={(e) => {
            setUsername(e.target.value);
            setFormError(null);
          }} 
          className="auth-input"
          required 
        />
        
        <input 
          type="password" 
          placeholder="Mot de passe" 
          value={password} 
          onChange={(e) => {
            setPassword(e.target.value);
            setFormError(null);
          }} 
          className="auth-input"
          required 
        />

        {!isLogin && currentPasswordError && password.length > 0 && (
          <p className="password-dynamic-error fade-in">
            {currentPasswordError}
          </p>
        )}

        {!isLogin && (
          <input 
            type="password" 
            placeholder="Confirmer le mot de passe" 
            value={confirmPassword} 
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setFormError(null);
            }} 
            className="auth-input fade-in" 
            required 
          />
        )}

        {isLogin && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px', marginBottom: '15px', color: '#b3b3b3', fontSize: '0.9rem' }}>
            <input 
              type="checkbox" 
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <label htmlFor="rememberMe" style={{ cursor: 'pointer', userSelect: 'none' }}>Se souvenir de moi</label>
          </div>
        )}

        {formError && (
          <p className="password-dynamic-error fade-in" style={{ textAlign: 'center', marginBottom: '15px' }}>
            {formError}
          </p>
        )}
        
        <button type="submit" className="btn-red auth-submit-btn">
          {isLogin ? 'Se connecter' : "S'inscrire"}
        </button>

        <p className="auth-toggle">
          {isLogin ? "Nouveau sur IShowCinema ?" : "Déjà membre ?"} 
          <span onClick={() => {
            setIsLogin(!isLogin);
            setFormError(null);
            setConfirmPassword(''); 
          }}>
            {isLogin ? " S'inscrire" : " Se connecter"}
          </span>
        </p>
      </form>
    </div>
  );
}

export default Auth;