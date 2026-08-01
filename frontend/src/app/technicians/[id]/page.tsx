'use client';

import React, { use, useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAppContext } from '@/context/AppContext';
import { Star, MapPin, Calendar, Clock, Award, ChevronRight, User, CheckCircle2, ShieldAlert } from 'lucide-react';

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  customer: {
    name: string;
  };
}

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  category: {
    name: string;
  };
}

interface Technician {
  id: number;
  bio: string;
  experience: number;
  location: string;
  pricePerHour: number;
  rating: number;
  skills: string[];
  availability: string[];
  user: {
    name: string;
    email: string;
  };
  services: Service[];
  reviews: Review[];
  bookings: any[];
}

function TechnicianProfileContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, role, addToast } = useAppContext();

  // Selected Service from URL if any
  const preselectedServiceId = searchParams.get('service');

  // Profile data
  const [tech, setTech] = useState<Technician | null>(null);
  const [loading, setLoading] = useState(true);

  // Booking Flow States
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.get(`/technicians/${id}`);
        if (res.success && res.data.technician) {
          const profile = res.data.technician;
          setTech(profile);

          // If there is a preselected service, set it
          if (preselectedServiceId && profile.services) {
            const found = profile.services.find((s: Service) => s.id === Number(preselectedServiceId));
            if (found) setSelectedService(found);
          } else if (profile.services && profile.services.length > 0) {
            setSelectedService(profile.services[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching technician profile:', err);
        addToast('Failed to load technician profile.', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [id, preselectedServiceId]);

  // Generate Slots when Date changes based on availability
  useEffect(() => {
    if (!selectedDate || !tech) return;

    const dateObj = new Date(selectedDate);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const selectedDayName = dayNames[dateObj.getDay()];

    // Find availability rule for selected day
    // e.g. "Monday 09:00-17:00"
    const rule = tech.availability.find(a => a.startsWith(selectedDayName));
    
    if (!rule) {
      setAvailableSlots([]);
      setSelectedSlot('');
      return;
    }

    // Parse time range "09:00-17:00"
    const timeRange = rule.split(' ')[1]; // "09:00-17:00"
    const [startStr, endStr] = timeRange.split('-');
    const startHour = parseInt(startStr.split(':')[0], 10);
    const endHour = parseInt(endStr.split(':')[0], 10);

    // Generate hourly slots
    const slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      const formattedHour = hour.toString().padStart(2, '0') + ':00';
      slots.push(formattedHour);
    }
    setAvailableSlots(slots);
    setSelectedSlot('');

    if (token) {
      api.get('/bookings', { token })
        .then(res => {
          if (res.success && res.data?.bookings) {
            const matchBookings = res.data.bookings.filter((b: any) => 
              b.technicianId === tech.id &&
              b.status !== 'CANCELLED' &&
              b.status !== 'DECLINED' &&
              new Date(b.scheduledAt).toDateString() === dateObj.toDateString()
            );
            const hours = matchBookings.map((b: any) => {
              const d = new Date(b.scheduledAt);
              return d.getHours().toString().padStart(2, '0') + ':00';
            });
            setBookedSlots(hours);
          }
        })
        .catch(err => console.warn('Could not load booking schedules:', err));
    }
  }, [selectedDate, tech, token]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      addToast('Please login to book a service.', 'info');
      router.push(`/auth/login?callbackUrl=/technicians/${id}`);
      return;
    }

    if (role !== 'CUSTOMER') {
      addToast('Only customer accounts can book services.', 'error');
      return;
    }

    if (!selectedService) {
      addToast('Please select a service.', 'error');
      return;
    }

    if (!selectedDate || !selectedSlot) {
      addToast('Please select date and time slot.', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const scheduledDateTime = new Date(`${selectedDate}T${selectedSlot}:00`);

      const res = await api.post('/bookings', {
        serviceId: selectedService.id,
        scheduledAt: scheduledDateTime.toISOString(),
      }, { token });

      if (res.success) {
        addToast('Booking request submitted successfully! Wait for technician acceptance.', 'success');
        router.push('/dashboard/customer');
      }
    } catch (err: any) {
      console.error('Booking submission failed:', err);
      addToast(err.message || 'Failed to submit booking request.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container section">
        <div className="card skeleton" style={{ height: '500px' }} />
      </div>
    );
  }

  if (!tech) {
    return (
      <div className="container section" style={{ textAlign: 'center' }}>
        <ShieldAlert size={64} style={{ color: 'var(--status-declined)', marginBottom: '16px' }} />
        <h2>Technician Profile Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>The professional profile you are looking for does not exist.</p>
        <Link href="/services" className="btn btn-primary" style={{ marginTop: '24px' }}>Back to Services</Link>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
          <ChevronRight size={14} />
          <Link href="/services" style={{ color: 'inherit', textDecoration: 'none' }}>Services</Link>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{tech.user.name}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px' }} className="browse-layout">
          <div>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)', padding: '32px', boxShadow: 'var(--shadow-sm)', marginBottom: '32px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold' }}>
                {tech.user.name.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: '28px', fontWeight: 800 }}>{tech.user.name}</h1>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} />
                    {tech.location}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Award size={14} />
                    {tech.experience} Years Experience
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ffc107', fontWeight: 700 }}>
                    <Star size={14} fill="#ffc107" />
                    {tech.rating.toFixed(1)} Rating
                  </span>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
                  {tech.skills.map((skill, index) => (
                    <span key={index} className="badge" style={{ background: 'var(--input-bg)', border: '1px solid var(--surface-border)', color: 'var(--text-secondary)' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)', padding: '32px', boxShadow: 'var(--shadow-sm)', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>About Me</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {tech.bio || `${tech.user.name} is a certified service specialist in ${tech.location} with ${tech.experience} years of expert home restoration experience.`}
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)', padding: '32px', boxShadow: 'var(--shadow-sm)', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Service Offerings</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {tech.services && tech.services.length > 0 ? (
                  tech.services.map(svc => (
                    <div 
                      key={svc.id} 
                      onClick={() => setSelectedService(svc)}
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '16px', 
                        borderRadius: 'var(--radius-sm)', 
                        border: '2px solid',
                        borderColor: selectedService?.id === svc.id ? 'var(--primary)' : 'var(--surface-border)',
                        background: selectedService?.id === svc.id ? 'var(--primary-glow)' : 'var(--surface)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{svc.name}</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>{svc.description}</p>
                        <span className="badge badge-accepted" style={{ fontSize: '10px', marginTop: '8px', padding: '2px 8px' }}>{svc.category.name}</span>
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)' }}>
                        ${svc.price}
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No specific service packages registered yet. You can hire on hourly rate.</p>
                )}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>Past Reviews ({tech.reviews?.length || 0})</h2>
              
              {tech.reviews && tech.reviews.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {tech.reviews.map(rev => (
                    <div key={rev.id} className="review-item">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <User size={14} style={{ color: 'var(--text-muted)' }} />
                          {rev.customer.name}
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                        <div className="rating-stars">
                          {Array(5).fill(0).map((_, i) => (
                            <Star 
                              key={i} 
                              size={12} 
                              fill={i < rev.rating ? '#ffc107' : 'transparent'} 
                              style={{ color: '#ffc107' }} 
                            />
                          ))}
                        </div>
                      </div>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{rev.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No reviews submitted yet for this technician.</p>
              )}
            </div>
          </div>

          <aside>
            <div className="form-card" style={{ position: 'sticky', top: '100px', maxWidth: '100%', padding: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>Book Appointment</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>Select service package and set your time slot.</p>
              
              <form onSubmit={handleBookingSubmit}>
                <div style={{ marginBottom: '16px', background: 'var(--input-bg)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Selected Service Package</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700 }}>
                      {selectedService ? selectedService.name : 'Hourly Service Rate'}
                    </span>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary)' }}>
                      ${selectedService ? selectedService.price : `${tech.pricePerHour}/hr`}
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} />
                    Choose Date
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    required
                    min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // from tomorrow onwards
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>

                {selectedDate && (
                  <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <Clock size={14} />
                      Available Slots
                    </label>
                    
                    {availableSlots.length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                        {availableSlots.map(slot => {
                          const isBooked = bookedSlots.includes(slot);
                          return (
                            <button
                              key={slot}
                              type="button"
                              disabled={isBooked}
                              onClick={() => setSelectedSlot(slot)}
                              className={`slot-btn ${selectedSlot === slot ? 'selected' : ''}`}
                              style={{
                                opacity: isBooked ? 0.4 : 1,
                                cursor: isBooked ? 'not-allowed' : 'pointer',
                                backgroundColor: isBooked ? 'var(--surface-border)' : selectedSlot === slot ? 'var(--primary)' : 'var(--input-bg)',
                                color: isBooked ? 'var(--text-muted)' : selectedSlot === slot ? 'white' : 'var(--text-primary)'
                              }}
                            >
                              {slot} {isBooked && '(Booked)'}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ padding: '12px', border: '1px solid var(--surface-border)', background: 'var(--status-declined-bg)', color: 'var(--status-declined)', borderRadius: 'var(--radius-sm)', fontSize: '13px', textAlign: 'center' }}>
                        No working hours scheduled on this day of the week.
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !!(selectedDate && !selectedSlot)}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '8px' }}
                >
                  {submitting ? 'Submitting request...' : 'Book Technician Now'}
                </button>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function TechnicianProfilePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="container section" style={{ textAlign: 'center' }}>Loading technician profile...</div>}>
      <TechnicianProfileContent params={params} />
    </Suspense>
  );
}
