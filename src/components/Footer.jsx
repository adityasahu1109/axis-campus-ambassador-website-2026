import React from 'react';
// --- MODIFICATION: Import both logos ---
import logoLight from '../assets/logo-light.png';
import logoDark from '../assets/logo-dark.png';
// --- END MODIFICATION ---

// Helper SVG components for social icons
const InstagramIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
const TwitterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" /></svg>;
const LinkedInIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM6 9H2v12h4V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 100-4 2 2 0 000 4z" /></svg>;

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact-footer" className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Parent container aligns all 3 columns to the top on desktop (md:items-start) */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between space-y-6 md:space-y-0">
          
          <div className="flex flex-col items-center md:items-start">
            {/* --- MODIFICATION: Set fixed h-12 (48px) and implement switching --- */}
            <img 
              src={logoLight} 
              alt="Event Logo" 
              className="h-12 w-auto mb-2 block dark:hidden" 
            />
            <img 
              src={logoDark} 
              alt="Event Logo" 
              className="h-12 w-auto mb-2 hidden dark:block" 
            />
            {/* --- END MODIFICATION --- */}
            
            {/* --- MODIFICATION: Removed the tagline paragraph --- */}
            {/* <p className="text-sm text-slate-500 dark:text-slate-400">
              Your Event Tagline Here
            </p> */}
            {/* --- END MODIFICATION --- */}
          </div>

          {/* Middle: Copyright */}
          <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              &copy; {currentYear} AXIS, VNIT Nagpur. All rights reserved.
            </p>
          </div>

          {/* Right Side: Social Media */}
          <div className="flex justify-center md:justify-end space-x-6">
            <a href="https://www.instagram.com/axis_vnit/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-500 dark:hover:text-white transition-colors">
              <span className="sr-only">Instagram</span>
              <InstagramIcon />
            </a>
            <a href="https://twitter.com/axisvnit" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-500 dark:hover:text-white transition-colors">
              <span className="sr-only">Twitter</span>
              <TwitterIcon />
            </a>
            <a href="https://www.linkedin.com/company/axis-vnit-nagpur/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-500 dark:hover:text-white transition-colors">
              <span className="sr-only">LinkedIn</span>
              <LinkedInIcon />
            </a>
          </div>
        </div>
        
      </div>
    </footer>
  );
}

export default Footer;