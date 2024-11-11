import { NextResponse } from 'next/server';

export async function middleware(request) {
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
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
