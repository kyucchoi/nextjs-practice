'use client';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
            style={{ color: 'var(--css-green)', fontSize: '20px' }}
          ></i>
        ),
        style: {
          background: 'var(--css-white)',
          color: 'var(--css-black)',
          border: '1px solid var(--css-green)',
        },
      });

      router.push('/login');
    } catch (error) {
      console.error('Failed to clear auth cookie:', error);
      toast('로그아웃 처리 중 오류가 발생했습니다.', {
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
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <i className="fa-solid fa-arrow-right-from-bracket text-xl"></i>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>로그아웃</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
