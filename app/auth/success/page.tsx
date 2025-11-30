'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthSuccess() {
  const router = useRouter();

  useEffect(() => {
    router.push('/');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-xl font-semibold mb-2">로그인 성공!</div>
        <div className="text-gray-600">메인 페이지로 이동 중...</div>
      </div>
    </div>
  );
}
