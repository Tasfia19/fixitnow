import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p>&copy; {new Date().getFullYear()} FixItNow. All rights reserved.</p>
        <p style={{ fontSize: '12px', marginTop: '8px', color: 'var(--text-muted)' }}>
          Your Trusted Home Services Booking & Scheduling Marketplace.
        </p>
      </div>
    </footer>
  );
}
