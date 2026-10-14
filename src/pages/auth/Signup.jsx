import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import '../../styles/login-system.css';

const INITIAL = {
  workshop_name: '',
  owner_name: '',
  email: '',
  mobile: '',
  city: '',
  state: '',
  country: 'India',
};

export const Signup = () => {
  const [form, setForm] = useState(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [completedEmail, setCompletedEmail] = useState('');

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError('');
  };

  const submit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError('');
    try {
      await apiClient.post('/auth/signup', {
        ...form,
        email: form.email.trim().toLowerCase(),
        workshop_name: form.workshop_name.trim(),
        owner_name: form.owner_name.trim(),
        mobile: form.mobile.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        country: form.country.trim(),
      });
      setCompletedEmail(form.email.trim().toLowerCase());
    } catch (err) {
      setError(err?.message || 'Unable to create your workshop account.');
    } finally {
      setSubmitting(false);
    }
  };

  const fields = [
    { key: 'workshop_name', label: 'Workshop / Company name', autocomplete: 'organization' },
    { key: 'owner_name', label: 'Your full name', autocomplete: 'name' },
    { key: 'email', label: 'Work email', type: 'email', autocomplete: 'email' },
    { key: 'mobile', label: 'Mobile number', type: 'tel', autocomplete: 'tel' },
    { key: 'city', label: 'City', autocomplete: 'address-level2' },
    { key: 'state', label: 'State', autocomplete: 'address-level1' },
    { key: 'country', label: 'Country', autocomplete: 'country-name' },
  ];

  return (
    <main className="login-page">
      <div className="login-shell">
        <section className="login-card">
          <div className="login-brand-row">
            <div className="login-brand-mark">CG</div>
            <div>
              <div className="login-brand-name">CubixGear</div>
              <div className="login-brand-subtitle">Workshop Management</div>
            </div>
          </div>
          {completedEmail ? (
            <div role="status" aria-live="polite">
              <h1 className="login-title">Check your email</h1>
              <p className="login-description">
                Your company account has been created. We sent a secure password setup
                link to {completedEmail}. After setting your password, you will sign in
                as your company's Super Admin, not as a platform administrator.
              </p>
              <Link to="/login" className="login-forgot">Go to sign in</Link>
            </div>
          ) : (
            <>
              <h1 className="login-title">Create your workshop</h1>
              <p className="login-description">
                Create a company workspace and become its protected Super Admin.
                Your access is limited to your own company.
              </p>
              {error && <div className="login-error" role="alert">{error}</div>}
              <form className="login-form" onSubmit={submit}>
                {fields.map(({ key, label, type = 'text', autocomplete }) => (
                  <label className="block" key={key}>
                    <span className="login-field-label">{label}</span>
                    <div className="login-input-shell">
                      <input
                        className="login-input"
                        type={type}
                        autoComplete={autocomplete}
                        value={form[key]}
                        maxLength={key === 'mobile' ? 30 : 180}
                        required
                        onChange={(event) => update(key, event.target.value)}
                      />
                    </div>
                  </label>
                ))}
                <button className="login-submit" type="submit" disabled={submitting}>
                  {submitting ? 'Creating your account…' : 'Create Company Account'}
                </button>
              </form>
              <p className="login-description" style={{ textAlign: 'center', marginTop: '16px' }}>
                Already have an account? <Link to="/login" className="login-forgot">Sign in</Link>
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
};
