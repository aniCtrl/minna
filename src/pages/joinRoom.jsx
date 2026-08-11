import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { joinRoom } from "../services/rooms";

function JoinRoom() {
  const { user, loading } = useAuth();

  const [roomCode, setRoomCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleJoinRoom() {
    if (!user || !roomCode.trim()) {
      return;
    }

    try {
      setJoining(true);
      setMessage("");
      setError("");

      await joinRoom(roomCode, user.uid, "Anonymous User");

      setMessage("Successfully joined the room!");
    } catch (error) {
      console.error("Failed to join room:", error);

      if (error.message === "ROOM_NOT_FOUND") {
        setError("Room not found. Check the room code.");
      } else if (error.message === "ROOM_NOT_JOINABLE") {
        setError("This room is no longer accepting members.");
      } else {
        setError("Something went wrong while joining the room.");
      }
    } finally {
      setJoining(false);
    }
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Join Room</h1>

      <input
        type="text"
        value={roomCode}
        onChange={(event) => setRoomCode(event.target.value)}
        placeholder="Enter room code"
        maxLength={6}
      />

      <button onClick={handleJoinRoom} disabled={joining}>
        {joining ? "Joining..." : "Join Room"}
      </button>

      {message && <p>{message}</p>}

      {error && <p>{error}</p>}
    </div>
  );
}

export default JoinRoom;