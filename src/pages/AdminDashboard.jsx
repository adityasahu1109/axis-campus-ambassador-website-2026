import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';

// Helper Components for UI (Unchanged)
const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;

const Modal = ({ children, onClose, title }) => (
    <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-start pt-16 px-4 sm:px-0" onClick={onClose}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-lg animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6">{children}</div>
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    const colors = {
        'Pending': 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20', 
        'Approved': 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
        'Rejected': 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    };
    return <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full border ${colors[status]}`}>{status}</span>;
};
// --- End of Helper Components ---


function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('submissions');
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [students, setStudents] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [modals, setModals] = useState({ create: false, edit: false, delete: false, review: false, announce: false, deleteAnnounce: false });
  const [selectedItem, setSelectedItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [formData, setFormData] = useState({ title: '', description: '', content: '', points: 0 });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [tasksRes, studentsRes, submissionsRes, announcementsRes] = await Promise.all([
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').eq('role', 'student'),
        supabase.from('submissions').select(`*, profiles(full_name, id), tasks(title, description, points)`),
        supabase.from('announcements').select('*').order('created_at', { ascending: false })
      ]);
      setTasks(tasksRes.data || []);
      setStudents(studentsRes.data || []);
      setSubmissions(submissionsRes.data || []);
      setAnnouncements(announcementsRes.data || []);
    } catch (error) { console.error('Error fetching data:', error.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- All handler functions (handleCreate, handleUpdate, etc.) are unchanged ---
  const handleCreate = async (e, type) => {
    e.preventDefault();
    try {
      if (type === 'task') {
        const { error } = await supabase.from('tasks').insert({ title: formData.title, description: formData.description, points: formData.points });
        if (error) throw error;
        
        const announcementTitle = "new task dropped check your dashboard.";
        const announcementContent = `a new task : "${formData.title}" has been dropped on your dashboard.`;
        const { error: announceError } = await supabase.from('announcements').insert({
          title: announcementTitle,
          content: announcementContent,
          author_id: user.id
        });
        
        if (announceError) {
          console.error('Error auto-creating announcement:', announceError.message);
        }

      } else if (type === 'announcement') {
        const { error } = await supabase.from('announcements').insert({ title: formData.title, content: formData.content, author_id: user.id });
        if (error) throw error;
      }
      fetchData(); 
      setModals({ ...modals, create: false, announce: false });
      setFormData({ title: '', description: '', content: '', points: 0 });
    } catch (error) { console.error(`Error creating ${type}:`, error.message); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('tasks').update({ title: formData.title, description: formData.description, points: formData.points }).eq('id', selectedItem.id);
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
      setModals({ ...modals, delete: false, deleteAnnounce: false });
    } catch (error) { console.error(`Error deleting ${type}:`, error.message); }
  };

  const handleApprove = async () => {
    try {
      await supabase.from('submissions').update({ status: 'Approved' }).eq('id', selectedItem.id);
      if (selectedItem.status !== 'Approved') {
        await supabase.rpc('award_points', { user_id: selectedItem.student_id, points_to_add: selectedItem.tasks.points });
      }
      fetchData();
      setModals({ ...modals, review: false });
    } catch (error) { console.error("Error approving:", error.message); }
  };

  const handleReject = async () => {
    try {
      await supabase.from('submissions').update({ status: 'Rejected', rejection_reason: rejectionReason }).eq('id', selectedItem.id);
      fetchData();
      setRejectionReason('');
      setModals({ ...modals, review: false });
    } catch (error) { console.error("Error rejecting:", error.message); }
  };
  // --- End of handler functions ---


  if (loading) return <div className="text-center py-10 text-slate-500 dark:text-slate-400">Loading Admin Data...</div>;

  const TabButton = ({ name, label }) => (
    <button onClick={() => setActiveTab(name)} className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === name ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}>
      {label}
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Admin Dashboard</h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">Manage your program with ease.</p>
      </div>
      
      {/* --- MODIFICATION: Added flex-col sm:flex-row to stack tabs on mobile --- */}
      <div className="mt-8 flex flex-col sm:flex-row justify-center p-1.5 space-y-1 sm:space-y-0 sm:space-x-2 bg-slate-100 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700">
        <TabButton name="submissions" label={`Review Submissions (${submissions.filter(s => s.status === 'Pending').length})`} />
        <TabButton name="tasks" label="Manage Tasks" />
        <TabButton name="students" label="View Students" />
        <TabButton name="announcements" label="Announcements" />
      </div>

      <div className="mt-8">
        <div style={{ display: activeTab === 'submissions' ? 'block' : 'none' }}>
            {/* --- MODIFICATION: Added overflow-x-auto to this div --- */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-x-auto shadow-sm">
                <table className="w-full text-left"><thead className="bg-slate-50 dark:bg-slate-900"><tr><th className="px-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Student</th><th className="px-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Task</th><th className="px-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Context</th><th className="px-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Status</th><th className="px-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Actions</th></tr></thead><tbody className="divide-y divide-slate-200 dark:divide-slate-700">{submissions.map(sub => <tr key={sub.id}><td className="px-6 py-4 text-slate-700 dark:text-slate-300">{sub.profiles.full_name}</td><td className="px-6 py-4 text-slate-700 dark:text-slate-300">{sub.tasks.title}</td><td className="px-6 py-4"><p className="w-48 truncate text-slate-500 dark:text-slate-400">{sub.submission_context}</p></td><td className="px-6 py-4"><StatusBadge status={sub.status} /></td><td className="px-6 py-4">{sub.status === 'Pending' && <button onClick={() => { setSelectedItem(sub); setModals({ ...modals, review: true }) }} className="flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"><EyeIcon />Review</button>}</td></tr>)}</tbody></table>
            </div>
        </div>
        <div style={{ display: activeTab === 'tasks' ? 'block' : 'none' }}>
            <div className="flex justify-end mb-4"><button onClick={() => { setFormData({ title: '', description: '', points: 0 }); setModals({ ...modals, create: true }) }} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg">Add New Task</button></div>
            {/* --- MODIFICATION: Added overflow-x-auto to this div --- */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-x-auto shadow-sm">
                <table className="w-full text-left"><thead className="bg-slate-50 dark:bg-slate-900"><tr><th className="px-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Title</th><th className="px-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Points</th><th className="px-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Actions</th></tr></thead><tbody className="divide-y divide-slate-200 dark:divide-slate-700">{tasks.map(task => <tr key={task.id}><td className="px-6 py-4 text-slate-700 dark:text-slate-300">{task.title}</td><td className="px-6 py-4 text-blue-600 dark:text-blue-400 font-semibold">{task.points}</td><td className="px-6 py-4"><div className="flex space-x-4"><button onClick={() => { setSelectedItem(task); setFormData(task); setModals({ ...modals, edit: true }) }} className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"><PencilIcon /></button><button onClick={() => { setSelectedItem(task); setModals({ ...modals, delete: true }) }} className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"><TrashIcon /></button></div></td></tr>)}</tbody></table>
            </div>
        </div>
        <div style={{ display: activeTab === 'students' ? 'block' : 'none' }}>
            {/* --- MODIFICATION: Added overflow-x-auto to this div --- */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-x-auto shadow-sm">
                <table className="w-full text-left"><thead className="bg-slate-50 dark:bg-slate-900"><tr><th className="px-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Name</th><th className="px-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Points</th><th className="px-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Tasks Approved</th></tr></thead><tbody className="divide-y divide-slate-200 dark:divide-slate-700">{students.map(student => <tr key={student.id}><td className="px-6 py-4 text-slate-700 dark:text-slate-300">{student.full_name}</td><td className="px-6 py-4 font-semibold text-blue-600 dark:text-blue-400">{student.points}</td><td className="px-6 py-4 text-slate-700 dark:text-slate-300">{submissions.filter(s => s.student_id === student.id && s.status === 'Approved').length}</td></tr>)}</tbody></table>
            </div>
        </div>
        <div style={{ display: activeTab === 'announcements' ? 'block' : 'none' }}>
            <div className="flex justify-end mb-4"><button onClick={() => { setFormData({ title: '', content: '' }); setModals({ ...modals, announce: true }) }} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg">Create Announcement</button></div>
            {/* --- MODIFICATION: Added overflow-x-auto to this div --- */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-x-auto shadow-sm">
                <table className="w-full text-left"><thead className="bg-slate-50 dark:bg-slate-900"><tr><th className="px-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Title</th><th className="px-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Date</th><th className="px-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Actions</th></tr></thead><tbody className="divide-y divide-slate-200 dark:divide-slate-700">{announcements.map(item => <tr key={item.id}><td className="px-6 py-4 text-slate-700 dark:text-slate-300">{item.title}</td><td className="px-6 py-4 text-slate-500 dark:text-slate-400">{new Date(item.created_at).toLocaleDateString()}</td><td className="px-6 py-4"><button onClick={() => { setSelectedItem(item); setModals({ ...modals, deleteAnnounce: true }) }} className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"><TrashIcon /></button></td></tr>)}</tbody></table>
            </div>
        </div>
      </div>
      
      {/* --- All Modals are unchanged by this --- */}
      {modals.create && <Modal onClose={() => setModals({ ...modals, create: false })} title="Add New Task"><form onSubmit={(e) => handleCreate(e, 'task')} className="space-y-4"><div><label className="text-sm font-medium">Title</label><input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded-lg mt-1" /></div><div><label className="text-sm font-medium">Description</label><textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded-lg mt-1" /></div><div><label className="text-sm font-medium">Points</label><input type="number" value={formData.points} onChange={(e) => setFormData({...formData, points: parseInt(e.target.value) || 0})} required className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded-lg mt-1" /></div><div className="flex justify-end gap-x-4 pt-4"><button type="button" onClick={() => setModals({ ...modals, create: false })} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700">Cancel</button><button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white">Create Task</button></div></form></Modal>}
      {modals.edit && <Modal onClose={() => setModals({ ...modals, edit: false })} title="Edit Task"><form onSubmit={handleUpdate} className="space-y-4"><div><label className="text-sm font-medium">Title</label><input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded-lg mt-1" /></div><div><label className="text-sm font-medium">Description</label><textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded-lg mt-1" /></div><div><label className="text-sm font-medium">Points</label><input type="number" value={formData.points} onChange={(e) => setFormData({...formData, points: parseInt(e.target.value) || 0})} required className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded-lg mt-1" /></div><div className="flex justify-end gap-x-4 pt-4"><button type="button" onClick={() => setModals({ ...modals, edit: false })} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700">Cancel</button><button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white">Save Changes</button></div></form></Modal>}
      {modals.delete && <Modal onClose={() => setModals({ ...modals, delete: false })} title="Confirm Deletion"><p className="text-slate-600 dark:text-slate-300">Are you sure you want to delete the task: "{selectedItem?.title}"?</p><div className="flex justify-end gap-x-4 mt-6"><button onClick={() => setModals({ ...modals, delete: false })} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700">Cancel</button><button onClick={() => handleDelete('tasks')} className="px-4 py-2 rounded-lg bg-red-600 text-white">Delete Task</button></div></Modal>}
      {modals.review && <Modal onClose={() => setModals({ ...modals, review: false })} title={`Review: ${selectedItem?.tasks.title}`}><div className="space-y-4 text-sm"><p><strong className="text-slate-900 dark:text-white">Student:</strong> <span className="text-slate-600 dark:text-slate-300">{selectedItem?.profiles.full_name}</span></p><p><strong className="text-slate-900 dark:text-white">Task Description:</strong> <span className="text-slate-600 dark:text-slate-300">{selectedItem?.tasks.description}</span></p><p><strong className="text-slate-900 dark:text-white">Submission:</strong> <span className="text-slate-600 dark:text-slate-300">{selectedItem?.submission_context}</span></p><textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Rejection reason (required if rejecting)" className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded-lg mt-2" /><div className="flex justify-end gap-x-4 pt-2"><button onClick={() => handleReject()} disabled={!rejectionReason} className="px-4 py-2 rounded-lg bg-red-600 text-white disabled:opacity-50">Reject</button><button onClick={() => handleApprove()} className="px-4 py-2 rounded-lg bg-green-600 text-white">Approve ({selectedItem?.tasks.points} pts)</button></div></div></Modal>}
      {modals.announce && <Modal onClose={() => setModals({ ...modals, announce: false })} title="Create Announcement"><form onSubmit={(e) => handleCreate(e, 'announcement')} className="space-y-4"><div><label className="text-sm font-medium">Title</label><input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded-lg mt-1" /></div><div><label className="text-sm font-medium">Content</label><textarea value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} required rows="4" className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded-lg mt-1" /></div><div className="flex justify-end gap-x-4 pt-4"><button type="button" onClick={() => setModals({ ...modals, announce: false })} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700">Cancel</button><button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white">Post</button></div></form></Modal>}
      {modals.deleteAnnounce && <Modal onClose={() => setModals({ ...modals, deleteAnnounce: false })} title="Confirm Deletion"><p className="text-slate-600 dark:text-slate-300">Are you sure you want to delete the announcement: "{selectedItem?.title}"?</p><div className="flex justify-end gap-x-4 mt-6"><button onClick={() => setModals({ ...modals, deleteAnnounce: false })} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700">Cancel</button><button onClick={() => handleDelete('announcements')} className="px-4 py-2 rounded-lg bg-red-600 text-white">Delete</button></div></Modal>}
    </div>
  );
}

export default AdminDashboard;