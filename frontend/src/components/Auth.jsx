import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

function Auth() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  
  const navigate = useNavigate(); // Hook de navigation
  const { login } = useAuth(); // On récupère la fonction login

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin && password !== confirmPassword) {
      alert("❌ Les mots de passe ne correspondent pas !");
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
          login(data.username);
          navigate('/'); 
        } else {
          alert("🎉 Compte créé ! Tu peux maintenant te connecter.");
          setIsLogin(true); 
          setPassword('');
          setConfirmPassword('');
        }
      } else {
        alert(data.detail || "Erreur lors de la requête");
      }
    } catch (error) {
      alert("Le serveur ne répond pas");
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
          onChange={(e) => setUsername(e.target.value)} 
          className="auth-input"
          required 
        />
        
        <input 
          type="password" 
          placeholder="Mot de passe" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          className="auth-input"
          required 
        />

        {/* --- CHAMP DE CONFIRMATION (Affiché seulement si Inscription) --- */}
        {!isLogin && (
          <input 
            type="password" 
            placeholder="Confirmer le mot de passe" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            className="auth-input fade-in" // On ajoute une petite classe d'animation
            required 
          />
        )}
        
        <button type="submit" className="btn-red auth-submit-btn">
          {isLogin ? 'Se connecter' : "S'inscrire"}
        </button>

        <p className="auth-toggle">
          {isLogin ? "Nouveau sur IShowCinema ?" : "Déjà membre ?"} 
          <span onClick={() => {
            setIsLogin(!isLogin);
            setConfirmPassword(''); // Reset quand on bascule
          }}>
            {isLogin ? " S'inscrire" : " Se connecter"}
          </span>
        </p>
      </form>
    </div>
  );
}

export default Auth;