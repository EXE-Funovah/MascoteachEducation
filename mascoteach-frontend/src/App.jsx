import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import SignUpPage from '@/pages/SignUpPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';

// Portal layout + pages
import PortalLayout from '@/components/portal/layout/PortalLayout';
import DashboardPage from '@/pages/portal/DashboardPage';
import CreatePage from '@/pages/portal/CreatePage';
import GameModesPage from '@/pages/portal/GameModesPage';
import HostGamePage from '@/pages/portal/HostGamePage';
import StudentGamePage from '@/pages/portal/StudentGamePage';
import SessionsPage from '@/pages/portal/SessionsPage';
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

        {/* ── Teacher Portal (after login) ── */}
        <Route path="/portal" element={<PortalLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="create" element={<CreatePage />} />
          <Route path="games" element={<GameModesPage />} />
          <Route path="host" element={<HostGamePage />} />
          <Route path="sessions" element={<SessionsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>

        {/* ── Student Game (standalone, no sidebar) ── */}
        <Route path="/play" element={<StudentGamePage />} />
      </Routes>
    </BrowserRouter>
  );
}
