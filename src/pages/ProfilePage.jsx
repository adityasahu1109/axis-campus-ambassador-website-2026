import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';
import { AxisFrame } from '../components/motifs/AxisFrame';
import { TerminalLabel } from '../components/motifs/TerminalLabel';
import { TerminalLoader } from '../components/motifs/TerminalLoader';
import { Crosshair } from '../components/motifs/Crosshair';
import { clsx } from 'clsx';

const InputField = ({ label, id, type = "text", value, onChange, placeholder, required, disabled = false, options = null }) => (
    <div className="relative group mb-6">
        <label htmlFor={id} className="block mb-2 text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase text-sandstone group-focus-within:text-amber transition-colors">{label}</label>
        {options ? (
            <select 
                id={id}
                name={id}
                value={value}
                onChange={onChange}
                required={required}
                disabled={disabled}
                className="w-full bg-void border border-border p-3.5 focus:border-amber outline-none transition-all text-sm font-mono text-white appearance-none disabled:opacity-50 disabled:cursor-not-allowed focus:shadow-[0_0_15px_rgba(255,158,0,0.2)]"
            >
                <option value="" disabled>Select {label}</option>
                {options.map(opt => <option key={opt.value || opt} value={opt.value || opt}>{opt.label || opt}</option>)}
            </select>
        ) : type === "textarea" ? (
            <textarea 
                id={id}
                name={id}
                value={value}
                onChange={onChange}
                required={required}
                disabled={disabled}
                rows="3"
                placeholder={placeholder}
                className="w-full bg-void border border-border p-3.5 focus:border-amber outline-none transition-all text-sm font-mono text-white placeholder-sandstone-dim resize-none disabled:opacity-50 disabled:cursor-not-allowed focus:shadow-[0_0_15px_rgba(255,158,0,0.2)]"
            />
        ) : (
            <input 
                type={type} 
                name={id} 
                id={id} 
                value={value} 
                onChange={onChange} 
                placeholder={placeholder}
                required={required} 
                disabled={disabled}
                className="w-full bg-void border border-border p-3.5 focus:border-amber outline-none transition-all text-sm font-mono text-white placeholder-sandstone-dim disabled:opacity-50 disabled:cursor-not-allowed focus:shadow-[0_0_15px_rgba(255,158,0,0.2)]" 
            />
        )}
    </div>
);

