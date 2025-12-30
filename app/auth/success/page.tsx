'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

function AuthSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuth = async () => {
      const token = searchParams.get('token');

      if (token) {
        try {
          const { setAuthCookie } = await import('../actions');
          await setAuthCookie(token);

          setTimeout(() => {
            router.push('/');
          }, 2000);
        } catch (error) {
          console.error('Failed to set auth cookie:', error);
          toast('로그인 처리 중 오류가 발생했습니다.', {
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
      } else {
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
    };

    handleAuth();
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-6">
        <i className="fa-solid fa-circle-check text-6xl"></i>

        <div className="text-center">
          <div className="text-xl font-semibold mb-2">로그인 성공!</div>
          <div className="text-gray-600">메인 페이지로 이동 중...</div>
        </div>
      </div>
    </div>
  );
}

export default function AuthSuccess() {
  return (
    <Suspense>
      <AuthSuccessContent />
    </Suspense>
  );
}
