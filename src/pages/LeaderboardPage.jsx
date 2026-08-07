import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';
import { AxisFrame } from '../components/motifs/AxisFrame';
import { TerminalLabel } from '../components/motifs/TerminalLabel';
import { TerminalLoader } from '../components/motifs/TerminalLoader';
import { LensingRing } from '../components/motifs/LensingRing';
import { clsx } from 'clsx';

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
          .from('profiles').select('id, full_name, total_points').order('total_points', { ascending: false });
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
  
  if (loading) return <div className="min-h-screen bg-void flex justify-center items-center"><TerminalLoader text="FETCHING_GRID_DATA..." /></div>;

  const top3 = dataToDisplay.slice(0, 3);
  const rest = dataToDisplay.slice(3);

  const PodiumItem = ({ profile, rank }) => {
    if (!profile) return null;
    const isFirst = rank === 1;
    const orderClass = isFirst ? 'order-1 md:order-2 z-10' : rank === 2 ? 'order-2 md:order-1' : 'order-3';
    
    return (
        <div className={clsx(`flex flex-col items-center w-1/3 md:w-1/4 animate-fade-in-up`, orderClass)} style={{ animationDelay: `${rank * 150}ms` }}>
            <div className="relative mb-4 flex items-center justify-center">
                {isFirst && <LensingRing size="w-32 h-32 md:w-40 md:h-40" className="absolute" color="cyan" />}
                {!isFirst && <LensingRing size={rank === 2 ? "w-24 h-24 md:w-32 md:h-32" : "w-20 h-20 md:w-24 md:h-24"} className="absolute opacity-50" color="cyan" />}
                <div className="relative z-10 font-display font-black text-white text-3xl md:text-5xl drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]">
                    {rank}
                </div>
            </div>
            
            <div className={clsx("w-full border-t border-cyan/50 bg-gradient-to-t from-cyan/10 to-transparent pt-4 flex flex-col items-center", isFirst ? 'h-32 md:h-40 border-t-2 border-cyan' : rank === 2 ? 'h-24 md:h-32' : 'h-20 md:h-24')}>
                <span className="font-mono font-bold text-white text-xs md:text-sm text-center px-1 truncate w-full uppercase tracking-wider">{profile.full_name?.split(' ')[0]}</span>
                <span className="font-mono text-cyan text-lg md:text-xl mt-2">{profile.total_points}</span>
            </div>
        </div>
    );
  };

  const getPointsBarWidth = (total_points) => {
    const maxPoints = dataToDisplay[0]?.total_points || 1;
    return `${Math.max(5, (total_points / maxPoints) * 100)}%`;
  };

  return (
    <div className="bg-void min-h-screen pb-20 relative pt-20">
      
      {/* Background Grid */}
      <div className="absolute inset-0 axis-grid-bg opacity-20 pointer-events-none fixed"></div>

      {/* Header */}
      <div className="relative border-b border-border bg-obsidian-soft/80 backdrop-blur-md pb-12 pt-12 px-4">
        <div className="max-w-4xl mx-auto text-center relative z-10 animate-fade-in-up">
            <TerminalLabel className="justify-center mb-4">GLOBAL_GRID // RANKING_SYSTEM</TerminalLabel>
            <h1 className="text-4xl md:text-5xl font-display font-black text-white tracking-widest uppercase">Leaderboard</h1>
            <p className="mt-4 text-sandstone-dim font-mono text-sm max-w-xl mx-auto">Track node activity across the network. Top performers receive elevated permissions and hardware rewards.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-10">
        
        {/* Toggle */}
        {profile?.role === 'student' && myIndex !== -1 && (
            <div className="flex justify-center mb-16 animate-fade-in">
                <div className="bg-obsidian border border-border p-1 flex font-mono text-xs uppercase tracking-widest">
                    <button
                        onClick={() => setView('global')}
                        className={clsx('px-6 py-2 transition-colors', view === 'global' ? 'bg-cyan/20 text-cyan border border-cyan/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]' : 'text-sandstone-dim hover:text-sandstone')}
                    >
                        [ GLOBAL_VIEW ]
                    </button>
                    <button
                        onClick={() => setView('local')}
                        className={clsx('px-6 py-2 transition-colors', view === 'local' ? 'bg-cyan/20 text-cyan border border-cyan/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]' : 'text-sandstone-dim hover:text-sandstone')}
                    >
                        [ LOCAL_CLUSTER ]
                    </button>
                </div>
            </div>
        )}

        {/* Podium */}
        {dataToDisplay.length > 0 && view === 'global' && (
            <div className="flex justify-center items-end gap-2 md:gap-4 mb-20 max-w-2xl mx-auto">
                {top3[1] && <PodiumItem profile={top3[1]} rank={2} />}
                {top3[0] && <PodiumItem profile={top3[0]} rank={1} />}
                {top3[2] && <PodiumItem profile={top3[2]} rank={3} />}
            </div>
        )}

        {/* Data View */}
        <AxisFrame variant="cyan" className="!p-0 overflow-hidden animate-slide-in-up">
            
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left font-mono">
                    <thead className="bg-obsidian border-b border-border">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-sandstone uppercase tracking-widest w-24 text-center">RANK</th>
                            <th className="px-6 py-4 text-xs font-bold text-sandstone uppercase tracking-widest">NODE_ID (Name)</th>
                            <th className="px-6 py-4 text-xs font-bold text-sandstone uppercase tracking-widest w-1/3">PROGRESS</th>
                            <th className="px-6 py-4 text-xs font-bold text-sandstone uppercase tracking-widest text-right">METRICS</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {(view === 'global' ? rest : dataToDisplay).length > 0 ? (view === 'global' ? rest : dataToDisplay).map((profileRow) => {
                            const originalRank = leaderboard.findIndex(p => p.id === profileRow.id) + 1;
                            const isMe = profileRow.id === user?.id;
                            
                            return (
                                <tr key={profileRow.id} className={clsx('transition-colors', isMe ? 'bg-amber/10 border-l-2 border-l-amber' : 'hover:bg-obsidian')}>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className={clsx("text-sm", isMe ? "text-amber font-bold" : "text-cyan")}>
                                            {originalRank < 10 ? `0${originalRank}` : originalRank}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={clsx("text-sm uppercase tracking-wider", isMe ? "text-white font-bold" : "text-sandstone")}>
                                            {profileRow.full_name} {isMe && <span className="text-amber ml-2 text-xs">[YOU]</span>}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap w-1/3">
                                        <div className="w-full h-1 bg-obsidian-soft border border-border">
                                            <div className={clsx("h-full transition-all duration-1000", isMe ? "bg-amber" : "bg-cyan")} style={{ width: getPointsBarWidth(profileRow.total_points) }}></div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <span className={clsx("text-sm", isMe ? "text-amber font-bold" : "text-cyan")}>{profileRow.total_points}</span>
                                    </td>
                                </tr>
                            )
                        }) : (
                            <tr>
                                <td colSpan="4" className="text-center py-12 text-sandstone-dim text-sm uppercase tracking-widest">NO_NODES_DETECTED</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Stacked Card View */}
            <div className="md:hidden flex flex-col divide-y divide-border bg-obsidian-soft">
                <div className="bg-obsidian px-4 py-3 border-b border-border">
                    <span className="text-xs font-mono font-bold text-sandstone uppercase tracking-widest">LOCAL_READOUT</span>
                </div>
                {(view === 'global' ? rest : dataToDisplay).length > 0 ? (view === 'global' ? rest : dataToDisplay).map((profileRow) => {
                    const originalRank = leaderboard.findIndex(p => p.id === profileRow.id) + 1;
                    const isMe = profileRow.id === user?.id;
                    
                    return (
                        <div key={profileRow.id} className={clsx('p-4 flex flex-col gap-3 font-mono', isMe ? 'bg-amber/10 border-l-2 border-l-amber' : '')}>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <span className={clsx("text-xs w-6 text-right", isMe ? "text-amber font-bold" : "text-cyan")}>
                                        #{originalRank}
                                    </span>
                                    <span className={clsx("text-sm uppercase tracking-wider truncate", isMe ? "text-white font-bold" : "text-sandstone")}>
                                        {profileRow.full_name} {isMe && <span className="text-amber ml-1 text-xs">[YOU]</span>}
                                    </span>
                                </div>
                                <span className={clsx("text-sm", isMe ? "text-amber font-bold" : "text-cyan")}>{profileRow.total_points}</span>
                            </div>
                            <div className="w-full h-1 bg-obsidian border border-border mt-1">
                                <div className={clsx("h-full transition-all duration-1000", isMe ? "bg-amber" : "bg-cyan")} style={{ width: getPointsBarWidth(profileRow.total_points) }}></div>
                            </div>
                        </div>
                    )
                }) : (
                    <div className="text-center py-12 font-mono text-sandstone-dim text-sm uppercase tracking-widest">NO_NODES_DETECTED</div>
                )}
            </div>

        </AxisFrame>
      </div>
    </div>
  );
}

export default LeaderboardPage;