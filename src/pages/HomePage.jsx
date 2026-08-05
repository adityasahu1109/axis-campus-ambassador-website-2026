import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

import { AxisFrame } from '../components/motifs/AxisFrame';
import { TerminalLabel } from '../components/motifs/TerminalLabel';
import { LensingRing } from '../components/motifs/LensingRing';
import { Crosshair } from '../components/motifs/Crosshair';
import { IoChevronDown } from 'react-icons/io5';

// --- Diagnostic Readout Card (Benefits) ---
const DiagnosticCard = ({ index, title, children }) => ( 
    <AxisFrame variant="cyan" hover={true} className="flex flex-col h-full group">
        <TerminalLabel prefix="//">{`DIAGNOSTIC_0${index + 1}`}</TerminalLabel>
        <h3 className="text-xl font-display font-bold text-white mt-4 mb-2 group-hover:text-cyan transition-colors">{title}</h3> 
        <p className="text-sm font-mono text-sandstone-dim leading-relaxed">{children}</p> 
        <div className="mt-auto pt-6 flex justify-end">
            <Crosshair className="opacity-30 group-hover:opacity-100 transition-opacity" />
        </div>
    </AxisFrame>
);

const FaqItem = ({ question, answer, isOpen, onClick, index }) => ( 
    <div className="border-b border-border py-5 font-mono"> 
        <button onClick={onClick} className="flex justify-between items-center w-full text-left group focus:outline-none" aria-expanded={isOpen}> 
            <div className="flex items-center space-x-4">
                <span className="text-cyan text-sm">
                    {`[0${index + 1}]`}
                </span>
                <span className="font-medium text-sm md:text-base text-sandstone group-hover:text-cyan transition-colors">{question}</span> 
            </div>
            <div className="text-cyan">
                {isOpen ? '×' : '+'}
            </div>
        </button> 
        <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
                <p className="pl-12 text-sm text-sandstone-dim leading-relaxed"> 
                    {answer} 
                </p> 
            </div>
        </div> 
    </div> 
);

const ContactTerminal = ({ name, phone, email, role }) => ( 
    <div className="bg-obsidian border border-border p-6 flex flex-col font-mono text-sm relative group"> 
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <TerminalLabel className="mb-4">{role}</TerminalLabel>
        <div className="space-y-2 text-sandstone">
            <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="opacity-50">NAME:</span>
                <span className="text-white">{name}</span>
            </div>
            <div className="flex justify-between border-b border-border/50 py-2">
                <span className="opacity-50">COMMS:</span>
                <a href={`tel:${phone}`} className="text-cyan hover:text-cyan-soft transition-colors">{phone}</a>
            </div>
            <div className="flex justify-between pt-2">
                <span className="opacity-50">NODE:</span>
                <a href={`mailto:${email}`} className="text-amber hover:text-amber-bright transition-colors truncate ml-4">{email}</a>
            </div>
        </div>
    </div> 
);

// --- StatCard with count-up animation ---
const ROLLING_COLUMN = [];
for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 10; j++) {
    ROLLING_COLUMN.push(j);
  }
}

const RollingDigit = ({ digit, isVisible, delay = 0 }) => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setOffset(20 + parseInt(digit, 10));
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setOffset(0);
    }
  }, [isVisible, digit, delay]);

  return (
    <div className="inline-block relative h-[1em] overflow-hidden leading-none align-bottom">
      <div 
        className="flex flex-col transition-transform duration-[2500ms] ease-[cubic-bezier(0.1,0.9,0.2,1)]" 
        style={{ transform: `translateY(-${offset}em)` }}
      >
        {ROLLING_COLUMN.map((n, i) => (
          <span key={i} className="h-[1em] flex items-center justify-center leading-none">{n}</span>
        ))}
      </div>
    </div>
  );
};

