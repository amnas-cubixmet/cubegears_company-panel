import { useLayoutEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Wallet, User, Store } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/saas-account-layout.css';
import { useFeatureAccess } from '../../context/FeatureAccessContext';
import { routeConfig } from '../../routes/routeConfig';

// Owners always have account, profile and shop navigation; modules follow server access.
export function SaaSAccountLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const access = useFeatureAccess();
  const links = [
    { path: "/account", label: "SaaS Account", icon: Wallet },
    { path: "/profile", label: "Profile", icon: User },
    { path: "/account/company", label: "Shop Details", icon: Store },
    ...routeConfig.filter(route => route.id !== "credits" && access.can(route.permission)),
  ];
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
    <div className="saas-account-body">
    <nav className="saas-owner-sidebar" aria-label="Owner navigation">
      {links.map(({ path, label, icon: Icon }) => <NavLink key={path} to={path} end={path === '/account'} className={({ isActive }) => isActive ? 'is-active' : ''}><Icon size={18}/><span>{label}</span></NavLink>)}
    </nav>
    <main className="app-scroll-area saas-account-content" ref={scrollArea}><div className="app-content">{children}</div></main>
    </div>
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
