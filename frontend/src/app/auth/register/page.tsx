'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAppContext } from '@/context/AppContext';
import { Wrench, ShieldAlert, User, Briefcase } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { login, addToast } = useAppContext();

  // Registration fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'TECHNICIAN'>('CUSTOMER');
  
  // Validation / Loading state
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Input Validation
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (name.length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        role,
      });

      if (res.success && res.data?.token && res.data?.user) {
        addToast('Registration successful!', 'success');
        login(res.data.token, res.data.user);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Email might already be in use.');
      addToast(err.message || 'Registration failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - var(--nav-height) - 130px)', padding: '40px 24px' }}>
      <div className="form-card" style={{ maxWidth: '520px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Link href="/" className="logo" style={{ justifyContent: 'center', marginBottom: '16px' }}>
            <Wrench size={32} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '28px' }}>FixItNow</span>
          </Link>
          <h2 style={{ fontSize: '22px', fontWeight: 800 }}>Create Your Account</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Get started as a customer or service technician</p>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'var(--status-declined-bg)', color: 'var(--status-declined)', borderRadius: 'var(--radius-sm)', fontSize: '14px', fontWeight: 500, marginBottom: '20px' }}>
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role Card Selector */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">I want to register as a:</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '6px' }}>
              <div
                onClick={() => setRole('CUSTOMER')}
                style={{
                  border: '2px solid',
                  borderColor: role === 'CUSTOMER' ? 'var(--primary)' : 'var(--surface-border)',
                  background: role === 'CUSTOMER' ? 'var(--primary-glow)' : 'var(--surface)',
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <User size={24} style={{ color: role === 'CUSTOMER' ? 'var(--primary)' : 'var(--text-muted)' }} />
                <span style={{ fontWeight: 700, fontSize: '14px' }}>Customer</span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Book home services</span>
              </div>

              <div
                onClick={() => setRole('TECHNICIAN')}
                style={{
                  border: '2px solid',
                  borderColor: role === 'TECHNICIAN' ? 'var(--primary)' : 'var(--surface-border)',
                  background: role === 'TECHNICIAN' ? 'var(--primary-glow)' : 'var(--surface)',
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <Briefcase size={24} style={{ color: role === 'TECHNICIAN' ? 'var(--primary)' : 'var(--text-muted)' }} />
                <span style={{ fontWeight: 700, fontSize: '14px' }}>Technician</span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Provide home services</span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              placeholder="e.g. John Doe"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="e.g. name@domain.com"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Minimum 6 characters"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px' }}
            disabled={submitting}
          >
            {submitting ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
