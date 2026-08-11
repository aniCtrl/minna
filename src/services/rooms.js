import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

function generateRoomCode(length = 6) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let code = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }

  return code;
}

export async function createRoom(hostUid, displayName) {
  const roomCode = generateRoomCode();

  const roomRef = doc(db, "rooms", roomCode);

  await setDoc(roomRef, {
    hostUid,
    status: "lobby",
    createdAt: new Date().toISOString(),
    members: {
      [hostUid]: {
        displayName,
      },
    },
  });

  return roomCode;
}
