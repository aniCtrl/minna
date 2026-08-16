import { useState } from "react";

function RoomCodeDisplay({ roomCode }) {
  const [copied, setCopied] = useState(false);

  async function handleCopyInviteLink() {
    const inviteLink = `${window.location.origin}/join/${roomCode}`;

    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy invite link:", error);
    }
  }

  return (
    <div>
      <h2>Room Code: {roomCode}</h2>

      <button onClick={handleCopyInviteLink}>
        {copied ? "Copied!" : "Copy Invite Link"}
      </button>
    </div>
  );
}

export default RoomCodeDisplay;