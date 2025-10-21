import React, { useState, useEffect } from 'react';
import { Link, useNavigate, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';
import logoLight from '../assets/logo-light.png'; // Make sure this file exists
import logoDark from '../assets/logo-dark.png';   // Make sure this file exists

// --- Self-contained Icon Components ---
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;

// --- Self-contained Logo Component ---
const Logo = () => (
    <div className="flex items-center space-x-2">
        {/* --- MODIFICATION: Increased size from h-10 to h-16 --- */}
        <img 
          src={logoLight} 
          alt="Event Logo" 
          className="h-10 w-auto block dark:hidden" // Show in light mode
        />
        <img 
          src={logoDark} 
          alt="Event Logo" 
          className="h-10 w-auto hidden dark:block" // Show in dark mode
        />
        {/* --- END MODIFICATION --- */}
        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Campus Ambassador
        </span>
    </div>
);


function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };
  
  useEffect(() => {
    async function getProfile() {
      if (user) {
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        setProfile(data);
      } else {
        setProfile(null);
      }
    }
    getProfile();
  }, [user]);

  const handleSignOut = async () => { await signOut(); navigate('/'); };
  
  const handleScrollToContact = (e) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById('contact-footer')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById('contact-footer')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinkClasses = "px-3 py-2 rounded-md text-sm font-medium text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors";
  const activeNavLinkClasses = "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white";

  const renderNavButtons = () => {
    if (!user) {
      return (
        <>
          <NavLink to="/" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Home</NavLink>
          <NavLink to="/leaderboard" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Leaderboard</NavLink>
          <button onClick={handleScrollToContact} className={navLinkClasses}>Contact Us</button>
          <Link to="/login" className="ml-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md transition-colors duration-200">Get Started</Link>
        </>
      );
    }
    if (profile?.role === 'organizer') {
      return (
        <>
          <NavLink to="/admin" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Dashboard</NavLink>
          <NavLink to="/leaderboard" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Global Leaderboard</NavLink>
          <NavLink to="/profile/organizer" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>My Profile</NavLink>
          <button onClick={handleSignOut} className="ml-4 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-md">Sign Out</button>
        </>
      );
    }
    if (profile?.role === 'student') {
        return (
            <>
                <NavLink to="/dashboard" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>My Dashboard</NavLink>
                <NavLink to="/announcements" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Announcements</NavLink>
                <NavLink to="/leaderboard" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Leaderboard</NavLink>
                <NavLink to="/profile" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>My Profile</NavLink>
                <button onClick={handleSignOut} className="ml-4 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-md">Sign Out</button>
            </>
        );
    }
    return <button onClick={handleSignOut} className="ml-4 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-md">Sign Out</button>;
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700/50 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/">
            <Logo />
          </Link>
          <div className="flex items-center space-x-2">
            {renderNavButtons()}
            <button onClick={toggleTheme} className="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800" aria-label="Toggle color scheme">
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;