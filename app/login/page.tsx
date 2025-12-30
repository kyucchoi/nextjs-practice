'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { toast } from 'sonner';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

function LoginContent() {
  const searchParams = useSearchParams();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  useEffect(() => {
    const error = searchParams.get('error');

    if (error === 'kakao_failed') {
      toast('카카오 로그인에 실패했습니다.', {
        description: '다시 시도해주세요.',
        icon: (
          <i
            className="fa-solid fa-xmark"
            style={{ color: 'var(--css-red)', fontSize: '20px' }}
          ></i>
        ),
        style: {
          background: 'var(--css-white)',
          color: 'var(--css-black)',
          border: '1px solid var(--css-red)',
        },
      });
    }
  }, [searchParams]);

  const handleLogin = () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    if (!API_URL) {
      console.error('NEXT_PUBLIC_API_URL is not set');
      toast('로그인 서버 주소가 설정되지 않았습니다.', {
        description: '관리자에게 문의하세요.',
        icon: (
          <i
            className="fa-solid fa-xmark"
            style={{ color: 'var(--css-red)', fontSize: '20px' }}
          ></i>
        ),
        style: {
          background: 'var(--css-white)',
          color: 'var(--css-black)',
          border: '1px solid var(--css-red)',
        },
      });
      return;
    }

    window.location.href = `${API_URL}/api/auth/kakao`;
  };

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      toast('앱이 설치되었습니다!', {
        icon: (
          <i
            className="fa-solid fa-check"
            style={{ color: 'var(--css-green)', fontSize: '20px' }}
          ></i>
        ),
        style: {
          background: 'var(--css-white)',
          color: 'var(--css-black)',
          border: '1px solid var(--css-green)',
        },
      });
    }

    setDeferredPrompt(null);
    setShowInstallButton(false);
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
        className="w-full max-w-xs kakao-login h-12 flex items-center justify-center gap-3 mb-3"
        onClick={handleLogin}
      >
        <i className="fa-brands fa-kakao-talk text-lg"></i>
        <span>카카오톡 로그인</span>
      </Button>

      {showInstallButton && (
        <Button
          className="w-full max-w-xs pwa-install h-12 flex items-center justify-center gap-3"
          onClick={handleInstallPWA}
        >
          <i className="fa-solid fa-download text-lg"></i>
          <span>앱처럼 사용해 보세요</span>
        </Button>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
