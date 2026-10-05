import React, { useState } from 'react';
import { Eye, EyeOff, KeyRound, Link2, Lock, ShieldCheck } from 'lucide-react';
import { authRecoveryService } from '../../services/authRecovery.service';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/account-security.css';

export const AccountSecurity = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);

  const change = async (event) => {
    event.preventDefault();
    setMessage('');
    if (newPassword !== confirm) return setMessage('New passwords do not match.');
    setLoading(true);
    try {
      await authRecoveryService.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirm('');
      setMessage('Password changed successfully.');
    } catch (error) {
      setMessage(error?.message || 'Unable to change password.');
    } finally {
      setLoading(false);
    }
  };

  const sendMagic = async () => {
    if (!user?.email) return setMessage('No account email is available.');
    setMagicLoading(true);
    setMessage('');
    try {
      const result = await authRecoveryService.requestMagicLink(user.email);
      setMessage(result?.previewUrl ? `Magic link created: ${result.previewUrl}` : 'Magic link sent to your email.');
    } catch (error) {
      setMessage(error?.message || 'Unable to send magic link.');
    } finally {
      setMagicLoading(false);
    }
  };

  return (
    <div className="account-security-page">
      <header className="account-security-hero">
        <div>
          <span>ACCOUNT SECURITY</span>
          <h1>Password & Sign-in</h1>
          <p>Change your password, test passwordless access and manage secure account recovery.</p>
        </div>
        <ShieldCheck size={24}/>
      </header>

      {message && <div className="account-security-message">{message}</div>}

      <div className="account-security-grid">
        <section className="account-security-card">
          <div className="account-security-card-head"><KeyRound size={18}/><div><strong>Change Password</strong><span>Update your current account password.</span></div></div>
          <form onSubmit={change} className="account-security-form">
            <label>Current Password<div><Lock size={15}/><input type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required/><button type="button" onClick={() => setShowCurrent((v) => !v)}>{showCurrent ? <EyeOff size={15}/> : <Eye size={15}/>}</button></div></label>
            <label>New Password<div><Lock size={15}/><input type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimum 8 characters" required/><button type="button" onClick={() => setShowNew((v) => !v)}>{showNew ? <EyeOff size={15}/> : <Eye size={15}/>}</button></div></label>
            <label>Confirm New Password<div><Lock size={15}/><input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required/></div></label>
            <button className="account-security-primary" disabled={loading}>{loading ? 'Updating…' : 'Change Password'}</button>
          </form>
        </section>

        <section className="account-security-card">
          <div className="account-security-card-head"><Link2 size={18}/><div><strong>Magic Link Sign-in</strong><span>Passwordless one-time access for {user?.email || 'your account'}.</span></div></div>
          <div className="account-security-info">
            <p>Send a one-time secure link to the account email. The link can be exchanged for an authenticated session.</p>
            <button className="account-security-secondary" onClick={sendMagic} disabled={magicLoading}>{magicLoading ? 'Sending…' : 'Send Magic Link'}</button>
          </div>
        </section>

        <section className="account-security-card account-security-wide">
          <div className="account-security-card-head"><ShieldCheck size={18}/><div><strong>Recovery Flow</strong><span>Recommended automated access recovery sequence.</span></div></div>
          <div className="account-security-flow">
            <span>1. User enters email</span><i>→</i><span>2. Secure token created</span><i>→</i><span>3. Email link opened</span><i>→</i><span>4. Password reset / session granted</span>
          </div>
        </section>
      </div>
    </div>
  );
};
