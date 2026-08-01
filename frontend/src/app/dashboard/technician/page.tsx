'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAppContext } from '@/context/AppContext';
import { User, Calendar, Plus, Trash, Tag, ShieldCheck, DollarSign, ListCollapse, Clock } from 'lucide-react';

export default function TechnicianDashboard() {
  const { token, user, refreshUser, addToast } = useAppContext();

  // Local state for profile setup form
  const [skillsStr, setSkillsStr] = useState('');
  const [experience, setExperience] = useState(0);
  const [bio, setBio] = useState('');
  const [pricePerHour, setPricePerHour] = useState(0);
  const [location, setLocation] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Local state for availability scheduler
  const [availability, setAvailability] = useState<string[]>([]);
  const [newDay, setNewDay] = useState('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [savingAvailability, setSavingAvailability] = useState(false);

  // Services registered by tech state
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [newSvcName, setNewSvcName] = useState('');
  const [newSvcDesc, setNewSvcDesc] = useState('');
  const [newSvcPrice, setNewSvcPrice] = useState(0);
  const [newSvcCategory, setNewSvcCategory] = useState('');
  const [addingService, setAddingService] = useState(false);

  // Bookings list state for stats calculation
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // View state tabs
  const [activeTab, setActiveTab] = useState<'profile' | 'services' | 'scheduler'>('profile');

  // Load data
  async function loadData() {
    if (!token) return;
    setLoading(true);
    try {
      const [svcRes, catRes, bookingsRes] = await Promise.all([
        api.get('/technician/services', { token }),
        api.get('/categories'),
        api.get('/technician/bookings', { token })
      ]);

      if (svcRes.success) setServices(svcRes.data.services);
      if (catRes.success) {
        setCategories(catRes.data.categories);
        if (catRes.data.categories.length > 0) setNewSvcCategory(catRes.data.categories[0].id.toString());
      }
      if (bookingsRes.success) setBookings(bookingsRes.data.bookings);
    } catch (err) {
      console.error('Error fetching technician data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [token]);

  // Sync profile details when user context changes
  useEffect(() => {
    if (user?.technicianProfile) {
      const profile = user.technicianProfile;
      setSkillsStr(profile.skills.join(', '));
      setExperience(profile.experience || 0);
      setBio(profile.bio || '');
      setPricePerHour(profile.pricePerHour || 0);
      setLocation(profile.location || '');
      setAvailability(profile.availability || []);
    }
  }, [user]);

  // Profile Save Action
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      const skillsArray = skillsStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
      
      const res = await api.put('/technician/profile', {
        skills: skillsArray,
        experience: Number(experience),
        bio,
        pricePerHour: Number(pricePerHour),
        location,
      }, { token });

      if (res.success) {
        addToast('Profile updated successfully!', 'success');
        refreshUser();
      }
    } catch (err: any) {
      console.error('Error updating technician profile:', err);
      addToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // Add availability slot locally
  const handleAddAvailability = () => {
    const slotString = `${newDay} ${startTime}-${endTime}`;
    // Check if slot already exists
    if (availability.includes(slotString)) {
      addToast('This slot is already added.', 'error');
      return;
    }
    // Simple validation start time < end time
    if (startTime >= endTime) {
      addToast('Start time must be before end time.', 'error');
      return;
    }
    setAvailability(prev => [...prev, slotString]);
  };

  // Remove slot locally
  const handleRemoveAvailability = (slot: string) => {
    setAvailability(prev => prev.filter(item => item !== slot));
  };

  // Save Availability to backend
  const handleSaveAvailability = async () => {
    if (availability.length === 0) {
      addToast('Please add at least one availability slot.', 'error');
      return;
    }
    setSavingAvailability(true);
    try {
      const res = await api.put('/technician/availability', { availability }, { token });
      if (res.success) {
        addToast('Availability scheduler saved successfully!', 'success');
        refreshUser();
      }
    } catch (err: any) {
      console.error('Error saving availability:', err);
      addToast(err.message || 'Failed to save availability.', 'error');
    } finally {
      setSavingAvailability(false);
    }
  };

  // Register a Service
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSvcName || !newSvcPrice || !newSvcCategory) {
      addToast('Please fill in required fields.', 'error');
      return;
    }
    setAddingService(true);
    try {
      const res = await api.post('/technician/services', {
        name: newSvcName,
        description: newSvcDesc,
        price: Number(newSvcPrice),
        categoryId: Number(newSvcCategory)
      }, { token });

      if (res.success) {
        addToast('Service registered successfully!', 'success');
        // Reset inputs and reload services
        setNewSvcName('');
        setNewSvcDesc('');
        setNewSvcPrice(0);
        loadData();
      }
    } catch (err: any) {
      console.error('Error adding service:', err);
      addToast(err.message || 'Failed to register service.', 'error');
    } finally {
      setAddingService(false);
    }
  };

  // Delete Service
  const handleDeleteService = async (serviceId: number) => {
    if (!confirm('Are you sure you want to delete this service package?')) return;
    try {
      const res = await api.delete(`/technician/services/${serviceId}`, { token });
      if (res.success) {
        addToast('Service package deleted.', 'success');
        loadData();
      }
    } catch (err: any) {
      console.error('Error deleting service:', err);
      addToast(err.message || 'Failed to delete service.', 'error');
    }
  };

  // Dynamic statistics calculations
  const pendingRequestsCount = bookings.filter(b => b.status === 'REQUESTED').length;
  const upcomingJobsCount = bookings.filter(b => b.status === 'PAID' || b.status === 'IN_PROGRESS').length;
  const totalEarnings = bookings
    .filter(b => b.status === 'PAID' || b.status === 'IN_PROGRESS' || b.status === 'COMPLETED')
    .reduce((sum, b) => sum + b.service.price, 0);

  return (
    <div className="section">
      <div className="container">
        {/* Dashboard Title & Stats Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Technician Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Manage your service profile, availability calendars, and bookings.</p>
          </div>
          <Link href="/dashboard/technician/bookings" className="btn btn-primary">
            Manage Incoming Requests ({pendingRequestsCount} pending)
          </Link>
        </div>

        {/* Global Statistics Grid */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-num">{pendingRequestsCount}</div>
            <div className="stat-label">Pending Requests</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{upcomingJobsCount}</div>
            <div className="stat-label">Upcoming Jobs</div>
          </div>
          <div className="stat-card">
            <div className="stat-num" style={{ color: 'var(--status-inprogress)' }}>${totalEarnings}</div>
            <div className="stat-label">Total Earnings</div>
          </div>
        </div>

        <div className="dashboard-layout">
          {/* Sidebar Nav */}
          <aside className="dashboard-nav">
            <button
              onClick={() => setActiveTab('profile')}
              className={`dashboard-nav-item btn ${activeTab === 'profile' ? 'active' : ''}`}
              style={{ width: '100%', justifyContent: 'flex-start', background: 'none', border: 'none' }}
            >
              <User size={18} />
              Setup Profile
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`dashboard-nav-item btn ${activeTab === 'services' ? 'active' : ''}`}
              style={{ width: '100%', justifyContent: 'flex-start', background: 'none', border: 'none' }}
            >
              <Tag size={18} />
              My Services ({services.length})
            </button>
            <button
              onClick={() => setActiveTab('scheduler')}
              className={`dashboard-nav-item btn ${activeTab === 'scheduler' ? 'active' : ''}`}
              style={{ width: '100%', justifyContent: 'flex-start', background: 'none', border: 'none' }}
            >
              <Calendar size={18} />
              Scheduler Calendar
            </button>
          </aside>

          {/* Main Panel Content */}
          <main style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
            
            {/* TAB 1: Profile Manager */}
            {activeTab === 'profile' && (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={20} />
                  Professional Profile Setup
                </h2>
                
                <form onSubmit={handleSaveProfile}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="skills">Skills (separated by commas)</label>
                      <input
                        type="text"
                        id="skills"
                        placeholder="e.g. Leak repair, Pipe replacement, Wiring"
                        className="form-input"
                        value={skillsStr}
                        onChange={(e) => setSkillsStr(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="experience">Years of Experience</label>
                      <input
                        type="number"
                        id="experience"
                        className="form-input"
                        value={experience}
                        onChange={(e) => setExperience(Number(e.target.value))}
                        required
                        min="0"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '10px' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="price">Hourly Rate ($/hr)</label>
                      <input
                        type="number"
                        id="price"
                        className="form-input"
                        value={pricePerHour}
                        onChange={(e) => setPricePerHour(Number(e.target.value))}
                        required
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="location">Service Location City</label>
                      <input
                        type="text"
                        id="location"
                        placeholder="e.g. New York, Dhaka"
                        className="form-input"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '10px', marginBottom: '24px' }}>
                    <label className="form-label" htmlFor="bio">Professional Bio Summary</label>
                    <textarea
                      id="bio"
                      className="form-textarea"
                      placeholder="Brief details about your experience, certifications, and service excellence..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={savingProfile}
                  >
                    {savingProfile ? 'Saving Details...' : 'Save Profile Details'}
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: Services Packages Setup */}
            {activeTab === 'services' && (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Tag size={20} />
                  Manage Service Offerings
                </h2>

                {/* Add Service Package Form */}
                <div style={{ padding: '24px', background: 'var(--input-bg)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-sm)', marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Create Service Offer Package</h3>
                  <form onSubmit={handleAddService}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="form-group">
                        <label className="form-label">Service Package Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Leaky Pipe Fix & Inspect"
                          className="form-input"
                          value={newSvcName}
                          onChange={(e) => setNewSvcName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Price Package ($)</label>
                        <input
                          type="number"
                          className="form-input"
                          value={newSvcPrice}
                          onChange={(e) => setNewSvcPrice(Number(e.target.value))}
                          required
                          min="1"
                        />
                      </div>
                    </div>
                    
                    <div className="form-group" style={{ marginTop: '8px' }}>
                      <label className="form-label">Service Category</label>
                      <select 
                        className="form-select"
                        value={newSvcCategory}
                        onChange={(e) => setNewSvcCategory(e.target.value)}
                        required
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group" style={{ marginTop: '8px', marginBottom: '16px' }}>
                      <label className="form-label">Task Description</label>
                      <textarea
                        placeholder="Detail the scope of work included in this service package..."
                        className="form-textarea"
                        value={newSvcDesc}
                        onChange={(e) => setNewSvcDesc(e.target.value)}
                        style={{ minHeight: '80px' }}
                      />
                    </div>

                    <button type="submit" className="btn btn-accent btn-sm" disabled={addingService}>
                      <Plus size={14} />
                      Register Service Package
                    </button>
                  </form>
                </div>

                {/* Services Packages List */}
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Active Packages</h3>
                {services.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No service packages registered yet. Create one above to let customers book you.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {services.map(svc => (
                      <div key={svc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h4 style={{ fontWeight: 700 }}>{svc.name}</h4>
                            <span className="badge badge-accepted" style={{ fontSize: '10px', padding: '1px 6px' }}>{svc.category.name}</span>
                          </div>
                          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>{svc.description}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ fontWeight: 800, fontSize: '18px', color: 'var(--primary)' }}>${svc.price}</span>
                          <button onClick={() => handleDeleteService(svc.id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--status-declined)', padding: '6px' }} title="Delete service">
                            <Trash size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Working Hours Availability Scheduler */}
            {activeTab === 'scheduler' && (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={20} />
                  Availability Scheduler
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                  Define your weekly working hour blocks. Customers will schedule bookings within these ranges.
                </p>

                {/* Add block form */}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', background: 'var(--input-bg)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-sm)', padding: '16px', marginBottom: '24px', alignItems: 'flex-end' }}>
                  <div className="form-group" style={{ margin: 0, minWidth: '150px' }}>
                    <label className="form-label">Day of Week</label>
                    <select className="form-select" value={newDay} onChange={(e) => setNewDay(e.target.value)}>
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                      <option value="Sunday">Sunday</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0, width: '110px' }}>
                    <label className="form-label">Start Time</label>
                    <input type="time" className="form-input" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                  </div>

                  <div className="form-group" style={{ margin: 0, width: '110px' }}>
                    <label className="form-label">End Time</label>
                    <input type="time" className="form-input" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                  </div>

                  <button type="button" onClick={handleAddAvailability} className="btn btn-accent btn-sm" style={{ height: '45px' }}>
                    <Plus size={14} />
                    Add Time Slot
                  </button>
                </div>

                {/* Current slots list */}
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Current Weekly Working Blocks</h3>
                {availability.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '24px' }}>No working times scheduled yet. Please set your hours so customers can hire you.</p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '32px' }}>
                    {availability.map(slot => (
                      <div key={slot} className="availability-tag">
                        <Clock size={12} />
                        <span>{slot}</span>
                        <button type="button" onClick={() => handleRemoveAvailability(slot)}>&times;</button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleSaveAvailability}
                  className="btn btn-primary"
                  disabled={savingAvailability}
                >
                  {savingAvailability ? 'Saving Schedule...' : 'Save Availability scheduler'}
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
