import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';
import { AxisFrame } from '../components/motifs/AxisFrame';
import { TerminalLabel } from '../components/motifs/TerminalLabel';
import { TerminalLoader } from '../components/motifs/TerminalLoader';
import { Link } from 'react-router-dom';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setNotifications(data || []);
      
      // Mark as read after fetching
      const unreadIds = data.filter(n => !n.read).map(n => n.id);
      if (unreadIds.length > 0) {
        await supabase
          .from('notifications')
          .update({ read: true })
          .in('id', unreadIds);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex justify-center items-center">
        <TerminalLoader text="FETCHING_NOTIFICATIONS..." />
      </div>
    );
  }

  return (
    <div className="bg-void min-h-screen pb-20 pt-20 relative">
      <div className="absolute inset-0 axis-grid-bg opacity-20 pointer-events-none fixed"></div>
      
      <div className="max-w-4xl mx-auto px-4 py-12 relative z-10 animate-fade-in-up">
        <TerminalLabel prefix=">">COMMS_LINK // NOTIFICATION_CENTER</TerminalLabel>
        <h1 className="text-4xl font-display font-black text-white tracking-widest uppercase mt-4 mb-12">Alerts</h1>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <AxisFrame variant="cyan" className="p-8 text-center text-sandstone">
              NO_ACTIVE_ALERTS
            </AxisFrame>
          ) : (
            notifications.map((notif, index) => (
              <AxisFrame 
                key={notif.id} 
                variant={notif.type === 'referral_bonus' ? 'amber' : 'cyan'} 
                hover={true} 
                className={`p-6 transition-all duration-300 ${notif.read ? 'opacity-70' : 'opacity-100 shadow-[0_0_15px_rgba(0,240,255,0.2)]'}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest block mb-2 text-sandstone">
                      {new Date(notif.created_at).toLocaleString()} // {notif.type.replace('_', ' ')}
                    </span>
                    <p className="text-white font-mono text-sm">{notif.message}</p>
                  </div>
                  {notif.link && (
                    <Link to={notif.link} className={`text-xs font-mono font-bold uppercase tracking-widest px-4 py-2 border transition-colors ${
                      notif.type === 'referral_bonus' ? 'border-amber text-amber hover:bg-amber hover:text-void' : 'border-cyan text-cyan hover:bg-cyan hover:text-void'
                    }`}>
                      VIEW
                    </Link>
                  )}
                </div>
              </AxisFrame>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
