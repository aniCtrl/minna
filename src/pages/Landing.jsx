import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="window-box">
      <div className="window-title-bar">
        <span>Minna.exe</span>
      </div>
      <div className="window-content center-container">
        <h1 style={{ marginBottom: "8px" }}>MINNA</h1>
        <p style={{ marginBottom: "24px" }}>
          Pick movies together. Vote on your favorites. Find your
          group's perfect match.
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
    </div>
  );
}

export default Landing;