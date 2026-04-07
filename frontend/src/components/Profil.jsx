import { useEffect, useState } from 'react';

function Profile() {
  const username = localStorage.getItem('username');

  return (
    <div className="container" style={{ padding: '40px', color: 'white', textAlign: 'center' }}>
      <h1>Mon Profil</h1>
      <div style={{ backgroundColor: '#222', padding: '20px', borderRadius: '10px', marginTop: '20px' }}>
        <h2>Bienvenue, {username} !</h2>
        <p>C'est ici que tu pourras bientôt voir tes films favoris.</p>
      </div>
      
      <div style={{ marginTop: '40px' }}>
        <h3>Mes Favoris ❤️</h3>
        <p style={{ color: '#888' }}>Vous n'avez pas encore de favoris.</p>
      </div>
    </div>
  );
}

export default Profile;