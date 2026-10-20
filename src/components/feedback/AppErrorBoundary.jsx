import React from 'react';

export class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      componentStack: ''
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error, info) {
    this.setState({
      componentStack: info?.componentStack || ''
    });

    console.error('[CubixGear] React render error', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleDashboard = () => {
    window.location.assign('/dashboard');
  };

  handleCopy = async () => {
    const { error, componentStack } = this.state;
    const details = [
      `${error?.name || 'Error'}: ${error?.message || 'Unknown React error'}`,
      error?.stack || '',
      componentStack ? `Component stack:\n${componentStack}` : ''
    ].filter(Boolean).join('\n\n');

    try {
      await navigator.clipboard.writeText(details);
    } catch {
      // Clipboard may be unavailable in some browser contexts.
    }
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const { error, componentStack: capturedStack } = this.state;
    // Raw error messages, stack traces and component paths can contain tenant data.
    // Show diagnostics only during local development, never to customers.
    const isDevelopment = import.meta.env.DEV;
    const errorName = isDevelopment ? error?.name || 'React render error' : 'Application error';
    const errorMessage = isDevelopment
      ? error?.message || 'Unknown render error'
      : 'This page encountered a problem. Reload it or contact support if the issue continues.';
    const stack = isDevelopment ? error?.stack || '' : '';
    const componentStack = isDevelopment ? capturedStack : '';

    return (
      <div style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        padding: '24px',
        background: '#07111f',
        color: '#f8fafc'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '760px',
          border: '1px solid #334155',
          borderRadius: '18px',
          padding: '24px',
          background: '#0b1627',
          boxShadow: '0 24px 70px rgba(0,0,0,.28)'
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '.12em',
            color: '#1677ff'
          }}>
            CUBIXGEAR · APPLICATION STATUS
          </div>

          <h1 style={{
            margin: '10px 0 4px',
            fontSize: '20px',
            lineHeight: 1.35,
            wordBreak: 'break-word'
          }}>
            {errorName}
          </h1>

          <div style={{
            marginTop: '10px',
            padding: '12px 14px',
            border: '1px solid rgba(248,113,113,.25)',
            borderRadius: '10px',
            background: 'rgba(127,29,29,.15)',
            color: '#fecaca',
            fontSize: '13px',
            lineHeight: 1.55,
            whiteSpace: 'pre-wrap',
            overflowWrap: 'anywhere'
          }}>
            {errorMessage}
          </div>

          {(stack || componentStack) && (
            <details open style={{ marginTop: '14px' }}>
              <summary style={{
                cursor: 'pointer',
                color: '#93c5fd',
                fontSize: '11px',
                fontWeight: 800
              }}>
                Technical details
              </summary>

              {stack && (
                <pre style={{
                  margin: '10px 0 0',
                  maxHeight: '250px',
                  overflow: 'auto',
                  padding: '12px',
                  border: '1px solid #26364d',
                  borderRadius: '10px',
                  background: '#06101d',
                  color: '#cbd5e1',
                  fontSize: '10px',
                  lineHeight: 1.55,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {stack}
                </pre>
              )}

              {componentStack && (
                <pre style={{
                  margin: '10px 0 0',
                  maxHeight: '220px',
                  overflow: 'auto',
                  padding: '12px',
                  border: '1px solid #26364d',
                  borderRadius: '10px',
                  background: '#06101d',
                  color: '#94a3b8',
                  fontSize: '10px',
                  lineHeight: 1.55,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {componentStack}
                </pre>
              )}
            </details>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: isDevelopment ? 'repeat(3,minmax(0,1fr))' : 'repeat(2,minmax(0,1fr))',
            gap: '9px',
            marginTop: '18px'
          }}>
            <button
              onClick={this.handleReload}
              style={{
                minHeight: '42px',
                border: 0,
                borderRadius: '10px',
                background: '#1677ff',
                color: '#fff',
                fontWeight: 750,
                cursor: 'pointer'
              }}
            >
              Reload
            </button>

            <button
              onClick={this.handleDashboard}
              style={{
                minHeight: '42px',
                borderRadius: '10px',
                border: '1px solid #334155',
                background: '#132238',
                color: '#fff',
                fontWeight: 750,
                cursor: 'pointer'
              }}
            >
              Dashboard
            </button>

            {isDevelopment && (
            <button
              onClick={this.handleCopy}
              style={{
                minHeight: '42px',
                borderRadius: '10px',
                border: '1px solid #334155',
                background: '#0a1627',
                color: '#cbd5e1',
                fontWeight: 750,
                cursor: 'pointer'
              }}
            >
              Copy Error
            </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default AppErrorBoundary;
