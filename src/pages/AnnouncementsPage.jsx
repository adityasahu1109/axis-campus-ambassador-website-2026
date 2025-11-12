import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

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

    if (loading) {
        return <div className="text-center py-10 text-slate-500 dark:text-slate-400">Loading announcements...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* --- MODIFICATION: Made heading responsive --- */}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white text-center mb-10">
                Announcements
            </h1>

            {announcements.length > 0 ? (
                <div className="space-y-6">
                    {announcements.map(item => (
                        /* --- MODIFICATION: Made card padding responsive --- */
                        <div key={item.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 sm:p-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{item.title}</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Posted on {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} at {new Date(item.created_at).toLocaleDateString()}
                            </p>
                            <p className="mt-4 text-slate-600 dark:text-slate-300">{item.content}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-12 text-center">
                    <p className="text-slate-500 dark:text-slate-400">No announcements have been posted yet.</p>
                </div>
            )}
        </div>
    );
}

export default AnnouncementsPage;