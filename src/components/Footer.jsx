import React from 'react';
import { Link } from 'react-router-dom';
import { PiInstagramLogo, PiTwitterLogo, PiLinkedinLogo } from 'react-icons/pi';
import { AxisFrame } from './motifs/AxisFrame';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact-footer" className="relative bg-obsidian-soft border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <AxisFrame variant="cyan" hover={false} className="!p-8 sm:!p-12 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-center md:items-start">
          
          {/* Logo / System ID Column */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <span className="font-logo text-3xl sm:text-4xl text-white tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">AXIS'27</span>
            <p className="text-sm text-sandstone-dim font-mono text-center md:text-left">
              Made in collaboration with<br/>SyntaX, VNIT
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="flex flex-col items-center space-y-3 font-mono">
             <h4 className="text-xs font-bold text-sandstone uppercase tracking-widest mb-2 opacity-50">// NAV_LINKS</h4>
             <Link to="/" className="text-sm text-sandstone hover:text-cyan transition-colors">Home</Link>
             <Link to="/leaderboard" className="text-sm text-sandstone hover:text-cyan transition-colors">Leaderboard</Link>
             <Link to="/login" className="text-sm text-sandstone hover:text-cyan transition-colors">Init_Session</Link>
          </div>

          {/* Social Media Column */}
          <div className="flex flex-col items-center md:items-end space-y-4">
             <h4 className="text-xs font-bold text-sandstone uppercase tracking-widest mb-4 opacity-50 font-mono">// EXTERNAL_COMMS</h4>
             <div className="flex space-x-4">
                <a href="https://www.instagram.com/axis_vnit/" target="_blank" rel="noopener noreferrer" 
                   className="relative w-12 h-12 bg-void border border-border flex items-center justify-center text-white hover:text-amber hover:border-amber hover:bg-amber/10 transition-all duration-300 group hover:shadow-[0_0_15px_rgba(255,158,0,0.3)]">
                  <span className="sr-only">Instagram</span>
                  <PiInstagramLogo className="h-5 w-5 relative z-10" />
                </a>
                <a href="https://twitter.com/axisvnit" target="_blank" rel="noopener noreferrer" 
                   className="relative w-12 h-12 bg-void border border-border flex items-center justify-center text-white hover:text-cyan hover:border-cyan hover:bg-cyan/10 transition-all duration-300 group hover:shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                  <span className="sr-only">Twitter</span>
                  <PiTwitterLogo className="h-5 w-5 relative z-10" />
                </a>
                <a href="https://www.linkedin.com/company/axis-vnit-nagpur/" target="_blank" rel="noopener noreferrer" 
                   className="relative w-12 h-12 bg-void border border-border flex items-center justify-center text-white hover:text-amber hover:border-amber hover:bg-amber/10 transition-all duration-300 group hover:shadow-[0_0_15px_rgba(255,158,0,0.3)]">
                  <span className="sr-only">LinkedIn</span>
                  <PiLinkedinLogo className="h-5 w-5 relative z-10" />
                </a>
             </div>
          </div>
        </div>
        </AxisFrame>
        
        <div className="mt-12 pt-8 border-t border-border text-center flex flex-col md:flex-row justify-between items-center font-mono text-xs text-sandstone-dim">
            <p>
              &copy; {currentYear} AXIS, VNIT Nagpur.
            </p>
            <p className="mt-2 md:mt-0 opacity-50">
              ALL_SYSTEMS_NOMINAL
            </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;