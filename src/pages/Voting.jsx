import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { useMoviePool } from "../hooks/useMoviePool";
import { useVotes } from "../hooks/useVotes";
import { useRoom } from "../hooks/useRoom";
import { useMembers } from "../hooks/useMembers";
import { useVotingCompletion } from "../hooks/useVotingCompletion";
import { useSwipeGesture } from "../hooks/useSwipeGesture";
import { Film, ThumbsUp, ThumbsDown, CheckCircle, Loader, X } from "lucide-react";

import { castVote } from "../services/votes";

function Voting() {
  const { roomCode } = useParams();

  const navigate = useNavigate();

  const { user, loading: authLoading } = useAuth();

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
  } = useVotes(roomCode, user?.uid);

  const [votingMovieId, setVotingMovieId] = useState(null);
  const [error, setError] = useState("");

  const currentMovie = useMemo(() => {
    return movies.find(
      (movie) => votes[movie.id] === undefined
    );
  }, [movies, votes]);

  const completedVoting =
    movies.length > 0 && !currentMovie;

  async function handleVote(movie, vote) {
    if (!user?.uid) {
      setError("Unable to identify your player.");
      return;
    }

    try {
      setVotingMovieId(movie.id);
      setError("");

      await castVote(
        roomCode,
        user.uid,
        movie.id,
        vote
      );
    } catch (err) {
      console.error("Vote error:", err);
      setError("Failed to save your vote.");
    } finally {
      setVotingMovieId(null);
    }
  }

  const {
    deltaX,
    isDragging,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  } = useSwipeGesture({
    onSwipeLeft: () => {
      if (currentMovie) {
        handleVote(currentMovie, "dislike");
      }
    },

    onSwipeRight: () => {
      if (currentMovie) {
        handleVote(currentMovie, "like");
      }
    },
  });

  useEffect(() => {
    if (room?.status === "closed") {
      navigate("/", { replace: true });
    } else if (room?.status === "results") {
      navigate(`/results/${roomCode}`);
    }
  }, [room?.status, roomCode, navigate]);

  const isHost =
    Boolean(user?.uid) &&
    Boolean(room?.hostUid) &&
    user.uid === room.hostUid;

  useVotingCompletion({
    roomCode,
    hostUid: room?.hostUid,
    isHost,
    memberCount: members.length,
    movieCount: movies.length,
    status: room?.status,
  });

  if (
    authLoading ||
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
            <Loader size={16} className="spinner" /> Loading voting session...
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

  if (error) {
    return (
      <div className="window-box">
        <div className="window-title-bar">
          <span>Error.exe</span>
        </div>
        <div className="window-content">
          <p style={{ color: "var(--color-error)" }}>{error}</p>
          <button onClick={() => setError("")} style={{ marginTop: "12px" }}>
            Try Again
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

  if (movies.length === 0) {
    return (
      <div className="window-box">
        <div className="window-title-bar">
          <span>Minna.exe</span>
        </div>
        <div className="window-content">
          <p>No movies available for voting.</p>
          <button onClick={() => navigate(`/lobby/${roomCode}`)} style={{ marginTop: "12px" }}>
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  if (completedVoting) {
    return (
      <div className="window-box">
        <div className="window-title-bar">
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle size={14} /> Minna.exe - Voting Complete
          </span>
        </div>
        <div className="window-content center-container" style={{ padding: "24px" }}>
          <h1 style={{ marginBottom: "12px" }}>You're done! 🎉</h1>
          <p style={{ marginBottom: "12px", fontSize: "1.1em", fontWeight: "bold" }}>
            You voted on all {movies.length} movies.
          </p>
          <p style={{ fontStyle: "italic", fontSize: "0.95em", color: "var(--color-on-surface-variant)" }}>
            Waiting for other players to finish voting...
          </p>
          <button onClick={() => navigate(`/lobby/${roomCode}`)} style={{ marginTop: "20px" }}>
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  const isVoting = votingMovieId === currentMovie.id;
  const progressCount = Object.keys(votes).length;

  return (
    <main className="window-box">
      <div className="window-title-bar">
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Film size={14} /> Minna.exe - Voting ({roomCode})
        </span>
        <button 
          onClick={() => navigate(`/lobby/${roomCode}`)}
          style={{ border: "none", background: "transparent", padding: "0 4px", display: "flex", alignItems: "center", cursor: "pointer", color: "inherit" }}
          aria-label="Back to room lobby"
        >
          <X size={12} />
        </button>
      </div>
      <div className="window-content" style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
        
        {/* Progress Box */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "16px" }}>
          <span className="retro-chip" style={{ fontSize: "11px" }}>Room: {roomCode}</span>
          <span className="retro-chip secondary" aria-live="polite" style={{ fontSize: "11px" }}>
            Progress: {progressCount} / {movies.length}
          </span>
        </div>

        {/* Voting Card Container */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", minHeight: "360px", justifyContent: "center" }}>
          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            className="movie-card retro-outset"
            role="img"
            aria-label={`Movie card: ${currentMovie.title}. Swipe right to Like, swipe left to Dislike.`}
            style={{
              width: "240px",
              padding: "12px",
              backgroundColor: "var(--color-surface-lowest)",
              transform: `translateX(${deltaX}px) rotate(${deltaX * 0.05}deg)`,
              transition: isDragging ? "none" : "transform 0.3s ease",
              touchAction: "none",
              cursor: isDragging ? "grabbing" : "grab",
              userSelect: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px"
            }}
          >
            {currentMovie.posterPath ? (
              <img
                src={`https://image.tmdb.org/t/p/w300${currentMovie.posterPath}`}
                alt={currentMovie.title}
                style={{ width: "100%", aspectRatio: "2/3", objectFit: "cover", pointerEvents: "none", border: "1px solid var(--color-outline)" }}
                draggable="false"
              />
            ) : (
              <div className="movie-poster-placeholder">
                <Film size={32} className="placeholder-icon" />
                <span className="placeholder-text">No Poster Image</span>
              </div>
            )}

            <h2 style={{ fontSize: "14px", textAlign: "center", marginTop: "4px", width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {currentMovie.title}
            </h2>

            {currentMovie.releaseDate && (
              <span className="retro-chip" style={{ fontSize: "10px", marginTop: "2px" }}>
                {currentMovie.releaseDate.split("-")[0]}
              </span>
            )}
          </div>
        </div>

        {/* Buttons Grid */}
        <div style={{ display: "flex", gap: "12px", width: "100%", maxWidth: "240px", marginTop: "16px" }}>
          <button
            onClick={() => handleVote(currentMovie, "dislike")}
            disabled={isVoting}
            style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "12px" }}
            aria-label="Dislike"
          >
            <ThumbsDown size={14} /> Dislike
          </button>

          <button
            className="btn-primary"
            onClick={() => handleVote(currentMovie, "like")}
            disabled={isVoting}
            style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "12px" }}
            aria-label="Like"
          >
            <ThumbsUp size={14} /> Like
          </button>
        </div>
      </div>
    </main>
  );
}

export default Voting;