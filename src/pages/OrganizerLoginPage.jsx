import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function OrganizerLoginPage() {
  const { user, signIn, signOut } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      // Redirect any logged-in user trying to access this page
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data: authData, error: authError } = await signIn({ email, password });
      if (authError) throw authError;
      if (authData.user) {
        const { data: profileData, error: profileError } = await supabase.from('profiles').select('role').eq('id', authData.user.id).single();
        if (profileError) throw profileError;
        if (profileData.role === 'organizer') {
          navigate('/admin');
        } else {
          await signOut();
          throw new Error('Access Denied: This is not an organizer account.');
        }
      }
    } catch (error) { setError(error.message); }
  };
  
  if (user) {
    return <div className="text-center py-10 text-slate-500 dark:text-slate-400">Redirecting...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0">
      <div className="w-full bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 md:mt-0 sm:max-w-md xl:p-0">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white md:text-2xl">Organizer Sign In</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Access the admin dashboard.
          </p>
          <form className="space-y-4 md:space-y-6" onSubmit={handleSignIn}>
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">Your email</label>
              <input type="email" name="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required />
            </div>
            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">Password</label>
              <input type="password" name="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required />
            </div>
            <div className="flex items-center justify-end">
                <Link to="/forgot-password" className="text-sm font-medium text-blue-600 dark:text-blue-500 hover:underline">Forgot password?</Link>
            </div>
            {error && <p className="text-sm font-medium text-red-500">{error}</p>}
            <button type="submit" className="w-full text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Sign in</button>
          </form>
          <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-700">
            <Link to="/login" className="text-xs text-slate-500 dark:text-slate-400 hover:text-blue-500 hover:underline transition-colors">
              Are you a student? Login here.
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrganizerLoginPage;