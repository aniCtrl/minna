import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";

export function useMoviePool(roomCode) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!roomCode) {
      return;
    }

    const normalizedCode = roomCode.trim().toUpperCase();

    const moviesRef = collection(
      db,
      "rooms",
      normalizedCode,
      "movies"
    );

    const unsubscribe = onSnapshot(
      moviesRef,
      (snapshot) => {
        const movieList = snapshot.docs.map((movieDoc) => ({
          id: movieDoc.id,
          ...movieDoc.data(),
        }));

        setMovies(movieList);
        setLoading(false);
        setError("");
      },
      (snapshotError) => {
        console.error("Movie pool listener error:", snapshotError);
        setError("Failed to load movie pool.");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [roomCode]);

  return {
    movies,
    loading: roomCode ? loading : false,
    error,
  };
}