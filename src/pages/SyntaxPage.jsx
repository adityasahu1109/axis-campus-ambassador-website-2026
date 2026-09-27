import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AxisFrame } from '../components/motifs/AxisFrame';
import { TerminalLabel } from '../components/motifs/TerminalLabel';
import { PiInstagramLogo, PiLinkedinLogo, PiEnvelopeSimple, PiGlobe, PiArrowLeft } from 'react-icons/pi';
import syntaxLogo from '../assets/syntax_logo.png';
import { clsx } from 'clsx';

const TAGLINES = [
  "Where ideas compile into reality.",
  "Think it. Code it. Ship it.",
  "Ship code. Break limits.",
  "Built by coders. Driven by passion.",
  "Debug the ordinary. Deploy the extraordinary."
];

function Typewriter() {
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout;
    const currentFullText = TAGLINES[currentSentenceIndex];

    if (isDeleting) {
      if (currentText === "") {
        setIsDeleting(false);
        setCurrentSentenceIndex((prev) => (prev + 1) % TAGLINES.length);
        timeout = setTimeout(() => {}, 500); // brief pause before typing next
      } else {
        timeout = setTimeout(() => {
          setCurrentText(currentFullText.substring(0, currentText.length - 1));
        }, 50); // delete speed
      }
    } else {
      if (currentText === currentFullText) {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 2000); // pause after typing
      } else {
        timeout = setTimeout(() => {
          setCurrentText(currentFullText.substring(0, currentText.length + 1));
        }, 80); // typing speed
      }
    }

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentSentenceIndex]);

  return (
    <div className="font-mono text-[clamp(0.875rem,2.5vw,1.25rem)] text-cyan mt-6 h-8 flex items-center justify-center">
      <span>{'>'} {currentText}</span>
      <span className="w-2.5 h-[1.2em] bg-cyan ml-1 animate-pulse inline-block align-text-bottom"></span>
    </div>
  );
}

