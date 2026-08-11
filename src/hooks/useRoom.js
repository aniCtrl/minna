import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";

export function useRoom(roomCode) {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!roomCode) {
      return;
    }

    const normalizedCode = roomCode.trim().toUpperCase();
    const roomRef = doc(db, "rooms", normalizedCode);

    const unsubscribe = onSnapshot(
      roomRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setRoom(null);
          setError("Room not found.");
          setLoading(false);
          return;
        }

        setRoom({
          id: snapshot.id,
          ...snapshot.data(),
        });

        setError("");
        setLoading(false);
      },
      (snapshotError) => {
        console.error("Room listener error:", snapshotError);
        setError("Failed to listen to room.");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [roomCode]);

  return {
    room,
    loading: roomCode ? loading : false,
    error,
  };
}