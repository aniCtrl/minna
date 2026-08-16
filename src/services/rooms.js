import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  runTransaction,
  Timestamp,
} from "firebase/firestore";

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

  const roomData = {
    hostUid,
    status: "lobby",
    createdAt: Timestamp.now(),
    expiresAt: Timestamp.fromMillis(
      Date.now() + 24 * 60 * 60 * 1000
    ),
    members: {
      [hostUid]: {
        displayName,
      },
    },
  };

  await setDoc(roomRef, roomData);

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

export async function addMovieToPool(roomCode, movie, details) {
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

    runtime: details?.runtime ?? null,

    genres: details?.genres
      ? details.genres.map((genre) => genre.name)
      : [],

    overview: details?.overview ?? null,
  });
}

export async function startVoting(roomCode, uid) {
  const normalizedCode = roomCode.trim().toUpperCase();

  const roomRef = doc(db, "rooms", normalizedCode);

  const roomSnapshot = await getDoc(roomRef);

  if (!roomSnapshot.exists()) {
    throw new Error("ROOM_NOT_FOUND");
  }

  const roomData = roomSnapshot.data();

  if (roomData.hostUid !== uid) {
    throw new Error("NOT_HOST");
  }

  if (roomData.status !== "lobby") {
    throw new Error("INVALID_STATUS");
  }

  await updateDoc(roomRef, {
    status: "voting",
  });
}

export async function completeVoting(roomCode, hostUid) {
  const normalizedCode = roomCode.trim().toUpperCase();

  const roomRef = doc(db, "rooms", normalizedCode);

  await runTransaction(db, async (transaction) => {
    const roomSnapshot = await transaction.get(roomRef);

    if (!roomSnapshot.exists()) {
      throw new Error("Room not found.");
    }

    const roomData = roomSnapshot.data();

    if (roomData.hostUid !== hostUid) {
      throw new Error("Only the host can complete voting.");
    }

    if (roomData.status !== "voting") {
      return;
    }

    transaction.update(roomRef, {
      status: "results",
    });
  });
}

/**
 * Close a room.
 *
 * Only the current host can close the room.
 */
export async function closeRoom(roomCode, uid) {
  const normalizedCode = roomCode.trim().toUpperCase();

  const roomRef = doc(db, "rooms", normalizedCode);

  await runTransaction(db, async (transaction) => {
    const roomSnapshot = await transaction.get(roomRef);

    if (!roomSnapshot.exists()) {
      throw new Error("ROOM_NOT_FOUND");
    }

    const roomData = roomSnapshot.data();

    if (roomData.hostUid !== uid) {
      throw new Error("NOT_HOST");
    }

    if (roomData.status === "closed") {
      return;
    }

    transaction.update(roomRef, {
      status: "closed",
    });
  });
}

/**
 * Claim host when the current host is no longer
 * present in the room's members map.
 *
 * A transaction guarantees that if two members
 * attempt this at nearly the same time, only one
 * transaction can successfully change hostUid.
 */
export async function claimHost(roomCode, uid) {
  const normalizedCode = roomCode.trim().toUpperCase();

  const roomRef = doc(db, "rooms", normalizedCode);

  await runTransaction(db, async (transaction) => {
    const roomSnapshot = await transaction.get(roomRef);

    if (!roomSnapshot.exists()) {
      throw new Error("ROOM_NOT_FOUND");
    }

    const roomData = roomSnapshot.data();

    if (roomData.status === "closed") {
      throw new Error("ROOM_CLOSED");
    }

    const currentHostUid = roomData.hostUid;

    if (!currentHostUid) {
      throw new Error("NO_HOST");
    }

    if (currentHostUid === uid) {
      throw new Error("ALREADY_HOST");
    }

    const oldHostMemberRef = doc(
      db,
      "rooms",
      normalizedCode,
      "members",
      currentHostUid
    );

    const newHostMemberRef = doc(
      db,
      "rooms",
      normalizedCode,
      "members",
      uid
    );

    const oldHostSnapshot =
      await transaction.get(oldHostMemberRef);

    const newHostSnapshot =
      await transaction.get(newHostMemberRef);

    if (oldHostSnapshot.exists()) {
      throw new Error("HOST_STILL_PRESENT");
    }

    if (!newHostSnapshot.exists()) {
      throw new Error("NOT_MEMBER");
    }

    transaction.update(roomRef, {
      hostUid: uid,
    });
  });
}