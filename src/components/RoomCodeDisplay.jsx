import { useState } from "react";
import { Copy, Check, Share2, Key } from "lucide-react";

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
    <div className="room-code-container">
      <div className="room-code-header">
        <label className="room-code-label">
          <Key size={13} /> Room Access Code
        </label>
        <span className="room-code-subtext" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <Share2 size={12} /> Share invite link with friends
        </span>
      </div>

      <div className="room-code-box">
        <div className="room-code-display-value">
          {roomCode}
        </div>
        <button 
          className={copied ? "btn-secondary" : "btn-primary"} 
          onClick={handleCopyInviteLink} 
          style={{ minWidth: "130px", height: "48px", display: "inline-flex", gap: "8px", alignItems: "center", justifyContent: "center" }}
        >
          {copied ? (
            <>
              <Check size={14} /> Copied!
            </>
          ) : (
            <>
              <Copy size={14} /> Copy Link
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default RoomCodeDisplay;