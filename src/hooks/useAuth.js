import { useEffect, useState } from "react";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { auth } from "../firebase/config";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        signInAnonymously(auth).catch((error) => {
          console.error("Anonymous auth failed:", error);
          setLoading(false);
        });
      }
    });

    return unsubscribe;
  }, []);

  return { user, loading };
}