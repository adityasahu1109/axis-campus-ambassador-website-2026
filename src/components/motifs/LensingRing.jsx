import React from 'react';
import { clsx } from 'clsx';

export const LensingRing = ({ className, size = 'w-64 h-64', color = 'cyan' }) => {
  const strokeColor = color === 'cyan' ? 'stroke-cyan' : 'stroke-amber';
  const glowColor = color === 'cyan' ? 'shadow-cyan' : 'shadow-amber';

  return (
    <div className={clsx(`relative flex items-center justify-center animate-spin-slow`, size, className)}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-20" fill="none">
        <ellipse cx="50" cy="50" rx="48" ry="40" className={strokeColor} strokeWidth="0.5" transform="rotate(30 50 50)" />
        <ellipse cx="50" cy="50" rx="46" ry="38" className={strokeColor} strokeWidth="1" transform="rotate(-15 50 50)" />
        <ellipse cx="50" cy="50" rx="49" ry="42" className={strokeColor} strokeWidth="0.2" transform="rotate(75 50 50)" />
      </svg>
      {/* Subtle core glow */}
      <div className={clsx(`absolute inset-0 rounded-full blur-[80px] opacity-10 shadow-[0_0_80px_rgba(0,0,0,1)]`, glowColor)}></div>
    </div>
  );
};
