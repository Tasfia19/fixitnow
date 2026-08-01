'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { XCircle, ArrowLeft } from 'lucide-react';

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking_id');

  return (
    <div className="section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - var(--nav-height) - 130px)' }}>
      <div className="form-card" style={{ textAlign: 'center', maxWidth: '480px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <XCircle size={64} style={{ color: 'var(--status-declined)' }} />
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Payment Cancelled</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '32px' }}>
          The transaction session was cancelled. No charges were made to your account. You can complete payment at any time from your booking dashboard.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link href={`/dashboard/customer`} className="btn btn-primary" style={{ width: '100%' }}>
            Back to Dashboard
          </Link>
          <Link href={`/services`} className="btn btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <ArrowLeft size={14} />
            Find Sibling Services
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={<div className="container section" style={{ textAlign: 'center' }}>Loading...</div>}>
      <PaymentCancelContent />
    </Suspense>
  );
}
