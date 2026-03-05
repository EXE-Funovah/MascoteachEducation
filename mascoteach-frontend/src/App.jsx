import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import SignUpPage from '@/pages/SignUpPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';

// Portal layout + pages
import PortalLayout from '@/components/portal/layout/PortalLayout';
import HomePage from '@/pages/portal/HomePage';
import LibraryPage from '@/pages/portal/LibraryPage';
import SessionsPage from '@/pages/portal/SessionsPage';

// Legacy pages (still accessible if needed)
import CreatePage from '@/pages/portal/CreatePage';
import GameModesPage from '@/pages/portal/GameModesPage';
import HostGamePage from '@/pages/portal/HostGamePage';
import StudentGamePage from '@/pages/portal/StudentGamePage';
import AnalyticsPage from '@/pages/portal/AnalyticsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public routes ── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route path="/portal" element={<PortalLayout />}>
          <Route index element={<HomePage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="sessions" element={<SessionsPage />} />
        </Route>

        {/* ── Student Game (standalone, no sidebar) ── */}
        <Route path="/play" element={<StudentGamePage />} />
      </Routes>
    </BrowserRouter>
  );
}
