import { useRoom } from "../hooks/useRoom";
import { useMembers } from "../hooks/useMembers";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Users, User, LogOut, ShieldAlert, X, Loader, Play, Crown, Radio, Sparkles } from "lucide-react";
import { useChatMessages } from "../hooks/useChatMessages";

import RoomCodeDisplay from "../components/RoomCodeDisplay";

import { closeRoom, claimHost } from "../services/rooms";
import { sendMessage } from "../services/chat";
import { useAuth } from "../hooks/useAuth";

function Lobby() {
  const { roomCode } = useParams();
  const navigate = useNavigate();

  const { room, loading, error } = useRoom(roomCode);
  const members = useMembers(room);

  const { messages, loading: chatLoading } = useChatMessages(roomCode);

  const { user } = useAuth();

  const [alertMessage, setAlertMessage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (room?.status === "closed") {
      navigate("/", { replace: true });
    } else if (room?.status === "voting") {
      navigate(`/voting/${roomCode}`);
    }
  }, [room?.status, roomCode, navigate]);

  async function handleCloseRoom() {
    if (processing || !user) return;
    try {
      setProcessing(true);
      await closeRoom(roomCode, user.uid);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Close room error:", error);

      if (error.message === "NOT_HOST") {
        setAlertMessage("Only the host can close the room.");
      } else {
        setAlertMessage("Failed to close room.");
      }
    } finally {
      setProcessing(false);
    }
  }

  async function handleClaimHost() {
    if (processing || !user) return;
    try {
      setProcessing(true);
      await claimHost(roomCode, user.uid);
      setAlertMessage("You are now the host!");
    } catch (error) {
      console.error("Claim host error:", error);

      if (error.message === "HOST_STILL_PRESENT") {
        setAlertMessage("The current host is still present.");
      } else if (error.message === "NOT_MEMBER") {
        setAlertMessage("You are not a member of this room.");
      } else if (error.message === "ROOM_CLOSED") {
        setAlertMessage("This room is closed.");
      } else {
        setAlertMessage("Failed to claim host.");
      }
    } finally {
      setProcessing(false);
    }
  }

  async function handleSendMessage() {
    if (sendingMessage || !user) return;

    const trimmedMessage = messageText.trim();

    if (!trimmedMessage) return;

    try {
      setSendingMessage(true);

      await sendMessage(
        roomCode,
        user.uid,
        room.members?.[user.uid]?.displayName || "Anonymous",
        trimmedMessage
      );

      setMessageText("");
    } catch (error) {
      console.error("Send message error:", error);

      if (error.message === "EMPTY_MESSAGE") {
        setAlertMessage("Message cannot be empty.");
      } else if (error.message === "MESSAGE_TOO_LONG") {
        setAlertMessage("Message is too long. Keep it under 500 characters.");
      } else {
        setAlertMessage("Failed to send message.");
      }
    } finally {
      setSendingMessage(false);
    }
  }

  if (loading) {
    return (
      <div className="window-box">
        <div className="window-title-bar">
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Users size={14} /> Minna.exe - Room Lobby
          </span>
        </div>
        <div className="window-content center-container" style={{ padding: "32px 20px" }}>
          <p style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-mono)", fontWeight: "600" }}>
            <Loader size={18} className="spinner" /> Accessing room lobby...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="window-box">
        <div className="window-title-bar">
          <span>Error.exe</span>
        </div>
        <div className="window-content">
          <p style={{ color: "var(--color-error)", fontFamily: "var(--font-mono)" }}>{error}</p>
          <button onClick={() => navigate("/")} style={{ marginTop: "16px" }}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="window-box">
        <div className="window-title-bar">
          <span>Not Found.exe</span>
        </div>
        <div className="window-content">
          <p style={{ fontFamily: "var(--font-mono)" }}>Room not found.</p>
          <button onClick={() => navigate("/")} style={{ marginTop: "16px" }}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const isCurrentUserHost = room.hostUid === user?.uid;

  return (
    <>
      <main className="window-box" style={{ width: "100%" }}>
        <div className="window-title-bar">
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Users size={14} /> Minna.exe - Room Lobby
          </span>
          <button
            onClick={() => navigate("/")}
            style={{ border: "none", background: "transparent", padding: "0 4px", display: "flex", alignItems: "center", cursor: "pointer", color: "inherit" }}
            aria-label="Exit room and back to home page"
            disabled={processing}
          >
            <X size={13} />
          </button>
        </div>

        <div className="window-content">
          {/* Top Status Banner Bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
            <div>
              <h1 style={{ fontSize: "22px", marginBottom: "2px" }}>Movie Night Lobby</h1>
              <p style={{ fontSize: "13px", color: "var(--color-on-surface-variant)" }}>
                Match Mode: <span className="retro-chip secondary" style={{ textTransform: "capitalize", marginLeft: "4px" }}>{room.matchMode || "Strict"}</span>
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="retro-chip tertiary" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <Radio size={10} className="pulse-icon" /> LOBBY ACTIVE
              </span>
            </div>
          </div>

          {/* Focal Room Code Component */}
          <RoomCodeDisplay roomCode={roomCode} />

          {room.status === "lobby" && (
            <div className="retro-inset" style={{ padding: "10px 14px", margin: "12px 0 16px 0", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={14} style={{ color: "var(--color-tertiary)", flexShrink: 0 }} />
              <span>Waiting for everyone to join before selecting movies.</span>
            </div>
          )}

          <hr className="retro-divider" />

          {/* Active Members Section */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <h3 id="active-members-heading" style={{ fontFamily: "var(--font-mono)", fontSize: "13px", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
              <Users size={14} /> Active Members ({members.length})
            </h3>
            <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--color-outline)" }}>
              LIVE PRESENCE
            </span>
          </div>

          <ul
            aria-labelledby="active-members-heading"
            aria-live="polite"
            className="member-list-grid"
          >
            {members.map((member) => {
              const isHost = member.uid === room.hostUid;
              const isSelf = member.uid === user?.uid;
              const initial = member.displayName ? member.displayName.charAt(0).toUpperCase() : "?";

              return (
                <li key={member.uid} className="member-item-card">
                  <div className="member-avatar">
                    {initial}
                  </div>
                  <span className="member-name">
                    {member.displayName} {isSelf && "(You)"}
                  </span>
                  {isHost && (
                    <span className="member-host-badge" title="Room Host">
                      <Crown size={10} style={{ display: "inline-block", verticalAlign: "middle", marginRight: "2px" }} />
                      HOST
                    </span>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Lobby Chat */}
          <div style={{ marginTop: "16px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                💬 Room Chat
              </h3>

              <span
                style={{
                  fontSize: "11px",
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-outline)",
                }}
              >
                LIVE CHAT
              </span>
            </div>

            <div
              className="retro-inset"
              style={{
                height: "260px",
                overflowY: "auto",
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {chatLoading ? (
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    color: "var(--color-on-surface-variant)",
                  }}
                >
                  Loading chat...
                </p>
              ) : messages.length === 0 ? (
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    color: "var(--color-on-surface-variant)",
                    textAlign: "center",
                    margin: "auto 0",
                  }}
                >
                  No messages yet. Start the conversation.
                </p>
              ) : (
                messages.map((message) => {
                  const isSelf = message.uid === user?.uid;

                  return (
                    <div
                      key={message.id}
                      style={{
                        alignSelf: isSelf ? "flex-end" : "flex-start",
                        maxWidth: "80%",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "10px",
                          fontFamily: "var(--font-mono)",
                          color: "var(--color-outline)",
                          marginBottom: "2px",
                        }}
                      >
                        {isSelf ? "You" : message.displayName}
                      </div>

                      <div
                        style={{
                          padding: "7px 10px",
                          border: "1px solid var(--color-outline)",
                          background: "var(--color-surface)",
                          fontSize: "13px",
                          wordBreak: "break-word",
                        }}
                      >
                        {message.text}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <input
                type="text"
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSendMessage();
                  }
                }}
                placeholder="Type a message..."
                maxLength={500}
                disabled={sendingMessage}
                style={{
                  flex: 1,
                  minWidth: 0,
                }}
              />

              <button
                className="btn-primary"
                onClick={handleSendMessage}
                disabled={sendingMessage || !messageText.trim()}
              >
                {sendingMessage ? "..." : "SEND"}
              </button>
            </div>
          </div>

          <hr className="retro-divider" />

          {/* Lobby Navigation Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {room.status === "lobby" && (
              <button
                className="btn-primary"
                onClick={() => navigate(`/movie-selection/${roomCode}`)}
                disabled={processing}
                style={{ width: "100%", padding: "12px", fontSize: "14px", display: "inline-flex", gap: "8px", alignItems: "center", justifyContent: "center" }}
              >
                <Play size={16} /> Go to Movie Selection
              </button>
            )}

            <div style={{ display: "flex", gap: "10px", width: "100%" }}>
              <button
                onClick={handleCloseRoom}
                disabled={processing}
                style={{ flex: 1, padding: "10px", display: "inline-flex", alignItems: "center", gap: "6px", justifyContent: "center" }}
              >
                <LogOut size={13} /> Close Room
              </button>

              <button
                onClick={handleClaimHost}
                disabled={processing || isCurrentUserHost}
                style={{ flex: 1, padding: "10px", display: "inline-flex", alignItems: "center", gap: "6px", justifyContent: "center" }}
              >
                <ShieldAlert size={13} /> {isCurrentUserHost ? "You are Host" : "Claim Host"}
              </button>
            </div>
          </div>
        </div>
      </main>

      {alertMessage && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "16px" }}>
          <div className="window-box" style={{ maxWidth: "340px", width: "100%", margin: 0 }}>
            <div className="window-title-bar">
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <ShieldAlert size={13} /> System Message.exe
              </span>
              <button onClick={() => setAlertMessage(null)} style={{ border: "none", background: "transparent", color: "inherit", cursor: "pointer", display: "flex", alignItems: "center" }}>
                <X size={13} />
              </button>
            </div>
            <div className="window-content" style={{ display: "flex", flexDirection: "column", gap: "14px", alignItems: "center", textAlign: "center" }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "13px" }}>{alertMessage}</p>
              <button className="btn-primary" onClick={() => setAlertMessage(null)} style={{ minWidth: "90px" }}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Lobby;