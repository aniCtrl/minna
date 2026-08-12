import { useParams } from "react-router-dom";

import { useRoom } from "../hooks/useRoom";
import { useMembers } from "../hooks/useMembers";
import { useMoviePool } from "../hooks/useMoviePool";
import { useAllVotes } from "../hooks/useAllVotes";
import { computeMatches } from "../services/votes";

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

  console.log("RESULTS DEBUG:", {
    roomCode,
    roomLoading,
    moviesLoading,
    votesLoading,
    members,
    movies,
    votes,
  });

  if (
    roomLoading ||
    moviesLoading ||
    votesLoading
  ) {
    return <p>Loading results...</p>;
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

  const matches = computeMatches(
    movies,
    votes,
    members
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

