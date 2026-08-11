import { useState } from "react";
import { searchMovies } from "../services/tmdb";

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
    } catch (err) {
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

      {movies.map((movie) => (
        <div key={movie.id}>
          {movie.poster_path && (
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              width="200"
            />
          )}

          <h2>{movie.title}</h2>
          <p>{movie.release_date?.slice(0, 4)}</p>
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

