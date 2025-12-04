'use client';

import Logout from '@/components/Logout';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const DashboardDndKit = dynamic(() => import('@/components/DashboardDndKit'), {
  ssr: false,
  loading: () => (
    <div className="space-y-4 py-5">
      {/* 위젯 추가 버튼 스켈레톤 */}
      <div className="flex justify-end">
        <Skeleton className="h-10 w-32" />
      </div>

      {/* 위젯 스켈레톤 2개 */}
      <Skeleton className="h-60 w-full rounded-lg" />
      <Skeleton className="h-60 w-full rounded-lg" />
    </div>
  ),
});

export default function Home() {
  return (
    <div className="mx-5">
      <Logout />
      <DashboardDndKit />
    </div>
  );
}
