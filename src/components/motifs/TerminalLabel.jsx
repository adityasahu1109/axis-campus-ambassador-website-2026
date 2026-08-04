import React from 'react';
import { clsx } from 'clsx';

export const TerminalLabel = ({ children, className, prefix = '//' }) => {
  return (
    <div className={clsx("font-mono uppercase tracking-wider text-xs flex items-center gap-2", className)}>
      <span className="text-cyan font-bold">{prefix}</span>
      <span className="text-sandstone font-medium">{children}</span>
    </div>
  );
};
