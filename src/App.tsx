import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import FilmOverlay from './components/FilmOverlay';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import HostPage from './pages/HostPage';
import PlayerPage from './pages/PlayerPage';
import AdminPage from './pages/AdminPage';
import HowToPlayPage from './pages/HowToPlayPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/host/:roomId/:playlistId" element={<ProtectedRoute><HostPage /></ProtectedRoute>} />
      <Route path="/player/:roomId/:playerName" element={<PlayerPage />} />
      <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
      <Route path="/how-to-play" element={<HowToPlayPage />} />
    </Routes>
  );
}

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <FilmOverlay>
          <AppRoutes />
        </FilmOverlay>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
