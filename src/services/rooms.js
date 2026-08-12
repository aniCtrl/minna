import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
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

export async function joinRoom(roomCode, uid, displayName) {
  const normalizedCode = roomCode.trim().toUpperCase();

  const roomRef = doc(db, "rooms", normalizedCode);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) {
    throw new Error("ROOM_NOT_FOUND");
  }

  const roomData = roomSnap.data();

  if (roomData.status !== "lobby") {
    throw new Error("ROOM_NOT_JOINABLE");
  }

  const alreadyMember = roomData.members?.[uid];

  if (alreadyMember) {
    return normalizedCode;
  }

  await updateDoc(roomRef, {
    [`members.${uid}`]: {
      displayName,
    },
  });

  return normalizedCode;
}

export async function addMovieToPool(roomCode, movie) {
  const normalizedCode = roomCode.trim().toUpperCase();

  const movieRef = doc(
    db,
    "rooms",
    normalizedCode,
    "movies",
    String(movie.id)
  );

  const movieSnapshot = await getDoc(movieRef);

  if (movieSnapshot.exists()) {
    throw new Error("MOVIE_ALREADY_ADDED");
  }

  await setDoc(movieRef, {
    tmdbId: movie.id,
    title: movie.title,
    posterPath: movie.poster_path ?? null,
    releaseDate: movie.release_date ?? null,
  });
}