import MovieCard from "./MovieCard";
import fightClub from "../assets/images/image_1.jpeg";
import whiplash from "../assets/images/image_2.jpeg";


function MovieGrid() {
  const movies = [
    {
      id: 1,
      title: "Fight Club",
      year: 1999,
      rating: 4.5,
      description: "An insomniac meets a mysterious soap maker.",
      image: fightClub
    },
    {
      id: 2,
      title: "Whiplash",
      year: 2014,
      rating: 4.7,
      description: "A drummer pushed to his limits.",
      image: whiplash
    }
  ];

  return (
    <div className="grid">
      {movies.map(movie => (
        <MovieCard key={movie.id} {...movie} />
      ))}
    </div>
  );
}

export default MovieGrid;
