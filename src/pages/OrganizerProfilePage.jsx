import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';
import { AxisFrame } from '../components/motifs/AxisFrame';
import { TerminalLabel } from '../components/motifs/TerminalLabel';
import { TerminalLoader } from '../components/motifs/TerminalLoader';
import { Crosshair } from '../components/motifs/Crosshair';
import { clsx } from 'clsx';

const InputField = ({ label, id, type = "text", value, onChange, placeholder, required, disabled = false }) => (
    <div className="relative group mb-6">
        <label htmlFor={id} className="block mb-2 text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase text-sandstone group-focus-within:text-cyan transition-colors">{label}</label>
        <input 
            type={type} 
            name={id} 
            id={id} 
            value={value} 
            onChange={onChange} 
            placeholder={placeholder}
            required={required} 
            disabled={disabled}
            className="w-full bg-void border border-border p-3.5 focus:border-cyan outline-none transition-all text-sm font-mono text-white placeholder-sandstone-dim disabled:opacity-50 disabled:cursor-not-allowed focus:shadow-[0_0_15px_rgba(0,240,255,0.2)]" 
        />
    </div>
);

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
        } catch (error) { console.error("Error fetching profile:", error.message); }
        finally { setLoading(false); }
      } else setLoading(false);
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
      setMessage('ADMIN_PROFILE_UPDATED successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`ERROR: ${error.message}`);
    }
  };
  
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    if (password !== confirmPassword) return setPasswordMessage("ERROR: Keys do not match.");
    if (password.length < 6) return setPasswordMessage("ERROR: Key must be at least 6 characters.");
    try {
        const { error } = await supabase.auth.updateUser({ password: password });
        if (error) throw error;
        setPasswordMessage('ADMIN_KEY updated successfully!');
        setNewPassword(''); setConfirmPassword('');
        setTimeout(() => setPasswordMessage(''), 3000);
    } catch (error) {
        setPasswordMessage(`ERROR: ${error.message}`);
    }
  };

  if (loading) return <div className="min-h-screen bg-void flex justify-center items-center"><TerminalLoader text="VERIFYING_COMMAND_ACCESS..." /></div>;
  if (!user) return <div className="text-center py-20 text-sandstone-dim font-mono uppercase tracking-widest bg-void min-h-screen">NO_ACTIVE_SESSION</div>;
  
  const Toast = ({ msg }) => {
      if (!msg) return null;
      const isError = msg.startsWith('ERROR:');
      return (
        <div className={clsx("p-4 flex items-start text-sm font-mono font-bold mb-6 animate-fade-in-up border", isError ? "bg-danger/10 border-danger/50 text-danger" : "bg-cyan/10 border-cyan/50 text-cyan")}>
            <span className="mr-3">{'>'}</span>
            <span className="uppercase">{msg}</span>
        </div>
      );
  };

  return (
    <div className="bg-void min-h-screen pb-20 pt-20 relative">
      
      {/* Background Grid */}
      <div className="absolute inset-0 axis-grid-bg opacity-30 pointer-events-none fixed"></div>

      {/* Header */}
      <div className="relative border-b border-border bg-obsidian-soft/80 backdrop-blur-md pb-12 pt-12 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-x-6 relative z-10 animate-fade-in">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-obsidian border border-danger flex items-center justify-center text-3xl font-display font-bold text-danger shadow-[0_0_15px_rgba(255,0,0,0.2)]">
                {profile.full_name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div>
                <TerminalLabel prefix=">">COMMAND_NODE // ROOT_ACCESS</TerminalLabel>
                <h1 className="text-3xl sm:text-4xl font-display font-bold text-white uppercase tracking-wide mt-2">
                    Aethel Settings
                </h1>
            </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-20 space-y-8 animate-slide-in-up">
        
        {/* Profile Card */}
        <AxisFrame variant="cyan" className="!p-8 sm:!p-10">
            <div className="flex items-center mb-8 border-b border-border pb-6">
                <div>
                    <h2 className="text-2xl font-display font-bold text-white uppercase tracking-wide">Command Identity</h2>
                    <p className="text-sandstone-dim font-mono text-xs tracking-widest mt-1 uppercase">Modify admin parameters.</p>
                </div>
            </div>

            <Toast msg={message} />

            <form onSubmit={handleUpdateProfile}>
                <InputField label="COMMAND_ADDRESS (Email)" id="email" type="email" value={user?.email || ''} disabled />
                <InputField label="ADMIN_ALIAS (Full Name)" id="full_name" value={profile.full_name || ''} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} required />

                <div className="flex justify-end mt-8">
                    <button type="submit" className="px-8 py-4 text-xs font-mono font-bold tracking-widest uppercase bg-cyan hover:bg-cyan-soft text-void transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                        OVERWRITE_PARAMETERS
                        <Crosshair size={12} className="opacity-50 text-void" />
                    </button>
                </div>
            </form>
        </AxisFrame>

        {/* Password Card */}
        <AxisFrame variant="danger" className="!p-8 sm:!p-10">
            <div className="flex items-center mb-8 border-b border-border pb-6">
                <div>
                    <h2 className="text-2xl font-display font-bold text-white uppercase tracking-wide">Root Security Protocols</h2>
                    <p className="text-sandstone-dim font-mono text-xs tracking-widest mt-1 uppercase">Modify root access key.</p>
                </div>
            </div>

            <Toast msg={passwordMessage} />

            <form onSubmit={handlePasswordUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                    <InputField label="NEW_ROOT_KEY" id="newPassword" type="password" value={password} onChange={(e) => setNewPassword(e.target.value)} required placeholder="••••••••" />
                    <InputField label="CONFIRM_KEY" id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="••••••••" />
                </div>

                <div className="flex justify-end mt-4">
                    <button type="submit" className="px-8 py-4 text-xs font-mono font-bold tracking-widest uppercase bg-transparent border border-danger text-danger hover:bg-danger/10 transition-colors flex items-center gap-2">
                        UPDATE_SECURITY
                        <Crosshair size={12} className="opacity-50 text-danger" />
                    </button>
                </div>
            </form>
        </AxisFrame>

      </div>
    </div>
  );
}

export default OrganizerProfilePage;