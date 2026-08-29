import { useLocation, useParams } from "react-router-dom";
import { Film, Monitor, Radio, Sparkles } from "lucide-react";
import cinematicBg from "../assets/cinematic-landing-bg.jpg";
import animeBg from "../assets/anime-app-bg.jpg";

function AppLayout({ children }) {
  const location = useLocation();
  const { roomCode } = useParams();
  const isLanding = location.pathname === "/";

  // Select background image according to prompt instructions:
  // Landing page uses cinematic projector picture; other pages use the anime graffiti picture.
  const bgImage = isLanding ? cinematicBg : animeBg;

  return (
    <div className={`retro-desktop-wrapper ${isLanding ? "mode-landing" : "mode-app"}`}>
      {/* Background Image Canvas with Atmospheric Overlays */}
      <div
        className="retro-bg-canvas"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className={`retro-bg-overlay ${isLanding ? "landing-overlay" : "app-overlay"}`} />
        <div className="retro-scanlines" />
      </div>

      {/* Retro OS Top System Navigation Bar */}
      <header className="retro-top-bar">
        <div className="retro-top-left">
          <span className="top-brand" style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: "1" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <Film size={14} className="top-brand-icon" /> MINNA.EXE
            </span>
            <span style={{ fontSize: "9px", color: "var(--color-primary-container)", letterSpacing: "0.14em", fontWeight: "600", marginTop: "-4px", textAlign: "center" }}>みんな</span>
          </span>
          <span className="top-divider">|</span>
          <span className="top-subtitle">Movie Night Matcher</span>
        </div>

        <div className="retro-top-right">
          {roomCode && (
            <span className="top-room-badge">
              <Radio size={11} className="pulse-icon" /> ROOM: <strong>{roomCode}</strong>
            </span>
          )}
          <span className="top-status-indicator">
            <span className="status-dot" /> SYSTEM ONLINE
          </span>
        </div>
      </header>

      {/* Central Interactive Content Workspace Area */}
      <main className="retro-desktop-content">
        <div className="retro-container">
          {children}
        </div>
      </main>

      {/* Retro OS Bottom Taskbar */}
      <footer className="retro-bottom-bar">
        <div className="bottom-status">
          <Monitor size={12} />
          <span>STATUS: READY</span>
        </div>
        <div className="bottom-hint">
          <Sparkles size={12} />
          <span>MINNA RETRO OS v1.0</span>
        </div>
      </footer>
    </div>
  );
}

export default AppLayout;
