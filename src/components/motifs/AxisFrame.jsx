import React from 'react';
import { clsx } from 'clsx';
import { CornerMarkers } from './CornerMarkers';

export const AxisFrame = ({ children, className, variant = 'cyan', hover = false, ...props }) => {
  return (
    <div 
      className={clsx(
        "axis-frame p-6", 
        variant === 'amber' ? 'axis-frame-amber' : 'axis-frame-cyan',
        className
      )}
      {...props}
    >
      <CornerMarkers />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
