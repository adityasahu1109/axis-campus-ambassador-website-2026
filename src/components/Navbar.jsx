import React, { useState, useEffect } from 'react';
import { Link, useNavigate, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';
import logoLight from '../assets/logo-light.png';
import logoDark from '../assets/logo-dark.png';

// --- Self-contained Icon Components ---
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;
const HamburgerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;


// --- Self-contained Logo Component (Unchanged from original) ---
const Logo = () => (
    <div className="flex items-center space-x-2">
        <img 
          src={logoLight} 
          alt="Event Logo" 
          className="h-10 w-auto block dark:hidden"
        />
        <img 
          src={logoDark} 
          alt="Event Logo" 
          className="h-10 w-auto hidden dark:block"
        />
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

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

  // --- MODIFICATION: Added text-center to mobile links (Request 5) ---
  const navLinkClasses = "px-3 py-2 rounded-md text-sm font-medium text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors";
  const activeNavLinkClasses = "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white";
  
  const mobileNavLinkClasses = "block px-3 py-2 rounded-md text-base font-medium text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 text-center"; // Added text-center
  const mobileActiveNavLinkClasses = "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white";

  // --- MODIFICATION: Added button-like classes for mobile (Request 4) ---
  const getStartedClass = isMobile => isMobile 
    ? "block px-3 py-2 rounded-md text-base font-medium bg-blue-600 hover:bg-blue-700 text-white text-center font-semibold"
    : "ml-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md transition-colors duration-200";

  const signOutClass = isMobile => isMobile
    ? "block px-3 py-2 rounded-md text-base font-medium bg-red-600 hover:bg-red-700 text-white text-center font-semibold"
    : "ml-4 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-md";
  // --- END MODIFICATION ---


  const renderNavLinks = (isMobile = false) => {
    const linkClass = isMobile ? mobileNavLinkClasses : navLinkClasses;
    const activeClass = isMobile ? mobileActiveNavLinkClasses : activeNavLinkClasses;

    if (!user) {
      return (
        <>
          <NavLink to="/" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ''}`}>Home</NavLink>
          <NavLink to="/leaderboard" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ''}`}>Leaderboard</NavLink>
          <button onClick={handleScrollToContact} className={linkClass}>Contact Us</button>
          {/* --- MODIFICATION: Using new class variable --- */}
          <Link to="/login" className={getStartedClass(isMobile)}>Get Started</Link>
        </>
      );
    }
    if (profile?.role === 'organizer') {
      return (
        <>
          <NavLink to="/admin" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ''}`}>Dashboard</NavLink>
          <NavLink to="/leaderboard" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ''}`}>Global Leaderboard</NavLink>
          <NavLink to="/profile/organizer" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ''}`}>My Profile</NavLink>
          {/* --- MODIFICATION: Using new class variable --- */}
          <button onClick={handleSignOut} className={signOutClass(isMobile)}>Sign Out</button>
        </>
      );
    }
    if (profile?.role === 'student') {
        return (
            <>
                <NavLink to="/dashboard" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ''}`}>My Dashboard</NavLink>
                <NavLink to="/announcements" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ''}`}>Announcements</NavLink>
                <NavLink to="/leaderboard" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ''}`}>Leaderboard</NavLink>
                <NavLink to="/profile" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ''}`}>My Profile</NavLink>
                {/* --- MODIFICATION: Using new class variable --- */}
                <button onClick={handleSignOut} className={signOutClass(isMobile)}>Sign Out</button>
            </>
        );
    }
    {/* --- MODIFICATION: Using new class variable --- */}
    return <button onClick={handleSignOut} className={signOutClass(isMobile)}>Sign Out</button>;
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700/50 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* --- MODIFICATION: Re-structured header for new mobile layout (Requests 1, 2, 3) --- */}
        <div className="flex items-center justify-between h-20">
          
          {/* --- LEFT ITEM: Desktop Logo / Mobile Theme Toggle --- */}
          <div className="flex justify-start">
            <Link to="/" className="hidden md:block">
              <Logo />
            </Link>
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 md:hidden" 
              aria-label="Toggle color scheme"
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>

          {/* --- CENTER ITEM: Mobile Title --- */}
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white md:hidden">
            Campus Ambassador
          </span>

          {/* --- RIGHT ITEM: Desktop Links & Theme / Mobile Hamburger --- */}
          <div className="flex items-center justify-end">
            {/* Desktop Links & Theme Toggle */}
            <div className="hidden md:flex items-center space-x-2">
              {renderNavLinks(false)}
              <button 
                onClick={toggleTheme} 
                className="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800" 
                aria-label="Toggle color scheme"
              >
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>
            
            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 md:hidden"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
            </button>
          </div>
        </div>
        {/* --- END MODIFICATION --- */}
      </nav>

      {/* --- Mobile menu dropdown (Unchanged, but text will now be centered) --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-700">
          <div className="flex flex-col space-y-2 p-4">
            {renderNavLinks(true)}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;