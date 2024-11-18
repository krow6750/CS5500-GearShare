import { NextResponse } from 'next/server';

export function middleware(request) {
  // Only run middleware for dashboard routes
  if (!request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token');
  const path = request.nextUrl.pathname;
  const isPublicPath = path === '/login' || path === '/register';

  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*']
};
