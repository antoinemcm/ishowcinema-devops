import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import '../styles/MovieDetails.css';

function MovieDetails() {
  const { id } = useParams(); 
  const navigate = useNavigate(); 

  const [movie, setMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:8000/movies/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Film introuvable");
        return res.json();
      })
      .then(data => {
        setMovie(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur:", err);
        setLoading(false);
      });

    fetch(`http://localhost:8000/movies/${id}/recommendations`)
      .then(res => res.json())
      .then(data => setRecommendations(data))
      .catch(err => console.error("Erreur recommandations:", err));
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>⏳ Chargement des détails...</div>;
  if (!movie) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>❌ Film introuvable.</div>;

  return (
    <div className="movie-details-page page-fade-in">
      <button className="btn-back" onClick={() => navigate(-1)}>← Retour</button>

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
            <p>{movie.synopsis || "Le synopsis de ce film n'est pas encore disponible."}</p> 
          </div>
        </div>
      </div>

      {/* SECTION BANDE-ANNONCE */}
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

      {/* SECTION RECOMMANDATIONS (Nouveau) */}
      {recommendations.length > 0 && (
        <div className="reco-section">
          <h3>Vous aimerez aussi...</h3>
          <div className="reco-grid">
            {recommendations.map((rec) => (
              <div 
                key={rec.id} 
                className="reco-card" 
                onClick={() => navigate(`/movie/${rec.id}`)}
              >
                <img src={rec.image_url} alt={rec.title} />
                <div className="reco-info">
                  <h4>{rec.title}</h4>
                  <span>{rec.year}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MovieDetails;