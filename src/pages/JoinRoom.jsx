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
    return (
      <div className="window-box">
        <div className="window-title-bar">
          <span>Minna.exe</span>
        </div>
        <div className="window-content">
          <p>Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="window-box">
      <div className="window-title-bar">
        <span>Minna.exe - Join Room</span>
        <button 
          onClick={() => navigate("/")}
          style={{ border: "none", background: "transparent", padding: "0 4px", fontSize: "12px", cursor: "pointer", color: "inherit" }}
        >
          X
        </button>
      </div>
      <div className="window-content">
        <h1 style={{ marginBottom: "16px" }}>Join Room</h1>

        <div className="form-group">
          <label htmlFor="displayName">Your Name</label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Enter your name"
            maxLength={30}
          />
        </div>

        <div className="form-group" style={{ marginTop: "16px" }}>
          <label htmlFor="roomCode">Room Code</label>
          <input
            id="roomCode"
            type="text"
            value={roomCode}
            onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
            placeholder="Enter 6-character code"
            maxLength={6}
          />
        </div>

        <button 
          className="btn-primary"
          onClick={handleJoinRoom} 
          disabled={joining || !roomCode.trim()}
          style={{ width: "100%", marginTop: "24px" }}
        >
          {joining ? "Joining..." : "Join Room"}
        </button>

        {message && (
          <p style={{ marginTop: "12px", fontFamily: "var(--font-mono)" }}>
            {message}
          </p>
        )}

        {error && (
          <p style={{ color: "var(--color-error)", marginTop: "12px", fontFamily: "var(--font-mono)" }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default JoinRoom;