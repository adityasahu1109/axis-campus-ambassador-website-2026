import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';

// Helper Icons for the UI
const StarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;
const AlertIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>;
const StatusBadge = ({ status }) => {
    const colors = {
        'Approved': 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20',
        'Pending': 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20',
        'Rejected': 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20',
        'Not Submitted': 'bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-500/20',
    };
    return <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full border ${colors[status]}`}>{status}</span>;
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

    if (loading) return <div className="text-center py-10 text-slate-500 dark:text-slate-400">Loading your dashboard...</div>;
    if (!user || !profile) return <div className="text-center py-10 text-slate-500 dark:text-slate-400">Please log in to view your dashboard.</div>;

    const getSubmissionForTask = (taskId) => submissions.find(sub => sub.task_id === taskId);
    const myRank = leaderboard.findIndex(p => p.id === user?.id) + 1;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white text-center mb-8">
                Welcome, {profile.full_name || user.email}!
            </h1>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 mb-8 shadow-sm">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">Your Current Rank</p>
                        <p className="text-slate-500 dark:text-slate-400">{profile.points} Points</p>
                    </div>
                    <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">#{myRank > 0 ? myRank : 'N/A'}</p>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">My Tasks</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Click on a task to view details and submit for review. New tasks are marked with a star ✨.</p>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900"><tr className="border-b border-slate-200 dark:border-slate-700"><th className="px-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Task</th><th className="px-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Points</th><th className="px-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Status</th></tr></thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {tasks.map((task) => {
                            const status = getSubmissionForTask(task.id)?.status || 'Not Submitted';
                            const isNew = task.id > lastSeenTaskId;
                            return (
                                <tr key={task.id} onClick={() => handleTaskClick(task)} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
                                    <td className="px-6 py-4 whitespace-nowrap text-slate-800 dark:text-slate-300"><div className="flex items-center gap-x-3"><div className="w-4">{isNew && <StarIcon />}</div><span>{task.title}</span></div></td>
                                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-blue-600 dark:text-blue-400">{task.points}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={status} /></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-start pt-16 px-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-lg animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <div className="p-6">
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{selectedTask?.title}</h3>
                            {getSubmissionForTask(selectedTask?.id)?.status === 'Rejected' && (
                                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-500/30 rounded-lg flex gap-x-3">
                                    <AlertIcon />
                                    <div>
                                        <h4 className="font-bold text-red-800 dark:text-red-300">Submission Rejected</h4>
                                        <p className="text-sm text-red-700 dark:text-red-300/80 mt-1"><strong>Reason:</strong> {getSubmissionForTask(selectedTask?.id)?.rejection_reason}</p>
                                    </div>
                                </div>
                            )}
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">Description</p>
                            <p className="text-slate-600 dark:text-slate-300 mt-1">{selectedTask?.description || "No description."}</p>
                            
                            <form onSubmit={handleSubmitForReview} className="mt-6">
                                <div>
                                    <label htmlFor="submission" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Your Submission</label>
                                    <p className="text-xs text-slate-500 dark:text-slate-500 mb-2">Describe how you completed the task. You can add links or other information for the organizer.</p>
                                    <textarea id="submission" rows="4" required value={submissionContext} onChange={(e) => setSubmissionContext(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
                                </div>
                                <div className="mt-6 flex justify-end gap-x-4">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg">Cancel</button>
                                    <button type="submit" disabled={['Approved', 'Pending'].includes(getSubmissionForTask(selectedTask?.id)?.status)} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                                        { getSubmissionForTask(selectedTask?.id)?.status === 'Approved' ? 'Task Approved' : getSubmissionForTask(selectedTask?.id)?.status === 'Pending' ? 'Pending Review' : 'Submit for Review' }
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MyDashboardPage;