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

const Modal = ({ children, onClose, title, variant = "cyan" }) => (
    <div className="fixed inset-0 bg-void/90 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
        <AxisFrame variant={variant} className="!p-0 w-full max-w-2xl max-h-[90vh] flex flex-col relative overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className={clsx("px-6 py-4 flex justify-between items-center border-b", variant === "cyan" ? "border-cyan/30 bg-cyan/10" : "border-danger/30 bg-danger/10")}>
                <TerminalLabel prefix=">">{title}</TerminalLabel>
                <button onClick={onClose} className={clsx("text-xl hover:scale-110 transition-transform", variant === "cyan" ? "text-cyan" : "text-danger")}>×</button>
            </div>
            <div className="p-6 overflow-y-auto shrink bg-obsidian text-sandstone">
                {children}
            </div>
        </AxisFrame>
    </div>
);

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

const InputField = ({ label, type = "text", value, onChange, required, multiline = false }) => (
    <div className="mb-6 group">
        <label className="block mb-2 text-xs font-mono font-bold tracking-widest uppercase text-sandstone group-focus-within:text-cyan transition-colors">{label}</label>
        {multiline ? (
            <textarea 
                value={value} 
                onChange={onChange} 
                required={required} 
                rows="4" 
                className="w-full bg-void border border-border p-4 focus:border-cyan outline-none transition-all text-sm font-mono text-white placeholder-sandstone-dim focus:shadow-[0_0_15px_rgba(0,240,255,0.2)]"
            />
        ) : (
            <input 
                type={type}
                value={value} 
                onChange={onChange} 
                required={required} 
                className="w-full bg-void border border-border p-3 focus:border-cyan outline-none transition-all text-sm font-mono text-white placeholder-sandstone-dim focus:shadow-[0_0_15px_rgba(0,240,255,0.2)]"
            />
        )}
    </div>
);


