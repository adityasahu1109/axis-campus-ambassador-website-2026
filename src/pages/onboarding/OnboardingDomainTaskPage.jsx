import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../AuthContext';
import { AxisFrame } from '../../components/motifs/AxisFrame';
import { TerminalLoader } from '../../components/motifs/TerminalLoader';

const DOMAINS = [
  { id: 'management_design', label: 'Management & Design' },
  { id: 'software_electronics', label: 'Software & Electronics' },
  { id: 'robotics', label: 'Robotics & Automation' },
  { id: 'convergence', label: 'Convergence' }
];

export default function OnboardingDomainTaskPage() {
  const { user, profile, refetchProfile } = useAuth();
  const navigate = useNavigate();
  
  const [selectedDomain, setSelectedDomain] = useState(profile?.domain || null);
  const [initialTask, setInitialTask] = useState(null);
  const [fetchingTask, setFetchingTask] = useState(false);
  const [driveLink, setDriveLink] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedDomain) {
      const fetchTask = async () => {
        setFetchingTask(true);
        setError(null);
        try {
          const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('is_initial_task', true)
            .eq('domain', selectedDomain)
            .limit(1)
            .maybeSingle();
            
          if (error) throw error;
          setInitialTask(data);
        } catch (err) {
          setError('Failed to fetch domain task.');
          console.error(err);
        } finally {
          setFetchingTask(false);
        }
      };
      fetchTask();
    }
  }, [selectedDomain]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!driveLink.startsWith('https://drive.google.com')) {
      setError('A valid Google Drive link is required.');
      return;
    }
    
    setSubmitting(true);
    setError(null);

    try {
      // 1. Update domain on profile (if not already set or changed)
      if (profile?.domain !== selectedDomain) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ domain: selectedDomain })
          .eq('id', user.id);
        if (profileError) throw profileError;
      }

      // 2. Submit the task
      const { error: submissionError } = await supabase
        .from('submissions')
        .insert({
          student_id: user.id,
          task_id: initialTask.id,
          drive_link: driveLink,
          status: 'pending'
        });
        
      if (submissionError) throw submissionError;

      // 3. Update profile status to pending_review
      const { error: statusError } = await supabase
        .from('profiles')
        .update({ status: 'pending_review' })
        .eq('id', user.id);
        
      if (statusError) throw statusError;

      await refetchProfile();
      navigate('/onboarding/pending', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="font-mono text-3xl font-bold uppercase tracking-widest text-cyan mb-2">DOMAIN_SELECTION</h1>
      <p className="text-sandstone mb-8">Select your operational domain and complete the initial directive to proceed.</p>

      {error && (
          <div className="mb-8 p-4 bg-danger/20 border-l-4 border-danger text-danger font-mono text-sm">
              {error}
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        {DOMAINS.map(domain => (
          <button
            key={domain.id}
            onClick={() => setSelectedDomain(domain.id)}
            className={`p-6 text-left border transition-all ${
              selectedDomain === domain.id 
                ? 'border-cyan bg-cyan/10 shadow-[0_0_15px_rgba(0,240,255,0.2)]' 
                : 'border-border bg-obsidian hover:border-sandstone hover:bg-obsidian-light'
            }`}
          >
            <h3 className={`font-mono font-bold tracking-widest uppercase mb-2 ${
              selectedDomain === domain.id ? 'text-cyan' : 'text-sandstone'
            }`}>
              {domain.label}
            </h3>
            <p className="text-sm text-sandstone opacity-70">
              Specialized pathway for {domain.label.toLowerCase()} tasks.
            </p>
          </button>
        ))}
      </div>

      {selectedDomain && (
        <div className="animate-fade-in">
          <h2 className="font-mono text-xl font-bold uppercase tracking-widest text-amber mb-6">
            // INITIAL_DIRECTIVE
          </h2>
          
          {fetchingTask ? (
            <div className="py-12">
              <TerminalLoader text="Fetching task parameters..." />
            </div>
          ) : initialTask ? (
            <AxisFrame variant="amber" hover={false} className="p-8">
              <h3 className="text-2xl font-bold text-white mb-4">{initialTask.title}</h3>
              <div className="prose prose-invert prose-cyan max-w-none mb-8 text-sandstone">
                {initialTask.description}
              </div>
              
              <form onSubmit={handleSubmit} className="border-t border-amber/20 pt-8 mt-8">
                <div className="mb-6">
                  <label className="block mb-2 text-xs font-mono font-bold tracking-widest uppercase text-amber">
                    SUBMISSION_PAYLOAD (Google Drive Link)
                  </label>
                  <p className="text-xs text-sandstone/70 mb-3">Ensure link access is set to "Anyone with the link".</p>
                  <input 
                    type="url" 
                    value={driveLink} 
                    onChange={(e) => setDriveLink(e.target.value)} 
                    required 
                    placeholder="https://drive.google.com/..."
                    className="w-full bg-void border border-amber/30 focus:border-amber text-white p-4 font-mono text-sm outline-none transition-colors"
                  />
                </div>

                <div className="flex justify-end">
                  <button 
                    type="submit" 
                    disabled={submitting || !driveLink.trim()}
                    className="px-8 py-4 text-sm font-mono font-bold uppercase tracking-[0.2em] text-void bg-amber hover:bg-amber-bright transition-colors shadow-[0_0_15px_rgba(255,158,0,0.4)] disabled:opacity-50"
                  >
                    {submitting ? 'UPLOADING...' : 'SUBMIT_DIRECTIVE'}
                  </button>
                </div>
              </form>
            </AxisFrame>
          ) : (
            <div className="p-8 bg-obsidian border border-border text-center">
              <p className="font-mono text-sandstone">This domain isn't accepting ambassadors yet. Please select another domain or check back later.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
