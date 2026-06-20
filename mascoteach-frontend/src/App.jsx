import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import MarketingPlaceholderPage from '@/pages/MarketingPlaceholderPage';
import PricingPage from '@/pages/PricingPage';
import CheckoutPage from '@/pages/CheckoutPage';
import PaymentSuccessPage from '@/pages/PaymentSuccessPage';
import PaymentCancelPage from '@/pages/PaymentCancelPage';
import AccountBillingPage from '@/pages/AccountBillingPage';
import ProfilePage from '@/pages/ProfilePage';
import LoginPage from '@/pages/LoginPage';
import SignUpPage from '@/pages/SignUpPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import VerifyEmailPage from '@/pages/VerifyEmailPage';

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
        <Route path="/" element={<Home />} />
        <Route path="/product" element={<MarketingPlaceholderPage type="product" />} />
        <Route path="/features" element={<MarketingPlaceholderPage type="features" />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute allowedRoles={['Teacher']}>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/success"
          element={
            <ProtectedRoute allowedRoles={['Teacher']}>
              <PaymentSuccessPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout/cancel"
          element={
            <ProtectedRoute allowedRoles={['Teacher']}>
              <PaymentCancelPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/cancel"
          element={
            <ProtectedRoute allowedRoles={['Teacher']}>
              <PaymentCancelPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/billing"
          element={
            <ProtectedRoute allowedRoles={['Teacher']}>
              <Navigate to="/teacher/billing" replace />
            </ProtectedRoute>
          }
        />
        <Route path="/signin" element={<LoginPage />} />
        <Route path="/register" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={['Teacher']}>
              <PortalLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="sessions" element={<SessionsPage />} />
          <Route path="billing" element={<AccountBillingPage />} />
          <Route path="quiz-settings" element={<QuizSettingsPage />} />
          <Route path="quiz-preview" element={<QuizPreviewPage />} />
        </Route>

        {import.meta.env.DEV && (
          <>
            <Route path="/dev/teacher" element={<PortalLayout />}>
              <Route index element={<HomePage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="library" element={<LibraryPage />} />
              <Route path="sessions" element={<SessionsPage />} />
              <Route path="billing" element={<AccountBillingPage />} />
              <Route path="quiz-settings" element={<QuizSettingsPage />} />
              <Route path="quiz-preview" element={<QuizPreviewPage />} />
            </Route>
            <Route path="/dev/teacher/select-game-template" element={<GameTemplateSelectionPage />} />
          </>
        )}

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
          <Route path="profile" element={<ProfilePage />} />
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
          <Route path="profile" element={<ProfilePage />} />
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
