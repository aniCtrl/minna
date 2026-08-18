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
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "stretch", width: "100%", margin: "8px 0" }}>
      <label style={{ fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 600 }}>Room Code</label>
      <div style={{ display: "flex", gap: "8px" }}>
        <div 
          className="retro-inset" 
          style={{ flex: 1, padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: "18px", fontWeight: "bold", textAlign: "center", letterSpacing: "1px" }}
        >
          {roomCode}
        </div>
        <button onClick={handleCopyInviteLink} style={{ minWidth: "120px" }}>
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>
    </div>
  );
}

export default RoomCodeDisplay;