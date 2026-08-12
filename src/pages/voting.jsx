import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useMoviePool } from "../hooks/useMoviePool";
import { useVotes } from "../hooks/useVotes";
import { castVote } from "../services/votes";

import { useRoom } from "../hooks/useRoom";
import { useMembers } from "../hooks/useMembers";
import { useVotingCompletion } from "../hooks/useVotingCompletion";

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

  useEffect(() => {
    if (completedVoting) {
      console.log("User has voted on every movie.");
    }
  }, [completedVoting]);

  useEffect(() => {
    if (room?.status === "results") {
      navigate(`/results/${roomCode}`);
    }
  }, [room?.status, roomCode, navigate]);

  

  async function handleVote(movie, vote) {
    if (!user?.uid) {
      setError("You must be signed in to vote.");
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
        {currentMovie.posterPath && (
          <img
            src={`https://image.tmdb.org/t/p/w500${currentMovie.posterPath}`}
            alt={currentMovie.title}
            width="300"
          />
        )}

        <h2>{currentMovie.title}</h2>

        <p>
          {currentMovie.releaseDate ||
            "Release date unknown"}
        </p>

        <div>
          <button
            onClick={() =>
              handleVote(currentMovie, "dislike")
            }
            disabled={votingMovieId === currentMovie.id}
          >
            👎 Dislike
          </button>

          <button
            onClick={() =>
              handleVote(currentMovie, "like")
            }
            disabled={votingMovieId === currentMovie.id}
          >
            👍 Like
          </button>
        </div>
      </div>
    </div>
  );
}

export default Voting;