import { useEffect, useState } from "react";
import { useRoom } from "../hooks/useRoom";
import { searchMovies, getMovieDetails } from "../services/tmdb";
import { addMovieToPool, startVoting } from "../services/rooms";
import { useMoviePool } from "../hooks/useMoviePool";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Film, Search, Plus, Check, Loader, X, Play } from "lucide-react";

const TMDB_GENRES = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

function formatTimestamp(timestamp) {
  if (!timestamp) return null;
  let date;
  if (typeof timestamp.toDate === "function") {
    date = timestamp.toDate();
  } else if (timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else if (typeof timestamp === "string" || typeof timestamp === "number") {
    date = new Date(timestamp);
  } else {
    return null;
  }
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getMovieGenres(movie) {
  if (Array.isArray(movie.genres) && movie.genres.length > 0) {
    return movie.genres.map((g) => (typeof g === "string" ? g : g.name));
  }
  if (Array.isArray(movie.genre_ids) && movie.genre_ids.length > 0) {
    return movie.genre_ids.map((id) => TMDB_GENRES[id]).filter(Boolean);
  }
  return [];
}

function MoviePoster({ path, alt }) {
  const [imgError, setImgError] = useState(false);

  if (!path || imgError) {
    return (
      <div className="movie-poster-placeholder">
        <Film size={26} className="placeholder-icon" />
        <span className="placeholder-text">No Poster Image</span>
      </div>
    );
  }

  return (
    <img
      className="movie-poster"
      src={`https://image.tmdb.org/t/p/w200${path}`}
      alt={alt}
      onError={() => setImgError(true)}
    />
  );
}

function MovieSelection() {
  const { roomCode } = useParams();
  const { room, loading: roomLoading, error: roomError } = useRoom(roomCode);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchPage, setSearchPage] = useState(1);
  const [totalSearchPages, setTotalSearchPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [addingMovieId, setAddingMovieId] = useState(null);
  const [startingVoting, setStartingVoting] = useState(false);
  const { user } = useAuth();

  const uid = user?.uid;
  const navigate = useNavigate();

  useEffect(() => {
    if (room?.status === "closed") {
      navigate("/", { replace: true });
    } else if (room?.status === "voting") {
      navigate(`/voting/${roomCode}`);
    }
  }, [room?.status, roomCode, navigate]);

  const {
    movies,
    loading: moviesLoading,
    error: moviesError,
  } = useMoviePool(roomCode);

  if (roomLoading || moviesLoading) {
    return (
      <div className="window-box">
        <div className="window-title-bar">
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Film size={14} /> Minna.exe
          </span>
        </div>
        <div className="window-content">
          <p style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <Loader size={16} className="spinner" /> Loading movie selection...
          </p>
        </div>
      </div>
    );
  }

  if (roomError || moviesError) {
    const activeError = roomError || moviesError;
    return (
      <div className="window-box">
        <div className="window-title-bar">
          <span>Error.exe</span>
        </div>
        <div className="window-content">
          <p style={{ color: "var(--color-error)" }}>{activeError}</p>
          <button onClick={() => navigate("/")} style={{ marginTop: "12px" }}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="window-box">
        <div className="window-title-bar">
          <span>Not Found.exe</span>
        </div>
        <div className="window-content">
          <p>Room not found.</p>
          <button onClick={() => navigate("/")} style={{ marginTop: "12px" }}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (room.status === "closed") {
    return (
      <div className="window-box">
        <div className="window-title-bar">
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Film size={14} /> Minna.exe
          </span>
        </div>
        <div className="window-content center-container" style={{ padding: "24px" }}>
          <h1 style={{ marginBottom: "12px" }}>Room Closed</h1>
          <p style={{ marginBottom: "16px" }}>
            This movie night session has been closed by the host.
          </p>
          <button className="btn-primary" onClick={() => navigate("/")}>
            Start a New Room
          </button>
        </div>
      </div>
    );
  }

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
    if (startingVoting) return;
    try {
      setStartingVoting(true);
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
    } finally {
      setStartingVoting(false);
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
    <div className="movie-selection-layout">
      {/* Left Column: Movie Search & Browse */}
      <main className="window-box movie-search-panel">
        <div className="window-title-bar">
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Film size={14} /> Minna.exe - Movie Selection
          </span>
          <button 
            onClick={() => navigate(`/lobby/${roomCode}`)}
            style={{ border: "none", background: "transparent", padding: "0 4px", display: "flex", alignItems: "center", cursor: "pointer", color: "inherit" }}
            aria-label="Back to room lobby"
          >
            <X size={12} />
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
              <button className="btn-primary" onClick={handleSearch} disabled={searching} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <Search size={14} /> Search
              </button>
            </div>
          </div>

          {error && <p style={{ color: "var(--color-error)", marginTop: "8px", fontFamily: "var(--font-mono)" }}>{error}</p>}
          {moviesError && <p style={{ color: "var(--color-error)", marginTop: "8px", fontFamily: "var(--font-mono)" }}>{moviesError}</p>}

          <div className="movie-grid" aria-label="Search Results">
            {hasSearched && searchResults.length === 0 && !searching && (
              <p style={{ gridColumn: "1/-1" }}>No movies found. Try a different search.</p>
            )}
            {searchResults.map((movie) => {
              const alreadyAdded = movies.some(
                (poolMovie) => poolMovie.tmdbId === movie.id
              );

              const releaseYear = movie.release_date
                ? movie.release_date.split("-")[0]
                : null;
              const movieGenres = getMovieGenres(movie);

              return (
                <div key={movie.id} className="movie-card">
                  <MoviePoster path={movie.poster_path} alt={movie.title} />

                  <h3 style={{ fontSize: "13px", height: "36px", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", marginTop: "4px" }}>
                    {movie.title}
                  </h3>

                  <div style={{ marginTop: "4px" }}>
                    {releaseYear && (
                      <span className="retro-chip" style={{ fontSize: "10px" }}>{releaseYear}</span>
                    )}
                    {movie.runtime && (
                      <span className="retro-chip secondary" style={{ fontSize: "10px" }}>{movie.runtime}m</span>
                    )}
                  </div>

                  {movieGenres.slice(0, 2).map((genre) => (
                    <span key={genre} className="retro-chip tertiary" style={{ fontSize: "9px", display: "inline-block", marginTop: "4px" }}>
                      {genre}
                    </span>
                  ))}

                  <button
                    onClick={() => handleAddMovie(movie)}
                    disabled={
                      alreadyAdded ||
                      movies.length >= 10 ||
                      addingMovieId === movie.id
                    }
                    style={{ width: "100%", marginTop: "auto", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                  >
                    {alreadyAdded ? (
                      <>
                        <Check size={14} /> Added
                      </>
                    ) : addingMovieId === movie.id ? (
                      <>
                        <Loader size={14} className="spinner" /> Adding...
                      </>
                    ) : movies.length >= 10 ? (
                      "Pool Full"
                    ) : (
                      <>
                        <Plus size={14} /> Add
                      </>
                    )}
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
        </div>
      </main>

      {/* Right Column: Selected Movies Panel */}
      <aside className="window-box selected-movies-panel">
        <div className="window-title-bar">
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Film size={14} /> Selected Movies ({movies.length}/10)
          </span>
        </div>
        <div className="window-content">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "12px" }}>
            <h2 id="movie-pool-heading" style={{ fontSize: "16px" }}>Selected Movies</h2>
            <span className="retro-chip tertiary">{movies.length} / 10 movies</span>
          </div>

          {moviesLoading && <p>Loading movie pool...</p>}

          {!moviesLoading && movies.length === 0 && (
            <p style={{ fontStyle: "italic" }}>No movies added yet.</p>
          )}

          <div className="selected-movies-grid" aria-labelledby="movie-pool-heading" aria-live="polite">
            {movies.map((movie) => (
              <div key={movie.id} className="movie-card">
                <MoviePoster path={movie.posterPath} alt={movie.title} />
                
                <h3 style={{ fontSize: "13px", marginTop: "4px" }}>{movie.title}</h3>

                <div style={{ marginTop: "4px" }}>
                  {movie.releaseDate && (
                    <span className="retro-chip" style={{ fontSize: "10px" }}>{movie.releaseDate.split("-")[0]}</span>
                  )}
                  {movie.runtime && (
                    <span className="retro-chip secondary" style={{ fontSize: "10px" }}>{movie.runtime}m</span>
                  )}
                  {movie.addedAt && (
                    <span className="retro-chip" style={{ fontSize: "9px", opacity: 0.85 }}>{formatTimestamp(movie.addedAt)}</span>
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
                disabled={!canStartVoting || startingVoting}
                style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              >
                {startingVoting ? (
                  <>
                    <Loader size={14} className="spinner" /> Starting...
                  </>
                ) : (
                  <>
                    <Play size={14} /> Start Voting
                  </>
                )}
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
      </aside>
    </div>
  );
}

export default MovieSelection;