import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer'; 
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
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

function App() {
  return (
    <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 min-h-screen antialiased flex flex-col">
      <Navbar />
      <main className="pt-20 flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login/organizer" element={<OrganizerLoginPage />} />
          <Route path="/announcements" element={<AnnouncementsPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/update-password" element={<UpdatePasswordPage />} />
          <Route path="/dashboard" element={<MyDashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/organizer" element={<OrganizerProfilePage />} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;