const StatCard = ({ endValue, prefix, suffix, label, duration = 2000, isVisible }) => {
  const endValueStr = String(endValue);
  const digits = endValueStr.split('');

  return (
    <AxisFrame variant="cyan" hover={true} className="text-center group overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
      <div className="relative z-10 flex flex-col items-center">
        <Crosshair className="absolute -top-2 -right-2 opacity-50" size={12} />
        <span className="text-4xl sm:text-5xl font-mono font-bold text-cyan drop-shadow-[0_0_8px_rgba(0,240,255,0.5)] flex items-center justify-center">
          {prefix && <span>{prefix}</span>}
          {digits.map((digit, i) => (
            <RollingDigit key={i} digit={digit} isVisible={isVisible} delay={i * 150} />
          ))}
          {suffix && <span>{suffix}</span>}
        </span>
        <p className="mt-4 text-xs font-mono font-bold uppercase tracking-[0.2em] text-sandstone-dim group-hover:text-sandstone transition-colors">{label}</p>
      </div>
    </AxisFrame>
  );
};

function HomePage() {
  const [openFaq, setOpenFaq] = useState(null);
  const handleFaqClick = (index) => setOpenFaq(openFaq === index ? null : index);
  const { profile, loading } = useAuth();
  const navigate = useNavigate();
  
  const statsRef = useRef(null);
  const [isStatsVisible, setIsStatsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsStatsVisible(true); 
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []); 

  useEffect(() => {
    if (!loading && profile) {
      if (profile.role === 'student') navigate('/dashboard', { replace: true });
      else if (profile.role === 'organizer') navigate('/admin', { replace: true });
    }
  }, [profile, loading, navigate]);

  if (loading || profile) return <div className="w-full min-h-screen bg-void" />;
  
  return (
    <div className="bg-void min-h-screen relative overflow-hidden">
      
      {/* Global Grid Motif */}
      <div className="fixed inset-0 axis-grid-bg pointer-events-none z-0"></div>

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-10 z-10">
        
        {/* Split Diagonal Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            {/* Aethel side (Left/Top) */}
            <div className="absolute -top-[50%] -left-[50%] w-[100%] h-[150%] bg-gradient-to-br from-cyan-deep/20 to-transparent -rotate-12 transform origin-center"></div>
            {/* Nix side (Right/Bottom) */}
            <div className="absolute -bottom-[50%] -right-[50%] w-[100%] h-[150%] bg-gradient-to-tl from-amber-deep/10 to-transparent -rotate-12 transform origin-center"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 text-center w-full">
          
          <div className="relative flex justify-center items-center mb-8 h-48 sm:h-64">
            <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
              <LensingRing size="w-64 h-64 sm:w-96 sm:h-96" color="cyan" />
            </div>
            <span className="font-logo text-7xl sm:text-8xl md:text-9xl text-white tracking-widest relative z-10 animate-scale-in drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">AXIS'27</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-tighter mb-4 uppercase leading-none">
            <span className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">Ambassador</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber to-cyan pb-2 pr-2">Network</span>
          </h1>
          
          <div className="mt-8 mb-12 font-mono text-cyan-soft tracking-[0.3em] uppercase text-sm sm:text-base">
            <span className="opacity-50">{'//'}</span> Illuminate the Infinite <span className="opacity-50">{'//'}</span>
          </div>
          
          <div className="mt-12 flex justify-center relative z-30">
            <Link 
              to="/login" 
              state={{ isRegister: true }}
              className="group relative inline-flex items-center justify-center px-8 py-4 font-mono font-bold tracking-widest text-void bg-amber hover:bg-amber-bright uppercase text-sm transition-all duration-300 shadow-[0_0_20px_rgba(255,158,0,0.4)] hover:shadow-[0_0_40px_rgba(255,158,0,0.6)]"
            >
              <span>Initialize_Sequence</span>
              <span className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-[2px] bg-void group-hover:w-6 transition-all"></span>
            </Link>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-cyan opacity-50 z-20">
          <IoChevronDown className="h-6 w-6" />
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="py-20 relative z-20 border-y border-border bg-obsidian-soft/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex justify-center">
            <TerminalLabel prefix=">">SYSTEM_METRICS_READOUT</TerminalLabel>
          </div>
          <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <StatCard endValue={3} prefix="0" label="Days" isVisible={isStatsVisible} />
            <StatCard endValue={35} suffix="+" label="Events" isVisible={isStatsVisible} />
            <StatCard endValue={170} suffix="+" label="Colleges" isVisible={isStatsVisible} />
            <StatCard endValue={25} suffix="k+" label="Footfall" isVisible={isStatsVisible} />
          </div>
        </div>
      </section>

      {/* --- BENEFITS SECTION --- */}
      <section className="py-24 relative z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
             <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">Protocol Advantages</h2>
             <p className="text-sandstone-dim font-mono text-sm max-w-2xl mx-auto">Analyze the strategic benefits of joining the AXIS'27 grid as a primary node.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DiagnosticCard index={0} title="Networking">Establish high-bandwidth connections with technical nodes and industry mentors nationwide.</DiagnosticCard>
            <DiagnosticCard index={1} title="Leadership">Execute command protocols by mobilizing and directing your local campus sub-grid.</DiagnosticCard>
            <DiagnosticCard index={2} title="Skill Upgrade">Install new communication, marketing, and strategic planning modules to your skill tree.</DiagnosticCard>
            <DiagnosticCard index={3} title="Rewards">Acquire exclusive hardware (goodies), verified credentials (certificates), and system privileges.</DiagnosticCard>
          </div>
        </div>
      </section>

      {/* --- CONTACT SECTION (Terminal Form) --- */}
      <section id="contact" className="py-24 relative z-20 border-t border-border bg-obsidian">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
             <TerminalLabel prefix=">">AETHEL_COMMS_SECTOR // SUPPORT</TerminalLabel>
             <h2 className="text-3xl md:text-4xl font-display font-bold text-white mt-4">Establish Connection</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
            <ContactTerminal role="PRIMARY_NODE_LEAD" name="Arya Mali" phone="+91 70588 08402" email="arya@axisvnit.in" />
            <ContactTerminal role="SECONDARY_NODE_LEAD" name="Arnav Garg" phone="+91 72196 53464" email="arnav@axisvnit.in" />
          </div>
        </div>
      </section>
      
      {/* --- FAQ SECTION --- */}
      <section className="py-24 relative z-20 border-t border-border bg-obsidian-soft/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
             <TerminalLabel prefix=">">KNOWLEDGE_BASE // QUERY</TerminalLabel>
             <h2 className="text-3xl md:text-4xl font-display font-bold text-white mt-4">Frequently Asked Questions</h2>
          </div>
          <div className="bg-obsidian border border-border p-6 sm:p-8 relative">
            {/* Decorative Corner Markers for the whole FAQ block */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-sandstone-dim opacity-30"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-sandstone-dim opacity-30"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-sandstone-dim opacity-30"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-sandstone-dim opacity-30"></div>

            {[
                {q: "Who can initiate the Ambassador sequence?", a: "Any active student node currently enrolled in an undergraduate or postgraduate program. First and second-year nodes are highly prioritized for installation."},
                {q: "Are there any credit requirements (fees)?", a: "Negative. The sequence is completely open-source and free. We are establishing a nationwide mesh network of student leaders."},
                {q: "What is the uptime duration?", a: "The sequence runs continuously from initial handshake (selection) until the final runtime of AXIS'27. Timestamps will be relayed via secure email."},
                {q: "How are metrics calculated?", a: "Performance is tracked via a transparent point system on the grid. Tasks yield points upon successful execution and verification. Total score determines leaderboard ranking."}
            ].map((faq, index) => (
                <FaqItem 
                    key={index}
                    index={index}
                    question={faq.q} 
                    answer={faq.a} 
                    isOpen={openFaq === index} 
                    onClick={() => handleFaqClick(index)} 
                />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

export default HomePage;