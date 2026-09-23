import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { AxisFrame } from '../components/motifs/AxisFrame';
import { TerminalLabel } from '../components/motifs/TerminalLabel';
import { TerminalLoader } from '../components/motifs/TerminalLoader';
import { LensingRing } from '../components/motifs/LensingRing';
import { clsx } from 'clsx';

function LeaderboardPage() {
  const { user, profile } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        let data = [];
        if (user && profile?.role === 'student') {
            // Local leaderboard returns top 10 + current user (if outside top 10)
            const { data: localData, error } = await supabase.rpc('get_local_leaderboard');
            if (error) throw error;
            data = localData || [];
        } else {
            // Public leaderboard
            const { data: publicData, error } = await supabase.rpc('get_public_leaderboard', { p_offset: 0, p_limit: 10 });
            if (error) throw error;
            data = publicData || [];
        }
        
        // Sort by rank, but ensure the current user (if rank > 10) is always at the bottom
        // Wait, get_local_leaderboard already returns them as a UNION ALL, so they are likely at the bottom.
        // Let's just ensure they are sorted by rank, and if it's the current user outside top 10, keep them at end.
        data.sort((a, b) => a.rank - b.rank);
        
        setLeaderboard(data);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user, profile?.role]);

  if (loading) return <div className="min-h-screen bg-void flex justify-center items-center"><TerminalLoader text="FETCHING_GRID_DATA..." /></div>;

  const top3 = leaderboard.slice(0, 3).filter(p => p.rank <= 3);
  const rest = leaderboard.filter(p => p.rank > 3);

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'text-amber border-amber shadow-[0_0_15px_rgba(255,191,0,0.5)]'; // Gold
      case 2: return 'text-white border-white shadow-[0_0_15px_rgba(255,255,255,0.8)]'; // Silver
      case 3: return 'text-orange-400 border-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.3)]'; // Bronze
      default: return 'text-cyan border-cyan shadow-[0_0_10px_rgba(0,240,255,0.2)]';
    }
  };
  
  const getRankColorText = (rank) => getRankColor(rank).split(' ')[0];

  const getPointsBarWidth = (total_points) => {
    const maxPoints = leaderboard[0]?.total_points || 1;
    return `${Math.max(5, (total_points / maxPoints) * 100)}%`;
  };

  const PodiumItem = ({ profileData, rankIndex }) => {
    if (!profileData) return null;
    const isFirst = rankIndex === 1;
    const orderClass = isFirst ? 'order-1 md:order-2 z-10' : rankIndex === 2 ? 'order-2 md:order-1' : 'order-3';
    
    return (
        <div className={clsx(`flex flex-col items-center w-1/3 md:w-1/4 animate-fade-in-up min-w-0`, orderClass)} style={{ animationDelay: `${rankIndex * 150}ms` }}>
            <div className="relative mb-4 flex items-center justify-center w-full">
                {isFirst && <LensingRing size="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40" className="absolute" color="amber" />}
                {!isFirst && <LensingRing size={rankIndex === 2 ? "w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32" : "w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24"} className="absolute opacity-50" color={rankIndex === 2 ? "white" : "orange"} />}
                <div className={clsx("relative z-10 font-display font-black text-2xl sm:text-3xl md:text-5xl", getRankColorText(profileData.rank))}>
                    {profileData.rank}
                </div>
            </div>
            
            <div className={clsx("w-full border-t bg-gradient-to-t from-cyan/10 to-transparent pt-3 sm:pt-4 flex flex-col items-center min-w-0", isFirst ? 'h-28 sm:h-32 md:h-40 border-t-2' : rankIndex === 2 ? 'h-24 sm:h-24 md:h-32' : 'h-20 sm:h-20 md:h-24', getRankColor(profileData.rank).split(' ')[1])}>
                <span className="font-mono font-bold text-white text-[10px] sm:text-xs md:text-sm text-center px-1 truncate w-full uppercase tracking-wider">{profileData.full_name?.split(' ')[0]}</span>
                <span className="font-mono text-cyan text-sm sm:text-lg md:text-xl mt-1 sm:mt-2">{profileData.total_points}</span>
                <span className={clsx("text-[8px] sm:text-[9px] uppercase tracking-widest mt-1 truncate w-full text-center px-1", getRankColorText(profileData.rank))}>{profileData.college?.substring(0, 15)}</span>
            </div>
        </div>
    );
  };

  const renderTableRow = (profileRow, isSeparator = false) => {
    const isMe = profileRow.is_current_user;
    return (
      <React.Fragment key={profileRow.rank + '-' + profileRow.full_name}>
          {isSeparator && (
              <tr>
                  <td colSpan="4" className="bg-obsidian py-2 text-center text-xs font-bold text-sandstone uppercase tracking-widest border-t-2 border-border border-dashed">
                    --- YOUR RANK ---
                  </td>
              </tr>
          )}
          <tr className={clsx('transition-colors', isMe ? 'bg-amber/10 border-l-2 border-l-amber' : 'hover:bg-obsidian')}>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className={clsx("text-sm font-bold", isMe ? "text-amber" : getRankColorText(profileRow.rank))}>
                      {profileRow.rank < 10 ? `0${profileRow.rank}` : profileRow.rank}
                  </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                  <span className={clsx("text-sm uppercase tracking-wider block", isMe ? "text-white font-bold" : "text-sandstone")}>
                      {profileRow.full_name} {isMe && <span className="text-amber ml-2 text-xs">[YOU]</span>}
                  </span>
                  <span className="text-[10px] text-sandstone-dim uppercase tracking-widest mt-1 block">
                      {profileRow.college} (Yr {profileRow.year_of_study})
                  </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap w-1/3">
                  <div className="w-full h-1 bg-obsidian-soft border border-border">
                      <div className={clsx("h-full transition-all duration-1000", isMe ? "bg-amber" : "bg-cyan")} style={{ width: getPointsBarWidth(profileRow.total_points) }}></div>
                  </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className={clsx("text-sm font-bold", isMe ? "text-amber" : "text-cyan")}>{profileRow.total_points}</span>
              </td>
          </tr>
      </React.Fragment>
    );
  };

  const renderMobileRow = (profileRow, isSeparator = false) => {
    const isMe = profileRow.is_current_user;
    return (
        <React.Fragment key={profileRow.rank + '-' + profileRow.full_name}>
            {isSeparator && (
                <div className="bg-obsidian py-2 text-center text-xs font-bold text-sandstone uppercase tracking-widest border-t-2 border-border border-dashed">
                  --- YOUR RANK ---
                </div>
            )}
            <div className={clsx('p-4 flex flex-col gap-3 font-mono', isMe ? 'bg-amber/10 border-l-2 border-l-amber' : '')}>
                <div className="flex justify-between items-start gap-2">
                    <div className="flex items-start gap-3 w-3/4 min-w-0">
                        <span className={clsx("text-xs w-6 text-right mt-0.5 shrink-0", isMe ? "text-amber font-bold" : getRankColorText(profileRow.rank))}>
                            #{profileRow.rank}
                        </span>
                        <div className="flex flex-col min-w-0 flex-grow">
                            <span className={clsx("text-sm uppercase tracking-wider truncate w-full", isMe ? "text-white font-bold" : "text-sandstone")}>
                                {profileRow.full_name} {isMe && <span className="text-amber ml-1 text-xs shrink-0">[YOU]</span>}
                            </span>
                            <span className="text-[9px] text-sandstone-dim uppercase tracking-widest mt-1 truncate w-full">
                                {profileRow.college} (Yr {profileRow.year_of_study})
                            </span>
                        </div>
                    </div>
                    <span className={clsx("text-sm mt-0.5 shrink-0", isMe ? "text-amber font-bold" : "text-cyan")}>{profileRow.total_points}</span>
                </div>
                <div className="w-full h-1 bg-obsidian border border-border mt-1">
                    <div className={clsx("h-full transition-all duration-1000", isMe ? "bg-amber" : "bg-cyan")} style={{ width: getPointsBarWidth(profileRow.total_points) }}></div>
                </div>
            </div>
        </React.Fragment>
    );
  };

  return (
    <div className="bg-void min-h-screen pb-20 relative pt-20">
      <div className="absolute inset-0 axis-grid-bg opacity-20 pointer-events-none fixed"></div>

      {/* Header */}
      <div className="relative border-b border-border bg-obsidian-soft/80 backdrop-blur-md pb-12 pt-12 px-4">
        <div className="max-w-4xl mx-auto text-center relative z-10 animate-fade-in-up">
            <TerminalLabel className="justify-center mb-4">Leaderboard</TerminalLabel>
            <h1 className="text-4xl md:text-5xl font-display font-black text-white tracking-widest uppercase">Leaderboard</h1>
            <p className="mt-4 text-sandstone-dim font-mono text-sm max-w-xl mx-auto">Track top 10 nodes across the network. Performers receive elevated permissions and rewards.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-10">
        
        {/* Podium */}
        {leaderboard.length > 0 && (
            <div className="flex justify-center items-end gap-2 md:gap-4 mb-20 max-w-2xl mx-auto">
                {top3.find(p => p.rank === 2) && <PodiumItem profileData={top3.find(p => p.rank === 2)} rankIndex={2} />}
                {top3.find(p => p.rank === 1) && <PodiumItem profileData={top3.find(p => p.rank === 1)} rankIndex={1} />}
                {top3.find(p => p.rank === 3) && <PodiumItem profileData={top3.find(p => p.rank === 3)} rankIndex={3} />}
            </div>
        )}

        {/* Data View */}
        <AxisFrame variant="cyan" className="!p-0 overflow-hidden animate-slide-in-up">
            
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto w-full">
                <table className="w-full text-left font-mono min-w-[600px]">
                    <thead className="bg-obsidian border-b border-border">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-sandstone uppercase tracking-widest w-24 text-center">RANK</th>
                            <th className="px-6 py-4 text-xs font-bold text-sandstone uppercase tracking-widest">NODE_ID (Name)</th>
                            <th className="px-6 py-4 text-xs font-bold text-sandstone uppercase tracking-widest w-1/3">PROGRESS</th>
                            <th className="px-6 py-4 text-xs font-bold text-sandstone uppercase tracking-widest text-right">METRICS</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {rest.length > 0 ? rest.map((p, index) => {
                            // If this row is the current user and their rank is > 10, add a separator
                            const isSeparator = p.is_current_user && p.rank > 10;
                            return renderTableRow(p, isSeparator);
                        }) : (
                            <tr>
                                <td colSpan="4" className="text-center py-12 text-sandstone-dim text-sm uppercase tracking-widest">No more students to show</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Stacked Card View */}
            <div className="md:hidden flex flex-col divide-y divide-border bg-obsidian-soft">
                <div className="bg-obsidian px-4 py-3 border-b border-border">
                    <span className="text-xs font-mono font-bold text-sandstone uppercase tracking-widest">GLOBAL_READOUT</span>
                </div>
                {rest.length > 0 ? rest.map((p, index) => {
                    const isSeparator = p.is_current_user && p.rank > 10;
                    return renderMobileRow(p, isSeparator);
                }) : (
                    <div className="text-center py-12 font-mono text-sandstone-dim text-sm uppercase tracking-widest">No more students to show</div>
                )}
            </div>

        </AxisFrame>
      </div>
    </div>
  );
}

export default LeaderboardPage;
