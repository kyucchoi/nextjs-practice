'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function Logout() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const { clearAuthCookie } = await import('@/app/auth/actions');
      await clearAuthCookie();

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
    } catch (error) {
      console.error('Failed to clear auth cookie:', error);
      toast('로그아웃 처리 중 오류가 발생했습니다.', {
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
  };

  return (
    <header className="flex justify-end pt-5">
      <Button variant="outline" onClick={handleLogout}>
        <i className="fa-solid fa-arrow-right-from-bracket"></i> 로그아웃
      </Button>
    </header>
  );
}
