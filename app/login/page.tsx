'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function LoginPage() {
  const handleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/kakao`;
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="text-center pt-60">
        {/* 로고 아이콘 */}
        <Image
          src="/icon.png"
          alt="MyWidZ Logo"
          width={100}
          height={100}
          className="mx-auto mb-4 rounded-3xl drop-shadow-lg hover:scale-105 transition-transform duration-300"
          priority
        />

        {/* 타이틀 */}
        <h1 className="text-5xl font-bold mb-4">MyWidZ</h1>

        {/* 설명 */}
        <p className="text-xl text-gray-600 font-medium">내가 원하는 위젯을</p>
        <p className="text-xl text-gray-600 font-medium mb-8">추가해보세요!</p>
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
