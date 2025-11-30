'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { toast } from 'sonner';

export default function LoginPage() {
  const handleLogin = () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

    window.location.href = `${API_URL}/api/auth/kakao`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
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
