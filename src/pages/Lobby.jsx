import { useRoom } from "../hooks/useRoom";
import { useMembers } from "../hooks/useMembers";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import RoomCodeDisplay from "../components/RoomCodeDisplay";


function Lobby() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { room, loading, error } = useRoom(roomCode);
  const members = useMembers(room);

  useEffect(() => {
  if (room?.status === "voting") {
    navigate(`/voting/${roomCode}`);
  }
}, [room?.status, roomCode, navigate]);

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
    </div>
  );
}

export default Lobby;