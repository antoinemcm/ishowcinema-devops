import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import '../styles/MovieDetails.css';

function MovieDetails() {
  const { id } = useParams(); // On extrait l'ID directement depuis l'URL (/movie/:id)
  const navigate = useNavigate(); // On prépare la navigation pour le bouton retour

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On utilise 'id' au lieu de 'movieId'
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
  }, [id]);

  if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>⏳ Chargement des détails...</div>;
  if (!movie) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>❌ Film introuvable.</div>;

  return (
    <div className="movie-details-page page-fade-in">
      {/* 6. navigate(-1) demande au navigateur de revenir à la page précédente */}
      <button className="btn-back" onClick={() => navigate(-1)}>← Retour</button>

      {/* Le contenu principal (Affiche + Infos) reste exactement le même */}
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