function SyntaxPage() {
  const socialLinks = [
    { name: 'Instagram', url: 'https://www.instagram.com/syntax_vnit/', icon: PiInstagramLogo },
    { name: 'LinkedIn', url: 'https://in.linkedin.com/company/syntaxvnit', icon: PiLinkedinLogo },
    { name: 'Email', url: 'mailto:syntaxvnit@gmail.com', icon: PiEnvelopeSimple },
    { name: 'Website', url: '#', icon: PiGlobe },
  ];

  return (
    <div className="bg-void min-h-screen relative overflow-hidden pb-20 selection:bg-[#8331d8]/30">
      
      {/* Background Grid */}
      <div className="absolute inset-0 axis-grid-bg opacity-30 pointer-events-none fixed z-0"></div>

      {/* BACK BUTTON */}
      <div className="fixed top-6 left-4 sm:left-6 lg:left-8 z-50">
        <Link 
          to="/"
          className="group flex items-center gap-2 px-4 py-2 bg-obsidian-soft/80 backdrop-blur-md border border-border hover:border-cyan hover:bg-cyan/10 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]"
        >
          <PiArrowLeft className="w-4 h-4 text-cyan group-hover:-translate-x-1 transition-transform" />
          <span className="font-mono text-xs font-bold text-sandstone uppercase tracking-widest group-hover:text-cyan transition-colors">Return</span>
        </Link>
      </div>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-28 pb-16 z-10 text-center px-4">
        {/* Background Gradients for SyntaX branding */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[40vh] bg-gradient-to-b from-[#0450db]/10 to-transparent pointer-events-none blur-3xl -z-10"></div>
        <div className="absolute top-20 right-0 w-64 h-64 md:w-96 md:h-96 bg-gradient-to-bl from-[#8331d8]/15 to-transparent pointer-events-none blur-3xl -z-10 rounded-full"></div>

        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <img 
            src={syntaxLogo} 
            alt="SyntaX Logo" 
            className="w-auto h-[clamp(5rem,15vw,8rem)] object-contain drop-shadow-[0_0_25px_rgba(4,80,219,0.5)] animate-fade-in-up" 
          />
          
          <h1 
            className="mt-4 mb-8 text-[clamp(2.5rem,8vw,4.5rem)] font-black tracking-tight bg-gradient-to-br from-[#0450db] to-[#8331d8] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(131,49,216,0.3)] animate-fade-in-up leading-none"
            style={{ fontFamily: 'Inter, system-ui, sans-serif', animationDelay: '100ms' }}
          >
            SyntaX
          </h1>

          <p className="text-[clamp(1rem,3vw,1.25rem)] text-white font-mono max-w-2xl leading-relaxed animate-fade-in-up drop-shadow-md" style={{ animationDelay: '200ms' }}>
            The premier coding club of VNIT Nagpur.<br/>
            Building the future, one commit at a time.
          </p>
          
          <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <Typewriter />
          </div>
        </div>
      </section>

      {/* --- AXIS COLLABORATION / ACKNOWLEDGEMENT --- */}
      <section className="relative py-12 z-10 px-4">
        <div className="max-w-4xl mx-auto">
          <AxisFrame variant="cyan" hover={true} className="!p-[clamp(1.5rem,4vw,3.5rem)] bg-obsidian/80 backdrop-blur-md relative overflow-hidden border-t-4 border-t-cyan shadow-[0_0_30px_rgba(0,240,255,0.05)] text-center">
            
            <div className="relative z-10 flex flex-col items-center">
              
              <div className="flex items-center gap-3 sm:gap-4 text-[clamp(1.5rem,4vw,2.5rem)] opacity-80 mb-8 border-b border-border/50 pb-6 w-full justify-center">
                 <span className="font-logo text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">AXIS'27</span>
                 <span className="text-amber">×</span>
                 <span className="font-black bg-gradient-to-br from-[#0450db] to-[#8331d8] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(131,49,216,0.2)]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>SyntaX</span>
              </div>
              
              <p className="text-sandstone font-mono text-sm sm:text-base leading-relaxed max-w-3xl mb-8">
                SyntaX is grateful to the AXIS team for the opportunity to collaborate on this year's digital experience. AXIS continues to create an exceptional platform for students through its diverse events, competitions, and initiatives, while representing VNIT on a national stage and showcasing the institution's talent beyond campus. Working alongside the AXIS team gives SyntaX an opportunity to contribute its technical expertise to something that reaches a much larger audience. We are thankful to the entire AXIS team for their trust, collaboration, and the opportunity to build something meaningful together.
              </p>

              <p className="text-[clamp(1rem,2vw,1.125rem)] font-bold text-cyan max-w-2xl mx-auto">
                SyntaX wishes the entire AXIS'27 team the very best for the festival and everything ahead.
              </p>
            </div>
          </AxisFrame>
        </div>
      </section>

      {/* --- OUR MISSION --- */}
      <section className="relative py-12 z-10 px-4">
        <div className="max-w-4xl mx-auto">
           <div className="flex items-center gap-4 mb-8">
             <div className="w-2 h-2 bg-cyan shadow-[0_0_10px_rgba(0,240,255,0.8)]"></div>
             <h2 className="text-2xl md:text-3xl font-display font-bold text-white uppercase tracking-wider">Our Mission</h2>
           </div>
           
           <div className="border-l border-border pl-6 ml-1 space-y-6">
             <p className="text-sandstone font-mono text-sm leading-relaxed max-w-3xl">
               SyntaX works to foster a strong coding and technology culture within the college. By maintaining a dynamic and collaborative environment, the club encourages students to explore emerging technologies, build real-world solutions, and elevate their technical proficiency.
             </p>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
               {[
                 "Coding Competitions",
                 "Hackathons",
                 "Technical Workshops",
                 "Cross-club Collaborations"
               ].map((activity, index) => (
                 <div key={index} className="flex items-center gap-3 p-4 bg-obsidian-soft border border-border hover:border-cyan hover:bg-cyan/5 transition-all">
                   <span className="text-cyan font-bold text-lg leading-none">{'>'}</span>
                   <span className="text-sandstone-dim font-mono text-sm uppercase tracking-widest">{activity}</span>
                 </div>
               ))}
             </div>
           </div>
        </div>
      </section>

      {/* --- OUR CONTRIBUTION TO COLLEGE CULTURE --- */}
      <section className="relative py-12 z-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <TerminalLabel prefix=">">OPERATIONAL_SCOPE</TerminalLabel>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white uppercase tracking-wider mt-4">Our Contribution to College Culture</h2>
          </div>
          <div className="pl-6 border-l-2 border-[#0450db]/40 py-2">
            <p className="text-sandstone-dim font-mono text-sm sm:text-base leading-relaxed max-w-3xl">
              SyntaX builds websites and digital experiences for various college initiatives and activities. These projects give members practical development experience while contributing to a stronger technical and digital culture within the college.
            </p>
          </div>
        </div>
      </section>

      {/* --- SOCIALS --- */}
      <section className="relative py-12 z-10 px-4 mt-8">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <h2 className="text-xl md:text-2xl font-display font-bold text-white tracking-wider mb-8 text-center opacity-90">Find us on</h2>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-center w-14 h-14 bg-void border border-border hover:border-[#8331d8] hover:bg-[#8331d8]/10 transition-all duration-300 hover:shadow-[0_0_15px_rgba(131,49,216,0.3)]"
                  aria-label={social.name}
                >
                  <Icon className="w-6 h-6 text-sandstone group-hover:text-[#8331d8] transition-colors" />
                </a>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}

export default SyntaxPage;
