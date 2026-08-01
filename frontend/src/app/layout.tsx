import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToastContainer from '@/components/ToastContainer';

export const metadata: Metadata = {
  title: 'FixItNow | Modern Home Services Marketplace',
  description: 'Book qualified local technicians for plumbing, electrical, cleaning, painting and other home services.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <Header />
          <main style={{ flex: 1, minHeight: 'calc(100vh - var(--nav-height) - 130px)' }}>
            {children}
          </main>
          <Footer />
          <ToastContainer />
        </AppProvider>
      </body>
    </html>
  );
}
