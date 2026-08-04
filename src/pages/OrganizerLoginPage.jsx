import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import logoDark from '../assets/logo-dark.png';
import { AxisFrame } from '../components/motifs/AxisFrame';
import { TerminalLabel } from '../components/motifs/TerminalLabel';
import { Crosshair } from '../components/motifs/Crosshair';
import { TerminalLoader } from '../components/motifs/TerminalLoader';

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

function OrganizerLoginPage() {
  const { user, signIn, signOut } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
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
    finally { setIsLoading(false); }
  };
  
  if (user) {
    return <div className="min-h-screen bg-void flex items-center justify-center"><TerminalLoader text="ROUTING_TO_TERMINAL..." /></div>;
  }

  return (
    <div className="min-h-screen bg-void flex flex-col md:flex-row relative">
      
      {/* Back Button */}
      <Link to="/" className="absolute top-6 left-6 z-20 flex items-center text-cyan hover:text-cyan-soft font-mono text-sm tracking-widest uppercase transition-colors group">
        <span className="mr-2 opacity-50">{'<'}</span> Back to Grid
      </Link>

      {/* Left Panel - Brand (Hidden on Mobile) */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-obsidian-soft relative overflow-hidden flex-col justify-center items-start px-12 lg:px-24 border-r border-border">
        {/* Background Grid */}
        <div className="absolute inset-0 axis-grid-bg opacity-30 pointer-events-none"></div>
        {/* Aethel Glow */}
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-gradient-to-bl from-cyan-deep/20 to-transparent pointer-events-none"></div>

        <div className="relative z-10">
            <img src={logoDark} alt="AXIS Logo" className="h-16 lg:h-24 mb-12" />
            <TerminalLabel prefix=">" className="mb-4">AETHEL_PROTOCOLS // COMMAND_LEVEL_ACCESS</TerminalLabel>
            <h1 className="text-4xl lg:text-6xl font-display font-black text-white leading-none mb-6 uppercase">
                Aethel <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sandstone to-cyan">Administration</span>
            </h1>
            <p className="text-sm font-mono text-sandstone-dim max-w-md border-l-2 border-cyan pl-4">
                Execute grid management tasks, verify node submissions, and oversee the AXIS'27 Ambassador network.
            </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col justify-center items-center px-6 py-20 relative bg-obsidian">
        <div className="w-full max-w-md">
            
            {/* Header */}
            <div className="text-center mb-10">
                <img src={logoDark} alt="AXIS Logo" className="h-12 mx-auto mb-8 block md:hidden" />
                <h2 className="text-3xl font-display font-bold text-white mb-2 uppercase tracking-wide">
                    Admin Auth
                </h2>
                <p className="text-sandstone-dim font-mono text-xs tracking-widest uppercase">
                    Provide credentials for terminal access
                </p>
            </div>

            {/* Form Card */}
            <AxisFrame variant="cyan" className="!p-8">
                
                {/* Status Toasts */}
                {error && (
                    <div className="mb-6 p-4 border border-danger/50 bg-danger/10 text-danger text-sm font-mono flex items-start">
                        <span className="mr-2">{'>'}</span>
                        <span>{error}</span>
                    </div>
                )}

                <form className="space-y-5" onSubmit={handleSignIn}>
                    
                    <InputField label="ADMIN_ID (Email)" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="organizer@axisvnit.in" required={true} />
                    
                    <div>
                        <InputField label="COMMAND_KEY (Password)" id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required={true} />
                        <div className="flex items-center justify-end mt-2">
                            <Link to="/forgot-password" className="text-xs font-mono text-cyan hover:text-cyan-soft transition-colors">Key Recovery?</Link>
                        </div> 
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full mt-4 font-mono font-bold tracking-widest uppercase px-6 py-4 bg-transparent border border-cyan hover:bg-cyan/10 text-cyan transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'PROCESSING...' : 'AUTHORIZE'}
                        {!isLoading && <Crosshair size={12} className="text-cyan opacity-50" />}
                    </button>
                </form>
            </AxisFrame>

            {/* Student Login Link */}
            <div className="mt-8 text-center">
                <Link to="/login" className="inline-flex items-center text-xs font-mono text-sandstone-dim hover:text-amber transition-colors uppercase group">
                    <span className="mr-2 text-amber opacity-50 group-hover:opacity-100 transition-opacity">{'<-'}</span>
                    Standard Node Access 
                </Link>
            </div>

        </div>
      </div>
    </div>
  );
}

export default OrganizerLoginPage;