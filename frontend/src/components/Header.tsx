'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { Wrench, Sun, Moon, LogOut, LayoutDashboard, User } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const { user, logout, theme, toggleTheme } = useAppContext();

  const getDashboardLink = () => {
    if (!user) return '/auth/login';
    if (user.role === 'ADMIN') return '/dashboard/admin';
    if (user.role === 'TECHNICIAN') return '/dashboard/technician';
    return '/dashboard/customer';
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="header">
      <div className="container header-container">
        <Link href="/" className="logo">
          <Wrench size={24} className="primary-color" style={{ color: 'var(--primary)' }} />
          <span>FixItNow</span>
        </Link>

        <nav className="nav-links">
          <Link href="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Home
          </Link>
          <Link href="/services" className={`nav-link ${isActive('/services') ? 'active' : ''}`}>
            Find Services
          </Link>
          
          <button 
            onClick={toggleTheme} 
            className="btn btn-secondary btn-sm" 
            style={{ borderRadius: 'var(--radius-full)', padding: '8px' }}
            title="Toggle theme"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {user ? (
            <>
              <Link 
                href={getDashboardLink()} 
                className={`btn btn-secondary btn-sm ${pathname.startsWith('/dashboard') ? 'active' : ''}`}
              >
                <LayoutDashboard size={14} />
                Dashboard
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="nav-link" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} />
                  {user.name} 
                  <span style={{ fontSize: '10px', opacity: 0.6, background: 'var(--surface-border)', padding: '2px 6px', borderRadius: '4px' }}>
                    {user.role}
                  </span>
                </span>
                <button onClick={logout} className="btn btn-outline btn-sm" title="Log Out">
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="nav-link">
                Login
              </Link>
              <Link href="/auth/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
