import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useRoom } from "../hooks/useRoom";
import { useMembers } from "../hooks/useMembers";
import { useMoviePool } from "../hooks/useMoviePool";
import { useAllVotes } from "../hooks/useAllVotes";
import { useAuth } from "../hooks/useAuth";
import { computeMatches } from "../services/votes";
import { resetRoomForNewRound } from "../services/rooms";
import { Film, Award, Frown, X, ArrowLeft, Loader, RotateCcw } from "lucide-react";

import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

function Results() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resetting, setResetting] = useState(false);
  const [actionError, setActionError] = useState("");

  const {
    room,
    loading: roomLoading,
    error: roomError,
  } = useRoom(roomCode);

  useEffect(() => {
    if (room?.status === "closed") {
      navigate("/", { replace: true });
    } else if (room?.status === "movie_selection") {
      navigate(`/movie-selection/${roomCode}`);
    } else if (room?.status === "lobby") {
      navigate(`/lobby/${roomCode}`);
    }
  }, [room?.status, roomCode, navigate]);

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

  const handlePlayAgain = async () => {
    if (resetting || !user) return;

    setResetting(true);
    setActionError("");

    try {
      await resetRoomForNewRound(roomCode, user.uid);
      navigate(`/movie-selection/${roomCode}`);
    } catch (err) {
      console.error("Failed to reset room for new round:", err);
      setActionError("Failed to start new round. Please try again.");
      setResetting(false);
    }
  };

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
                    <div className="movie-poster-placeholder">
                      <Film size={26} className="placeholder-icon" />
                      <span className="placeholder-text">No Poster Image</span>
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

        {actionError && (
          <p style={{ color: "var(--color-error)", fontSize: "12px", textAlign: "center", marginBottom: "8px" }}>
            {actionError}
          </p>
        )}

        <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "4px", flexWrap: "wrap" }}>
          <button 
            className="btn-primary"
            onClick={handlePlayAgain}
            disabled={resetting}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "10px 16px" }}
          >
            {resetting ? <Loader size={14} className="spinner" /> : <RotateCcw size={14} />} Select Movies Again
          </button>

          <button 
            onClick={() => navigate(`/lobby/${roomCode}`)}
            disabled={resetting}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "10px 16px" }}
          >
            <ArrowLeft size={14} /> Back to Lobby
          </button>
        </div>
      </div>
    </main>
  );
}

export default Results;

