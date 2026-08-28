import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import axisLogo from '../assets/logo.png';

import { AxisFrame } from '../components/motifs/AxisFrame';
import { TerminalLabel } from '../components/motifs/TerminalLabel';
import { Crosshair } from '../components/motifs/Crosshair';
import { TerminalLoader } from '../components/motifs/TerminalLoader';

const GoogleIcon = () => ( <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.048,36.336,44,30.651,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg> );

const InputField = ({ label, id, type, value, onChange, placeholder, required }) => (
  <div className="relative group">
      <label htmlFor={id} className="block mb-2 text-xs font-mono tracking-widest text-sandstone uppercase transition-colors group-focus-within:text-amber">{label}</label>
      <input 
          type={type} 
          name={id} 
          id={id} 
          value={value} 
          onChange={onChange} 
          className="bg-obsidian border border-border text-white text-sm focus:border-amber block w-full p-3 transition-all outline-none font-mono focus:shadow-[0_0_15px_rgba(255,158,0,0.2)] rounded-panel" 
          placeholder={placeholder} 
          required={required} 
      />
  </div>
);

function LoginPage() {
  const { user, profile, profileLoading, profileError, refetchProfile, signIn, signUp, signInWithGoogle, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isRegister, setIsRegister] = useState(location.state?.isRegister || false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && !profileLoading && profile?.role === 'student') {
      navigate('/dashboard', { replace: true });
    }
    if (user && !profileLoading && profile && profile.role !== 'student') {
      setError('Access Denied: This is not a student account.');
      void signOut();
    }
  }, [user, profile, profileLoading, navigate, signOut]);

  const handleAuthAction = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);
    
    if (isRegister) {
      try {
        const { error } = await signUp({ email, password, options: { data: { full_name: fullName, role: 'student' } } });
        if (error) throw error;

        if (referralCode.trim()) {
            const { error: rpcError } = await supabase.rpc('set_referral', { p_referral_code: referralCode.trim() });
            if (rpcError) {
                console.warn("Could not set referral code:", rpcError.message);
            }
        }

        setMessage('Registration successful! Please sign in.');
        setIsRegister(false);
      } catch (error) { setError(error.message); }
      finally { setIsLoading(false); }
    } else {
      try {
        const { error: authError } = await signIn({ email, password });
        if (authError) throw authError;
      } catch (error) { setError(error.message); }
      finally { setIsLoading(false); }
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
  
  if (user && (profileLoading || (!profile && !profileError))) {
    return <div className="min-h-screen bg-void flex items-center justify-center"><TerminalLoader text="REDIRECTING_TO_DASHBOARD..." /></div>;
  }

  if (user && profileError) {
    return <div className="min-h-screen bg-void flex items-center justify-center gap-3 font-mono"><button onClick={refetchProfile} className="border border-cyan px-4 py-2 text-cyan">RETRY</button><button onClick={signOut} className="border border-danger px-4 py-2 text-danger">END_SESSION</button></div>;
  }

  return (
    <div className="min-h-screen bg-void flex flex-col md:flex-row relative">
      
      {/* Back Button */}
      <Link to="/" className="absolute top-6 left-6 z-20 flex items-center text-cyan hover:text-cyan-soft font-mono text-sm tracking-widest uppercase transition-colors group">
        <span className="mr-2 opacity-50">{'<'}</span> Back to Grid
      </Link>

      {/* Left Panel - Brand (Hidden on Mobile) */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-void relative overflow-hidden flex-col justify-center items-start px-12 lg:px-24 border-r border-border">
        {/* Background Grid */}
        <div className="absolute inset-0 axis-grid-bg opacity-30 pointer-events-none"></div>
        {/* Nix Glow */}
        <div className="absolute bottom-0 left-0 w-full h-[50%] bg-gradient-to-t from-amber-deep/10 to-transparent pointer-events-none"></div>

        <div className="relative z-10">
            <div className="mb-12"><img src={axisLogo} alt="AXIS Logo" className="h-16 lg:h-20 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" /></div>
            <TerminalLabel prefix=">" className="mb-4 text-amber">NIX_PROTOCOLS // AUTHORIZED_PERSONNEL_ONLY</TerminalLabel>
            <h1 className="text-4xl lg:text-6xl font-display font-black text-white leading-none mb-6 uppercase">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber to-amber-bright">Initiate</span> <br/>
                Your Sequence.
            </h1>
            <p className="text-sm font-mono text-sandstone-dim max-w-md border-l-2 border-amber pl-4">
                Join the largest student network in Central India. Execute tasks, acquire points, and dominate the leaderboard.
            </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col justify-center items-center px-6 py-20 relative bg-obsidian-soft/50">
        <div className="w-full max-w-md">
            
            {/* Header */}
            <div className="text-center mb-10">
                <div className="mb-8 block md:hidden"><img src={axisLogo} alt="AXIS Logo" className="h-12 object-contain mx-auto drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" /></div>
                <h2 className="text-3xl font-display font-bold text-white mb-2 uppercase tracking-wide">
                    {isRegister ? 'New Node Reg' : 'Session Init'}
                </h2>
                <p className="text-sandstone-dim font-mono text-xs tracking-widest uppercase">
                    {isRegister ? 'Enter parameters to generate ID' : 'Provide credentials for access'}
                </p>
            </div>

            {/* Form Card */}
            <AxisFrame variant="amber" className="!p-8">
                
                {/* Google Sign In */}
                <button onClick={handleGoogleSignIn} className="w-full flex items-center justify-center gap-x-3 py-3 px-4 font-mono font-bold text-sm tracking-wider uppercase border border-border bg-obsidian hover:border-amber transition-colors text-sandstone hover:text-white group">
                    <GoogleIcon /> OAUTH_GOOGLE
                </button>
                
                <div className="relative flex py-8 items-center">
                    <div className="flex-grow border-t border-border"></div>
                    <span className="flex-shrink mx-4 text-border font-mono text-xs">{'// OR //'}</span>
                    <div className="flex-grow border-t border-border"></div>
                </div>

                {/* Status Toasts */}
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

                <form className="space-y-5" onSubmit={handleAuthAction}>
                    
                    {/* Animated Tab Switch content */}
                    <div className={`space-y-5 overflow-hidden transition-all duration-500 ease-in-out ${isRegister ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 hidden'}`}>
                        <InputField label="NODE_ALIAS (Name)" id="name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" required={isRegister} />
                        <InputField label="REFERRAL_CODE (Optional)" id="referral" type="text" value={referralCode} onChange={(e) => setReferralCode(e.target.value.toUpperCase())} placeholder="AXIS-XXXX" required={false} />
                    </div>

                    <InputField label="COMM_ADDRESS (Email)" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@college.edu" required={true} />
                    
                    <div>
                        <InputField label="ACCESS_KEY (Password)" id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required={true} />
                        {!isRegister && ( 
                            <div className="flex items-center justify-end mt-2">
                                <Link to="/forgot-password" className="text-xs font-mono text-cyan hover:text-cyan-soft transition-colors">Key Recovery?</Link>
                            </div> 
                        )}
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full mt-4 font-mono font-bold tracking-widest uppercase px-6 py-4 bg-amber hover:bg-amber-bright text-void transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'PROCESSING...' : (isRegister ? 'GENERATE_ID' : 'EXECUTE')}
                        {!isLoading && <Crosshair size={12} className="text-void opacity-50" />}
                    </button>
                </form>
                
                {/* Toggle Register/Login */}
                <div className="mt-8 pt-6 border-t border-border text-center">
                    <p className="text-xs font-mono text-sandstone-dim uppercase">
                        {isRegister ? 'Node already registered? ' : 'Unregistered node? '}
                        <button type="button" onClick={() => {setIsRegister(!isRegister); setError(''); setMessage('');}} className="text-amber hover:text-amber-bright transition-colors ml-2">
                            {isRegister ? 'Init Session' : 'Reg Node'}
                        </button>
                    </p>
                </div>
            </AxisFrame>

            {/* Organizer Login Link */}
            <div className="mt-8 text-center">
                <Link to="/login/organizer" className="inline-flex items-center text-xs font-mono text-sandstone-dim hover:text-cyan transition-colors uppercase group">
                    Aethel Administration 
                    <span className="ml-2 text-cyan opacity-50 group-hover:opacity-100 transition-opacity">{'->'}</span>
                </Link>
            </div>

        </div>
      </div>
    </div>
  );
}

export default LoginPage;
