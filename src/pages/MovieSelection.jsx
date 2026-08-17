import { useEffect, useState } from "react";
import { useRoom } from "../hooks/useRoom";
import { searchMovies, getMovieDetails } from "../services/tmdb";
import { addMovieToPool, startVoting } from "../services/rooms";
import { useMoviePool } from "../hooks/useMoviePool";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function MovieSelection() {
  const { roomCode } = useParams();
  const { room } = useRoom(roomCode);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchPage, setSearchPage] = useState(1);
  const [totalSearchPages, setTotalSearchPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [addingMovieId, setAddingMovieId] = useState(null);
  const { user } = useAuth();

  const uid = user?.uid;
  const navigate = useNavigate();

  useEffect(() => {
    if (room?.status === "voting") {
      navigate(`/voting/${roomCode}`);
    }
  }, [room?.status, roomCode, navigate]);

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

      setSearchResults([]);
      setHasSearched(false);

      const data = await searchMovies(query, 1);

      setSearchResults(data.results);
      setSearchPage(data.page);
      setTotalSearchPages(data.totalPages);
      setHasSearched(true);
    } catch (err) {
      console.error("Movie search error:", err);
      setError("Something went wrong while searching.");
    } finally {
      setSearching(false);
    }
  }

  async function handleLoadMore() {
    if (loadingMore || searchPage >= totalSearchPages) {
      return;
    }

    try {
      setLoadingMore(true);
      setError("");

      const nextPage = searchPage + 1;

      const data = await searchMovies(query, nextPage);

      setSearchResults((currentResults) => [
        ...currentResults,
        ...data.results,
      ]);

      setSearchPage(data.page);
      setTotalSearchPages(data.totalPages);
    } catch (err) {
      console.error("Load more movies error:", err);
      setError("Failed to load more movies.");
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleStartVoting() {
    try {
      setError("");

      await startVoting(roomCode, uid);

      navigate(`/voting/${roomCode}`);
    } catch (err) {
      console.error("Start voting error:", err);

      if (err.message === "NOT_HOST") {
        setError("Only the host can start voting.");
      } else if (err.message === "ROOM_NOT_FOUND") {
        setError("Room not found.");
      } else if (err.message === "INVALID_STATUS") {
        setError("Voting cannot be started from the current room status.");
      } else {
        setError("Failed to start voting.");
      }
    }
  }

  async function handleAddMovie(movie) {

    console.log("=== ADD MOVIE DEBUG ===");
    console.log("UID:", uid);
    console.log("Room code:", roomCode);
    console.log("Room status:", room?.status);
    console.log("Room members:", room?.members);
    console.log("Is current UID a member:", room?.members?.[uid]);

    if (movies.length >= 10) {
      setError("You can only add 10 movies.");
      return;
    }

    try {
      setAddingMovieId(movie.id);
      setError("");

      const details = await getMovieDetails(movie.id);

      await addMovieToPool(roomCode, movie, details);
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
        {hasSearched && searchResults.length === 0 && !searching && (
          <p>No movies found. Try a different search.</p>
        )}
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
        }
        )}
        {hasSearched &&
          searchResults.length > 0 &&
          searchPage < totalSearchPages && (
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? "Loading..." : "Load More"}
            </button>
          )}
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

            <p>
              {movie.runtime
                ? `${movie.runtime} min`
                : "Runtime unavailable"}
            </p>

            <p>
              {movie.genres?.length > 0
                ? movie.genres.join(", ")
                : "Genres unavailable"}
            </p>

            {movie.overview && (
              <p>{movie.overview}</p>
            )}
          </div>
        ))}
      </div>

      <hr />

      <button
        onClick={handleStartVoting}
        disabled={!canStartVoting || !uid}
      >
        Start Voting
      </button>

      {!canStartVoting && (
        <p>Add at least 5 movies to start voting.</p>
      )}
    </div>
  );
}

export default MovieSelection;