function MovieCard(props) {
  return (
    <div className="card">
      <img src={props.img} alt={props.title} />

      <div className="card-content">
        <h2>{props.title}</h2>

        <p className="meta">
          {props.year} • ⭐ {props.rating}
        </p>

        <p className="desc">{description}</p>
      </div>
    </div>
  );
}

export default MovieCard;
