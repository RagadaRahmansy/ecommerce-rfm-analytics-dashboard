import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error(`[ErrorBoundary caught in ${this.props.name || 'Component'}]:`, error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-2xl bg-error-container/20 border border-error/40 text-on-surface my-4 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-error text-[28px]">error</span>
            <div>
              <h3 className="text-lg font-bold text-error">
                Kesalahan pada Modul: {this.props.name || 'Component'}
              </h3>
              <p className="text-sm text-on-surface-variant">
                Modul ini mengalami kendala teknis tanpa memengaruhi halaman atau komponen lain di dashboard.
              </p>
            </div>
          </div>
          <div className="p-3 bg-surface-container-lowest rounded-xl font-mono text-xs text-error overflow-x-auto mb-4 border border-outline-variant/30 max-h-40">
            {this.state.error?.toString()}
          </div>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 bg-error hover:bg-error/90 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-error/20"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            Coba Muat Ulang Modul
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
