import { useState } from 'react';

function Auth({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e) => {
  e.preventDefault();
  const endpoint = isLogin ? '/login' : '/signup';
  
  console.log("🚀 Tentative d'envoi vers:", endpoint);

  try {
    const response = await fetch(`http://localhost:8000${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    console.log("📡 Statut réponse serveur:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      alert(errorData.detail || "Erreur serveur");
      return;
    }

    // On vérifie si on peut lire le JSON
    const data = await response.json();
    console.log("✅ Données reçues du serveur:", data);

    if (data.username) {
      localStorage.setItem('username', data.username);
      onLoginSuccess(); 
      window.location.reload(); 
    }

  } catch (error) {
    // 💡 ICI ON LOG LA VRAIE ERREUR
    console.error("❌ ERREUR DÉTECTÉE :", error);
    alert("Erreur technique : " + error.message);
  }
};

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>{isLogin ? 'Connexion' : 'Inscription'}</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Pseudo" 
          value={username}
          onChange={(e) => setUsername(e.target.value)} 
        /><br/><br/>
        <input 
          type="password" 
          placeholder="Mot de passe" 
          value={password}
          onChange={(e) => setPassword(e.target.value)} 
        /><br/><br/>
        <button type="submit">{isLogin ? 'Se connecter' : "S'inscrire"}</button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)} style={{ marginTop: '10px', background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}>
        {isLogin ? "Pas de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
      </button>
    </div>
  );
}

export default Auth;