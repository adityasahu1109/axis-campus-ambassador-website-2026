import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../hooks/useAuth';
import { AxisFrame } from '../../components/motifs/AxisFrame';

const InputField = ({ label, type = "text", name, value, onChange, required, placeholder, options = null, disabled = false, pattern }) => (
  <div className="mb-6 group relative">
      <label className="block mb-2 text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase text-sandstone group-focus-within:text-cyan transition-colors">{label}</label>
      {options ? (
          <select 
              name={name}
              value={value} 
              onChange={onChange} 
              required={required}
              disabled={disabled}
              className="w-full bg-obsidian border border-border focus:border-cyan text-white p-3.5 font-mono text-sm outline-none transition-colors appearance-none disabled:opacity-50"
          >
              <option value="" disabled>Select {label}</option>
              {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
      ) : (
          <input 
              type={type} 
              name={name}
              value={value} 
              onChange={onChange} 
              required={required}
              placeholder={placeholder}
              disabled={disabled}
              pattern={pattern}
              className="w-full bg-obsidian border border-border focus:border-cyan text-white p-3.5 font-mono text-sm outline-none transition-colors disabled:opacity-50"
          />
      )}
  </div>
);

export default function OnboardingDetailsPage() {
  const { user, profile, refetchProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [domains, setDomains] = useState([]);
  const [domainExamples, setDomainExamples] = useState([]);
  const [domainsLoading, setDomainsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || user?.user_metadata?.full_name || '',
    phone_number: profile?.phone_number || '',
    college: profile?.college || '',
    branch: profile?.branch || '',
    degree_type: profile?.degree_type || '',
    year_of_study: profile?.year_of_study || '',
    city: profile?.city || '',
    domain_id: profile?.domain_id || '',
    referral_code: '',
  });

  const [referralValidating, setReferralValidating] = useState(false);
  const [referralStatus, setReferralStatus] = useState(null); // { valid: bool, name: string, error: string }

  useEffect(() => {
    async function fetchDomains() {
      try {
        const { data: domainsData, error: domainsError } = await supabase
          .from('domains')
          .select('id, name, description, is_active');
          
        if (domainsError) throw domainsError;
        setDomains(domainsData.filter(d => d.is_active));

        const { data: examplesData, error: examplesError } = await supabase
          .from('domain_examples')
          .select('id, domain_id, title, description');
          
        if (examplesError) throw examplesError;
        setDomainExamples(examplesData);
      } catch (err) {
        console.error("Error fetching domains:", err);
      } finally {
        setDomainsLoading(false);
      }
    }
    fetchDomains();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReferralCheck = async () => {
    if (!formData.referral_code || formData.referral_code.length !== 6) {
      setReferralStatus({ valid: false, error: "Code must be 6 digits" });
      return;
    }
    
    setReferralValidating(true);
    setReferralStatus(null);
    try {
      const { data, error } = await supabase.rpc('validate_referral_code', {
        p_code: formData.referral_code
      });
      if (error) throw error;
      
      const result = data[0];
      if (result && result.valid) {
        setReferralStatus({ valid: true, name: result.referrer_name });
      } else {
        setReferralStatus({ valid: false, error: "Invalid referral code" });
      }
    } catch (err) {
      setReferralStatus({ valid: false, error: "Error checking code" });
    } finally {
      setReferralValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Validate referral code if provided and not yet validated
      let isReferralValid = false;
      if (formData.referral_code) {
        if (referralStatus?.valid) {
          isReferralValid = true;
        } else {
          const { data, error } = await supabase.rpc('validate_referral_code', {
            p_code: formData.referral_code
          });
          if (error) throw error;
          if (data && data[0] && data[0].valid) {
            isReferralValid = true;
          } else {
            throw new Error("Invalid referral code provided.");
          }
        }
      }

      // 2. Save profile fields
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          college: formData.college,
          branch: formData.branch,
          degree_type: formData.degree_type,
          year_of_study: parseInt(formData.year_of_study, 10),
          city: formData.city,
          domain_id: parseInt(formData.domain_id, 10)
        })
        .eq('id', user.id);

      if (updateError) throw updateError;
      
      // 3. Complete referral attribution (if any)
      if (isReferralValid) {
        const { error: referralError } = await supabase.rpc('complete_referral', {
          p_code: formData.referral_code
        });
        // Non-fatal if this fails, profile is already saved
        if (referralError) {
          console.error("Referral attribution failed:", referralError);
        }
      }

      // 4. Trigger gate re-evaluation
      await refetchProfile();
      
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-mono text-2xl sm:text-3xl font-bold uppercase tracking-widest text-cyan mb-2">Complete Your Profile</h1>
      <p className="text-sandstone text-sm sm:text-base mb-8">Enter required auxiliary details to initialize your ambassador instance.</p>
      
      {error && (
          <div className="mb-8 p-4 bg-danger/10 border-l-4 border-danger text-danger font-mono text-sm">
              {error}
          </div>
      )}

      <form onSubmit={handleSubmit}>
        <AxisFrame variant="cyan" hover={false} className="p-6 sm:p-8 mb-8">
            <InputField 
                label="Full Name" 
                name="full_name"
                placeholder="John Doe"
                value={formData.full_name} 
                onChange={handleChange} 
                required 
            />
            <InputField 
                label="Phone Number" 
                type="tel"
                name="phone_number"
                placeholder="10 digit mobile number"
                value={formData.phone_number} 
                onChange={handleChange} 
                pattern="^[0-9]{10}$"
                required 
            />
            <InputField 
                label="College / University" 
                name="college"
                placeholder="National Institute of Technology..."
                value={formData.college} 
                onChange={handleChange} 
                required 
            />
            <InputField 
                label="Degree Type" 
                name="degree_type"
                placeholder="e.g. B.Tech, B.Sc, BA..."
                value={formData.degree_type} 
                onChange={handleChange} 
                required 
            />
            <InputField 
                label="Branch / Major" 
                name="branch"
                placeholder="e.g. Computer Science..."
                value={formData.branch} 
                onChange={handleChange} 
                required 
            />
            <InputField 
                label="City" 
                name="city"
                placeholder="City Name"
                value={formData.city} 
                onChange={handleChange} 
                required 
            />
            <InputField 
                label="Year of Study" 
                name="year_of_study"
                value={formData.year_of_study} 
                onChange={handleChange} 
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
            
            <div className="mb-6">
              <InputField 
                  label="Select Domain" 
                  name="domain_id"
                  value={formData.domain_id} 
                  onChange={handleChange} 
                  required
                  disabled={domainsLoading}
                  options={domains.map(d => ({ value: d.id.toString(), label: d.name }))}
              />
              
              {formData.domain_id && (
                <div className="mt-4 p-4 border border-cyan/30 bg-cyan/5">
                  <h3 className="font-mono text-cyan text-sm font-bold uppercase mb-2">Domain Description</h3>
                  <p className="text-sandstone text-xs mb-4">
                    {domains.find(d => d.id.toString() === formData.domain_id)?.description}
                  </p>
                  
                  <h3 className="font-mono text-cyan text-sm font-bold uppercase mb-2">Example Tasks</h3>
                  <ul className="list-disc list-inside text-sandstone text-xs space-y-2">
                    {domainExamples.filter(e => e.domain_id.toString() === formData.domain_id).map(example => (
                      <li key={example.id}>
                        <span className="font-bold text-white">{example.title}</span>: {example.description}
                      </li>
                    ))}
                    {domainExamples.filter(e => e.domain_id.toString() === formData.domain_id).length === 0 && (
                      <li>No example tasks available.</li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border">
              <label className="block mb-2 text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase text-sandstone">Referral Code (Optional)</label>
              <div className="flex gap-2">
                <input 
                    type="text" 
                    name="referral_code"
                    value={formData.referral_code} 
                    onChange={handleChange} 
                    placeholder="6-digit code"
                    maxLength={6}
                    className="w-full bg-obsidian border border-border focus:border-amber text-white p-3.5 font-mono text-sm outline-none transition-colors"
                />
                <button 
                  type="button"
                  onClick={handleReferralCheck}
                  disabled={referralValidating || !formData.referral_code || formData.referral_code.length !== 6}
                  className="px-4 bg-void border border-amber text-amber font-mono text-xs uppercase tracking-widest hover:bg-amber/10 transition-colors disabled:opacity-50"
                >
                  {referralValidating ? 'Checking' : 'Check'}
                </button>
              </div>
              {referralStatus && (
                <div className={`mt-2 text-xs font-mono ${referralStatus.valid ? 'text-cyan' : 'text-danger'}`}>
                  {referralStatus.valid ? `Valid code! Referred by ${referralStatus.name}` : referralStatus.error}
                </div>
              )}
            </div>
        </AxisFrame>

        <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={loading || (formData.referral_code && referralStatus && !referralStatus.valid)}
              className="w-full sm:w-auto px-8 py-4 text-sm font-mono font-bold uppercase tracking-[0.2em] text-void bg-cyan hover:bg-cyan-soft transition-colors shadow-[0_0_15px_rgba(0,240,255,0.4)] disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? 'TRANSMITTING...' : 'Complete Profile'}
            </button>
        </div>
      </form>
    </div>
  );
}
