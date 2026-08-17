import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { useMoviePool } from "../hooks/useMoviePool";
import { useVotes } from "../hooks/useVotes";
import { useRoom } from "../hooks/useRoom";
import { useMembers } from "../hooks/useMembers";
import { useVotingCompletion } from "../hooks/useVotingCompletion";
import { useSwipeGesture } from "../hooks/useSwipeGesture";

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
    if (room?.status === "results") {
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
    return <p>Loading voting session...</p>;
  }

  if (roomError) {
    return <p>{roomError}</p>;
  }

  if (moviesError) {
    return <p>{moviesError}</p>;
  }

  if (votesError) {
    return <p>{votesError}</p>;
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>

        <button onClick={() => setError("")}>
          Try Again
        </button>
      </div>
    );
  }

  if (movies.length === 0) {
    return <p>No movies available for voting.</p>;
  }

  if (completedVoting) {
    return (
      <div>
        <h1>Voting Complete 🎉</h1>

        <p>
          You have voted on all {movies.length} movies.
        </p>
      </div>
    );
  }

  const isVoting =
    votingMovieId === currentMovie.id;

    return (
    <div>
      <h1>Vote</h1>

      <p>
        Room: {roomCode}
      </p>

      <p>
        Progress: {Object.keys(votes).length} /{" "}
        {movies.length}
      </p>

      <div>
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          style={{
            transform: `translateX(${deltaX}px) rotate(${deltaX * 0.05}deg)`,
            transition: isDragging
              ? "none"
              : "transform 0.3s ease",
            touchAction: "none",
            cursor: isDragging ? "grabbing" : "grab",
            userSelect: "none",
          }}
        >
          {currentMovie.posterPath && (
            <img
              src={`https://image.tmdb.org/t/p/w500${currentMovie.posterPath}`}
              alt={currentMovie.title}
              width="300"
              draggable="false"
            />
          )}

          <h2>{currentMovie.title}</h2>

          <p>
            {currentMovie.releaseDate || "Release date unknown"}
          </p>
        </div>

        <div>
          <button
            onClick={() =>
              handleVote(currentMovie, "dislike")
            }
            disabled={isVoting}
          >
            👎 Dislike
          </button>

          <button
            onClick={() =>
              handleVote(currentMovie, "like")
            }
            disabled={isVoting}
          >
            👍 Like
          </button>
        </div>
      </div>
    </div>
  );
}

export default Voting;