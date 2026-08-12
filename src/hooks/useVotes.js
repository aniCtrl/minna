import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase/config";

export function useVotes(roomCode, uid) {
  const [votes, setVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!roomCode || !uid) {
      return;
    }

    const normalizedCode = roomCode.trim().toUpperCase();

    const votesRef = collection(
      db,
      "rooms",
      normalizedCode,
      "votes"
    );

    const votesQuery = query(
      votesRef,
      where("uid", "==", uid)
    );

    const unsubscribe = onSnapshot(
      votesQuery,
      (snapshot) => {
        const voteMap = {};

        snapshot.docs.forEach((voteDoc) => {
          const voteData = voteDoc.data();

          voteMap[voteData.movieId] = voteData.vote;
        });

        setVotes(voteMap);
        setLoading(false);
        setError("");
      },
      (snapshotError) => {
        console.error("Votes listener error:", snapshotError);
        setError("Failed to load your votes.");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [roomCode, uid]);

  return {
    votes,
    loading,
    error,
  };
}