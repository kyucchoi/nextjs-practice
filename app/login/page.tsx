'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    window.location.href =
      'https://port-0-tetz-night-back-m5yo5gmx92cc34bc.sel4.cloudtype.app/api/auth/kakao';
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-3xl font-bold">MyWidZ</div>
        <div className="text-lg text-muted-foreground mt-4">
          내가 원하는 위젯을
        </div>
        <div className="text-lg text-muted-foreground">추가해보세요!</div>
      </div>
      <Button
        className="w-full max-w-xs kakao-login text-black font-medium mt-8"
        size="lg"
        onClick={handleLogin}
      >
        <i className="fa-brands fa-kakao-talk"></i>
        <div>카카오톡 로그인</div>
      </Button>
    </div>
  );
}
