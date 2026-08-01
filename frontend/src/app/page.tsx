'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Star, ShieldCheck, Clock, Award, ArrowRight, Sparkles, MapPin, Tag } from 'lucide-react';

export default function Home() {
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, svcRes, techRes] = await Promise.all([
          api.get('/categories'),
          api.get('/services'),
          api.get('/technicians'),
        ]);

        if (catRes.success) setCategories(catRes.data.categories.slice(0, 4));
        if (svcRes.success) setServices(svcRes.data.services.slice(0, 3));
        if (techRes.success) setTechnicians(techRes.data.technicians.slice(0, 3));
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', backgroundColor: 'var(--primary-glow)', borderRadius: 'var(--radius-full)', color: 'var(--primary)', fontWeight: 600, fontSize: '13px', marginBottom: '24px' }}>
            <Sparkles size={14} />
            Professional Home Services On Demand
          </div>
          <h1>
            Your Trusted Home <br />
            Service Marketplace
          </h1>
          <p>
            Connect with certified plumbers, electricians, cleaners, and local technicians instantly. High quality workmanship guaranteed.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <Link href="/services" className="btn btn-primary">
              Browse Services
              <ArrowRight size={16} />
            </Link>
            <Link href="/auth/register" className="btn btn-secondary">
              Join as Technician
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section style={{ borderBottom: '1px solid var(--surface-border)', padding: '40px 0', backgroundColor: 'var(--surface)' }}>
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldCheck size={32} style={{ color: 'var(--primary)' }} />
            <div>
              <h4 style={{ fontWeight: 700 }}>Fully Verified Techs</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Background checked pros</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Clock size={32} style={{ color: 'var(--primary)' }} />
            <div>
              <h4 style={{ fontWeight: 700 }}>Instant Scheduling</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Choose your time slots</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Award size={32} style={{ color: 'var(--primary)' }} />
            <div>
              <h4 style={{ fontWeight: 700 }}>Satisfaction Guaranteed</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Love the work or full refund</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800 }}>Explore Categories</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Find the exact professional help you need today</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {loading
              ? Array(4).fill(0).map((_, i) => (
                  <div key={i} className="card skeleton" style={{ height: '140px' }} />
                ))
              : categories.map(cat => (
                  <Link href={`/services?category=${cat.id}`} key={cat.id} className="card" style={{ textAlign: 'center', textDecoration: 'none' }}>
                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>
                      {cat.name === 'Plumbing' && '🔧'}
                      {cat.name === 'Electrical' && '⚡'}
                      {cat.name === 'Cleaning' && '🧼'}
                      {cat.name === 'Painting' && '🎨'}
                      {!['Plumbing', 'Electrical', 'Cleaning', 'Painting'].includes(cat.name) && '🏠'}
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{cat.name}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>{cat.description || 'Professional home service care'}</p>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="section" style={{ backgroundColor: 'var(--surface)', borderTop: '1px solid var(--surface-border)', borderBottom: '1px solid var(--surface-border)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
            <div>
              <h2 style={{ fontSize: '32px', fontWeight: 800 }}>Featured Services</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Highly-rated fixed-price tasks completed by certified pros</p>
            </div>
            <Link href="/services" className="btn btn-outline">View All Services</Link>
          </div>

          <div className="grid-3">
            {loading
              ? Array(3).fill(0).map((_, i) => (
                  <div key={i} className="card skeleton" style={{ height: '320px' }} />
                ))
              : services.map(svc => (
                  <div key={svc.id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <span className="badge badge-accepted" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                        <Tag size={12} style={{ marginRight: '4px' }} />
                        {svc.category.name}
                      </span>
                      <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)' }}>
                        ${svc.price}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>{svc.name}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', flex: 1, marginBottom: '20px' }}>
                      {svc.description || 'Premium standard task service package.'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--surface-border)', paddingTop: '16px' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600 }}>{svc.technicianProfile.user.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                          <Star size={12} fill="#ffc107" style={{ color: '#ffc107' }} />
                          {svc.technicianProfile.rating.toFixed(1)} rating
                        </div>
                      </div>
                      <Link href={`/technicians/${svc.technicianProfile.id}`} className="btn btn-primary btn-sm">
                        Book Now
                      </Link>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* Top Technicians Section */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800 }}>Top Rated Technicians</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Work with elite home service providers in your neighborhood</p>
          </div>

          <div className="grid-3">
            {loading
              ? Array(3).fill(0).map((_, i) => (
                  <div key={i} className="card skeleton" style={{ height: '320px' }} />
                ))
              : technicians.map(tech => (
                  <div key={tech.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
                        {tech.user.name.charAt(0)}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{tech.user.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                          <MapPin size={12} />
                          {tech.location}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                      {tech.skills.map((skill: string, index: number) => (
                        <span key={index} style={{ fontSize: '11px', background: 'var(--input-bg)', border: '1px solid var(--surface-border)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                          {skill}
                        </span>
                      ))}
                    </div>

                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', flex: 1, marginBottom: '20px', fontStyle: tech.bio ? 'normal' : 'italic' }}>
                      {tech.bio || "No bio registered yet."}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--surface-border)', paddingTop: '16px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Price rate</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>${tech.pricePerHour}/hr</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 700, color: '#ffc107' }}>
                          <Star size={14} fill="#ffc107" />
                          {tech.rating.toFixed(1)}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{tech.experience} yrs exp</div>
                      </div>
                    </div>
                    
                    <Link href={`/technicians/${tech.id}`} className="btn btn-secondary btn-sm" style={{ marginTop: '16px', width: '100%' }}>
                      View Profile & Schedule
                    </Link>
                  </div>
                ))}
          </div>
        </div>
      </section>
    </div>
  );
}
