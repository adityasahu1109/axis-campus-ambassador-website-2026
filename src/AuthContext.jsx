// src/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from './supabaseClient';

// Create the authentication context
const AuthContext = createContext();

// Create a provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeoutReached, setTimeoutReached] = useState(false);

  const fetchProfile = async (userId) => {
    if (!userId) {
      setProfile(null);
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    } else {
      setProfile(data);
    }
  };

  useEffect(() => {
    // Hard timeout for infinite loader
    let timer;
    if (loading) {
      timer = setTimeout(() => {
        setTimeoutReached(true);
      }, 8000);
    } else {
      setTimeoutReached(false);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) console.error("Supabase getSession error:", error.message);
        
        const session = data?.session || null;
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error("Unexpected error during session initialization:", err);
        setSession(null);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Ensure TOKEN_REFRESHED, USER_UPDATED, SIGNED_IN trigger a re-fetch
        if (session?.user && ['SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED', 'INITIAL_SESSION'].includes(event)) {
          await fetchProfile(session.user.id);
        } else if (!session?.user) {
          setProfile(null);
        }
      }
    );

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          await fetchProfile(data.session.user.id);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      subscription?.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const value = {
    signUp: (data) => supabase.auth.signUp(data),
    signIn: (data) => supabase.auth.signInWithPassword(data),
    signInWithGoogle: () => supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    }),
    signOut: () => supabase.auth.signOut(),
    user,
    session,
    profile,
    refetchProfile: async () => {
      if (user) await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        timeoutReached ? (
          <div className="flex justify-center items-center h-screen bg-void">
            <div className="flex flex-col items-center justify-center font-mono space-y-4">
              <div className="text-cyan text-sm tracking-widest text-center">
                <span className="text-amber animate-pulse">!</span> TAKING LONGER THAN EXPECTED
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2 border border-cyan text-cyan text-xs font-bold tracking-widest hover:bg-cyan/10 transition-colors"
              >
                RETRY CONNECTION
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-screen bg-void">
            <div className="flex flex-col items-center justify-center font-mono space-y-4">
              <div className="relative w-48 h-1 bg-obsidian-soft overflow-hidden rounded-full">
                <div className="absolute inset-0 bg-cyan w-1/3 rounded-full animate-scanline" style={{ animationDirection: 'alternate' }}></div>
              </div>
              <div className="text-cyan text-sm tracking-widest flex items-center gap-2">
                <span className="animate-pulse">{'>'}</span> SYSTEM_INITIALIZING...
              </div>
            </div>
          </div>
        )
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

// Create a custom hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}