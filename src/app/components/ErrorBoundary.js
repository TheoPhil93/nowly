'use client';

// Import necessary types from React
import React, { Component, ErrorInfo, ReactNode } from 'react';

// 1. Define interface for Props
interface ErrorBoundaryProps {
  children?: ReactNode; // Error boundaries usually render children. Make optional just in case.
}

// 2. Define interface for State
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null; // Use React's ErrorInfo type
}

/**
 * Error Boundary component to catch and display errors gracefully
 */
// 3. Apply types to the Component generic slots
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // 5. Type the state class property (preferred modern syntax)
  readonly state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  // 4. Type the constructor parameter
  constructor(props: ErrorBoundaryProps) {
    super(props);
    // State initialization is now handled by the class property declaration above
    // this.state = { hasError: false, error: null, errorInfo: null }; // This line can be removed
  }

  // Ensure error and errorInfo types match the state interface
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // 6. IMPORTANT: Set hasError to true when an error is caught!
    this.setState({ hasError: true, error, errorInfo });
  }

  render() {
    // Access state type-safely
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h2 className="text-xl font-semibold text-center text-gray-900 mb-2">
              Etwas ist schiefgelaufen
            </h2>

            <p className="text-gray-600 text-center mb-6">
              Wir entschuldigen uns für die Unannehmlichkeiten. Bitte laden Sie die Seite neu oder versuchen Sie es später erneut.
            </p>

            <div className="flex justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Seite neu laden
              </button>
            </div>

            {/* Display error details in development mode */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6 p-4 bg-gray-100 rounded-md overflow-auto text-xs">
                <p className="font-mono text-red-600">{this.state.error.toString()}</p>
                <p className="font-mono mt-2 text-gray-700">
                  {this.state.errorInfo?.componentStack}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Access props type-safely
    return this.props.children;
  }
}

export default ErrorBoundary;