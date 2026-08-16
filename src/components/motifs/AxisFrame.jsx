import React from 'react';
import { clsx } from 'clsx';
import { CornerMarkers } from './CornerMarkers';

export const AxisFrame = ({ children, variant = 'default', className = '', onClick, hover = false, ...props }) => {
  return (
    <div
      className={clsx(
        "axis-frame p-6",
        variant === 'amber' ? 'axis-frame-amber' : 'axis-frame-cyan',
        hover && 'hover:border-cyan/60 hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] transition-colors duration-200',
        className
      )}
      onClick={onClick}
      {...props}
    >
      <CornerMarkers />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};