import { useSearch } from '../context/SearchContext';

function Header() {
  const { searchQuery, setSearchQuery } = useSearch();

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Empêche le rechargement de la page si on appuie sur Entrée
  };

  return (
    <header className="header">
      <h1>🍿 IShowCinema</h1>
      
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          className="search-input"
          placeholder="Rechercher un film..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </form>
    </header>
  );
}

export default Header;