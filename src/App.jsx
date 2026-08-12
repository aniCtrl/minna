import { BrowserRouter, Routes, Route } from "react-router-dom";

import TMDBTest from "./pages/TMDBTest";
import FirebaseTest from "./pages/FirebaseTest";

import Landing from "./pages/Landing";
import CreateRoom from "./pages/CreateRoom";
import JoinRoom from "./pages/JoinRoom";
import Lobby from "./pages/Lobby";
import MovieSelection from "./pages/MovieSelection";
import Voting from "./pages/Voting";
import Results from "./pages/Results";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/create" element={<CreateRoom />} />
        <Route path="/join" element={<JoinRoom />} />
        <Route path="/selection" element={<MovieSelection />} />
        <Route path="/voting" element={<Voting />} />
        <Route path="/results" element={<Results />} />
        <Route path="/tmdb-test" element={<TMDBTest />} />
        <Route path="firebase-test" element={<FirebaseTest />} />
        <Route path="/lobby/:roomCode" element={<Lobby />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;