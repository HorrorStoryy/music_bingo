import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import HostPage from './pages/HostPage';
import PlayerPage from './pages/PlayerPage';
import GitHubGuidePage from './pages/GitHubGuidePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/host/:roomId" element={<HostPage />} />
        <Route path="/player/:roomId/:playerName" element={<PlayerPage />} />
        <Route path="/github-guide" element={<GitHubGuidePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
