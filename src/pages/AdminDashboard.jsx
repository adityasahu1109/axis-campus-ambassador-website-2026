import React, { useState, useEffect, useCallback } from 'react';
import { usePaginatedQuery } from '../hooks/usePaginatedQuery';
import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { AxisFrame } from '../components/motifs/AxisFrame';
import { TerminalLabel } from '../components/motifs/TerminalLabel';
import { TerminalLoader } from '../components/motifs/TerminalLoader';
import { PaginationControls } from '../components/PaginationControls';
import { Crosshair } from '../components/motifs/Crosshair';
import { clsx } from 'clsx';
import { SubmissionReviewModal } from '../components/SubmissionReviewModal';
import { PiUsers, PiClockClockwise, PiClipboardText, PiChartLineUp, PiCheckCircle } from 'react-icons/pi';

export const Modal = ({ children, onClose, title, variant = "cyan", footer }) => {
    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-void/90 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
            <AxisFrame variant={variant} className="!p-0 w-full max-w-2xl max-h-[90vh] flex flex-col relative overflow-hidden" innerClassName="flex flex-col flex-1 min-h-0" onClick={e => e.stopPropagation()}>
                <div className={clsx("px-6 py-4 flex justify-between items-center border-b shrink-0", variant === "cyan" ? "border-cyan/30 bg-cyan/10" : "border-danger/30 bg-danger/10")}>
                    <TerminalLabel prefix=">">{title}</TerminalLabel>
                    <button onClick={onClose} className={clsx("text-xl hover:scale-110 transition-transform", variant === "cyan" ? "text-cyan" : "text-danger")}>×</button>
                </div>
                <div className="p-6 overflow-y-auto overscroll-contain flex-1 min-h-0 bg-obsidian text-sandstone terminal-scrollbar">
                    {children}
                </div>
                {footer && (
                    <div className="p-6 pt-4 border-t border-border bg-obsidian shrink-0 flex flex-wrap justify-end gap-4">
                        {footer}
                    </div>
                )}
            </AxisFrame>
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const format = {
        'approved': { text: '[ VERIFIED ]', color: 'text-cyan' },
        'pending': { text: '[ PENDING ]', color: 'text-amber' },
        'needs_revision': { text: '[ REVISION ]', color: 'text-amber' },
        'rejected': { text: '[ REJECTED ]', color: 'text-danger' },
    };
    const { text, color } = format[status] || { text: `[ ${status?.toUpperCase()} ]`, color: 'text-sandstone' };
    return <span className={clsx("font-mono text-xs font-bold uppercase tracking-widest", color)}>{text}</span>;
};

export const InputField = ({ label, type = "text", value, onChange, required, multiline = false, step, error }) => (
    <div className="mb-6 group relative">
        <label className="block mb-2 text-xs font-mono font-bold tracking-widest uppercase text-sandstone group-focus-within:text-cyan transition-colors">{label}</label>
        {multiline ? (
            <textarea 
                value={value} 
                onChange={onChange} 
                required={required} 
                rows="4" 
                className={clsx("w-full bg-void border p-4 outline-none transition-all text-sm font-mono text-white placeholder-sandstone-dim", error ? "border-danger focus:border-danger focus:shadow-[0_0_15px_rgba(255,0,0,0.2)]" : "border-border focus:border-cyan focus:shadow-[0_0_15px_rgba(0,240,255,0.2)]")}
            />
        ) : (
            <input 
                type={type}
                value={value} 
                onChange={onChange} 
                required={required} 
                step={step}
                className={clsx("w-full bg-void border p-3 outline-none transition-all text-sm font-mono text-white placeholder-sandstone-dim", error ? "border-danger focus:border-danger focus:shadow-[0_0_15px_rgba(255,0,0,0.2)]" : "border-border focus:border-cyan focus:shadow-[0_0_15px_rgba(0,240,255,0.2)]", type === 'date' && "[color-scheme:dark]")}
            />
        )}
        {error && <span className="absolute -bottom-5 left-0 text-[10px] text-danger font-mono uppercase tracking-widest">{error}</span>}
    </div>
);