function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ students: 0, pendingSubs: 0, pendingOnboarding: 0, thisWeekSubs: 0 });
  const [modals, setModals] = useState({ create: false, edit: false, delete: false, review: false, announce: false, deleteAnnounce: false });
  const [selectedItem, setSelectedItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [awardedPoints, setAwardedPoints] = useState(0);
  const [formData, setFormData] = useState({ title: '', description: '', content: '', points: 0, domain: '', is_initial_task: false });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [tasksRes, studentsRes, pendingSubsRes, pendingOnboardingRes, thisWeekSubsRes] = await Promise.all([
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('submissions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student').eq('status', 'pending'),
        supabase.from('submissions').select('id', { count: 'exact', head: true }).gte('submitted_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      ]);
      setTasks(tasksRes.data || []);
      setStats({
          students: studentsRes.count || 0,
          pendingSubs: pendingSubsRes.count || 0,
          pendingOnboarding: pendingOnboardingRes.count || 0,
          thisWeekSubs: thisWeekSubsRes.count || 0,
      });
    } catch (error) { console.error('Error fetching data:', error.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const studentsQuery = usePaginatedQuery('profiles', '*', 25, { filters: { role: 'student' } });
  const submissionsQuery = usePaginatedQuery('submissions', '*, profiles!submissions_student_id_fkey(full_name, id), tasks(title, description, points)', 25, { orderBy: { column: 'submitted_at', ascending: false } });
  const announcementsQuery = usePaginatedQuery('announcements', '*', 25, { orderBy: { column: 'created_at', ascending: false } });

  const handleCreate = async (e, type) => {
    e.preventDefault();
    try {
      if (type === 'task') {
        const { error } = await supabase.from('tasks').insert({ 
            title: formData.title, 
            description: formData.description, 
            points: formData.points,
            domain: formData.domain || null,
            is_initial_task: formData.is_initial_task
        });
        if (error) throw error;
        
        const announcementTitle = "New Directive Active!";
        const announcementContent = `A new directive "${formData.title}" is available. Execute to earn ${formData.points} metrics.`;
        const { error: announceError } = await supabase.from('announcements').insert({ title: announcementTitle, content: announcementContent, author_id: user.id });
        if (announceError) console.error('Error auto-creating announcement:', announceError.message);
      } else if (type === 'announcement') {
        const { error } = await supabase.from('announcements').insert({ title: formData.title, content: formData.content, author_id: user.id });
        if (error) throw error;
      }
      fetchData(); 
      announcementsQuery.refresh();
      setModals({ ...modals, create: false, announce: false });
      setFormData({ title: '', description: '', content: '', points: 0, domain: '', is_initial_task: false });
    } catch (error) { 
      console.error(`Error creating ${type}:`, error.message); 
      alert(`Error creating ${type}: ${error.message}`);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('tasks').update({ 
          title: formData.title, 
          description: formData.description, 
          points: formData.points,
          domain: formData.domain || null,
          is_initial_task: formData.is_initial_task 
      }).eq('id', selectedItem.id);
      if (error) throw error;
      fetchData();
      setModals({ ...modals, edit: false });
    } catch (error) { console.error('Error updating task:', error.message); }
  };

  const handleDelete = async (type) => {
    try {
      const { error } = await supabase.from(type).delete().eq('id', selectedItem.id);
      if (error) throw error;
      fetchData();
      if (type === 'announcements') announcementsQuery.refresh();
      setModals({ ...modals, delete: false, deleteAnnounce: false });
    } catch (error) { console.error(`Error deleting ${type}:`, error.message); }
  };

  const handleReviewSubmit = async (decision) => {
    if ((decision === 'needs_revision' || decision === 'rejected') && !rejectionReason) {
      alert("Feedback notes are required for this decision.");
      return;
    }
    try {
      const finalPoints = decision === 'approved' ? awardedPoints : 0;
      const { error } = await supabase.rpc('submit_review', {
        p_submission_id: selectedItem.id,
        p_decision: decision,
        p_notes: rejectionReason || (decision === 'approved' ? 'Approved' : ''),
        p_points_awarded: finalPoints,
        p_reviewed_by: user.id
      });
      if (error) throw error;
      fetchData();
      submissionsQuery.refresh();
      setRejectionReason('');
      setModals({ ...modals, review: false });
    } catch (error) { 
      console.error(`Error with review decision ${decision}:`, error.message);
      alert(`Error: ${error.message}`);
    }
  };

  if (loading) return <div className="min-h-screen bg-void flex justify-center items-center"><TerminalLoader text="AETHEL_CORE_INITIALIZING..." /></div>;

  const TabButton = ({ name, label, count }) => (
    <button 
        onClick={() => setActiveTab(name)} 
        className={clsx('px-6 py-3 font-mono text-xs uppercase tracking-widest transition-colors border', activeTab === name ? 'bg-cyan/20 text-cyan border-cyan/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]' : 'bg-obsidian border-border text-sandstone-dim hover:text-sandstone')}
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
                <TerminalLabel prefix=">">AETHEL_COMMAND // ROOT_ACCESS</TerminalLabel>
                <h1 className="text-4xl font-display font-black text-white tracking-widest uppercase mt-4">Terminal</h1>
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
          <TabButton name="tasks" label="Directives" count={tasks.length} />
          <TabButton name="students" label="Nodes" count={stats.students} />
          <TabButton name="announcements" label="Comms" />
        </div>

        <div className="animate-fade-in">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <AxisFrame variant="cyan" hover className="flex flex-col items-center justify-center py-12 cursor-pointer" onClick={() => setActiveTab('students')}>
                        <span className="text-xs font-mono text-cyan uppercase tracking-widest mb-2 text-center">Active_Nodes</span>
                        <span className="text-4xl font-display font-black text-white">{stats.students}</span>
                    </AxisFrame>
                    <AxisFrame variant="amber" hover className="flex flex-col items-center justify-center py-12 cursor-pointer" onClick={() => setActiveTab('submissions')}>
                        <span className="text-xs font-mono text-amber uppercase tracking-widest mb-2 text-center">Pending_Reviews</span>
                        <span className="text-4xl font-display font-black text-white">{stats.pendingSubs}</span>
                    </AxisFrame>
                    <AxisFrame variant="cyan" hover className="flex flex-col items-center justify-center py-12 cursor-pointer" onClick={() => setActiveTab('tasks')}>
                        <span className="text-xs font-mono text-cyan uppercase tracking-widest mb-2 text-center">Active_Directives</span>
                        <span className="text-4xl font-display font-black text-white">{tasks.length}</span>
                    </AxisFrame>
                    <AxisFrame variant="amber" hover className="flex flex-col items-center justify-center py-12 cursor-pointer" onClick={() => setActiveTab('students')}>
                        <span className="text-xs font-mono text-amber uppercase tracking-widest mb-2 text-center">Pending_Onboarding</span>
                        <span className="text-4xl font-display font-black text-white">{stats.pendingOnboarding}</span>
                    </AxisFrame>
                    <AxisFrame variant="cyan" hover className="flex flex-col items-center justify-center py-12 cursor-pointer" onClick={() => setActiveTab('submissions')}>
                        <span className="text-xs font-mono text-cyan uppercase tracking-widest mb-2 text-center">This_Week_Subs</span>
                        <span className="text-4xl font-display font-black text-white">{stats.thisWeekSubs}</span>
                    </AxisFrame>
                </div>
            )}
            {/* Submissions Tab */}
            {activeTab === 'submissions' && (
                <AxisFrame variant="cyan" className="!p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-mono">
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
                                    <tr><td colSpan="4" className="px-6 py-8 text-center text-sandstone-dim text-sm uppercase tracking-widest">NO_SUBMISSIONS_DETECTED</td></tr>
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
            )}

            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
                <div>
                    <div className="flex justify-end mb-6">
                        <button onClick={() => { setFormData({ title: '', description: '', points: 0 }); setModals({ ...modals, create: true }) }} className="inline-flex items-center gap-2 text-xs font-mono font-bold text-void bg-cyan hover:bg-cyan-soft px-6 py-3 uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                            + ADD_DIRECTIVE
                        </button>
                    </div>
                    <AxisFrame variant="cyan" className="!p-0 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left font-mono">
                                <thead className="bg-obsidian border-b border-border">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-sandstone uppercase tracking-widest">TITLE</th>
                                        <th className="px-6 py-4 text-xs font-bold text-sandstone uppercase tracking-widest">METRICS</th>
                                        <th className="px-6 py-4 text-xs font-bold text-sandstone uppercase tracking-widest text-right">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border bg-obsidian-soft">
                                    {tasks.length === 0 ? (
                                        <tr><td colSpan="3" className="px-6 py-8 text-center text-sandstone-dim text-sm uppercase tracking-widest">NO_DIRECTIVES_DETECTED</td></tr>
                                    ) : (
                                        tasks.map(task => (
                                        <tr key={task.id} className="hover:bg-obsidian transition-colors">
                                            <td className="px-6 py-4 text-sm font-bold text-white uppercase">{task.title}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-cyan">+{task.points}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-3">
                                                    <button onClick={() => { setSelectedItem(task); setFormData(task); setModals({ ...modals, edit: true }) }} className="text-xs font-mono text-cyan hover:text-white transition-colors uppercase tracking-widest">[ EDIT ]</button>
                                                    <button onClick={() => { setSelectedItem(task); setModals({ ...modals, delete: true }) }} className="text-xs font-mono text-danger hover:text-white transition-colors uppercase tracking-widest">[ DELETE ]</button>
                                                </div>
                                            </td>
                                        </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </AxisFrame>
                </div>
            )}

            {/* Students Tab */}
            {activeTab === 'students' && (
                <AxisFrame variant="cyan" className="!p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-mono">
                            <thead className="bg-obsidian border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-sandstone uppercase tracking-widest">NODE_ID</th>
                                    <th className="px-6 py-4 text-xs font-bold text-sandstone uppercase tracking-widest">TOTAL_METRICS</th>
                                    <th className="px-6 py-4 text-xs font-bold text-sandstone uppercase tracking-widest">VERIFIED_DIRECTIVES</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border bg-obsidian-soft">
                                {studentsQuery.loading ? (
                                    <tr><td colSpan="3" className="px-6 py-8 text-center text-sandstone-dim text-sm uppercase tracking-widest">LOADING...</td></tr>
                                ) : studentsQuery.data.length === 0 ? (
                                    <tr><td colSpan="3" className="px-6 py-8 text-center text-sandstone-dim text-sm uppercase tracking-widest">NO_NODES_DETECTED</td></tr>
                                ) : (
                                    studentsQuery.data.map(student => (
                                    <tr key={student.id} className="hover:bg-obsidian transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold text-white uppercase">{student.full_name}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-cyan">{student.total_points}</td>
                                        <td className="px-6 py-4 text-sm text-sandstone">
                                            {student.domain || 'Unassigned'}
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
                            + BROADCAST_COMMS
                        </button>
                    </div>
                    <AxisFrame variant="cyan" className="!p-0 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left font-mono">
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
                                        <tr><td colSpan="3" className="px-6 py-8 text-center text-sandstone-dim text-sm uppercase tracking-widest">NO_BROADCASTS_DETECTED</td></tr>
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
        </div>
      </div>
      
      {/* Modals */}
      {modals.create && (
        <Modal onClose={() => setModals({ ...modals, create: false })} title="INITIATE_DIRECTIVE">
            <form onSubmit={(e) => handleCreate(e, 'task')} className="space-y-4">
                <InputField label="DIRECTIVE_TITLE" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
                <InputField label="DESCRIPTION" multiline value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
                <InputField label="REWARD_METRICS" type="number" value={formData.points} onChange={(e) => setFormData({...formData, points: parseInt(e.target.value) || 0})} required />
                
                <div className="relative group">
                    <label className="block mb-2 text-xs font-mono tracking-widest text-sandstone uppercase transition-colors group-focus-within:text-amber">DOMAIN</label>
                    <select 
                        value={formData.domain} 
                        onChange={(e) => setFormData({...formData, domain: e.target.value})} 
                        className="w-full bg-void border border-border p-3 focus:border-cyan outline-none transition-all text-sm font-mono text-white"
                    >
                        <option value="">Global (No Domain)</option>
                        <option value="design">Design</option>
                        <option value="digital_marketing">Digital Marketing</option>
                        <option value="social_media_marketing">Social Media Marketing</option>
                        <option value="event_management">Event Management</option>
                        <option value="web_development">Web Development</option>
                    </select>
                </div>
                
                <div className="flex items-center gap-3 mt-4">
                    <input 
                        type="checkbox" 
                        id="is_initial_task" 
                        checked={formData.is_initial_task} 
                        onChange={(e) => setFormData({...formData, is_initial_task: e.target.checked})} 
                        className="w-4 h-4 bg-void border-border text-cyan focus:ring-cyan"
                    />
                    <label htmlFor="is_initial_task" className="text-xs font-mono tracking-widest text-sandstone uppercase">INITIAL_TASK (ONBOARDING)</label>
                </div>
                <div className="flex justify-end gap-4 pt-4 border-t border-border mt-6">
                    <button type="button" onClick={() => setModals({ ...modals, create: false })} className="px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest text-sandstone hover:text-white transition-colors">ABORT</button>
                    <button type="submit" className="px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest text-void bg-cyan hover:bg-cyan-soft transition-colors shadow-[0_0_15px_rgba(0,240,255,0.4)]">EXECUTE</button>
                </div>
            </form>
        </Modal>
      )}

      {modals.edit && (
        <Modal onClose={() => setModals({ ...modals, edit: false })} title="MODIFY_DIRECTIVE">
            <form onSubmit={handleUpdate} className="space-y-4">
                <InputField label="DIRECTIVE_TITLE" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
                <InputField label="DESCRIPTION" multiline value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
                <InputField label="REWARD_METRICS" type="number" value={formData.points} onChange={(e) => setFormData({...formData, points: parseInt(e.target.value) || 0})} required />

                <div className="relative group">
                    <label className="block mb-2 text-xs font-mono tracking-widest text-sandstone uppercase transition-colors group-focus-within:text-amber">DOMAIN</label>
                    <select 
                        value={formData.domain} 
                        onChange={(e) => setFormData({...formData, domain: e.target.value})} 
                        className="w-full bg-void border border-border p-3 focus:border-cyan outline-none transition-all text-sm font-mono text-white"
                    >
                        <option value="">Global (No Domain)</option>
                        <option value="design">Design</option>
                        <option value="digital_marketing">Digital Marketing</option>
                        <option value="social_media_marketing">Social Media Marketing</option>
                        <option value="event_management">Event Management</option>
                        <option value="web_development">Web Development</option>
                    </select>
                </div>
                
                <div className="flex items-center gap-3 mt-4">
                    <input 
                        type="checkbox" 
                        id="is_initial_task_edit" 
                        checked={formData.is_initial_task} 
                        onChange={(e) => setFormData({...formData, is_initial_task: e.target.checked})} 
                        className="w-4 h-4 bg-void border-border text-cyan focus:ring-cyan"
                    />
                    <label htmlFor="is_initial_task_edit" className="text-xs font-mono tracking-widest text-sandstone uppercase">INITIAL_TASK (ONBOARDING)</label>
                </div>
                <div className="flex justify-end gap-4 pt-4 border-t border-border mt-6">
                    <button type="button" onClick={() => setModals({ ...modals, edit: false })} className="px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest text-sandstone hover:text-white transition-colors">ABORT</button>
                    <button type="submit" className="px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest text-void bg-cyan hover:bg-cyan-soft transition-colors shadow-[0_0_15px_rgba(0,240,255,0.4)]">OVERWRITE</button>
                </div>
            </form>
        </Modal>
      )}

      {modals.delete && (
        <Modal onClose={() => setModals({ ...modals, delete: false })} title="CONFIRM_DELETION" variant="danger">
            <div className="flex items-start gap-4 mb-6 p-4 border border-danger/50 bg-danger/10 text-danger text-sm font-mono uppercase">
                <span className="font-bold">{'>'}</span>
                <p>Warning: Deleting directive <strong>"{selectedItem?.title}"</strong> is permanent. Confirm purge.</p>
            </div>
            <div className="flex justify-end gap-4 border-t border-border pt-6 mt-6">
                <button onClick={() => setModals({ ...modals, delete: false })} className="px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest text-sandstone hover:text-white transition-colors">ABORT</button>
                <button onClick={() => handleDelete('tasks')} className="px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest text-white bg-danger hover:bg-red-700 transition-colors shadow-[0_0_15px_rgba(255,0,0,0.4)]">PURGE_DATA</button>
            </div>
        </Modal>
      )}

      {modals.review && (
        <Modal onClose={() => setModals({ ...modals, review: false })} title="REVIEW_SUBMISSION">
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 border border-border bg-obsidian-soft p-4">
                    <div>
                        <span className="text-[10px] font-mono font-bold text-sandstone uppercase tracking-widest block mb-1">NODE_ID</span>
                        <span className="font-mono font-bold text-white uppercase">{selectedItem?.profiles.full_name}</span>
                    </div>
                    <div>
                        <span className="text-[10px] font-mono font-bold text-cyan uppercase tracking-widest block mb-1">MAX_REWARD</span>
                        <span className="font-mono font-bold text-cyan">{selectedItem?.tasks.points} METRICS</span>
                    </div>
                </div>

                <div>
                    <span className="text-[10px] font-mono font-bold text-sandstone uppercase tracking-widest block mb-2">DIRECTIVE_PARAMETERS</span>
                    <div className="border border-border bg-obsidian-soft p-4">
                        <h4 className="font-display font-bold text-white uppercase mb-2">{selectedItem?.tasks.title}</h4>
                        <p className="text-sm font-mono text-sandstone">{selectedItem?.tasks.description}</p>
                    </div>
                </div>

                <div>
                    <span className="text-[10px] font-mono font-bold text-sandstone uppercase tracking-widest block mb-2">EXECUTION_PAYLOAD (Drive Link)</span>
                    <div className="border border-border bg-void p-4 text-sm font-mono text-cyan truncate">
                        <a href={selectedItem?.drive_link} target="_blank" rel="noreferrer" className="hover:underline">
                            {selectedItem?.drive_link}
                        </a>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <InputField label="AWARDED_METRICS" type="number" value={awardedPoints} onChange={(e) => setAwardedPoints(parseInt(e.target.value) || 0)} />
                    </div>
                    <div>
                        <p className="text-[10px] text-sandstone mt-6 opacity-70">If rejected or requires revision, awarded metrics will automatically be 0. Ensure it does not exceed {selectedItem?.tasks.points}.</p>
                    </div>
                </div>

                <div>
                    <InputField label="REVIEW_LOG / FEEDBACK" multiline value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} />
                </div>

                <div className="flex justify-between gap-4 pt-6 border-t border-border">
                    <button onClick={() => handleReviewSubmit('needs_revision')} disabled={!rejectionReason} className="px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-amber border border-amber hover:bg-amber hover:text-void transition-colors disabled:opacity-50">REQ_REVISION</button>
                    <div className="flex gap-4">
                        <button onClick={() => handleReviewSubmit('rejected')} disabled={!rejectionReason} className="px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-white bg-danger hover:bg-red-700 transition-colors disabled:opacity-50">REJECT</button>
                        <button onClick={() => handleReviewSubmit('approved')} className="px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-void bg-cyan hover:bg-cyan-soft transition-colors shadow-[0_0_15px_rgba(0,240,255,0.4)]">VERIFY_AND_AWARD</button>
                    </div>
                </div>
            </div>
        </Modal>
      )}

      {modals.announce && (
        <Modal onClose={() => setModals({ ...modals, announce: false })} title="TRANSMIT_BROADCAST">
            <form onSubmit={(e) => handleCreate(e, 'announcement')} className="space-y-4">
                <InputField label="BROADCAST_TITLE" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
                <InputField label="PAYLOAD" multiline value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} required />
                <div className="flex justify-end gap-4 pt-6 border-t border-border mt-6">
                    <button type="button" onClick={() => setModals({ ...modals, announce: false })} className="px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest text-sandstone hover:text-white transition-colors">ABORT</button>
                    <button type="submit" className="px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest text-void bg-cyan hover:bg-cyan-soft transition-colors shadow-[0_0_15px_rgba(0,240,255,0.4)]">TRANSMIT</button>
                </div>
            </form>
        </Modal>
      )}

      {modals.deleteAnnounce && (
        <Modal onClose={() => setModals({ ...modals, deleteAnnounce: false })} title="CONFIRM_DELETION" variant="danger">
            <div className="flex items-start gap-4 mb-6 p-4 border border-danger/50 bg-danger/10 text-danger text-sm font-mono uppercase">
                <span className="font-bold">{'>'}</span>
                <p>Warning: Deleting broadcast <strong>"{selectedItem?.title}"</strong> is permanent. Confirm purge.</p>
            </div>
            <div className="flex justify-end gap-4 border-t border-border pt-6 mt-6">
                <button onClick={() => setModals({ ...modals, deleteAnnounce: false })} className="px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest text-sandstone hover:text-white transition-colors">ABORT</button>
                <button onClick={() => handleDelete('announcements')} className="px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest text-white bg-danger hover:bg-red-700 transition-colors shadow-[0_0_15px_rgba(255,0,0,0.4)]">PURGE_DATA</button>
            </div>
        </Modal>
      )}
    </div>
  );
}

export default AdminDashboard;