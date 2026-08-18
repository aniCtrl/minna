import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Minna</h1>

      <p>
        Pick movies together. Vote on your favorites. Find your
        group's perfect match.
      </p>

      <button onClick={() => navigate("/create")}>
        Create a Room
      </button>

      <button onClick={() => navigate("/join")}>
        Join a Room
      </button>
    </div>
  );
}

export default Landing;