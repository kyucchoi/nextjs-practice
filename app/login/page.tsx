'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { toast } from 'sonner';
import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

/* useSearchParams 사용으로 Suspense 필요 */
function LoginContent() {
  const searchParams = useSearchParams();

  // 로그인 실패 시 에러 메시지 표시
  useEffect(() => {
    const error = searchParams.get('error');

    // 백엔드에서 ?error=kakao_failed로 리다이렉트 시 에러 표시
    if (error === 'kakao_failed') {
      toast('카카오 로그인에 실패했습니다.', {
        description: '다시 시도해주세요.',
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
    }
  }, [searchParams]);

  /* 환경변수 체크 후 백엔드 카카오 OAuth 엔드포인트로 이동 */
  const handleLogin = () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    // 환경변수 미설정 시 에러 표시
    if (!API_URL) {
      console.error('NEXT_PUBLIC_API_URL is not set');
      toast('로그인 서버 주소가 설정되지 않았습니다.', {
        description: '관리자에게 문의하세요.',
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
      return;
    }

    // 백엔드 카카오 OAuth 엔드포인트로 리다이렉트
    window.location.href = `${API_URL}/api/auth/kakao`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {/* 로고 및 타이틀 */}
      <div className="text-center">
        <Image
          src="/icon.png"
          alt="MyWidZ Logo"
          width={100}
          height={100}
          className="mx-auto mb-4 rounded-3xl drop-shadow-lg hover:scale-105 transition-transform duration-300"
          priority
        />
        <h1 className="text-4xl font-bold mb-4">MyWidZ</h1>
        <p className="text-l text-gray-600 font-medium">내가 원하는 위젯을</p>
        <p className="text-l text-gray-600 font-medium mb-8">추가해보세요!</p>
      </div>

      {/* 카카오 로그인 버튼 */}
      <Button
        className="w-full max-w-xs kakao-login h-12 flex items-center justify-center gap-3"
        onClick={handleLogin}
      >
        <i className="fa-brands fa-kakao-talk text-xl"></i>
        <span>카카오톡 로그인</span>
      </Button>
    </div>
  );
}

/* Suspense로 LoginContent를 감싸서 useSearchParams SSR 에러 방지 */
export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
