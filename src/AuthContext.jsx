// src/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from './supabaseClient';

// Create the authentication context
const AuthContext = createContext();

// Create a provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for an active session when the component mounts
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for changes in authentication state (e.g., user signs in/out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
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
  };

  // Render the children components only when not loading
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Create a custom hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}