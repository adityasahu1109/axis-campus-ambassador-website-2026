import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      // Supabase sends a magic link that, when clicked, includes a token.
      // The user is redirected to the URL specified here.
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
      setMessage('Password reset link has been sent to your email.');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0">
      <div className="w-full bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 md:mt-0 sm:max-w-md xl:p-0">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white md:text-2xl">
            Forgot Your Password?
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Enter your email address below, and we'll send you a link to reset your password.
          </p>
          <form className="space-y-4 md:space-y-6" onSubmit={handlePasswordReset}>
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">Your email</label>
              <input 
                type="email" 
                name="email" 
                id="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
                placeholder="name@company.com" 
                required 
              />
            </div>
            {error && <p className="text-sm font-medium text-red-500">{error}</p>}
            {message && <p className="text-sm font-medium text-green-500">{message}</p>}
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <p className="text-sm text-center font-light text-slate-500 dark:text-slate-400">
              Remembered your password?{' '}
              <Link to="/login" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;