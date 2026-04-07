import './styles/App.css'
import Header from "./components/Header";
import Home from "./pages/Home";
import { SearchProvider } from "./context/SearchContext";

function App() {
  return (
    <SearchProvider>
      <Header />
      <Home />
    </SearchProvider>
  );
}

export default App;