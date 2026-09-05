import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "../firebase/config";

export function useChatMessages(roomCode) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomCode) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const normalizedCode = roomCode.trim().toUpperCase();

    const messagesRef = collection(
      db,
      "rooms",
      normalizedCode,
      "messages"
    );

    const messagesQuery = query(
      messagesRef,
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const nextMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setMessages(nextMessages);
        setLoading(false);
      },
      (error) => {
        console.error("Chat listener error:", error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [roomCode]);

  return {
    messages,
    loading,
  };
}




/* We will use Firebase's onSnapshot, which provides a real-time listener
 We can import orderBy, collection, and onSnapshot from firebase/firestore

 onSnapshot(messagesQuery, ...)
 It says:

"Firebase, keep watching this collection. If anything changes, tell React."
*/