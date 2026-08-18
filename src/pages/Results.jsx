import { useNavigate, useParams } from "react-router-dom";

import { useRoom } from "../hooks/useRoom";
import { useMembers } from "../hooks/useMembers";
import { useMoviePool } from "../hooks/useMoviePool";
import { useAllVotes } from "../hooks/useAllVotes";
import { computeMatches } from "../services/votes";
import { Film, Award, Frown, X, ArrowLeft, Loader } from "lucide-react";

import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

function Results() {
  const { roomCode } = useParams();
  const navigate = useNavigate();

  const {
    room,
    loading: roomLoading,
    error: roomError,
  } = useRoom(roomCode);

  const members = useMembers(room);

  const {
    movies,
    loading: moviesLoading,
    error: moviesError,
  } = useMoviePool(roomCode);

  const {
    votes,
    loading: votesLoading,
    error: votesError,
  } = useAllVotes(roomCode);

  if (
    roomLoading ||
    moviesLoading ||
    votesLoading
  ) {
    return (
      <div className="window-box">
        <div className="window-title-bar">
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Film size={14} /> Minna.exe
          </span>
        </div>
        <div className="window-content">
          <p style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <Loader size={16} className="spinner" /> Loading matched results...
          </p>
        </div>
      </div>
    );
  }

  if (roomError || moviesError || votesError) {
    const activeError = roomError || moviesError || votesError;
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

  const matches = computeMatches(
    movies,
    votes,
    members,
    room?.matchMode
  );

  const noMatchesText = room?.matchMode === "majority"
    ? "No movie was liked by more than half the group."
    : "Nobody found a movie that everyone liked.";
  const matchesHeadline = room?.matchMode === "majority"
    ? "Most People Liked"
    : "Everyone Liked";

  return (
    <main className="window-box">
      <div className="window-title-bar">
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Film size={14} /> Minna.exe - Results
        </span>
        <button 
          onClick={() => navigate(`/lobby/${roomCode}`)}
          style={{ border: "none", background: "transparent", padding: "0 4px", display: "flex", alignItems: "center", cursor: "pointer", color: "inherit" }}
          aria-label="Back to room lobby"
        >
          <X size={12} />
        </button>
      </div>
      <div className="window-content" style={{ display: "flex", flexDirection: "column" }}>
        <h1 style={{ marginBottom: "16px" }}>Movie Night Results</h1>

        {matches.length > 0 ? (
          <section>
            <h2 style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "16px", color: "var(--color-tertiary)" }}>
              <Award size={18} /> {matchesHeadline}
            </h2>

            <div className="movie-grid">
              {matches.map((movie) => (
                <div key={movie.id} className="movie-card">
                  {movie.posterPath ? (
                    <img
                      className="movie-poster"
                      src={`https://image.tmdb.org/t/p/w200${movie.posterPath}`}
                      alt={movie.title}
                    />
                  ) : (
                    <div className="retro-inset movie-poster" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "8px", textAlign: "center", fontSize: "11px", backgroundColor: "#fff" }}>
                      No Image
                    </div>
                  )}
                  
                  <h3 style={{ fontSize: "13px", marginTop: "4px" }}>{movie.title}</h3>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section style={{ textAlign: "center", padding: "24px 0" }}>
            <h2 style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--color-outline)" }}>
              <Frown size={24} /> No Matches Found
            </h2>

            <p style={{ marginTop: "12px", fontStyle: "italic" }}>
              {noMatchesText}
            </p>
          </section>
        )}

        <hr className="retro-divider" />

        <button 
          onClick={() => navigate(`/lobby/${roomCode}`)}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", alignSelf: "center" }}
        >
          <ArrowLeft size={14} /> Back to Lobby
        </button>
      </div>
    </main>
  );
}

export default Results;

