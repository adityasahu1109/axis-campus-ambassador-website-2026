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
                className={clsx(
                  "w-full border border-border p-3.5 outline-none transition-all text-sm font-mono text-white placeholder-sandstone-dim disabled:opacity-50 disabled:cursor-not-allowed",
                  disabled ? "bg-obsidian" : "bg-void focus:border-amber focus:shadow-[0_0_15px_rgba(255,158,0,0.2)]"
                )} 
            />
        )}
    </div>
);

function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    full_name: '', college: '', branch: '', degree_type: '', year_of_study: '', city: '', phone_number: '', referral_code: '', referred_by: null
  });
  const [referrerCode, setReferrerCode] = useState(null);
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
            .select('*')
            .eq('id', user.id).single();
          if (error) throw error;
          if (data) {
            setProfile(data);
            if (data.referred_by) {
              const { data: refData } = await supabase
                .from('profiles')
                .select('referral_code')
                .eq('id', data.referred_by).single();
              if (refData) setReferrerCode(refData.referral_code);
            }
          }
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
      const updates = {
        full_name: profile.full_name,
        college: profile.college,
        branch: profile.branch,
        degree_type: profile.degree_type,
        year_of_study: parseInt(profile.year_of_study, 10),
        city: profile.city,
        phone_number: profile.phone_number,
      };

      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
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
  if (!user || !profile) return <div className="text-center py-20 text-sandstone-dim font-mono uppercase tracking-widest bg-void min-h-screen">Not logged in</div>;
  
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
                {(profile.full_name || user.email || 'A').charAt(0).toUpperCase()}
            </div>
            <div>
                <TerminalLabel prefix=">">{profile.full_name?.toUpperCase() || 'AMBASSADOR'}</TerminalLabel>
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
                    <h2 className="text-xl font-display font-bold text-white uppercase tracking-widest">Your Details</h2>
                    <p className="text-sandstone-dim font-mono text-xs tracking-widest mt-1 uppercase">Public ambassador parameters.</p>
                </div>
            </div>

            <Toast msg={message} />

            <form onSubmit={handleUpdateProfile}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                    <InputField label="Full Name" id="full_name" value={profile.full_name || ''} onChange={handleProfileChange} required />
                    <InputField label="Email" id="email" type="email" value={user?.email || ''} disabled />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 border-b border-border/50 pb-2 mb-8">
                    <InputField 
                        label="Your Referral Code" 
                        id="referral_code" 
                        type="text" 
                        value={profile.referral_code || 'UNASSIGNED'} 
                        disabled 
                    />
                    <InputField 
                        label="Referral Used" 
                        id="referred_by" 
                        type="text" 
                        value={profile.referred_by ? (referrerCode || 'Loading...') : 'No referral code used'} 
                        disabled 
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                    <InputField label="Phone Number" id="phone_number" type="tel" value={profile.phone_number || ''} onChange={handleProfileChange} required placeholder="10 digit mobile number" />
                    <InputField label="City" id="city" value={profile.city || ''} onChange={handleProfileChange} placeholder="City Name" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                    <InputField label="Institution Name" id="college" value={profile.college || ''} onChange={handleProfileChange} required placeholder="e.g. VNIT Nagpur" />
                    <InputField label="Degree Type" id="degree_type" value={profile.degree_type || ''} onChange={handleProfileChange} required placeholder="e.g. B.Tech" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                    <InputField label="Branch / Major" id="branch" value={profile.branch || ''} onChange={handleProfileChange} required placeholder="e.g. Computer Science" />
                    <InputField 
                        label="Year of Study" 
                        id="year_of_study" 
                        value={profile.year_of_study?.toString() || ''} 
                        onChange={handleProfileChange} 
                        required 
                        options={[
                          { value: '1', label: '1st Year' },
                          { value: '2', label: '2nd Year' },
                          { value: '3', label: '3rd Year' },
                          { value: '4', label: '4th Year' },
                          { value: '5', label: '5th Year' },
                          { value: '6', label: '6th+ Year' }
                        ]}
                    />
                </div>

                <div className="flex justify-end mt-8">
                    <button type="submit" className="w-full sm:w-auto px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest text-void bg-cyan hover:bg-cyan-soft transition-colors shadow-[0_0_15px_rgba(0,240,255,0.4)] disabled:opacity-50 flex items-center justify-center sm:justify-start gap-2">
                        Save Changes
                        <Crosshair size={12} className="opacity-50 text-void" />
                    </button>
                </div>
            </form>
        </AxisFrame>

        {/* Password Card */}
        <AxisFrame variant="amber" hover={true} className="!p-8 sm:!p-10">
            <div className="flex items-center mb-8 border-b border-border pb-6">
                <div>
                    <h2 className="text-xl font-display font-bold text-white uppercase tracking-widest">Password & Security</h2>
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
                    <button type="submit" className="w-full sm:w-auto px-8 py-4 text-xs font-mono font-bold tracking-widest uppercase bg-transparent border border-amber text-amber hover:bg-amber/10 transition-colors flex items-center justify-center sm:justify-start gap-2">
                        Update Password
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