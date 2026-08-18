import { useParams } from "react-router-dom";

import { useRoom } from "../hooks/useRoom";
import { useMembers } from "../hooks/useMembers";
import { useMoviePool } from "../hooks/useMoviePool";
import { useAllVotes } from "../hooks/useAllVotes";
import { computeMatches } from "../services/votes";

import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

function Results() {
  const { roomCode } = useParams();

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
    return <LoadingState message="Loading results..." />;
  }

  if (roomError) {
    return <ErrorState message={roomError} />;
  }

  if (moviesError) {
    return <ErrorState message={moviesError} />;
  }

  if (votesError) {
    return <ErrorState message={votesError} />;
  }

  const matches = computeMatches(
    movies,
    votes,
    members,
    room?.matchMode
  );

  return (
    <div>
      <h1>Movie Night Results</h1>

      {matches.length > 0 ? (
        <section>
          <h2>Everyone liked</h2>

          {matches.map((movie) => (
            <div key={movie.id}>
              <h3>{movie.title}</h3>

              {movie.posterPath && (
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                  alt={movie.title}
                  width="200"
                />
              )}
            </div>
          ))}
        </section>
      ) : (
        <section>
          <h2>No perfect matches 😭</h2>

          <p>
            Nobody found a movie that everyone liked.
          </p>
        </section>
      )}
    </div>
  );
}

export default Results;

