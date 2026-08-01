import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Extract token and role from cookies
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('user_role')?.value; // 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN'

  // Define route check groups
  const isAuthRoute = path.startsWith('/auth/login') || path.startsWith('/auth/register');
  const isDashboardRoute = path.startsWith('/dashboard');

  if (isAuthRoute) {
    // If logged in, redirect to respective dashboard
    if (token && role) {
      if (role === 'CUSTOMER') {
        return NextResponse.redirect(new URL('/dashboard/customer', request.url));
      } else if (role === 'TECHNICIAN') {
        return NextResponse.redirect(new URL('/dashboard/technician', request.url));
      } else if (role === 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard/admin', request.url));
      }
    }
    return NextResponse.next();
  }

  if (isDashboardRoute) {
    // Guard against unauthenticated users
    if (!token || !role) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(loginUrl);
    }

    // Role-specific guards
    if (path.startsWith('/dashboard/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    if (path.startsWith('/dashboard/technician') && role !== 'TECHNICIAN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    if (path.startsWith('/dashboard/customer') && role !== 'CUSTOMER') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

// Config to specify which paths the middleware matches
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/login',
    '/auth/register',
  ],
};
