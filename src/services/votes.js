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

export function computeMatches(
  movies,
  votes,
  members,
  mode = "strict"
) {
  const matches = movies.filter((movie) => {
    const likeCount = members.filter((member) => {
      const voteId = `${member.uid}_${movie.id}`;
      const vote = votes[voteId];

      return vote?.vote === "like";
    }).length;

    if (mode === "majority") {
      return likeCount > members.length / 2;
    }

    return likeCount === members.length;
  });

  return matches;
}