import MovieGrid from "../components/MovieGrid";

function Home() {
  return (
    <div className="container">
      <h2 style={{ textAlign: 'center', margin: '20px 0' }}>Films Populaires</h2>
      <MovieGrid />
    </div>
  );
}

export default Home;