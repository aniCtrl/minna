import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../firebase/config";

export function useAllVotes(roomCode) {
  const [votes, setVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!roomCode) {
      return;
    }

    const normalizedCode = roomCode.trim().toUpperCase();

    const votesRef = collection(
      db,
      "rooms",
      normalizedCode,
      "votes"
    );

    const unsubscribe = onSnapshot(
      votesRef,
      (snapshot) => {
        const voteMap = {};

        snapshot.docs.forEach((voteDoc) => {
          const voteData = voteDoc.data();

          const voteId = `${voteData.uid}_${voteData.movieId}`;

          voteMap[voteId] = {
            uid: voteData.uid,
            movieId: voteData.movieId,
            vote: voteData.vote,
          };
        });

        setVotes(voteMap);
        setLoading(false);
        setError("");
      },
      (snapshotError) => {
        console.error(
          "All votes listener error:",
          snapshotError
        );

        setError("Failed to load votes.");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [roomCode]);

  return {
    votes,
    loading,
    error,
  };
}