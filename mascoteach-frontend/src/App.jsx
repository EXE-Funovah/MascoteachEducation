import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import PricingPage from '@/pages/PricingPage';
import LoginPage from '@/pages/LoginPage';
import SignUpPage from '@/pages/SignUpPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';

import ProtectedRoute from '@/components/auth/ProtectedRoute';

import PortalLayout from '@/components/portal/layout/PortalLayout';
import HomePage from '@/pages/portal/HomePage';
import LibraryPage from '@/pages/portal/LibraryPage';
import SessionsPage from '@/pages/portal/SessionsPage';
import QuizSettingsPage from '@/pages/portal/QuizSettingsPage';
import QuizPreviewPage from '@/pages/portal/QuizPreviewPage';
import GameTemplateSelectionPage from '@/pages/portal/GameTemplateSelectionPage';
import TreasureHuntGame from '@/pages/portal/TreasureHuntGame';
import TreasureHuntHostPage from '@/pages/portal/TreasureHuntHostPage';

import StudentGamePage from '@/pages/portal/StudentGamePage';

import GameLobby from '@/pages/student/GameLobby';
import LiveSessionWaitingPage from '@/pages/student/LiveSessionWaitingPage';
import StudentLiveGamePage from '@/pages/student/StudentLiveGamePage';
import AdventureGamePage from '@/pages/student/games/AdventureGame';
import AdventureDemoPage from '@/pages/student/games/AdventureGame/DemoPage';

import MascotWidget from '@/components/mascot/MascotWidget';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

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
        </Route>

        <Route
          path="/teacher/select-game-template"
          element={
            <ProtectedRoute allowedRoles={['Teacher']}>
              <GameTemplateSelectionPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/treasure-hunt"
          element={
            <ProtectedRoute allowedRoles={['Teacher']}>
              <TreasureHuntGame />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/live-session/:sessionId"
          element={
            <ProtectedRoute allowedRoles={['Teacher']}>
              <TreasureHuntHostPage />
            </ProtectedRoute>
          }
        />

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

        <Route path="/play" element={<GameLobby />} />
        <Route path="/play/waiting" element={<LiveSessionWaitingPage />} />
        <Route path="/play/live-game" element={<StudentLiveGamePage />} />
        <Route path="/play/treasure-hunt" element={<TreasureHuntGame />} />
        <Route path="/play/adventure" element={<AdventureGamePage />} />
        <Route path="/play/demo" element={<AdventureDemoPage />} />

        <Route path="/play/legacy" element={<StudentGamePage />} />
      </Routes>

      <MascotWidget />
    </BrowserRouter>
  );
}
