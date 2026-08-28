import React, { createContext, useCallback, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

const AUTH_TIMEOUT_MS = 5000;

function withTimeout(promise, label) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(`${label} timed out`)), AUTH_TIMEOUT_MS);
  });

  return Promise.race([promise, timeout]).finally(() => window.clearTimeout(timeoutId));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      setProfileError(null);
      setProfileLoading(false);
      return null;
    }

    setProfileLoading(true);
    setProfileError(null);

    try {
      const { data, error } = await withTimeout(
        supabase.from('profiles').select('*').eq('id', userId).single(),
        'Profile request',
      );

      if (error) throw error;
      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
      setProfileError(error);
      return null;
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const initialise = async () => {
      try {
        const { data, error } = await withTimeout(supabase.auth.getSession(), 'Session initialization');
        if (error) throw error;
        if (!active) return;
        setSession(data.session ?? null);
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.error('Session initialization failed:', error);
        if (!active) return;
        setSession(null);
        setUser(null);
      } finally {
        if (active) setAuthLoading(false);
      }
    };

    initialise();

    // Do not make Supabase calls inside this callback: it can deadlock supabase-js.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession ?? null);
      setUser(nextSession?.user ?? null);
      setAuthLoading(false);
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;

      // Preserve background-tab session recovery without using the auth callback.
      void withTimeout(supabase.auth.getSession(), 'Visibility session check')
        .then(({ data, error }) => {
          if (!active || error) return;
          const nextSession = data.session ?? null;
          setSession(nextSession);
          setUser(nextSession?.user ?? null);
          if (nextSession?.user) void fetchProfile(nextSession.user.id);
        })
        .catch((error) => console.error('Visibility session check failed:', error));
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      active = false;
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchProfile]);

  useEffect(() => {
    if (authLoading) return;
    void fetchProfile(user?.id);
  }, [authLoading, user?.id, fetchProfile]);

  const value = {
    signUp: (data) => supabase.auth.signUp(data),
    signIn: (data) => supabase.auth.signInWithPassword(data),
    signInWithGoogle: () => supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    }),
    signOut: () => supabase.auth.signOut(),
    user,
    session,
    profile,
    authLoading,
    profileLoading,
    profileError,
    refetchProfile: () => fetchProfile(user?.id),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
