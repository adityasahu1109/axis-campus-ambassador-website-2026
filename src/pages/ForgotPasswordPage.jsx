import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import logoDark from '../assets/logo-dark.png';
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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
      setMessage('KEY_RECOVERY_PROTOCOL INITIATED. Check your comms (email) for the link.');
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

        {/* Back Button */}
        <Link to="/login" className="absolute top-6 left-6 z-20 flex items-center text-cyan hover:text-cyan-soft font-mono text-sm tracking-widest uppercase transition-colors group">
            <span className="mr-2 opacity-50">{'<'}</span> Abort Sequence
        </Link>

        {/* Logo */}
        <div className="mb-8 z-10 animate-fade-in-up">
            <Link to="/">
                <img src={logoDark} alt="AXIS Logo" className="h-16" />
            </Link>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md z-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <AxisFrame variant="cyan" className="!p-8 bg-obsidian-soft/80 backdrop-blur-md">
                
                <div className="text-center mb-8">
                    <TerminalLabel prefix=">" className="justify-center mb-4 text-cyan">SYS_RECOVERY // AUTH_KEY</TerminalLabel>
                    <h1 className="text-2xl font-display font-bold text-white uppercase tracking-wide">Key Recovery</h1>
                    <p className="mt-2 text-xs font-mono text-sandstone-dim">Enter your COMM_ADDRESS (Email) to receive a recovery link.</p>
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

                <form className="space-y-6" onSubmit={handlePasswordReset}>
                    <InputField 
                        label="COMM_ADDRESS (Email)" 
                        id="email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="name@college.edu" 
                        required={true} 
                    />

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full font-mono font-bold tracking-widest uppercase px-6 py-4 bg-transparent border border-cyan hover:bg-cyan/10 text-cyan transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? 'TRANSMITTING...' : 'SEND_LINK'}
                        {!loading && <Crosshair size={12} className="text-cyan opacity-50" />}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-xs font-mono text-sandstone-dim">
                        Remembered your key? 
                        <Link to="/login" className="text-cyan hover:text-cyan-soft ml-2 transition-colors">Return to Login</Link>
                    </p>
                </div>
            </AxisFrame>
        </div>
    </div>
  );
}

export default ForgotPasswordPage;