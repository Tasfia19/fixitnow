'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAppContext } from '@/context/AppContext';
import { Calendar, CreditCard, Star, Clock, Trash2, XCircle, AlertTriangle } from 'lucide-react';

export default function CustomerDashboard() {
  const router = useRouter();
  const { token, user, addToast } = useAppContext();

  const [bookings, setBookings] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bookings' | 'payments'>('bookings');

  // Modal Review States
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewBookingId, setReviewBookingId] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  async function loadDashboardData() {
    if (!token) return;
    setLoading(true);
    try {
      const [bookingsRes, paymentsRes] = await Promise.all([
        api.get('/bookings', { token }),
        api.get('/payments', { token })
      ]);

      if (bookingsRes.success) setBookings(bookingsRes.data.bookings);
      if (paymentsRes.success) setPayments(paymentsRes.data.payments);
    } catch (err) {
      console.error('Error fetching customer dashboard data:', err);
      addToast('Failed to load dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, [token]);

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm('Are you sure you want to cancel this booking request?')) return;

    try {
      const res = await api.patch(`/bookings/${bookingId}/cancel`, {}, { token });
      if (res.success) {
        addToast('Booking cancelled successfully.', 'success');
        // Refresh
        loadDashboardData();
      }
    } catch (err: any) {
      console.error('Error cancelling booking:', err);
      addToast(err.message || 'Failed to cancel booking.', 'error');
    }
  };

  const handlePayNow = async (bookingId: number) => {
    addToast('Initiating checkout session...', 'info');
    try {
      const res = await api.post('/payments/create', { bookingId }, { token });
      if (res.success && res.data?.sessionUrl) {
        // Redirect to Stripe checkout or Sandbox mock checkout URL
        const redirectUrl = res.data.sessionUrl;
        
        // If the URL points to example.com (which means Stripe key was missing),
        // we redirect locally to our own payment-sandbox frontend route!
        if (redirectUrl.includes('example.com/payment-sandbox')) {
          const urlParams = new URL(redirectUrl).search;
          router.push(`/payment-sandbox${urlParams}`);
        } else {
          // Redirect to live Stripe checkout
          window.location.href = redirectUrl;
        }
      }
    } catch (err: any) {
      console.error('Checkout failed:', err);
      addToast(err.message || 'Failed to initiate payment.', 'error');
    }
  };

  const openReviewModal = (bookingId: number) => {
    setReviewBookingId(bookingId);
    setRating(5);
    setComment('');
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBookingId) return;

    setSubmittingReview(true);
    try {
      const res = await api.post('/reviews', {
        bookingId: reviewBookingId,
        rating,
        comment
      }, { token });

      if (res.success) {
        addToast('Review submitted successfully!', 'success');
        setShowReviewModal(false);
        loadDashboardData();
      }
    } catch (err: any) {
      console.error('Error submitting review:', err);
      addToast(err.message || 'Failed to submit review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'REQUESTED': return 'badge-requested';
      case 'ACCEPTED': return 'badge-accepted';
      case 'DECLINED': return 'badge-declined';
      case 'PAID': return 'badge-paid';
      case 'IN_PROGRESS': return 'badge-inprogress';
      case 'COMPLETED': return 'badge-completed';
      case 'CANCELLED': return 'badge-cancelled';
      default: return '';
    }
  };

  const getPaymentStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'badge-completed';
      case 'PENDING': return 'badge-requested';
      case 'FAILED': return 'badge-declined';
      default: return '';
    }
  };

  const isCancellable = (status: string) => {
    // Before paid or in_progress, i.e. REQUESTED or ACCEPTED
    return status === 'REQUESTED' || status === 'ACCEPTED';
  };

  return (
    <div className="section">
      <div className="container">
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Welcome, {user?.name || 'Customer'}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track your booking schedule and process service payments.</p>
        </div>

        <div className="dashboard-layout">
          {/* Sidebar Tabs */}
          <aside className="dashboard-nav">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`dashboard-nav-item btn ${activeTab === 'bookings' ? 'active' : ''}`}
              style={{ width: '100%', justifyContent: 'flex-start', background: 'none', border: 'none', textAlign: 'left' }}
            >
              <Calendar size={18} />
              Bookings
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`dashboard-nav-item btn ${activeTab === 'payments' ? 'active' : ''}`}
              style={{ width: '100%', justifyContent: 'flex-start', background: 'none', border: 'none', textAlign: 'left' }}
            >
              <CreditCard size={18} />
              Payments History
            </button>
          </aside>

          {/* Main Content Area */}
          <main>
            {loading ? (
              <div className="table-container skeleton" style={{ height: '300px' }} />
            ) : activeTab === 'bookings' ? (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>My Service Bookings</h2>
                {bookings.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px', backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)' }}>
                    <p style={{ color: 'var(--text-muted)' }}>You haven't made any bookings yet.</p>
                    <Link href="/services" className="btn btn-primary btn-sm" style={{ marginTop: '16px' }}>Find Services</Link>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Service</th>
                          <th>Technician</th>
                          <th>Scheduled Time</th>
                          <th>Price</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map(b => (
                          <tr key={b.id}>
                            <td style={{ fontWeight: 700 }}>{b.service.name}</td>
                            <td>{b.technician.user.name}</td>
                            <td>{new Date(b.scheduledAt).toLocaleString()}</td>
                            <td style={{ fontWeight: 700 }}>${b.service.price}</td>
                            <td>
                              <span className={`badge ${getStatusBadgeClass(b.status)}`}>
                                {b.status}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                {b.status === 'ACCEPTED' && (
                                  <button
                                    onClick={() => handlePayNow(b.id)}
                                    className="btn btn-accent btn-sm"
                                  >
                                    Pay Now
                                  </button>
                                )}

                                {b.status === 'COMPLETED' && !b.review && (
                                  <button
                                    onClick={() => openReviewModal(b.id)}
                                    className="btn btn-primary btn-sm"
                                  >
                                    Leave Review
                                  </button>
                                )}
                                
                                {b.status === 'COMPLETED' && b.review && (
                                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Reviewed</span>
                                )}

                                {isCancellable(b.status) && (
                                  <button
                                    onClick={() => handleCancelBooking(b.id)}
                                    className="btn btn-secondary btn-sm text-danger"
                                    style={{ color: 'var(--status-declined)' }}
                                    title="Cancel booking"
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>My Payment Records</h2>
                {payments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px', backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)' }}>
                    <p style={{ color: 'var(--text-muted)' }}>No payment transactions recorded.</p>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Transaction ID</th>
                          <th>Service</th>
                          <th>Amount</th>
                          <th>Gateway</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map(p => (
                          <tr key={p.id}>
                            <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{p.transactionId}</td>
                            <td>{p.booking.service.name}</td>
                            <td style={{ fontWeight: 700 }}>${p.amount}</td>
                            <td>{p.provider}</td>
                            <td>
                              <span className={`badge ${getPaymentStatusBadgeClass(p.status)}`}>
                                {p.status}
                              </span>
                            </td>
                            <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Review Dialog Overlay Modal */}
      {showReviewModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowReviewModal(false)}>&times;</button>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Leave Technician Review</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Your feedback helps keep the marketplace community safe and high-quality.
            </p>

            <form onSubmit={handleReviewSubmit}>
              {/* Rating stars select */}
              <div className="form-group" style={{ alignItems: 'center', gap: '8px' }}>
                <label className="form-label">Workmanship Rating</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <Star
                        size={28}
                        fill={star <= rating ? '#ffc107' : 'transparent'}
                        style={{ color: '#ffc107' }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Comment */}
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label" htmlFor="comment">Comment</label>
                <textarea
                  id="comment"
                  className="form-textarea"
                  placeholder="Tell us about the technician's speed, friendliness, and quality of work..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '16px' }}
              >
                {submittingReview ? 'Submitting review...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
