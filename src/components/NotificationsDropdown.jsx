import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';
import { PiBell, PiBellRinging } from 'react-icons/pi';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

export default function NotificationsDropdown() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching notifications:', error.message);
      } else {
        setNotifications(data || []);
        setUnreadCount((data || []).filter(n => !n.read).length);
      }
    };

    fetchNotifications();

    const subscription = supabase
      .channel('public:notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `profile_id=eq.${user.id}` }, payload => {
        setNotifications(prev => [payload.new, ...prev].slice(0, 10));
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = async () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      // Mark all as read when opening
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      
      // Optimistically update UI
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', unreadIds);

      if (error) {
        console.error('Error marking notifications read:', error.message);
      }
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={handleOpen}
        className="relative p-2 text-sandstone hover:text-cyan transition-colors"
        aria-label="Notifications"
      >
        {unreadCount > 0 ? (
          <>
            <PiBellRinging className="text-2xl animate-pulse text-amber" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-danger rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
          </>
        ) : (
          <PiBell className="text-2xl" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-obsidian border border-border shadow-2xl z-50">
          <div className="p-3 border-b border-border bg-obsidian-soft flex justify-between items-center">
            <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-white">COMM_LINK_LOGS</h3>
            {unreadCount > 0 && <span className="text-[10px] text-cyan font-mono">{unreadCount} UNREAD</span>}
          </div>
          
          <div className="max-h-[360px] overflow-y-auto scrollbar-thin scrollbar-thumb-cyan/30 scrollbar-track-obsidian-soft">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sandstone-dim text-xs font-mono uppercase tracking-widest">
                NO_MESSAGES_DETECTED
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {notifications.map((notif) => (
                  <li key={notif.id} className={clsx("p-4 transition-colors hover:bg-obsidian-light", !notif.read ? "bg-cyan/5" : "")}>
                    {notif.link ? (
                      <Link to={notif.link} onClick={() => setIsOpen(false)} className="block">
                        <NotificationContent notif={notif} />
                      </Link>
                    ) : (
                      <NotificationContent notif={notif} />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationContent({ notif }) {
  return (
    <div className="flex items-start gap-3">
      <div className={clsx("w-2 h-2 rounded-full mt-1.5 shrink-0", !notif.read ? "bg-cyan shadow-[0_0_8px_rgba(0,240,255,0.6)]" : "bg-border")}></div>
      <div>
        <p className={clsx("text-sm font-mono leading-snug mb-1", !notif.read ? "text-white" : "text-sandstone")}>{notif.message}</p>
        <span className="text-[10px] text-sandstone-dim font-mono block">
          {new Date(notif.created_at).toLocaleDateString()} {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
