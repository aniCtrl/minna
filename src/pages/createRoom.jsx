import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { createRoom } from "../services/rooms";

function CreateRoom() {
  const { user, loading } = useAuth();

  const [roomCode, setRoomCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function handleCreateRoom() {
    if (!user) return;

    try {
      setCreating(true);
      setError("");

      const code = await createRoom(user.uid, "Anonymous User");

      setRoomCode(code);
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

      <button onClick={handleCreateRoom} disabled={creating}>
        {creating ? "Creating..." : "Create Room"}
      </button>

      {roomCode && (
        <div>
          <h2>Room Created!</h2>
          <p>Room Code: {roomCode}</p>
        </div>
      )}

      {error && <p>{error}</p>}
    </div>
  );
}

export default CreateRoom;
