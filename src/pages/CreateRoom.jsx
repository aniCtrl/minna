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
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Create Room</h1>

      <div>
        <h2>Your Name</h2>

        <input
          type="text"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Enter your name"
          maxLength={30}
        />
      </div>
      <div>
        <h2>Match Mode</h2>

        <p>
          Choose how movies become matches after everyone votes.
        </p>

        <label>
          <input
            type="radio"
            value="strict"
            checked={matchMode === "strict"}
            onChange={(event) => setMatchMode(event.target.value)}
          />
          Everyone has to like it
        </label>
        <p style={{ fontSize: "0.85em", color: "#666", marginTop: "4px", marginBottom: "12px", paddingLeft: "24px" }}>
          Only movies liked by everyone become matches.
        </p>

        <label>
          <input
            type="radio"
            value="majority"
            checked={matchMode === "majority"}
            onChange={(event) => setMatchMode(event.target.value)}
          />
          Most people have to like it
        </label>
        <p style={{ fontSize: "0.85em", color: "#666", marginTop: "4px", marginBottom: "12px", paddingLeft: "24px" }}>
          Movies liked by more than half the group become matches.
        </p>
      </div>

      <button onClick={handleCreateRoom} disabled={creating}>
        {creating ? "Creating..." : "Create Room"}
      </button>


      {error && <p>{error}</p>}
    </div>
  );
}

export default CreateRoom;
