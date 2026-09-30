import React from 'react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const ForgotPassword = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a' }}>
      <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '12px', border: '1px solid #334155', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ color: '#f8fafc', margin: '0 0 8px 0' }}>Forgot Password</h2>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>Enter your email to receive recovery instructions</p>
        <Input label="Email Address" type="email" placeholder="user@company.com" />
        <Button variant="primary" style={{ width: '100%', marginTop: '12px' }}>Send Instructions</Button>
      </div>
    </div>
  );
};

export const ResetPassword = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a' }}>
      <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '12px', border: '1px solid #334155', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ color: '#f8fafc', margin: '0 0 8px 0' }}>Reset Password</h2>
        <Input label="New Password" type="password" />
        <Input label="Confirm Password" type="password" />
        <Button variant="primary" style={{ width: '100%', marginTop: '12px' }}>Reset Password</Button>
      </div>
    </div>
  );
};
