import React from 'react';
import { AxisFrame } from '../components/motifs/AxisFrame';
import { TerminalLabel } from '../components/motifs/TerminalLabel';

function TermsAndConditionsPage() {
    return (
        <div className="bg-void min-h-screen pb-20 pt-20 relative">
            {/* Background Grid */}
            <div className="absolute inset-0 axis-grid-bg opacity-30 pointer-events-none fixed"></div>

            {/* Header */}
            <div className="relative border-b border-border bg-obsidian-soft/80 backdrop-blur-md pb-12 pt-12 px-4">
                <div className="max-w-4xl mx-auto text-center relative z-10 animate-fade-in-up">
                    <TerminalLabel prefix=">">Terms & Conditions</TerminalLabel>
                    <h1 className="text-4xl sm:text-5xl font-display font-black text-white tracking-widest uppercase mt-4">
                        Terms & Conditions
                    </h1>
                    <p className="mt-4 text-amber font-mono text-sm max-w-2xl mx-auto uppercase tracking-widest">
                        AXIS'27 Campus Ambassador Programme
                    </p>
                    <p className="mt-2 text-sandstone-dim font-mono text-xs max-w-2xl mx-auto uppercase tracking-widest">
                        Last Updated: To be updated
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-10 animate-fade-in">
                <AxisFrame variant="amber" className="mb-12">
                    <h2 className="text-xl font-display font-bold text-white uppercase tracking-widest mb-2 text-amber">Important Notice</h2>
                    <p className="text-sandstone font-mono text-sm leading-relaxed">
                        This is a placeholder Terms & Conditions page. The final terms and conditions will be published here before the programme begins. Do not consider this the final legal document.
                    </p>
                </AxisFrame>

                <div className="space-y-8 font-mono text-sm text-sandstone">
                    <section>
                        <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-3 border-b border-border pb-2">1. Eligibility</h3>
                        <p className="leading-relaxed">
                            [Placeholder] You must be currently enrolled in a recognized university or college to participate. Additional eligibility criteria will be added here.
                        </p>
                    </section>
                    
                    <section>
                        <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-3 border-b border-border pb-2">2. Participation</h3>
                        <p className="leading-relaxed">
                            [Placeholder] Details regarding what is expected of an ambassador, expected hours of engagement, and mandatory events.
                        </p>
                    </section>
                    
                    <section>
                        <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-3 border-b border-border pb-2">3. Submission Guidelines</h3>
                        <p className="leading-relaxed">
                            [Placeholder] Rules on how to submit tasks, formatting requirements, and what constitutes a valid submission.
                        </p>
                    </section>
                    
                    <section>
                        <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-3 border-b border-border pb-2">4. Code of Conduct</h3>
                        <p className="leading-relaxed">
                            [Placeholder] General behavioral expectations, rules against spamming, and grounds for immediate disqualification.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-3 border-b border-border pb-2">5. Points and Rewards</h3>
                        <p className="leading-relaxed">
                            [Placeholder] How points are distributed, rules regarding partial acceptance, and policies on point redemption.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-3 border-b border-border pb-2">6. Intellectual Property</h3>
                        <p className="leading-relaxed">
                            [Placeholder] Policies on the ownership of marketing materials created for the programme.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-3 border-b border-border pb-2">7. Programme Rules</h3>
                        <p className="leading-relaxed">
                            [Placeholder] General administrative rules and the right of organizers to alter the terms during the programme.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-3 border-b border-border pb-2">8. Contact</h3>
                        <p className="leading-relaxed">
                            [Placeholder] Details on whom to contact in case of disputes, questions, or clarification regarding these terms.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default TermsAndConditionsPage;
