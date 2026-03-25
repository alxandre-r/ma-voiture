'use client';

import React from 'react';

interface FamilyErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface FamilyErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class FamilyErrorBoundary extends React.Component<
  FamilyErrorBoundaryProps,
  FamilyErrorBoundaryState
> {
  constructor(props: FamilyErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): FamilyErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Family Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-xl">
              <svg
                className="w-5 h-5 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h5 className="font-bold text-gray-900 dark:text-gray-100">
                Une erreur est survenue
              </h5>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                {this.state.error?.message ||
                  'Impossible de charger cette section. Veuillez réessayer.'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 text-sm bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors cursor-pointer"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
