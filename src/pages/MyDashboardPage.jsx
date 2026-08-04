import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';
import { AxisFrame } from '../components/motifs/AxisFrame';
import { TerminalLabel } from '../components/motifs/TerminalLabel';
import { TerminalLoader } from '../components/motifs/TerminalLoader';
import { Crosshair } from '../components/motifs/Crosshair';
import { clsx } from 'clsx';

const StatusBadge = ({ status }) => {
    const format = {
        'Approved': { text: '[ VERIFIED ]', color: 'text-cyan' },
        'Pending': { text: '[ PENDING ]', color: 'text-amber' },
        'Rejected': { text: '[ REJECTED ]', color: 'text-danger' },
        'Not Submitted': { text: '[ UNASSIGNED ]', color: 'text-sandstone-dim' },
    };
    const { text, color } = format[status] || format['Not Submitted'];
    return <span className={clsx("font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest", color)}>{text}</span>;
};

// Animated Counter component
const AnimatedCounter = ({ value, duration = 1500 }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let startTime = null;
        const animation = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const easeOutQuart = 1 - Math.pow(1 - Math.min(progress / duration, 1), 4);
            setCount(Math.floor(easeOutQuart * value));
            if (progress < duration) requestAnimationFrame(animation);
            else setCount(value);
        };
        requestAnimationFrame(animation);
        return () => setCount(value);
    }, [value, duration]);
    return <span>{count}</span>;
};

