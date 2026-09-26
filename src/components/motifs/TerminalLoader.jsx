import React from 'react';
import { clsx } from 'clsx';

export const TerminalLoader = ({ className, text = "LOADING..." }) => {
  return (
    <div className={clsx("flex flex-col items-center justify-center font-mono space-y-4", className)}>
      <div className="relative w-48 h-1 bg-obsidian-soft overflow-hidden rounded-full">
        <div className="absolute inset-0 bg-cyan w-1/3 rounded-full animate-scanline" style={{ animationDirection: 'alternate' }}></div>
      </div>
      <div className="text-cyan text-sm tracking-widest flex items-center gap-2">
        <span className="animate-pulse">{'>'}</span> {text}
      </div>
    </div>
  );
};
