// src/pages/OrganizerProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';

function OrganizerProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ full_name: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [password, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  useEffect(() => {
    async function getProfile() {
      if (user) {
        try {
          setLoading(true);
          const { data, error } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
          if (error) throw error;
          if (data) setProfile(data);
        } catch (error) {
          console.error("Error fetching profile:", error.message);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
    getProfile();
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!user) return;
    setMessage('');
    try {
      const { error } = await supabase.from('profiles').update({ full_name: profile.full_name }).eq('id', user.id);
      if (error) throw error;
      setMessage('Profile details updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error.message);
      setMessage('Failed to update profile details.');
    }
  };
  
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    if (password !== confirmPassword) {
        setPasswordMessage("Passwords do not match.");
        return;
    }
    if (password.length < 6) {
        setPasswordMessage("Password must be at least 6 characters long.");
        return;
    }
    try {
        const { error } = await supabase.auth.updateUser({ password: password });
        if (error) throw error;
        setPasswordMessage('Password updated successfully!');
        setNewPassword('');
        setConfirmPassword('');
    } catch (error) {
        console.error('Error updating password:', error.message);
        setPasswordMessage(`Failed to update password: ${error.message}`);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!user) return <div className="text-center py-10 text-slate-400">Please log in to view your profile.</div>;
  
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* --- MODIFICATION: Added light/dark text color --- */}
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white text-center mb-10">Organizer Profile</h1>

      {/* --- MODIFICATION: Added light/dark classes for background, border, shadow --- */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Your Information</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-500 dark:text-slate-300">Email</label>
            {/* --- MODIFICATION: Added light/dark classes for disabled input --- */}
            <input type="email" value={user?.email || ''} disabled className="bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 sm:text-sm rounded-lg block w-full p-2.5 cursor-not-allowed" />
          </div>
          <div>
            <label htmlFor="full_name" className="block mb-2 text-sm font-medium text-slate-700 dark:text-white">Full Name</label>
            {/* --- MODIFICATION: Added light/dark classes for active input --- */}
            <input type="text" name="full_name" value={profile.full_name || ''} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} required className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
          </div>
          {message && <p className={`text-sm text-center ${message.includes('successfully') ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>{message}</p>}
          <div className="flex justify-end">
            <button type="submit" className="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Save Details</button>
          </div>
        </form>
      </div>

      {/* --- MODIFICATION: Added light/dark classes for background, border, shadow --- */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8 mt-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Change Password</h2>
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="block mb-2 text-sm font-medium text-slate-700 dark:text-white">New Password</label>
            {/* --- MODIFICATION: Added light/dark classes for active input --- */}
            <input type="password" name="newPassword" id="newPassword" value={password} onChange={(e) => setNewPassword(e.target.value)} required className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-slate-700 dark:text-white">Confirm New Password</label>
            {/* --- MODIFICATION: Added light/dark classes for active input --- */}
            <input type="password" name="confirmPassword" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
          </div>
          {passwordMessage && <p className={`text-sm text-center ${passwordMessage.includes('successfully') ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>{passwordMessage}</p>}
          <div className="flex justify-end">
            <button type="submit" className="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Update Password</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default OrganizerProfilePage;