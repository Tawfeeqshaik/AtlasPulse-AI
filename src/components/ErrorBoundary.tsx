import React, { Component, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  props!: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 max-w-md text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h2 className="text-white font-semibold text-xl mb-2">
              Temporary System Interruption
            </h2>
            <p className="text-slate-400 mb-6">
              AtlasPulse AI encountered a temporary issue. 
              This is usually resolved within seconds.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-xl transition-all"
            >
              Reconnect to System
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
