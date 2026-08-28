import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { TerminalLoader } from './motifs/TerminalLoader';

function OnboardingGate({ children, requiredRole }) {
  const { user, profile, authLoading, profileLoading, profileError, refetchProfile, signOut } = useAuth();
  const location = useLocation();

  if (authLoading || (user && profileLoading)) {
    return (
      <div className="flex justify-center items-center h-screen bg-void">
          <TerminalLoader text="Authenticating_Session..." />
      </div>
    );
  }

  // If no user, redirect to login for protected routes.
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (profileError || !profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-void px-6 text-center font-mono">
        <p className="text-sm tracking-widest text-danger">PROFILE_CONNECTION_FAILED</p>
        <div className="flex gap-3">
          <button onClick={refetchProfile} className="border border-cyan px-4 py-2 text-xs font-bold tracking-widest text-cyan">RETRY</button>
          <button onClick={signOut} className="border border-danger px-4 py-2 text-xs font-bold tracking-widest text-danger">END_SESSION</button>
        </div>
      </div>
    );
  }

  if (requiredRole && profile.role !== requiredRole) {
    return <Navigate to={profile.role === 'organizer' ? '/admin' : '/dashboard'} replace />;
  }

  // For organizers, skip onboarding checks
  if (profile?.role === 'organizer') {
    return children;
  }

  // Determine where they should be based on their profile status
  const currentPath = location.pathname;
  const isTargetingOnboarding = currentPath.startsWith('/onboarding');
  
  if (profile?.status === 'incomplete_profile') {
    if (currentPath !== '/onboarding/details') {
      return <Navigate to="/onboarding/details" replace />;
    }
  } else if (profile?.status === 'domain_pending') {
    if (currentPath !== '/onboarding/domain-task') {
      return <Navigate to="/onboarding/domain-task" replace />;
    }
  } else if (profile?.status === 'pending_review') {
    if (currentPath !== '/onboarding/pending') {
      return <Navigate to="/onboarding/pending" replace />;
    }
  } else if (profile?.status === 'active') {
    // If they are active and trying to hit onboarding URLs, bounce them out
    if (isTargetingOnboarding) {
      return <Navigate to="/dashboard" replace />;
    }
  } else {
    // Unexpected status = fail loud, not silent
    return (
      <div className="flex justify-center items-center h-screen bg-void text-red-500 font-mono">
        <h1>UNEXPECTED_STATUS_ERROR: {profile?.status}</h1>
      </div>
    );
  }

  return children;
}

export default OnboardingGate;
