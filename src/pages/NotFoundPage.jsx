import React from 'react';
import { Link } from 'react-router-dom';
import { AxisFrame } from '../components/motifs/AxisFrame';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-4">
      <div className="absolute inset-0 axis-grid-bg opacity-20 pointer-events-none fixed"></div>
      <AxisFrame variant="amber" className="max-w-xl w-full z-10 text-center py-16">
        <h1 className="text-6xl font-display font-black text-amber uppercase tracking-widest mb-4 animate-pulse">
          404
        </h1>
        <h2 className="text-xl font-mono font-bold text-white uppercase tracking-widest mb-4">
          NODE_NOT_FOUND
        </h2>
        <p className="font-mono text-sm text-sandstone max-w-md mx-auto mb-8">
          The requested path does not exist in the current grid configuration. The connection has been terminated.
        </p>
        <Link 
          to="/"
          className="inline-block px-8 py-4 bg-amber text-void font-mono font-bold text-xs uppercase tracking-widest hover:bg-amber-bright transition-colors shadow-[0_0_15px_rgba(255,158,0,0.4)]"
        >
          RETURN_TO_BASE
        </Link>
      </AxisFrame>
    </div>
  );
}
