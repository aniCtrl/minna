import { useRoom } from "../hooks/useRoom";
import { useMembers } from "../hooks/useMembers";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
    return <p>Loading room...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!room) {
    return <p>Room not found.</p>;
  }

  return (
    <div>
      <h1>Movie Night Lobby</h1>

      <RoomCodeDisplay roomCode={roomCode} />

      <p>Status: {room.status}</p>

      <h3>Members</h3>

      <ul>
        {members.map((member) => (
          <li key={member.uid}>
            {member.displayName}
          </li>
        ))}
      </ul>

      {/* Room management */}
      <button onClick={handleCloseRoom}>
        Close Room
      </button>

      <button onClick={handleClaimHost}>
        Claim Host
      </button>
    </div>
  );
}

export default Lobby;