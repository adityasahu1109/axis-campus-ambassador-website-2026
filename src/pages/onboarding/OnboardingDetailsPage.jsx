import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../hooks/useAuth';
import { AxisFrame } from '../../components/motifs/AxisFrame';

const InputField = ({ label, type = "text", value, onChange, required, placeholder }) => (
  <div className="mb-6 group">
      <label className="block mb-2 text-xs font-mono font-bold tracking-widest uppercase text-sandstone group-focus-within:text-cyan transition-colors">{label}</label>
      <input 
          type={type} 
          value={value} 
          onChange={onChange} 
          required={required}
          placeholder={placeholder}
          className="w-full bg-obsidian border border-border focus:border-cyan text-white p-4 font-mono text-sm outline-none transition-colors"
      />
  </div>
);

export default function OnboardingDetailsPage() {
  const { profile, refetchProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    phone_number: profile?.phone_number || '',
    college: profile?.college || '',
    year_of_study: profile?.year_of_study || '',
    city: profile?.city || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: rpcError } = await supabase.rpc('complete_onboarding_details', {
        p_phone_number: formData.phone_number,
        p_college: formData.college,
        p_year_of_study: formData.year_of_study,
        p_city: formData.city,
      });

      if (rpcError) throw rpcError;
      
      // Don't navigate manually — OnboardingGate's state machine handles
      // routing based on profile.status. The explicit navigate() was racing
      // with React's state propagation, causing a redirect loop back here.
      await refetchProfile();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-mono text-3xl font-bold uppercase tracking-widest text-cyan mb-2">Complete Your Profile</h1>
      <p className="text-sandstone mb-8">Enter required auxiliary details to initialize your ambassador instance.</p>
      
      {error && (
          <div className="mb-8 p-4 bg-danger/20 border-l-4 border-danger text-danger font-mono text-sm">
              {error}
          </div>
      )}

      <form onSubmit={handleSubmit}>
        <AxisFrame variant="cyan" hover={false} className="p-8 mb-8">
            <InputField 
                label="Phone Number" 
                type="tel"
                placeholder="+91..."
                value={formData.phone_number} 
                onChange={(e) => setFormData({...formData, phone_number: e.target.value})} 
                required 
            />
            <InputField 
                label="College / University" 
                placeholder="National Institute of Technology..."
                value={formData.college} 
                onChange={(e) => setFormData({...formData, college: e.target.value})} 
                required 
            />
            <InputField 
                label="Year of Study" 
                placeholder="e.g. 1st Year, 2nd Year..."
                value={formData.year_of_study} 
                onChange={(e) => setFormData({...formData, year_of_study: e.target.value})} 
                required 
            />
            <InputField 
                label="City" 
                placeholder="City Name"
                value={formData.city} 
                onChange={(e) => setFormData({...formData, city: e.target.value})} 
                required 
            />
        </AxisFrame>

        <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="px-8 py-4 text-sm font-mono font-bold uppercase tracking-[0.2em] text-void bg-cyan hover:bg-cyan-soft transition-colors shadow-[0_0_15px_rgba(0,240,255,0.4)] disabled:opacity-50"
            >
              {loading ? 'TRANSMITTING...' : 'Continue'}
            </button>
        </div>
      </form>
    </div>
  );
}
