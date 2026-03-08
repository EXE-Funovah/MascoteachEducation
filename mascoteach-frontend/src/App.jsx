import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import PricingPage from '@/pages/PricingPage';
import LoginPage from '@/pages/LoginPage';
import SignUpPage from '@/pages/SignUpPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';

// Auth guard
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Teacher layout + pages
import PortalLayout from '@/components/portal/layout/PortalLayout';
import HomePage from '@/pages/portal/HomePage';
import LibraryPage from '@/pages/portal/LibraryPage';
import SessionsPage from '@/pages/portal/SessionsPage';
import QuizSettingsPage from '@/pages/portal/QuizSettingsPage';
import QuizPreviewPage from '@/pages/portal/QuizPreviewPage';
import GameTemplateSelectionPage from '@/pages/portal/GameTemplateSelectionPage';

// Student Game (standalone, no sidebar)
import StudentGamePage from '@/pages/portal/StudentGamePage';

// Adventure Game — new game mode
import GameLobby from '@/pages/student/GameLobby';
import AdventureGamePage from '@/pages/student/games/AdventureGame';

// Interactive Mascot
import MascotWidget from '@/components/mascot/MascotWidget';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public routes ── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* ── Teacher routes ── */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={['Teacher']}>
              <PortalLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="sessions" element={<SessionsPage />} />
          <Route path="quiz-settings" element={<QuizSettingsPage />} />
          <Route path="quiz-preview" element={<QuizPreviewPage />} />
          <Route path="select-game-template" element={<GameTemplateSelectionPage />} />
        </Route>

        {/* ── Student routes ── */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['Student']}>
              <PortalLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomePage />} />
        </Route>

        {/* ── Parent routes ── */}
        <Route
          path="/parent"
          element={
            <ProtectedRoute allowedRoles={['Parent']}>
              <PortalLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomePage />} />
        </Route>

        {/* ── Student Game (standalone, no sidebar) ── */}
        <Route path="/play" element={<GameLobby />} />
        <Route path="/play/adventure" element={<AdventureGamePage />} />

        {/* Legacy student game placeholder */}
        <Route path="/play/legacy" element={<StudentGamePage />} />
      </Routes>

      {/* ── Interactive Mascot (persists across all pages) ── */}
      <MascotWidget />
    </BrowserRouter>
  );
}
