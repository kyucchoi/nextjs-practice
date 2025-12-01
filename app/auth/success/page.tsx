'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';

// 백엔드에서 ?token=... 파라미터로 JWT 전달 useSearchParams 사용으로 Suspense 필요
function AuthSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // URL 파라미터에서 JWT 토큰 추출
    const token = searchParams.get('token');

    if (token) {
      // 쿠키에 JWT 토큰 저장
      document.cookie = `jwt=${token}; path=/; max-age=86400; secure; samesite=strict`;

      // 홈으로 이동 (1초 후)
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } else {
      // 토큰 없으면 로그인 실패 처리
      toast('로그인에 실패했습니다.', {
        icon: (
          <i
            className="fa-solid fa-xmark"
            style={{ color: 'var(--red)', fontSize: '20px' }}
          ></i>
        ),
        style: {
          background: 'var(--white)',
          color: 'var(--black)',
          border: '1px solid var(--red)',
        },
      });
      router.push('/login');
    }
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        {/* 로딩 스피너 */}
        <Spinner className="h-12 w-12" />

        {/* 로딩 메시지 */}
        <div className="text-center">
          <div className="text-xl font-semibold mb-2">로그인 성공!</div>
          <div className="text-gray-600">메인 페이지로 이동 중...</div>
        </div>
      </div>
    </div>
  );
}

// Suspense로 AuthSuccessContent를 감싸서 useSearchParams SSR 에러 방지
export default function AuthSuccess() {
  return (
    <Suspense>
      <AuthSuccessContent />
    </Suspense>
  );
}
