// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';

function ProfilePage() {
  const { user } = useAuth();
  
  // --- MODIFICATION: Expanded state to include all new fields ---
  const [profile, setProfile] = useState({
    full_name: '',
    bio: '',
    college_name: '',
    year: '',
    branch: '',
    primary_phone: '',
    additional_phone: ''
  });
  
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
          // --- MODIFICATION: Select all new profile fields ---
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name, bio, college_name, year, branch, primary_phone, additional_phone')
            .eq('id', user.id)
            .single();
            
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

  // --- MODIFICATION: Generic change handler for all profile fields ---
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prevProfile => ({
      ...prevProfile,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!user) return;
    setMessage('');
    try {
      // --- MODIFICATION: Update all new profile fields ---
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          bio: profile.bio,
          college_name: profile.college_name,
          year: profile.year,
          branch: profile.branch,
          primary_phone: profile.primary_phone,
          additional_phone: profile.additional_phone
        })
        .eq('id', user.id);
        
      if (error) throw error;
      setMessage('Profile details updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error.message);
      setMessage(`Failed to update profile details: ${error.message}`);
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

  if (loading) return <div className="text-center py-10 text-slate-500 dark:text-slate-400">Loading...</div>;
  if (!user) return <div className="text-center py-10 text-slate-500 dark:text-slate-400">Please log in to view your profile.</div>;
  
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white text-center mb-10">My Profile</h1>

      {/* Form for Profile Details */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Your Information</h2>
        {/* --- MODIFICATION: Updated form with new fields --- */}
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label htmlFor="full_name" className="block mb-2 text-sm font-medium text-slate-700 dark:text-white">Full Name *</label>
            <input 
              type="text" 
              name="full_name" 
              id="full_name"
              value={profile.full_name || ''} 
              onChange={handleProfileChange} 
              required 
              className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
            />
          </div>

          <div>
            <label htmlFor="bio" className="block mb-2 text-sm font-medium text-slate-700 dark:text-white">Bio</label>
            <textarea 
              id="bio" 
              name="bio" 
              rows="4"
              value={profile.bio || ''} 
              onChange={handleProfileChange}
              className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
              placeholder="Tell us a little about yourself"
            />
          </div>

          <div>
            <label htmlFor="college_name" className="block mb-2 text-sm font-medium text-slate-700 dark:text-white">College Name *</label>
            <input 
              type="text" 
              name="college_name" 
              id="college_name" 
              value={profile.college_name || ''} 
              onChange={handleProfileChange} 
              required 
              className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
              placeholder="e.g., Visvesvaraya National Institute of Technology"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="year" className="block mb-2 text-sm font-medium text-slate-700 dark:text-white">Year of Study *</label>
              <select 
                name="year" 
                id="year" 
                value={profile.year || ''} 
                onChange={handleProfileChange} 
                required
                className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              >
                <option value="" disabled>Select your year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="5th+ Year">5th+ Year</option>
              </select>
            </div>
            <div>
              <label htmlFor="branch" className="block mb-2 text-sm font-medium text-slate-700 dark:text-white">Branch *</label>
              <input 
                type="text" 
                name="branch" 
                id="branch" 
                value={profile.branch || ''} 
                onChange={handleProfileChange} 
                required 
                className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
                placeholder="e.g., Computer Science"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="primary_phone" className="block mb-2 text-sm font-medium text-slate-700 dark:text-white">Primary Phone *</label>
              <input 
                type="tel" 
                name="primary_phone" 
                id="primary_phone" 
                value={profile.primary_phone || ''} 
                onChange={handleProfileChange} 
                required 
                className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
                placeholder="e.g., +91 12345 67890"
              />
            </div>
            <div>
              <label htmlFor="additional_phone" className="block mb-2 text-sm font-medium text-slate-700 dark:text-white">Additional Phone (Optional)</label>
              <input 
                type="tel" 
                name="additional_phone" 
                id="additional_phone" 
                value={profile.additional_phone || ''} 
                onChange={handleProfileChange} 
                className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
                placeholder="e.g., +91 98765 43210"
              />
            </div>
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-500 dark:text-slate-300">Email</label>
            <input 
              type="email" 
              value={user?.email || ''} 
              disabled 
              className="bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 sm:text-sm rounded-lg block w-full p-2.5 cursor-not-allowed" 
            />
          </div>
          
          {message && <p className={`text-sm text-center ${message.includes('successfully') ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>{message}</p>}
          <div className="flex justify-end">
            <button type="submit" className="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Save Details</button>
          </div>
        </form>
      </div>

      {/* Form for Password Change (Unchanged) */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8 mt-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Change Password</h2>
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="block mb-2 text-sm font-medium text-slate-700 dark:text-white">New Password</label>
            <input 
              type="password" 
              name="newPassword" 
              id="newPassword" 
              value={password} 
              onChange={(e) => setNewPassword(e.target.value)} 
              required 
              className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-slate-700 dark:text-white">Confirm New Password</label>
            <input 
              type="password" 
              name="confirmPassword" 
              id="confirmPassword" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
              className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
            />
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

export default ProfilePage;