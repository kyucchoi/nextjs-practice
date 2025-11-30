import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 쿠키에서 JWT 토큰 확인
  const token = request.cookies.get('jwt')?.value;

  const { pathname } = request.nextUrl;

  // 로그인 페이지는 항상 접근 가능
  if (pathname === '/login') {
    // 이미 로그인했으면 홈으로 리다이렉트
    if (token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // 인증 콜백 경로 (카카오에서 돌아올 때)
  if (pathname.startsWith('/auth')) {
    return NextResponse.next();
  }

  // 토큰 없으면 로그인 페이지로
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// 모든 경로에 적용 (정적 파일, API 제외)
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icon.*|manifest.json|.*\\.png$|.*\\.svg$).*)',
  ],
};
