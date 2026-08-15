import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer'; 
import OnboardingGate from './components/OnboardingGate';
import HomePage from './pages/HomePage';
import OnboardingDetailsPage from './pages/onboarding/OnboardingDetailsPage';
import OnboardingDomainTaskPage from './pages/onboarding/OnboardingDomainTaskPage';
import OnboardingPendingPage from './pages/onboarding/OnboardingPendingPage';
import NotificationsPage from './pages/NotificationsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import LoginPage from './pages/LoginPage';
import OrganizerLoginPage from './pages/OrganizerLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import MyDashboardPage from './pages/MyDashboardPage';
import ProfilePage from './pages/ProfilePage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import UpdatePasswordPage from './pages/UpdatePasswordPage';
import OrganizerProfilePage from './pages/OrganizerProfilePage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <div className="min-h-screen flex flex-col relative selection:bg-amber-deep/30">
      <Navbar />
      <main className="pt-20 flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login/organizer" element={<OrganizerLoginPage />} />
          <Route path="/announcements" element={<OnboardingGate><AnnouncementsPage /></OnboardingGate>} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/update-password" element={<UpdatePasswordPage />} />
          <Route path="/dashboard" element={<OnboardingGate><MyDashboardPage /></OnboardingGate>} />
          <Route path="/profile" element={<OnboardingGate><ProfilePage /></OnboardingGate>} />
          <Route path="/profile/organizer" element={<OnboardingGate><OrganizerProfilePage /></OnboardingGate>} />
          <Route path="/admin" element={<OnboardingGate><AdminDashboard /></OnboardingGate>} />
          <Route path="/notifications" element={<OnboardingGate><NotificationsPage /></OnboardingGate>} />
          {/* Onboarding Routes */}
          <Route path="/onboarding/details" element={<OnboardingGate><OnboardingDetailsPage /></OnboardingGate>} />
          <Route path="/onboarding/domain-task" element={<OnboardingGate><OnboardingDomainTaskPage /></OnboardingGate>} />
          <Route path="/onboarding/pending" element={<OnboardingGate><OnboardingPendingPage /></OnboardingGate>} />
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;