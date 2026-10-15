import { useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Wallet } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/saas-account-layout.css';

// Account purchase controls have their own shell: no workshop navigation or search.
export function SaaSAccountLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const scrollArea = useRef(null);
  useLayoutEffect(() => {
    if (scrollArea.current) scrollArea.current.scrollTop = 0;
  }, [location.pathname]);
  const signOut = async () => {
    await logout();
    navigate('/login', { replace: true });
  };
  return <div className="saas-account-shell">
    <header className="saas-account-topbar">
      <a href="/account" className="saas-account-brand"><span aria-hidden="true"><Wallet size={21}/></span><div><strong>CubeGears</strong><small>SaaS Account</small></div></a>
      <div className="saas-account-identity"><div><strong>{user?.company?.name || user?.companyName || 'Company Account'}</strong><small>{user?.name || 'Account owner'}</small></div><button type="button" onClick={signOut}><LogOut size={16}/> Sign out</button></div>
    </header>
    <main className="app-scroll-area saas-account-content" ref={scrollArea}><div className="app-content">{children}</div></main>
  </div>;
}

export function WorkspaceAccessNotice({ unavailable = false, onRetry }) {
  const { logout } = useAuth();
  return <div className="saas-workspace-notice"><section>
    <Wallet size={30} aria-hidden="true"/>
    <h1>{unavailable ? 'Unable to verify company access' : 'Workshop access is not active'}</h1>
    <p>{unavailable ? 'Refresh your company access to continue.' : 'Your company owner must activate a module and allow your staff role before you can open the workshop.'}</p>
    <div><button type="button" onClick={onRetry}>Refresh access</button><button type="button" onClick={logout}>Sign out</button></div>
  </section></div>;
}
