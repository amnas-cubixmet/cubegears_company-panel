
import { ShieldAlert } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getStaffLandingPath } from '../../utils/staffLanding';
import { useFeatureAccess } from '../../context/FeatureAccessContext';
import { routeConfig } from '../../routes/routeConfig';

export const AccessDenied = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const access = useFeatureAccess();
  const firstAllowedRoute = routeConfig.find(route => route.path !== '/dashboard' && access.can(route.permission));
  const landing = access.labelOnly ? firstAllowedRoute?.path || '/profile' : getStaffLandingPath(user);
  const params = new URLSearchParams(location.search);
  const permission = params.get('permission') || 'required permission';

  return (
    <div style={{
      minHeight: '60vh',
      display: 'grid',
      placeItems: 'center',
      padding: '24px'
    }}>
      <section style={{
        width: '100%',
        maxWidth: '520px',
        padding: '28px',
        border: '1px solid var(--border-color, #dbe3ef)',
        borderRadius: '18px',
        background: 'var(--surface, #fff)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '52px',
          height: '52px',
          margin: '0 auto 14px',
          display: 'grid',
          placeItems: 'center',
          borderRadius: '14px',
          background: 'rgba(22,119,255,.10)',
          color: '#1677ff'
        }}>
          <ShieldAlert size={24} />
        </div>

        <h1 style={{ margin: 0, fontSize: '22px' }}>Access denied</h1>
        <p style={{
          margin: '10px auto 0',
          maxWidth: '400px',
          color: 'var(--text-secondary, #64748b)',
          fontSize: '13px',
          lineHeight: 1.6
        }}>
          This module is not activated for your company, or your staff role does not allow it.
        </p>

        <div style={{
          marginTop: '16px',
          padding: '10px 12px',
          borderRadius: '10px',
          background: 'var(--surface-soft, #f8fafc)',
          color: 'var(--text-secondary, #64748b)',
          fontSize: '11px',
          fontWeight: 700
        }}>
          Required: {permission}
        </div>

        <button
          type="button"
          onClick={() => navigate(landing, { replace: true })}
          style={{
            width: '100%',
            minHeight: '44px',
            marginTop: '18px',
            border: 0,
            borderRadius: '10px',
            background: '#1677ff',
            color: '#fff',
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          Go to My Workspace
        </button>
      </section>
    </div>
  );
};
