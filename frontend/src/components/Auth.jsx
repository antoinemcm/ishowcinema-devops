import { useState } from 'react';
import '../styles/Auth.css';

function Auth({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Nouvel état
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- VÉRIFICATION DU MOT DE PASSE ---
    if (!isLogin && password !== confirmPassword) {
      alert("❌ Les mots de passe ne correspondent pas !");
      return; // On arrête tout ici
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
          sessionStorage.setItem('username', data.username);
          if (onLoginSuccess) onLoginSuccess();
          window.location.reload(); 
        } else {
          alert("🎉 Compte créé ! Tu peux maintenant te connecter.");
          setIsLogin(true); 
          setPassword('');
          setConfirmPassword(''); // On vide aussi la confirmation
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