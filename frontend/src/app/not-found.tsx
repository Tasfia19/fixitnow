'use client';

import React from 'react';
import Link from 'next/link';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - var(--nav-height) - 130px)' }}>
      <div className="form-card" style={{ textAlign: 'center', maxWidth: '480px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <HelpCircle size={64} style={{ color: 'var(--primary)' }} />
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 800 }}>404 - Page Not Found</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '32px' }}>
          The page or resource you are looking for has been moved, removed, or does not exist.
        </p>

        <Link href="/" className="btn btn-primary" style={{ width: '100%' }}>
          <ArrowLeft size={16} />
          Back to Home Page
        </Link>
      </div>
    </div>
  );
}
