import { useEffect, useState } from 'react';
import '../styles/MovieDetails.css';

function MovieDetails({ movieId, onBack }) {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:8000/movies/${movieId}`)
      .then(res => res.json())
      .then(data => {
        setMovie(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur:", err);
        setLoading(false);
      });
  }, [movieId]);

  if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>⏳ Chargement des détails...</div>;
  if (!movie) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>❌ Film introuvable.</div>;

  return (
    <div className="movie-details-page page-fade-in">
      <button className="btn-back" onClick={onBack}>← Retour</button>

      {/* Le contenu principal (Affiche + Infos) */}
      <div className="details-content">
        <div className="details-poster">
          <img src={movie.image_url} alt={movie.title} />
        </div>
        
        <div className="details-info">
          <h1>{movie.title} <span>({movie.year})</span></h1>
          <p className="details-director">Réalisé par <strong>{movie.director}</strong></p>
          
          {movie.actors && (
            <div className="details-cast">
              <strong>Avec : </strong><span>{movie.actors.join(', ')}</span>
            </div>
          )}

          <div className="details-badges">
            <span className="genre-badge">{movie.genre}</span>
          </div>

          <div className="details-synopsis">
            <h3>Synopsis</h3>
            <p>
              {movie.synopsis || "Le synopsis de ce film n'est pas encore disponible. Reviens plus tard !"}
             </p> 
          </div>
        </div>
      </div>

      {movie.trailer_url && (
        <div className="details-trailer-full">
          <h3>Bande-annonce</h3>
          <div className="video-responsive">
            <iframe
              src={movie.trailer_url}
              title="YouTube trailer"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}

export default MovieDetails;