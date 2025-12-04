'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { toast } from 'sonner';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// BeforeInstallPromptEvent 타입 정의
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

// useSearchParams 사용으로 Suspense 필요
function LoginContent() {
  const searchParams = useSearchParams();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  // PWA 설치 프롬프트 이벤트 캐치
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

  // 로그인 실패 시 에러 메시지 표시
  useEffect(() => {
    const error = searchParams.get('error');

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

  // 카카오 로그인
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

  // PWA 설치 핸들러
  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;

    // 설치 프롬프트 표시
    await deferredPrompt.prompt();

    // 사용자 선택 결과 대기
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      toast('앱이 설치되었습니다!', {
        icon: (
          <i
            className="fa-solid fa-check"
            style={{ color: 'var(--green)', fontSize: '20px' }}
          ></i>
        ),
        style: {
          background: 'var(--white)',
          color: 'var(--black)',
          border: '1px solid var(--green)',
        },
      });
    }

    // 프롬프트는 한 번만 사용 가능
    setDeferredPrompt(null);
    setShowInstallButton(false);
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
        className="w-full max-w-xs kakao-login h-12 flex items-center justify-center gap-3 mb-3"
        onClick={handleLogin}
      >
        <i className="fa-brands fa-kakao-talk text-lg"></i>
        <span>카카오톡 로그인</span>
      </Button>

      {/* PWA 설치 버튼 (설치 가능할 때만 표시) */}
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

// Suspense로 LoginContent를 감싸서 useSearchParams SSR 에러 방지
export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
