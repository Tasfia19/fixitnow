'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled Application Error:', error);
  }, [error]);

  return (
    <div className="section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - var(--nav-height) - 130px)' }}>
      <div className="form-card" style={{ textAlign: 'center', maxWidth: '520px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <AlertCircle size={64} style={{ color: 'var(--status-declined)' }} />
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Something went wrong!</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '24px' }}>
          {error.message || 'An unexpected runtime error occurred while rendering this page.'}
        </p>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => reset()}
            className="btn btn-primary"
            style={{ flex: 1 }}
          >
            <RotateCcw size={16} />
            Try Again
          </button>
          <Link href="/" className="btn btn-secondary" style={{ flex: 1 }}>
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
