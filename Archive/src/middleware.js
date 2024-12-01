import { NextResponse } from 'next/server';

export function middleware(request) {
  // Only run middleware for dashboard routes
  if (!request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  // Get token from cookie
  const token = request.cookies.get('token');
  const path = request.nextUrl.pathname;

  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*']
};
