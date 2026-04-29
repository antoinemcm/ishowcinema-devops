import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div style={{ textAlign: 'center', color: 'white', padding: '100px 20px', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ fontSize: '6rem', margin: '0', color: '#e50914' }}>404</h1>
      <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>Oups ! Cette page s'est perdue dans le multivers.</h2>
      <p style={{ marginBottom: '40px', color: '#b3b3b3', fontSize: '1.2rem', maxWidth: '600px' }}>
        Le film ou la page que vous cherchez n'existe pas, a été déplacé, ou a été effacé par Thanos.
      </p>
      <Link to="/" className="btn-red" style={{ textDecoration: 'none', padding: '12px 24px', fontSize: '1.1rem' }}>
        Retourner à l'accueil
      </Link>
    </div>
  );
}

export default NotFound;