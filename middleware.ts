import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;

    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(payload));

    if (!decoded.exp) return false;

    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  } catch {
    return true;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('jwt')?.value;

  const { pathname } = request.nextUrl;

  if (pathname === '/login') {
    if (token && !isTokenExpired(token)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/auth')) {
    return NextResponse.next();
  }

  if (!token || isTokenExpired(token)) {
    const response = NextResponse.redirect(new URL('/login', request.url));

    if (token) {
      response.cookies.delete('jwt');
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icon.*|manifest.json|.*\\.png$|.*\\.svg$).*)',
  ],
};
