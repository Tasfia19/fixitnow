'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Star, MapPin, Tag, Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

function ServicesCatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('category') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [priceMin, setPriceMin] = useState(searchParams.get('priceMin') || '');
  const [priceMax, setPriceMax] = useState(searchParams.get('priceMax') || '');
  const [rating, setRating] = useState(searchParams.get('rating') || '');

  // Data States
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load Categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.get('/categories');
        if (res.success) setCategories(res.data.categories);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    }
    loadCategories();
  }, []);

  // Fetch Services on filter change
  useEffect(() => {
    async function fetchFilteredServices() {
      setLoading(true);
      try {
        const queryParamsObj: any = {};
        if (search) queryParamsObj.search = search;
        if (categoryId) queryParamsObj.categoryId = categoryId;
        if (location) queryParamsObj.location = location;
        if (rating) queryParamsObj.rating = rating;
        if (priceMin) queryParamsObj.priceMin = priceMin;
        if (priceMax) queryParamsObj.priceMax = priceMax;

        const queryString = new URLSearchParams(queryParamsObj).toString();
        const res = await api.get(`/services?${queryString}`);
        if (res.success) {
          setServices(res.data.services);
        }
      } catch (err) {
        console.error('Error fetching services:', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchFilteredServices();
    }, 300); // debounce API requests

    return () => clearTimeout(timer);
  }, [search, categoryId, location, rating, priceMin, priceMax]);

  const handleResetFilters = () => {
    setSearch('');
    setCategoryId('');
    setLocation('');
    setPriceMin('');
    setPriceMax('');
    setRating('');
    router.push('/services');
  };

  return (
    <div className="section">
      <div className="container">
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 800 }}>Explore Home Services</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Find qualified local experts and book upfront priced tasks.</p>
        </div>

        {/* Search Bar Top */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)', padding: '16px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', marginBottom: '24px' }}>
          <div style={{ flex: 1, position: 'relative', minWidth: '260px' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="What service do you need today?"
              className="form-input"
              style={{ paddingLeft: '48px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ width: '220px' }}>
            <input
              type="text"
              placeholder="Search by city/location"
              className="form-input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        <div className="browse-layout">
          {/* Filters Sidebar */}
          <aside className="filter-sidebar">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--surface-border)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 700 }}>
                <SlidersHorizontal size={16} />
                Filters
              </h3>
              <button 
                onClick={handleResetFilters} 
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
              >
                Reset All
              </button>
            </div>

            {/* Category Filter */}
            <div style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ marginBottom: '8px' }}>Category</label>
              <select 
                className="form-select" 
                value={categoryId} 
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ marginBottom: '8px' }}>Price Range ($)</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="number"
                  placeholder="Min"
                  className="form-input"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                />
                <span style={{ color: 'var(--text-muted)' }}>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="form-input"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ marginBottom: '8px' }}>Minimum Rating</label>
              <select
                className="form-select"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              >
                <option value="">Any Rating</option>
                <option value="4.5">4.5★ & up</option>
                <option value="4.0">4.0★ & up</option>
                <option value="3.5">3.5★ & up</option>
                <option value="3.0">3.0★ & up</option>
              </select>
            </div>
          </aside>

          {/* Catalog Services Results */}
          <main>
            {loading ? (
              <div className="grid-2">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="card skeleton" style={{ height: '240px' }} />
                ))}
              </div>
            ) : services.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 32px', backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                <h3 style={{ fontSize: '20px', fontWeight: 700 }}>No services found</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Try resetting or modifying your search query and filters.</p>
              </div>
            ) : (
              <div className="grid-2">
                {services.map(svc => (
                  <div key={svc.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <span className="badge badge-accepted" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                        <Tag size={12} style={{ marginRight: '4px' }} />
                        {svc.category.name}
                      </span>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary)' }}>
                        ${svc.price}
                      </div>
                    </div>

                    <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                      {svc.name}
                    </h3>
                    
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', flex: 1, marginBottom: '20px' }}>
                      {svc.description || 'Premium standard task service package.'}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--surface-border)', paddingTop: '16px', marginTop: 'auto' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {svc.technicianProfile.user.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#ffc107', fontWeight: 600 }}>
                            <Star size={12} fill="#ffc107" />
                            {svc.technicianProfile.rating.toFixed(1)}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <MapPin size={12} />
                            {svc.technicianProfile.location}
                          </span>
                        </div>
                      </div>

                      <Link href={`/technicians/${svc.technicianProfile.id}?service=${svc.id}`} className="btn btn-primary btn-sm">
                        Book Now
                      </Link>
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

export default function ServicesCatalog() {
  return (
    <Suspense fallback={<div className="container section" style={{ textAlign: 'center' }}>Loading services...</div>}>
      <ServicesCatalogContent />
    </Suspense>
  );
}
