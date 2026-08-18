import { useRoom } from "../hooks/useRoom";
import { useMembers } from "../hooks/useMembers";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Users, User, LogOut, ShieldAlert, X } from "lucide-react";

import RoomCodeDisplay from "../components/RoomCodeDisplay";

import { closeRoom, claimHost } from "../services/rooms";
import { useAuth } from "../hooks/useAuth";

function Lobby() {
  const { roomCode } = useParams();
  const navigate = useNavigate();

  const { room, loading, error } = useRoom(roomCode);
  const members = useMembers(room);

  const { user } = useAuth();

  useEffect(() => {
    if (room?.status === "voting") {
      navigate(`/voting/${roomCode}`);
    }
  }, [room?.status, roomCode, navigate]);

  async function handleCloseRoom() {
    try {
      await closeRoom(roomCode, user.uid);
    } catch (error) {
      console.error("Close room error:", error);

      if (error.message === "NOT_HOST") {
        alert("Only the host can close the room.");
      } else {
        alert("Failed to close room.");
      }
    }
  }

  async function handleClaimHost() {
    try {
      await claimHost(roomCode, user.uid);

      alert("You are now the host!");
    } catch (error) {
      console.error("Claim host error:", error);

      if (error.message === "HOST_STILL_PRESENT") {
        alert("The current host is still present.");
      } else if (error.message === "NOT_MEMBER") {
        alert("You are not a member of this room.");
      } else if (error.message === "ROOM_CLOSED") {
        alert("This room is closed.");
      } else {
        alert("Failed to claim host.");
      }
    }
  }

  if (loading) {
    return (
      <div className="window-box">
        <div className="window-title-bar">
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Users size={14} /> Minna.exe
          </span>
        </div>
        <div className="window-content">
          <p style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <Loader size={16} className="spinner" /> Loading room...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="window-box">
        <div className="window-title-bar">
          <span>Error.exe</span>
        </div>
        <div className="window-content">
          <p style={{ color: "var(--color-error)" }}>{error}</p>
          <button onClick={() => navigate("/")} style={{ marginTop: "12px" }}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="window-box">
        <div className="window-title-bar">
          <span>Not Found.exe</span>
        </div>
        <div className="window-content">
          <p>Room not found.</p>
          <button onClick={() => navigate("/")} style={{ marginTop: "12px" }}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="window-box">
      <div className="window-title-bar">
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Users size={14} /> Minna.exe - Room Lobby
        </span>
        <button 
          onClick={() => navigate("/")}
          style={{ border: "none", background: "transparent", padding: "0 4px", display: "flex", alignItems: "center", cursor: "pointer", color: "inherit" }}
          aria-label="Exit room and back to home page"
        >
          <X size={12} />
        </button>
      </div>
      <div className="window-content">
        <h1 style={{ marginBottom: "12px" }}>Movie Night Lobby</h1>

        <RoomCodeDisplay roomCode={roomCode} />

        {room.status === "lobby" && (
          <p style={{ margin: "12px 0", fontStyle: "italic", fontSize: "0.95em" }}>
            Waiting for everyone to join and get ready.
          </p>
        )}

        <hr className="retro-divider" />

        <h3 id="active-members-heading" style={{ fontFamily: "var(--font-mono)", fontSize: "14px", textTransform: "uppercase", marginBottom: "8px" }}>
          Active Members ({members.length})
        </h3>

        <ul 
          aria-labelledby="active-members-heading"
          aria-live="polite"
          style={{ listStyleType: "none", padding: 0, margin: "0 0 24px 0", display: "flex", flexWrap: "wrap", gap: "8px" }}
        >
          {members.map((member) => (
            <li key={member.uid} className="retro-chip" style={{ padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <User size={12} /> {member.displayName}
            </li>
          ))}
        </ul>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {room.status === "lobby" && (
            <button className="btn-primary" onClick={() => navigate(`/movie-selection/${roomCode}`)} style={{ width: "100%" }}>
              Go to Movie Selection
            </button>
          )}

          <div style={{ display: "flex", gap: "8px", width: "100%" }}>
            <button onClick={handleCloseRoom} style={{ flex: 1, display: "inline-flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
              <LogOut size={13} /> Close Room
            </button>

            <button onClick={handleClaimHost} style={{ flex: 1, display: "inline-flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
              <ShieldAlert size={13} /> Claim Host
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Lobby;