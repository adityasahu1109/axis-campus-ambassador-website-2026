import React from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaTwitter, FaLinkedinIn } from 'react-icons/fa';
import { CornerMarkers } from './motifs/CornerMarkers';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact-footer" className="relative bg-obsidian-soft border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-center md:items-start">
          
          {/* Logo / System ID Column */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <div className="font-mono text-sm tracking-widest text-cyan uppercase">
              SYS.ID: AXIS-2027
            </div>
            <p className="text-sm text-sandstone-dim font-mono text-center md:text-left">
              Developed by AXIS,<br/>VNIT Nagpur
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
             <h4 className="text-xs font-bold text-sandstone uppercase tracking-widest mb-1 opacity-50 font-mono">// EXTERNAL_COMMS</h4>
             <div className="flex space-x-4">
                <a href="https://www.instagram.com/axis_vnit/" target="_blank" rel="noopener noreferrer" 
                   className="relative w-10 h-10 bg-obsidian flex items-center justify-center text-sandstone hover:text-cyan hover:bg-cyan/10 transition-all group">
                  <CornerMarkers className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="sr-only">Instagram</span>
                  <FaInstagram className="h-4 w-4 relative z-10" />
                </a>
                <a href="https://twitter.com/axisvnit" target="_blank" rel="noopener noreferrer" 
                   className="relative w-10 h-10 bg-obsidian flex items-center justify-center text-sandstone hover:text-cyan hover:bg-cyan/10 transition-all group">
                  <CornerMarkers className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="sr-only">Twitter</span>
                  <FaTwitter className="h-4 w-4 relative z-10" />
                </a>
                <a href="https://www.linkedin.com/company/axis-vnit-nagpur/" target="_blank" rel="noopener noreferrer" 
                   className="relative w-10 h-10 bg-obsidian flex items-center justify-center text-sandstone hover:text-cyan hover:bg-cyan/10 transition-all group">
                  <CornerMarkers className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="sr-only">LinkedIn</span>
                  <FaLinkedinIn className="h-4 w-4 relative z-10" />
                </a>
             </div>
          </div>
        </div>
        
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