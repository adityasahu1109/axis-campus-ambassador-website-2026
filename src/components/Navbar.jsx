import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';
import NotificationsDropdown from './NotificationsDropdown';

import { PiSignOut, PiUser, PiSun, PiMoon } from 'react-icons/pi';
import { TerminalLabel } from './motifs/TerminalLabel';
import { AxisFrame } from './motifs/AxisFrame';

const HamburgerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-cyan">
    <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-amber">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Logo = () => (
  <div className="flex items-center space-x-3 group relative">
    <div className="absolute inset-0 bg-cyan blur-[20px] opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"></div>
    <span className="font-logo text-3xl text-white tracking-widest relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-transform group-hover:scale-105">AXIS'27</span>
    <div className="flex flex-col justify-center h-full">
      <span className="text-xs font-display font-bold tracking-widest text-cyan transition-colors leading-[1.1] uppercase">
        Campus
      </span>
      <span className="text-xs font-display font-bold tracking-widest text-white transition-colors leading-[1.1] uppercase">
        Ambassador
      </span>
    </div>
  </div>
);

function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    // Light mode by default, unless explicitly set to dark
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) return storedTheme === 'dark';
    return false;
  });
  const dropdownRef = useRef(null);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function getProfile() {
      if (user) {
        const { data } = await supabase.from('profiles').select('full_name, role').eq('id', user.id).single();
        setProfile(data);
      } else {
        setProfile(null);
      }
    }
    getProfile();
  }, [user]);

  const handleSignOut = async () => { setIsDropdownOpen(false); await signOut(); navigate('/'); };

  const handleScrollToContact = (e) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => { document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }, 100);
    } else {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getStartedClass = "ml-4 font-mono uppercase tracking-widest text-xs px-5 py-2.5 bg-amber hover:bg-amber-bright text-void font-bold transition-all duration-300 shadow-[0_0_15px_rgba(255,158,0,0.3)] hover:shadow-[0_0_25px_rgba(255,158,0,0.5)]";
  const mobileGetStartedClass = "block w-full mt-4 font-mono uppercase tracking-widest text-xs px-5 py-3 bg-amber hover:bg-amber-bright text-void font-bold text-center transition-all duration-300";

  const NavItem = ({ to, children, isMobile, onClick }) => {
    const content = (
      <AxisFrame variant="cyan" hover={true} className={`group overflow-hidden cursor-pointer flex items-center justify-center ${isMobile ? 'py-3 w-full' : 'px-4 py-2 mx-1'}`}>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        <div className="relative z-10 flex items-center">
          <span className="text-cyan-soft mr-2 opacity-50">{'+'}</span>
          <span className="text-xs font-mono tracking-[0.1em] uppercase text-sandstone group-hover:text-cyan transition-colors">
            {children}
          </span>
        </div>
      </AxisFrame>
    );

    if (isMobile) {
      return to ? (
        <NavLink to={to} className="block w-full mt-2" onClick={() => { if (onClick) onClick(); setIsMobileMenuOpen(false); }}>
          {content}
        </NavLink>
      ) : (
        <button onClick={() => { if (onClick) onClick(); setIsMobileMenuOpen(false); }} className="block w-full mt-2">
          {content}
        </button>
      );
    }

    return to ? (
      <NavLink to={to} className="inline-block">
        {content}
      </NavLink>
    ) : (
      <button onClick={onClick} className="inline-block">
        {content}
      </button>
    );
  };

  const ThemeToggle = ({ isMobile = false }) => (
    <button 
      onClick={() => setIsDark(!isDark)}
      className={clsx(
        "flex items-center justify-center transition-colors text-cyan hover:text-cyan-bright",
        isMobile ? "w-full py-4 bg-obsidian border-y border-border" : "mx-2 w-10 h-10 border border-transparent hover:border-cyan hover:bg-obsidian-soft"
      )}
      aria-label="Toggle Theme"
    >
      {isDark ? <PiSun size={isMobile ? 24 : 20} className="mr-2 md:mr-0" /> : <PiMoon size={isMobile ? 24 : 20} className="mr-2 md:mr-0" />}
      {isMobile && <span className="font-mono text-sm uppercase tracking-widest">{isDark ? 'LIGHT_MODE' : 'DARK_MODE'}</span>}
    </button>
  );

  const renderDesktopLinks = () => {
    if (!user) {
      return (
        <>
          <NavItem to="/">Home</NavItem>
          <NavItem to="/leaderboard">Leaderboard</NavItem>
          <NavItem onClick={handleScrollToContact}>Contact</NavItem>
          <Link to="/login" className={getStartedClass}>Init_Session</Link>
        </>
      );
    }
    if (profile?.role === 'organizer') {
      return (
        <>
          <NavItem to="/admin">Terminal</NavItem>
          <NavItem to="/leaderboard">Grid_Status</NavItem>
          <div className="mx-2 flex items-center">
            <NotificationsDropdown />
          </div>
          <ThemeToggle />
          <UserDropdown />
        </>
      );
    }
    if (profile?.role === 'student') {
      return (
        <>
          <NavItem to="/dashboard">Dashboard</NavItem>
          <NavItem to="/announcements">Comms</NavItem>
          <NavItem to="/leaderboard">Rank</NavItem>
          <div className="mx-2 flex items-center">
            <NotificationsDropdown />
          </div>
          <ThemeToggle />
          <UserDropdown />
        </>
      );
    }
    return <button onClick={handleSignOut} className={`${getStartedClass} !bg-danger hover:!bg-red-600`}>End_Session</button>;
  };

  const renderMobileLinks = () => {
    if (!user) {
      return (
        <>
          <NavItem to="/" isMobile>Home</NavItem>
          <NavItem to="/leaderboard" isMobile>Leaderboard</NavItem>
          <NavItem onClick={handleScrollToContact} isMobile>Contact</NavItem>
          <ThemeToggle isMobile />
          <Link to="/login" className={mobileGetStartedClass}>Init_Session</Link>
        </>
      );
    }
    if (profile?.role === 'organizer') {
      return (
        <>
          <NavItem to="/admin" isMobile>Terminal</NavItem>
          <NavItem to="/leaderboard" isMobile>Grid_Status</NavItem>
          <NavItem to="/notifications" isMobile>Alerts</NavItem>
          <NavItem to="/profile/organizer" isMobile>System_ID</NavItem>
          <ThemeToggle isMobile />
          <button onClick={handleSignOut} className={`${mobileGetStartedClass} !bg-danger hover:!bg-red-600 !text-white`}>End_Session</button>
        </>
      );
    }
    if (profile?.role === 'student') {
      return (
        <>
          <NavItem to="/dashboard" isMobile>Dashboard</NavItem>
          <NavItem to="/announcements" isMobile>Comms</NavItem>
          <NavItem to="/leaderboard" isMobile>Rank</NavItem>
          <NavItem to="/notifications" isMobile>Alerts</NavItem>
          <NavItem to="/profile" isMobile>Profile</NavItem>
          <ThemeToggle isMobile />
          <button onClick={handleSignOut} className={`${mobileGetStartedClass} !bg-danger !text-white`}>End_Session</button>
        </>
      );
    }
    return <button onClick={handleSignOut} className={`${mobileGetStartedClass} !bg-danger !text-white`}>End_Session</button>;
  };

  const UserDropdown = () => {
    const initial = profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U';
    const profileLink = profile?.role === 'organizer' ? '/profile/organizer' : '/profile';

    return (
      <div className="relative ml-4" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center justify-center w-10 h-10 bg-obsidian-soft border border-border text-cyan font-mono font-bold hover:border-cyan hover:shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all focus:outline-none"
        >
          {initial}
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-obsidian-soft border border-border shadow-2xl animate-scale-in origin-top-right z-50">
            <div className="px-4 py-3 border-b border-border mb-1 bg-obsidian">
              <p className="text-sm font-bold text-white truncate font-display">{profile?.full_name || 'User'}</p>
              <p className="text-xs text-sandstone-dim font-mono mt-1 truncate">{user?.email}</p>
            </div>
            <div className="p-1">
              <Link to={profileLink} className="flex items-center px-4 py-2.5 text-sm text-sandstone hover:bg-obsidian hover:text-cyan transition-colors font-mono">
                <PiUser className="mr-3 h-4 w-4" /> System_ID
              </Link>
              <button onClick={handleSignOut} className="flex w-full items-center px-4 py-2.5 text-sm text-danger hover:bg-obsidian transition-colors font-mono mt-1">
                <PiSignOut className="mr-3 h-4 w-4" /> End_Session
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-void/90 backdrop-blur-md border-b border-cyan/10 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            <div className="flex justify-start items-center">
              <Link to="/">
                <Logo />
              </Link>
            </div>

            <div className="flex items-center justify-end">
              <div className="hidden md:flex items-center space-x-2">
                {renderDesktopLinks()}
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-cyan md:hidden hover:bg-obsidian-soft transition-colors ml-4"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Panel - Slides from right */}
      <div
        className={`fixed inset-0 bg-void/80 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div
          className={`absolute top-0 right-0 h-full w-72 bg-obsidian-soft border-l border-cyan/20 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col pt-24 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
          onClick={e => e.stopPropagation()}
        >
          <div className="px-6 mb-6">
            <TerminalLabel>NAV_SYSTEM</TerminalLabel>
          </div>
          <div className="px-2 space-y-1 overflow-y-auto pb-6">
            {renderMobileLinks()}
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;