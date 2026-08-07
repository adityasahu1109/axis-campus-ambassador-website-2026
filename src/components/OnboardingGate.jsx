import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { TerminalLoader } from './motifs/TerminalLoader';

function OnboardingGate({ children }) {
  const { user, profile } = useAuth();
  const location = useLocation();

  if (user === undefined || (user && profile === undefined) || (user && profile === null)) {
    // Wait until profile is fully fetched
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
  }

  return children;
}

export default OnboardingGate;
