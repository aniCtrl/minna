import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { createRoom } from "../services/rooms";
import { useNavigate } from "react-router-dom";
import { Film, X, Loader, PlusCircle, CheckCircle2, Users2 } from "lucide-react";

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
      <div className="window-box" style={{ width: "100%" }}>
        <div className="window-title-bar">
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Film size={14} /> Minna.exe - Create Room
          </span>
        </div>
        <div className="window-content center-container" style={{ padding: "32px 20px" }}>
          <p style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-mono)", fontWeight: "600" }}>
            <Loader size={18} className="spinner" /> Initializing session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="window-box" style={{ width: "100%" }}>
      <div className="window-title-bar">
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Film size={14} /> Minna.exe - Create Room
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
        <h1 style={{ marginBottom: "16px", fontSize: "22px" }}>Create a Room</h1>

        <div className="form-group">
          <label htmlFor="displayName" style={{ fontFamily: "var(--font-mono)", fontWeight: "600", fontSize: "12px", display: "block", marginBottom: "6px" }}>
            YOUR NAME
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Enter your display name (e.g. Alex)"
            maxLength={30}
          />
        </div>

        <div className="form-group" style={{ marginTop: "20px" }}>
          <label style={{ fontFamily: "var(--font-mono)", fontWeight: "600", fontSize: "12px", display: "block", marginBottom: "4px" }}>
            MATCH MODE
          </label>
          <p style={{ marginBottom: "12px", fontSize: "13px", color: "var(--color-on-surface-variant)" }}>
            Choose how movies become matches after everyone votes.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div 
              className={`radio-card-option ${matchMode === "strict" ? "selected" : ""}`}
              onClick={() => setMatchMode("strict")}
            >
              <input
                type="radio"
                name="matchMode"
                value="strict"
                checked={matchMode === "strict"}
                onChange={(event) => setMatchMode(event.target.value)}
                style={{ marginTop: "2px" }}
              />
              <div>
                <div style={{ fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-mono)", fontSize: "13px" }}>
                  <CheckCircle2 size={14} /> Strict: Everyone Has To Like It
                </div>
                <p style={{ fontSize: "12px", marginTop: "2px", color: "inherit" }}>
                  Only movies liked by 100% of room members will become matches.
                </p>
              </div>
            </div>

            <div 
              className={`radio-card-option ${matchMode === "majority" ? "selected" : ""}`}
              onClick={() => setMatchMode("majority")}
            >
              <input
                type="radio"
                name="matchMode"
                value="majority"
                checked={matchMode === "majority"}
                onChange={(event) => setMatchMode(event.target.value)}
                style={{ marginTop: "2px" }}
              />
              <div>
                <div style={{ fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-mono)", fontSize: "13px" }}>
                  <Users2 size={14} /> Majority: Most People Have To Like It
                </div>
                <p style={{ fontSize: "12px", marginTop: "2px", color: "inherit" }}>
                  Movies liked by more than 50% of the group become matches.
                </p>
              </div>
            </div>
          </div>
        </div>

        <button 
          className="btn-primary" 
          onClick={handleCreateRoom} 
          disabled={creating}
          style={{ width: "100%", marginTop: "24px", padding: "12px", fontSize: "14px", display: "inline-flex", gap: "8px", alignItems: "center", justifyContent: "center" }}
        >
          {creating ? (
            <>
              <Loader size={16} className="spinner" /> Creating Room...
            </>
          ) : (
            <>
              <PlusCircle size={16} /> Create Room
            </>
          )}
        </button>

        {error && (
          <p style={{ color: "var(--color-error)", marginTop: "12px", fontFamily: "var(--font-mono)", fontSize: "13px" }}>
            {error}
          </p>
        )}
      </div>
    </main>
  );
}

export default CreateRoom;
