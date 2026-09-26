// src/components/ErrorBoundary.jsx
import React from 'react';
import { AxisFrame } from './motifs/AxisFrame';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-void flex items-center justify-center p-4">
          <AxisFrame variant="danger" className="max-w-xl w-full">
            <h1 className="text-2xl font-display font-black text-danger uppercase tracking-widest mb-4">
              CRITICAL_SYSTEM_FAILURE
            </h1>
            <p className="font-mono text-sm text-sandstone mb-4">
              A runtime exception has occurred. The UI rendering tree crashed.
            </p>
            <pre className="bg-obsidian border border-danger/30 p-4 text-[10px] text-danger overflow-x-auto whitespace-pre-wrap font-mono mb-6">
              {this.state.error?.toString()}
            </pre>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 border border-danger text-danger text-xs font-mono font-bold tracking-widest hover:bg-danger hover:text-white transition-colors"
            >
              INITIATE_REBOOT
            </button>
          </AxisFrame>
        </div>
      );
    }

    return this.props.children; 
  }
}
