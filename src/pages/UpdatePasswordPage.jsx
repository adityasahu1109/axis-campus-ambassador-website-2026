import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

import { AxisFrame } from '../components/motifs/AxisFrame';
import { TerminalLabel } from '../components/motifs/TerminalLabel';
import { Crosshair } from '../components/motifs/Crosshair';

const InputField = ({ label, id, type, value, onChange, placeholder, required }) => (
  <div className="relative group">
      <label htmlFor={id} className="block mb-2 text-xs font-mono tracking-widest text-sandstone uppercase transition-colors group-focus-within:text-cyan">{label}</label>
      <input 
          type={type} 
          name={id} 
          id={id} 
          value={value} 
          onChange={onChange} 
          className="bg-obsidian border border-border text-white text-sm focus:border-cyan block w-full p-3 transition-all outline-none font-mono focus:shadow-[0_0_15px_rgba(0,240,255,0.2)] rounded-panel" 
          placeholder={placeholder} 
          required={required} 
      />
  </div>
);

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
        setError("Keys do not match.");
        return;
    }
    if (password.length < 6) {
        setError("Key must be at least 6 characters.");
        return;
    }
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMessage('KEY_UPDATED successfully! Rerouting to login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center relative px-6 py-12">
        
        {/* Background Grid */}
        <div className="absolute inset-0 axis-grid-bg opacity-30 pointer-events-none"></div>

        {/* Logo */}
        <div className="mb-8 z-10 animate-fade-in-up">
            <Link to="/">
                <span className="font-logo text-4xl text-white tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] block hover:scale-105 transition-transform">AXIS</span>
            </Link>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md z-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <AxisFrame variant="cyan" className="!p-8 bg-obsidian-soft/80 backdrop-blur-md">
                
                <div className="text-center mb-8">
                    <TerminalLabel prefix=">" className="justify-center mb-4 text-cyan">SYS_RECOVERY // SET_NEW_KEY</TerminalLabel>
                    <h1 className="text-2xl font-display font-bold text-white uppercase tracking-wide">Update Key</h1>
                    <p className="mt-2 text-xs font-mono text-sandstone-dim">Enter your new ACCESS_KEY to secure your node.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 border border-danger/50 bg-danger/10 text-danger text-sm font-mono flex items-start">
                        <span className="mr-2">{'>'}</span>
                        <span>{error}</span>
                    </div>
                )}
                {message && (
                    <div className="mb-6 p-4 border border-success/50 bg-success/10 text-success text-sm font-mono flex items-start">
                        <span className="mr-2">{'>'}</span>
                        <span>{message}</span>
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleUpdatePassword}>
                    <InputField 
                        label="NEW_ACCESS_KEY" 
                        id="password" 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="••••••••" 
                        required={true} 
                    />
                    
                    <InputField 
                        label="CONFIRM_NEW_KEY" 
                        id="confirmPassword" 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        placeholder="••••••••" 
                        required={true} 
                    />

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full font-mono font-bold tracking-widest uppercase px-6 py-4 bg-transparent border border-cyan hover:bg-cyan/10 text-cyan transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? 'PROCESSING...' : 'UPDATE_KEY'}
                        {!loading && <Crosshair size={12} className="text-cyan opacity-50" />}
                    </button>
                </form>
            </AxisFrame>
        </div>
    </div>
  );
}

export default UpdatePasswordPage;