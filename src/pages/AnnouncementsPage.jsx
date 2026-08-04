import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { AxisFrame } from '../components/motifs/AxisFrame';
import { TerminalLabel } from '../components/motifs/TerminalLabel';
import { TerminalLoader } from '../components/motifs/TerminalLoader';
import { Crosshair } from '../components/motifs/Crosshair';

function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getAnnouncements() {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('announcements')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                setAnnouncements(data || []);
            } catch (error) {
                console.error("Error fetching announcements:", error.message);
            } finally {
                setLoading(false);
            }
        }
        getAnnouncements();
    }, []);

    if (loading) return <div className="min-h-screen bg-void flex justify-center items-center"><TerminalLoader text="FETCHING_COMMS_DATA..." /></div>;

    return (
        <div className="bg-void min-h-screen pb-20 relative pt-20">
            
            {/* Background Grid */}
            <div className="absolute inset-0 axis-grid-bg opacity-20 pointer-events-none fixed"></div>

            {/* Header */}
            <div className="relative border-b border-border bg-obsidian-soft/80 backdrop-blur-md pb-12 pt-12 px-4">
                <div className="max-w-4xl mx-auto text-center relative z-10 animate-fade-in-up">
                    <TerminalLabel className="justify-center mb-4">GLOBAL_GRID // BROADCASTS</TerminalLabel>
                    <h1 className="text-4xl md:text-5xl font-display font-black text-white tracking-widest uppercase">Communications</h1>
                    <p className="mt-4 text-sandstone-dim font-mono text-sm max-w-xl mx-auto">Incoming directives, task updates, and system broadcasts from Aethel command.</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-10">
                {announcements.length > 0 ? (
                    <div className="space-y-8 animate-fade-in">
                        {announcements.map((item, index) => {
                            const date = new Date(item.created_at);
                            const isLatest = index === 0;
                            return (
                                <AxisFrame 
                                    key={item.id} 
                                    variant={isLatest ? "amber" : "cyan"} 
                                    hover={true} 
                                    className="!p-6 md:!p-8 group relative overflow-hidden"
                                >
                                    {/* Scanline effect on latest */}
                                    {isLatest && <div className="absolute inset-0 scanline opacity-20 pointer-events-none"></div>}
                                    
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-6 gap-4 relative z-10">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                {isLatest && <span className="inline-block px-2 py-0.5 text-[10px] font-mono font-bold bg-amber text-void uppercase tracking-widest animate-pulse">NEW_BROADCAST</span>}
                                                <TerminalLabel prefix={isLatest ? "!" : ">"} className={isLatest ? "text-amber" : "text-cyan"}>
                                                    {date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase()} // {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                                </TerminalLabel>
                                            </div>
                                            <h2 className="text-xl md:text-2xl font-display font-bold text-white uppercase tracking-wide">{item.title}</h2>
                                        </div>
                                        <Crosshair size={16} className={isLatest ? "text-amber opacity-30" : "text-cyan opacity-30"} />
                                    </div>
                                    
                                    <div className="relative z-10">
                                        <p className="text-sm font-mono text-sandstone leading-relaxed whitespace-pre-wrap">{item.content}</p>
                                    </div>
                                </AxisFrame>
                            );
                        })}
                    </div>
                ) : (
                    <div className="mt-12">
                        <AxisFrame variant="cyan" className="!p-12 text-center flex flex-col items-center">
                            <TerminalLabel prefix=">">STATUS_REPORT</TerminalLabel>
                            <h3 className="text-xl font-display font-bold text-white mt-4 mb-2">NO_ACTIVE_BROADCASTS</h3>
                            <p className="text-sm font-mono text-sandstone-dim">Stand by for incoming directives from command.</p>
                            <Crosshair size={24} className="mt-8 text-cyan opacity-20 animate-spin-slow" />
                        </AxisFrame>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AnnouncementsPage;