'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function Logout() {
  const router = useRouter();

  const handleLogout = () => {
    // JWT 쿠키 삭제 (max-age=0으로 즉시 만료)
    document.cookie = 'jwt=; path=/; max-age=0';

    toast('로그아웃 되었습니다.', {
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

    router.push('/login');
  };

  return (
    <header className="flex justify-end pt-6">
      <Button variant="outline" onClick={handleLogout}>
        <i className="fa-solid fa-arrow-right-from-bracket"></i> 로그아웃
      </Button>
    </header>
  );
}
