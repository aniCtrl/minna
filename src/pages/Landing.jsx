import { useNavigate } from "react-router-dom";
import { Film, PlusCircle, LogIn, Sparkles, Popcorn, Heart, CheckCircle2 } from "lucide-react";

function Landing() {
  const navigate = useNavigate();

  return (
    <main className="window-box" style={{ width: "100%" }}>
      <div className="window-title-bar">
        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Film size={14} /> Minna.exe - Cinema Launcher
        </span>
        <div style={{ display: "flex", gap: "4px", fontSize: "11px" }}>
          <span style={{ padding: "0 4px", cursor: "default" }}>_</span>
          <span style={{ padding: "0 4px", cursor: "default" }}>□</span>
          <span style={{ padding: "0 4px", cursor: "default" }}>✕</span>
        </div>
      </div>

      <div className="window-content center-container" style={{ padding: "28px 24px" }}>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "6px" }}>
          <span 
            style={{ 
              fontSize: "16px", 
              fontWeight: "600",
              fontFamily: "var(--font-mono)", 
              color: "var(--color-primary)", 
              letterSpacing: "0.15em", 
              marginBottom: "3px",
              opacity: 0.95,
              lineHeight: 1
            }}
          >
            みんな
          </span>

          <h1 style={{ fontSize: "32px", margin: 0, letterSpacing: "-0.04em", lineHeight: 1.1 }}>
            MINNA
          </h1>
        </div>

        <p style={{ 
          marginBottom: "20px", 
          fontFamily: "var(--font-mono)", 
          fontWeight: "700", 
          fontSize: "15px", 
          color: "var(--color-primary)" 
        }}>
          Pick together. Watch together.
        </p>

        {/* Feature Cards Grid - Adds structure & prevents isolated dialog feel */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", 
          gap: "10px", 
          width: "100%", 
          marginBottom: "24px" 
        }}>
          <div className="retro-inset" style={{ padding: "10px", textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "bold", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--color-primary)", marginBottom: "4px" }}>
              <Popcorn size={14} /> 1. Create Room
            </div>
            <p style={{ fontSize: "12px", margin: 0, color: "var(--color-on-surface-variant)" }}>
              Start a room and invite your movie crew.
            </p>
          </div>

          <div className="retro-inset" style={{ padding: "10px", textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "bold", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--color-secondary)", marginBottom: "4px" }}>
              <Heart size={14} /> 2. Swipe & Vote
            </div>
            <p style={{ fontSize: "12px", margin: 0, color: "var(--color-on-surface-variant)" }}>
              Add movies to pool and cast your votes.
            </p>
          </div>

          <div className="retro-inset" style={{ padding: "10px", textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "bold", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--color-tertiary)", marginBottom: "4px" }}>
              <CheckCircle2 size={14} /> 3. Instant Match
            </div>
            <p style={{ fontSize: "12px", margin: 0, color: "var(--color-on-surface-variant)" }}>
              Find the perfect movie everyone wants to watch!
            </p>
          </div>
        </div>

        <hr className="retro-divider" style={{ width: "100%", margin: "0 0 20px 0" }} />

        {/* Primary Action Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
          <button 
            className="btn-primary" 
            onClick={() => navigate("/create")} 
            style={{ width: "100%", padding: "12px", fontSize: "14px", display: "inline-flex", gap: "8px", alignItems: "center", justifyContent: "center" }}
          >
            <PlusCircle size={16} /> Create a Room
          </button>
          
          <button 
            onClick={() => navigate("/join")} 
            style={{ width: "100%", padding: "12px", fontSize: "14px", display: "inline-flex", gap: "8px", alignItems: "center", justifyContent: "center" }}
          >
            <LogIn size={16} /> Join a Room
          </button>
        </div>
      </div>
    </main>
  );
}

export default Landing;