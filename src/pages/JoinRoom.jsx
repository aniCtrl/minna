import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { joinRoom } from "../services/rooms";
import { Film, X, Loader, LogIn, Key, User } from "lucide-react";

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
      <div className="window-box" style={{ width: "100%" }}>
        <div className="window-title-bar">
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Film size={14} /> Minna.exe - Join Room
          </span>
        </div>
        <div className="window-content center-container" style={{ padding: "32px 20px" }}>
          <p style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-mono)", fontWeight: "600" }}>
            <Loader size={18} className="spinner" /> Loading session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="window-box" style={{ width: "100%" }}>
      <div className="window-title-bar">
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Film size={14} /> Minna.exe - Join Room
        </span>
        <button 
          onClick={() => navigate("/")}
          style={{ border: "none", background: "transparent", padding: "0 4px", display: "flex", alignItems: "center", cursor: "pointer", color: "inherit" }}
          aria-label="Cancel and back to home page"
        >
          <X size={13} />
        </button>
      </div>

      <div className="window-content">
        <h1 style={{ marginBottom: "16px", fontSize: "22px" }}>Join Movie Room</h1>

        <div className="form-group">
          <label htmlFor="displayName" style={{ fontFamily: "var(--font-mono)", fontWeight: "600", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
            <User size={13} /> YOUR NAME
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Enter your display name"
            maxLength={30}
          />
        </div>

        <div className="form-group" style={{ marginTop: "18px" }}>
          <label htmlFor="roomCode" style={{ fontFamily: "var(--font-mono)", fontWeight: "600", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
            <Key size={13} /> ROOM CODE
          </label>
          <input
            id="roomCode"
            type="text"
            value={roomCode}
            onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
            placeholder="Enter 6-character code (e.g. AB12CD)"
            maxLength={6}
            style={{ fontFamily: "var(--font-mono)", letterSpacing: "2px", fontWeight: "bold" }}
          />
        </div>

        <button 
          className="btn-primary"
          onClick={handleJoinRoom} 
          disabled={joining || !roomCode.trim()}
          style={{ width: "100%", marginTop: "24px", padding: "12px", fontSize: "14px", display: "inline-flex", gap: "8px", alignItems: "center", justifyContent: "center" }}
        >
          {joining ? (
            <>
              <Loader size={16} className="spinner" /> Joining Room...
            </>
          ) : (
            <>
              <LogIn size={16} /> Join Room
            </>
          )}
        </button>

        {message && (
          <p style={{ marginTop: "12px", fontFamily: "var(--font-mono)", fontSize: "13px" }}>
            {message}
          </p>
        )}

        {error && (
          <p style={{ color: "var(--color-error)", marginTop: "12px", fontFamily: "var(--font-mono)", fontSize: "13px" }}>
            {error}
          </p>
        )}
      </div>
    </main>
  );
}

export default JoinRoom;