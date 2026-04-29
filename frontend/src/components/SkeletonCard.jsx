import '../styles/MovieList.css';

function SkeletonCard() {
  return (
    <div className="movie-card skeleton-card">
      {/* L'emplacement de l'affiche du film */}
      <div className="skeleton skeleton-image"></div>
      
      <div className="movie-info">
        <div className="info-top">
          {/* Faux titre et fausse année */}
          <div className="skeleton skeleton-text" style={{ height: '24px', width: '80%', marginBottom: '8px' }}></div>
          {/* Faux réalisateur */}
          <div className="skeleton skeleton-text" style={{ height: '16px', width: '50%', marginBottom: '15px' }}></div>
          {/* Faux badge de genre */}
          <div className="skeleton skeleton-badge" style={{ height: '24px', width: '30%' }}></div>
        </div>

        {/* Faux boutons du bas */}
        <div className="card-footer-grid" style={{ marginTop: '20px' }}>
          <div className="skeleton skeleton-button"></div>
          <div className="skeleton skeleton-button"></div>
        </div>
      </div>
    </div>
  );
}

export default SkeletonCard;