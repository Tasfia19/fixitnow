'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAppContext } from '@/context/AppContext';
import { Wrench, ShieldAlert } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, addToast } = useAppContext();
  
  const callbackUrl = searchParams.get('callbackUrl') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      
      if (res.success && res.data?.token && res.data?.user) {
        login(res.data.token, res.data.user);
        
        if (callbackUrl) {
          router.push(callbackUrl);
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Incorrect email or password.');
      addToast(err.message || 'Login failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - var(--nav-height) - 130px)', padding: '40px 24px' }}>
      <div className="form-card">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Link href="/" className="logo" style={{ justifyContent: 'center', marginBottom: '16px' }}>
            <Wrench size={32} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '28px' }}>FixItNow</span>
          </Link>
          <h2 style={{ fontSize: '22px', fontWeight: 800 }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Sign in to manage your appointments & bookings</p>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'var(--status-declined-bg)', color: 'var(--status-declined)', borderRadius: 'var(--radius-sm)', fontSize: '14px', fontWeight: 500, marginBottom: '20px' }}>
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="e.g. customer@fixitnow.com"
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
              placeholder="Enter your password"
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
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link href="/auth/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container section" style={{ textAlign: 'center' }}>Loading auth flow...</div>}>
      <LoginContent />
    </Suspense>
  );
}
