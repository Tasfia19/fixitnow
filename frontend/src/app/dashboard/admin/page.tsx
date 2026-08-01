'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAppContext } from '@/context/AppContext';
import { Users, Calendar, DollarSign, Ban, ShieldCheck, Search, Tag, Settings } from 'lucide-react';

export default function AdminDashboard() {
  const { token, addToast } = useAppContext();

  // Data states
  const [users, setUsers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  async function loadAdminData() {
    if (!token) return;
    setLoading(true);
    try {
      const [usersRes, bookingsRes] = await Promise.all([
        api.get('/admin/users', { token }),
        api.get('/admin/bookings', { token })
      ]);

      if (usersRes.success) setUsers(usersRes.data.users);
      if (bookingsRes.success) setBookings(bookingsRes.data.bookings);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      addToast('Failed to load admin dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, [token]);

  const handleToggleBanStatus = async (userId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'BANNED' ? 'ACTIVE' : 'BANNED';
    const actionWord = nextStatus === 'BANNED' ? 'ban' : 'unban';
    
    if (!confirm(`Are you sure you want to ${actionWord} this user account?`)) return;

    try {
      const res = await api.patch(`/admin/users/${userId}`, { status: nextStatus }, { token });
      if (res.success) {
        addToast(`User account has been successfully ${nextStatus.toLowerCase()}ed.`, 'success');
        loadAdminData(); // reload
      }
    } catch (err: any) {
      console.error('Error toggling user ban status:', err);
      addToast(err.message || 'Failed to update user status.', 'error');
    }
  };

  // Telemetry metric calculations
  const totalUsersCount = users.length;
  const activeBookingsCount = bookings.filter(b => 
    b.status === 'REQUESTED' || b.status === 'ACCEPTED' || b.status === 'PAID' || b.status === 'IN_PROGRESS'
  ).length;
  const totalPlatformRevenue = bookings
    .filter(b => b.status === 'PAID' || b.status === 'IN_PROGRESS' || b.status === 'COMPLETED')
    .reduce((sum, b) => sum + b.service.price, 0);

  // Search filtering
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="section">
      <div className="container">
        {/* Header Title & Nav actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Admin Platform Control</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Global platform health, user account control, and services categories moderation.</p>
          </div>
          <Link href="/dashboard/admin/categories" className="btn btn-primary">
            <Tag size={16} />
            Manage Categories
          </Link>
        </div>

        {/* Global Overview Cards */}
        <div className="stat-grid">
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
              <Users size={24} style={{ color: 'var(--primary)' }} />
            </div>
            <div className="stat-num">{totalUsersCount}</div>
            <div className="stat-label">Total Users</div>
          </div>
          
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
              <Calendar size={24} style={{ color: 'var(--primary)' }} />
            </div>
            <div className="stat-num">{activeBookingsCount}</div>
            <div className="stat-label">Active Bookings</div>
          </div>

          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
              <DollarSign size={24} style={{ color: 'var(--status-inprogress)' }} />
            </div>
            <div className="stat-num" style={{ color: 'var(--status-inprogress)' }}>${totalPlatformRevenue}</div>
            <div className="stat-label">Platform Volume</div>
          </div>
        </div>

        {/* User Account Controls */}
        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700 }}>User Accounts Management</h2>
            
            {/* Search Input */}
            <div style={{ position: 'relative', width: '320px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search accounts by name, email..."
                className="form-input"
                style={{ paddingLeft: '36px', fontSize: '14px' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="table-container skeleton" style={{ height: '300px' }} />
          ) : filteredUsers.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No matching user accounts found.</p>
          ) : (
            <div className="table-container" style={{ margin: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontFamily: 'monospace' }}>#U-{u.id}</td>
                      <td style={{ fontWeight: 700 }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span style={{ fontSize: '11px', background: 'var(--input-bg)', border: '1px solid var(--surface-border)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                          {u.role}
                        </span>
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${u.status === 'BANNED' ? 'badge-declined' : 'badge-completed'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleToggleBanStatus(u.id, u.status)}
                            className={`btn btn-sm ${u.status === 'BANNED' ? 'btn-secondary' : 'btn-danger'}`}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            {u.status === 'BANNED' ? (
                              <>
                                <ShieldCheck size={12} />
                                Unban
                              </>
                            ) : (
                              <>
                                <Ban size={12} />
                                Ban
                              </>
                            )}
                          </button>
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
    </div>
  );
}
