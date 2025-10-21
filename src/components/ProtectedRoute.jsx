import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      async function getProfile() {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (error) throw error;
          setProfile(data);
        } catch (error) {
          console.error("Error fetching profile for protected route:", error.message);
        } finally {
          setLoading(false);
        }
      }
      getProfile();
    } else {
      // If there's no user, we can stop loading immediately
      setLoading(false);
    }
  }, [user]);

  // If we are still checking for a user and their profile, show a loading state
  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="text-lg text-slate-400">Loading...</div>
        </div>
    );
  }

  // If loading is finished and there's no user, or the user is not an organizer, redirect
  if (!user || profile?.role !== 'organizer') {
    return <Navigate to="/" replace />;
  }

  // If loading is finished and the user is an organizer, show the protected content
  return children;
}

export default ProtectedRoute;