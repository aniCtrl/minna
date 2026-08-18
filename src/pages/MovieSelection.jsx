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


    if (movies.length >= 10) {
      setError("You can only add 10 movies.");
      return;
    }

    try {
      setAddingMovieId(movie.id);
      setError("");

      let details = null;

      try {
        details = await getMovieDetails(movie.id);
      } catch (err) {
        console.warn("Movie details unavailable. Adding with search data.", err);
      }

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
  const isHost = uid && room?.hostUid === uid;

  return (
    <div className="window-box">
      <div className="window-title-bar">
        <span>Minna.exe - Movie Selection</span>
        <button 
          onClick={() => navigate(`/lobby/${roomCode}`)}
          style={{ border: "none", background: "transparent", padding: "0 4px", fontSize: "12px", cursor: "pointer", color: "inherit" }}
        >
          X
        </button>
      </div>
      <div className="window-content">
        <h1 style={{ marginBottom: "12px" }}>Movie Selection</h1>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "13px", marginBottom: "16px" }}>Room Code: {roomCode}</p>

        <div className="form-group">
          <label htmlFor="searchQuery">Search Movies</label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              id="searchQuery"
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
            <button className="btn-primary" onClick={handleSearch} disabled={searching}>
              {searching ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        {error && <p style={{ color: "var(--color-error)", marginTop: "8px", fontFamily: "var(--font-mono)" }}>{error}</p>}
        {moviesError && <p style={{ color: "var(--color-error)", marginTop: "8px", fontFamily: "var(--font-mono)" }}>{moviesError}</p>}

        <div className="movie-grid">
          {hasSearched && searchResults.length === 0 && !searching && (
            <p style={{ gridColumn: "1/-1" }}>No movies found. Try a different search.</p>
          )}
          {searchResults.map((movie) => {
            const alreadyAdded = movies.some(
              (poolMovie) => poolMovie.tmdbId === movie.id
            );

            return (
              <div key={movie.id} className="movie-card">
                {movie.poster_path ? (
                  <img
                    className="movie-poster"
                    src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                    alt={movie.title}
                  />
                ) : (
                  <div className="retro-inset movie-poster" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "8px", textAlign: "center", fontSize: "11px", backgroundColor: "#fff" }}>
                    No Poster Image
                  </div>
                )}

                <h3 style={{ fontSize: "13px", height: "36px", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", marginTop: "4px" }}>
                  {movie.title}
                </h3>

                <p style={{ fontSize: "11px", color: "#666" }}>
                  {movie.release_date ? movie.release_date.split("-")[0] : "Unknown Year"}
                </p>

                <button
                  onClick={() => handleAddMovie(movie)}
                  disabled={
                    alreadyAdded ||
                    movies.length >= 10 ||
                    addingMovieId === movie.id
                  }
                  style={{ width: "100%", marginTop: "auto" }}
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

        {hasSearched &&
          searchResults.length > 0 &&
          searchPage < totalSearchPages && (
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              style={{ width: "100%", marginTop: "16px" }}
            >
              {loadingMore ? "Loading..." : "Load More Movies"}
            </button>
          )}

        <hr className="retro-divider" />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "12px" }}>
          <h2>Movie Pool</h2>
          <span className="retro-chip tertiary">{movies.length} / 10 movies</span>
        </div>

        {moviesLoading && <p>Loading movie pool...</p>}

        {!moviesLoading && movies.length === 0 && (
          <p style={{ fontStyle: "italic" }}>No movies added yet.</p>
        )}

        <div className="movie-grid" style={{ marginBottom: "24px" }}>
          {movies.map((movie) => (
            <div key={movie.id} className="movie-card">
              {movie.posterPath ? (
                <img
                  className="movie-poster"
                  src={`https://image.tmdb.org/t/p/w200${movie.posterPath}`}
                  alt={movie.title}
                />
              ) : (
                <div className="retro-inset movie-poster" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "8px", textAlign: "center", fontSize: "11px", backgroundColor: "#fff" }}>
                  No Poster Image
                </div>
              )}
              
              <h3 style={{ fontSize: "13px", marginTop: "4px" }}>{movie.title}</h3>

              <div style={{ marginTop: "4px" }}>
                {movie.releaseDate && (
                  <span className="retro-chip" style={{ fontSize: "10px" }}>{movie.releaseDate.split("-")[0]}</span>
                )}
                {movie.runtime && (
                  <span className="retro-chip secondary" style={{ fontSize: "10px" }}>{movie.runtime}m</span>
                )}
              </div>

              {movie.genres?.slice(0, 2).map((genre) => (
                <span key={genre} className="retro-chip tertiary" style={{ fontSize: "9px", display: "inline-block", marginTop: "4px" }}>
                  {genre}
                </span>
              ))}
            </div>
          ))}
        </div>

        <hr className="retro-divider" />

        {isHost ? (
          <>
            <button
              className="btn-primary"
              onClick={handleStartVoting}
              disabled={!canStartVoting}
              style={{ width: "100%" }}
            >
              Start Voting
            </button>

            {!canStartVoting && (
              <p style={{ marginTop: "8px", fontStyle: "italic", textAlign: "center" }}>
                Add at least 5 movies to start voting.
              </p>
            )}
          </>
        ) : (
          <p style={{ textAlign: "center", fontStyle: "italic" }}>
            {canStartVoting
              ? "Waiting for the host to start voting..."
              : "Add at least 5 movies. The host will start voting."}
          </p>
        )}
      </div>
    </div>
  );
}

export default MovieSelection;