function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ tasksCount: 0, students: 0, pendingSubs: 0, thisWeekSubs: 0, totalSubs: 0 });
  const [domainsList, setDomainsList] = useState([]);
  const [programSettings, setProgramSettings] = useState({ campus_ambassador_threshold: 1000, referral_reward_points: 100 });
  const [modals, setModals] = useState({ create: false, edit: false, delete: false, review: false, announce: false, deleteAnnounce: false });
  const [selectedItem, setSelectedItem] = useState(null);
  const [metricsError, setMetricsError] = useState("");
  
  // Adjusted for new schema
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    instructions: '',
    points: 0, 
    domain_id: '',
    deadline: '',
    content: '' // for announcements
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [tasksRes, studentsRes, pendingSubsRes, thisWeekSubsRes, totalSubsRes, domainsRes, settingsRes] = await Promise.all([
        supabase.from('tasks').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('submissions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('submissions').select('id', { count: 'exact', head: true }).gte('submitted_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('submissions').select('id', { count: 'exact', head: true }),
        supabase.from('domains').select('id, name'),
        supabase.from('program_settings').select('*').single()
      ]);
      setStats({
          tasksCount: tasksRes.count || 0,
          students: studentsRes.count || 0,
          pendingSubs: pendingSubsRes.count || 0,
          thisWeekSubs: thisWeekSubsRes.count || 0,
          totalSubs: totalSubsRes.count || 0,
      });
      if (domainsRes.data) setDomainsList(domainsRes.data);
      if (settingsRes.data) setProgramSettings(settingsRes.data);
    } catch (error) { console.error('Error fetching data:', error.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const studentsQuery = usePaginatedQuery('profiles', '*', 25, { filters: { role: 'student' } });
  
  // Note: submission needs tasks(id, title, description, instructions, points, deadline)
  const submissionsQuery = usePaginatedQuery(
      'submissions', 
      '*, profiles!submissions_student_id_fkey(full_name, id, college), tasks!inner(id, title, description, instructions, points, deadline)', 
      25, 
      { 
          orderBy: { column: 'submitted_at', ascending: false }
      }
  );

  const tasksQuery = usePaginatedQuery(
      'tasks', 
      '*', 
      50, 
      { 
          orderBy: { column: 'created_at', ascending: false }
      }
  );

  const announcementsQuery = usePaginatedQuery('announcements', '*', 25, { orderBy: { column: 'created_at', ascending: false } });

  const getDomainName = (id) => {
      if (!id) return 'Global';
      const d = domainsList.find(d => d.id === id);
      return d ? d.name : id;
  };

  const handleCreate = async (e, type) => {
    e.preventDefault();
    if (!user) {
        alert("Authentication error: You must be logged in to perform this action.");
        return;
    }
    try {
      if (type === 'task') {
        const pointsStr = String(formData.points).trim();
        if (!/^\d+$/.test(pointsStr)) {
            setMetricsError("Reward Metrics must be a whole number.");
            return;
        }
        const parsedPoints = Number(pointsStr);

        const { error } = await supabase.from('tasks').insert({ 
            title: formData.title, 
            description: formData.description, 
            instructions: formData.instructions || null,
            points: parsedPoints,
            domain_id: formData.domain_id === "global" ? null : (formData.domain_id ? parseInt(formData.domain_id) : null),
            deadline: formData.deadline || null,
            created_by: user.id
        });
        if (error) throw error;
        
        const announcementTitle = "New Directive Active!";
        const announcementContent = `A new directive "${formData.title}" is available. Execute to earn ${parsedPoints} metrics.`;
        const { error: announceError } = await supabase.from('announcements').insert({ title: announcementTitle, content: announcementContent, author_id: user.id });
        if (announceError) console.error('Error auto-creating announcement:', announceError.message);
      } else if (type === 'announcement') {
        const { error } = await supabase.from('announcements').insert({ title: formData.title, content: formData.content, author_id: user.id });
        if (error) throw error;
      }
      fetchData(); 
      tasksQuery.refresh();
      announcementsQuery.refresh();
      setModals({ ...modals, create: false, announce: false });
      setFormData({ title: '', description: '', instructions: '', points: 0, domain_id: '', deadline: '', content: '' });
    } catch (error) { 
      console.error(`Error creating ${type}:`, error.message); 
      alert(`Error creating ${type}: ${error.message}`);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    const pointsStr = String(formData.points).trim();
    if (!/^\d+$/.test(pointsStr)) {
        setMetricsError("Reward Metrics must be a whole number.");
        return;
    }
    const parsedPoints = Number(pointsStr);

    try {
      const { error } = await supabase.from('tasks').update({ 
          title: formData.title, 
          description: formData.description, 
          instructions: formData.instructions || null,
          points: parsedPoints,
          domain_id: formData.domain_id === "global" ? null : (formData.domain_id ? parseInt(formData.domain_id) : null),
          deadline: formData.deadline || null
      }).eq('id', selectedItem.id);
      if (error) throw error;
      fetchData();
      tasksQuery.refresh();
      setModals({ ...modals, edit: false });
    } catch (error) { console.error('Error updating task:', error.message); }
  };

  const handleDelete = async (type) => {
    try {
      const { error } = await supabase.from(type).delete().eq('id', selectedItem.id);
      if (error) throw error;
      fetchData();
      if (type === 'announcements') announcementsQuery.refresh();
      if (type === 'tasks') tasksQuery.refresh();
      setModals({ ...modals, delete: false, deleteAnnounce: false });
    } catch (error) { console.error(`Error deleting ${type}:`, error.message); }
  };

  const handleReviewSubmit = async (decision, notes, pointsAwarded) => {
    if ((decision === 'needs_revision' || decision === 'rejected') && !notes) {
      alert("Feedback notes are required for this decision.");
      return;
    }
    try {
      const taskMaxPoints = selectedItem?.tasks?.points || 0;

      // Determine the review status and awarded_percentage for the DB RPC.
      // The DB is authoritative for calculating points_awarded from the percentage.
      let reviewStatus = decision;
      let percentage = null;

      if (decision === 'approved') {
        // DB overrides percentage to 1 for approved, but we pass it anyway.
        percentage = 1;
      } else if (decision === 'rejected' || decision === 'needs_revision') {
        // DB overrides percentage to 0 for these statuses.
        percentage = 0;
      } else {
        // Partial: compute percentage from the awarded points vs task max.
        percentage = taskMaxPoints > 0 ? pointsAwarded / taskMaxPoints : 0;
      }

      // If organizer chose 'approved' but awarded less than full points,
      // treat it as partially_accepted so the DB can store the correct percentage.
      if (decision === 'approved' && taskMaxPoints > 0 && pointsAwarded < taskMaxPoints) {
        reviewStatus = 'partially_accepted';
        percentage = pointsAwarded / taskMaxPoints;
      }

      const { error } = await supabase.rpc('review_submission', {
        target_submission_id: selectedItem.id,
        new_status: reviewStatus,
        review_notes: notes || null,
        awarded_percentage: percentage,
        rejection_reason_text: (reviewStatus === 'rejected' || reviewStatus === 'needs_revision') ? notes : null
      });
      if (error) throw error;
      fetchData();
      submissionsQuery.refresh();
      setModals({ ...modals, review: false });
    } catch (error) { 
      console.error(`Error with review decision ${decision}:`, error.message);
      alert(`Error: ${error.message}`);
    }
  };

  const handleSettingsUpdate = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('program_settings').upsert({
        id: 1,
        campus_ambassador_threshold: programSettings.campus_ambassador_threshold,
        referral_reward_points: programSettings.referral_reward_points,
        updated_by: user.id
      });
      if (error) throw error;
      alert("Settings updated successfully");
      fetchData();
    } catch (error) { console.error('Error updating settings:', error.message); alert(`Error: ${error.message}`); }
  };

  if (loading) return <div className="min-h-screen bg-void flex justify-center items-center"><TerminalLoader text="AETHEL_CORE_INITIALIZING..." /></div>;

  const TabButton = ({ name, label, count }) => (
    <button 
        onClick={() => setActiveTab(name)} 
        className={clsx('px-4 sm:px-6 py-2 sm:py-3 font-mono text-[10px] sm:text-xs uppercase tracking-widest transition-colors border whitespace-nowrap', activeTab === name ? 'bg-cyan/20 text-cyan border-cyan/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]' : 'bg-obsidian border-border text-sandstone-dim hover:text-sandstone')}
    >
        [ {label} {count !== undefined ? `(${count})` : ''} ]
    </button>
  );

  return (
    <div className="bg-void min-h-screen pb-20 pt-20 relative">
      
      {/* Background Grid */}
      <div className="absolute inset-0 axis-grid-bg opacity-30 pointer-events-none fixed"></div>

      {/* Header */}
      <div className="relative border-b border-border bg-obsidian-soft/80 backdrop-blur-md pb-12 pt-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10 animate-fade-in-up">
            <div>
                <TerminalLabel prefix=">">Admin Dashboard</TerminalLabel>
                <h1 className="text-4xl font-display font-black text-white tracking-widest uppercase mt-4">Admin Dashboard</h1>
                <p className="mt-2 text-sandstone-dim font-mono text-sm max-w-xl">Grid overview, node management, and directive authorization.</p>
            </div>
            <div className="flex gap-4">
                <div className="bg-obsidian border border-border p-4 flex flex-col items-center">
                    <span className="text-xs font-mono text-cyan uppercase tracking-widest mb-1">Pending_Reviews</span>
                    <span className="text-2xl font-mono font-bold text-white">{stats.pendingSubs}</span>
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-10">
        
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 animate-slide-in-up border-b border-border pb-4">
          <TabButton name="overview" label="Overview" />
          <TabButton name="submissions" label="Review Queue" count={stats.pendingSubs} />
          <TabButton name="tasks" label="Tasks" count={stats.tasksCount} />
          <TabButton name="students" label="Students" count={stats.students} />
          <TabButton name="announcements" label="Announcements" />
          <TabButton name="settings" label="Settings" />
        </div>

        <div className="animate-fade-in">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AxisFrame variant="cyan" hover className="flex flex-col items-center justify-center py-12 cursor-pointer group hover:bg-cyan/5 transition-all" onClick={() => setActiveTab('students')}>
                        <span className="flex items-center gap-2 text-xs font-mono text-cyan uppercase tracking-widest mb-2 text-center">
                            <PiUsers size={16} /> Active Students
                        </span>
                        <span className="text-4xl font-display font-black text-white group-hover:scale-105 transition-transform">{stats.students}</span>
                    </AxisFrame>
                    <AxisFrame variant="amber" hover className="flex flex-col items-center justify-center py-12 cursor-pointer group hover:bg-amber/5 transition-all" onClick={() => setActiveTab('submissions')}>
                        <span className="flex items-center gap-2 text-xs font-mono text-amber uppercase tracking-widest mb-2 text-center">
                            <PiClockClockwise size={16} /> Pending Reviews
                        </span>
                        <span className="text-4xl font-display font-black text-white group-hover:scale-105 transition-transform">{stats.pendingSubs}</span>
                    </AxisFrame>
                    <AxisFrame variant="cyan" hover className="flex flex-col items-center justify-center py-12 cursor-pointer group hover:bg-cyan/5 transition-all" onClick={() => setActiveTab('tasks')}>
                        <span className="flex items-center gap-2 text-xs font-mono text-cyan uppercase tracking-widest mb-2 text-center">
                            <PiClipboardText size={16} /> Active Tasks
                        </span>
                        <span className="text-4xl font-display font-black text-white group-hover:scale-105 transition-transform">{stats.tasksCount}</span>
                    </AxisFrame>
                    <AxisFrame variant="cyan" hover className="flex flex-col items-center justify-center py-12 cursor-pointer group hover:bg-cyan/5 transition-all" onClick={() => setActiveTab('submissions')}>
                        <span className="flex items-center gap-2 text-xs font-mono text-cyan uppercase tracking-widest mb-2 text-center">
                            <PiChartLineUp size={16} /> This Week Subs
                        </span>
                        <span className="text-4xl font-display font-black text-white group-hover:scale-105 transition-transform">{stats.thisWeekSubs}</span>
                    </AxisFrame>
                    <AxisFrame variant="cyan" hover className="flex flex-col items-center justify-center py-12 cursor-pointer group hover:bg-cyan/5 transition-all" onClick={() => setActiveTab('submissions')}>
                        <span className="flex items-center gap-2 text-xs font-mono text-cyan uppercase tracking-widest mb-2 text-center">
                            <PiCheckCircle size={16} /> Total Submissions
                        </span>
                        <span className="text-4xl font-display font-black text-white group-hover:scale-105 transition-transform">{stats.totalSubs}</span>
                    </AxisFrame>
                </div>
            )}
            {/* Submissions Tab */}
            {activeTab === 'submissions' && (
                <div>
                    <AxisFrame variant="cyan" className="!p-0 overflow-hidden">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left font-mono min-w-[800px]">
                            <thead className="bg-obsidian border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-sandstone uppercase tracking-widest">NODE_ID</th>
                                    <th className="px-6 py-4 text-xs font-bold text-sandstone uppercase tracking-widest">DIRECTIVE</th>
                                    <th className="px-6 py-4 text-xs font-bold text-sandstone uppercase tracking-widest">STATUS</th>
                                    <th className="px-6 py-4 text-xs font-bold text-sandstone uppercase tracking-widest text-right">ACTION</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border bg-obsidian-soft">
                                {submissionsQuery.loading ? (
                                    <tr><td colSpan="4" className="px-6 py-8 text-center text-sandstone-dim text-sm uppercase tracking-widest">LOADING...</td></tr>
                                ) : submissionsQuery.data.length === 0 ? (
                                    <tr><td colSpan="4" className="px-6 py-8 text-center text-sandstone-dim text-sm uppercase tracking-widest">No submissions yet</td></tr>
                                ) : (
                                    submissionsQuery.data.map(sub => (
                                    <tr key={sub.id} className="hover:bg-obsidian transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold text-white uppercase">{sub.profiles?.full_name}</td>
                                        <td className="px-6 py-4 text-sm text-sandstone max-w-xs truncate">{sub.tasks?.title}</td>
                                        <td className="px-6 py-4"><StatusBadge status={sub.status} /></td>
                                        <td className="px-6 py-4 text-right">
                                            {sub.status === 'pending' && (
                                                <button onClick={() => { setSelectedItem(sub); setModals({ ...modals, review: true }) }} className="inline-flex items-center gap-2 text-xs font-mono font-bold text-void bg-cyan hover:bg-cyan-soft px-4 py-2 uppercase tracking-widest transition-colors shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                                                    REVIEW
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        <PaginationControls query={submissionsQuery} />
                    </div>
                </AxisFrame>
                </div>
            )}

            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
                <div>
                    <div className="flex justify-end mb-6">
                        <button onClick={() => { 
                          setFormData({ title: '', description: '', instructions: '', points: 0, domain_id: '', deadline: '' }); 
                          setModals({ ...modals, create: true }) 
                        }} className="inline-flex items-center gap-2 text-xs font-mono font-bold text-void bg-cyan hover:bg-cyan-soft px-6 py-3 uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                            + Add Task
                        </button>
                    </div>
                    <AxisFrame variant="cyan" className="!p-0 overflow-hidden">
                        <div className="overflow-x-auto w-full">
                            <table className="w-full text-left font-mono min-w-[900px]">
                                <thead className="bg-obsidian border-b border-border">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-sandstone uppercase tracking-widest">TITLE</th>
                                        <th className="px-6 py-4 text-xs font-bold text-sandstone uppercase tracking-widest">DOMAIN</th>
                                        <th className="px-6 py-4 text-xs font-bold text-sandstone uppercase tracking-widest">METRICS</th>
                                        <th className="px-6 py-4 text-xs font-bold text-sandstone uppercase tracking-widest">DEADLINE</th>
                                        <th className="px-6 py-4 text-xs font-bold text-sandstone uppercase tracking-widest text-right">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border bg-obsidian-soft">
                                    {tasksQuery.loading ? (
                                        <tr><td colSpan="5" className="px-6 py-8 text-center text-sandstone-dim text-sm uppercase tracking-widest">LOADING...</td></tr>
                                    ) : (
                                        tasksQuery.data.length === 0 ? (
                                            <tr><td colSpan="5" className="px-6 py-8 text-center text-sandstone-dim text-sm uppercase tracking-widest">No tasks yet</td></tr>
                                        ) : (
                                            tasksQuery.data.map(task => (
                                            <tr key={task.id} className="hover:bg-obsidian transition-colors">
                                                <td className="px-6 py-4 text-sm font-bold text-white uppercase">{task.title}</td>
                                                <td className="px-6 py-4 text-sm text-sandstone">{getDomainName(task.domain_id)}</td>
                                                <td className="px-6 py-4 text-sm font-bold text-cyan">+{Number(task.points)}</td>
                                                <td className="px-6 py-4 text-sm text-sandstone-dim">
                                                    {task.deadline ? (
                                                        new Date(task.deadline + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
                                                    ) : 'Forever'}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-3">
                                                        <button onClick={() => { 
                                                          setSelectedItem(task); 
                                                          setFormData({
                                                            title: task.title,
                                                            description: task.description,
                                                            instructions: task.instructions || '',
                                                            points: String(task.points),
                                                            domain_id: task.domain_id || 'global',
                                                            deadline: task.deadline || ''
                                                          }); 
                                                          setModals({ ...modals, edit: true }) 
                                                        }} className="text-xs font-mono text-cyan hover:text-white transition-colors uppercase tracking-widest">[ EDIT ]</button>
                                                        <button onClick={() => { setSelectedItem(task); setModals({ ...modals, delete: true }) }} className="text-xs font-mono text-danger hover:text-white transition-colors uppercase tracking-widest">[ DELETE ]</button>
                                                    </div>
                                                </td>
                                            </tr>
                                            ))
                                        )
                                    )}
                                </tbody>
                            </table>
                            <PaginationControls query={tasksQuery} />
                        </div>
                    </AxisFrame>
                </div>
            )}

            {/* Students Tab */}
            {activeTab === 'students' && (
                <AxisFrame variant="cyan" className="!p-0 overflow-hidden">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left font-mono min-w-[600px]">
                            <thead className="bg-obsidian border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-sandstone uppercase tracking-widest">NODE_ID</th>
                                    <th className="px-6 py-4 text-xs font-bold text-sandstone uppercase tracking-widest">TOTAL_METRICS</th>
                                    <th className="px-6 py-4 text-xs font-bold text-sandstone uppercase tracking-widest">DOMAIN</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border bg-obsidian-soft">
                                {studentsQuery.loading ? (
                                    <tr><td colSpan="3" className="px-6 py-8 text-center text-sandstone-dim text-sm uppercase tracking-widest">LOADING...</td></tr>
                                ) : studentsQuery.data.length === 0 ? (
                                    <tr><td colSpan="3" className="px-6 py-8 text-center text-sandstone-dim text-sm uppercase tracking-widest">No students yet</td></tr>
                                ) : (
                                    studentsQuery.data.map(student => (
                                    <tr key={student.id} className="hover:bg-obsidian transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold text-white uppercase">{student.full_name}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-cyan">{Number(student.total_points)}</td>
                                        <td className="px-6 py-4 text-sm text-sandstone">
                                            {getDomainName(student.domain_id)}
                                        </td>
                                    </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        <PaginationControls query={studentsQuery} />
                    </div>
                </AxisFrame>
            )}

            {/* Announcements Tab */}
            {activeTab === 'announcements' && (
                <div>
                    <div className="flex justify-end mb-6">
                        <button onClick={() => { setFormData({ title: '', content: '' }); setModals({ ...modals, announce: true }) }} className="inline-flex items-center gap-2 text-xs font-mono font-bold text-void bg-cyan hover:bg-cyan-soft px-6 py-3 uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                            + New Announcement
                        </button>
                    </div>
                    <AxisFrame variant="cyan" className="!p-0 overflow-hidden">
                        <div className="overflow-x-auto w-full">
                            <table className="w-full text-left font-mono min-w-[600px]">
                                <thead className="bg-obsidian border-b border-border">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-sandstone uppercase tracking-widest">TITLE</th>
                                        <th className="px-6 py-4 text-xs font-bold text-sandstone uppercase tracking-widest">TIMESTAMP</th>
                                        <th className="px-6 py-4 text-xs font-bold text-sandstone uppercase tracking-widest text-right">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border bg-obsidian-soft">
                                    {announcementsQuery.loading ? (
                                        <tr><td colSpan="3" className="px-6 py-8 text-center text-sandstone-dim text-sm uppercase tracking-widest">LOADING...</td></tr>
                                    ) : announcementsQuery.data.length === 0 ? (
                                        <tr><td colSpan="3" className="px-6 py-8 text-center text-sandstone-dim text-sm uppercase tracking-widest">No announcements yet</td></tr>
                                    ) : (
                                        announcementsQuery.data.map(item => (
                                        <tr key={item.id} className="hover:bg-obsidian transition-colors">
                                            <td className="px-6 py-4 text-sm font-bold text-white uppercase">{item.title}</td>
                                            <td className="px-6 py-4 text-sm text-sandstone-dim">{new Date(item.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => { setSelectedItem(item); setModals({ ...modals, deleteAnnounce: true }) }} className="text-xs font-mono text-danger hover:text-white transition-colors uppercase tracking-widest">[ DELETE ]</button>
                                            </td>
                                        </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                            <PaginationControls query={announcementsQuery} />
                        </div>
                    </AxisFrame>
                </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
                <div className="max-w-2xl">
                    <AxisFrame variant="cyan" className="!p-8">
                        <div className="border-b border-border pb-4 mb-6">
                            <TerminalLabel prefix=">">Program Settings</TerminalLabel>
                            <p className="text-sandstone-dim font-mono text-xs mt-2 uppercase tracking-widest">Global configuration parameters for the platform.</p>
                        </div>
                        <form onSubmit={handleSettingsUpdate} className="space-y-6">
                            <InputField 
                                label="Campus Ambassador Threshold (Points)" 
                                type="number" 
                                value={programSettings.campus_ambassador_threshold} 
                                onChange={(e) => setProgramSettings({...programSettings, campus_ambassador_threshold: parseInt(e.target.value) || 0})} 
                                required 
                            />
                            <InputField 
                                label="Referral Reward (Points)" 
                                type="number" 
                                value={programSettings.referral_reward_points} 
                                onChange={(e) => setProgramSettings({...programSettings, referral_reward_points: parseInt(e.target.value) || 0})} 
                                required 
                            />
                            <div className="flex justify-end pt-4 border-t border-border">
                                <button type="submit" className="px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest text-void bg-cyan hover:bg-cyan-soft transition-colors shadow-[0_0_15px_rgba(0,240,255,0.4)]">Save Settings</button>
                            </div>
                        </form>
                    </AxisFrame>
                </div>
            )}
        </div>
      </div>
      
      {/* Modals */}
      {modals.create && (
        <Modal 
            onClose={() => setModals({ ...modals, create: false })} 
            title="Create Task"
            footer={
                <>
                    <button type="button" onClick={() => setModals({ ...modals, create: false })} className="px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest text-sandstone hover:text-white transition-colors">ABORT</button>
                    <button type="submit" form="create-task-form" className="px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest text-void bg-cyan hover:bg-cyan-soft transition-colors shadow-[0_0_15px_rgba(0,240,255,0.4)] flex items-center gap-2">
                        INITIALIZE <Crosshair size={10} className="opacity-50" />
                    </button>
                </>
            }
        >
            <form id="create-task-form" onSubmit={(e) => handleCreate(e, 'task')} className="space-y-4">
                <InputField label="DIRECTIVE_TITLE" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
                <InputField label="DESCRIPTION" multiline value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
                <InputField label="INSTRUCTIONS" multiline value={formData.instructions} onChange={(e) => setFormData({...formData, instructions: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                    <InputField 
                        label="REWARD_METRICS" 
                        type="text" 
                        value={formData.points} 
                        onChange={(e) => {
                            const val = e.target.value;
                            setFormData({...formData, points: val});
                            if (!val.trim() || !/^\d+$/.test(val.trim())) {
                                setMetricsError("Reward Metrics must be a whole number.");
                            } else {
                                setMetricsError("");
                            }
                        }}
                        error={metricsError}
                        required 
                    />
                    <InputField label="DEADLINE (Optional)" type="date" value={formData.deadline || ''} onChange={(e) => setFormData({...formData, deadline: e.target.value})} />
                </div>
                
                <div className="relative group">
                    <label className="block mb-2 text-xs font-mono tracking-widest text-sandstone uppercase transition-colors group-focus-within:text-amber">DOMAIN</label>
                    <select 
                        value={formData.domain_id} 
                        onChange={(e) => setFormData({...formData, domain_id: e.target.value})} 
                        className="w-full bg-void border border-border p-3 focus:border-cyan outline-none transition-all text-sm font-mono text-white"
                    >
                        <option value="global">Global (No Domain)</option>
                        {domainsList.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                </div>
                
            </form>
        </Modal>
      )}

      {modals.edit && (
        <Modal 
            onClose={() => setModals({ ...modals, edit: false })} 
            title="Edit Task"
            footer={
                <>
                    <button type="button" onClick={() => setModals({ ...modals, edit: false })} className="px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest text-sandstone hover:text-white transition-colors">ABORT</button>
                    <button type="submit" form="edit-task-form" className="px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest text-void bg-cyan hover:bg-cyan-soft transition-colors shadow-[0_0_15px_rgba(0,240,255,0.4)]">Update</button>
                </>
            }
        >
            <form id="edit-task-form" onSubmit={handleUpdate} className="space-y-4">
                <InputField label="DIRECTIVE_TITLE" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
                <InputField label="DESCRIPTION" multiline value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
                <InputField label="INSTRUCTIONS" multiline value={formData.instructions} onChange={(e) => setFormData({...formData, instructions: e.target.value})} />
                
                <div className="grid grid-cols-2 gap-4">
                    <InputField 
                        label="REWARD_METRICS" 
                        type="text" 
                        value={formData.points} 
                        onChange={(e) => {
                            const val = e.target.value;
                            setFormData({...formData, points: val});
                            if (!val.trim() || !/^\d+$/.test(val.trim())) {
                                setMetricsError("Reward Metrics must be a whole number.");
                            } else {
                                setMetricsError("");
                            }
                        }}
                        error={metricsError}
                        required 
                    />
                    <InputField label="DEADLINE (Optional)" type="date" value={formData.deadline || ''} onChange={(e) => setFormData({...formData, deadline: e.target.value})} />
                </div>

                <div className="relative group">
                    <label className="block mb-2 text-xs font-mono tracking-widest text-sandstone uppercase transition-colors group-focus-within:text-amber">DOMAIN</label>
                    <select 
                        value={formData.domain_id} 
                        onChange={(e) => setFormData({...formData, domain_id: e.target.value})} 
                        className="w-full bg-void border border-border p-3 focus:border-cyan outline-none transition-all text-sm font-mono text-white"
                    >
                        <option value="global">Global (No Domain)</option>
                        {domainsList.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                </div>
                
            </form>
        </Modal>
      )}

      {modals.delete && (
        <Modal 
            onClose={() => setModals({ ...modals, delete: false })} 
            title="Confirm Delete" 
            variant="danger"
            footer={
                <>
                    <button onClick={() => setModals({ ...modals, delete: false })} className="px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest text-sandstone hover:text-white transition-colors">ABORT</button>
                    <button onClick={() => handleDelete('tasks')} className="px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest text-white bg-danger hover:bg-red-700 transition-colors shadow-[0_0_15px_rgba(255,0,0,0.4)]">Delete</button>
                </>
            }
        >
            <div className="flex items-start gap-4 mb-6 p-4 border border-danger/50 bg-danger/10 text-danger text-sm font-mono uppercase">
                <span className="font-bold">{'>'}</span>
                <p>Warning: Deleting directive <strong>"{selectedItem?.title}"</strong> is permanent. Confirm purge.</p>
            </div>
        </Modal>
      )}

      <SubmissionReviewModal
        isOpen={modals.review}
        onClose={() => setModals({ ...modals, review: false })}
        submission={selectedItem}
        onSubmitReview={handleReviewSubmit}
      />

      {modals.announce && (
        <Modal 
            onClose={() => setModals({ ...modals, announce: false })} 
            title="New Announcement"
            footer={
                <>
                    <button type="button" onClick={() => setModals({ ...modals, announce: false })} className="px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest text-sandstone hover:text-white transition-colors">ABORT</button>
                    <button type="submit" form="announce-form" className="px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest text-void bg-cyan hover:bg-cyan-soft transition-colors shadow-[0_0_15px_rgba(0,240,255,0.4)] flex items-center gap-2">
                        BROADCAST <Crosshair size={10} className="opacity-50" />
                    </button>
                </>
            }
        >
            <form id="announce-form" onSubmit={(e) => handleCreate(e, 'announcement')} className="space-y-4">
                <InputField label="BROADCAST_TITLE" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
                <InputField label="PAYLOAD" multiline value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} required />
            </form>
        </Modal>
      )}

      {modals.deleteAnnounce && (
        <Modal 
            onClose={() => setModals({ ...modals, deleteAnnounce: false })} 
            title="Confirm Delete" 
            variant="danger"
            footer={
                <>
                    <button onClick={() => setModals({ ...modals, deleteAnnounce: false })} className="px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest text-sandstone hover:text-white transition-colors">ABORT</button>
                    <button onClick={() => handleDelete('announcements')} className="px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest text-white bg-danger hover:bg-red-700 transition-colors shadow-[0_0_15px_rgba(255,0,0,0.4)]">Delete</button>
                </>
            }
        >
            <div className="flex items-start gap-4 mb-6 p-4 border border-danger/50 bg-danger/10 text-danger text-sm font-mono uppercase">
                <span className="font-bold">{'>'}</span>
                <p>Warning: Deleting broadcast <strong>"{selectedItem?.title}"</strong> is permanent. Confirm purge.</p>
            </div>
        </Modal>
      )}
    </div>
  );
}

export default AdminDashboard;