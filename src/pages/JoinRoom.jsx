import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { joinRoom } from "../services/rooms";

function JoinRoom() {
  const navigate = useNavigate();
  const { roomCode: inviteRoomCode } = useParams();

  const { user, loading } = useAuth();

  const [roomCode, setRoomCode] = useState(inviteRoomCode?.toUpperCase() || "");
  const [joining, setJoining] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [displayName, setDisplayName] = useState("");


  async function handleJoinRoom() {
    if (!user || !roomCode.trim()) {
      return;
    }

    try {
      setJoining(true);
      setMessage("");
      setError("");

      const joinedRoomCode = await joinRoom(
        roomCode,
        user.uid,
        displayName.trim() || "Guest"
      );

      navigate(`/lobby/${joinedRoomCode}`);
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

      <div>
        <label htmlFor="displayName">
          Your Name
        </label>

        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Enter your name"
          maxLength={30}
        />
      </div>

      <input
        type="text"
        value={roomCode}
        onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
        placeholder="Enter room code"
        maxLength={6}
      />

      <button onClick={handleJoinRoom} disabled={joining || !roomCode.trim()}>
        {joining ? "Joining..." : "Join Room"}
      </button>

      {message && <p>{message}</p>}

      {error && <p>{error}</p>}
    </div>
  );
}

export default JoinRoom;