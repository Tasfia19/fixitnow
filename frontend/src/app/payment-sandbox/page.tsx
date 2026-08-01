'use client';

import React, { use, useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAppContext } from '@/context/AppContext';
import { ShieldCheck, CreditCard, ChevronRight, Lock, CheckCircle2 } from 'lucide-react';

function PaymentSandboxContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, addToast } = useAppContext();

  // Query Params
  const bookingId = searchParams.get('booking_id');
  const txnId = searchParams.get('txn_id') || `txn_mock_${Date.now()}`;

  // Booking details
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form input states
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('***');
  const [name, setName] = useState('');

  useEffect(() => {
    if (!bookingId || !token) return;

    async function loadBookingDetails() {
      try {
        const res = await api.get(`/bookings/${bookingId}`, { token });
        if (res.success && res.data.booking) {
          setBooking(res.data.booking);
          setName(res.data.booking.customer.name);
        }
      } catch (err) {
        console.error('Error loading booking for payment:', err);
        addToast('Failed to retrieve booking information.', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadBookingDetails();
  }, [bookingId, token]);

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId) return;

    setSubmitting(true);
    addToast('Simulating secure payment transaction...', 'info');

    try {
      // Create mockup session id
      const mockSessionId = `mock_session_${txnId}`;
      const res = await api.post('/payments/confirm', {
        sessionId: mockSessionId,
        bookingId: Number(bookingId)
      }, { token });

      if (res.success) {
        addToast('Payment processed successfully!', 'success');
        router.push(`/payment/success?booking_id=${bookingId}&txn_id=${txnId}`);
      }
    } catch (err: any) {
      console.error('Payment sandbox error:', err);
      addToast(err.message || 'Payment processing failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelPayment = () => {
    router.push(`/payment/cancel?booking_id=${bookingId}`);
  };

  if (loading) {
    return (
      <div className="container section">
        <div className="card skeleton" style={{ height: '400px' }} />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container section" style={{ textAlign: 'center' }}>
        <h2>Invalid Payment Session</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>We could not retrieve the booking associated with this transaction.</p>
        <button onClick={() => router.push('/')} className="btn btn-primary" style={{ marginTop: '24px' }}>Back Home</button>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: '640px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--primary-glow)', color: 'var(--primary)', fontWeight: 600, padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '13px', marginBottom: '12px' }}>
            <ShieldCheck size={14} />
            Sandbox Payment Gateway Sandbox
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Complete Your Payment</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>This is a safe sandbox simulator for booking ID #B-{bookingId}</p>
        </div>

        <div className="grid-2" style={{ gridTemplateColumns: '1fr', gap: '24px' }}>
          {/* Order Details */}
          <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Service Summary</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Service Type:</span>
              <span style={{ fontWeight: 700 }}>{booking.service.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Technician Specialist:</span>
              <span style={{ fontWeight: 600 }}>{booking.technician.user.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--surface-border)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Scheduled Time:</span>
              <span>{new Date(booking.scheduledAt).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '16px' }}>Total Amount Due:</span>
              <span style={{ fontWeight: 800, fontSize: '24px', color: 'var(--primary)' }}>${booking.service.price}</span>
            </div>
          </div>

          {/* Payment Card Form */}
          <div className="form-card" style={{ maxWidth: '100%', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={18} />
              Simulate Card Payment
            </h3>

            <form onSubmit={handleProcessPayment}>
              <div className="form-group">
                <label className="form-label">Cardholder Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Card Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Expiration Date</label>
                  <input
                    type="text"
                    className="form-input"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">CVV / CVC</label>
                  <input
                    type="text"
                    className="form-input"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)', margin: '16px 0 24px 0' }}>
                <Lock size={12} />
                <span>Your checkout experience is simulated securely on this platform.</span>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={submitting}
                >
                  {submitting ? 'Processing mock payment...' : `Authorize Payment $${booking.service.price}`}
                </button>
                <button
                  type="button"
                  onClick={handleCancelPayment}
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSandboxPage() {
  return (
    <Suspense fallback={<div className="container section" style={{ textAlign: 'center' }}>Loading payment session...</div>}>
      <PaymentSandboxContent />
    </Suspense>
  );
}