function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    full_name: '', bio: '', college_name: '', year: '', branch: '', primary_phone: '', additional_phone: '', referral_code: ''
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
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name, bio, college_name, year, branch, primary_phone, additional_phone, referral_code')
            .eq('id', user.id).single();
          if (error) throw error;
          if (data) setProfile(data);
        } catch (error) { console.error("Error fetching profile:", error.message); }
        finally { setLoading(false); }
      } else setLoading(false);
    }
    getProfile();
  }, [user]);

  const handleProfileChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!user) return;
    setMessage('');
    try {
      const { error } = await supabase.from('profiles').update(profile).eq('id', user.id);
      if (error) throw error;
      setMessage('PROFILE_UPDATED successfully!');
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
        setPasswordMessage('ACCESS_KEY updated successfully!');
        setNewPassword(''); setConfirmPassword('');
        setTimeout(() => setPasswordMessage(''), 3000);
    } catch (error) {
        setPasswordMessage(`ERROR: ${error.message}`);
    }
  };

  if (loading) return <div className="min-h-screen bg-void flex justify-center items-center"><TerminalLoader text="FETCHING_NODE_DATA..." /></div>;
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
      <div className="absolute inset-0 axis-grid-bg opacity-20 pointer-events-none fixed"></div>

      {/* Header */}
      <div className="relative border-b border-border bg-obsidian-soft/80 backdrop-blur-md pb-12 pt-12 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-x-6 relative z-10 animate-fade-in">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-obsidian border border-amber flex items-center justify-center text-3xl font-display font-bold text-amber shadow-[0_0_15px_rgba(255,158,0,0.2)]">
                {(profile.full_name || user.email).charAt(0).toUpperCase()}
            </div>
            <div>
                <TerminalLabel prefix=">">NODE_ID // {profile.full_name?.toUpperCase() || 'AMBASSADOR'}</TerminalLabel>
                <h1 className="text-3xl sm:text-4xl font-display font-bold text-white uppercase tracking-wide mt-2">
                    System Profile
                </h1>
            </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-20 space-y-8 animate-slide-in-up">
        
        {/* Profile Card */}
        <AxisFrame variant="cyan" hover={true} className="!p-8 sm:!p-10">
            <div className="flex items-center mb-8 border-b border-border pb-6">
                <div>
                    <h2 className="text-2xl font-display font-bold text-white uppercase tracking-wide">Node Identity</h2>
                    <p className="text-sandstone-dim font-mono text-xs tracking-widest mt-1 uppercase">Public ambassador parameters.</p>
                </div>
            </div>

            <Toast msg={message} />

            <form onSubmit={handleUpdateProfile}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                    <InputField label="NODE_ALIAS (Full Name)" id="full_name" value={profile.full_name || ''} onChange={handleProfileChange} required />
                    <InputField label="COMM_ADDRESS (Email)" id="email" type="email" value={user?.email || ''} disabled />
                </div>
                
                <InputField label="YOUR_REFERRAL_CODE" id="referral_code" type="text" value={profile.referral_code || 'UNASSIGNED'} disabled />
                <InputField label="BIOGRAPHY_LOG" id="bio" type="textarea" value={profile.bio || ''} onChange={handleProfileChange} placeholder="Input background data..." />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                    <InputField label="INSTITUTION_NAME" id="college_name" value={profile.college_name || ''} onChange={handleProfileChange} required placeholder="e.g. VNIT Nagpur" />
                    <InputField label="SECTOR (Branch)" id="branch" value={profile.branch || ''} onChange={handleProfileChange} required placeholder="e.g. Computer Science" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                    <InputField label="YEAR_OF_DEPLOYMENT" id="year" value={profile.year || ''} onChange={handleProfileChange} required options={['1st Year', '2nd Year', '3rd Year', '4th Year', '5th+ Year']} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                    <InputField label="PRIMARY_COMMS (Phone)" id="primary_phone" type="tel" value={profile.primary_phone || ''} onChange={handleProfileChange} required placeholder="+91 0000000000" />
                    <InputField label="SECONDARY_COMMS" id="additional_phone" type="tel" value={profile.additional_phone || ''} onChange={handleProfileChange} placeholder="+91 0000000000" />
                </div>

                <div className="flex justify-end mt-8">
                    <button type="submit" className="px-8 py-4 text-xs font-mono font-bold tracking-widest uppercase bg-cyan hover:bg-cyan-soft text-void transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                        OVERWRITE_PARAMETERS
                        <Crosshair size={12} className="opacity-50 text-void" />
                    </button>
                </div>
            </form>
        </AxisFrame>

        {/* Password Card */}
        <AxisFrame variant="amber" hover={true} className="!p-8 sm:!p-10">
            <div className="flex items-center mb-8 border-b border-border pb-6">
                <div>
                    <h2 className="text-2xl font-display font-bold text-white uppercase tracking-wide">Security Protocols</h2>
                    <p className="text-sandstone-dim font-mono text-xs tracking-widest mt-1 uppercase">Modify access key.</p>
                </div>
            </div>

            <Toast msg={passwordMessage} />

            <form onSubmit={handlePasswordUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                    <InputField label="NEW_ACCESS_KEY" id="newPassword" type="password" value={password} onChange={(e) => setNewPassword(e.target.value)} required placeholder="••••••••" />
                    <InputField label="CONFIRM_KEY" id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="••••••••" />
                </div>

                <div className="flex justify-end mt-4">
                    <button type="submit" className="px-8 py-4 text-xs font-mono font-bold tracking-widest uppercase bg-transparent border border-amber text-amber hover:bg-amber/10 transition-colors flex items-center gap-2">
                        UPDATE_SECURITY
                        <Crosshair size={12} className="opacity-50 text-amber" />
                    </button>
                </div>
            </form>
        </AxisFrame>

      </div>
    </div>
  );
}

export default ProfilePage;