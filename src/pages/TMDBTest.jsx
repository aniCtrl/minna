import { useState } from "react";
import { searchMovies } from "../services/tmdb";

import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

function TMDBTest() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch() {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError("");

      const results = await searchMovies(query);
      setMovies(results);
    } catch {
      setError("Something went wrong while searching.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>TMDB Test</h1>

      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search for a movie..."
      />

      <button onClick={handleSearch}>Search</button>

      {loading && <p>Loading...</p>}

      {error && <p>{error}</p>}

      {loading && (
        <LoadingState message="Searching TMDB..." />
      )}

      {error && (
        <ErrorState message={error} />
      )}

      {!loading && !error && movies.length === 0 && query && (
        <p>No movies found. Try a different search.</p>
      )}

      {!loading &&
        !error &&
        movies.length > 0 &&
        movies.map((movie) => (
          <div key={movie.id}>
            <h2>{movie.title}</h2>
            <p>{movie.release_date}</p>
          </div>
        ))}
    </div>
  );
}
console.log(
  "TMDB token exists:",
  Boolean(import.meta.env.VITE_TMDB_ACCESS_TOKEN)
);

export default TMDBTest;

