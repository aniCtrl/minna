import { useNavigate } from "react-router-dom";
import { Film } from "lucide-react";

function Landing() {
  const navigate = useNavigate();

  return (
    <main className="window-box">
      <div className="window-title-bar">
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Film size={14} /> Minna.exe
        </span>
      </div>
      <div className="window-content center-container">
        <h1 style={{ marginBottom: "8px" }}>MINNA</h1>
        <p style={{ marginBottom: "24px", fontFamily: "var(--font-mono)", fontWeight: "bold", fontSize: "16px", color: "var(--color-primary)" }}>
          Pick together. Watch together.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
          <button className="btn-primary" onClick={() => navigate("/create")} style={{ width: "100%" }}>
            Create a Room
          </button>
          <button onClick={() => navigate("/join")} style={{ width: "100%" }}>
            Join a Room
          </button>
        </div>
      </div>
    </main>
  );
}

export default Landing;