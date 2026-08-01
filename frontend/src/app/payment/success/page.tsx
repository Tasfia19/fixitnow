'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAppContext } from '@/context/AppContext';
import { CheckCircle2, ArrowRight, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const { token, addToast } = useAppContext();
  
  const bookingId = searchParams.get('booking_id');
  const sessionId = searchParams.get('session_id');
  const txnId = searchParams.get('txn_id') || `txn_stripe_${Date.now()}`;

  const [verifying, setVerifying] = useState(!!sessionId);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId || !bookingId || !token) {
      if (sessionId && !token) {
        setError('Authentication required to verify payment. Please log in.');
        setVerifying(false);
      }
      return;
    }

    async function confirmStripePayment() {
      try {
        const res = await api.post('/payments/confirm', {
          sessionId,
          bookingId: Number(bookingId)
        }, { token });

        if (res.success) {
          addToast('Payment verified successfully!', 'success');
        } else {
          setError(res.message || 'Payment verification failed.');
        }
      } catch (err: any) {
        console.error('Stripe verification failed:', err);
        setError(err.message || 'Error occurred during payment verification.');
      } finally {
        setVerifying(false);
      }
    }

    confirmStripePayment();
  }, [sessionId, bookingId, token]);

  if (verifying) {
    return (
      <div className="section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - var(--nav-height) - 130px)' }}>
        <div className="form-card" style={{ textAlign: 'center', maxWidth: '480px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <Loader2 size={64} className="animate-spin" style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Verifying Payment...</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
            We are confirming your Stripe Checkout transaction. Please do not close or reload this page.
          </p>
          
          <style jsx global>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - var(--nav-height) - 130px)' }}>
        <div className="form-card" style={{ textAlign: 'center', maxWidth: '480px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <AlertCircle size={64} style={{ color: 'var(--status-declined)' }} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Verification Failed</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '24px' }}>
            {error}
          </p>
          <Link href="/dashboard/customer" className="btn btn-primary" style={{ width: '100%' }}>
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - var(--nav-height) - 130px)' }}>
      <div className="form-card" style={{ textAlign: 'center', maxWidth: '480px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <CheckCircle2 size={64} style={{ color: 'var(--status-inprogress)' }} />
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Payment Successful!</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '24px' }}>
          Your service payment transaction has been processed successfully. The technician has been notified and will begin work at the scheduled time.
        </p>

        <div style={{ background: 'var(--input-bg)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-sm)', padding: '16px', textAlign: 'left', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Booking ID:</span>
            <span style={{ fontWeight: 700 }}>#B-{bookingId}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Transaction ID:</span>
            <span style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{sessionId || txnId}</span>
          </div>
        </div>

        <Link href="/dashboard/customer" className="btn btn-primary" style={{ width: '100%' }}>
          Go to Dashboard
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="container section" style={{ textAlign: 'center' }}>Loading payment details...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
