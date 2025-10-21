// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const GoogleIcon = () => ( <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.048,36.336,44,30.651,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg> );

function LoginPage() {
  const { user, signIn, signUp, signInWithGoogle, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isRegister, setIsRegister] = useState(location.state?.isRegister || false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleAuthAction = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (isRegister) {
      try {
        const { error } = await signUp({ email, password, options: { data: { full_name: fullName, role: 'student' } } });
        if (error) throw error;
        setMessage('Registration successful! Please sign in.');
        setIsRegister(false);
      } catch (error) { setError(error.message); }
    } else {
      try {
        const { data: authData, error: authError } = await signIn({ email, password });
        if (authError) throw authError;
        if (authData.user) {
          const { data: profileData, error: profileError } = await supabase.from('profiles').select('role').eq('id', authData.user.id).single();
          if (profileError) throw profileError;
          if (profileData.role === 'student') {
            navigate('/dashboard');
          } else {
            await signOut();
            throw new Error('Access Denied: This is not a student account.');
          }
        }
      } catch (error) { setError(error.message); }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (error) {
      console.error('Error with Google Sign-In:', error.message);
      setError('Could not sign in with Google. Please try again.');
    }
  };
  
  if (user) {
    return <div className="text-center py-10 text-slate-500 dark:text-slate-400">Redirecting...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0">
      <div className="w-full bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 md:mt-0 sm:max-w-md xl:p-0">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white md:text-2xl">
            {isRegister ? 'Create a Student Account' : 'Sign in to your account'}
          </h1>
          <button onClick={handleGoogleSignIn} className="w-full flex items-center justify-center gap-x-3 py-2.5 px-4 text-sm font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200">
            <GoogleIcon /> Sign in with Google
          </button>
          <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
              <span className="flex-shrink mx-4 text-slate-500 dark:text-slate-400 text-xs">OR</span>
              <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
          </div>
          <form className="space-y-4 md:space-y-6" onSubmit={handleAuthAction}>
            {isRegister && (
              <div>
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">Full Name</label>
                <input type="text" name="name" id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="Your full name" required />
              </div>
            )}
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">Your email</label>
              {/* --- MODIFICATION: Fixed typo from e.g.value to e.target.value --- */}
              <input type="email" name="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="name@company.com" required />
            </div>
            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">Password</label>
              <input type="password" name="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required />
            </div>
            {!isRegister && ( <div className="flex items-center justify-end"><Link to="/forgot-password" className="text-sm font-medium text-blue-600 dark:text-blue-500 hover:underline">Forgot password?</Link></div> )}
            {error && <p className="text-sm font-medium text-red-500 text-center">{error}</p>}
            {message && <p className="text-sm font-medium text-green-500 text-center">{message}</p>}
            <button type="submit" className="w-full text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
              {isRegister ? 'Create an account' : 'Sign in'}
            </button>
            <p className="text-sm font-light text-slate-500 dark:text-slate-400">
              {isRegister ? 'Already have an account? ' : 'Don’t have an account yet? '}
              <button type="button" onClick={() => setIsRegister(!isRegister)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">{isRegister ? 'Login here' : 'Sign up'}</button>
            </p>
          </form>
          <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-700">
            <Link to="/login/organizer" className="text-xs text-slate-500 dark:text-slate-400 hover:text-blue-500 hover:underline transition-colors">
              Are you an organizer? Login here.
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
export default LoginPage;