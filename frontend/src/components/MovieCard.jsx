function MovieCard({ title, year, rating, description, image }) {
  return (
    <div className="card">
      <img src={image} alt={title} />

      <div className="card-content">
        <h2>{title}</h2>

        <p className="meta">
          {year} • ⭐ {rating}
        </p>

        <p className="desc">{description}</p>
      </div>
    </div>
  );
}

export default MovieCard;
