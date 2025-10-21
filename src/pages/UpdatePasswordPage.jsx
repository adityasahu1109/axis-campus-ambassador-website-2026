import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

function UpdatePasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
    }
    if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
    }
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMessage('Password updated successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
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
            Set a New Password
          </h1>
          <form className="space-y-4 md:space-y-6" onSubmit={handleUpdatePassword}>
            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">New Password</label>
              <input 
                type="password" 
                name="password" 
                id="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
                className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
                required 
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">Confirm New Password</label>
              <input 
                type="password" 
                name="confirmPassword" 
                id="confirmPassword" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                placeholder="••••••••" 
                className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
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
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdatePasswordPage;