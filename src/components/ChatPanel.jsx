import { useEffect, useRef, useState } from "react";
import { MessageSquare } from "lucide-react";
import { useChatMessages } from "../hooks/useChatMessages";
import { sendMessage } from "../services/chat";
import { useAuth } from "../hooks/useAuth";

export default function ChatPanel({
  roomCode,
  room,
  height = "260px",
  className = "",
  compact = false,
}) {
  const { messages, loading: chatLoading } = useChatMessages(roomCode);
  const { user } = useAuth();

  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  async function handleSendMessage() {
    if (sendingMessage || !user) return;

    const trimmedMessage = messageText.trim();
    if (!trimmedMessage) return;

    try {
      setSendingMessage(true);
      setErrorMsg(null);

      const displayName =
        room?.members?.[user.uid]?.displayName || "Anonymous";

      await sendMessage(roomCode, user.uid, displayName, trimmedMessage);
      setMessageText("");
    } catch (error) {
      console.error("Send message error:", error);
      if (error.message === "EMPTY_MESSAGE") {
        setErrorMsg("Message cannot be empty.");
      } else if (error.message === "MESSAGE_TOO_LONG") {
        setErrorMsg("Message too long (max 500 chars).");
      } else {
        setErrorMsg("Failed to send message.");
      }
    } finally {
      setSendingMessage(false);
    }
  }

  return (
    <div className={`window-box chat-window-panel ${className}`}>
      <div className="window-title-bar">
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <MessageSquare size={13} /> Live Chat
        </span>
        <span
          style={{
            fontSize: "10px",
            fontFamily: "var(--font-mono)",
            opacity: 0.85,
            letterSpacing: "0.05em",
          }}
        >
          LIVE
        </span>
      </div>

      <div
        className="window-content"
        style={{
          padding: compact ? "10px" : "14px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
        }}
      >
        <div
          className="retro-inset chat-messages-container"
          style={{
            flex: 1,
            height: height === "100%" ? "100%" : undefined,
            minHeight: height && height !== "100%" ? height : "180px",
            maxHeight: height && height !== "100%" ? height : undefined,
            overflowY: "auto",
            padding: "10px",
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
                    maxWidth: "85%",
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
                      padding: "6px 9px",
                      border: "1px solid var(--color-outline)",
                      background: "var(--color-surface)",
                      fontSize: "12px",
                      wordBreak: "break-word",
                      lineHeight: "1.4",
                    }}
                  >
                    {message.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {errorMsg && (
          <p
            style={{
              color: "var(--color-error)",
              fontSize: "11px",
              fontFamily: "var(--font-mono)",
              marginTop: "4px",
            }}
          >
            {errorMsg}
          </p>
        )}

        <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
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
              fontSize: "12px",
              padding: "6px 8px",
            }}
          />

          <button
            className="btn-primary"
            onClick={handleSendMessage}
            disabled={sendingMessage || !messageText.trim()}
            style={{ padding: "6px 12px", fontSize: "12px" }}
          >
            {sendingMessage ? "..." : "SEND"}
          </button>
        </div>
      </div>
    </div>
  );
}
