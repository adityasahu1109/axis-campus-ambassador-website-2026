import React from 'react';
import { clsx } from 'clsx';

export const Crosshair = ({ className, size = 16 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={clsx("text-cyan", className)}
    >
      <path d="M12 2V22M2 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};
