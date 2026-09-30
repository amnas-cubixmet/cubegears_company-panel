import React from 'react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const GeneralSettings = () => (
  <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px' }}>
    <h2 style={{ color: '#f8fafc', marginBottom: '20px' }}>General Configuration</h2>
    <Input label="System Currency" defaultValue="USD ($)" />
    <Input label="Timezone" defaultValue="UTC (GMT+0)" />
    <Button variant="primary">Save Changes</Button>
  </div>
);

export const CompanySettings = () => <div style={{ color: '#fff' }}>Company Profile & Business Details</div>;
export const UserSettings = () => <div style={{ color: '#fff' }}>User Profile & Password Management</div>;
export const RolePermissions = () => <div style={{ color: '#fff' }}>Role Based Access Control Setup</div>;
export const BillingSettings = () => <div style={{ color: '#fff' }}>Subscription Plan & Payment Methods</div>;
export const NotificationSettings = () => <div style={{ color: '#fff' }}>Notification Preferences</div>;
