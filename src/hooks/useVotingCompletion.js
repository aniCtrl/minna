import { useEffect } from "react";
import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../firebase/config";
import { completeVoting } from "../services/rooms";

export function useVotingCompletion({
  roomCode,
  hostUid,
  isHost,
  memberCount,
  movieCount,
  status,
}) {
  useEffect(() => {
    if (
      !roomCode ||
      !hostUid ||
      !isHost ||
      status !== "voting" ||
      memberCount === 0 ||
      movieCount === 0
    ) {
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
      async (snapshot) => {
        const requiredVotes =
          memberCount * movieCount;

        const currentVotes = snapshot.size;

        console.log(
          `Voting progress: ${currentVotes}/${requiredVotes}`
        );

        if (currentVotes !== requiredVotes) {
          return;
        }

        try {
          await completeVoting(
            normalizedCode,
            hostUid
          );
        } catch (error) {
          console.error(
            "Failed to complete voting:",
            error
          );
        }
      },
      (error) => {
        console.error(
          "Voting completion listener error:",
          error
        );
      }
    );

    return unsubscribe;
  }, [
    roomCode,
    hostUid,
    isHost,
    memberCount,
    movieCount,
    status,
  ]);
}