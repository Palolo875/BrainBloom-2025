'use client'

import React, { Component, ReactNode } from 'react'
import { useAppStore } from '@/lib/stores/app-store'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Log error to performance monitoring
    try {
      useAppStore.getState().recordMetric('error.boundary', 1)
      useAppStore.getState().addToast({
        message: 'Something went wrong, but we kept the app running',
        type: 'error',
        duration: 5000
      })
    } catch (e) {
      console.warn('Failed to log error to store:', e)
    }
    
    // Call custom error handler
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 text-4xl">🌱</div>
          <h2 className="mb-2 text-lg font-semibold text-foreground">
            Oops! Something went wrong
          </h2>
          <p className="mb-4 text-sm text-muted-foreground max-w-md">
            Don't worry, your data is safe. Try refreshing the page or going back to the previous view.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm font-medium text-foreground bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook-based error boundary for functional components
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

// Simple fallback components
export function SimpleEditor() {
  return (
    <div className="w-full h-full p-4 bg-card border border-border rounded-lg">
      <textarea 
        className="w-full h-full border-none resize-none focus:outline-none bg-transparent text-foreground placeholder:text-muted-foreground"
        placeholder="Simple editor mode - Write your note here..."
      />
    </div>
  )
}

export function EditorSkeleton() {
  return (
    <div className="w-full h-full p-4 bg-card border border-border rounded-lg animate-pulse">
      <div className="space-y-4">
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
        <div className="h-4 bg-muted rounded w-5/6"></div>
        <div className="h-4 bg-muted rounded w-2/3"></div>
      </div>
    </div>
  )
}

export function AssistantSkeleton() {
  return (
    <div className="w-full h-full p-4 bg-card border-l border-border animate-pulse">
      <div className="space-y-4">
        <div className="h-6 bg-muted rounded w-1/2 mb-6"></div>
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded w-full"></div>
          <div className="h-3 bg-muted rounded w-4/5"></div>
          <div className="h-3 bg-muted rounded w-3/4"></div>
        </div>
      </div>
    </div>
  )
}

export function LoadingSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="space-y-4">
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
        <div className="h-4 bg-muted rounded w-5/6"></div>
      </div>
    </div>
  )
}