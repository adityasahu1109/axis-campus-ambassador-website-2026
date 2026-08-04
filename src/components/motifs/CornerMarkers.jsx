import React from 'react';
import { clsx } from 'clsx';

export const CornerMarkers = ({ className }) => {
  return (
    <div className={clsx("absolute inset-0 pointer-events-none rounded-[inherit]", className)}>
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan rounded-tl-[inherit]" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan rounded-tr-[inherit]" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyan rounded-bl-[inherit]" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan rounded-br-[inherit]" />
    </div>
  );
};
