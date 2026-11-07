import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { error: Error | null }

/** Shows the real error instead of a blank white screen. */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('App crashed:', error, info.componentStack);
  }

  private reset = (): void => {
    try {
      ['fd_cart', 'fd_addresses', 'fd_favourites', 'fd_location', 'fd_user'].forEach((k) => localStorage.removeItem(k));
    } catch {
      /* ignore */
    }
    window.location.href = '/login';
  };

  render(): ReactNode {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ maxWidth: 640, margin: '60px auto', padding: 20, fontFamily: 'system-ui, sans-serif' }}>
        <h2>Something went wrong</h2>
        <p>The page hit an unexpected error. Details:</p>
        <pre style={{ background: '#fef2f2', color: '#991b1b', padding: 12, borderRadius: 8, whiteSpace: 'pre-wrap' }}>
          {this.state.error.message}
        </pre>
        <button className="btn btn-primary" onClick={this.reset}>Clear saved data &amp; go to login</button>
      </div>
    );
  }
}
