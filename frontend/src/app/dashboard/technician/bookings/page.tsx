'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAppContext } from '@/context/AppContext';
import { Calendar, User, Check, X, ShieldAlert, Play, CheckCircle2, ChevronLeft } from 'lucide-react';

export default function TechnicianBookings() {
  const { token, addToast } = useAppContext();
  
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadBookings() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.get('/technician/bookings', { token });
      if (res.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      addToast('Failed to load incoming requests.', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, [token]);

  const handleUpdateStatus = async (bookingId: number, nextStatus: string) => {
    let actionName = nextStatus.toLowerCase();
    if (nextStatus === 'IN_PROGRESS') actionName = 'start';
    if (nextStatus === 'COMPLETED') actionName = 'complete';

    if (!confirm(`Are you sure you want to ${actionName} this job booking?`)) return;

    try {
      const res = await api.patch(`/technician/bookings/${bookingId}`, { status: nextStatus }, { token });
      if (res.success) {
        addToast(`Booking successfully updated to ${nextStatus}.`, 'success');
        loadBookings(); // refresh list
      }
    } catch (err: any) {
      console.error('Error updating status:', err);
      addToast(err.message || 'Failed to update booking status.', 'error');
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

  return (
    <div className="section">
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
          <Link href="/dashboard/technician" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ChevronLeft size={14} />
            Back to Dashboard
          </Link>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Manage Booking Requests</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Review client booking inquiries, execute started paid jobs, and confirm job completion.</p>
        </div>

        {loading ? (
          <div className="table-container skeleton" style={{ height: '300px' }} />
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px', backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)' }}>
            <Calendar size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 700 }}>No requests found</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>You do not have any active or past booking requests from customers.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Job ID</th>
                  <th>Customer</th>
                  <th>Service Type</th>
                  <th>Scheduled Time</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>#B-{b.id}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{b.customer.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{b.customer.email}</div>
                    </td>
                    <td style={{ fontWeight: 700 }}>{b.service.name}</td>
                    <td>{new Date(b.scheduledAt).toLocaleString()}</td>
                    <td style={{ fontWeight: 700 }}>${b.service.price}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {/* If status is REQUESTED: show Accept & Decline buttons */}
                        {b.status === 'REQUESTED' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(b.id, 'ACCEPTED')}
                              className="btn btn-primary btn-sm"
                              style={{ padding: '6px 12px', background: 'var(--primary)', color: 'white' }}
                              title="Accept job request"
                            >
                              <Check size={14} style={{ marginRight: '2px' }} />
                              Accept
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(b.id, 'DECLINED')}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '6px 12px', color: 'var(--status-declined)' }}
                              title="Decline job request"
                            >
                              <X size={14} style={{ marginRight: '2px' }} />
                              Decline
                            </button>
                          </>
                        )}

                        {/* If status is ACCEPTED: show wait message */}
                        {b.status === 'ACCEPTED' && (
                          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
                            Waiting for customer payment
                          </span>
                        )}

                        {/* If status is PAID: show Start Job button */}
                        {b.status === 'PAID' && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'IN_PROGRESS')}
                            className="btn btn-accent btn-sm"
                            style={{ padding: '6px 12px', background: 'var(--primary)', color: 'white' }}
                          >
                            <Play size={12} style={{ marginRight: '4px' }} />
                            Start Job
                          </button>
                        )}

                        {/* If status is IN_PROGRESS: show Complete Job button */}
                        {b.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'COMPLETED')}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '6px 12px', background: 'var(--status-inprogress)', color: 'white' }}
                          >
                            <CheckCircle2 size={12} style={{ marginRight: '4px' }} />
                            Complete Job
                          </button>
                        )}

                        {/* Terminated status display messages */}
                        {b.status === 'COMPLETED' && (
                          <span style={{ fontSize: '13px', color: 'var(--status-inprogress)', fontWeight: 600 }}>
                            Completed & Paid
                          </span>
                        )}

                        {b.status === 'DECLINED' && (
                          <span style={{ fontSize: '13px', color: 'var(--status-declined)', fontWeight: 600 }}>
                            Declined
                          </span>
                        )}

                        {b.status === 'CANCELLED' && (
                          <span style={{ fontSize: '13px', color: 'var(--status-cancelled)', fontWeight: 600 }}>
                            Cancelled
                          </span>
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
    </div>
  );
}
