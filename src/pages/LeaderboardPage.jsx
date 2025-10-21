import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';

function LeaderboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('global');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data: leaderboardData, error: leaderboardError } = await supabase
          .from('profiles').select('id, full_name, points').order('points', { ascending: false });
        if (leaderboardError) throw leaderboardError;
        setLeaderboard(leaderboardData || []);

        if (user) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles').select('role').eq('id', user.id).single();
          if (profileError) throw profileError;
          setProfile(profileData);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error('Error fetching leaderboard data:', error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const myIndex = user ? leaderboard.findIndex(p => p.id === user.id) : -1;
  let localLeaderboardData = [];
  if (myIndex !== -1) {
    const start = Math.max(0, myIndex - 7);
    const end = Math.min(leaderboard.length, myIndex + 6);
    localLeaderboardData = leaderboard.slice(start, end);
  }

  const dataToDisplay = view === 'local' && localLeaderboardData.length > 0 ? localLeaderboardData : leaderboard;

  if (loading) {
    return <div className="text-center py-10 text-slate-500 dark:text-slate-400">Loading leaderboard...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Leaderboard</h1>
        {profile?.role === 'student' && myIndex !== -1 && (
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setView('global')}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${view === 'global' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              Global
            </button>
            <button
              onClick={() => setView('local')}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${view === 'local' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              Local
            </button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Rank</th>
              <th className="px-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {dataToDisplay.length > 0 ? dataToDisplay.map((profileRow) => {
              const originalRank = leaderboard.findIndex(p => p.id === profileRow.id) + 1;
              return (
                <tr key={profileRow.id} className={`${profileRow.id === user?.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''} hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors`}>
                  <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-slate-800 dark:text-white">{originalRank}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">{profileRow.full_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-blue-600 dark:text-blue-400">{profileRow.points}</td>
                </tr>
              )
            }) : (
              <tr>
                <td colSpan="3" className="text-center py-10 text-slate-500 dark:text-slate-400">No student data found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LeaderboardPage;