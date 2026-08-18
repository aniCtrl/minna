import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { createRoom } from "../services/rooms";

import { useNavigate } from "react-router-dom";

function CreateRoom() {
  const { user, loading } = useAuth();

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [matchMode, setMatchMode] = useState("strict");
  const [displayName, setDisplayName] = useState("");

  const navigate = useNavigate();

  async function handleCreateRoom() {
    if (!user) return;

    try {
      setCreating(true);
      setError("");

      const code = await createRoom(
        user.uid,
        displayName.trim() || "Guest",
        matchMode
      );


      navigate(`/lobby/${code}`);

    } catch (error) {
      console.error("Room creation failed:", error);
      setError("Failed to create room.");
    } finally {
      setCreating(false);
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
        <span>Minna.exe - Create Room</span>
        <button 
          onClick={() => navigate("/")}
          style={{ border: "none", background: "transparent", padding: "0 4px", fontSize: "12px", cursor: "pointer", color: "inherit" }}
        >
          X
        </button>
      </div>
      <div className="window-content">
        <h1 style={{ marginBottom: "16px" }}>Create Room</h1>

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
          <label>Match Mode</label>
          <p style={{ marginBottom: "12px", fontSize: "0.9em" }}>
            Choose how movies become matches after everyone votes.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: "bold" }}>
              <input
                type="radio"
                value="strict"
                checked={matchMode === "strict"}
                onChange={(event) => setMatchMode(event.target.value)}
              />
              Everyone has to like it
            </label>
            <p style={{ fontSize: "0.85em", color: "var(--color-on-surface-variant)", paddingLeft: "20px" }}>
              Only movies liked by everyone become matches.
            </p>

            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: "bold", marginTop: "8px" }}>
              <input
                type="radio"
                value="majority"
                checked={matchMode === "majority"}
                onChange={(event) => setMatchMode(event.target.value)}
              />
              Most people have to like it
            </label>
            <p style={{ fontSize: "0.85em", color: "var(--color-on-surface-variant)", paddingLeft: "20px" }}>
              Movies liked by more than half the group become matches.
            </p>
          </div>
        </div>

        <button 
          className="btn-primary" 
          onClick={handleCreateRoom} 
          disabled={creating}
          style={{ width: "100%", marginTop: "24px" }}
        >
          {creating ? "Creating..." : "Create Room"}
        </button>

        {error && (
          <p style={{ color: "var(--color-error)", marginTop: "12px", fontFamily: "var(--font-mono)" }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default CreateRoom;
