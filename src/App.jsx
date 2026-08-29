import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppLayout from "./components/AppLayout";
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
      <AppLayout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/create" element={<CreateRoom />} />
          <Route path="/join" element={<JoinRoom />} />
          <Route path="/join/:roomCode" element={<JoinRoom />} />
          <Route path="/movie-selection/:roomCode" element={<MovieSelection />} />
          <Route path="/voting/:roomCode" element={<Voting />} />
          <Route path="/results/:roomCode" element={<Results />} />
          <Route path="/lobby/:roomCode" element={<Lobby />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;