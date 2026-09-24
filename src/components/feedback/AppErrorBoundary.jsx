import React from 'react';

export class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error('[CubixGear] Unhandled render error', error, info);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleDashboard = () => {
    window.location.assign('/dashboard');
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        padding: '24px',
        background: '#0f172a',
        color: '#f8fafc'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '460px',
          border: '1px solid #334155',
          borderRadius: '18px',
          padding: '24px',
          background: '#111827'
        }}>
          <div style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '.12em', color: '#818cf8' }}>CUBIXGEAR</div>
          <h1 style={{ margin: '8px 0', fontSize: '22px' }}>Something went wrong</h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
            The page could not be displayed. Your saved data is not changed by this screen error.
          </p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
            <button onClick={this.handleReload} style={{ flex: 1, minHeight: '42px', border: 0, borderRadius: '10px', background: '#4f46e5', color: '#fff', fontWeight: 700 }}>
              Reload
            </button>
            <button onClick={this.handleDashboard} style={{ flex: 1, minHeight: '42px', borderRadius: '10px', border: '1px solid #334155', background: '#1e293b', color: '#fff', fontWeight: 700 }}>
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default AppErrorBoundary;
