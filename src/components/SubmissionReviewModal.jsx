import React, { useState, useEffect } from 'react';
import { Modal, InputField } from '../pages/AdminDashboard';
import { clsx } from 'clsx';

export function SubmissionReviewModal({
  submission,
  isOpen,
  onClose,
  onSubmitReview,
}) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [awardedPoints, setAwardedPoints] = useState(0);

  // Reset state when a new submission is opened
  useEffect(() => {
    if (isOpen) {
      setRejectionReason('');
      setAwardedPoints(submission?.tasks?.points || 0);
    }
  }, [isOpen, submission]);

  if (!isOpen || !submission) return null;

  return (
    <Modal onClose={onClose} title="REVIEW_SUBMISSION">
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 border border-border bg-obsidian-soft p-4">
                <div>
                    <span className="text-[10px] font-mono font-bold text-sandstone uppercase tracking-widest block mb-1">NODE_ID</span>
                    <span className="font-mono font-bold text-white uppercase">{submission?.profiles?.full_name}</span>
                </div>
                <div>
                    <span className="text-[10px] font-mono font-bold text-cyan uppercase tracking-widest block mb-1">MAX_REWARD</span>
                    <span className="font-mono font-bold text-cyan">{submission?.tasks?.points} METRICS</span>
                </div>
            </div>

            <div>
                <span className="text-[10px] font-mono font-bold text-sandstone uppercase tracking-widest block mb-2">DIRECTIVE_PARAMETERS</span>
                <div className="border border-border bg-obsidian-soft p-4">
                    <h4 className="font-display font-bold text-white uppercase mb-2">{submission?.tasks?.title}</h4>
                    <p className="text-sm font-mono text-sandstone">{submission?.tasks?.description}</p>
                </div>
            </div>

            <div>
                <span className="text-[10px] font-mono font-bold text-sandstone uppercase tracking-widest block mb-2">Submission Link</span>
                <div className="border border-border bg-void p-4 text-sm font-mono text-cyan truncate">
                    {submission?.drive_link ? (
                        <a href={submission?.drive_link} target="_blank" rel="noreferrer" className="hover:underline">
                            {submission?.drive_link}
                        </a>
                    ) : (
                        <span className="text-sandstone-dim">No link provided</span>
                    )}
                </div>
            </div>

            {submission?.submission_context && (
                <div>
                    <span className="text-[10px] font-mono font-bold text-sandstone uppercase tracking-widest block mb-2">Submission Context</span>
                    <div className="border border-border bg-void p-4 text-sm font-mono text-white whitespace-pre-wrap leading-relaxed">
                        {submission.submission_context}
                    </div>
                </div>
            )}
            
            <div className="border-t border-border/50 pt-4 mt-2">
                <span className="text-[10px] font-mono font-bold text-sandstone uppercase tracking-widest block mb-4">Verification Settings</span>
                
                <div className="flex gap-4 items-end">
                    <div className="w-1/3">
                        <InputField label="Metrics Awarded" type="number" value={awardedPoints} onChange={(e) => setAwardedPoints(parseInt(e.target.value) || 0)} />
                    </div>
                    <div className="w-2/3 flex gap-2 mb-6">
                        {[25, 50, 75, 100].map(pct => (
                            <button
                                key={pct}
                                type="button"
                                onClick={() => setAwardedPoints(Math.floor((submission?.tasks?.points || 0) * (pct / 100)))}
                                className={clsx(
                                    "flex-1 py-3 text-xs font-mono font-bold border transition-colors",
                                    awardedPoints === Math.floor((submission?.tasks?.points || 0) * (pct / 100))
                                        ? "bg-cyan border-cyan text-void" 
                                        : "bg-void border-border text-sandstone hover:border-cyan/50 hover:text-cyan"
                                )}
                            >
                                {pct}%
                            </button>
                        ))}
                    </div>
                </div>
                <p className="text-[10px] text-sandstone opacity-70 mt-[-10px]">If rejected or requires revision, awarded metrics will automatically be 0. Ensure it does not exceed {submission?.tasks?.points}.</p>
            </div>

            <div>
                <InputField label="Feedback / Notes" multiline value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} />
            </div>

            <div className="flex justify-between gap-4 pt-6 border-t border-border">
                <button onClick={() => onSubmitReview('needs_revision', rejectionReason, awardedPoints)} disabled={!rejectionReason} className="px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-amber border border-amber hover:bg-amber hover:text-void transition-colors disabled:opacity-50">REQ_REVISION</button>
                <div className="flex gap-4">
                    <button onClick={() => onSubmitReview('rejected', rejectionReason, awardedPoints)} disabled={!rejectionReason} className="px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-white bg-danger hover:bg-red-700 transition-colors disabled:opacity-50">REJECT</button>
                    <button onClick={() => onSubmitReview('approved', rejectionReason, awardedPoints)} className="px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-void bg-cyan hover:bg-cyan-soft transition-colors shadow-[0_0_15px_rgba(0,240,255,0.4)]">Approve</button>
                </div>
            </div>
        </div>
    </Modal>
  );
}
