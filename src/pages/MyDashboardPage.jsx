import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';
import { AxisFrame } from '../components/motifs/AxisFrame';
import { TerminalLabel } from '../components/motifs/TerminalLabel';
import { TerminalLoader } from '../components/motifs/TerminalLoader';
import { Crosshair } from '../components/motifs/Crosshair';
import { clsx } from 'clsx';

const StatusBadge = ({ status }) => {
    const format = {
        'approved': { text: '[ VERIFIED ]', color: 'text-cyan' },
        'pending': { text: '[ PENDING ]', color: 'text-amber' },
        'needs_revision': { text: '[ REVISION ]', color: 'text-amber' },
        'rejected': { text: '[ REJECTED ]', color: 'text-danger' },
        'not_submitted': { text: '[ UNASSIGNED ]', color: 'text-sandstone-dim' },
    };
    const { text, color } = format[status] || format['not_submitted'];
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
    const [referrerCode, setReferrerCode] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [myRank, setMyRank] = useState(0);
    const [caThreshold, setCaThreshold] = useState(1000);
    const [loading, setLoading] = useState(true);
    const [lastSeenTaskId, setLastSeenTaskId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [driveLink, setDriveLink] = useState('');
    const [submissionContext, setSubmissionContext] = useState('');

    const fetchData = useCallback(async () => {
        if (!user) { setLoading(false); return; }
        try {
            setLoading(true);
            const seenId = localStorage.getItem('lastSeenTaskId');
            setLastSeenTaskId(seenId ? parseInt(seenId) : 0);

            // Fetch profile including referral fields, domain_id, and campus_ambassador
            const { data: profileData } = await supabase
                .from('profiles')
                .select('full_name, total_points, referral_code, referred_by, domain_id, campus_ambassador')
                .eq('id', user.id).single();
            setProfile(profileData);

            if (profileData && profileData.referred_by) {
                const { data: refData } = await supabase
                    .from('profiles')
                    .select('referral_code')
                    .eq('id', profileData.referred_by).single();
                if (refData) setReferrerCode(refData.referral_code);
            }

            // Fetch tasks filtered by domain_id and deadline
            const today = new Date().toISOString().split('T')[0];
            
            // Try PostgREST OR approach first
            let fetchedTasks = [];
            const { data: tasksData, error: tasksError } = await supabase
                .from('tasks')
                .select('*')
                .or(`domain_id.eq.${profileData.domain_id},domain_id.is.null`)
                .or(`deadline.is.null,deadline.gt.${today}`)
                .order('id', { ascending: false });
                
            if (!tasksError && tasksData) {
                fetchedTasks = tasksData;
            } else {
                console.warn("PostgREST OR query failed, falling back to client-side filter", tasksError);
                // Fallback: client-side filtering
                const { data: fallbackTasks } = await supabase
                    .from('tasks')
                    .select('*')
                    .or(`domain_id.eq.${profileData.domain_id},domain_id.is.null`)
                    .order('id', { ascending: false });
                    
                if (fallbackTasks) {
                    fetchedTasks = fallbackTasks.filter(t => !t.deadline || t.deadline > today);
                }
            }
            
            setTasks(fetchedTasks);

            // get_my_rank is not in the current DB schema.
            // Use get_local_leaderboard which returns the user's rank via is_current_user.
            const { data: leaderboardData } = await supabase.rpc('get_local_leaderboard');
            if (leaderboardData) {
                const myRow = leaderboardData.find(r => r.is_current_user);
                if (myRow) setMyRank(myRow.rank);
            }

            const { data: settingsData } = await supabase.from('program_settings').select('campus_ambassador_threshold').maybeSingle();
            if (settingsData) setCaThreshold(settingsData.campus_ambassador_threshold);

            const { data: submissionsData } = await supabase.from('submissions').select('*').eq('student_id', user.id);
            setSubmissions(submissionsData || []);

            if (fetchedTasks && fetchedTasks.length > 0) {
                localStorage.setItem('lastSeenTaskId', fetchedTasks[0].id.toString());
            }
        } catch (error) { console.error("Error fetching data:", error.message); }
        finally { setLoading(false); }
    }, [user]);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isModalOpen]);

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        const existingSubmission = submissions.find(s => s.task_id === task.id);
        setDriveLink(existingSubmission?.drive_link || '');
        setSubmissionContext(existingSubmission?.submission_context || '');
        setIsModalOpen(true);
    };

    // UX-only deadline check. This does NOT provide database-level security.
    const isTaskExpired = (task) => {
        if (!task?.deadline) return false;
        const today = new Date().toISOString().split('T')[0];
        return task.deadline <= today;
    };

    const handleSubmitForReview = async (e) => {
        e.preventDefault();
        if (!selectedTask || !user) return;
        if (isTaskExpired(selectedTask)) {
            alert('This task\'s deadline has passed. Submissions are no longer accepted.');
            return;
        }
        if (driveLink && !driveLink.startsWith('http')) {
            alert('A valid HTTP link is required if provided.');
            return;
        }
        try {
            const { error } = await supabase.from('submissions').upsert({
                student_id: user.id, 
                task_id: selectedTask.id, 
                drive_link: driveLink || null,
                submission_context: submissionContext || null,
                status: 'pending'
            }, { onConflict: 'student_id, task_id' });
            if (error) throw error;
            fetchData();
            setIsModalOpen(false);
        } catch (error) { console.error("Error submitting task:", error.message); }
    };

    if (loading) return <div className="min-h-screen bg-void flex justify-center items-center"><TerminalLoader text="INITIALIZING_NODE_INTERFACE..." /></div>;
    if (!user || !profile) return <div className="text-center py-20 text-sandstone-dim font-mono uppercase tracking-widest bg-void min-h-screen">Not logged in</div>;

    const getSubmissionForTask = (taskId) => submissions.find(sub => sub.task_id === taskId);
    const completedTasksCount = submissions.filter(s => s.status === 'approved').length;

    return (
        <div className="bg-void min-h-screen pb-20 pt-20 relative">

            {/* Background Grid */}
            <div className="absolute inset-0 axis-grid-bg opacity-20 pointer-events-none fixed"></div>

            {/* Welcome Banner */}
            <div className="relative border-b border-border bg-obsidian-soft/80 backdrop-blur-md pb-12 pt-12 px-4">
                <div className="max-w-6xl mx-auto flex items-center gap-3 sm:gap-6 relative z-10 animate-fade-in">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-obsidian border border-cyan flex items-center justify-center text-2xl sm:text-3xl font-display font-bold text-cyan shadow-[0_0_15px_rgba(0,240,255,0.2)] shrink-0">
                        {(profile.full_name || user.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <TerminalLabel prefix=">">{profile.full_name?.toUpperCase() || 'AMBASSADOR'}</TerminalLabel>
                        <h1 className="text-2xl sm:text-4xl font-display font-bold text-white uppercase tracking-wide mt-2 flex flex-wrap items-center gap-2 sm:gap-3">
                            Dashboard
                            {profile.campus_ambassador && (
                                <span className="text-[10px] sm:text-xs bg-amber text-void px-2 py-1 font-mono tracking-widest translate-y-0 sm:translate-y-1 shrink-0">CAMPUS AMBASSADOR</span>
                            )}
                        </h1>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-10">

                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-slide-in-up">
                    <AxisFrame variant="cyan" hover={true} className="!p-6 flex flex-col items-center text-center">
                        <TerminalLabel className="mb-2">GLOBAL_RANK</TerminalLabel>
                        <p className="text-4xl font-mono font-bold text-cyan">
                            {myRank > 0 ? (myRank < 10 ? `0${myRank}` : myRank) : '--'}
                        </p>
                    </AxisFrame>

                    <AxisFrame variant="amber" hover={true} className="!p-6 flex flex-col items-center text-center relative overflow-hidden">
                        <TerminalLabel className="mb-2 text-amber">Total Points</TerminalLabel>
                        <p className="text-4xl font-mono font-bold text-amber relative z-10">
                            <AnimatedCounter value={Number(profile.total_points)} />
                        </p>
                        {!profile.campus_ambassador && (
                            <div className="mt-4 w-full max-w-[200px] z-10">
                                <div className="flex justify-between text-[10px] font-mono text-amber mb-1">
                                    <span>CA Progress</span>
                                    <span>{Math.floor((Number(profile.total_points) / caThreshold) * 100)}%</span>
                                </div>
                                <div className="h-1 bg-void border border-amber/30 w-full overflow-hidden">
                                    <div className="h-full bg-amber transition-all duration-1000" style={{ width: `${Math.min(100, (Number(profile.total_points) / caThreshold) * 100)}%` }}></div>
                                </div>
                            </div>
                        )}
                        {profile.campus_ambassador && (
                            <div className="absolute inset-0 bg-amber/5 pointer-events-none"></div>
                        )}
                    </AxisFrame>

                    <AxisFrame variant="cyan" hover={true} className="!p-6 flex flex-col items-center text-center">
                        <TerminalLabel className="mb-2">TASKS_VERIFIED</TerminalLabel>
                        <p className="text-4xl font-mono font-bold text-cyan">
                            {completedTasksCount < 10 ? `0${completedTasksCount}` : completedTasksCount}<span className="text-xl text-sandstone-dim opacity-50 ml-1">/{tasks.length < 10 ? `0${tasks.length}` : tasks.length}</span>
                        </p>
                    </AxisFrame>
                </div>
                
                {/* Referral Display */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12 animate-slide-in-up" style={{ animationDelay: '100ms' }}>
                    <AxisFrame variant="cyan" className="!p-6 flex flex-col justify-center">
                        <TerminalLabel className="mb-3">YOUR REFERRAL CODE</TerminalLabel>
                        <div className="bg-void border border-border p-4 text-center flex-grow flex items-center justify-center overflow-hidden">
                            <span className="text-lg sm:text-2xl font-mono font-bold text-white tracking-widest break-all">{profile.referral_code || 'UNASSIGNED'}</span>
                        </div>
                    </AxisFrame>
                    <AxisFrame variant={profile.referred_by ? "cyan" : "default"} className="!p-6 flex flex-col justify-center">
                        <TerminalLabel className="mb-3">REFERRAL USED</TerminalLabel>
                        <div className={clsx("border p-4 text-center flex-grow flex items-center justify-center overflow-hidden", profile.referred_by ? "bg-void border-border" : "bg-obsidian border-transparent opacity-50")}>
                            <span className={clsx("text-base sm:text-xl font-mono tracking-widest break-all", profile.referred_by ? "text-white font-bold" : "text-sandstone-dim")}>
                                {profile.referred_by ? (referrerCode || 'Loading...') : 'No referral code used'}
                            </span>
                        </div>
                    </AxisFrame>
                </div>

                {/* Tasks Section */}
                <div>
                    <div className="mb-6 flex items-center justify-between">
                        <TerminalLabel prefix=">">Your Tasks</TerminalLabel>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tasks.length === 0 ? (
                            <div className="col-span-full border border-border bg-obsidian-soft p-12 text-center flex flex-col items-center">
                                <TerminalLabel prefix=">">STATUS_REPORT</TerminalLabel>
                                <p className="text-sandstone-dim font-mono text-sm mt-4 uppercase tracking-widest">No tasks assigned yet.</p>
                            </div>
                        ) : (
                            tasks.map((task, index) => {
                                const status = getSubmissionForTask(task.id)?.status || 'not_submitted';
                                const isNew = task.id > lastSeenTaskId;
                                const isVerified = status === 'approved';
                                const isPending = status === 'pending';

                                return (
                                    <div
                                        key={task.id}
                                        onClick={() => handleTaskClick(task)}
                                        className={clsx("group cursor-pointer animate-fade-in-up border transition-all duration-300 relative overflow-hidden flex flex-col", isVerified ? "border-cyan/30 bg-cyan/5 hover:bg-cyan/10" : isPending ? "border-amber/50 bg-amber/5 hover:bg-amber/10" : "border-border bg-obsidian hover:border-cyan/50 hover:bg-obsidian-soft")}
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        {/* Accent bar */}
                                        <div className={clsx("absolute left-0 top-0 bottom-0 w-1 transition-all", isVerified ? "bg-cyan opacity-50" : isPending ? "bg-amber" : "bg-border group-hover:bg-cyan group-hover:opacity-50")}></div>

                                        <div className="p-5 pl-6 flex flex-col h-full flex-grow">
                                            <div className="flex justify-between items-start mb-2 gap-4">
                                                <div className="flex items-center gap-3">
                                                    {isNew && <span className="inline-block w-2 h-2 rounded-full bg-amber animate-pulse"></span>}
                                                    <h3 className={clsx("text-base font-display font-bold uppercase tracking-wide line-clamp-1 transition-colors break-words", isVerified ? "text-cyan" : isPending ? "text-amber" : "text-white group-hover:text-cyan")}>{task.title}</h3>
                                                </div>
                                                <span className={clsx("font-mono font-bold text-sm shrink-0", isPending ? "text-amber" : "text-cyan")}>+{Number(task.points)}</span>
                                            </div>

                                            <p className="text-sm font-mono text-sandstone-dim line-clamp-2 mb-6 group-hover:text-sandstone transition-colors flex-grow break-words">{task.description}</p>

                                            <div className="flex justify-between items-center mt-auto pt-4 border-t border-border/50 shrink-0">
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
                    <AxisFrame variant={getSubmissionForTask(selectedTask?.id)?.status === 'approved' ? 'cyan' : 'amber'} className="!p-0 w-full max-w-lg max-h-[90vh] flex flex-col relative overflow-hidden" onClick={e => e.stopPropagation()}>

                        <div className={clsx("px-6 py-4 flex justify-between items-center border-b shrink-0", getSubmissionForTask(selectedTask?.id)?.status === 'approved' ? 'border-cyan/30 bg-cyan/10' : 'border-amber/30 bg-amber/10')}>
                            <TerminalLabel prefix=">">{getSubmissionForTask(selectedTask?.id)?.status === 'approved' ? 'DIRECTIVE_VERIFIED' : 'EXECUTE_DIRECTIVE'}</TerminalLabel>
                            <button onClick={() => setIsModalOpen(false)} className={clsx("text-xl hover:scale-110 transition-transform", getSubmissionForTask(selectedTask?.id)?.status === 'approved' ? 'text-cyan' : 'text-amber')}>×</button>
                        </div>

                        <form onSubmit={handleSubmitForReview} className="flex flex-col flex-1 min-h-0 bg-obsidian">
                            <div className="p-6 overflow-y-auto overscroll-contain flex-1 min-h-0">
                                <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
                                    <h3 className="text-xl font-display font-bold text-white uppercase">{selectedTask?.title}</h3>
                                    <span className={clsx("font-mono font-bold", getSubmissionForTask(selectedTask?.id)?.status === 'approved' ? 'text-cyan' : 'text-amber')}>+{Number(selectedTask?.points)}</span>
                                </div>
                                
                                {selectedTask?.deadline && (
                                    <div className="mb-4">
                                        <span className="text-xs font-mono font-bold tracking-widest uppercase text-sandstone">Deadline: </span>
                                        <span className={clsx("text-xs font-mono", isTaskExpired(selectedTask) ? 'text-danger' : 'text-white')}>
                                            {new Date(selectedTask.deadline + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                        {isTaskExpired(selectedTask) && (
                                            <span className="ml-2 text-[10px] font-mono font-bold text-danger uppercase tracking-widest">[ EXPIRED ]</span>
                                        )}
                                    </div>
                                )}

                                <p className="text-sm font-mono text-sandstone bg-obsidian-soft border border-border p-4 leading-relaxed mb-6 whitespace-pre-wrap">
                                    {selectedTask?.description || "No description provided."}
                                </p>
                                
                                {selectedTask?.instructions && (
                                    <div className="mb-6">
                                        <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-cyan mb-2">Instructions</h4>
                                        <p className="text-sm font-mono text-sandstone whitespace-pre-wrap">{selectedTask.instructions}</p>
                                    </div>
                                )}

                                {['rejected', 'needs_revision'].includes(getSubmissionForTask(selectedTask?.id)?.status) && (
                                    <div className="mb-6 p-4 border border-danger/50 bg-danger/10 flex items-start">
                                        <span className="text-danger font-mono font-bold mr-3">{'>'}</span>
                                        <div>
                                            <h4 className="font-mono font-bold text-danger text-sm uppercase">ADMIN_FEEDBACK</h4>
                                            <p className="text-xs mt-1 text-danger/80 font-mono">REASON: {getSubmissionForTask(selectedTask?.id)?.reviewer_notes || getSubmissionForTask(selectedTask?.id)?.rejection_reason}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="mb-4">
                                    <label htmlFor="driveLink" className="block text-xs font-mono font-bold tracking-widest uppercase text-sandstone mb-2">Submission Link</label>
                                    <p className="text-[10px] font-mono text-sandstone-dim uppercase mb-3">Provide HTTP link to your work if required.</p>
                                    <input
                                        type="url"
                                        id="driveLink"
                                        value={driveLink}
                                        onChange={(e) => setDriveLink(e.target.value)}
                                        className="w-full bg-void border border-border p-4 focus:border-amber outline-none transition-all text-sm font-mono text-white placeholder-sandstone-dim focus:shadow-[0_0_15px_rgba(255,158,0,0.2)] disabled:opacity-50"
                                        placeholder="https://..."
                                        disabled={['approved', 'pending', 'rejected'].includes(getSubmissionForTask(selectedTask?.id)?.status) || isTaskExpired(selectedTask)}
                                    />
                                </div>
                                <div className="mb-6">
                                    <label htmlFor="submissionContext" className="block text-xs font-mono font-bold tracking-widest uppercase text-sandstone mb-2">Context / Notes</label>
                                    <p className="text-[10px] font-mono text-sandstone-dim uppercase mb-3">Provide any additional text or context.</p>
                                    <textarea
                                        id="submissionContext"
                                        value={submissionContext}
                                        onChange={(e) => setSubmissionContext(e.target.value)}
                                        className="w-full bg-void border border-border p-4 focus:border-amber outline-none transition-all text-sm font-mono text-white placeholder-sandstone-dim focus:shadow-[0_0_15px_rgba(255,158,0,0.2)] disabled:opacity-50 resize-y"
                                        placeholder="I completed this by..."
                                        rows={3}
                                        disabled={['approved', 'pending', 'rejected'].includes(getSubmissionForTask(selectedTask?.id)?.status) || isTaskExpired(selectedTask)}
                                    />
                                </div>
                            </div>
                            <div className="p-6 pt-4 border-t border-border bg-obsidian shrink-0 flex flex-wrap sm:flex-nowrap justify-end gap-2 sm:gap-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest text-sandstone hover:text-white transition-colors">ABORT</button>
                                <button
                                    type="submit"
                                    disabled={['approved', 'pending', 'rejected'].includes(getSubmissionForTask(selectedTask?.id)?.status) || isTaskExpired(selectedTask)}
                                    className={clsx("w-full sm:w-auto px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest flex justify-center items-center gap-2 transition-all disabled:opacity-50", ['approved', 'pending', 'rejected'].includes(getSubmissionForTask(selectedTask?.id)?.status) || isTaskExpired(selectedTask) ? "bg-obsidian-soft border border-border text-sandstone-dim" : "bg-amber text-void hover:bg-amber-bright shadow-[0_0_15px_rgba(255,158,0,0.4)]")}
                                >
                                    {getSubmissionForTask(selectedTask?.id)?.status === 'approved' ? 'VERIFIED' : getSubmissionForTask(selectedTask?.id)?.status === 'pending' ? 'PENDING' : getSubmissionForTask(selectedTask?.id)?.status === 'rejected' ? 'REJECTED' : getSubmissionForTask(selectedTask?.id)?.status === 'needs_revision' ? 'Resubmit' : 'Submit'}
                                    {!['approved', 'pending', 'rejected'].includes(getSubmissionForTask(selectedTask?.id)?.status) && <Crosshair size={10} className="opacity-50" />}
                                </button>
                            </div>
                        </form>
                    </AxisFrame>
                </div>
            )}
        </div>
    );
}

export default MyDashboardPage;