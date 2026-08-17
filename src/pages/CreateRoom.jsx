import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { createRoom } from "../services/rooms";

import { useNavigate } from "react-router-dom";

function CreateRoom() {
  const { user, loading } = useAuth();

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [matchMode, setMatchMode] = useState("strict");

  const navigate = useNavigate();

  async function handleCreateRoom() {
    if (!user) return;

    try {
      setCreating(true);
      setError("");

  const code = await createRoom(
    user.uid,
    "Anonymous User",
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
        <h2>Match Mode</h2>

        <label>
          <input
            type="radio"
            value="strict"
            checked={matchMode === "strict"}
            onChange={(event) => setMatchMode(event.target.value)}
          />
          Everyone must like it
        </label>

        <br />

        <label>
          <input
            type="radio"
            value="majority"
            checked={matchMode === "majority"}
            onChange={(event) => setMatchMode(event.target.value)}
          />
          More than half must like it
        </label>
      </div>

      <button onClick={handleCreateRoom} disabled={creating}>
        {creating ? "Creating..." : "Create Room"}
      </button>


      {error && <p>{error}</p>}
    </div>
  );
}

export default CreateRoom;