function MyDashboardPage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastSeenTaskId, setLastSeenTaskId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [submissionContext, setSubmissionContext] = useState('');

    const fetchData = useCallback(async () => {
        if (!user) { setLoading(false); return; }
        try {
            setLoading(true);
            const seenId = localStorage.getItem('lastSeenTaskId');
            setLastSeenTaskId(seenId ? parseInt(seenId) : 0);
            
            const { data: profileData } = await supabase.from('profiles').select('full_name, points').eq('id', user.id).single();
            setProfile(profileData);
            
            const { data: tasksData } = await supabase.from('tasks').select('*').order('id', { ascending: false });
            setTasks(tasksData || []);
            
            const { data: leaderboardData } = await supabase.from('profiles').select('id, points').order('points', { ascending: false });
            setLeaderboard(leaderboardData || []);
            
            const { data: submissionsData } = await supabase.from('submissions').select('*').eq('student_id', user.id);
            setSubmissions(submissionsData || []);
            
            if (tasksData && tasksData.length > 0) {
                localStorage.setItem('lastSeenTaskId', tasksData[0].id.toString());
            }
        } catch (error) { console.error("Error fetching data:", error.message); }
        finally { setLoading(false); }
    }, [user]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        const existingSubmission = submissions.find(s => s.task_id === task.id);
        setSubmissionContext(existingSubmission?.submission_context || '');
        setIsModalOpen(true);
    };

    const handleSubmitForReview = async (e) => {
        e.preventDefault();
        if (!selectedTask || !user) return;
        try {
            const { error } = await supabase.from('submissions').upsert({
                student_id: user.id, task_id: selectedTask.id, submission_context: submissionContext,
                status: 'Pending', rejection_reason: null
            }, { onConflict: 'student_id, task_id' });
            if (error) throw error;
            fetchData();
            setIsModalOpen(false);
        } catch (error) { console.error("Error submitting task:", error.message); }
    };

    if (loading) return <div className="min-h-screen bg-void flex justify-center items-center"><TerminalLoader text="INITIALIZING_NODE_INTERFACE..." /></div>;
    if (!user || !profile) return <div className="text-center py-20 text-sandstone-dim font-mono uppercase tracking-widest bg-void min-h-screen">NO_ACTIVE_SESSION</div>;

    const getSubmissionForTask = (taskId) => submissions.find(sub => sub.task_id === taskId);
    const myRank = leaderboard.findIndex(p => p.id === user?.id) + 1;
    const completedTasksCount = submissions.filter(s => s.status === 'Approved').length;

    return (
        <div className="bg-void min-h-screen pb-20 pt-20 relative">
            
            {/* Background Grid */}
            <div className="absolute inset-0 axis-grid-bg opacity-20 pointer-events-none fixed"></div>

            {/* Welcome Banner */}
            <div className="relative border-b border-border bg-obsidian-soft/80 backdrop-blur-md pb-12 pt-12 px-4">
                <div className="max-w-6xl mx-auto flex items-center gap-x-6 relative z-10 animate-fade-in">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-obsidian border border-cyan flex items-center justify-center text-3xl font-display font-bold text-cyan shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                        {(profile.full_name || user.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <TerminalLabel prefix=">">NODE_ID // {profile.full_name?.toUpperCase() || 'AMBASSADOR'}</TerminalLabel>
                        <h1 className="text-3xl sm:text-4xl font-display font-bold text-white uppercase tracking-wide mt-2">
                            Dashboard
                        </h1>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-10">
                
                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 animate-slide-in-up">
                    <AxisFrame variant="cyan" hover={true} className="!p-6 flex flex-col items-center text-center">
                        <TerminalLabel className="mb-2">GLOBAL_RANK</TerminalLabel>
                        <p className="text-4xl font-mono font-bold text-cyan">
                            {myRank > 0 ? (myRank < 10 ? `0${myRank}` : myRank) : '--'}
                        </p>
                    </AxisFrame>
                    
                    <AxisFrame variant="amber" hover={true} className="!p-6 flex flex-col items-center text-center">
                        <TerminalLabel className="mb-2 text-amber">TOTAL_METRICS</TerminalLabel>
                        <p className="text-4xl font-mono font-bold text-amber">
                            <AnimatedCounter value={profile.points} />
                        </p>
                    </AxisFrame>

                    <AxisFrame variant="cyan" hover={true} className="!p-6 flex flex-col items-center text-center">
                        <TerminalLabel className="mb-2">TASKS_VERIFIED</TerminalLabel>
                        <p className="text-4xl font-mono font-bold text-cyan">
                            {completedTasksCount < 10 ? `0${completedTasksCount}` : completedTasksCount}<span className="text-xl text-sandstone-dim opacity-50 ml-1">/{tasks.length < 10 ? `0${tasks.length}` : tasks.length}</span>
                        </p>
                    </AxisFrame>
                </div>

                {/* Tasks Section */}
                <div>
                    <div className="mb-6 flex items-center justify-between">
                        <TerminalLabel prefix=">">ACTIVE_DIRECTIVES</TerminalLabel>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tasks.length === 0 ? (
                            <div className="col-span-full border border-border bg-obsidian-soft p-12 text-center flex flex-col items-center">
                                <TerminalLabel prefix=">">STATUS_REPORT</TerminalLabel>
                                <p className="text-sandstone-dim font-mono text-sm mt-4 uppercase tracking-widest">No directives assigned to this node.</p>
                            </div>
                        ) : (
                            tasks.map((task, index) => {
                                const status = getSubmissionForTask(task.id)?.status || 'Not Submitted';
                                const isNew = task.id > lastSeenTaskId;
                                const isVerified = status === 'Approved';
                                const isPending = status === 'Pending';
                                
                                const frameVariant = isVerified ? "cyan" : isPending ? "amber" : "cyan";
                                
                                return (
                                    <div 
                                        key={task.id} 
                                        onClick={() => handleTaskClick(task)} 
                                        className={clsx("group cursor-pointer animate-fade-in-up border transition-all duration-300 relative overflow-hidden", isVerified ? "border-cyan/30 bg-cyan/5 hover:bg-cyan/10" : isPending ? "border-amber/50 bg-amber/5 hover:bg-amber/10" : "border-border bg-obsidian hover:border-cyan/50 hover:bg-obsidian-soft")}
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        {/* Accent bar */}
                                        <div className={clsx("absolute left-0 top-0 bottom-0 w-1 transition-all", isVerified ? "bg-cyan opacity-50" : isPending ? "bg-amber" : "bg-border group-hover:bg-cyan group-hover:opacity-50")}></div>
                                        
                                        <div className="p-5 pl-6 flex flex-col h-full">
                                            <div className="flex justify-between items-start mb-2 gap-4">
                                                <div className="flex items-center gap-3">
                                                    {isNew && <span className="inline-block w-2 h-2 rounded-full bg-amber animate-pulse"></span>}
                                                    <h3 className={clsx("text-base font-display font-bold uppercase tracking-wide line-clamp-1 transition-colors", isVerified ? "text-cyan" : isPending ? "text-amber" : "text-white group-hover:text-cyan")}>{task.title}</h3>
                                                </div>
                                                <span className={clsx("font-mono font-bold text-sm shrink-0", isPending ? "text-amber" : "text-cyan")}>+{task.points}</span>
                                            </div>
                                            
                                            <p className="text-sm font-mono text-sandstone-dim line-clamp-2 mb-6 group-hover:text-sandstone transition-colors">{task.description}</p>
                                            
                                            <div className="flex justify-between items-center mt-auto pt-4 border-t border-border/50">
                                                <StatusBadge status={status} />
                                                <Crosshair size={12} className={clsx("opacity-30 transition-all", isVerified ? "text-cyan" : isPending ? "text-amber" : "text-cyan group-hover:opacity-100 group-hover:rotate-90")} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-void/90 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in" onClick={() => setIsModalOpen(false)}>
                    <AxisFrame variant={getSubmissionForTask(selectedTask?.id)?.status === 'Approved' ? 'cyan' : 'amber'} className="!p-0 w-full max-w-lg max-h-[90vh] flex flex-col relative overflow-hidden" onClick={e => e.stopPropagation()}>
                        
                        <div className={clsx("px-6 py-4 flex justify-between items-center border-b", getSubmissionForTask(selectedTask?.id)?.status === 'Approved' ? 'border-cyan/30 bg-cyan/10' : 'border-amber/30 bg-amber/10')}>
                            <TerminalLabel prefix=">">{getSubmissionForTask(selectedTask?.id)?.status === 'Approved' ? 'DIRECTIVE_VERIFIED' : 'EXECUTE_DIRECTIVE'}</TerminalLabel>
                            <button onClick={() => setIsModalOpen(false)} className={clsx("text-xl hover:scale-110 transition-transform", getSubmissionForTask(selectedTask?.id)?.status === 'Approved' ? 'text-cyan' : 'text-amber')}>×</button>
                        </div>

                        <div className="p-6 overflow-y-auto shrink bg-obsidian">
                            <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
                                <h3 className="text-xl font-display font-bold text-white uppercase">{selectedTask?.title}</h3>
                                <span className={clsx("font-mono font-bold", getSubmissionForTask(selectedTask?.id)?.status === 'Approved' ? 'text-cyan' : 'text-amber')}>+{selectedTask?.points}</span>
                            </div>
                            
                            <p className="text-sm font-mono text-sandstone bg-obsidian-soft border border-border p-4 leading-relaxed mb-6 whitespace-pre-wrap">
                                {selectedTask?.description || "No description provided."}
                            </p>

                            {getSubmissionForTask(selectedTask?.id)?.status === 'Rejected' && (
                                <div className="mb-6 p-4 border border-danger/50 bg-danger/10 flex items-start">
                                    <span className="text-danger font-mono font-bold mr-3">{'>'}</span>
                                    <div>
                                        <h4 className="font-mono font-bold text-danger text-sm uppercase">SUBMISSION_REJECTED</h4>
                                        <p className="text-xs mt-1 text-danger/80 font-mono">REASON: {getSubmissionForTask(selectedTask?.id)?.rejection_reason}</p>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmitForReview}>
                                <div>
                                    <label htmlFor="submission" className="block text-xs font-mono font-bold tracking-widest uppercase text-sandstone mb-2">PROOF_OF_EXECUTION</label>
                                    <p className="text-[10px] font-mono text-sandstone-dim uppercase mb-3">Provide URI links or plain text describing execution.</p>
                                    <textarea 
                                        id="submission" 
                                        rows="4" 
                                        required 
                                        value={submissionContext} 
                                        onChange={(e) => setSubmissionContext(e.target.value)} 
                                        className="w-full bg-void border border-border p-4 focus:border-amber outline-none transition-all text-sm font-mono text-white placeholder-sandstone-dim focus:shadow-[0_0_15px_rgba(255,158,0,0.2)] disabled:opacity-50"
                                        placeholder="Input parameters..."
                                        disabled={['Approved', 'Pending'].includes(getSubmissionForTask(selectedTask?.id)?.status)}
                                    ></textarea>
                                </div>
                                <div className="mt-6 flex justify-end gap-x-4">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest text-sandstone hover:text-white transition-colors">ABORT</button>
                                    <button 
                                        type="submit" 
                                        disabled={['Approved', 'Pending'].includes(getSubmissionForTask(selectedTask?.id)?.status)} 
                                        className={clsx("px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-2 transition-all disabled:opacity-50", ['Approved', 'Pending'].includes(getSubmissionForTask(selectedTask?.id)?.status) ? "bg-obsidian-soft border border-border text-sandstone-dim" : "bg-amber text-void hover:bg-amber-bright shadow-[0_0_15px_rgba(255,158,0,0.4)]")}
                                    >
                                        { getSubmissionForTask(selectedTask?.id)?.status === 'Approved' ? 'VERIFIED' : getSubmissionForTask(selectedTask?.id)?.status === 'Pending' ? 'PENDING' : 'TRANSMIT' }
                                        {!['Approved', 'Pending'].includes(getSubmissionForTask(selectedTask?.id)?.status) && <Crosshair size={10} className="opacity-50" />}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </AxisFrame>
                </div>
            )}
        </div>
    );
}

export default MyDashboardPage;