import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/config";

export async function sendMessage(roomCode, uid, displayName, text) {
  const normalizedCode = roomCode.trim().toUpperCase();
  const trimmedText = text.trim();

  if (!trimmedText) {
    throw new Error("EMPTY_MESSAGE");
  }

  if (trimmedText.length > 500) {
    throw new Error("MESSAGE_TOO_LONG");
  }

  const messagesRef = collection(
    db,
    "rooms",
    normalizedCode,
    "messages"
  );

  await addDoc(messagesRef, {
    uid,
    displayName,
    text: trimmedText,
    createdAt: serverTimestamp(),
  });
}