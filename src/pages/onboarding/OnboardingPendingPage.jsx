import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../AuthContext';
import { AxisFrame } from '../../components/motifs/AxisFrame';
import { TerminalLoader } from '../../components/motifs/TerminalLoader';

export default function OnboardingPendingPage() {
  const { user, profile, refetchProfile } = useAuth();
  const navigate = useNavigate();
  
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [driveLink, setDriveLink] = useState('');
  const [error, setError] = useState(null);

  const fetchStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          tasks (
            id, title, description, is_initial_task
          )
        `)
        .eq('student_id', user.id)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      setSubmission(data);
      if (data?.drive_link) {
        setDriveLink(data.drive_link);
      }
    } catch (err) {
      console.error("Error fetching submission status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    
    // Auto-refresh profile periodically to check if they got approved
    const interval = setInterval(async () => {
      await refetchProfile();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [user.id]);

  const handleResubmit = async (e) => {
    e.preventDefault();
    if (!driveLink.startsWith('https://drive.google.com')) {
      setError('A valid Google Drive link is required.');
      return;
    }
    
    setSubmitting(true);
    setError(null);

    try {
      const { error: submissionError } = await supabase
        .from('submissions')
        .update({
          drive_link: driveLink,
          status: 'pending'
        })
        .eq('id', submission.id);
        
      if (submissionError) throw submissionError;

      // Reset local state to reflect it's pending again
      await fetchStatus();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <TerminalLoader text="Checking submission status..." />
      </div>
    );
  }

  const needsRevision = submission?.status === 'needs_revision';

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-mono text-3xl font-bold uppercase tracking-widest text-cyan mb-2">
        {needsRevision ? 'REVISION_REQUIRED' : 'STATUS: PENDING_REVIEW'}
      </h1>
      
      <p className="text-sandstone mb-8">
        {needsRevision 
          ? 'Your initial directive requires adjustments. Please review the feedback below and resubmit.'
          : 'Your initial directive has been logged. Please wait while an administrator verifies your submission.'}
      </p>

      {needsRevision ? (
        <AxisFrame variant="danger" hover={false} className="p-8">
          <div className="mb-6 p-4 bg-danger/10 border-l-4 border-danger">
            <h4 className="text-danger font-mono font-bold text-sm mb-2">&gt; ADMIN_FEEDBACK:</h4>
            <p className="text-white whitespace-pre-wrap">{submission.reviewer_notes || "No additional notes provided."}</p>
          </div>
          
          <h3 className="text-xl font-bold text-white mb-4">{submission.tasks?.title}</h3>
          
          <form onSubmit={handleResubmit} className="border-t border-danger/20 pt-8 mt-4">
            {error && (
              <div className="mb-6 p-3 bg-danger/20 text-danger font-mono text-sm">
                  {error}
              </div>
            )}
            <div className="mb-6">
              <label className="block mb-2 text-xs font-mono font-bold tracking-widest uppercase text-danger">
                UPDATED_PAYLOAD (Google Drive Link)
              </label>
              <input 
                type="url" 
                value={driveLink} 
                onChange={(e) => setDriveLink(e.target.value)} 
                required 
                className="w-full bg-void border border-danger/30 focus:border-danger text-white p-4 font-mono text-sm outline-none transition-colors"
              />
            </div>

            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={submitting || !driveLink.trim()}
                className="px-8 py-4 text-sm font-mono font-bold uppercase tracking-[0.2em] text-void bg-danger hover:bg-red-500 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.4)] disabled:opacity-50"
              >
                {submitting ? 'TRANSMITTING...' : 'RESUBMIT_DIRECTIVE'}
              </button>
            </div>
          </form>
        </AxisFrame>
      ) : (
        <AxisFrame variant="cyan" hover={false} className="p-12 text-center">
           <div className="animate-pulse mb-6">
              <div className="w-16 h-16 rounded-full border-4 border-t-cyan border-r-cyan border-b-cyan/20 border-l-cyan/20 mx-auto animate-spin"></div>
           </div>
           <h3 className="text-xl font-bold text-white mb-2">Awaiting Verification</h3>
           <p className="text-sandstone">
             You will be automatically redirected to your dashboard once your submission is approved.
           </p>
        </AxisFrame>
      )}
    </div>
  );
}
