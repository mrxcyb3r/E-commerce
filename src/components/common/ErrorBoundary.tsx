import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex items-center justify-center px-6">
          <div className="text-center space-y-4">
            <div className="text-lg font-black tracking-tight">
              Nimadir noto'g'ri ketdi
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Sahifa yuklanayotganda xatolik yuz berdi.
            </p>
            <button
              onClick={this.handleReload}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 hover:opacity-90 transition-opacity"
            >
              Qayta yuklash
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
