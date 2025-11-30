'use client';

import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
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
    <header className="flex justify-end pt-4">
      <Button variant="outline" onClick={handleLogout}>
        <LogOut className="h-4 w-4 mr-2" />
        로그아웃
      </Button>
    </header>
  );
}
