import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center p-4">
          <div className="bg-red-600/20 border border-red-500/30 rounded-xl p-8 text-center max-w-md">
            <h1 className="text-2xl font-bold text-red-300 mb-4">Something went wrong</h1>
            <p className="text-red-200 mb-6 break-words text-sm">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600/50 hover:bg-red-600/70 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
