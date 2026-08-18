import { useRoom } from "../hooks/useRoom";
import { useMembers } from "../hooks/useMembers";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Users, User, LogOut, ShieldAlert, X, Loader } from "lucide-react";

import RoomCodeDisplay from "../components/RoomCodeDisplay";

import { closeRoom, claimHost } from "../services/rooms";
import { useAuth } from "../hooks/useAuth";

function Lobby() {
  const { roomCode } = useParams();
  const navigate = useNavigate();

  const { room, loading, error } = useRoom(roomCode);
  const members = useMembers(room);

  const { user } = useAuth();

  const [alertMessage, setAlertMessage] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (room?.status === "voting") {
      navigate(`/voting/${roomCode}`);
    }
  }, [room?.status, roomCode, navigate]);

  async function handleCloseRoom() {
    if (processing || !user) return;
    try {
      setProcessing(true);
      await closeRoom(roomCode, user.uid);
    } catch (error) {
      console.error("Close room error:", error);

      if (error.message === "NOT_HOST") {
        setAlertMessage("Only the host can close the room.");
      } else {
        setAlertMessage("Failed to close room.");
      }
    } finally {
      setProcessing(false);
    }
  }

  async function handleClaimHost() {
    if (processing || !user) return;
    try {
      setProcessing(true);
      await claimHost(roomCode, user.uid);
      setAlertMessage("You are now the host!");
    } catch (error) {
      console.error("Claim host error:", error);

      if (error.message === "HOST_STILL_PRESENT") {
        setAlertMessage("The current host is still present.");
      } else if (error.message === "NOT_MEMBER") {
        setAlertMessage("You are not a member of this room.");
      } else if (error.message === "ROOM_CLOSED") {
        setAlertMessage("This room is closed.");
      } else {
        setAlertMessage("Failed to claim host.");
      }
    } finally {
      setProcessing(false);
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
    <>
      <main className="window-box">
        <div className="window-title-bar">
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Users size={14} /> Minna.exe - Room Lobby
          </span>
          <button 
            onClick={() => navigate("/")}
            style={{ border: "none", background: "transparent", padding: "0 4px", display: "flex", alignItems: "center", cursor: "pointer", color: "inherit" }}
            aria-label="Exit room and back to home page"
            disabled={processing}
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
              <button className="btn-primary" onClick={() => navigate(`/movie-selection/${roomCode}`)} disabled={processing} style={{ width: "100%" }}>
                Go to Movie Selection
              </button>
            )}

            <div style={{ display: "flex", gap: "8px", width: "100%" }}>
              <button onClick={handleCloseRoom} disabled={processing} style={{ flex: 1, display: "inline-flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
                <LogOut size={13} /> Close Room
              </button>

              <button onClick={handleClaimHost} disabled={processing} style={{ flex: 1, display: "inline-flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
                <ShieldAlert size={13} /> Claim Host
              </button>
            </div>
          </div>
        </div>
      </main>

      {alertMessage && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "16px" }}>
          <div className="window-box" style={{ maxWidth: "320px", width: "100%", margin: 0 }}>
            <div className="window-title-bar">
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <ShieldAlert size={12} /> Message.exe
              </span>
              <button onClick={() => setAlertMessage(null)} style={{ border: "none", background: "transparent", color: "inherit", cursor: "pointer", display: "flex", alignItems: "center" }}>
                <X size={12} />
              </button>
            </div>
            <div className="window-content" style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center", textAlign: "center" }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "13px" }}>{alertMessage}</p>
              <button className="btn-primary" onClick={() => setAlertMessage(null)} style={{ minWidth: "80px" }}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Lobby;