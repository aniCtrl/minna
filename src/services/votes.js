import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

export async function castVote(roomCode, uid, movieId, vote) {
  const normalizedCode = roomCode.trim().toUpperCase();

  const voteId = `${uid}_${movieId}`;

  const voteRef = doc(
    db,
    "rooms",
    normalizedCode,
    "votes",
    voteId
  );

  await setDoc(voteRef, {
    uid,
    movieId: String(movieId),
    vote,
    updatedAt: new Date(),
  });
}

export function computeMatches(movies, votes, members) {
  const matches = movies.filter((movie) => {
    return members.every((member) => {
      const voteId = `${member.uid}_${movie.id}`;

      const vote = votes[voteId];

      return vote?.vote === "like";
    });
  });

  return matches;
}