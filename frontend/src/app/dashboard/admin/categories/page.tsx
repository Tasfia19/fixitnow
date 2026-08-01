'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAppContext } from '@/context/AppContext';
import { Tag, Plus, ChevronLeft, ShieldAlert } from 'lucide-react';

export default function AdminCategories() {
  const { token, addToast } = useAppContext();

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function loadCategories() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.get('/admin/categories', { token });
      if (res.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      addToast('Failed to load service categories.', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setSubmitting(true);
    try {
      const res = await api.post('/admin/categories', { name, description }, { token });
      if (res.success) {
        addToast('Service category created successfully!', 'success');
        setName('');
        setDescription('');
        loadCategories(); // reload list
      }
    } catch (err: any) {
      console.error('Error creating category:', err);
      addToast(err.message || 'Failed to create category.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="section">
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
          <Link href="/dashboard/admin" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ChevronLeft size={14} />
            Back to Dashboard
          </Link>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Manage Service Categories</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Add, browse, and organize system-wide service categories for the platform marketplace.</p>
        </div>

        <div className="grid-2" style={{ gridTemplateColumns: '360px 1fr' }}>
          {/* Create Category Form */}
          <aside className="form-card" style={{ maxWidth: '100%', height: 'fit-content' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} />
              Add New Category
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="name">Category Name</label>
                <input
                  type="text"
                  id="name"
                  placeholder="e.g. Gardening, Pest Control"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" htmlFor="description">Description</label>
                <textarea
                  id="description"
                  placeholder="Summarize the types of tasks in this category..."
                  className="form-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ minHeight: '80px' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Category'}
              </button>
            </form>
          </aside>

          {/* Categories list */}
          <main>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Existing Service Categories</h3>
            {loading ? (
              <div className="card skeleton" style={{ height: '200px' }} />
            ) : categories.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No service categories registered.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {categories.map(cat => (
                  <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)' }}>
                    <div>
                      <h4 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Tag size={14} style={{ color: 'var(--primary)' }} />
                        {cat.name}
                      </h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {cat.description || 'No description provided.'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <span className="badge badge-accepted" style={{ fontSize: '11px', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700 }}>
                        {cat._count?.services || 0} services
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
