import { useRoom } from "../hooks/useRoom";
import { useMembers } from "../hooks/useMembers";
import { useParams } from "react-router-dom";

function Lobby() {
  const { roomCode } = useParams();
  
  const { room, loading, error } = useRoom(roomCode);
  const members = useMembers(room);

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

      <h2>Room Code: {room.id}</h2>

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