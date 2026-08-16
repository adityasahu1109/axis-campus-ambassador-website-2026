import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { AxisFrame } from '../components/motifs/AxisFrame';
import { TerminalLabel } from '../components/motifs/TerminalLabel';
import { TerminalLoader } from '../components/motifs/TerminalLoader';
import { LensingRing } from '../components/motifs/LensingRing';
import { clsx } from 'clsx';

function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRankData, setMyRankData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // 1. Fetch top 10
        const { data: top10Data, error: top10Error } = await supabase.rpc('get_top_10');
        if (top10Error) throw top10Error;
        setLeaderboard(top10Data || []);

        if (user) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles').select('role').eq('id', user.id).single();
          if (profileError) throw profileError;

          if (profileData.role === 'student') {
            const { data: rankData, error: rankError } = await supabase.rpc('get_my_rank', { p_profile_id: user.id }).maybeSingle();
            if (!rankError && rankData) setMyRankData(rankData);
          }
        } else {
          setMyRankData(null);
        }
      } catch (error) {
        console.error('Error fetching leaderboard data:', error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  if (loading) return <div className="min-h-screen bg-void flex justify-center items-center"><TerminalLoader text="FETCHING_GRID_DATA..." /></div>;

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  const getTierColor = (tier) => {
    switch (tier) {
      case 'platinum': return 'text-white border-white shadow-[0_0_15px_rgba(255,255,255,0.8)]';
      case 'gold': return 'text-amber border-amber shadow-[0_0_15px_rgba(255,191,0,0.5)]';
      case 'silver': return 'text-gray-300 border-gray-300 shadow-[0_0_10px_rgba(209,213,219,0.3)]';
      default: return 'text-cyan border-cyan shadow-[0_0_10px_rgba(0,240,255,0.2)]';
    }
  };

  const getPointsBarWidth = (total_points) => {
    const maxPoints = leaderboard[0]?.total_points || 1;
    return `${Math.max(5, (total_points / maxPoints) * 100)}%`;
  };

  const PodiumItem = ({ profile, rankIndex }) => {
    if (!profile) return null;
    const isFirst = rankIndex === 1;
    const orderClass = isFirst ? 'order-1 md:order-2 z-10' : rankIndex === 2 ? 'order-2 md:order-1' : 'order-3';
    
    return (
        <div className={clsx(`flex flex-col items-center w-1/3 md:w-1/4 animate-fade-in-up`, orderClass)} style={{ animationDelay: `${rankIndex * 150}ms` }}>
            <div className="relative mb-4 flex items-center justify-center">
                {isFirst && <LensingRing size="w-32 h-32 md:w-40 md:h-40" className="absolute" color={profile.tier === 'gold' ? 'amber' : 'cyan'} />}
                {!isFirst && <LensingRing size={rankIndex === 2 ? "w-24 h-24 md:w-32 md:h-32" : "w-20 h-20 md:w-24 md:h-24"} className="absolute opacity-50" color="cyan" />}
                <div className={clsx("relative z-10 font-display font-black text-3xl md:text-5xl", getTierColor(profile.tier).split(' ')[0])}>
                    {profile.rank}
                </div>
            </div>
            
            <div className={clsx("w-full border-t bg-gradient-to-t from-cyan/10 to-transparent pt-4 flex flex-col items-center", isFirst ? 'h-32 md:h-40 border-t-2' : rankIndex === 2 ? 'h-24 md:h-32' : 'h-20 md:h-24', getTierColor(profile.tier).split(' ')[1])}>
                <span className="font-mono font-bold text-white text-xs md:text-sm text-center px-1 truncate w-full uppercase tracking-wider">{profile.full_name?.split(' ')[0]}</span>
                <span className="font-mono text-cyan text-lg md:text-xl mt-2">{profile.total_points}</span>
                <span className={clsx("text-[9px] uppercase tracking-widest mt-1", getTierColor(profile.tier).split(' ')[0])}>[{profile.tier}]</span>
            </div>
        </div>
    );
  };

  const renderTableRow = (profileRow, isMyRankRow = false) => {
    const isMe = profileRow.id === user?.id;
    return (
      <tr key={profileRow.id + (isMyRankRow ? '-me' : '')} className={clsx('transition-colors', isMe ? 'bg-amber/10 border-l-2 border-l-amber' : 'hover:bg-obsidian')}>
          <td className="px-6 py-4 whitespace-nowrap text-center">
              <div className={clsx("text-sm", isMe ? "text-amber font-bold" : "text-cyan")}>
                  {profileRow.rank < 10 ? `0${profileRow.rank}` : profileRow.rank}
              </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
              <span className={clsx("text-sm uppercase tracking-wider", isMe ? "text-white font-bold" : "text-sandstone")}>
                  {profileRow.full_name} {isMe && <span className="text-amber ml-2 text-xs">[YOU]</span>}
              </span>
              <span className={clsx("ml-3 text-[10px] px-2 py-0.5 uppercase tracking-widest border", getTierColor(profileRow.tier))}>
                  {profileRow.tier}
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
    );
  };

  const renderMobileRow = (profileRow, isMyRankRow = false) => {
    const isMe = profileRow.id === user?.id;
    return (
        <div key={profileRow.id + (isMyRankRow ? '-me' : '')} className={clsx('p-4 flex flex-col gap-3 font-mono', isMe ? 'bg-amber/10 border-l-2 border-l-amber' : '')}>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className={clsx("text-xs w-6 text-right", isMe ? "text-amber font-bold" : "text-cyan")}>
                        #{profileRow.rank}
                    </span>
                    <span className={clsx("text-sm uppercase tracking-wider truncate", isMe ? "text-white font-bold" : "text-sandstone")}>
                        {profileRow.full_name} {isMe && <span className="text-amber ml-1 text-xs">[YOU]</span>}
                    </span>
                    <span className={clsx("text-[9px] px-1.5 py-0.5 uppercase tracking-widest border", getTierColor(profileRow.tier))}>
                        {profileRow.tier}
                    </span>
                </div>
                <span className={clsx("text-sm", isMe ? "text-amber font-bold" : "text-cyan")}>{profileRow.total_points}</span>
            </div>
            <div className="w-full h-1 bg-obsidian border border-border mt-1">
                <div className={clsx("h-full transition-all duration-1000", isMe ? "bg-amber" : "bg-cyan")} style={{ width: getPointsBarWidth(profileRow.total_points) }}></div>
            </div>
        </div>
    );
  };

  return (
    <div className="bg-void min-h-screen pb-20 relative pt-20">
      <div className="absolute inset-0 axis-grid-bg opacity-20 pointer-events-none fixed"></div>

      {/* Header */}
      <div className="relative border-b border-border bg-obsidian-soft/80 backdrop-blur-md pb-12 pt-12 px-4">
        <div className="max-w-4xl mx-auto text-center relative z-10 animate-fade-in-up">
            <TerminalLabel className="justify-center mb-4">GLOBAL_GRID // RANKING_SYSTEM</TerminalLabel>
            <h1 className="text-4xl md:text-5xl font-display font-black text-white tracking-widest uppercase">Leaderboard</h1>
            <p className="mt-4 text-sandstone-dim font-mono text-sm max-w-xl mx-auto">Track top 10 nodes across the network. Performers receive elevated permissions and hardware rewards based on tier.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-10">
        
        {/* Podium */}
        {leaderboard.length > 0 && (
            <div className="flex justify-center items-end gap-2 md:gap-4 mb-20 max-w-2xl mx-auto">
                {top3[1] && <PodiumItem profile={top3[1]} rankIndex={2} />}
                {top3[0] && <PodiumItem profile={top3[0]} rankIndex={1} />}
                {top3[2] && <PodiumItem profile={top3[2]} rankIndex={3} />}
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
                        {rest.length > 0 ? rest.map(p => renderTableRow(p)) : (
                            <tr>
                                <td colSpan="4" className="text-center py-12 text-sandstone-dim text-sm uppercase tracking-widest">NO_ADDITIONAL_NODES</td>
                            </tr>
                        )}
                        
                        {/* If user is student, and not in top 10, show them at bottom */}
                        {myRankData && myRankData.rank > 10 && (
                          <>
                            <tr>
                              <td colSpan="4" className="bg-obsidian py-2 text-center text-xs font-bold text-sandstone uppercase tracking-widest border-t-2 border-border border-dashed">
                                --- YOUR RANK ---
                              </td>
                            </tr>
                            {renderTableRow(myRankData, true)}
                          </>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Stacked Card View */}
            <div className="md:hidden flex flex-col divide-y divide-border bg-obsidian-soft">
                <div className="bg-obsidian px-4 py-3 border-b border-border">
                    <span className="text-xs font-mono font-bold text-sandstone uppercase tracking-widest">GLOBAL_READOUT</span>
                </div>
                {rest.length > 0 ? rest.map(p => renderMobileRow(p)) : (
                    <div className="text-center py-12 font-mono text-sandstone-dim text-sm uppercase tracking-widest">NO_ADDITIONAL_NODES</div>
                )}

                {myRankData && myRankData.rank > 10 && (
                  <>
                    <div className="bg-obsidian py-2 text-center text-xs font-bold text-sandstone uppercase tracking-widest border-t-2 border-border border-dashed">
                      --- YOUR RANK ---
                    </div>
                    {renderMobileRow(myRankData, true)}
                  </>
                )}
            </div>

        </AxisFrame>
      </div>
    </div>
  );
}

export default LeaderboardPage;