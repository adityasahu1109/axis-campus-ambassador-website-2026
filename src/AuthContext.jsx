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
    // Check for an active session when the component mounts
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Supabase getSession error:", error.message);
        }
        
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

    // Listen for changes in authentication state (e.g., user signs in/out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    // Clean up the subscription when the component unmounts
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // The value provided to consuming components
  const value = {
    signUp: (data) => supabase.auth.signUp(data),
    signIn: (data) => supabase.auth.signInWithPassword(data),
    // --- MODIFICATION: Added redirectTo option for Google Sign-In ---
    signInWithGoogle: () => supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    }),
    // --- END MODIFICATION ---
    signOut: () => supabase.auth.signOut(),
    user,
    session,
    profile,
    refetchProfile: async () => {
      if (user) await fetchProfile(user.id);
    }
  };

  // Render the children components only when not loading
  return (
    <AuthContext.Provider value={value}>
      {loading ? (
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