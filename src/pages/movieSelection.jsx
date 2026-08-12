import { useState } from "react";
import { searchMovies } from "../services/tmdb";
import { addMovieToPool } from "../services/rooms";
import { useMoviePool } from "../hooks/useMoviePool";
import { useParams } from "react-router-dom";

function MovieSelection() {
  const { roomCode } = useParams();
  console.log("Room code:", roomCode);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [addingMovieId, setAddingMovieId] = useState(null);

  const {
    movies,
    loading: moviesLoading,
    error: moviesError,
  } = useMoviePool(roomCode);

  async function handleSearch() {
    if (!query.trim()) {
      return;
    }

    try {
      setSearching(true);
      setError("");

      const results = await searchMovies(query);

      setSearchResults(results);
    } catch (err) {
      console.error("Movie search error:", err);
      setError("Something went wrong while searching.");
    } finally {
      setSearching(false);
    }
  }

  async function handleAddMovie(movie) {
    if (movies.length >= 10) {
      setError("You can only add 10 movies.");
      return;
    }

    try {
      setAddingMovieId(movie.id);
      setError("");

      await addMovieToPool(roomCode, movie);
    } catch (err) {
      console.error("Add movie error:", err);

      if (err.message === "MOVIE_ALREADY_ADDED") {
        setError("This movie is already in the pool.");
      } else {
        setError("Failed to add movie.");
      }
    } finally {
      setAddingMovieId(null);
    }
  }

  const canStartVoting = movies.length >= 5;

  return (
    <div>
      <h1>Movie Selection</h1>

      <p>Room Code: {roomCode}</p>

      <hr />

      <h2>Search Movies</h2>

      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            handleSearch();
          }
        }}
        placeholder="Search for a movie..."
      />

      <button onClick={handleSearch} disabled={searching}>
        {searching ? "Searching..." : "Search"}
      </button>

      {error && <p>{error}</p>}

      {moviesError && <p>{moviesError}</p>}

      <div>
        {searchResults.map((movie) => {
          const alreadyAdded = movies.some(
            (poolMovie) => poolMovie.tmdbId === movie.id
          );

          return (
            <div key={movie.id}>
              {movie.poster_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                  alt={movie.title}
                  width="150"
                />
              )}

              <h3>{movie.title}</h3>

              <p>
                {movie.release_date || "Release date unknown"}
              </p>

              <button
                onClick={() => handleAddMovie(movie)}
                disabled={
                  alreadyAdded ||
                  movies.length >= 10 ||
                  addingMovieId === movie.id
                }
              >
                {alreadyAdded
                  ? "Added"
                  : addingMovieId === movie.id
                    ? "Adding..."
                    : movies.length >= 10
                      ? "Pool Full"
                      : "Add"}
              </button>
            </div>
          );
        })}
      </div>

      <hr />

      <h2>Movie Pool</h2>

      <p>
        {movies.length} / 10 movies
      </p>

      {moviesLoading && <p>Loading movie pool...</p>}

      {!moviesLoading && movies.length === 0 && (
        <p>No movies added yet.</p>
      )}

      <div>
        {movies.map((movie) => (
          <div key={movie.id}>
            <h3>{movie.title}</h3>

            <p>
              {movie.releaseDate || "Release date unknown"}
            </p>
          </div>
        ))}
      </div>

      <hr />

      <button disabled={!canStartVoting}>
        Start Voting
      </button>

      {!canStartVoting && (
        <p>Add at least 5 movies to start voting.</p>
      )}
    </div>
  );
}

export default MovieSelection;